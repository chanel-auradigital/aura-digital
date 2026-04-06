import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GRAPH_URL = "https://graph.instagram.com/v22.0";

async function igFetch(url: string) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      const err = await resp.text();
      console.error(`  API ${resp.status}: ${err.slice(0, 120)}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`  Fetch error: ${e}`);
    return null;
  }
}

async function fetchMediaInsights(mediaId: string, token: string) {
  const metrics = "reach,impressions,saved,shares,total_interactions,likes,comments";
  const data = await igFetch(
    `${GRAPH_URL}/${mediaId}/insights?metric=${metrics}&access_token=${token}`
  );
  const result: Record<string, number> = {};
  if (data?.data) {
    for (const item of data.data) {
      result[item.name] = item.values?.[0]?.value ?? item.total_value?.value ?? 0;
    }
  }
  return result;
}

async function fetchComments(mediaId: string, token: string) {
  const data = await igFetch(
    `${GRAPH_URL}/${mediaId}/comments?fields=id,text,timestamp,username,like_count&limit=50&access_token=${token}`
  );
  const comments: any[] = [];
  if (data?.data) {
    for (const c of data.data) {
      comments.push({ ...c, is_reply: false, parent_ig_id: null });
      const replies = await igFetch(
        `${GRAPH_URL}/${c.id}/replies?fields=id,text,timestamp,username,like_count&limit=50&access_token=${token}`
      );
      if (replies?.data) {
        for (const r of replies.data) {
          comments.push({ ...r, is_reply: true, parent_ig_id: c.id });
        }
      }
    }
  }
  return comments;
}

Deno.serve(async (req) => {
  // Auth check
  const authHeader = req.headers.get("Authorization");
  const expectedKey = Deno.env.get("SYNC_SECRET");
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get client slug from query or body
  const url = new URL(req.url);
  let slug = url.searchParams.get("client");
  if (!slug && req.method === "POST") {
    try {
      const body = await req.json();
      slug = body.client;
    } catch { /* empty body is ok */ }
  }

  // If "all", sync every client with an Instagram connection
  const syncAll = slug === "all" || !slug;

  let clientsToSync: { id: string; slug: string; ig_account_id: string; token: string }[] = [];

  if (syncAll) {
    // Get all clients with Instagram connections from DB
    const { data: apps } = await supabase
      .from("client_apps")
      .select("client_id, app_account_id, metadata, clients(id, slug)")
      .eq("app_name", "instagram");

    for (const app of apps || []) {
      const meta = app.metadata as { access_token?: string } | null;
      const client = app.clients as unknown as { id: string; slug: string } | null;
      const token = meta?.access_token || getEnvToken(client?.slug);
      if (client && app.app_account_id && token) {
        clientsToSync.push({
          id: client.id,
          slug: client.slug,
          ig_account_id: app.app_account_id,
          token,
        });
      }
    }
  } else {
    // Single client
    const { data: clientRow } = await supabase
      .from("clients").select("id, slug").eq("slug", slug).single();
    if (!clientRow) {
      return Response.json({ error: `Client ${slug} not in DB` }, { status: 404 });
    }

    const { data: app } = await supabase
      .from("client_apps")
      .select("app_account_id, metadata")
      .eq("client_id", clientRow.id)
      .eq("app_name", "instagram")
      .single();

    if (!app) {
      return Response.json({ error: `No Instagram connection for ${slug}` }, { status: 404 });
    }

    const meta = app.metadata as { access_token?: string } | null;
    const token = meta?.access_token || getEnvToken(slug);
    if (!token) {
      return Response.json({ error: `No token for ${slug}` }, { status: 500 });
    }

    clientsToSync.push({
      id: clientRow.id,
      slug: clientRow.slug,
      ig_account_id: app.app_account_id!,
      token,
    });
  }

  if (clientsToSync.length === 0) {
    return Response.json({ error: "No clients to sync" }, { status: 404 });
  }

  const results = [];
  for (const client of clientsToSync) {
    const result = await syncClient(supabase, client);
    results.push(result);
  }

  if (results.length === 1) {
    return Response.json(results[0]);
  }
  return Response.json({ ok: true, clients: results });
});

// Fallback: read token from env vars (for backwards compatibility)
function getEnvToken(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  const envKey = `META_ACCESS_TOKEN_${slug.toUpperCase().replace(/-/g, "_")}`;
  return Deno.env.get(envKey);
}

async function syncClient(
  supabase: ReturnType<typeof createClient>,
  client: { id: string; slug: string; ig_account_id: string; token: string }
) {
  console.log(`Syncing: ${client.slug}`);
  const start = Date.now();
  const { id: clientId, slug, ig_account_id, token } = client;

  // 1. Profile
  console.log("  Profile...");
  const profile = await igFetch(
    `${GRAPH_URL}/${ig_account_id}?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,website,account_type&access_token=${token}`
  );

  if (profile) {
    await supabase.from("instagram_profiles").upsert({
      client_id: clientId,
      ig_account_id,
      username: profile.username,
      name: profile.name,
      biography: profile.biography,
      profile_picture_url: profile.profile_picture_url,
      followers_count: profile.followers_count || 0,
      follows_count: profile.follows_count || 0,
      media_count: profile.media_count || 0,
      website: profile.website,
      account_type: profile.account_type || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id" });

    const today = new Date().toISOString().split("T")[0];
    await supabase.from("instagram_daily_metrics").upsert({
      client_id: clientId,
      date: today,
      followers_count: profile.followers_count || 0,
      follows_count: profile.follows_count || 0,
      media_count: profile.media_count || 0,
    }, { onConflict: "client_id,date" });
  }

  // 2. Recent posts (last 50)
  console.log("  Recent posts...");
  const fields = "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count";
  const mediaData = await igFetch(
    `${GRAPH_URL}/${ig_account_id}/media?fields=${fields}&limit=50&access_token=${token}`
  );

  let postsCount = 0;
  let commentsCount = 0;

  if (mediaData?.data) {
    for (const media of mediaData.data) {
      const insights = await fetchMediaInsights(media.id, token);

      const { data: postRow } = await supabase.from("instagram_posts").upsert({
        client_id: clientId,
        ig_media_id: media.id,
        media_type: media.media_type,
        media_url: media.media_url,
        thumbnail_url: media.thumbnail_url,
        permalink: media.permalink,
        caption: media.caption,
        timestamp: media.timestamp,
        like_count: insights.likes || media.like_count || 0,
        comments_count: insights.comments || media.comments_count || 0,
        shares_count: insights.shares || 0,
        saves_count: insights.saved || 0,
        reach: insights.reach || 0,
        impressions: insights.impressions || 0,
        engagement: insights.total_interactions || 0,
      }, { onConflict: "ig_media_id" }).select("id").single();

      postsCount++;

      // Comments
      if ((media.comments_count || 0) > 0 && postRow) {
        const comments = await fetchComments(media.id, token);
        for (const c of comments) {
          let parentId = null;
          if (c.is_reply && c.parent_ig_id) {
            const { data: p } = await supabase
              .from("instagram_comments")
              .select("id")
              .eq("ig_comment_id", c.parent_ig_id)
              .single();
            parentId = p?.id || null;
          }
          await supabase.from("instagram_comments").upsert({
            post_id: postRow.id,
            client_id: clientId,
            ig_comment_id: c.id,
            parent_comment_id: parentId,
            username: c.username,
            text: c.text,
            like_count: c.like_count || 0,
            timestamp: c.timestamp,
            is_reply: c.is_reply,
          }, { onConflict: "ig_comment_id" });
          commentsCount++;
        }
      }
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  const result = {
    ok: true,
    client: slug,
    duration: `${duration}s`,
    followers: profile?.followers_count,
    posts_synced: postsCount,
    comments_synced: commentsCount,
  };

  console.log(`  Done in ${duration}s: ${postsCount} posts, ${commentsCount} comments`);
  return result;
}
