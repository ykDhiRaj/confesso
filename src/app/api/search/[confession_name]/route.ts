import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { confession_name: string } }
) {
  const { confession_name } = params;
  console.log(confession_name);

  const { data, error } = await supabaseAdmin
    .from("confessions")
    .select("*")
    .ilike("confession_name", `%${confession_name}%`);
    

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
