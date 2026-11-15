import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, apiFetch, resolveAssetUrl } from '../lib/contentApi';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);

  const refresh = async () => {
    try {
      const next = await apiFetch('/api/content');
      const products = next.products.map((product) => ({
        ...product,
        image: product.image && { ...product.image, src: resolveAssetUrl(product.image.src) },
        originalImage: product.originalImage && { ...product.originalImage, src: resolveAssetUrl(product.originalImage.src) },
        imageHistory: product.imageHistory?.map((image) => ({ ...image, src: resolveAssetUrl(image.src) })),
      }));
      const siteImages = Object.fromEntries(Object.entries(next.siteImages || {}).map(([key, image]) => [
        key,
        { ...image, src: resolveAssetUrl(image.src), previousImages: image.previousImages?.map((item) => ({ ...item, src: resolveAssetUrl(item.src) })) },
      ]));
      setContent({ ...next, products, siteImages });
    } catch {
      // The static imports remain the intentional offline fallback.
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({
    apiUrl: API_URL,
    content,
    refresh,
    getProducts(collection, fallback) {
      if (!content?.seeded) return fallback;
      return content.products.filter((item) => item.collection === collection && !item.hidden);
    },
    getImage(key, fallback) {
      return content?.siteImages?.[key] || fallback;
    },
  }), [content]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside ContentProvider');
  return value;
}
