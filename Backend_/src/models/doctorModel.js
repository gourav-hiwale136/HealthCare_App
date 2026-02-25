import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Indexes
doctorSchema.index({ specialization: 1 });
// doctorSchema.index({ userId: 1 }, { unique: true });
doctorSchema.index({ status: 1 });
doctorSchema.index({ isActive: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;