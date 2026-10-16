export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

function validateSkillList(skills) {
  return (
    Array.isArray(skills) &&
    skills.length <= 40 &&
    skills.every(
      (skill) =>
        typeof skill === "string" &&
        skill.trim().length > 0 &&
        skill.trim().length <= 100,
    )
  );
}

export function parseAnalysisResult(result) {
  if (
    result === null ||
    typeof result !== "object" ||
    !Number.isInteger(result.score) ||
    result.score < 0 ||
    result.score > 100 ||
    !validateSkillList(result.matchedSkills) ||
    !validateSkillList(result.missingSkills) ||
    typeof result.explanation !== "string" ||
    result.explanation.trim().length === 0 ||
    result.explanation.trim().length > 1200
  ) {
    throw new AppError(502, "Gemini returned an invalid analysis. Please try again.");
  }

  return {
    score: result.score,
    matchedSkills: [...new Set(result.matchedSkills.map((skill) => skill.trim()))],
    missingSkills: [...new Set(result.missingSkills.map((skill) => skill.trim()))],
    explanation: result.explanation.trim(),
  };
}
