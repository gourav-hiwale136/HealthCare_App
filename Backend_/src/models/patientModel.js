import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // Must match your User model name
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    allergies: {
      type: [String],   // Array of strings
      default: [],
    },

    medicalHistory: {
      type: String,
      default: "",
    },

    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      relation: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
  },
       { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;