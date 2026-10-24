import { NextResponse } from "next/server";
import { getAdminUser } from "../../../lib/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(admin);
}
