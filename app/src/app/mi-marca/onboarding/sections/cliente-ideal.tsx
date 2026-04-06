"use client";

import { useState } from "react";
import type { OnboardingData } from "../lib/schema";

interface Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: unknown) => void;
}

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-espresso placeholder-clay/50 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra";

const COMM_OPTIONS = ["Email", "WhatsApp", "Instagram DM", "Llamada", "Zoom", "Presencial"];

function ChipInput({
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");

  const add = () => {
    const trimmed = val.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setVal("");
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          className={inputClass}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 px-3 py-2 bg-terra text-white rounded-md text-sm hover:bg-terra/90 transition-colors"
        >
          A&ntilde;adir
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sand text-sm text-espresso"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-clay hover:text-terra"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClienteIdeal({ data, onChange }: Props) {
  const addToArray = (field: keyof OnboardingData, v: string) => {
    const arr = (data[field] as string[]) || [];
    onChange(field, [...arr, v]);
  };
  const removeFromArray = (field: keyof OnboardingData, i: number) => {
    const arr = (data[field] as string[]) || [];
    onChange(field, arr.filter((_, idx) => idx !== i));
  };

  const toggleComm = (c: string) => {
    const current = data.preferencias_comunicacion || [];
    if (current.includes(c)) {
      onChange("preferencias_comunicacion", current.filter((x) => x !== c));
    } else {
      onChange("preferencias_comunicacion", [...current, c]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Problema principal de tu cliente ideal <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[100px]"}
          placeholder="Describe el problema central que resuelves..."
          value={data.problema_principal}
          onChange={(e) => onChange("problema_principal", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Soluci&oacute;n que proporcionas <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[100px]"}
          placeholder="&iquest;C&oacute;mo ayudas a resolver ese problema?"
          value={data.solucion}
          onChange={(e) => onChange("solucion", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-espresso mb-1">
            Rango de edad <span className="text-terra">*</span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ej: 25-45"
            value={data.rango_edad}
            onChange={(e) => onChange("rango_edad", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-espresso mb-1">
            Ubicaci&oacute;n <span className="text-terra">*</span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ej: M&eacute;xico, Espa&ntilde;a, Chile"
            value={data.ubicacion}
            onChange={(e) => onChange("ubicacion", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-espresso mb-1">
            G&eacute;nero <span className="text-terra">*</span>
          </label>
          <div className="flex gap-3 mt-2">
            {["Femenino", "Masculino", "Ambos"].map((g) => (
              <label key={g} className="flex items-center gap-1.5 text-sm text-clay cursor-pointer">
                <input
                  type="radio"
                  name="genero"
                  className="accent-terra"
                  checked={data.genero === g}
                  onChange={() => onChange("genero", g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Intereses y actividades</label>
        <ChipInput
          items={data.intereses || []}
          onAdd={(v) => addToArray("intereses", v)}
          onRemove={(i) => removeFromArray("intereses", i)}
          placeholder="A&ntilde;ade un inter&eacute;s y pulsa Enter"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Objeciones comunes</label>
        <ChipInput
          items={data.objeciones || []}
          onAdd={(v) => addToArray("objeciones", v)}
          onRemove={(i) => removeFromArray("objeciones", i)}
          placeholder='Ej: "Es muy caro", "No tengo tiempo"'
        />
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        {([
          { field: "poder_adquisitivo" as const, label: "Poder adquisitivo" },
          { field: "nivel_conocimiento" as const, label: "Conocimiento en marketing/negocio" },
          { field: "digitalizacion" as const, label: "Nivel de digitalizaci\u00f3n" },
        ]).map(({ field, label }) => (
          <div key={field}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-espresso">
                {label} <span className="text-terra">*</span>
              </span>
              <span className="text-terra font-semibold">
                {(data[field] as number | null) ?? "—"}/10
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              className="w-full accent-terra"
              value={(data[field] as number | null) ?? 5}
              onChange={(e) => onChange(field, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Frustraciones y desaf&iacute;os</label>
        <ChipInput
          items={data.frustraciones || []}
          onAdd={(v) => addToArray("frustraciones", v)}
          onRemove={(i) => removeFromArray("frustraciones", i)}
          placeholder="A&ntilde;ade una frustraci&oacute;n"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Esperanzas, sue&ntilde;os y deseos</label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="&iquest;Qu&eacute; sue&ntilde;a tu cliente ideal?"
          value={data.esperanzas_suenos}
          onChange={(e) => onChange("esperanzas_suenos", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Miedos principales</label>
        <ChipInput
          items={data.miedos || []}
          onAdd={(v) => addToArray("miedos", v)}
          onRemove={(i) => removeFromArray("miedos", i)}
          placeholder="A&ntilde;ade un miedo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Preferencias de comunicaci&oacute;n</label>
        <div className="flex flex-wrap gap-2">
          {COMM_OPTIONS.map((c) => {
            const active = (data.preferencias_comunicacion || []).includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleComm(c)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  active ? "bg-terra text-white" : "bg-sand text-clay hover:bg-sand/80"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          3 puntos de vista sobre tu nicho
        </label>
        <textarea
          className={inputClass + " min-h-[120px]"}
          placeholder="Describe 3 opiniones o perspectivas fuertes que tienes sobre tu industria..."
          value={data.puntos_de_vista}
          onChange={(e) => onChange("puntos_de_vista", e.target.value)}
        />
      </div>
    </div>
  );
}
