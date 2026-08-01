import React from "react";

export type CategoryOption = {
  label: string;
  /** Image src for the option icon. */
  icon: string;
};

type CategorySelectorProps = {
  title: string;
  options: CategoryOption[];
  onSelect: (value: string) => void;
  selected?: string;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  title,
  options,
  onSelect,
  selected,
}) => {
  return (
    <section className="bg-purple-950/70 border border-white/10 rounded-2xl overflow-hidden w-full max-w-xl mx-auto shadow-lg">
      <h3 className="bg-yellow-400 text-purple-950 font-bold text-base sm:text-lg py-2 text-center">
        {title}
      </h3>

      <div
        className="grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-5 py-5 px-3 sm:px-4"
        role="radiogroup"
        aria-label={title}
      >
        {options.map((option) => {
          const isSelected = selected === option.label;
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.label)}
              className={`flex flex-col items-center gap-2 rounded-xl py-1 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                isSelected ? "scale-105" : "hover:scale-105"
              }`}
            >
              <span
                className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                  isSelected
                    ? "bg-yellow-400 ring-4 ring-yellow-300/60"
                    : "bg-white"
                }`}
              >
                <img
                  src={option.icon}
                  alt=""
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                />
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  isSelected ? "text-yellow-300" : "text-white/90"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySelector;
