function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getMarksComponent(marks = 0) {
  return Math.round(clamp(Number(marks || 0), 0, 100) * 0.4);
}

function getDocumentsComponent(uploads = {}) {
  const total = 3;
  const available = [uploads?.aadhaar, uploads?.income, uploads?.marksheet].filter(Boolean).length;
  return Math.round((available / total) * 25);
}

function getIncomeComponent(income = 0) {
  const value = Number(income || 0);
  if (value <= 0) return 10;
  if (value <= 250000) return 20;
  if (value <= 450000) return 15;
  if (value <= 700000) return 10;
  return 6;
}

function getCategoryComponent(category = "General") {
  const normalized = String(category).trim().toUpperCase();
  if (normalized === "SC" || normalized === "ST") return 15;
  if (normalized === "OBC" || normalized === "EWS") return 12;
  return 9;
}

export function calculateProfileStrength({ marks, uploads, income, category }) {
  const marksComponent = getMarksComponent(marks);
  const documentsComponent = getDocumentsComponent(uploads);
  const incomeComponent = getIncomeComponent(income);
  const categoryComponent = getCategoryComponent(category);

  const score = clamp(
    marksComponent + documentsComponent + incomeComponent + categoryComponent,
    0,
    100
  );

  const label = score >= 80 ? "Strong" : score >= 60 ? "Moderate" : "Needs Work";

  return {
    score,
    label,
    breakdown: {
      marks: marksComponent,
      documents: documentsComponent,
      income: incomeComponent,
      category: categoryComponent,
    },
  };
}
