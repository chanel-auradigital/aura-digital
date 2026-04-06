"use client";

import Link from "next/link";

interface StepCardsProps {
  onboardingDone: boolean;
  briefingDone: boolean;
}

const steps = [
  {
    number: 1,
    title: "Onboarding",
    description: "Datos b\u00e1sicos de tu negocio, accesos y objetivos iniciales para comenzar a trabajar juntos.",
    href: "/mi-marca/onboarding",
    key: "onboarding",
  },
  {
    number: 2,
    title: "Briefing",
    description: "Definimos tu p\u00fablico ideal, referencias visuales, competencia y la visi\u00f3n de tu marca.",
    href: "/mi-marca/briefing",
    key: "briefing",
  },
  {
    number: 3,
    title: "Branding",
    description: "Identidad visual completa: logo, colores, tipograf\u00eda, tono de voz y estilo.",
    href: "/mi-marca/branding",
    key: "branding",
  },
];

export default function StepCards({ onboardingDone, briefingDone }: StepCardsProps) {
  function isUnlocked(key: string): boolean {
    if (key === "onboarding") return true;
    if (key === "briefing") return onboardingDone;
    if (key === "branding") return onboardingDone && briefingDone;
    return false;
  }

  function isDone(key: string): boolean {
    if (key === "onboarding") return onboardingDone;
    if (key === "briefing") return briefingDone;
    return false;
  }

  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const unlocked = isUnlocked(step.key);
        const done = isDone(step.key);

        const content = (
          <div className="flex items-center gap-5">
            {/* Step number / status */}
            <div
              className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                done
                  ? "bg-terra text-white"
                  : unlocked
                  ? "bg-terra/10 text-terra border-2 border-terra"
                  : "bg-sand/60 text-clay/50 border-2 border-sand"
              }`}
            >
              {done ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                step.number
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-lg font-semibold ${
                    unlocked ? "text-espresso" : "text-clay/50"
                  }`}
                >
                  {step.title}
                </h2>
                {done && (
                  <span className="text-xs font-medium text-terra bg-terra/10 px-2 py-0.5 rounded">
                    Completado
                  </span>
                )}
                {!unlocked && (
                  <svg className="w-4 h-4 text-clay/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                )}
              </div>
              <p className={`text-sm mt-0.5 ${unlocked ? "text-clay" : "text-clay/40"}`}>
                {step.description}
              </p>
            </div>

            {/* Arrow */}
            {unlocked && (
              <svg className="w-5 h-5 text-clay shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </div>
        );

        // Connector line between steps
        const connector = i < steps.length - 1 && (
          <div className="ml-[21px] h-4 border-l-2 border-dashed border-sand" />
        );

        if (unlocked) {
          return (
            <div key={step.key}>
              <Link
                href={step.href}
                className="block rounded-lg border border-sand bg-white p-5 hover:border-terra hover:shadow-md transition-all"
              >
                {content}
              </Link>
              {connector}
            </div>
          );
        }

        return (
          <div key={step.key}>
            <div className="rounded-lg border border-sand/50 bg-white/50 p-5 cursor-not-allowed">
              {content}
            </div>
            {connector}
          </div>
        );
      })}
    </div>
  );
}
