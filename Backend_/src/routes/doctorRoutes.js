import express from "express";
import {
  approveDoctor,
  createDoctorProfile,
  doctorDeactivate,
  getAllDoctors,
  getDoctorById,
  getDoctorDashboard,
  getMyDoctorProfile,
  getPendingDoctors,
  suspendDoctor,
  updateMyDoctorProfile,
} from "../controllers/doctorController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";

const doctorRoutes = express.Router();


doctorRoutes.post("/doctor", authMiddleware, allowRoles("doctor"), createDoctorProfile);

doctorRoutes.get("/myProfile", authMiddleware, allowRoles("doctor"), getMyDoctorProfile);

doctorRoutes.put("/updateMyProfile", authMiddleware, allowRoles("doctor"), updateMyDoctorProfile);

doctorRoutes.get("/getAllDoctors", getAllDoctors);

doctorRoutes.get("/doctor/:id", getDoctorById);

doctorRoutes.delete("/delete/:id", authMiddleware, allowRoles("admin"), doctorDeactivate);

doctorRoutes.put("/approve/:id", authMiddleware, allowRoles("admin"), approveDoctor);

doctorRoutes.put("/suspend/:id", authMiddleware, allowRoles("admin"), suspendDoctor);

doctorRoutes.get("/pending", authMiddleware, allowRoles("admin"), getPendingDoctors);

doctorRoutes.get("/dashboard", authMiddleware, allowRoles("doctor"), getDoctorDashboard);


export default doctorRoutes;