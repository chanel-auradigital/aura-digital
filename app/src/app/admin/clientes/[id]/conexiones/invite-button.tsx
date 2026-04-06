"use client";

import { useState } from "react";

interface Props {
  clientName: string;
}

export default function InviteButton({ clientName }: Props) {
  const [facebookId, setFacebookId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleInvite() {
    if (!facebookId.trim()) return;

    setStatus("loading");
    setMessage("");

    const res = await fetch("/api/admin/invite-tester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facebookUserId: facebookId.trim() }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("sent");
      setMessage(`Invitación enviada. ${clientName} debe aceptarla desde Facebook > Configuración > Aplicaciones y sitios web.`);
    } else {
      setStatus("error");
      setMessage(data.error || "Error al enviar la invitación");
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-5 py-2 bg-espresso text-white rounded-md text-sm font-medium hover:bg-espresso/90 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        Enviar invitación
      </button>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium text-espresso mb-1 text-left">
          Facebook User ID del cliente
        </label>
        <input
          type="text"
          value={facebookId}
          onChange={(e) => setFacebookId(e.target.value)}
          placeholder="Ej: 10223456789012345"
          className="w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-espresso placeholder-clay/50 focus:border-terra focus:outline-none focus:ring-1 focus:ring-terra"
          disabled={status === "loading" || status === "sent"}
        />
        <p className="text-[10px] text-clay mt-1 text-left">
          El cliente puede encontrar su ID en{" "}
          <a
            href="https://www.facebook.com/settings/?tab=account"
            target="_blank"
            rel="noopener noreferrer"
            className="text-terra underline"
          >
            facebook.com/settings
          </a>{" "}
          o buscando &quot;What is my Facebook ID&quot; en Google.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInvite}
          disabled={!facebookId.trim() || status === "loading" || status === "sent"}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            status === "sent"
              ? "bg-terra/10 text-terra"
              : "bg-espresso text-white hover:bg-espresso/90 disabled:opacity-50"
          }`}
        >
          {status === "loading"
            ? "Enviando..."
            : status === "sent"
            ? "Invitación enviada"
            : "Enviar"}
        </button>
        {status !== "sent" && (
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-2 text-sm text-clay hover:text-espresso transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-xs text-left ${
            status === "sent"
              ? "bg-terra/10 text-terra"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
