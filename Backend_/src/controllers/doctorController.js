import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import mongoose from "mongoose";


const createDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only users with doctor role can create doctor profile",
      });
    }

    const {specialization,experienceYears,hospitalName,consultationFee,} = req.body;

    if (!specialization || experienceYears === undefined || !hospitalName || consultationFee === undefined){
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingDoctor = await Doctor.findOne({ userId: req.user._id });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists",
      });
    }

    const doctor = await Doctor.create({
      userId: req.user._id,
      specialization,
      experienceYears,
      hospitalName,
      consultationFee,
    });

    res.status(201).json({
      success: true,
      message: "Doctor profile created. Awaiting admin approval.",
      doctor,
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied" });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      "userId",
      "username email phone role"
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Get My Doctor Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const updateMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied" });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const allowedFields = ["specialization","experienceYears","hospitalName","consultationFee",];

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        doctor[key] = req.body[key];
      }
    });

    // 🔥 Reset status after update (admin must re-approve)
    doctor.status = "pending";

    await doctor.save();

    res.status(200).json({
      message: "Profile updated. Awaiting admin re-approval.",
      doctor,
    });
  } catch (error) {
    console.error("Update Doctor Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      isActive: true,
      status: "approved", // 🔥 only approved doctors visible
      specialization: { $regex: search, $options: "i" },
    };

    const totalDoctors = await Doctor.countDocuments(query);

    const doctors = await Doctor.find(query)
      .populate("userId", "username email phone")
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalDoctors,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
      doctors,
    });
  } catch (error) {
    console.error("Get All Doctors Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    const doctor = await Doctor.findOne({
      _id: id,
      isActive: true,
      status: "approved",
    }).populate("userId", "username email phone");

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Get Doctor By ID Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const approveDoctor = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "approved";
    await doctor.save();

    res.json({ message: "Doctor approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const suspendDoctor = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.status = "suspended";
    await doctor.save();

    res.json({ message: "Doctor suspended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const getPendingDoctors = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const doctors = await Doctor.find({ status: "pending" }).populate(
      "userId",
      "username email phone"
    );

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const doctorDeactivate = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.isActive = false;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor deactivated successfully",
    });
  } catch (error) {
    console.error("Doctor Deactivate Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/**
 * Doctor Dashboard
 * Shows total appointments, today's appointments, completed/cancelled counts, and total revenue
 */
const getDoctorDashboard = async (req, res) => {
  try {
    // Convert doctorId to ObjectId for strict MongoDB matching
    const doctorId = new mongoose.Types.ObjectId(req.user._id);

    // Today's date range in server timezone
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Total appointments for this doctor
    const totalAppointments = await Appointment.countDocuments({ doctorId });

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      appointmentDateTime: { $gte: todayStart, $lte: todayEnd },
    });

    const confirmedAppointments = await Appointment.countDocuments({
      doctorId,
      status: "confirmed",
    });

    // Completed appointments
    const completedAppointments = await Appointment.countDocuments({
      doctorId,
      status: "completed",
    });

    // Cancelled appointments
    const cancelledAppointments = await Appointment.countDocuments({
      doctorId,
      status: "cancelled",
    });

    // Total revenue (sum of paidAmount for fully paid appointments)
    const revenueData = await Appointment.aggregate([
      {
        $match: {
          doctorId,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" },
        },
      },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      dashboard: {
        totalAppointments,
        todayAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export {
  createDoctorProfile,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  doctorDeactivate,
  getAllDoctors,
  getDoctorById,
  approveDoctor,
  suspendDoctor,
  getPendingDoctors,
  getDoctorDashboard, 
};