import multer from "multer";
import { AppError } from "../utils.js";

export function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "The resume PDF must be no larger than 10 MB."
        : "Please upload one resume PDF and a job description of no more than 10,000 characters.";
    return res.status(400).json({ error: message });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error("API request failed:", error);
  return res.status(500).json({ error: "The request could not be completed." });
}
