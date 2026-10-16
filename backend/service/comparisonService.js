import { Readable } from "node:stream";
import mongoose from "mongoose";
import Comparison from "../models/Comparison.js";
import { analyzeResume } from "./geminiService.js";
import { AppError } from "../utils.js";

const minimumJobDescriptionLength = 30;
const maximumJobDescriptionLength = 10_000;

function validateSubmission(file, rawJobDescription) {
  if (!file) {
    throw new AppError(400, "A resume PDF is required.");
  }

  if (!file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new AppError(400, "The uploaded file is not a valid PDF.");
  }

  const jobDescription =
    typeof rawJobDescription === "string" ? rawJobDescription.trim() : "";

  if (jobDescription.length < minimumJobDescriptionLength) {
    throw new AppError(
      400,
      `The job description must be at least ${minimumJobDescriptionLength} characters.`,
    );
  }

  if (jobDescription.length > maximumJobDescriptionLength) {
    throw new AppError(
      400,
      `The job description must be no more than ${maximumJobDescriptionLength} characters.`,
    );
  }

  return jobDescription;
}

function uploadToGridFS(bucket, file) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: "application/pdf",
      metadata: { originalName: file.originalname },
    });

    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id));
    Readable.from(file.buffer).pipe(uploadStream);
  });
}

export async function createComparison(file, rawJobDescription) {
  const jobDescription = validateSubmission(file, rawJobDescription);
  const database = mongoose.connection.db;

  if (!database) {
    throw new AppError(503, "The database is not available.");
  }

  const bucket = new mongoose.mongo.GridFSBucket(database, { bucketName: "resumes" });
  const resumeFileId = await uploadToGridFS(bucket, file);

  let comparison;
  try {
    comparison = await Comparison.create({
      jobDescription,
      resumeFileId,
      resumeFileName: file.originalname,
      resumeSize: file.size,
      status: "processing",
    });
  } catch (error) {
    try {
      await bucket.delete(resumeFileId);
    } catch (cleanupError) {
      console.error("Failed to remove an unreferenced resume upload:", cleanupError);
    }
    throw error;
  }

  try {
    const analysis = await analyzeResume(file.buffer, jobDescription);
    comparison.set({
      ...analysis,
      status: "completed",
    });
    await comparison.save();
    return comparison;
  } catch (error) {
    comparison.status = "failed";
    await comparison.save();
    throw error;
  }
}
