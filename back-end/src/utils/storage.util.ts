import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export type StorageProvider = 'supabase' | 'local';

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function getStorageProvider(): StorageProvider {
  const provider = env('STORAGE_PROVIDER');
  if (provider === 'supabase' || provider === 'local') return provider;

  const hasSupabase =
    !!env('SUPABASE_URL') &&
    !!env('SUPABASE_SERVICE_ROLE_KEY') &&
    !!env('SUPABASE_STORAGE_BUCKET');
  return hasSupabase ? 'supabase' : 'local';
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function getSupabasePublicUrlForObjectKey(
  objectKey: string,
): string | null {
  const supabaseUrl = env('SUPABASE_URL');
  const bucket = env('SUPABASE_STORAGE_BUCKET');
  if (!supabaseUrl || !bucket) return null;
  if (!objectKey) return null;

  const normalized = objectKey.replace(/^\/+/, '');
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${normalized
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

function makeFileName(prefix: string, originalName: string): string {
  const ext = path.extname(originalName) || '';
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}-${Date.now()}-${random}${ext}`;
}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

export type UploadResult = {
  provider: StorageProvider;
  fileName: string;
  objectKey: string; // "photos/xxx.jpg" or "uploads/xxx.jpg"
  publicUrl: string; // absolute url for supabase, relative for local
};

export async function uploadImage(params: {
  folder: 'photos' | 'avatars';
  originalName: string;
  buffer: Buffer;
  contentType?: string;
}): Promise<UploadResult> {
  const provider = getStorageProvider();
  const fileName = makeFileName(
    params.folder === 'photos' ? 'Photo' : 'Avatar',
    params.originalName,
  );

  if (provider === 'local') {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const diskPath = path.join(uploadsDir, fileName);
    await fs.writeFile(diskPath, params.buffer);

    const objectKey = toPosix(path.join('uploads', fileName));
    return {
      provider,
      fileName,
      objectKey,
      publicUrl: objectKey,
    };
  }

  const supabaseUrl = env('SUPABASE_URL')!;
  const supabaseKey = env('SUPABASE_SERVICE_ROLE_KEY')!;
  const bucket = env('SUPABASE_STORAGE_BUCKET')!;

  const objectKey = `${params.folder}/${fileName}`;
  const uploadUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${objectKey
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': params.contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: new Uint8Array(params.buffer),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Supabase upload failed (${res.status}): ${body || res.statusText}`,
    );
  }

  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(
    bucket,
  )}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;

  return { provider, fileName, objectKey, publicUrl };
}

function tryParseSupabasePublicUrl(
  fileUrl: string,
): { bucket: string; objectKey: string } | null {
  try {
    const url = new URL(fileUrl);
    const marker = '/storage/v1/object/public/';
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;

    const rest = url.pathname.slice(idx + marker.length);
    const parts = rest.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const bucket = decodeURIComponent(parts[0]);
    const objectKey = parts
      .slice(1)
      .map((p) => decodeURIComponent(p))
      .join('/');
    return { bucket, objectKey };
  } catch {
    return null;
  }
}

export async function deleteStoredFile(filePathOrUrl: string): Promise<void> {
  if (!filePathOrUrl) return;

  // Supabase public URL stored in DB
  if (isHttpUrl(filePathOrUrl)) {
    const parsed = tryParseSupabasePublicUrl(filePathOrUrl);
    if (!parsed) return;

    const supabaseUrl = env('SUPABASE_URL');
    const supabaseKey = env('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) return;

    const deleteUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(
      parsed.bucket,
    )}/${parsed.objectKey.split('/').map(encodeURIComponent).join('/')}`;

    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
      },
    }).catch(() => undefined);

    return;
  }

  // Local disk path stored in DB (relative "uploads/xxx.jpg")
  const localPath = path.join(process.cwd(), filePathOrUrl);
  await fs.unlink(localPath).catch((error: any) => {
    if (error?.code !== 'ENOENT') throw error;
  });
}
