import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/DB.js";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import patientRouter from "./routes/patientRoutes.js";
import doctorRouter from "./routes/doctorRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

dotenv.config();
const app = express();
connectDB(process.env.MONGO_URL);
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/payments", paymentRouter)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
