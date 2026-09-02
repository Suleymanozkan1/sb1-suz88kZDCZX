/**
 * Blob kimlik bilgisinin bulunması.
 *
 * Vercel iki ayrı yolla kimlik doğrular ve hangisinin kullanıldığı depoyu
 * nasıl oluşturduğunuza bağlıdır:
 *
 *   • Okuma-yazma belirteci — `BLOB_READ_WRITE_TOKEN`. Bağlantıya önek
 *     verildiğinde ya da projede birden fazla depo olduğunda ad değişebilir
 *     (`<DEPO_ADI>_BLOB_READ_WRITE_TOKEN` gibi).
 *   • OIDC — `BLOB_STORE_ID` ile birlikte çalışma anında sağlanan
 *     `VERCEL_OIDC_TOKEN`. Bu durumda ortada hiç belirteç değişkeni olmaz.
 *
 * Yalnızca belirtece bakmak, depo projeye bağlıyken bile "dosya deposu bağlı
 * değil" denmesine yol açıyordu.
 */
const TOKEN_PREFIX = 'vercel_blob_rw_';

export type BlobAuth =
  | { mode: 'token'; token: string; source: string }
  | { mode: 'oidc'; storeId: string; source: string };

function findToken(): { name: string; value: string } | undefined {
  const direct = process.env.BLOB_READ_WRITE_TOKEN;
  if (direct) return { name: 'BLOB_READ_WRITE_TOKEN', value: direct };

  const entries = Object.entries(process.env);

  const suffixed = entries.find(
    ([name, value]) => name.endsWith('BLOB_READ_WRITE_TOKEN') && value,
  );
  if (suffixed) return { name: suffixed[0], value: suffixed[1] as string };

  const byShape = entries.find(([, value]) => value?.startsWith(TOKEN_PREFIX));
  if (byShape) return { name: byShape[0], value: byShape[1] as string };

  return undefined;
}

function findStoreId(): { name: string; value: string } | undefined {
  const direct = process.env.BLOB_STORE_ID;
  if (direct) return { name: 'BLOB_STORE_ID', value: direct };

  const suffixed = Object.entries(process.env).find(
    ([name, value]) => name.endsWith('BLOB_STORE_ID') && value,
  );
  if (suffixed) return { name: suffixed[0], value: suffixed[1] as string };

  return undefined;
}

export function blobAuth(): BlobAuth | undefined {
  const token = findToken();
  if (token) return { mode: 'token', token: token.value, source: token.name };

  // OIDC belirteci çalışma anında sağlanır; depo kimliği varsa SDK onu kullanır.
  const store = findStoreId();
  if (store) return { mode: 'oidc', storeId: store.value, source: store.name };

  return undefined;
}

/**
 * SDK çağrılarına verilecek kimlik seçenekleri.
 *
 * Belirteç her çağrıya açıkça verilir: SDK varsayılan olarak yalnızca
 * `BLOB_READ_WRITE_TOKEN` adına bakar, depo başka bir adla bağlanmışsa
 * belirteci bulmuş olmamıza rağmen istekler kimliksiz giderdi.
 */
export function blobAuthOptions(): { token?: string; storeId?: string } {
  const auth = blobAuth();
  if (!auth) return {};
  return auth.mode === 'token' ? { token: auth.token } : { storeId: auth.storeId };
}

/**
 * Tarayıcıdan doğrudan yükleme yalnızca okuma-yazma belirteci varken
 * mümkündür: istemci jetonu ondan türetilir. OIDC kipinde dosya sunucu
 * ucundan geçmek zorundadır.
 */
export function canMintClientToken(): boolean {
  return blobAuth()?.mode === 'token';
}

/** Hangi değişkenin kullanıldığı — kurulum teşhisinde gösterilir. */
export function blobTokenSource(): string | undefined {
  return blobAuth()?.source;
}
