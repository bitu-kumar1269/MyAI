import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

const allowedOrigins = [
  "https://quickai-frontend.onrender.com",   // ← Render frontend
  "http://localhost:5173",                    // ← Vite local dev
  "http://localhost:3000",                    // ← Local dev
  process.env.FRONTEND_URL,                  // ← Dynamic from env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is Live!"));

app.use(requireAuth());

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} => http://localhost:${PORT}`);
});