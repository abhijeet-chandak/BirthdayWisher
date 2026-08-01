import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import mainImage from "../assets/Celebrations(Bg) - hashtag.png";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout hideNavbar>
      <div className="flex flex-col flex-1 items-center justify-center text-center space-y-6 max-w-lg mx-auto">
        <img
          src={mainImage}
          alt="Cadbury Celebrations — My Birthday Song"
          className="w-56 sm:w-72 h-auto object-contain drop-shadow-lg"
        />

        <h1 className="text-white text-xl sm:text-2xl font-bold leading-snug">
          A unique birthday song for everyone!
        </h1>

        <p className="text-white/80 text-sm sm:text-base">
          इस birthday, कुछ अच्छा हो जाए कुछ मीठा हो जाए
        </p>

        <button
          onClick={() => navigate("/register")}
          className="mt-4 px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold rounded-full shadow-lg text-base tracking-wide transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          GET STARTED
        </button>
      </div>
    </Layout>
  );
};

export default Landing;
