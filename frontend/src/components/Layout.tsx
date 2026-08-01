import React from "react";
import bgImage from "../assets/BG.jpg";
import Navbar from "./Navbar";
import ProgressBar from "./ProgressBar";

type LayoutProps = {
  /** 1-based flow step; omit to hide the progress bar (e.g. landing page). */
  step?: number;
  /** Hide the navbar (landing page). */
  hideNavbar?: boolean;
  children: React.ReactNode;
};

/** Shared page shell: background, readability overlay, navbar, progress. */
const Layout: React.FC<LayoutProps> = ({ step, hideNavbar, children }) => {
  return (
    <div
      className="relative min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-purple-900/70 to-purple-950/85 pointer-events-none"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col flex-1">
        {!hideNavbar && <Navbar />}
        {step !== undefined && <ProgressBar current={step} />}
        <main className="flex flex-col flex-1 items-center w-full px-4 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
