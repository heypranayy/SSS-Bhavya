/** Files in the R2 bucket are served by the Worker at /media/<key> (src/app/media/[...key]/route.ts). */
export const MEDIA_PREFIX = '/media/';

export function mediaUrl(key: string): string {
  return MEDIA_PREFIX + key.split('/').map(encodeURIComponent).join('/');
}
