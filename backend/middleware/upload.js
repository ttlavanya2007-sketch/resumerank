import multer from "multer";
import { AppError } from "../utils.js";

const maximumResumeSize = 10 * 1024 * 1024;

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maximumResumeSize,
    fieldSize: 40_000,
    fields: 1,
    files: 1,
    parts: 2,
  },
  fileFilter: (_req, file, callback) => {
    const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");
    const hasPdfMimeType =
      file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream";

    if (!hasPdfExtension || !hasPdfMimeType) {
      callback(new AppError(400, "Please upload a PDF file."));
      return;
    }

    callback(null, true);
  },
});

export const uploadResume = resumeUpload.single("resume");
