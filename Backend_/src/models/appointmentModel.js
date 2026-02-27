import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    appointmentDateTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Appointment must be scheduled in the future",
      },
    },

    durationMinutes: {
      type: Number,
      default: 30,
      min: 5,
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
      enum: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },

    cancellation: {
      reason: { type: String, trim: true },
      cancelledBy: {
        type: String,
        enum: ["patient", "doctor", "admin"],
      },
      cancelledAt: Date,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/////////////////////////////////////////////////////
// 🔒 Prevent Double Booking
/////////////////////////////////////////////////////

appointmentSchema.index(
  { doctorId: 1, appointmentDateTime: 1 },
  { unique: true }
);

/////////////////////////////////////////////////////
// 🧠 Middleware Logic
/////////////////////////////////////////////////////

appointmentSchema.pre("save", function () {
  // Normalize seconds and milliseconds
  this.appointmentDateTime.setSeconds(0, 0);

  // Auto update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = "pending";
  } else if (this.paidAmount < this.consultationFee) {
    this.paymentStatus = "partial";
  } else if (this.paidAmount >= this.consultationFee) {
    this.paymentStatus = "paid";
  }

  // next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;