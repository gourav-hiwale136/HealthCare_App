import {
  createPatientProfile,
  getPatientProfileByUserId,
  updatePatientProfile,
  getAllPatients,
  deletePatientProfile
} from "../services/patientService.js";



// Create Patient
export const createPatient = async (req, res) => {
  try {

    const patientData = {
      ...req.body,
      userId: req.user.id
    };

    const patient = await createPatientProfile(patientData);

    res.status(201).json({
      success: true,
      message: "Patient profile created",
      data: patient
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};



// Get Patient Profile
export const getPatientProfile = async (req, res) => {
  try {

    const patient = await getPatientProfileByUserId(req.user.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    res.json({
      success: true,
      data: patient
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};



// Update Patient
export const updatePatient = async (req, res) => {
  try {

    const patient = await updatePatientProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: "Patient profile updated",
      data: patient
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};



// Get All Patients
export const getPatients = async (req, res) => {
  try {

    const patients = await getAllPatients();

    res.json({
      success: true,
      data: patients
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};



// Delete Patient
export const deletePatient = async (req, res) => {
  try {

    await deletePatientProfile(req.user.id);

    res.json({
      success: true,
      message: "Patient profile deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};