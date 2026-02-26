import express from "express";
import { loginUser, registerUser, updateCredentials } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";



const authRoutes = express.Router();

authRoutes.post("/register", registerUser);

authRoutes.post("/login", loginUser);

authRoutes.put("/updateCredentials", authMiddleware, updateCredentials);

export default authRoutes;