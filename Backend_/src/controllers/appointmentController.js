import Appointment from "../models/appointmentModel.js";



 const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDateTime,
      durationMinutes,
      consultationFee,
      notes,
    } = req.body;

    const patientId = req.user._id; // assuming auth middleware

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDateTime,
      durationMinutes,
      consultationFee,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Appointment scheduled successfully",
      appointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked for the doctor",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Appointment.countDocuments({ doctorId });

    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name email phone")
      .sort({ appointmentDateTime: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



 const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Appointment.countDocuments({ patientId });

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name email specialization")
      .sort({ appointmentDateTime: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "scheduled",
      "confirmed",
      "completed",
      "cancelled",
      "no-show",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



 const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "cancelled";
    appointment.cancellation = {
      reason,
      cancelledBy: req.user.role, // patient / doctor / admin
      cancelledAt: new Date(),
    };

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



 const addPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.paidAmount += amount;

    // Update payment status based on paid amount
    if (appointment.paidAmount >= appointment.consultationFee) {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed"; // auto-confirm if fully paid
    } else if (appointment.paidAmount > 0) {
      appointment.paymentStatus = "partial";
    }

    await appointment.save();

    res.json({
      success: true,
      message: "Payment added successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export { bookAppointment, getDoctorAppointments, getPatientAppointments, updateAppointmentStatus, cancelAppointment, addPayment };