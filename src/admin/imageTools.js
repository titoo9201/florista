import { apiFetch, authHeaders } from '../lib/contentApi';

const ACCEPTED = /^image\/(jpeg|png|webp)$/;
export const IMAGE_HELP = 'JPG, PNG or WebP. Big photos are resized automatically before upload.';

/** Resizes a photo in the browser (max 1800px, WebP) so uploads stay small and pages stay fast. */
export async function prepareImage(file, { maxSize = 1800, quality = 0.85 } = {}) {
  if (!file || !ACCEPTED.test(file.type)) throw new Error('Please choose a JPG, PNG or WebP photo.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/jpeg', quality); // very old Safari
  return { dataUrl, width, height };
}

/** Compresses and uploads a photo; returns { src: '/api/images/<id>', width, height }. */
export async function uploadImage(file, token) {
  const prepared = await prepareImage(file);
  const { src } = await apiFetch('/api/admin/uploads', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(prepared),
  });
  return { src, width: prepared.width, height: prepared.height };
}
