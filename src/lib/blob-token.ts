/**
 * Blob belirtecinin bulunması.
 *
 * Vercel bir Blob deposunu projeye bağlarken belirteci genellikle
 * `BLOB_READ_WRITE_TOKEN` adıyla ekler, ama bağlantıya bir önek verildiğinde
 * ya da projede birden fazla depo olduğunda ad değişir
 * (`SAGRADAVETIYE_BLOB_READ_WRITE_TOKEN` gibi). Tek bir ada bakmak, depo
 * gerçekten bağlıyken uygulamanın onu görmemesine yol açıyor — dışarıdan bu,
 * kurulumun eksik görünmesi ve yüklemenin reddedilmesi demek.
 *
 * Bu yüzden önce bilinen ad, sonra aynı adla biten değişkenler, en sonda da
 * belirtecin kendi biçimi (`vercel_blob_rw_…`) aranır.
 */
const TOKEN_PREFIX = 'vercel_blob_rw_';

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

export function blobToken(): string | undefined {
  return findToken()?.value;
}

/** Hangi değişkenin kullanıldığı — kurulum teşhisinde gösterilir. */
export function blobTokenSource(): string | undefined {
  return findToken()?.name;
}
