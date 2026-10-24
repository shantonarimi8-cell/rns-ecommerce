import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";

export async function GET() {
  const banners = await db.orm.public.Banner.all();
  const active = banners
    .filter((b) => b.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return NextResponse.json(active);
}
