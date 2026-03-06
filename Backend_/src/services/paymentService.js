import Payment from "../models/paymentModel.js";
import Appointment from "../models/appointmentModel.js";

export const createPaymentService = async (data) => {

  const appointment = await Appointment.findById(data.appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const payment = await Payment.create(data);

  return payment;
};



export const getPaymentByIdService = async (paymentId) => {

  const payment = await Payment.findById(paymentId)
    .populate("patientId", "name email")
    .populate("appointmentId");

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};



export const getPaymentsByPatientService = async (patientId) => {

  const payments = await Payment.find({ patientId })
    .populate("appointmentId");

  return payments;
};



export const updatePaymentStatusService = async (paymentId, status) => {

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  payment.status = status;

  await payment.save();


  // If payment successful → update appointment payment
  if (status === "completed") {

    const appointment = await Appointment.findById(payment.appointmentId);

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    appointment.paidAmount += payment.amount;

    if (appointment.paidAmount >= appointment.consultationFee) {
      appointment.paymentStatus = "paid";
    } else if (appointment.paidAmount > 0) {
      appointment.paymentStatus = "partial";
    }

    await appointment.save();
  }

  return payment;
};



export const deletePaymentService = async (paymentId) => {

  const payment = await Payment.findByIdAndDelete(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};