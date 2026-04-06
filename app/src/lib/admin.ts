import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  return session === process.env.ADMIN_SECRET;
}
