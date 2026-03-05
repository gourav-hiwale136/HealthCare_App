import express from "express";
import {
  loginUser,
  registerUser,
  updateCredentials,
  getProfile
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);

authRouter.post("/login", loginUser);

authRouter.get("/profile", authMiddleware, getProfile);

authRouter.put("/update-credentials", authMiddleware, updateCredentials);

export default authRouter;