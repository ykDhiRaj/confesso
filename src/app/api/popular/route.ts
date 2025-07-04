import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { data, error } = await supabaseAdmin
        .from('confessions')
        .select('*')
        .order('daily_plays', { ascending: false })
        .range(0, 9); // Get top 10 (inclusive range)

    if (error) {
        console.error("Error fetching popular confessions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ popular_confessions: data });
}
