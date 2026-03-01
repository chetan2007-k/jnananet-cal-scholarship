const scholarships = require("../data/scholarships");

function getRecommendations(profile) {
  const percentage = Number.parseFloat(profile?.percentage || "0");
  const income = Number.parseFloat(profile?.income || "0");
  const category = String(profile?.category || "General");
  const course = String(profile?.course || "");

  const ranked = scholarships
    .map((scholarship) => {
      const incomeEligible = income > 0 ? income <= scholarship.maxIncome : true;
      const percentageEligible = percentage > 0 ? percentage >= scholarship.minPercentage : true;
      const categoryEligible = scholarship.categories.includes(category);
      const courseEligible = course ? scholarship.courseTags.includes(course) : true;

      const matchScore =
        (incomeEligible ? 30 : 0) +
        (percentageEligible ? 30 : 0) +
        (categoryEligible ? 20 : 0) +
        (courseEligible ? 20 : 0);

      return {
        ...scholarship,
        matchScore,
        reasoning: [
          `${incomeEligible ? "✔" : "✖"} Income criteria`,
          `${percentageEligible ? "✔" : "✖"} Academic criteria`,
          `${categoryEligible ? "✔" : "✖"} Category criteria`,
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