import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getPatientAppointments,
  addPayment,
  
} from "../controllers/appointmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const appointmentRouter = express.Router();

// Patient
appointmentRouter.post("/book", authMiddleware, allowRoles("patient"), bookAppointment);
appointmentRouter.get("/myAppointment", authMiddleware, allowRoles("patient"), getPatientAppointments);
appointmentRouter.post("/payment/:id", authMiddleware, allowRoles("patient"), addPayment);

appointmentRouter.patch("/cancel/:id", authMiddleware, allowRoles("patient", "admin", "doctor"), cancelAppointment);
// Doctor
appointmentRouter.get("/doctor", authMiddleware, allowRoles("doctor"), getDoctorAppointments);
appointmentRouter.patch("/status/:id", authMiddleware, allowRoles("doctor"), updateAppointmentStatus);

  

export default appointmentRouter;