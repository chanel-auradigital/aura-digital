"use client";

import { useState } from "react";
import type { OnboardingData } from "../lib/schema";

interface Props {
  data: OnboardingData;
  onChange: (field: keyof OnboardingData, value: unknown) => void;
}

const inputClass =
  "w-full rounded-md border border-sand bg-white px-3 py-2 text-espresso placeholder-clay/50 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra";

export default function OfertaIrresistible({ data, onChange }: Props) {
  const [newStep, setNewStep] = useState("");
  const [newBono, setNewBono] = useState("");

  const addStep = () => {
    const v = newStep.trim();
    if (v) {
      onChange("pasos_metodologia", [...(data.pasos_metodologia || []), v]);
      setNewStep("");
    }
  };

  const removeStep = (i: number) => {
    onChange("pasos_metodologia", (data.pasos_metodologia || []).filter((_, idx) => idx !== i));
  };

  const addBono = () => {
    const v = newBono.trim();
    if (v) {
      onChange("bonos", [...(data.bonos || []), v]);
      setNewBono("");
    }
  };

  const removeBono = (i: number) => {
    onChange("bonos", (data.bonos || []).filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-clay">
        Construye tu oferta siguiendo el esquema Causa &rarr; Enemigo &rarr; Problema &rarr; Soluci&oacute;n.
      </p>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Causa (por qu&eacute; haces lo que haces) <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="&iquest;Qu&eacute; realidad del mercado te motiv&oacute; a crear tu servicio?"
          value={data.causa}
          onChange={(e) => onChange("causa", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Enemigo (contra qu&eacute; luchas) <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="&iquest;Qu&eacute; sistema, creencia o pr&aacute;ctica combates?"
          value={data.enemigo}
          onChange={(e) => onChange("enemigo", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Problema que resuelves <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="El dolor concreto que enfrenta tu cliente..."
          value={data.problema_oferta}
          onChange={(e) => onChange("problema_oferta", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Tu soluci&oacute;n <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="&iquest;C&oacute;mo resuelves ese problema de forma &uacute;nica?"
          value={data.solucion_oferta}
          onChange={(e) => onChange("solucion_oferta", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Escenario ideal del cliente despu&eacute;s <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="Describe c&oacute;mo ser&aacute; la vida de tu cliente tras tu programa..."
          value={data.escenario_ideal}
          onChange={(e) => onChange("escenario_ideal", e.target.value)}
        />
      </div>

      {/* Pasos de metodología */}
      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Pasos de tu metodolog&iacute;a <span className="text-terra">*</span>
        </label>
        {(data.pasos_metodologia || []).length > 0 && (
          <ol className="space-y-2 mb-3">
            {(data.pasos_metodologia || []).map((step, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm bg-sand rounded-md px-3 py-2"
              >
                <span className="text-terra font-semibold">{i + 1}.</span>
                <span className="flex-1 text-espresso">{step}</span>
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="text-clay hover:text-terra"
                >
                  &times;
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            className={inputClass}
            placeholder="Nombre del paso..."
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addStep();
              }
            }}
          />
          <button
            type="button"
            onClick={addStep}
            className="shrink-0 px-3 py-2 bg-terra text-white rounded-md text-sm hover:bg-terra/90 transition-colors"
          >
            A&ntilde;adir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-espresso mb-1">
            Nombre del programa <span className="text-terra">*</span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder='Ej: "Digital Next Level"'
            value={data.nombre_programa}
            onChange={(e) => onChange("nombre_programa", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-espresso mb-1">
            Duraci&oacute;n <span className="text-terra">*</span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ej: 90 d&iacute;as, 12 semanas"
            value={data.duracion}
            onChange={(e) => onChange("duracion", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Formato <span className="text-terra">*</span>
        </label>
        <div className="flex flex-wrap gap-3 mt-1">
          {["1:1", "Grupal", "Mixto", "Curso grabado"].map((f) => (
            <label key={f} className="flex items-center gap-1.5 text-sm text-clay cursor-pointer">
              <input
                type="radio"
                name="formato"
                className="accent-terra"
                checked={data.formato === f}
                onChange={() => onChange("formato", f)}
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">
          Diferenciaci&oacute;n <span className="text-terra">*</span>
        </label>
        <textarea
          className={inputClass + " min-h-[80px]"}
          placeholder="&iquest;Qu&eacute; hace tu oferta diferente a todo lo dem&aacute;s?"
          value={data.diferenciacion}
          onChange={(e) => onChange("diferenciacion", e.target.value)}
        />
      </div>

      {/* Bonos */}
      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Bonos incluidos</label>
        {(data.bonos || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.bonos || []).map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sand text-sm text-espresso"
              >
                {b}
                <button type="button" onClick={() => removeBono(i)} className="text-clay hover:text-terra">
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            className={inputClass}
            placeholder="Nombre del bono..."
            value={newBono}
            onChange={(e) => setNewBono(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBono();
              }
            }}
          />
          <button
            type="button"
            onClick={addBono}
            className="shrink-0 px-3 py-2 bg-terra text-white rounded-md text-sm hover:bg-terra/90 transition-colors"
          >
            A&ntilde;adir
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-espresso mb-1">Precio</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Ej: $4,500 USD"
          value={data.precio}
          onChange={(e) => onChange("precio", e.target.value)}
        />
      </div>
    </div>
  );
}
