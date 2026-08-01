import { getToken } from "./session";

export const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

interface ApiResult<T> {
  ok: boolean;
  status: number;
  body: ApiResponse<T>;
}

/** POST JSON to the API; attaches the session token when present. */
export const apiPost = async <T = undefined>(
  path: string,
  payload: unknown,
  withAuth = false
): Promise<ApiResult<T>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (withAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    body = { success: false, message: "Unexpected server response" };
  }

  return { ok: res.ok, status: res.status, body };
};

/**
 * POST JSON and receive binary audio back (TTS). Returns an object URL,
 * or throws with the server's error message.
 */
export const apiPostForAudio = async (
  path: string,
  payload: unknown
): Promise<string> => {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.headers.get("content-type")?.includes("audio")) {
    let message = "Failed to generate audio";
    try {
      const body = (await res.json()) as ApiResponse;
      if (body.message) message = body.message;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  return URL.createObjectURL(await res.blob());
};
