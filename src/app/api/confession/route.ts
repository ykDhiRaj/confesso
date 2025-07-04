import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get('audio') as File;
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw?.split(',').map(tag => tag.trim().toLowerCase()) ?? [];
    const description = formData.get('description') as string;
    const confession_name = formData.get('confession_name') as string;
    console.log(confession_name);

    if (!audioFile || !audioFile.name || audioFile.size === 0) {
      console.error('❌ No audio file or invalid file.');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const fileName = `${uuidv4()}.webm`;
    const deletionCode = nanoid(10);

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('confessions')
      .upload(fileName, buffer, {
        contentType: 'audio/webm',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin
      .from('confessions')
      .insert({
        audio_url: `confessions/${fileName}`,
        tags,
        deletion_code: deletionCode,
        description,
        confession_name
      })
      .select('deletion_code');

    if (dbError) {
      console.error('❌ Supabase DB insert error:', dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Confession uploaded', deletionCode });
  } catch (e) {
    console.error('❌ Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const page = parseInt(searchParams.get('page') || '1', 10)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error } = await supabaseAdmin
    .from('confessions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ confessions: data })
}
