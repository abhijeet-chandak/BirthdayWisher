import React from "react";

import logoImage from "../assets/Cadbury Logo.png";
import hashtagImage from "../assets/2d logo.png";
import menuIcon from "../assets/Hamburger.png";

type NavbarProps = {
  onMenuClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="relative z-20 w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-purple-950/60 backdrop-blur-sm">
      <img src={logoImage} alt="Cadbury" className="h-7 sm:h-8 object-contain" />
      <img
        src={hashtagImage}
        alt="My Birthday Song"
        className="h-7 sm:h-8 object-contain"
      />
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      >
        <img src={menuIcon} alt="" className="h-6 w-6" />
      </button>
    </nav>
  );
};

export default Navbar;
