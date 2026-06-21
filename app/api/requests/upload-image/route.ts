import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { authOptions } from '@/lib/auth';
import getSupabaseAdmin from '@/lib/supabase-server';
import { checkRequestRateLimitShared, rateLimitResponse } from '@/lib/rate-limit';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await checkRequestRateLimitShared(request, 'request-image-upload', 30, 60 * 60 * 1000, session.user.id);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, or GIF images are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${session.user.id}-${randomUUID()}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const bucket = process.env.REQUEST_IMAGES_BUCKET || 'request-images';
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (storageError) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[requests/upload-image] Supabase upload failed in production:', storageError);
        return NextResponse.json(
          { error: 'Image storage is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      console.warn('[requests/upload-image] Supabase upload unavailable, using local dev storage:', storageError);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'request-images');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      return NextResponse.json({ url: `/uploads/request-images/${fileName}` });
    }
  } catch (error) {
    console.error('[requests/upload-image] Error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
