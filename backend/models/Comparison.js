import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: true,
      minlength: 30,
      maxlength: 10_000,
      trim: true,
    },
    resumeFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    resumeSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: undefined,
    },
    missingSkills: {
      type: [String],
      default: undefined,
    },
    explanation: {
      type: String,
      maxlength: 1200,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Comparison", comparisonSchema);
