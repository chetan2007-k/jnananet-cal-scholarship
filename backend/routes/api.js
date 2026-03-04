const express = require("express");
const multer = require("multer");

const scholarships = require("../data/scholarships");
const { getRecommendations } = require("../services/recommendationService");
const { uploadDocumentToS3 } = require("../services/s3UploadService");
const {
  sendSupportTicketNotification,
  sendContactFormNotification,
} = require("../services/adminNotificationService");
const {
  normalizeEmail,
  createPasswordResetRequest,
  sendPasswordResetEmail,
  resetPasswordWithToken,
  syncAccountPassword,
} = require("../services/passwordResetService");

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

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function sanitizeText(value = "") {
  return String(value || "").trim();
}

function generateKeywordGuidance({ q, normalizedCourse, marksInsight, incomeInsight, scholarshipLines }) {
  const guidanceCategories = [
    {
      keys: ["hello", "hi", "hey", "namaste"],
      message: `
AI Analysis of Your Query

1) Understanding your request
Hello! I am your JnanaNet scholarship assistant.

2) How I can help
I can guide you on scholarships, eligibility, documents, deadlines, education loans, and official portals.

3) Try asking
• "B.Tech scholarships for low-income students"
• "What documents are needed for NSP?"
• "Women scholarship options in India"
`,
    },
    {
      keys: ["b.tech", "btech", "engineering"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You asked about scholarships for ${normalizedCourse} / engineering students.

2) Matching opportunities
${scholarshipLines}

3) Typical criteria
• 60%+ academic score
• family income criteria (often below ₹4–8 lakh)
• valid academic and identity documents

4) Profile considered
• Academic score: ${marksInsight}
• Family income: ${incomeInsight}
`,
    },
    {
      keys: ["government scholarship", "govt scholarship", "central scholarship", "state scholarship"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You are looking for government scholarship options.

2) Recommended path
• Start with National Scholarship Portal (NSP)
• Check your state government scholarship portal
• Verify scheme eligibility before applying

3) Next step
Keep Aadhaar, income certificate, and marksheets ready for faster application.
`,
    },
    {
      keys: ["low income", "income", "poor", "ews", "economically weaker"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You are asking about scholarships for low-income families.

2) Guidance
Many scholarships prioritize annual family income slabs such as ₹2.5 lakh, ₹4 lakh, or ₹6 lakh.

3) What to prepare
• Valid income certificate
• Bank account in student name
• Correct category and domicile details

4) Profile considered
• Family income: ${incomeInsight}
`,
    },
    {
      keys: ["eligibility", "eligible", "criteria", "can i apply"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You want to check scholarship eligibility.

2) Main factors
• Academic score threshold
• Family income limit
• Category / domicile / course / year

3) Profile considered
• Academic score: ${marksInsight}
• Family income: ${incomeInsight}

4) Next step
Use the Eligibility Checker to see scheme-wise eligibility instantly.
`,
    },
    {
      keys: ["documents", "document", "certificate", "aadhaar", "bonafide"],
      message: `
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
Keep scanned copies ready in clear PDF/JPG format before applying.
`,
    },
    {
      keys: ["deadline", "last date", "closing", "apply date"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You asked about scholarship deadlines.

2) Guidance
Deadlines vary by scheme and portal. Always check official portal notices and avoid last-day submission.

3) Best practice
Apply at least 5–7 days before closing date to avoid document validation delays.
`,
    },
    {
      keys: ["loan", "education loan", "vidya lakshmi", "student loan"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You asked about education loan options.

2) Guidance
Use Vidya Lakshmi portal to compare banks, loan schemes, and application process.

3) What to check
• Interest rate and repayment terms
• Moratorium period
• Required collateral (if applicable)
`,
    },
    {
      keys: ["nsp", "national scholarship portal"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You asked about NSP (National Scholarship Portal).

2) NSP guidance
• Register with correct student details
• Complete profile and upload valid documents
• Track application status after institute verification

3) Tip
Ensure Aadhaar, bank details, and institute information are consistent.
`,
    },
    {
      keys: ["aicte", "pragati", "saksham"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You asked about AICTE scholarships.

2) Common schemes
• AICTE Pragati (for girl students in technical education)
• AICTE Saksham (for specially-abled students)

3) Next step
Check official AICTE notifications for eligibility year, institute type, and required documents.
`,
    },
    {
      keys: ["minority scholarship", "minority", "pre matric", "post matric"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You are looking for minority scholarship support.

2) Guidance
Explore pre-matric, post-matric, and merit-cum-means schemes available through official portals.

3) Prepare
• Community/category proof (if required)
• Income certificate
• Academic records
`,
    },
    {
      keys: ["women scholarship", "girl scholarship", "female scholarship", "scholarship for girls"],
      message: `
