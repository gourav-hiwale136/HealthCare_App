import express from "express";
import { addMedicalRecord, createPatientProfile, deletePatientProfile, getAllPatients, getMyPatientProfile, getPatientById, getPatientByUserId, updateMyPatientProfile, updatePatientProfile } from "../controllers/patientController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/allowRoles.js";



const patientRoutes = express.Router();

patientRoutes.post("/patient", authMiddleware, allowRoles("patient"), createPatientProfile);
patientRoutes.get("/patients", authMiddleware, allowRoles("admin"), getAllPatients);
patientRoutes.get("/getMe/:id", authMiddleware, allowRoles("patient"), getPatientByUserId);
patientRoutes.get("/patient/:id", authMiddleware, allowRoles("admin", "doctor"), getPatientById);
patientRoutes.get("/my-profile", authMiddleware, allowRoles("patient"), getMyPatientProfile);
patientRoutes.put("/my-profile/update", authMiddleware, allowRoles("patient"), updateMyPatientProfile);
patientRoutes.put("/updateProfile/:id", authMiddleware, allowRoles("admin", "doctor"), updatePatientProfile);
patientRoutes.delete("/delete/:id", authMiddleware, allowRoles("admin", "patient"), deletePatientProfile);
patientRoutes.post("/medical-record/:id", authMiddleware, allowRoles("admin", "patient"), addMedicalRecord);



export default patientRoutes;