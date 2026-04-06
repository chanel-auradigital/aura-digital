"use client";

import type { OnboardingData, Competitor } from "../lib/schema";

interface Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: unknown) => void;
}

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-espresso placeholder-clay/50 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra";

export default function Competencia({ data, onChange }: Props) {
  const competitors = data.competidores || [];

  const updateCompetitor = (i: number, field: keyof Competitor, value: string) => {
    const updated = [...competitors];
    updated[i] = { ...updated[i], [field]: value };
    onChange("competidores", updated);
  };

  const addCompetitor = () => {
    if (competitors.length < 8) {
      onChange("competidores", [...competitors, { nombre: "", handle: "" }]);
    }
  };

  const removeCompetitor = (i: number) => {
    onChange("competidores", competitors.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-clay">
        Identifica a tus competidores directos para diferenciarte y posicionarte mejor.
      </p>

      {/* Competitor repeater */}
      <div>
        <label className="block text-sm font-medium text-espresso mb-3">
          Competidores <span className="text-terra">*</span>
          <span className="text-xs text-clay font-normal ml-2">
            ({competitors.length}/8)
          </span>
        </label>

        <div className="space-y-3">
          {competitors.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-cloud rounded-lg"
            >
              <span className="text-sm text-terra font-semibold mt-2 shrink-0">
                {i + 1}.
              </span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Nombre"
                  value={c.nombre}
                  onChange={(e) => updateCompetitor(i, "nombre", e.target.value)}
                />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="@handle de Instagram"
                  value={c.handle}
                  onChange={(e) => updateCompetitor(i, "handle", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCompetitor(i)}
                className="text-clay hover:text-terra mt-2 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {competitors.length < 8 && (
          <button
            type="button"
            onClick={addCompetitor}
            className="mt-3 px-4 py-2 border border-dashed border-clay/30 rounded-lg text-sm text-clay hover:border-terra hover:text-terra transition-colors w-full"
          >
            + A&ntilde;adir competidor
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Ventaja competitiva <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[100px]"}
          placeholder="&iquest;Qu&eacute; te diferencia de todos ellos? &iquest;Por qu&eacute; un cliente te elegir&iacute;a a ti?"
          value={data.ventaja_competitiva}
          onChange={(e) => onChange("ventaja_competitiva", e.target.value)}
        />
      </div>
    </div>
  );
}
