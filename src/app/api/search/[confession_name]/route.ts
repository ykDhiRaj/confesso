import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const confession_name = req.nextUrl.pathname.split("/").pop();

  if (!confession_name) {
    return NextResponse.json({ error: "Confession name is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("confessions")
    .select("*")
    .ilike("confession_name", `%${confession_name}%`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
