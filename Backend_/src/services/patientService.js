import Patient from "../models/patientModel.js";

const roleFields = {
  patient: ["name", "age", "phone", "emergencyContact"],
  doctor: ["allergies", "medicalHistory", "bloodGroup", "treatmentNotes"],
  admin: ["name", "emergencyContact"],
};

// CREATE PROFILE
export const createPatientProfileService = async (user, data) => {
  const { name, age, phone, gender, bloodGroup, allergies = [], medicalHistory = [], treatmentNotes = {}, emergencyContact = {} } = data;

  if (!name || !age || !phone || !gender || !bloodGroup) {
    throw new Error("Name, age, phone, gender, and blood group are required");
  }

  if (!["Male", "Female", "Other"].includes(gender)) {
    throw new Error("Invalid gender value");
  }

  const existing = await Patient.findOne({ userId: user._id });
  if (existing) {
    throw new Error("Patient profile already exists");
  }

  const newPatient = await Patient.create({
    userId: user._id,
    name,
    age,
    phone,
    gender,
    bloodGroup,
    allergies,
    medicalHistory,
    treatmentNotes,
    emergencyContact,
  });

  return newPatient;
};

// GET ALL (ADMIN)
export const getAllPatientsService = async (user) => {
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return await Patient.find();
};

// GET BY ID
export const getPatientByIdService = async (user, id) => {
  const patient = await Patient.findById(id);
  if (!patient) throw new Error("Patient not found");

  if (
    user.role !== "admin" &&
    user.role !== "doctor" &&
    user._id.toString() !== patient.userId.toString()
  ) {
    throw new Error("Forbidden");
  }

  return patient;
};

// GET MY PROFILE
export const getMyPatientProfileService = async (user) => {
  const patient = await Patient.findOne({ userId: user._id });
  if (!patient) throw new Error("Patient profile not found");

  return patient;
};

// UPDATE PROFILE (ROLE BASED)
export const updatePatientProfileService = async (user, id, data) => {
  let patient;

  if (user.role === "patient") {
    patient = await Patient.findOne({ userId: user._id });
    if (!patient) throw new Error("Patient profile not found");
  } else if (["doctor", "admin"].includes(user.role)) {
    patient = await Patient.findById(id);
    if (!patient) throw new Error("Patient not found");
  } else {
    throw new Error("Forbidden");
  }

  const allowedFields = roleFields[user.role] || [];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      patient[field] = data[field];
    }
  });

  await patient.save();
  return patient;
};

// DELETE PROFILE (ADMIN ONLY)
export const deletePatientProfileService = async (user, id) => {
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }

  const patient = await Patient.findById(id);
  if (!patient) throw new Error("Patient not found");

  await patient.deleteOne();
};

// ADD MEDICAL RECORD
export const addMedicalRecordService = async (user, id, record) => {
  if (!["admin", "doctor"].includes(user.role)) {
    throw new Error("Forbidden");
  }

  const patient = await Patient.findById(id);
  if (!patient) throw new Error("Patient not found");

  patient.medicalHistory.push(record);
  await patient.save();

  return patient;
};