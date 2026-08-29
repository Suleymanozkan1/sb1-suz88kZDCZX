'use client';

import { useEffect, useState } from 'react';

/**
 * Rastgele değerlerle üretilen dekoratif katmanlar sunucuda ve istemcide farklı
 * çıktı verir. Bu kanca, o katmanların yalnızca istemcide monte edildikten sonra
 * render edilmesini sağlayarak hydration uyuşmazlığını önler.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
