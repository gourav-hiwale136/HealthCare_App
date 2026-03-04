import Appointment from "../models/appointmentModel.js";

export const bookAppointmentService = async (user, data) => {
  const {
    doctorId,
    appointmentDateTime,
    durationMinutes,
    consultationFee,
    notes,
  } = data;

  return await Appointment.create({
    doctorId,
    patientId: user._id,
    appointmentDateTime,
    durationMinutes,
    consultationFee,
    notes,
  });
};

export const getDoctorAppointmentsService = async (user, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Appointment.countDocuments({ doctorId: user._id });

  const appointments = await Appointment.find({ doctorId: user._id })
    .populate("patientId", "name email phone")
    .sort({ appointmentDateTime: 1 })
    .skip(skip)
    .limit(limit);

  return {
    page,
    totalPages: Math.ceil(total / limit),
    totalRecords: total,
    count: appointments.length,
    appointments,
  };
};

export const getPatientAppointmentsService = async (user, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Appointment.countDocuments({ patientId: user._id });

  const appointments = await Appointment.find({ patientId: user._id })
    .populate("doctorId", "name email specialization")
    .sort({ appointmentDateTime: 1 })
    .skip(skip)
    .limit(limit);

  return {
    page,
    totalPages: Math.ceil(total / limit),
    totalRecords: total,
    count: appointments.length,
    appointments,
  };
};

export const updateAppointmentStatusService = async (id, status) => {
  const allowedStatus = [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no-show",
  ];

  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid status value");
  }

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

export const cancelAppointmentService = async (id, user, reason) => {
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  appointment.status = "cancelled";
  appointment.cancellation = {
    reason,
    cancelledBy: user.role,
    cancelledAt: new Date(),
  };

  await appointment.save();

  return appointment;
};

export const addPaymentService = async (id, amount) => {
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  appointment.paidAmount += amount;

  if (appointment.paidAmount >= appointment.consultationFee) {
    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
  } else if (appointment.paidAmount > 0) {
    appointment.paymentStatus = "partial";
  }

  await appointment.save();

  return appointment;
};