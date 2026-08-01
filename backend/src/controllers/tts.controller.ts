import { Response } from "express";
import UserModel from "../models/user.model";
import { AuthedRequest } from "../middleware/auth";

const MAX_TTS_CHARS = 2500;

// ElevenLabs premade voices
const VOICE_IDS: Record<string, string> = {
  female: "21m00Tcm4TlvDq8ikWAM", // Rachel
  male: "pNInz6obpgDQGcFmaJgB", // Adam
};

/**
 * Generate Audio from Lyrics using ElevenLabs TTS
 * - Requires a verified session
 * - Only accepts lyrics of a song the user actually generated, so the
 *   endpoint cannot be used as a free-form TTS proxy
 */
export const generateAudio = async (req: AuthedRequest, res: Response) => {
  try {
    const text: unknown = req.body?.text;
    const voice: string =
      typeof req.body?.voice === "string" ? req.body.voice.toLowerCase() : "";

    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });
    }
    if (text.length > MAX_TTS_CHARS) {
      return res
        .status(400)
        .json({ success: false, message: "Text is too long" });
    }

    const user = await UserModel.findById(req.userId);
    if (!user || !user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "User not verified" });
    }

    const song = user.songs.find((s) => s.lyrics.trim() === text.trim());
    if (!song) {
      return res.status(403).json({
        success: false,
        message: "Audio can only be generated for your own songs",
      });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Audio generation is not configured",
      });
    }

    const voiceId =
      VOICE_IDS[voice] || VOICE_IDS[song.singerVoice] || VOICE_IDS.female;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "ElevenLabs TTS Error:",
        response.status,
        await response.text()
      );
      return res.status(502).json({
        success: false,
        message: "Audio generation failed. Please try again.",
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("TTS Controller Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while generating TTS" });
  }
};
