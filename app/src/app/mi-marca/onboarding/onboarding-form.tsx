"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import SectionNav from "./section-nav";
import DatosDelNegocio from "./sections/datos-del-negocio";
import VozDeMarca from "./sections/voz-de-marca";
import ClienteIdeal from "./sections/cliente-ideal";
import OfertaIrresistible from "./sections/oferta-irresistible";
import DemostracionDeValor from "./sections/demostracion-de-valor";
import Competencia from "./sections/competencia";
import { saveOnboardingDraft, completeOnboarding } from "./lib/actions";
import {
  type OnboardingData,
  type SectionKey,
  type CompletedSections,
  SECTION_ORDER,
  SECTION_LABELS,
  EMPTY_DATA,
  computeCompletedSections,
  isAllComplete,
} from "./lib/schema";

interface Props {
  clientId: string;
  initialData: OnboardingData;
  initialCompletedSections: CompletedSections;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function OnboardingForm({
  clientId,
  initialData,
  initialCompletedSections,
}: Props) {
  const [data, setData] = useState<OnboardingData>(() => ({
    ...EMPTY_DATA,
    ...initialData,
  }));
  const [completedSections, setCompletedSections] = useState<CompletedSections>(
    initialCompletedSections
  );
  const [activeSection, setActiveSection] = useState<SectionKey>("datos_del_negocio");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPending, startTransition] = useTransition();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const hasChanges = useRef(false);

  const doSave = useCallback(
    async (d: OnboardingData) => {
      setSaveStatus("saving");
      const result = await saveOnboardingDraft(clientId, d);
      if (result.ok) {
        setCompletedSections(result.completedSections);
        setSaveStatus("saved");
        hasChanges.current = false;
      } else {
        setSaveStatus("error");
      }
    },
    [clientId]
  );

  const scheduleAutoSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    hasChanges.current = true;
    timerRef.current = setTimeout(() => {
      doSave(dataRef.current);
    }, 1500);
  }, [doSave]);

  // Save on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasChanges.current) {
        navigator.sendBeacon?.(
          "/api/onboarding-save",
          JSON.stringify({ clientId, data: dataRef.current })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hasChanges.current) {
        doSave(dataRef.current);
      }
    };
  }, [clientId, doSave]);

  const onChange = useCallback(
    (field: keyof OnboardingData, value: unknown) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        setCompletedSections(computeCompletedSections(next));
        return next;
      });
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const handleComplete = () => {
    startTransition(async () => {
      if (hasChanges.current) {
        await doSave(dataRef.current);
      }
      await completeOnboarding(clientId);
    });
  };

  const allDone = isAllComplete(completedSections);

  // Navigate between sections
  const currentIdx = SECTION_ORDER.indexOf(activeSection);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < SECTION_ORDER.length - 1;

  const sectionProps = { data, onChange };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <SectionNav
        activeSection={activeSection}
        completedSections={completedSections}
        onSelect={setActiveSection}
      />

      <div className="flex-1 min-w-0">
        {/* Section title + save status */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-espresso">
            {SECTION_LABELS[activeSection]}
          </h2>
          <span
            className={`text-xs px-2 py-1 rounded transition-colors ${
              saveStatus === "saving"
                ? "text-clay bg-sand"
                : saveStatus === "saved"
                ? "text-terra bg-terra/10"
                : saveStatus === "error"
                ? "text-red-600 bg-red-50"
                : "text-transparent"
            }`}
          >
            {saveStatus === "saving"
              ? "Guardando..."
              : saveStatus === "saved"
              ? "Guardado"
              : saveStatus === "error"
              ? "Error al guardar"
              : "\u00a0"}
          </span>
        </div>

        {/* Active section */}
        {activeSection === "datos_del_negocio" && <DatosDelNegocio {...sectionProps} />}
        {activeSection === "voz_de_marca" && <VozDeMarca {...sectionProps} />}
        {activeSection === "cliente_ideal" && <ClienteIdeal {...sectionProps} />}
        {activeSection === "oferta_irresistible" && <OfertaIrresistible {...sectionProps} />}
        {activeSection === "demostracion_de_valor" && <DemostracionDeValor {...sectionProps} />}
        {activeSection === "competencia" && <Competencia {...sectionProps} />}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-sand">
          <button
            type="button"
            onClick={() => canPrev && setActiveSection(SECTION_ORDER[currentIdx - 1])}
            disabled={!canPrev}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              canPrev
                ? "text-clay hover:text-espresso border border-sand hover:border-clay"
                : "text-clay/30 border border-sand/30 cursor-not-allowed"
            }`}
          >
            &larr; Anterior
          </button>

          {canNext ? (
            <button
              type="button"
              onClick={() => setActiveSection(SECTION_ORDER[currentIdx + 1])}
              className="px-4 py-2 bg-terra text-white rounded-md text-sm hover:bg-terra/90 transition-colors"
            >
              Siguiente &rarr;
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!allDone || isPending}
              className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                allDone && !isPending
                  ? "bg-terra text-white hover:bg-espresso"
                  : "bg-sand text-clay/50 cursor-not-allowed"
              }`}
            >
              {isPending ? "Guardando..." : "Completar Onboarding"}
            </button>
          )}
        </div>

        {/* Completion progress */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs text-clay">
            <span>Progreso:</span>
            <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
              <div
                className="h-full bg-terra rounded-full transition-all duration-300"
                style={{
                  width: `${(SECTION_ORDER.filter((k) => completedSections[k]).length / SECTION_ORDER.length) * 100}%`,
                }}
              />
            </div>
            <span>
              {SECTION_ORDER.filter((k) => completedSections[k]).length}/{SECTION_ORDER.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
