import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString("es");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.full_name || user.email;

  // Get client record
  const { data: client } = await supabase
    .from("clients")
    .select("id, slug, full_name")
    .eq("user_id", user.id)
    .single();

  // Get Instagram profile
  const { data: igProfile } = client
    ? await supabase
        .from("instagram_profiles")
        .select("*")
        .eq("client_id", client.id)
        .single()
    : { data: null };

  // Get top 10 recent posts by engagement
  const { data: topPosts } = client
    ? await supabase
        .from("instagram_posts")
        .select(
          "ig_media_id, media_type, permalink, caption, timestamp, like_count, comments_count, shares_count, saves_count, reach, impressions, engagement"
        )
        .eq("client_id", client.id)
        .order("timestamp", { ascending: false })
        .limit(10)
    : { data: null };

  // Get posts with reach > 0 for totals (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentPosts } = client
    ? await supabase
        .from("instagram_posts")
        .select("reach, impressions, like_count, comments_count, shares_count, saves_count, engagement")
        .eq("client_id", client.id)
        .gte("timestamp", thirtyDaysAgo.toISOString())
    : { data: null };

  // Calculate aggregates
  const totalReach = recentPosts?.reduce((sum, p) => sum + (p.reach || 0), 0) || 0;
  const totalImpressions = recentPosts?.reduce((sum, p) => sum + (p.impressions || 0), 0) || 0;
  const totalLikes = recentPosts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0;
  const totalComments = recentPosts?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 0;
  const totalShares = recentPosts?.reduce((sum, p) => sum + (p.shares_count || 0), 0) || 0;
  const totalSaves = recentPosts?.reduce((sum, p) => sum + (p.saves_count || 0), 0) || 0;
  const totalEngagement = recentPosts?.reduce((sum, p) => sum + (p.engagement || 0), 0) || 0;
  const postsCount = recentPosts?.length || 0;

  const engagementRate =
    igProfile?.followers_count && totalEngagement
      ? ((totalEngagement / (postsCount * igProfile.followers_count)) * 100).toFixed(2)
      : "0";

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-espresso px-6 py-4 flex items-center justify-between">
        <Image src="/logo.svg" alt="Aura Digital" width={140} height={56} />
        <div className="flex items-center gap-4">
          <span className="text-sand text-sm">{name}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-clay hover:text-terra transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile header */}
        {igProfile && (
          <div className="flex items-center gap-4 mb-8">
            {igProfile.profile_picture_url && (
              <img
                src={igProfile.profile_picture_url}
                alt={igProfile.username || ""}
                className="w-16 h-16 rounded-full border-2 border-sand"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-espresso">
                @{igProfile.username}
              </h1>
              <p className="text-clay text-sm">{igProfile.name}</p>
            </div>
          </div>
        )}

        {!igProfile && (
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-espresso mb-2">
              Bienvenido, {name}
            </h1>
            <p className="text-clay">
              No hay cuenta de Instagram vinculada todavía.
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg bg-white border border-sand p-5">
            <div className="text-terra text-2xl font-bold mb-1">
              {formatNumber(igProfile?.followers_count || 0)}
            </div>
            <div className="text-xs text-clay">Seguidores</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-5">
            <div className="text-terra text-2xl font-bold mb-1">
              {formatNumber(igProfile?.media_count || 0)}
            </div>
            <div className="text-xs text-clay">Publicaciones</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-5">
            <div className="text-terra text-2xl font-bold mb-1">
              {formatNumber(totalReach)}
            </div>
            <div className="text-xs text-clay">Alcance (30d)</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-5">
            <div className="text-terra text-2xl font-bold mb-1">
              {engagementRate}%
            </div>
            <div className="text-xs text-clay">Engagement Rate</div>
          </div>
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="rounded-lg bg-white border border-sand p-4 text-center">
            <div className="text-espresso text-lg font-semibold">{formatNumber(totalLikes)}</div>
            <div className="text-xs text-clay">Likes (30d)</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-4 text-center">
            <div className="text-espresso text-lg font-semibold">{formatNumber(totalComments)}</div>
            <div className="text-xs text-clay">Comentarios (30d)</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-4 text-center">
            <div className="text-espresso text-lg font-semibold">{formatNumber(totalShares)}</div>
            <div className="text-xs text-clay">Compartidos (30d)</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-4 text-center">
            <div className="text-espresso text-lg font-semibold">{formatNumber(totalSaves)}</div>
            <div className="text-xs text-clay">Guardados (30d)</div>
          </div>
          <div className="rounded-lg bg-white border border-sand p-4 text-center">
            <div className="text-espresso text-lg font-semibold">{formatNumber(totalImpressions)}</div>
            <div className="text-xs text-clay">Impresiones (30d)</div>
          </div>
        </div>

        {/* Recent posts table */}
        <h2 className="text-lg font-semibold text-espresso mb-4">
          Últimas publicaciones
        </h2>
        {topPosts && topPosts.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-sand">
            <table className="w-full text-sm">
              <thead className="bg-sand/50">
                <tr>
                  <th className="text-left px-4 py-3 text-espresso font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 text-espresso font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 text-espresso font-medium max-w-xs">Caption</th>
                  <th className="text-right px-4 py-3 text-espresso font-medium">Likes</th>
                  <th className="text-right px-4 py-3 text-espresso font-medium">Comentarios</th>
                  <th className="text-right px-4 py-3 text-espresso font-medium">Alcance</th>
                  <th className="text-right px-4 py-3 text-espresso font-medium">Guardados</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-sand">
                {topPosts.map((post) => (
                  <tr key={post.ig_media_id} className="hover:bg-cloud/50">
                    <td className="px-4 py-3 text-clay whitespace-nowrap">
                      {post.timestamp
                        ? new Date(post.timestamp).toLocaleDateString("es", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          post.media_type === "VIDEO" || post.media_type === "REEL"
                            ? "bg-terra/10 text-terra"
                            : post.media_type === "CAROUSEL_ALBUM"
                            ? "bg-clay/10 text-clay"
                            : "bg-sand text-espresso"
                        }`}
                      >
                        {post.media_type === "CAROUSEL_ALBUM"
                          ? "Carrusel"
                          : post.media_type === "VIDEO"
                          ? "Video"
                          : post.media_type === "REEL"
                          ? "Reel"
                          : "Imagen"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-espresso max-w-xs truncate">
                      {post.permalink ? (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-terra transition-colors"
                        >
                          {post.caption?.slice(0, 60) || "Sin caption"}
                          {(post.caption?.length || 0) > 60 ? "..." : ""}
                        </a>
                      ) : (
                        post.caption?.slice(0, 60) || "Sin caption"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-espresso">
                      {post.like_count || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-espresso">
                      {post.comments_count || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-espresso">
                      {formatNumber(post.reach || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-espresso">
                      {post.saves_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-sand bg-white p-8 text-center">
            <p className="text-clay text-sm">No hay publicaciones registradas.</p>
          </div>
        )}

        {/* Last updated */}
        {igProfile?.updated_at && (
          <p className="text-xs text-clay mt-6 text-right">
            Última actualización:{" "}
            {new Date(igProfile.updated_at).toLocaleString("es", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </main>
    </div>
  );
}
