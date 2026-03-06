function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getCompetitionScore(scholarship = {}) {
  const minMarks = Number(scholarship?.minMarks || 0);
  const maxIncome = Number(scholarship?.maxIncome || 0);

  const marksDifficulty = clamp((minMarks / 100) * 60, 0, 60);
  const incomeDifficulty = maxIncome > 0
    ? clamp(40 - (maxIncome / 1000000) * 40, 0, 40)
    : 20;

  const difficultyScore = marksDifficulty + incomeDifficulty;
  return clamp(100 - difficultyScore, 0, 100);
}

function getDeadlineTimingScore(deadlineDaysLeft) {
  if (deadlineDaysLeft === null || deadlineDaysLeft === undefined) return 65;
  if (deadlineDaysLeft <= 1) return 45;
  if (deadlineDaysLeft <= 7) return 65;
  if (deadlineDaysLeft <= 30) return 85;
  return 95;
}

function getCategoryScore(category = "General") {
  const normalized = String(category).trim().toUpperCase();
  if (normalized === "SC" || normalized === "ST") return 100;
  if (normalized === "OBC" || normalized === "EWS") return 85;
  return 70;
}

function getMarksScore(marks = 0) {
  return clamp(Number(marks || 0), 0, 100);
}

function getIncomeScore(income = 0) {
  const value = Number(income || 0);
  if (value <= 0) return 50;
  if (value <= 200000) return 100;
  if (value <= 350000) return 80;
  if (value <= 500000) return 60;
  return 40;
}

function buildExplanation({ marksScore, incomeScore, competitionScore, categoryScore, deadlineScore }) {
  const reasons = [];

  reasons.push(marksScore >= 75 ? "✔ High marks" : "❌ Marks could be stronger");
  reasons.push(competitionScore >= 65 ? "✔ Low competition" : "❌ Competition is high");
  reasons.push(categoryScore >= 85 ? "✔ Category advantage" : "✔ Category considered");
  reasons.push(incomeScore >= 70 ? "✔ Income aligned with scholarship rules" : "❌ Income may reduce chances");
  reasons.push(deadlineScore >= 70 ? "✔ Good submission timing window" : "❌ Deadline pressure may affect success");

  return reasons;
}

function calculateSuccessProbability(profile = {}, scholarship = {}) {
  const marksScore = getMarksScore(profile?.marks);
  const incomeScore = getIncomeScore(profile?.income);
  const competitionScore = getCompetitionScore(scholarship);
  const categoryScore = getCategoryScore(profile?.category || profile?.caste);
  const deadlineScore = getDeadlineTimingScore(profile?.deadlineDaysLeft);

  const weighted =
    (marksScore * 0.4) +
    (incomeScore * 0.2) +
    (competitionScore * 0.2) +
    (categoryScore * 0.1) +
    (deadlineScore * 0.1);

  const probability = Math.round(clamp(weighted, 0, 100));

  return {
    probability,
    explanation: buildExplanation({
      marksScore,
      incomeScore,
      competitionScore,
      categoryScore,
      deadlineScore,
    }),
    breakdown: {
      marks: Math.round(marksScore * 0.4),
      income: Math.round(incomeScore * 0.2),
      competition: Math.round(competitionScore * 0.2),
      category: Math.round(categoryScore * 0.1),
      deadline: Math.round(deadlineScore * 0.1),
    },
  };
}

module.exports = {
  calculateSuccessProbability,
};
