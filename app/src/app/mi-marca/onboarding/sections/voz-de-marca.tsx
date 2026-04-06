"use client";

import type { OnboardingData } from "../lib/schema";

interface Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: unknown) => void;
}

const TONO_OPTIONS = [
  "Inspirador",
  "Educativo",
  "Cercano",
  "Profesional",
  "Humor\u00edstico",
  "Provocador",
  "Emp\u00e1tico",
  "Directo",
  "Motivacional",
  "T\u00e9cnico",
  "Franco",
  "Apasionado",
  "Autoritario",
];

const sliders: {
  field: keyof OnboardingData;
  left: string;
  right: string;
}[] = [
  { field: "slider_serio_divertido", left: "Serio", right: "Divertido" },
  { field: "slider_formal_casual", left: "Formal", right: "Casual" },
  { field: "slider_respetuoso_atrevido", left: "Respetuoso", right: "Atrevido" },
  { field: "slider_racional_emocional", left: "Racional", right: "Emocional" },
];

export default function VozDeMarca({ data, onChange }: Props) {
  const toggleTono = (t: string) => {
    const current = data.tono || [];
    if (current.includes(t)) {
      onChange("tono", current.filter((x) => x !== t));
    } else if (current.length < 6) {
      onChange("tono", [...current, t]);
    }
  };

  return (
    <div className="space-y-8">
      <p className="text-sm text-clay">
        Define c&oacute;mo hablas en tu d&iacute;a a d&iacute;a. No es c&oacute;mo quieres que te perciban, sino c&oacute;mo realmente te expresas.
      </p>

      {/* Sliders */}
      <div className="space-y-6">
        <p className="text-sm font-medium text-espresso">
          Dimensiones de voz <span className="text-terra">*</span>
        </p>
        {sliders.map(({ field, left, right }) => {
          const val = data[field] as number | null;
          return (
            <div key={field}>
              <div className="flex justify-between text-xs text-clay mb-2">
                <span>{left} (0)</span>
                <span className="font-semibold text-terra text-sm">
                  {val ?? "—"}
                </span>
                <span>{right} (10)</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                className="w-full accent-terra"
                value={val ?? 5}
                onChange={(e) => onChange(field, Number(e.target.value))}
              />
            </div>
          );
        })}
      </div>

      {/* Tono chips */}
      <div>
        <p className="text-sm font-medium text-espresso mb-1">
          Caracter&iacute;sticas del tono de voz <span className="text-terra">*</span>
        </p>
        <p className="text-xs text-clay mb-3">
          Selecciona entre 3 y 6 que mejor te representen.
        </p>
        <div className="flex flex-wrap gap-2">
          {TONO_OPTIONS.map((t) => {
            const active = (data.tono || []).includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTono(t)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-terra text-white"
                    : "bg-sand text-clay hover:bg-sand/80"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-clay mt-2">
          {(data.tono || []).length}/6 seleccionadas
        </p>
      </div>
    </div>
  );
}
