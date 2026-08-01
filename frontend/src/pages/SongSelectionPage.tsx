import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import CategorySelector, {
  CategoryOption,
} from "../components/CategorySelector";
import { apiPost } from "../utils/api";
import { isLoggedIn, getDetails, saveSong, Song } from "../utils/session";

import happyIcon from "../assets/Icons/Happy.png";
import romanticIcon from "../assets/Icons/Romantic.png";
import funnyIcon from "../assets/Icons/Funny.png";
import motivationalIcon from "../assets/Icons/Motivational.png";
import calmIcon from "../assets/Icons/Calm.png";
import rapIcon from "../assets/Icons/Rap.png";
import rockIcon from "../assets/Icons/Rock.png";
import popIcon from "../assets/Icons/Pop.png";
import desiIcon from "../assets/Icons/Desi.png";
import edmIcon from "../assets/Icons/EDM.png";
import maleIcon from "../assets/Icons/Male.png";
import femaleIcon from "../assets/Icons/Female.png";

const MOODS: CategoryOption[] = [
  { label: "Happy", icon: happyIcon },
  { label: "Romantic", icon: romanticIcon },
  { label: "Funny", icon: funnyIcon },
  { label: "Motivational", icon: motivationalIcon },
  { label: "Calm", icon: calmIcon },
];

const GENRES: CategoryOption[] = [
  { label: "Rap", icon: rapIcon },
  { label: "Rock", icon: rockIcon },
  { label: "Pop", icon: popIcon },
  { label: "Desi", icon: desiIcon },
  { label: "EDM", icon: edmIcon },
];

const SINGERS: CategoryOption[] = [
  { label: "Male Voice", icon: maleIcon },
  { label: "Female Voice", icon: femaleIcon },
];

const SongSelectionPage: FC = () => {
  const navigate = useNavigate();
  const details = getDetails();

  const [selectedMood, setSelectedMood] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSinger, setSelectedSinger] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      toast.error("Please register first.");
      navigate("/register");
      return;
    }
    if (!details) {
      toast.error("Please fill the birthday form first.");
      navigate("/birthday-details");
    }
  }, [details, navigate]);

  const handleProceed = async () => {
    if (!details) return;
    if (!selectedMood || !selectedGenre || !selectedSinger) {
      toast.error("Please select Mood, Genre, and Singer's Voice");
      return;
    }

    setLoading(true);
    try {
      const { ok, status, body } = await apiPost(
        "/api/songs/generate",
        {
          recipientName: details.recipientName,
          recipientAge: details.recipientAge,
          recipientGender: details.recipientGender.toLowerCase(),
          mood: selectedMood.toLowerCase(),
          genre: selectedGenre.toLowerCase(),
          singerVoice: selectedSinger.replace(" Voice", "").toLowerCase(),
        },
        true
      );

      if (ok && body.success && body.song) {
        saveSong(body.song as Song);
        toast.success("Song generated successfully!");
        navigate("/song");
      } else if (status === 401) {
        toast.error("Session expired. Please register again.");
        navigate("/register");
      } else {
        toast.error(body.message || "Failed to generate song.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout step={3}>
      <h2 className="text-white text-xl sm:text-2xl font-semibold mt-6 text-center max-w-md">
        What would you like their song&apos;s vibe to be?
      </h2>

      <div className="w-full flex flex-col gap-6 mt-8 max-w-xl">
        <CategorySelector
          title="Mood"
          options={MOODS}
          selected={selectedMood}
          onSelect={setSelectedMood}
        />
        <CategorySelector
          title="Genre"
          options={GENRES}
          selected={selectedGenre}
          onSelect={setSelectedGenre}
        />
        <CategorySelector
          title="Singer's Voice"
          options={SINGERS}
          selected={selectedSinger}
          onSelect={setSelectedSinger}
        />

        <div className="w-full flex justify-center mt-2">
          <button
            onClick={handleProceed}
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] px-12 py-3 rounded-lg font-bold text-purple-900 shadow-md transition disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-900 border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Proceed"
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SongSelectionPage;
