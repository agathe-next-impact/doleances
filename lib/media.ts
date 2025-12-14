// utils/media.ts
const MEDIA_CONFIG = {
  backendUrl: process.env.NEXT_PUBLIC_WP_BACKEND_URL || 'https://wpasso.fr',
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://lesdoleances.fr',
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || null // optionnel pour un CDN
};

export const transformMediaUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith(MEDIA_CONFIG.frontendUrl)) return url;
  if (MEDIA_CONFIG.cdnUrl) {
    return url.replace(MEDIA_CONFIG.backendUrl, MEDIA_CONFIG.cdnUrl);
  }
  return url.replace(MEDIA_CONFIG.backendUrl, MEDIA_CONFIG.frontendUrl);
};

export const transformWordPressMedia = (data: any): any => {
  if (!data) return data;
  const transformed = JSON.parse(JSON.stringify(data));
  const transformObject = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes(MEDIA_CONFIG.backendUrl)) {
        obj[key] = transformMediaUrl(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        transformObject(obj[key]);
      }
    }
  };
  transformObject(transformed);
  return transformed;
};
