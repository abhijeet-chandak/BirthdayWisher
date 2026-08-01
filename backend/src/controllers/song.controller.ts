import { Response } from "express";
import UserModel from "../models/user.model";
import { AuthedRequest } from "../middleware/auth";
import { generateBirthdaySong } from "../utils/gemini";
import {
  cleanText,
  NAME_REGEX,
  MOODS,
  GENRES,
  GENDERS,
  VOICES,
} from "../utils/validate";

/**
 * Generate a Personalized Birthday Song
 * - User comes from the verified session token, never the request body
 * - All creative inputs are validated against allowlists before they
 *   reach the LLM prompt
 */
export const generateSong = async (req: AuthedRequest, res: Response) => {
  try {
    const recipientName = cleanText(req.body?.recipientName);
    const recipientAge = Number(req.body?.recipientAge);
    const recipientGender = cleanText(req.body?.recipientGender).toLowerCase();
    const mood = cleanText(req.body?.mood).toLowerCase() || "happy";
    const genre = cleanText(req.body?.genre).toLowerCase() || "pop";
    const singerVoice =
      cleanText(req.body?.singerVoice).toLowerCase() || "female";

    if (!recipientName || !NAME_REGEX.test(recipientName)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid recipient name" });
    }
    if (
      !Number.isInteger(recipientAge) ||
      recipientAge < 1 ||
      recipientAge > 120
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid age (1-120)" });
    }
    if (!GENDERS.includes(recipientGender)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid gender" });
    }
    if (!MOODS.includes(mood)) {
      return res.status(400).json({ success: false, message: "Invalid mood" });
    }
    if (!GENRES.includes(genre)) {
      return res.status(400).json({ success: false, message: "Invalid genre" });
    }
    if (!VOICES.includes(singerVoice)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid singer voice" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Song generation is not configured",
      });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "User not verified" });
    }

    const lyrics = await generateBirthdaySong(
      recipientName,
      recipientAge,
      recipientGender,
      mood,
      genre,
      singerVoice
    );

    if (!lyrics) {
      return res.status(502).json({
        success: false,
        message: "Failed to generate song lyrics",
      });
    }

    const newSong = {
      recipientName,
      recipientAge,
      recipientGender,
      mood,
      genre,
      singerVoice,
      lyrics,
      createdAt: new Date(),
    };

    user.songs.push(newSong);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Song generated successfully",
      song: newSong,
    });
  } catch (error) {
    console.error("Generate Song Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating song",
    });
  }
};
