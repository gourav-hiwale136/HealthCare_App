import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Human-readable date and time
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },

    time: {
      type: String, // "10:00 AM"
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed"],
      default: "pending",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent double booking for same doctor at same date + time
appointmentSchema.index(
  { doctorId: 1, date: 1, time: 1 },
  { unique: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;