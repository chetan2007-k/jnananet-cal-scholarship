const express = require("express");
const multer = require("multer");

const scholarships = require("../data/scholarships");
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

router.post("/guidance", async (req, res) => {
  const { question } = req.body || {};

  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: "question is required" });
  }

  const q = String(question).toLowerCase();
  let answer = "";

  if (q.includes("b.tech") || q.includes("btech")) {
    answer = `
1) Scholarships for B.Tech students:
• NSP Merit Scholarship
• AICTE Pragati Scholarship
• Reliance Foundation Scholarship
• Tata Scholarship

2) Eligibility tips:
• Maintain 60%+ marks
• Family income under ₹4–6 lakh
• Aadhaar and bank account required

3) Documents needed:
• Aadhaar card
• Income certificate
• Marksheet
• Bank details

4) Next step:
Check eligibility using the portal and apply through official scholarship websites.
`;
  } else if (q.includes("documents")) {
    answer = `
Common scholarship documents:
• Aadhaar Card
• Income Certificate
• Marksheet
• Bonafide Certificate
• Bank Passbook
`;
  } else {
    answer = `
I can help you with scholarships, eligibility, and documents.
Try asking: "Scholarships for B.Tech students".
`;
  }

  res.json({ message: answer });
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