import { createComparison } from "../service/comparisonService.js";

export async function submitComparison(req, res, next) {
  try {
    const comparison = await createComparison(req.file, req.body.jobDescription);

    return res.status(201).json({
      id: comparison.id,
      status: comparison.status,
      score: comparison.score,
      matchedSkills: comparison.matchedSkills,
      missingSkills: comparison.missingSkills,
      explanation: comparison.explanation,
    });
  } catch (error) {
    return next(error);
  }
}
