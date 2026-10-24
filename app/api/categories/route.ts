import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";

export async function GET() {
  const categories = await db.orm.public.Category.all();
  const sorted = categories.sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json(sorted);
}
