import { Router } from "express";
import { generateAudio } from "../controllers/tts.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/generate", requireAuth, generateAudio);

export default router;
