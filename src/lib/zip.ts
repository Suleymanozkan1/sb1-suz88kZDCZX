/**
 * Sıkıştırmasız ("store") ZIP üretici.
 *
 * Fotoğraflar zaten JPEG/PNG olduğu için sıkıştırma kazanç sağlamaz; bu yüzden
 * dosyalar olduğu gibi paketlenir. Arşiv parça parça yazıldığından yüzlerce
 * fotoğraflık bir galeri de belleğe tümüyle alınmadan indirilebilir.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Tarihi DOS zaman/tarih çiftine çevirir (ZIP başlıklarının beklediği biçim). */
function dosDateTime(date: Date): { time: number; date: number } {
  return {
    time:
      (Math.floor(date.getSeconds() / 2) & 0x1f) |
      ((date.getMinutes() & 0x3f) << 5) |
      ((date.getHours() & 0x1f) << 11),
    date:
      (date.getDate() & 0x1f) |
      (((date.getMonth() + 1) & 0x0f) << 5) |
      ((Math.max(date.getFullYear() - 1980, 0) & 0x7f) << 9),
  };
}

export interface ZipEntry {
  name: string;
  data: Uint8Array;
  date?: Date;
}

interface CentralRecord {
  name: Uint8Array;
  crc: number;
  size: number;
  offset: number;
  time: number;
  date: number;
}

function localHeader(name: Uint8Array, crc: number, size: number, time: number, dosDate: number) {
  const head = new Uint8Array(30);
  const view = new DataView(head.buffer);
  view.setUint32(0, 0x04034b50, true); // imza
  view.setUint16(4, 20, true); // gereken sürüm
  view.setUint16(6, 0x0800, true); // UTF-8 dosya adı
  view.setUint16(8, 0, true); // yöntem: store
  view.setUint16(10, time, true);
  view.setUint16(12, dosDate, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true); // sıkıştırılmış boyut
  view.setUint32(22, size, true); // asıl boyut
  view.setUint16(26, name.length, true);
  view.setUint16(28, 0, true); // ek alan yok

  const out = new Uint8Array(head.length + name.length);
  out.set(head, 0);
  out.set(name, head.length);
  return out;
}

function centralDirectory(records: CentralRecord[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  let size = 0;

  for (const record of records) {
    const head = new Uint8Array(46);
    const view = new DataView(head.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true); // üreten sürüm
    view.setUint16(6, 20, true); // gereken sürüm
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, record.time, true);
    view.setUint16(14, record.date, true);
    view.setUint32(16, record.crc, true);
    view.setUint32(20, record.size, true);
    view.setUint32(24, record.size, true);
    view.setUint16(28, record.name.length, true);
    view.setUint32(42, record.offset, true);

    const entry = new Uint8Array(head.length + record.name.length);
    entry.set(head, 0);
    entry.set(record.name, head.length);
    chunks.push(entry);
    size += entry.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, records.length, true);
  endView.setUint16(10, records.length, true);
  endView.setUint32(12, size, true);
  endView.setUint32(
    16,
    records.reduce((offset, r) => offset + 30 + r.name.length + r.size, 0),
    true,
  );
  chunks.push(end);

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
}

/** Girişleri talep geldikçe okuyup ZIP akışı üretir. */
export function zipStream(
  entries: AsyncIterable<ZipEntry> | Iterable<ZipEntry>,
): ReadableStream<Uint8Array> {
  const iterator =
    Symbol.asyncIterator in entries
      ? (entries as AsyncIterable<ZipEntry>)[Symbol.asyncIterator]()
      : (entries as Iterable<ZipEntry>)[Symbol.iterator]();

  const records: CentralRecord[] = [];
  const used = new Set<string>();
  let offset = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const next = await iterator.next();

      if (next.done) {
        controller.enqueue(centralDirectory(records));
        controller.close();
        return;
      }

      const entry = next.value;

      // Aynı ad iki kez gelirse arşiv bozulmasın diye sıra numarası eklenir.
      let name = entry.name;
      for (let i = 2; used.has(name); i++) {
        const dot = entry.name.lastIndexOf('.');
        name =
          dot > 0
            ? `${entry.name.slice(0, dot)}-${i}${entry.name.slice(dot)}`
            : `${entry.name}-${i}`;
      }
      used.add(name);

      const nameBytes = new TextEncoder().encode(name);
      const crc = crc32(entry.data);
      const { time, date } = dosDateTime(entry.date ?? new Date());

      controller.enqueue(localHeader(nameBytes, crc, entry.data.length, time, date));
      controller.enqueue(entry.data);

      records.push({ name: nameBytes, crc, size: entry.data.length, offset, time, date });
      offset += 30 + nameBytes.length + entry.data.length;
    },
  });
}
