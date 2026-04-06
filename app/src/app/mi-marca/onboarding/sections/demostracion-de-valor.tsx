"use client";

import type { OnboardingData } from "../lib/schema";

interface Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: unknown) => void;
}

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-espresso placeholder-clay/50 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra";

const LEAD_MAGNET_TYPES = [
  "PDF / E-book",
  "Mini-curso",
  "Webinar",
  "Quiz / Test",
  "Plantilla",
  "Otro",
];

export default function DemostracionDeValor({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-clay">
        Tu lead magnet es el recurso gratuito que ofreces para atraer clientes potenciales y demostrar tu valor.
      </p>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Tipo de lead magnet <span className="text-terra">*</span>
        </label>
        <select
          className={inputClass}
          value={data.tipo_lead_magnet}
          onChange={(e) => onChange("tipo_lead_magnet", e.target.value)}
        >
          <option value="">Selecciona una opci&oacute;n...</option>
          {LEAD_MAGNET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Destino del lead magnet <span className="text-terra">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="Ej: Landing page, WhatsApp, Calendly..."
          value={data.destino}
          onChange={(e) => onChange("destino", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Descripci&oacute;n de tu herramienta de evaluaci&oacute;n
        </label>
        <textarea
          className={inputClass + " min-h-[120px]"}
          placeholder="Si tienes un test, quiz o evaluaci&oacute;n, descr&iacute;belo aqu&iacute;: preguntas clave, perfiles de resultado, CTA..."
          value={data.descripcion_herramienta}
          onChange={(e) => onChange("descripcion_herramienta", e.target.value)}
        />
      </div>
    </div>
  );
}
