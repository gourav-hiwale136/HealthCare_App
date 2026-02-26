// models/appointmentModel.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // keep consistent
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming doctor is also User
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    readableDate: {
      type: String,
    },

    readableTime: {
      type: String,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
    },

    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent double booking
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1 },
  { unique: true }
);

// Auto-generate readable date/time
appointmentSchema.pre("save", function () {
  const date = new Date(this.appointmentDate);

  this.readableDate = date.toISOString().split("T")[0];

  this.readableTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;