import mongoose, { Schema, Document } from "mongoose";

export interface ISong {
  recipientName: string;
  recipientAge: number;
  recipientGender: string;
  mood: string;
  genre: string;
  singerVoice: string;
  lyrics: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  otpHash?: string | null;
  otpExpiresAt?: Date | null;
  otpAttempts: number;
  songs: ISong[];
}

const SongSchema = new Schema<ISong>(
  {
    recipientName: { type: String, required: true, trim: true, maxlength: 40 },
    recipientAge: { type: Number, required: true, min: 1, max: 120 },
    recipientGender: { type: String, required: true },
    mood: { type: String, required: true },
    genre: { type: String, required: true },
    singerVoice: { type: String, required: true },
    lyrics: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    isVerified: { type: Boolean, default: false },
    // OTP is stored only as a hash, never in plain text
    otpHash: { type: String, default: null, select: false },
    otpExpiresAt: { type: Date, default: null, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    songs: { type: [SongSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