AI Analysis of Your Query

1) Understanding your request
You are asking about scholarships for women/girl students.

2) Guidance
Look for schemes like AICTE Pragati and women-focused merit scholarships from trusted organizations.

3) Next step
Use your course, income, and marks details to shortlist and apply quickly.
`,
    },
  ];

  const matched = guidanceCategories.find((category) =>
    category.keys.some((keyword) => q.includes(keyword))
  );

  return matched ? matched.message : "";
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

router.get("/scholarships/:id", (req, res) => {
  const scholarshipId = Number.parseInt(req.params.id, 10);
  const scholarship = scholarships.find((item) => item.id === scholarshipId);

  if (!scholarship) {
    return res.status(404).json({ message: "Scholarship not found" });
  }

  return res.json({ scholarship });
});

router.post("/auth/sync-account", async (req, res, next) => {
  try {
    const email = req.body?.email;
    const password = req.body?.password;
    const name = req.body?.name || "";

    if (!isValidEmail(email) || !String(password || "").trim()) {
      return res.status(400).json({ message: "Valid email and password are required" });
    }

    await syncAccountPassword({ email, password, name });
    return res.json({ message: "Account synced" });
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/forgot-password", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email || "");

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const token = await createPasswordResetRequest(email);
    const frontendBase = String(process.env.FRONTEND_RESET_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetLink = `${frontendBase}/?mode=reset&token=${token}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail({
      toEmail: email,
      resetLink,
    });

    return res.json({
      message: "If this email is registered, reset instructions have been sent.",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/reset-password", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    const token = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!isValidEmail(email) || !token || !newPassword) {
      return res.status(400).json({ message: "email, token, and newPassword are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const updated = await resetPasswordWithToken({
      email,
      token,
      newPassword,
    });

    if (!updated) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return next(error);
  }
});

router.post("/support/tickets", async (req, res, next) => {
  try {
    const studentName = sanitizeText(req.body?.studentName || req.body?.name || "Student");
    const userEmail = sanitizeText(req.body?.email || req.body?.raisedBy || "");
    const category = sanitizeText(req.body?.category || req.body?.subject || "General");
    const message = sanitizeText(req.body?.message || req.body?.description || "");

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    await sendSupportTicketNotification({
      studentName,
      userEmail: userEmail || "Not provided",
      category,
      message,
    });

    return res.json({
      message: "Support ticket notification sent",
      notified: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/contact", async (req, res, next) => {
  try {
    const name = sanitizeText(req.body?.name || req.body?.fullName || "Visitor");
    const email = sanitizeText(req.body?.email || "");
    const message = sanitizeText(req.body?.message || "");

    if (!name || !email || !message) {
      return res.status(400).json({ message: "name, email, and message are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    await sendContactFormNotification({
      name,
      email,
      message,
    });

    return res.json({
      message: "Contact form notification sent",
      notified: true,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/check-eligibility", (req, res) => {
  const marks = Number.parseFloat(req.body?.marks || "0");
  const income = Number.parseFloat(req.body?.income || "0");
  const scholarshipId = req.body?.scholarshipId ? Number.parseInt(req.body.scholarshipId, 10) : null;

  if (Number.isNaN(marks) || Number.isNaN(income)) {
    return res.status(400).json({ message: "marks and income are required" });
  }

  const source = scholarshipId
    ? scholarships.filter((item) => item.id === scholarshipId)
    : scholarships;

  if (scholarshipId && source.length === 0) {
    return res.status(404).json({ message: "Scholarship not found" });
  }

  const results = source.map((scholarship) => {
    const marksEligible = marks >= scholarship.minMarks;
    const incomeEligible = income <= scholarship.maxIncome;
    const status = marksEligible && incomeEligible ? "Eligible" : "Not Eligible";

    return {
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      status,
      reason:
        status === "Eligible"
          ? `You meet minimum marks (${scholarship.minMarks}%) and income criteria (≤ ₹${scholarship.maxIncome.toLocaleString("en-IN")}).`
          : `Required: marks ≥ ${scholarship.minMarks}% and income ≤ ₹${scholarship.maxIncome.toLocaleString("en-IN")}.`,
    };
  });

  return res.json({
    marks,
    income,
    results,
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

  let answer = generateKeywordGuidance({
    q,
    normalizedCourse,
    marksInsight,
    incomeInsight,
    scholarshipLines,
  });

  if (!answer) {
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