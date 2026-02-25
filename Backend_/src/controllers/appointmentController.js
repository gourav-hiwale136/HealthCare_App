// controllers/appointmentController.js
import Appointment from "../models/appointmentModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";

// ---------------------------
// 1️⃣ Book Appointment (Full Payment Mandatory)
// ---------------------------
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes, paidAmount } = req.body;

    if (!doctorId) return res.status(400).json({ error: "Doctor is required" });

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Default date/time
    const now = new Date();
    const bookingDate = date || now.toISOString().split("T")[0];
    const bookingTime = time || now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Convert to exact Date object
    const [hours, minutes] = bookingTime.split(/[: ]/);
    let appointmentDate = new Date(bookingDate);
    let hourNum = parseInt(hours);
    if (bookingTime.includes("PM") && hourNum < 12) hourNum += 12;
    if (bookingTime.includes("AM") && hourNum === 12) hourNum = 0;
    appointmentDate.setHours(hourNum, parseInt(minutes), 0, 0);

    // Prevent double booking
    const existing = await Appointment.findOne({ doctorId, appointmentDate });
    if (existing) return res.status(400).json({ error: "Doctor already booked at this time" });

    // Full payment required
    if (!paidAmount || paidAmount < doctor.consultationFee) {
      return res.status(400).json({
        error: `Full consultation fee (${doctor.consultationFee}) must be paid to book appointment`,
      });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      appointmentDate,
      readableDate: bookingDate,
      readableTime: bookingTime,
      notes,
      status: "confirmed",
      paymentStatus: "paid",
      paidAmount,
    });

    res.status(201).json({
      message: `Appointment booked successfully. Paid: ${paidAmount}, Payment Status: paid`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------
// 2️⃣ Get All Appointments of Logged-in Patient
// ---------------------------
const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "specialization hospitalName consultationFee")
      .sort({ appointmentDate: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------
// 3️⃣ Get All Appointments of Logged-in Doctor
// ---------------------------
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "age gender")
      .sort({ appointmentDate: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------
// 4️⃣ Update Appointment Status (Doctor Only)
// ---------------------------
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ["confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });

    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: doctor._id });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = status;
    if (status === "cancelled" && cancellationReason) {
      appointment.cancellationReason = cancellationReason;
      // paymentStatus remains "paid" since full payment is done
    }

    await appointment.save();
    res.status(200).json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------
// 5️⃣ Patient Cancels Appointment
// ---------------------------
const cancelAppointmentByPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    const appointment = await Appointment.findOne({ _id: req.params.id, patientId: patient._id });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = "cancelled";
    // PaymentStatus remains "paid" since full payment is already done
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------
// 6️⃣ Update Payment (Optional - rarely used, payment should already be full)
// ---------------------------
const updatePaymentStatus = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Payment amount must be positive" });

    const appointment = await Appointment.findById(req.params.id).populate("doctorId", "consultationFee");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.paidAmount += amount;

    if (appointment.paidAmount >= appointment.doctorId.consultationFee) {
      appointment.paymentStatus = "paid";
      if (appointment.status === "pending") appointment.status = "confirmed";
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