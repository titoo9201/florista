import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, apiFetch, resolveAssetUrl } from '../lib/contentApi';
import { DEFAULTS } from '../content/sections';
import { mergeContent } from '../content/merge';
import { createWhatsApp } from '../lib/whatsapp';
import { business as builtInBusiness } from '../data/site';

const ContentContext = createContext(null);
const CACHE_KEY = 'florista_content_v1';

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || null;
  } catch {
    return null;
  }
}

function normalize(next) {
  const products = (next.products || []).map((product) => ({
    ...product,
    image: product.image && { ...product.image, src: resolveAssetUrl(product.image.src) },
    originalImage: product.originalImage && { ...product.originalImage, src: resolveAssetUrl(product.originalImage.src) },
    imageHistory: product.imageHistory?.map((image) => ({ ...image, src: resolveAssetUrl(image.src) })),
  }));
  const siteImages = Object.fromEntries(Object.entries(next.siteImages || {}).map(([key, image]) => [
    key,
    { ...image, src: resolveAssetUrl(image.src), previousImages: image.previousImages?.map((item) => ({ ...item, src: resolveAssetUrl(item.src) })) },
  ]));
  return { ...next, products, siteImages, sections: next.sections || {} };
}

export function ContentProvider({ children }) {
  // Last known content is cached so returning visitors see the admin's latest text/prices immediately.
  const [content, setContent] = useState(() => {
    const cached = readCache();
    return cached ? normalize(cached) : null;
  });

  const refresh = useCallback(async () => {
    try {
      const next = await apiFetch('/api/content');
      setContent(normalize(next));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* storage full or blocked — fine */
      }
    } catch {
      // The static imports remain the intentional offline fallback.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({
    apiUrl: API_URL,
    content,
    refresh,
    getProducts(collection, fallback) {
      if (!content?.seeded) return fallback;
      return content.products.filter((item) => item.collection === collection && !item.hidden);
    },
    getImage(key, fallback) {
      const saved = content?.siteImages?.[key];
      return saved?.src ? { ...fallback, ...saved } : fallback;
    },
    getSection(path) {
      return mergeContent(DEFAULTS[path], content?.sections?.[path]);
    },
  }), [content, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside ContentProvider');
  return value;
}

/** Website text/settings for one section (built-in text + the admin's saved changes). */
export function useSection(path) {
  const { getSection } = useContent();
  return useMemo(() => getSection(path), [getSection, path]);
}

/** Business email shown on the website — set by the developer (ENQUIRY_TO_EMAIL on the server), not the admin. */
export function useContactEmail() {
  const { content } = useContent();
  return content?.contactEmail || builtInBusiness.email;
}

/** WhatsApp helpers using the number/messages from the admin panel (default: server's WHATSAPP_NUMBER). */
export function useWhatsApp() {
  const config = useSection('site.whatsapp');
  return useMemo(() => createWhatsApp(config), [config]);
}
