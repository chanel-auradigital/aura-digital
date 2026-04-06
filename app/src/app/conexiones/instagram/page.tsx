import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import InstagramStatus from "./instagram-status";

export default async function InstagramConnectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email;

  // Get client
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // Get existing connection
  let connection: {
    app_username: string | null;
    app_account_id: string | null;
    connected_at: string | null;
    metadata: Record<string, unknown> | null;
  } | null = null;

  // Get Instagram profile data if synced
  let profile: {
    username: string | null;
    profile_picture_url: string | null;
    followers_count: number;
    follows_count: number;
    media_count: number;
    account_type: string | null;
    updated_at: string | null;
  } | null = null;

  if (client) {
    const { data: app } = await supabase
      .from("client_apps")
      .select("app_username, app_account_id, connected_at, metadata")
      .eq("client_id", client.id)
      .eq("app_name", "instagram")
      .single();
    connection = app;

    if (connection) {
      const { data: igProfile } = await supabase
        .from("instagram_profiles")
        .select("username, profile_picture_url, followers_count, follows_count, media_count, account_type, updated_at")
        .eq("client_id", client.id)
        .single();
      profile = igProfile;
    }
  }

  // Check token expiration
  let tokenStatus: "valid" | "expiring" | "expired" | "none" = "none";
  if (connection?.metadata) {
    const meta = connection.metadata as { token_expires_at?: string };
    if (meta.token_expires_at) {
      const expiresAt = new Date(meta.token_expires_at);
      const now = new Date();
      const daysLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) tokenStatus = "expired";
      else if (daysLeft <= 10) tokenStatus = "expiring";
      else tokenStatus = "valid";
    } else {
      tokenStatus = "valid";
    }
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.svg" alt="Aura Digital" width={140} height={56} />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sand text-sm">{name}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-clay hover:text-terra transition-colors"
            >
              Cerrar sesi&oacute;n
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/conexiones"
            className="text-clay hover:text-terra transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-espresso">Instagram</h1>
          </div>
        </div>

        <InstagramStatus
          connected={!!connection}
          tokenStatus={tokenStatus}
          connection={connection ? {
            username: connection.app_username || profile?.username || null,
            accountId: connection.app_account_id || null,
            connectedAt: connection.connected_at || null,
            profilePicture: profile?.profile_picture_url || null,
            followers: profile?.followers_count || 0,
            following: profile?.follows_count || 0,
            posts: profile?.media_count || 0,
            accountType: profile?.account_type || null,
            lastSync: profile?.updated_at || null,
          } : null}
        />
      </main>
    </div>
  );
}
