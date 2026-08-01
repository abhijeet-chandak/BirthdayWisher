import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
};

const pronounFor = (gender: string): string => {
  if (gender === "male") return "he/him";
  if (gender === "female") return "she/her";
  return "they/them";
};

export const generateBirthdaySong = async (
  recipientName: string,
  recipientAge: number,
  recipientGender: string,
  mood: string,
  genre: string,
  singerVoice: string
): Promise<string> => {
  // recipientName is validated upstream (letters/spaces only, max 40 chars),
  // and every other field comes from an allowlist — nothing here is free text.
  const prompt = `
You are a songwriter. Write a birthday song for a person named "${recipientName}".

Requirements:
- Exactly 16 lines of ${genre} lyrics with a ${mood} mood, sung by a ${singerVoice} voice.
- The phrase "Happy birthday" must appear at least twice, and the lyrics should rhyme.
- Use simple, short, easy-to-pronounce words. Each line: maximum 8 words or 40 characters.
- The recipient is turning ${recipientAge} and uses ${pronounFor(recipientGender)} pronouns.
- The lyrics must be completely original — no reference to or similarity with any existing song.
- No proper nouns other than the recipient's name.
- Nothing offensive or insensitive toward any person, place, religion, gender, or group.
- Output only the lyrics: no title, no numbering, no commentary.
`;

  try {
    const result = await getModel().generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate song lyrics");
  }
};
