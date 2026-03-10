import Appointment from "../models/appointmentModel.js";

export const createAppointmentService = async (data) => {

  const appointment = await Appointment.create(data);

  return appointment;
};


export const getAppointmentByIdService = async (appointmentId) => {

  const appointment = await Appointment.findById(appointmentId)
    .populate("patientId", "name email")
    .populate("doctorId", "name email");

  return appointment;
};


export const getAppointmentsByPatientService = async (patientId) => {

  const appointments = await Appointment.find({ patientId })
    .populate("doctorId", "name email");

  return appointments;
};


export const getAppointmentsByDoctorService = async (doctorId) => {

  const appointments = await Appointment.find({ doctorId })
    .populate("patientId", "name email");

  return appointments;
};


export const updateAppointmentStatusService = async (appointmentId, status) => {

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { returnDocument: "after" }
  );

  return appointment;
};


export const cancelAppointmentService = async (appointmentId, cancellationData) => {

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      status: "cancelled",
      cancellation: {
        reason: cancellationData.reason,
        cancelledBy: cancellationData.cancelledBy,
        cancelledAt: new Date()
      }
    },
    { new: true }
  );

  return appointment;
};


export const updatePaymentService = async (appointmentId, paidAmount) => {

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (paidAmount <= 0) {
    throw new Error("Paid amount must be greater than 0");
  }

  // Prevent overpayment
  if (appointment.paidAmount + paidAmount > appointment.consultationFee) {
    throw new Error("Payment exceeds consultation fee");
  }

  appointment.paidAmount += paidAmount;

  if (appointment.paidAmount >= appointment.consultationFee) {
    appointment.paymentStatus = "paid";
  } else if (appointment.paidAmount > 0) {
    appointment.paymentStatus = "partial";
  } else {
    appointment.paymentStatus = "pending";
  }

  await appointment.save();

  return appointment;
};


export const deleteAppointmentService = async (appointmentId) => {

  const appointment = await Appointment.findByIdAndDelete(appointmentId);

  return appointment;
};