import { calculateSuccessProbability } from "./successProbability";

function isLikelyEligible(profile = {}, scholarship = {}) {
  const marks = Number(profile?.marks || 0);
  const income = Number(profile?.income || 0);
  const minMarks = Number(scholarship?.minMarks || 0);
  const maxIncome = Number(scholarship?.maxIncome || Number.MAX_SAFE_INTEGER);

  const marksMatch = marks > 0 ? marks >= minMarks : true;
  const incomeMatch = income > 0 ? income <= maxIncome : true;

  return marksMatch && incomeMatch;
}

export function generateSmartInsights({
  scholarships = [],
  profile = {},
  getScholarshipState,
  getDaysLeft,
}) {
  if (!Array.isArray(scholarships) || scholarships.length === 0) {
    return [
      "You qualify for 0% scholarships in TN",
      "Engineering students get highest success rate",
      "Apply within 3 days for best chances",
    ];
  }

  const tnEligibleCount = scholarships.reduce((count, scholarship) => {
    const scholarshipState = typeof getScholarshipState === "function"
      ? getScholarshipState(scholarship)
      : "All India";

    const stateAligned = scholarshipState === "Tamil Nadu" || scholarshipState === "All India";
    return stateAligned && isLikelyEligible(profile, scholarship) ? count + 1 : count;
  }, 0);

  const tnEligiblePercent = Math.round((tnEligibleCount / scholarships.length) * 100);

  const successByCourse = scholarships.reduce((accumulator, scholarship) => {
    const course = String(scholarship?.course || "General");
    const prediction = calculateSuccessProbability(profile, scholarship).probability;

    if (!accumulator[course]) {
      accumulator[course] = { total: 0, count: 0 };
    }

    accumulator[course].total += prediction;
    accumulator[course].count += 1;
    return accumulator;
  }, {});

  const topCourse = Object.entries(successByCourse)
    .map(([course, stats]) => ({
      course,
      average: Math.round(stats.total / Math.max(1, stats.count)),
    }))
    .sort((left, right) => right.average - left.average)[0];

  const urgentDeadlines = scholarships.filter((scholarship) => {
    if (typeof getDaysLeft !== "function") return false;
    const daysLeft = getDaysLeft(scholarship.deadline);
    return daysLeft !== null && daysLeft <= 3;
  }).length;

  return [
    `You qualify for ${tnEligiblePercent}% scholarships in TN`,
    `${topCourse?.course || "Engineering"} students get highest success rate`,
    urgentDeadlines > 0
      ? "Apply within 3 days for best chances"
      : "Apply early for best chances",
  ];
}
