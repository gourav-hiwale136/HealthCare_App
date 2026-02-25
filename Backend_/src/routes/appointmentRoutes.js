import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointmentByPatient,
} from "../controllers/appointmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const appointmentRouter = express.Router();

// Patient
appointmentRouter.post("/book", authMiddleware, allowRoles("patient"), bookAppointment);
appointmentRouter.get("/my", authMiddleware, allowRoles("patient"), getMyAppointments);
appointmentRouter.patch("/cancel/:id", authMiddleware, allowRoles("patient"), cancelAppointmentByPatient);

// Doctor
appointmentRouter.get("/doctor", authMiddleware, allowRoles("doctor"), getDoctorAppointments);
appointmentRouter.patch("/status/:id", authMiddleware, allowRoles("doctor"), updateAppointmentStatus);
  

export default appointmentRouter;