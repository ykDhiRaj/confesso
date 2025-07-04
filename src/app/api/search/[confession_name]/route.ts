import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { confession_name: string } }
) {
  const { confession_name } =  context.params;

  const { data, error } = await supabaseAdmin
    .from("confessions")
    .select("*")
    .ilike("confession_name", `%${confession_name}%`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
