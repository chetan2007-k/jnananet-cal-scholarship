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
  const { question, percentage = 0, income = 0, course = "B.Tech" } = req.body || {};

  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: "question is required" });
  }

  const q = String(question).toLowerCase();
  const normalizedCourse = String(course || "B.Tech");
  const marks = Number.parseFloat(percentage || "0");
  const familyIncome = Number.parseFloat(income || "0");

  const dynamicMatches = [];
  if (marks >= 60 && familyIncome > 0 && familyIncome <= 400000) {
    dynamicMatches.push("NSP Merit Scholarship");
  }
  if (familyIncome > 0 && familyIncome <= 600000) {
    dynamicMatches.push("Reliance Foundation Scholarship");
  }
  if (marks >= 65) {
    dynamicMatches.push("Tata Scholarship");
  }
  if (q.includes("b.tech") || q.includes("btech") || normalizedCourse.toLowerCase().includes("b.tech")) {
    dynamicMatches.push("AICTE Pragati Scholarship");
  }

  const uniqueMatches = [...new Set(dynamicMatches)];
  const scholarshipList = uniqueMatches.length > 0
    ? uniqueMatches
    : ["NSP Merit Scholarship", "AICTE Pragati Scholarship", "Reliance Foundation Scholarship"];

  const scholarshipLines = scholarshipList.map((name) => `• ${name}`).join("\n");
  const marksInsight = marks > 0 ? `${marks}%` : "Not provided";
  const incomeInsight = familyIncome > 0 ? `₹${Math.round(familyIncome).toLocaleString("en-IN")}` : "Not provided";

  let answer = "";

  if (q.includes("b.tech") || q.includes("btech") || q.includes("scholarship")) {
    answer = `
AI Analysis of Your Query

1) Understanding your request
You asked about scholarships for ${normalizedCourse} students.

2) Matching opportunities
Based on your profile and common eligibility criteria, these scholarships are suitable:

${scholarshipLines}

3) Why these match
Most B.Tech scholarships require:
• 60%+ academic score
• family income below ₹4–6 lakh
• valid Aadhaar and bank account

Profile considered:
• Academic score: ${marksInsight}
• Family income: ${incomeInsight}

4) Next step
Use the Eligibility Checker to estimate your approval chances.
`;
  } else if (q.includes("documents")) {
    answer = `
AI Analysis of Your Query

1) Understanding your request
You asked for scholarship document requirements.

2) Common scholarship documents
• Aadhaar Card
• Income Certificate
• Marksheet
• Bonafide Certificate
• Bank Passbook

3) Next step
Keep scanned copies ready in PDF/JPG format before applying.
`;
  } else {
    answer = `
AI Analysis of Your Query

1) Understanding your request
I can help you with scholarships, eligibility, and documents.

2) Try asking
• "Scholarships for B.Tech students"
• "What documents are needed for scholarships?"
• "Suggest scholarships for 72% and income 3 lakh"
`;
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

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