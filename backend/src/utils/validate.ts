/** Shared input validation helpers. */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{10}$/;

/** Letters, spaces, and a few common name characters only. */
export const NAME_REGEX = /^[\p{L}][\p{L} .'-]{0,39}$/u;

export const MOODS = ["happy", "romantic", "funny", "motivational", "calm"];
export const GENRES = ["rap", "rock", "pop", "desi", "edm"];
export const GENDERS = ["male", "female", "other"];
export const VOICES = ["male", "female"];

/**
 * Collapse whitespace and strip control characters so user text can be
 * safely interpolated into prompts and stored.
 */
export const cleanText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .replace(/[\x00-\x1f\x7f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
