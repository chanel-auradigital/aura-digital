import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.digitalnextlevel.com";
const GRAPH_URL = "https://graph.facebook.com/v22.0";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied permissions
  if (error) {
    console.error("Instagram OAuth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(
      `${APP_URL}/conexiones/instagram?error=denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${APP_URL}/conexiones/instagram?error=missing_params`
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("ig_oauth_state")?.value;
  cookieStore.delete("ig_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      `${APP_URL}/conexiones/instagram?error=invalid_state`
    );
  }

  // Verify user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  try {
    // 1. Exchange code for short-lived token
    const redirectUri = `${APP_URL}/api/auth/instagram/callback`;
    const tokenRes = await fetch(
      `${GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          redirect_uri: redirectUri,
          code,
        }),
      { cache: "no-store" }
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Token exchange failed:", err);
      return NextResponse.redirect(
        `${APP_URL}/conexiones/instagram?error=token_exchange`
      );
    }

    const { access_token: shortToken } = await tokenRes.json();

    // 2. Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `${GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          fb_exchange_token: shortToken,
        }),
      { cache: "no-store" }
    );

    if (!longRes.ok) {
      const err = await longRes.text();
      console.error("Long-lived token exchange failed:", err);
      return NextResponse.redirect(
        `${APP_URL}/conexiones/instagram?error=long_token`
      );
    }

    const { access_token: longToken, expires_in } = await longRes.json();
    const tokenExpiresAt = new Date(
      Date.now() + (expires_in || 5184000) * 1000
    ).toISOString();

    // 3. Get user's Facebook Pages
    const pagesRes = await fetch(
      `${GRAPH_URL}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longToken}`,
      { cache: "no-store" }
    );

    if (!pagesRes.ok) {
      console.error("Pages fetch failed:", await pagesRes.text());
      return NextResponse.redirect(
        `${APP_URL}/conexiones/instagram?error=pages_fetch`
      );
    }

    const { data: pages } = await pagesRes.json();

    // 4. Find page with Instagram Business Account
    let igAccountId: string | null = null;
    let igUsername: string | null = null;
    let pageAccessToken: string | null = null;

    for (const page of pages || []) {
      if (page.instagram_business_account?.id) {
        igAccountId = page.instagram_business_account.id;
        pageAccessToken = page.access_token;
        break;
      }
    }

    if (!igAccountId || !pageAccessToken) {
      return NextResponse.redirect(
        `${APP_URL}/conexiones/instagram?error=no_ig_account`
      );
    }

    // 5. Get Instagram username
    const igRes = await fetch(
      `https://graph.instagram.com/v22.0/${igAccountId}?fields=username&access_token=${pageAccessToken}`,
      { cache: "no-store" }
    );

    if (igRes.ok) {
      const igData = await igRes.json();
      igUsername = igData.username || null;
    }

    // 6. Store connection in Supabase (using admin to bypass RLS)
    const admin = createAdminClient();

    // Get or create client record
    let { data: client } = await admin
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      const { data: newClient, error: insertErr } = await admin
        .from("clients")
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          slug: user.email?.split("@")[0] || user.id,
        })
        .select("id")
        .single();

      if (insertErr || !newClient) {
        console.error("Client creation failed:", insertErr);
        return NextResponse.redirect(
          `${APP_URL}/conexiones/instagram?error=client_create`
        );
      }
      client = newClient;
    }

    // Upsert connection in client_apps
    const { error: upsertErr } = await admin.from("client_apps").upsert(
      {
        client_id: client.id,
        app_name: "instagram",
        app_account_id: igAccountId,
        app_username: igUsername,
        metadata: {
          access_token: pageAccessToken,
          user_access_token: longToken,
          token_expires_at: tokenExpiresAt,
          ig_account_id: igAccountId,
        },
        connected_at: new Date().toISOString(),
      },
      { onConflict: "client_id,app_name" }
    );

    if (upsertErr) {
      console.error("Connection upsert failed:", upsertErr);
      return NextResponse.redirect(
        `${APP_URL}/conexiones/instagram?error=save_failed`
      );
    }

    // Success
    return NextResponse.redirect(
      `${APP_URL}/conexiones/instagram?connected=true`
    );
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return NextResponse.redirect(
      `${APP_URL}/conexiones/instagram?error=unexpected`
    );
  }
}
