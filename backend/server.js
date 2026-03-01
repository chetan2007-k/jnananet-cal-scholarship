const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const apiRouter = require("./routes/api");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const defaultCorsOrigin = "http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com";
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [defaultCorsOrigin];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    service: "JnanaNet backend",
    status: "running",
    apis: [
      "GET /api/health",
      "GET /api/scholarships",
      "POST /api/recommendations",
      "POST /api/guidance",
      "POST /api/upload",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "Server running",
    service: "JnanaNet Backend",
    ai: "Amazon Bedrock",
    compute: "EC2",
    storage: "S3",
  });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("[ERROR]", {
    message: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`[BOOT] Server started on port ${PORT}`);
  console.log(`[BOOT] Region: ${process.env.AWS_REGION || "ap-south-1"}`);
  console.log(`[BOOT] Model configured: ${Boolean(process.env.MODEL_ID)}`);
});