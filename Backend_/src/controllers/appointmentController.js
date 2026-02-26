import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;

    if (!doctorId)
      return res.status(400).json({ success: false, message: "Doctor is required" });

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient)
      return res.status(404).json({ success: false, message: "Patient profile not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor)
      return res.status(404).json({ success: false, message: "Doctor not found" });

    const bookingDate = date || new Date().toISOString().split("T")[0];
    const bookingTime =
      time ||
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    const appointmentDate = new Date(`${bookingDate} ${bookingTime}`);

    if (isNaN(appointmentDate.getTime()))
      return res.status(400).json({ success: false, message: "Invalid date/time" });

    if (appointmentDate < new Date())
      return res.status(400).json({ success: false, message: "Cannot book past appointment" });

    // Prevent double booking
    const existing = await Appointment.findOne({ doctorId, appointmentDate });
    if (existing)
      return res.status(400).json({ success: false, message: "Doctor already booked" });

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      appointmentDate: appointmentDate,
      readableDate: bookingDate,
      readableTime: bookingTime,
      consultationFee: doctor.consultationFee, // ✅ store snapshot
      paidAmount: 0,
      paymentStatus: "pending",
      status: "pending",
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully. Awaiting payment.",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PATIENT APPOINTMENTS
const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "specialization hospitalName consultationFee")
      .sort({ appointmentDate: 1 })
      .lean();

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET DOCTOR APPOINTMENTS
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "age gender")
      .sort({ appointmentDate: 1 })
      .lean();

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE STATUS BY DOCTOR
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ["confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: doctor._id });
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.status = status;
    if (status === "cancelled" && cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();
    res.status(200).json({ success: true, message: "Appointment status updated", data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CANCEL BY PATIENT
const cancelAppointmentByPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found" });

    const appointment = await Appointment.findOne({ _id: req.params.id, patientId: patient._id });
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ success: true, message: "Appointment cancelled successfully", data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointmentByPatient,
};