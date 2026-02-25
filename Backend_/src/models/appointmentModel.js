// models/appointmentModel.js
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

    // Exact date + time for DB logic
    appointmentDate: {
      type: Date,
      required: true,
    },

    // Human-readable date/time for UI
    readableDate: {
      type: String, // "YYYY-MM-DD"
    },
    readableTime: {
      type: String, // "10:00 AM"
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
      enum: ["pending", "paid"], // only two states now
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

// Prevent double booking for same doctor at same appointmentDate
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;