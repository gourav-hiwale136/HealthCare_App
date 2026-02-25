import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";

// Book Appointment with half-payment and current date/time
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;

    // Get current date/time if not provided
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const bookingDate = date || currentDate;
    const bookingTime = time || currentTime;

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor is required" });
    }

    // Find patient profile
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Prevent double booking
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: bookingDate,
      time: bookingTime,
    });
    if (existingAppointment)
      return res.status(400).json({ error: "Doctor already booked at this time" });

    // Half payment logic
    const halfFee = doctor.consultationFee / 2;

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date: bookingDate,
      time: bookingTime,
      notes,
      status: "confirmed",        // auto-confirm after deposit
      paymentStatus: "partial",   // half paid
      paidAmount: halfFee,
    });

    res.status(201).json({
      message: `Appointment booked successfully. Half fee paid: ${halfFee}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all appointments of logged-in patient
const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "specialization hospitalName consultationFee")
      .sort({ date: 1, time: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all appointments of logged-in doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "age gender")
      .sort({ date: 1, time: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status (doctor only)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    const validStatuses = ["confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
    });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = status;
    if (status === "cancelled" && cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    res.status(200).json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Patient cancels appointment
const cancelAppointmentByPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id,
    });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment (simulate half/full payment)
const updatePaymentStatus = async (req, res) => {
  try {
    const { amount } = req.body;

    const appointment = await Appointment.findById(req.params.id).populate("doctorId", "consultationFee");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.paidAmount += amount;

    if (appointment.paidAmount >= appointment.doctorId.consultationFee) {
      appointment.paymentStatus = "paid";
    } else if (appointment.paidAmount > 0) {
      appointment.paymentStatus = "partial";
    } else {
      appointment.paymentStatus = "pending";
    }

    await appointment.save();

    res.status(200).json({ message: "Payment updated", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointmentByPatient,
  updatePaymentStatus,
};