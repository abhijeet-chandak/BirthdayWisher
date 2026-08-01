import React from "react";

const STEPS = ["Register", "Details", "Vibe", "Song"];

type ProgressBarProps = {
  /** 1-based index of the current step. */
  current: number;
};

/** Responsive step indicator (replaces the fixed-size PNG progress bars). */
const ProgressBar: React.FC<ProgressBarProps> = ({ current }) => {
  return (
    <ol
      className="flex items-center justify-center gap-0 w-full max-w-md mx-auto px-6 mt-5"
      aria-label={`Step ${current} of ${STEPS.length}`}
    >
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                  done || active
                    ? "bg-yellow-400 text-purple-900"
                    : "bg-white/25 text-white/70"
                } ${active ? "ring-2 ring-yellow-300 ring-offset-2 ring-offset-transparent" : ""}`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : step}
              </span>
              <span
                className={`mt-1 text-[10px] sm:text-xs font-medium ${
                  done || active ? "text-yellow-300" : "text-white/60"
                }`}
              >
                {label}
              </span>
            </div>
            {step < STEPS.length && (
              <span
                aria-hidden
                className={`flex-1 h-0.5 mx-1 sm:mx-2 -mt-4 rounded ${
                  done ? "bg-yellow-400" : "bg-white/25"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default ProgressBar;
