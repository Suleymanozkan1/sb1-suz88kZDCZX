'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface Queued {
  id: string;
  file: File;
  preview: string;
  status: 'bekliyor' | 'yükleniyor' | 'yüklendi' | 'hata';
  error?: string;
}

const MAX_BYTES = 25 * 1024 * 1024;
const THUMB_EDGE = 720;

/**
 * Orijinal dosyaya hiç dokunmadan, yalnızca galeri ızgarası için küçük bir
 * önizleme üretir. Böylece sunucuda görüntü işleme bağımlılığı gerekmez ve
 * indirilebilir fotoğraf tam çözünürlükte kalır.
 */
async function makeThumbnail(
  file: File,
): Promise<{ blob: Blob | null; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Görsel okunamadı'));
      img.src = url;
    });

    const scale = Math.min(1, THUMB_EDGE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');
    if (!context) return { blob: null, width: image.width, height: image.height };
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82),
    );
    return { blob, width: image.width, height: image.height };
  } catch {
    return { blob: null, width: 0, height: 0 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PhotoUpload({
  slug,
  coupleNames,
}: {
  slug: string;
  coupleNames: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;

    const next: Queued[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      next.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: file.size > MAX_BYTES ? 'hata' : 'bekliyor',
        error: file.size > MAX_BYTES ? '25 MB sınırını aşıyor' : undefined,
      });
    }
    setQueue((q) => [...q, ...next]);
  }

  function removeAt(id: string) {
    setQueue((q) => {
      const target = q.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return q.filter((item) => item.id !== id);
    });
  }

  async function uploadAll() {
    setBusy(true);

    for (const item of queue) {
      if (item.status !== 'bekliyor') continue;
      setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: 'yükleniyor' } : x)));

      try {
        const { blob, width, height } = await makeThumbnail(item.file);

        const form = new FormData();
        form.set('slug', slug);
        form.set('file', item.file);
        form.set('uploaderName', uploaderName);
        form.set('note', note);
        form.set('width', String(width));
        form.set('height', String(height));
        if (blob) form.set('thumb', new File([blob], 'thumb.jpg', { type: 'image/jpeg' }));

        const response = await fetch('/api/photos', { method: 'POST', body: form });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? 'Yüklenemedi');
        }

        setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, status: 'yüklendi' } : x)));
        setDoneCount((n) => n + 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Yüklenemedi';
        setQueue((q) =>
          q.map((x) => (x.id === item.id ? { ...x, status: 'hata', error: message } : x)),
        );
      }
    }

    setBusy(false);
  }

  const pending = queue.filter((item) => item.status === 'bekliyor').length;

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <div className="mb-10 text-center">
        <span className="font-serif text-2xl" style={{ color: '#C9A84C' }}>
          ✦
        </span>
        <h1 className="t-display mt-4" style={{ color: 'var(--c-on-dark)' }}>{coupleNames}</h1>
        <p
          className="mt-4 font-sans text-sm font-light leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Çektiğiniz fotoğrafları bizimle paylaşın — düğün albümümüzde yerini alsın.
        </p>
      </div>

      {doneCount > 0 && (
        <motion.div
          className="mb-6 rounded-2xl px-5 py-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          <p className="font-serif text-lg font-light" style={{ color: '#E8D5A3' }}>
            {doneCount} fotoğraf yüklendi — teşekkürler! 🌸
          </p>
        </motion.div>
      )}

      <label className="field-label" htmlFor="uploader-name">
        Adınız (İsteğe Bağlı)
      </label>
      <input
        id="uploader-name"
        value={uploaderName}
        onChange={(e) => setUploaderName(e.target.value)}
        className="field"
        placeholder="Adınızı yazabilirsiniz"
      />

      <div className="mt-4">
        <label className="field-label" htmlFor="uploader-note">
          Notunuz (İsteğe Bağlı)
        </label>
        <textarea
          id="uploader-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="field resize-none"
          placeholder="Bir dilek bırakmak ister misiniz?"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex w-full flex-col items-center justify-center rounded-2xl px-4 py-10 transition-all"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(201,168,76,0.35)',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <span className="text-3xl">📸</span>
        <span className="mt-3 font-sans text-sm">Fotoğraf Seç veya Çek</span>
        <span className="mt-1 font-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Birden fazla seçebilirsiniz · en fazla 25 MB
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            className="mt-6 grid grid-cols-3 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {queue.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="relative aspect-square overflow-hidden rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Yerel önizleme blob URL'sidir; next/image optimizasyonu gerekmez. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />

                <div
                  className="absolute inset-x-0 bottom-0 px-1.5 py-1 text-center font-sans text-[10px]"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    color:
                      item.status === 'yüklendi'
                        ? '#86efac'
                        : item.status === 'hata'
                          ? '#f0a3a3'
                          : '#E8D5A3',
                  }}
                >
                  {item.status === 'hata' ? item.error : item.status}
                </div>

                {item.status !== 'yükleniyor' && (
                  <button
                    type="button"
                    onClick={() => removeAt(item.id)}
                    aria-label="Kaldır"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#f0a3a3' }}
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {pending > 0 && (
        <button type="button" onClick={uploadAll} disabled={busy} className="btn-gold mt-6 w-full">
          {busy ? 'Yükleniyor…' : `${pending} Fotoğrafı Gönder`}
        </button>
      )}

      <p
        className="mt-10 text-center font-sans text-[11px] leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Fotoğraflar yalnızca çiftin özel albümünde görünür.
      </p>
    </div>
  );
}
