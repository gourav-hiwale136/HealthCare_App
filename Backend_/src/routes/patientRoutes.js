import express from "express";
import { createPatientProfile, getAllPatients, getPatientById } from "../controllers/patientController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";



const patientRoutes = express.Router();

patientRoutes.post("/create-patient", authMiddleware, allowRoles("patient"), createPatientProfile);
patientRoutes.get("/getAll-patients", authMiddleware, allowRoles("admin"), getAllPatients);
patientRoutes.get("/get-patient/:id", authMiddleware, allowRoles("admin", "doctor"), getPatientById);


export default patientRoutes;