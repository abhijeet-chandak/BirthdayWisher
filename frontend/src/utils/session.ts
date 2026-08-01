/**
 * Session persistence (sessionStorage) so a page refresh doesn't
 * dead-end the flow. Cleared automatically when the tab closes.
 */

export interface BirthdayDetailsState {
  recipientName: string;
  recipientAge: number;
  recipientGender: string;
}

export interface Song {
  lyrics: string;
  recipientName: string;
  recipientAge: number;
  recipientGender: string;
  mood: string;
  genre: string;
  singerVoice: string;
  createdAt: string;
}

const KEYS = {
  token: "bw_token",
  userId: "bw_userId",
  details: "bw_details",
  song: "bw_song",
} as const;

export const setSession = (userId: string, token: string): void => {
  sessionStorage.setItem(KEYS.userId, userId);
  sessionStorage.setItem(KEYS.token, token);
};

export const getToken = (): string | null =>
  sessionStorage.getItem(KEYS.token);

export const getUserId = (): string | null =>
  sessionStorage.getItem(KEYS.userId);

export const isLoggedIn = (): boolean => Boolean(getToken());

const setJson = (key: string, value: unknown): void =>
  sessionStorage.setItem(key, JSON.stringify(value));

const getJson = <T>(key: string): T | null => {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const saveDetails = (details: BirthdayDetailsState): void =>
  setJson(KEYS.details, details);

export const getDetails = (): BirthdayDetailsState | null =>
  getJson<BirthdayDetailsState>(KEYS.details);

export const saveSong = (song: Song): void => setJson(KEYS.song, song);

export const getSong = (): Song | null => getJson<Song>(KEYS.song);

export const clearSession = (): void => {
  Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
};
