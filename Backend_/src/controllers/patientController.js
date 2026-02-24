import Patient from "../models/patientModel.js";


const createPatientProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, age, gender, bloodGroup, allergies = [], medicalHistory = [], emergencyContact = {} } = req.body;

    if (!name || !age || !gender || !bloodGroup) {
      return res.status(400).json({ error: "Name, age, gender, and blood group are required" });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value" });
    }

    const existing = await Patient.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ error: "Patient profile already exists" });
    }

    const newPatient = new Patient({
      userId: req.user._id,
      name,
      age,
      gender,
      bloodGroup,
      allergies,
      medicalHistory,
      emergencyContact,
    });

    await newPatient.save();

    res.status(201).json({ message: "Patient profile created successfully", patient: newPatient });
  } catch (error) {
    console.error("Error creating patient profile:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};


const getAllPatients = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Admin, Doctor, or the patient themselves can access
    if (
      req.user.role !== "admin" &&
      req.user.role !== "doctor" &&
      req.user._id.toString() !== patient.userId.toString()
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const getPatientByUserId = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const getMyPatientProfile = async (req, res) => {
  try {
    // Find the patient by the logged-in user's ID
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    res.status(200).json({ patient });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateMyPatientProfile = async (req, res) => {
  try {
    // Find patient by logged-in user
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    // Allowed fields for patients to update
    const allowedFields = ["name", "age", "phone", "emergencyContact"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) patient[field] = req.body[field];
    });

    await patient.save();

    res.status(200).json({
      message: "Profile updated successfully",
      patient
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({ error: error.message });
  }
};


const updatePatientProfile = async (req, res) => {
  try {
    let patient;
    if (req.user.role === "patient") {
      // Patient updates their own profile
      patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(404).json({ error: "Patient profile not found" });

    } else if (req.user.role === "doctor" || req.user.role === "admin") {
      // Doctor/Admin updates a patient by ID
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Patient ID is required" });

      patient = await Patient.findById(id);
      if (!patient) return res.status(404).json({ error: "Patient not found" });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    let allowedFields = [];
    if (req.user.role === "patient") {
      allowedFields = ["name", "age", "phone", "emergencyContact"];
    } else if (req.user.role === "doctor") {
      allowedFields = ["allergies", "medicalHistory", "treatmentNotes"];
    } else if (req.user.role === "admin") {
      allowedFields = ["name", "phone", "emergencyContact", "bloodGroup"];
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    res.status(200).json({
      message: "Profile updated successfully",
      patient
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const deletePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (req.user.role !== "admin" && req.user._id.toString() !== patient.userId.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await patient.remove();
    res.status(200).json({ message: "Patient profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const addMedicalRecord = async (req, res) => {
  try {
    const { record } = req.body;
    if (!record) return res.status(400).json({ error: "Medical record is required" });

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Only admin or patient themselves
    if (req.user.role !== "admin" && req.user._id.toString() !== patient.userId.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    patient.medicalHistory.push(record);
    await patient.save();

    res.status(200).json({ message: "Medical record added", patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createPatientProfile,
  getAllPatients,
  getPatientById,
  getMyPatientProfile,
  getPatientByUserId,
  updateMyPatientProfile,
  updatePatientProfile,
  deletePatientProfile,
  addMedicalRecord,
};