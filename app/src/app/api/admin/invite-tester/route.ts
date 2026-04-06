import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

const GRAPH_URL = "https://graph.facebook.com/v22.0";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { facebookUserId } = await request.json();

  if (!facebookUserId) {
    return NextResponse.json(
      { error: "Facebook User ID es requerido" },
      { status: 400 }
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "META_APP_ID o META_APP_SECRET no configurados" },
      { status: 500 }
    );
  }

  // Get app access token
  const appToken = `${appId}|${appSecret}`;

  // Send tester invitation via Meta API
  const res = await fetch(`${GRAPH_URL}/${appId}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      user: facebookUserId,
      role: "testers",
      access_token: appToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const errorMsg = data.error?.message || "Error desconocido de Meta API";
    console.error("Meta invite-tester error:", data);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
