import Patient from "../models/patientModel.js";


// Create Patient Profile
export const createPatientProfile = async (patientData) => {

  const existingPatient = await Patient.findOne({ userId: patientData.userId });

  if (existingPatient) {
    throw new Error("Patient profile already exists");
  }

  const patient = await Patient.create(patientData);

  return patient;
};



// Get Patient Profile
export const getPatientProfileByUserId = async (userId) => {

  const patient = await Patient.findOne({ userId }).populate("userId", "name email");

  return patient;
};



// Update Patient Profile
export const updatePatientProfile = async (userId, updateData) => {

  const patient = await Patient.findOneAndUpdate(
    { userId },
    updateData,
    { returnDocument: "after" }
  );

  return patient;
};



// Get All Patients (Admin / Doctor)
export const getAllPatients = async () => {

  const patients = await Patient.find().populate("userId", "name email");

  return patients;
};



// Delete Patient
export const deletePatientProfile = async (userId) => {

  const patient = await Patient.findOneAndDelete({ userId });

  return patient;
};