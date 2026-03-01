const express = require("express");
const multer = require("multer");

const scholarships = require("../data/scholarships");
const { generateGuidance } = require("../services/bedrockService");
const { getRecommendations } = require("../services/recommendationService");
const { uploadDocumentToS3 } = require("../services/s3UploadService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function resolveUploadedFile(req) {
  if (req.file) {
    return req.file;
  }

  if (!Array.isArray(req.files) || req.files.length === 0) {
    return null;
  }

  const preferredFieldNames = new Set(["document", "file", "upload"]);
  return req.files.find((file) => preferredFieldNames.has(file.fieldname)) || req.files[0];
}

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "JnanaNet backend",
    timestamp: new Date().toISOString(),
  });
});

router.get("/scholarships", (req, res) => {
  res.json({
    count: scholarships.length,
    scholarships,
  });
});

router.post("/guidance", async (req, res, next) => {
  try {
    const { question, language = "English", literacy = "Medium" } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: "question is required" });
    }

    console.log("[API] /guidance", { language, literacy });

    const message = await generateGuidance({
      question: String(question).trim(),
      language,
      literacy,
    });

    res.json({ message });
  } catch (error) {
    console.error("[API] /guidance error", error.message);
    res.status(500).json({ message: "AI service error" });
  }
});

router.post("/recommendations", (req, res) => {
  const profile = req.body || {};
  const recommendations = getRecommendations(profile);

  res.json({
    count: recommendations.length,
    recommendations,
  });
});

router.post("/upload", upload.any(), async (req, res, next) => {
  try {
    const uploadedFile = resolveUploadedFile(req);

    if (!uploadedFile) {
      return res.status(400).json({
        message: "file is required (accepted fields: document, file, upload)",
      });
    }

    console.log("[API] /upload", {
      fileName: uploadedFile.originalname,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
    });

    const result = await uploadDocumentToS3(uploadedFile);

    res.json({
      message: result.uploaded ? "Document uploaded successfully" : "Upload endpoint prepared",
      file: {
        name: uploadedFile.originalname,
        mimeType: uploadedFile.mimetype,
        size: uploadedFile.size,
      },
      storage: result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;