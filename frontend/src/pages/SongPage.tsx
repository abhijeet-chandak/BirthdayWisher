import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import { apiPostForAudio } from "../utils/api";
import { isLoggedIn, getSong } from "../utils/session";

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongPage: FC = () => {
  const navigate = useNavigate();
  const song = getSong();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copied, setCopied] = useState(false);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const generateAudio = useCallback(async () => {
    if (!song) return;
    setIsLoading(true);
    setError("");
    setIsPlaying(false);
    setProgress(0);
    cleanupAudio();

    try {
      const url = await apiPostForAudio("/api/tts/generate", {
        text: song.lyrics,
        voice: song.singerVoice,
      });
      urlRef.current = url;

      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
      audio.ontimeupdate = () => setProgress(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audioRef.current = audio;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio");
    } finally {
      setIsLoading(false);
    }
  }, [song, cleanupAudio]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/register");
      return;
    }
    if (!song) {
      navigate("/song-selection");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (song) generateAudio();
    return cleanupAudio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => toast.error("Could not play audio"));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setProgress(t);
  };

  const handleCopy = async () => {
    if (!song) return;
    try {
      await navigator.clipboard.writeText(song.lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy lyrics");
    }
  };

  if (!song) return null;

  return (
    <Layout step={4}>
      <h2 className="text-white text-xl sm:text-2xl font-semibold mt-6 text-center">
        {song.recipientName}&apos;s song is ready!
      </h2>
      <p className="text-white/70 text-sm mt-1 capitalize">
        {song.mood} &middot; {song.genre} &middot; {song.singerVoice} voice
      </p>

      <div className="w-full max-w-md mt-6 bg-white/95 rounded-2xl p-5 max-h-72 sm:max-h-80 overflow-y-auto text-gray-900 shadow-lg relative">
        <button
          onClick={handleCopy}
          className="sticky top-0 float-right text-xs font-semibold text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-md px-2.5 py-1.5 transition"
          aria-label="Copy lyrics"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <p className="whitespace-pre-line text-sm leading-relaxed clear-none">
          {song.lyrics}
        </p>
      </div>

      <div className="w-full max-w-md mt-6 space-y-4">
        {error ? (
          <div className="bg-red-100/95 text-red-800 rounded-xl p-4 text-sm text-center">
            <p>{error}</p>
            <button
              onClick={generateAudio}
              className="mt-2 font-bold underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {!isLoading && duration > 0 && (
              <div className="flex items-center gap-3 text-white/90 text-xs">
                <span className="w-9 text-right tabular-nums">
                  {formatTime(progress)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={progress}
                  onChange={handleSeek}
                  aria-label="Seek"
                  className="flex-1 h-1.5 accent-yellow-400 cursor-pointer"
                />
                <span className="w-9 tabular-nums">{formatTime(duration)}</span>
              </div>
            )}

            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] py-4 rounded-xl font-bold text-purple-900 text-lg shadow-md transition disabled:opacity-60"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-purple-900 border-t-transparent rounded-full animate-spin" />
                  Preparing your song...
                </span>
              ) : isPlaying ? (
                "Pause"
              ) : (
                "Play Song"
              )}
            </button>

            {!isLoading && urlRef.current && (
              <a
                href={urlRef.current}
                download={`birthday-song-${song.recipientName}.mp3`}
                className="block text-center text-yellow-300 text-sm font-semibold hover:underline"
              >
                Download audio
              </a>
            )}
          </>
        )}

        <button
          onClick={() => navigate("/birthday-details")}
          className="w-full py-3 rounded-xl font-semibold text-white border border-white/40 hover:bg-white/10 transition"
        >
          Create another song
        </button>
      </div>
    </Layout>
  );
};

export default SongPage;
