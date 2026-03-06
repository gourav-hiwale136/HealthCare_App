import express from "express";
import {
  createPayment,
  getPaymentById,
  getMyPayments,
  updatePaymentStatus,
  deletePayment
} from "../controllers/paymentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/", authMiddleware, createPayment);

paymentRouter.get("/my", authMiddleware, getMyPayments);

paymentRouter.get("/:id", authMiddleware, getPaymentById);

paymentRouter.patch("/:id/status", authMiddleware, updatePaymentStatus);

paymentRouter.delete("/:id", authMiddleware, deletePayment);

export default paymentRouter;