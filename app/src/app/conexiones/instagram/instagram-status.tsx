"use client";

interface ConnectionInfo {
  username: string | null;
  accountId: string | null;
  connectedAt: string | null;
  profilePicture: string | null;
  followers: number;
  following: number;
  posts: number;
  accountType: string | null;
  lastSync: string | null;
}

interface Props {
  connected: boolean;
  tokenStatus: "valid" | "expiring" | "expired" | "none";
  connection: ConnectionInfo | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InstagramStatus({ connected, tokenStatus, connection }: Props) {
  const handleConnect = () => {
    window.location.href = "/api/auth/instagram";
  };

  const handleReconnect = () => {
    window.location.href = "/api/auth/instagram";
  };

  if (!connected || !connection) {
    return (
      <div className="space-y-6">
        {/* Not connected state */}
        <div className="rounded-lg border-2 border-dashed border-sand bg-cloud/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-sand/60 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-espresso mb-2">
            Instagram no conectado
          </h2>
          <p className="text-sm text-clay mb-6 max-w-md mx-auto">
            Conecta tu cuenta de Instagram para que podamos sincronizar tus métricas,
            publicaciones y comentarios automáticamente cada 12 horas.
          </p>
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
            </svg>
            Conectar Instagram
          </button>
        </div>

        {/* What permissions */}
        <div className="rounded-lg border border-sand bg-white p-5">
          <h3 className="text-sm font-semibold text-espresso mb-3">
            ¿Qué permisos solicitamos?
          </h3>
          <ul className="space-y-2">
            {[
              { label: "Perfil básico", desc: "Nombre de usuario, biografía y foto de perfil" },
              { label: "Métricas e insights", desc: "Alcance, impresiones, engagement y crecimiento" },
              { label: "Publicaciones", desc: "Contenido publicado con sus estadísticas" },
              { label: "Comentarios", desc: "Comentarios y respuestas en tus publicaciones" },
            ].map((p) => (
              <li key={p.label} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-terra mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <div>
                  <span className="text-sm font-medium text-espresso">{p.label}</span>
                  <span className="text-xs text-clay ml-1">— {p.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Connected state
  return (
    <div className="space-y-6">
      {/* Token warning */}
      {tokenStatus === "expiring" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Token por expirar</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Tu conexión expirará pronto. Reconecta para renovar el acceso.
            </p>
            <button
              onClick={handleReconnect}
              className="mt-2 text-xs font-medium text-amber-800 underline hover:text-amber-900"
            >
              Reconectar ahora
            </button>
          </div>
        </div>
      )}
      {tokenStatus === "expired" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">Conexión expirada</p>
            <p className="text-xs text-red-700 mt-0.5">
              El token de acceso ha expirado. Reconecta para restablecer la sincronización.
            </p>
            <button
              onClick={handleReconnect}
              className="mt-2 text-xs font-medium text-red-800 underline hover:text-red-900"
            >
              Reconectar ahora
            </button>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-lg border border-sand bg-white p-6">
        <div className="flex items-center gap-4 mb-5">
          {connection.profilePicture ? (
            <img
              src={connection.profilePicture}
              alt={connection.username || ""}
              className="w-16 h-16 rounded-full border-2 border-sand"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center">
              <svg className="w-8 h-8 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
              </svg>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-espresso">
                @{connection.username || "—"}
              </h2>
              {tokenStatus === "valid" && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="Conectado" />
              )}
            </div>
            <p className="text-xs text-clay">
              Conectado desde {formatDate(connection.connectedAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-sand">
          <div className="text-center">
            <div className="text-xl font-semibold text-espresso">
              {connection.followers.toLocaleString("es")}
            </div>
            <div className="text-xs text-clay">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-espresso">
              {connection.following.toLocaleString("es")}
            </div>
            <div className="text-xs text-clay">Siguiendo</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-espresso">
              {connection.posts.toLocaleString("es")}
            </div>
            <div className="text-xs text-clay">Publicaciones</div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-clay">Tipo de cuenta</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              connection.accountType === "BUSINESS"
                ? "text-terra bg-terra/10"
                : "text-clay bg-sand"
            }`}>
              {connection.accountType === "BUSINESS"
                ? "Empresa"
                : connection.accountType === "MEDIA_CREATOR"
                ? "Creador"
                : connection.accountType || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-clay">Account ID</span>
            <span className="text-espresso font-mono text-xs">{connection.accountId || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-clay">Última sincronización</span>
            <span className="text-espresso text-xs">{formatDate(connection.lastSync)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-clay">Sincronización automática</span>
            <span className="text-espresso text-xs">Cada 12 horas</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReconnect}
          className="text-sm text-clay hover:text-espresso transition-colors underline"
        >
          Reconectar cuenta
        </button>
      </div>
    </div>
  );
}
