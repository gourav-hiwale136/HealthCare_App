import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or Patient model if you have one
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    labReports: [
      {
        type: String, // store file URLs or paths
      },
    ],
    scanReports: [
      {
        type: String, // store file URLs or paths
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;