import Patient from "../models/patientModel.js";

const createPatientProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      name,
      age,
      gender,
      bloodGroup,
      allergies = [],
      medicalHistory = [],
      emergencyContact = {}
    } = req.body;

    if (!name || !age || !gender || !bloodGroup) {
      return res.status(400).json({ error: "Name, age, gender, and blood group are required" });
    }

    const newPatient = new Patient({
      userId: req.user._id,
      name,
      age,
      gender,
      bloodGroup,
      allergies,
      medicalHistory,
      emergencyContact
    });
    await newPatient.save();

    res.status(201).json({
      message: "Patient profile created successfully",
      patient: newPatient
    });

  } catch (error) {
    console.log("Error creating patient profile:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};


const getAllPatients = async (req, res) => {
  try {
    
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const patients = await Patient.find();

    res.status(200).json(patients);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const getPatientById = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const patient = await Patient.findById(req.params.id);

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.status(200).json(patient);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export { createPatientProfile, getAllPatients, getPatientById };