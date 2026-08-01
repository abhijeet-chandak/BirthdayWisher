import express from "express";
import { generateSong } from "../controllers/song.controller";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.post("/generate", requireAuth, generateSong);

export default router;
