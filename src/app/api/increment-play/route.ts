import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    try {
        const {id} = await req.json()

        if(!id){
            return NextResponse.json({ error: 'Confession ID is required' }, { status: 400 });
        }

        const {error} = await supabaseAdmin.rpc('increment_daily_plays', { confession_id: id })

        if(error){
            return NextResponse.json(error.message)
        }

        return NextResponse.json({message:'Incremented Successfully'});
        
    } catch (error) {
        return NextResponse.json(error)
    }
}