import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import InviteButton from "./invite-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminClientConnectionsPage({ params }: Props) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, slug, full_name")
    .eq("id", id)
    .single();

  if (!client) {
    redirect("/admin");
  }

  // Get Instagram connection
  const { data: igApp } = await supabase
    .from("client_apps")
    .select("app_username, app_account_id, connected_at, metadata")
    .eq("client_id", id)
    .eq("app_name", "instagram")
    .single();

  // Get IG profile if connected
  let igProfile: {
    username: string | null;
    profile_picture_url: string | null;
    followers_count: number;
    follows_count: number;
    media_count: number;
    account_type: string | null;
    updated_at: string | null;
  } | null = null;

  if (igApp) {
    const { data } = await supabase
      .from("instagram_profiles")
      .select("username, profile_picture_url, followers_count, follows_count, media_count, account_type, updated_at")
      .eq("client_id", id)
      .single();
    igProfile = data;
  }

  // Token status
  let tokenStatus: "valid" | "expiring" | "expired" | "none" = "none";
  let tokenExpiresAt: string | null = null;
  if (igApp?.metadata) {
    const meta = igApp.metadata as { token_expires_at?: string };
    if (meta.token_expires_at) {
      tokenExpiresAt = meta.token_expires_at;
      const daysLeft = Math.floor(
        (new Date(meta.token_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft <= 0) tokenStatus = "expired";
      else if (daysLeft <= 10) tokenStatus = "expiring";
      else tokenStatus = "valid";
    } else {
      tokenStatus = "valid";
    }
  }

  const platforms = [
    {
      key: "instagram",
      name: "Instagram",
      color: "from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
      icon: (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
        </svg>
      ),
      connected: !!igApp,
    },
    { key: "tiktok", name: "TikTok", color: "bg-black", icon: null, connected: false, disabled: true },
    { key: "facebook", name: "Facebook", color: "bg-[#1877F2]", icon: null, connected: false, disabled: true },
  ];

  function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="flex-1">
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-semibold">Admin — Aura Digital</h1>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="text-sm text-clay hover:text-terra transition-colors">
            Salir
          </button>
        </form>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href={`/admin/clientes/${id}`}
            className="text-clay hover:text-terra transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-espresso">
              Conexiones — {client.full_name}
            </h2>
            <p className="text-xs text-clay">{client.slug}</p>
          </div>
        </div>

        <div className="space-y-6">
          {platforms.map((platform) => (
            <div
              key={platform.key}
              className={`rounded-lg border bg-white overflow-hidden ${
                platform.disabled ? "border-sand/50 opacity-40" : "border-sand"
              }`}
            >
              {/* Platform header */}
              <div
                className={`h-12 flex items-center gap-3 px-5 ${
                  platform.key === "instagram"
                    ? `bg-gradient-to-r ${platform.color}`
                    : platform.color
                }`}
              >
                {platform.icon}
                <span className="text-white font-medium">{platform.name}</span>
                {platform.disabled && (
                  <span className="text-white/60 text-xs ml-auto">Próximamente</span>
                )}
              </div>

              {/* Content */}
              {platform.key === "instagram" && !platform.disabled && (
                <div className="p-5">
                  {igApp ? (
                    <>
                      {/* Connected state */}
                      <div className="flex items-center gap-4 mb-4">
                        {igProfile?.profile_picture_url ? (
                          <img
                            src={igProfile.profile_picture_url}
                            alt={igProfile.username || ""}
                            className="w-12 h-12 rounded-full border-2 border-sand"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center">
                            <span className="text-clay text-lg font-bold">
                              {(igApp.app_username || "?")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-espresso">
                              @{igApp.app_username || igProfile?.username}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                tokenStatus === "valid"
                                  ? "bg-green-500"
                                  : tokenStatus === "expiring"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                          <p className="text-xs text-clay">
                            Account ID: {igApp.app_account_id}
                          </p>
                        </div>
                      </div>

                      {/* Account type */}
                      {igProfile?.account_type && (
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-xs text-clay">Tipo de cuenta:</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            igProfile.account_type === "BUSINESS"
                              ? "text-terra bg-terra/10"
                              : "text-clay bg-sand"
                          }`}>
                            {igProfile.account_type === "BUSINESS"
                              ? "Empresa"
                              : igProfile.account_type === "MEDIA_CREATOR"
                              ? "Creador"
                              : igProfile.account_type}
                          </span>
                        </div>
                      )}

                      {/* Stats row */}
                      {igProfile && (
                        <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-sand text-center mb-4">
                          <div>
                            <div className="text-lg font-semibold text-espresso">
                              {igProfile.followers_count.toLocaleString("es")}
                            </div>
                            <div className="text-[10px] text-clay">Seguidores</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-espresso">
                              {igProfile.follows_count.toLocaleString("es")}
                            </div>
                            <div className="text-[10px] text-clay">Siguiendo</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-espresso">
                              {igProfile.media_count.toLocaleString("es")}
                            </div>
                            <div className="text-[10px] text-clay">Posts</div>
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-clay">Conectado desde</span>
                          <span className="text-espresso text-xs">{formatDate(igApp.connected_at)}</span>
                        </div>
                        {tokenExpiresAt && (
                          <div className="flex justify-between">
                            <span className="text-clay">Token expira</span>
                            <span className={`text-xs ${
                              tokenStatus === "valid" ? "text-espresso" : tokenStatus === "expiring" ? "text-amber-600" : "text-red-600"
                            }`}>
                              {formatDate(tokenExpiresAt)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-clay">Última sincronización</span>
                          <span className="text-espresso text-xs">{formatDate(igProfile?.updated_at || null)}</span>
                        </div>
                      </div>

                      {tokenStatus !== "valid" && (
                        <div className={`mt-4 rounded-md p-3 text-xs ${
                          tokenStatus === "expired" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {tokenStatus === "expired"
                            ? "El token ha expirado. El cliente debe reconectar desde su portal."
                            : "El token expirará pronto. Avisa al cliente para que reconecte."}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Not connected */}
                      <div className="text-center py-4">
                        <p className="text-sm text-clay mb-4">
                          Instagram no conectado. Envía una invitación de tester para que el cliente
                          pueda conectar su cuenta desde el portal.
                        </p>
                        <InviteButton clientName={client.full_name} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
