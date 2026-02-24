import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or Patient model if you have one
      required: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String }, // e.g., "500mg"
        frequency: { type: String }, // e.g., "Twice a day"
        duration: { type: String }, // e.g., "5 days"
      },
    ],
    instructions: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;