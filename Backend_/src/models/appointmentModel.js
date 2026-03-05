import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointmentDateTime: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 30,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },

    consultationFee: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ["patient", "doctor", "admin"],
      },
      cancelledAt: Date,
    },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctorId: 1, appointmentDateTime: 1 },
  { unique: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;