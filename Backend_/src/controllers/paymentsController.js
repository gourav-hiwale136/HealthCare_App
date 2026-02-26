import mongoose from "mongoose";
import Payment from "../models/paymentModel.js";
import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";

const createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { appointmentId, amount, paymentMethod, transactionId } = req.body;

    // Find appointment inside session
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) throw new Error("Appointment not found");

    // Authorization check
    const patient = await Patient.findOne({ userId: req.user._id }).session(session);
    if (!patient || !appointment.patientId.equals(patient._id))
      throw new Error("Unauthorized payment attempt");

    // Prevent double full payment
    if (appointment.paymentStatus === "paid")
      throw new Error("Appointment already fully paid");

    // Prevent overpayment
    if (appointment.paidAmount + amount > appointment.consultationFee)
      throw new Error("Overpayment not allowed");

    // Create payment record
    const payment = await Payment.create(
      [
        {
          appointmentId,
          patientId: appointment.patientId,
          amount,
          paymentMethod,
          transactionId,
          status: "completed",
        },
      ],
      { session }
    );

    // Update appointment summary fields
    appointment.paidAmount += amount;

    if (appointment.paidAmount === appointment.consultationFee) {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
    } else {
      appointment.paymentStatus = "partial";
    }

    await appointment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      payment: payment[0],
      appointment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAppointmentPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      appointmentId: req.params.appointmentId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createPayment, getAppointmentPayments };