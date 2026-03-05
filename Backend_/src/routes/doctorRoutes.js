import express from "express";

import {
  createDoctor,
  getDoctorProfile,
  updateDoctor,
  getDoctors,
  changeDoctorStatus
} from "../controllers/doctorController.js";

import { allowRoles, authMiddleware } from "../middleware/authMiddleware.js";

const doctorRouter = express.Router();


doctorRouter.post("/apply", authMiddleware, createDoctor);

doctorRouter.get("/profile", authMiddleware, getDoctorProfile);

doctorRouter.put("/update-profile", authMiddleware, updateDoctor);

doctorRouter.get("/getDoc", authMiddleware, allowRoles("admin"), getDoctors);

doctorRouter.put("/status/:doctorId", authMiddleware, allowRoles("admin"), changeDoctorStatus);

export default doctorRouter;