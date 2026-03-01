const scholarships = require("../data/scholarships");

function getRecommendations(profile) {
  const percentage = Number.parseFloat(profile?.percentage || "0");
  const income = Number.parseFloat(profile?.income || "0");
  const course = String(profile?.course || "");

  const ranked = scholarships
    .map((scholarship) => {
      const incomeEligible = income > 0 ? income <= scholarship.maxIncome : true;
      const percentageEligible = percentage > 0 ? percentage >= scholarship.minMarks : true;
      const scholarshipCourse = String(scholarship.course || "").toLowerCase();
      const normalizedCourse = course.toLowerCase();
      const courseEligible = normalizedCourse
        ? scholarshipCourse.includes(normalizedCourse) || normalizedCourse.includes(scholarshipCourse) || scholarshipCourse === "any"
        : true;

      const matchScore =
        (incomeEligible ? 40 : 0) +
        (percentageEligible ? 40 : 0) +
        (courseEligible ? 20 : 0);

      return {
        ...scholarship,
        matchScore,
        reasoning: [
          `${incomeEligible ? "✔" : "✖"} Income within limit (₹${scholarship.maxIncome.toLocaleString("en-IN")})`,
          `${percentageEligible ? "✔" : "✖"} Marks meet minimum (${scholarship.minMarks}%)`,
          `${courseEligible ? "✔" : "✖"} Course relevance`,
        ],
      };
    })
    .sort((left, right) => right.matchScore - left.matchScore);

  const filtered = ranked.filter((item) => item.matchScore >= 50);
  return filtered.length > 0 ? filtered : ranked.slice(0, 3);
}

module.exports = {
  getRecommendations,
};