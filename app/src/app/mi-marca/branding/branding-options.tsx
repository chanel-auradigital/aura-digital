"use client";

import { useState } from "react";
import Link from "next/link";

export default function BrandingOptions() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {/* Info tooltip button */}
      <div className="flex items-center gap-2 mb-8">
        <p className="text-clay">
          &iquest;C&oacute;mo quieres comenzar con tu identidad de marca?
        </p>
        <button
          onClick={() => setShowInfo(true)}
          className="shrink-0 w-6 h-6 rounded-full border border-clay/40 text-clay hover:border-terra hover:text-terra transition-colors flex items-center justify-center text-sm font-semibold"
          aria-label="&iquest;Qu&eacute; es branding?"
        >
          i
        </button>
      </div>

      {/* Two option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Option 1: Already have branding */}
        <Link
          href="/mi-marca/branding/existente"
          className="group rounded-lg border border-sand bg-white p-6 hover:border-terra hover:shadow-md transition-all text-center"
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-sand/60 flex items-center justify-center">
            <svg className="w-7 h-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-espresso group-hover:text-terra transition-colors mb-2">
            Ya tengo un branding
          </h2>
          <p className="text-sm text-clay">
            Sube tu gu&iacute;a de marca, logo, paleta de colores y tipograf&iacute;as para integrarlos a tu estrategia digital.
          </p>
        </Link>

        {/* Option 2: Create new branding */}
        <Link
          href="/mi-marca/branding/nuevo"
          className="group rounded-lg border border-sand bg-white p-6 hover:border-terra hover:shadow-md transition-all text-center"
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-sand/60 flex items-center justify-center">
            <svg className="w-7 h-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-espresso group-hover:text-terra transition-colors mb-2">
            Crear nuevo branding
          </h2>
          <p className="text-sm text-clay">
            Te guiamos paso a paso para construir la identidad visual y verbal de tu marca desde cero.
          </p>
        </Link>
      </div>

      {/* Info modal */}
      {showInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 backdrop-blur-sm px-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-clay hover:text-espresso transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-espresso">
                &iquest;Qu&eacute; es el branding?
              </h3>
            </div>

            <p className="text-sm text-clay mb-4">
              El branding es la identidad completa de tu marca. Es lo que hace que tu audiencia te reconozca, conf&iacute;e en ti y te elija. Va mucho m&aacute;s all&aacute; de un logo.
            </p>

            <h4 className="text-sm font-semibold text-espresso mb-2">
              Incluye:
            </h4>
            <ul className="space-y-2 text-sm text-clay">
              <li className="flex items-start gap-2">
                <span className="text-terra mt-0.5">&bull;</span>
                <span><strong className="text-espresso">Logo y s&iacute;mbolo</strong> &mdash; la representaci&oacute;n visual de tu marca</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terra mt-0.5">&bull;</span>
                <span><strong className="text-espresso">Paleta de colores</strong> &mdash; los colores que transmiten tu esencia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terra mt-0.5">&bull;</span>
                <span><strong className="text-espresso">Tipograf&iacute;as</strong> &mdash; las fuentes para t&iacute;tulos, textos y contenido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terra mt-0.5">&bull;</span>
                <span><strong className="text-espresso">Tono de voz</strong> &mdash; c&oacute;mo habla tu marca: cercana, profesional, c&aacute;lida</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terra mt-0.5">&bull;</span>
                <span><strong className="text-espresso">Estilo visual</strong> &mdash; fotograf&iacute;a, iconograf&iacute;a y est&eacute;tica general</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terra mt-0.5">&bull;</span>
                <span><strong className="text-espresso">Valores y personalidad</strong> &mdash; lo que tu marca representa y comunica</span>
              </li>
            </ul>

            {/* Coca-Cola example */}
            <div className="mt-5 p-4 bg-cloud rounded-lg">
              <p className="text-sm text-clay">
                <strong className="text-espresso">Un ejemplo:</strong> Piensa en
                {" "}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/200px-Coca-Cola_logo.svg.png"
                  alt="Coca-Cola"
                  className="inline-block h-4 align-baseline mx-1"
                />
                &mdash; su branding no es solo una tipograf&iacute;a blanca sobre fondo rojo. Cuando alguien piensa en Coca-Cola, piensa en <em>felicidad</em>, en <em>reuniones familiares</em>, en <em>Navidad</em>. Esa conexi&oacute;n emocional instant&aacute;nea es el resultado de un branding bien construido: cada color, cada palabra y cada imagen refuerzan la misma historia. Eso es exactamente lo que queremos lograr con tu marca.
              </p>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2.5 bg-terra text-white rounded-lg hover:bg-terra/90 transition-colors text-sm font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
