import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import giftImage from "../assets/Asset 1.png";
import partyHatImage from "../assets/Cap&Gift.png";
import balloonImage from "../assets/Balloon.png";
import { isLoggedIn, saveDetails, getDetails } from "../utils/session";

const fieldClass =
  "w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400";

const BirthdayDetails: FC = () => {
  const navigate = useNavigate();
  const saved = getDetails();

  const [recipientName, setRecipientName] = useState(saved?.recipientName ?? "");
  const [recipientAge, setRecipientAge] = useState<number>(
    saved?.recipientAge ?? 1
  );
  const [recipientGender, setRecipientGender] = useState(
    saved?.recipientGender ?? "Male"
  );

  useEffect(() => {
    if (!isLoggedIn()) {
      toast.error("Please register first.");
      navigate("/register");
    }
  }, [navigate]);

  const handleProceed = () => {
    const name = recipientName.trim();
    if (!name) {
      toast.error("Please enter the recipient's name");
      return;
    }
    if (!/^[\p{L}][\p{L} .'-]{0,39}$/u.test(name)) {
      toast.error("Name can only contain letters and spaces (max 40)");
      return;
    }

    saveDetails({ recipientName: name, recipientAge, recipientGender });
    navigate("/song-selection");
  };

  return (
    <Layout step={2}>
      <h2 className="text-white text-xl sm:text-2xl font-semibold mt-6 text-center">
        Tell us about your loved one...
      </h2>

      <div className="flex justify-center items-end gap-4 sm:gap-6 mt-6">
        <img src={giftImage} alt="" className="h-16 sm:h-24 w-auto" />
        <img src={partyHatImage} alt="" className="h-16 sm:h-24 w-auto" />
        <img src={balloonImage} alt="" className="h-16 sm:h-24 w-auto" />
      </div>

      <div className="w-full max-w-sm mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="recipientName" className="text-white block mb-2">
            Their name
          </label>
          <input
            id="recipientName"
            type="text"
            placeholder="Enter Their Name"
            maxLength={40}
            className={fieldClass}
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="recipientAge" className="text-white block mb-2">
            How old they&apos;ll be this birthday
          </label>
          <select
            id="recipientAge"
            className={fieldClass}
            value={recipientAge}
            onChange={(e) => setRecipientAge(Number(e.target.value))}
          >
            {Array.from({ length: 100 }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} Years
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recipientGender" className="text-white block mb-2">
            Gender
          </label>
          <select
            id="recipientGender"
            className={fieldClass}
            value={recipientGender}
            onChange={(e) => setRecipientGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="w-full flex justify-center mt-10">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] px-12 py-3 rounded-lg font-bold text-purple-900 shadow-md transition"
          onClick={handleProceed}
        >
          Proceed
        </button>
      </div>
    </Layout>
  );
};

export default BirthdayDetails;
