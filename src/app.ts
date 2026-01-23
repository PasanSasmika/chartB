import express from "express";
import cors from 'cors';
import analyticsRoutes from "./routes/analyticsRoutes";
const app = express();

app.use(express.json());
app.use(cors({
  origin: '*', // For development, allow all. For production, use your domain.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));app.get("/", (_req, res) => {
  res.send("Server is running!");
});

app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

export default app;
