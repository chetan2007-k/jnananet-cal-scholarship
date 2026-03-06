import { calculateSuccessProbability } from "./successProbability";

export function generateWhatIfSimulations(profile = {}, scholarship = {}) {
  const baseProfile = {
    marks: Number(profile?.marks || 0),
    income: Number(profile?.income || 0),
    category: profile?.category || "General",
    deadlineDaysLeft: profile?.deadlineDaysLeft,
  };

  const scenarios = [
    {
      label: "If marks = 85",
      profile: {
        ...baseProfile,
        marks: 85,
      },
    },
    {
      label: "If income = ₹2,00,000",
      profile: {
        ...baseProfile,
        income: 200000,
      },
    },
  ];

  return scenarios.map((scenario) => {
    const prediction = calculateSuccessProbability(scenario.profile, scholarship);
    return {
      label: scenario.label,
      probability: prediction.probability,
      explanation: prediction.explanation,
    };
  });
}
