
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(req:Request){
    
  try {
    const {deletionCode} = await req.json();
    if (!deletionCode) {
    return NextResponse.json({ error: 'No deletion code provided' }, { status: 400 });
  }
  
  const { data: confession, error: fetchError } =  await supabaseAdmin.
    from('confessions')
    .select('id, audio_url')
    .eq('deletion_code', deletionCode)
    .single()

    if (fetchError || !confession) {
    return NextResponse.json({ error: 'Invalid deletion code' }, { status: 404 });
    }

  
  const fullPath = confession.audio_url 
  const filePath = fullPath.replace('confessions/', '') 

  const {error:storageError} = await supabaseAdmin.storage.
  from('confessions').
  remove([filePath])

  if(storageError) return NextResponse.json({ error: 'Failed to delete audio file' }, { status: 500 });

  const {error:dbError} = await supabaseAdmin
  .from('confessions')
  .delete()
  .eq('id', confession.id);

  if (dbError) {
    return NextResponse.json({ error: 'Failed to delete confession' }, { status: 500 });
  }

  return NextResponse.json({message:'Confession deleted successfully'});

  } catch (error) {
    return NextResponse.json({message: error});
  }
}