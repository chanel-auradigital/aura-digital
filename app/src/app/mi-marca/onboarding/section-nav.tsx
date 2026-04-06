"use client";

import {
  SECTION_ORDER,
  SECTION_LABELS,
  type SectionKey,
  type CompletedSections,
} from "./lib/schema";

interface Props {
  activeSection: SectionKey;
  completedSections: CompletedSections;
  onSelect: (section: SectionKey) => void;
}

export default function SectionNav({ activeSection, completedSections, onSelect }: Props) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav className="hidden md:block w-56 shrink-0">
        <ul className="space-y-1">
          {SECTION_ORDER.map((key, i) => {
            const active = activeSection === key;
            const done = completedSections[key];
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2.5 ${
                    active
                      ? "bg-terra/10 text-terra border-l-3 border-terra font-medium"
                      : "text-clay hover:bg-sand/50"
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      done
                        ? "bg-terra text-white"
                        : active
                        ? "bg-terra/20 text-terra"
                        : "bg-sand text-clay"
                    }`}
                  >
                    {done ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {SECTION_LABELS[key]}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: horizontal scrollable tabs */}
      <nav className="md:hidden -mx-6 px-6 overflow-x-auto mb-6">
        <div className="flex gap-2 min-w-max">
          {SECTION_ORDER.map((key, i) => {
            const active = activeSection === key;
            const done = completedSections[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap transition-colors ${
                  active
                    ? "bg-terra text-white"
                    : done
                    ? "bg-terra/10 text-terra"
                    : "bg-sand text-clay"
                }`}
              >
                {done && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
                {!done && <span className="font-bold">{i + 1}</span>}
                {SECTION_LABELS[key]}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
