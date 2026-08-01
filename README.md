# BirthdayWisher 🎂🎵

Generate a personalized birthday song for your loved ones — pick a mood, genre,
and singer's voice, and the app writes unique lyrics with Gemini and sings them
via ElevenLabs text-to-speech.

- **Frontend**: React (TypeScript) + Tailwind CSS
- **Backend**: Node.js + Express (TypeScript) + MongoDB

## Flow

Register (phone OTP) → Birthday details → Choose mood / genre / voice →
Lyrics generated → Play / download the song.

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd BirthdayWisher
```

### 2. Backend setup

Copy `backend/.env.example` to `backend/.env` and fill in the values:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random string used to sign session tokens |
| `GEMINI_API_KEY` | For lyrics | Google Gemini API key |
| `ELEVENLABS_API_KEY` | For audio | ElevenLabs API key |
| `PORT` | — | Defaults to `5000` |
| `ALLOWED_ORIGINS` | — | CORS allowlist, defaults to `http://localhost:3000` |
| `GEMINI_MODEL` | — | Defaults to `gemini-2.5-flash` |
| `NODE_ENV` | — | Set `production` to disable the dev OTP in responses |

```bash
cd backend
npm install
npm run dev        # ts-node-dev on http://localhost:5000
```

Other scripts: `npm run build` (compile to `dist/`), `npm start` (run compiled),
`npm run typecheck`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm start          # http://localhost:3000
```

Optional: copy `frontend/.env.example` to `frontend/.env` to point at a
different API URL (`REACT_APP_API_URL`).

## Demo OTP

There is no SMS provider wired up. Outside of production the API returns the
OTP in the response (`devOtp`) and the UI shows it in the OTP popup, so the
full flow works locally without any provider account.

## API

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | Create/re-use user, send OTP |
| `POST` | `/api/auth/resend-otp` | — | Issue a fresh OTP |
| `POST` | `/api/auth/verify-otp` | — | Verify OTP, returns a JWT |
| `POST` | `/api/songs/generate` | Bearer | Generate lyrics (Gemini) |
| `POST` | `/api/tts/generate` | Bearer | Generate audio (ElevenLabs), returns `audio/mpeg` |
| `GET` | `/health` | — | Health check |

## Security notes

- OTPs are random, stored only as SHA-256 hashes, expire after 5 minutes, and
  allow 5 attempts.
- Sessions use JWTs (2h expiry); the song and TTS endpoints identify the user
  from the token, never from the request body.
- The TTS endpoint only accepts lyrics of a song the authenticated user
  actually generated.
- Rate limiting, `helmet`, a CORS allowlist, request-size caps, and input
  validation (including prompt-injection guards on names) are enabled.
