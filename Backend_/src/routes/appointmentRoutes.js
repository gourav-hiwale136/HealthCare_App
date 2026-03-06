import express from "express";

import {
  createAppointment,
  getAppointmentById,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  updatePayment,
  cancelAppointment,
  deleteAppointment
} from "../controllers/appointmentController.js";

import { authMiddleware, allowRoles } from "../middleware/authMiddleware.js";

const appointmentRouter = express.Router();


appointmentRouter.post("/book", authMiddleware, allowRoles("patient"), createAppointment);

appointmentRouter.get("/appointment/:id", authMiddleware, allowRoles("doctor", "admin"), getAppointmentById);

appointmentRouter.get("/my-appointment", authMiddleware, allowRoles("patient"), getMyAppointments);

appointmentRouter.get("/doctor", authMiddleware, allowRoles("doctor"), getDoctorAppointments);

appointmentRouter.patch("/update/:id/status", authMiddleware, allowRoles("doctor"), updateAppointmentStatus);

appointmentRouter.patch("/update/:id/payment", authMiddleware, allowRoles("patient"), updatePayment);

appointmentRouter.patch("/:id/cancel", authMiddleware, allowRoles("patient", "doctor"), cancelAppointment);

appointmentRouter.delete("/delete/:id", authMiddleware, allowRoles("admin"), deleteAppointment);



export default appointmentRouter;