import {
  createDoctorProfile,
  getDoctorProfileByUserId,
  updateDoctorProfile,
  getAllDoctors,
  updateDoctorStatus
} from "../services/doctorService.js";



export const createDoctor = async (req, res) => {
  try {

    const doctorData = {
      ...req.body,
      userId: req.user.id
    };

    const doctor = await createDoctorProfile(doctorData);

    res.status(201).json({
      success: true,
      message: "Doctor profile created",
      data: doctor
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};



export const getDoctorProfile = async (req, res) => {
  try {

    const doctor = await getDoctorProfileByUserId(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      success: true,
      data: doctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateDoctor = async (req, res) => {
  try {

    const doctor = await updateDoctorProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: "Doctor profile updated",
      data: doctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getDoctors = async (req, res) => {
  try {

    const doctors = await getAllDoctors();

    res.json({
      success: true,
      data: doctors
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const changeDoctorStatus = async (req, res) => {
  try {

    const { doctorId } = req.params;
    const { status } = req.body;

    const doctor = await updateDoctorStatus(doctorId, status);

    res.json({
      success: true,
      message: "Doctor status updated",
      data: doctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};