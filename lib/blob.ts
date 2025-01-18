import { put } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is not defined');
}

export async function uploadToBlob(file: File) {
  const { url } = await put(file.name, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return url;
}

