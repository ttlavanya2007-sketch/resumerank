import express from "express";
import { submitComparison } from "../controller/comparisonsController.js";
import { uploadResume } from "../middleware/upload.js";

const router = express.Router();

router.post("/", uploadResume, submitComparison);

export default router;
