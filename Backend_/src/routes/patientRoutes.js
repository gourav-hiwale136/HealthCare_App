import express from "express";
import { createPatient, deletePatient, getPatientProfile, getPatients, updatePatient } from "../controllers/patientController.js";
import { allowRoles, authMiddleware } from "../middleware/authMiddleware.js";



const patientRouter = express.Router();


patientRouter.post("/patient", authMiddleware, allowRoles("patient"), createPatient);

patientRouter.get("/profile", authMiddleware, allowRoles("patient"), getPatientProfile);

patientRouter.put("/update-profile", authMiddleware, allowRoles("patient"), updatePatient);

patientRouter.delete("/delete/:id", authMiddleware, allowRoles("patient", "admin"), deletePatient);

patientRouter.get("/getAll", authMiddleware, allowRoles("patient", "admin"), getPatients);



export default patientRouter;