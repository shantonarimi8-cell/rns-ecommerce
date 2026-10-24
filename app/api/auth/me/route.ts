import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../../src/prisma/db";
import { SESSION_COOKIE, verifySessionToken } from "../../../lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const users = await db.orm.public.User.all();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Failed to load session:", error);
    return NextResponse.json({ user: null });
  }
}
