import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or Patient model if you have one
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "UPI", "Wallet", "Net Banking", "Cash"], // add others if needed
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }, // adds createdAt and updatedAt automatically
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
