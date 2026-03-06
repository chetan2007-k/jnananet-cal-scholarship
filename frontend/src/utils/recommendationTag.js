export function getRecommendationTag(probability = 0) {
  const score = Number(probability || 0);

  if (score > 75) {
    return {
      label: "AI Verdict: STRONGLY RECOMMENDED",
      tone: "safe",
    };
  }

  if (score >= 50) {
    return {
      label: "AI Verdict: MODERATELY RECOMMENDED",
      tone: "soon",
    };
  }

  return {
    label: "AI Verdict: WEAK RECOMMENDATION",
    tone: "today",
  };
}
