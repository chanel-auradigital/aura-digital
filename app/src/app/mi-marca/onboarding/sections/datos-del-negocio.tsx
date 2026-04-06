"use client";

import type { OnboardingData } from "../lib/schema";

interface Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: unknown) => void;
}

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-espresso placeholder-clay/50 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra";

export default function DatosDelNegocio({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Nombre del negocio / marca <span className="text-terra">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Ej: Digital Next Level"
          value={data.nombre_negocio}
          onChange={(e) => onChange("nombre_negocio", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Nicho <span className="text-terra">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Ej: Terapeutas hol&iacute;sticos, coaching emocional..."
          value={data.nicho}
          onChange={(e) => onChange("nicho", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          A&ntilde;os de experiencia <span className="text-terra">*</span>
        </label>
        <input
          type="number"
          min={0}
          className={inputClass}
          placeholder="Ej: 5"
          value={data.anos_experiencia ?? ""}
          onChange={(e) =>
            onChange(
              "anos_experiencia",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Presencia digital actual
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="Describe brevemente tu situaci&oacute;n actual en redes y web..."
          value={data.presencia_digital_actual}
          onChange={(e) => onChange("presencia_digital_actual", e.target.value)}
        />
      </div>

      <p className="text-sm font-medium text-espresso pt-2">Redes sociales</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {([
          ["instagram", "Instagram", "@usuario"],
          ["tiktok", "TikTok", "@usuario"],
          ["facebook", "Facebook", "URL o nombre de p\u00e1gina"],
          ["linkedin", "LinkedIn", "URL del perfil"],
          ["youtube", "YouTube", "URL del canal"],
        ] as const).map(([field, label, placeholder]) => (
          <div key={field}>
            <label className="block text-xs text-clay mb-1">{label}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={placeholder}
              value={data[field]}
              onChange={(e) => onChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Sitio web
        </label>
        <input
          type="url"
          className={inputClass}
          placeholder="https://..."
          value={data.sitio_web}
          onChange={(e) => onChange("sitio_web", e.target.value)}
        />
      </div>
    </div>
  );
}
