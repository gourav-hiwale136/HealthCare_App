import Doctor from "../models/doctorModel.js";


export const createDoctorProfile = async (doctorData) => {

  const existingDoctor = await Doctor.findOne({ userId: doctorData.userId });

  if (existingDoctor) {
    throw new Error("Doctor profile already exists");
  }

  const doctor = await Doctor.create(doctorData);

  return doctor;
};


export const getDoctorProfileByUserId = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).populate("userId", "name email");
  return doctor;
};


export const updateDoctorProfile = async (userId, updateData) => {
  const doctor = await Doctor.findOneAndUpdate(
    { userId },
    updateData,
    { returnDocument: "after" }
  );

  return doctor;
};


export const getAllDoctors = async () => {
  const doctors = await Doctor.find().populate("userId", "name email");
  return doctors;
};


export const updateDoctorStatus = async (doctorId, status) => {
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { status },
    { returnDocument: "after" }
  );

  return doctor;
};