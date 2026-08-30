'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Divider,
  IconArrow,
  IconCamera,
  IconCheck,
  IconClose,
} from '@/components/invitation/Ornaments';
import {
  describeLimit,
  newFileName,
  uploadDirect,
  uploadLimits,
  type UploadLimits,
} from '@/lib/upload-client';

interface Queued {
  id: string;
  file: File;
  preview: string;
  status: 'bekliyor' | 'yükleniyor' | 'yüklendi' | 'hata';
  error?: string;
}

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

const TOKEN_URL = '/api/photos/token';
const PRESIGNED_URL = '/api/photos/presigned';

interface UploadMeta {
  slug: string;
  uploaderName: string;
  note: string;
  width: number;
  height: number;
}

/** Dosya tarayıcıdan doğrudan depoya gider; sunucuya yalnızca kayıt gönderilir. */
async function uploadThroughBlob(
  file: File,
  thumb: Blob | null,
  meta: UploadMeta,
  mode: 'jeton' | 'imzali',
): Promise<Response> {
  const ortak = {
    tokenUrl: TOKEN_URL,
    presignedUrl: PRESIGNED_URL,
    mode,
    space: 'private' as const,
    clientPayload: meta.slug,
  };

  const original = await uploadDirect(file, { ...ortak, fileName: newFileName(file.type) });

  let thumbName = original.fileName;
  if (thumb) {
    const uploaded = await uploadDirect(thumb, {
      ...ortak,
      fileName: newFileName('image/jpeg', '-thumb'),
    });
    thumbName = uploaded.fileName;
  }

  return fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...meta,
      fileName: original.fileName,
      thumbName,
      mimeType: file.type,
      size: file.size,
    }),
  });
}

/** Dosya sunucu ucundan geçer — yerel geliştirmede kullanılan yol. */
async function uploadThroughServer(
  file: File,
  thumb: Blob | null,
  meta: UploadMeta,
): Promise<Response> {
  const form = new FormData();
  form.set('slug', meta.slug);
  form.set('file', file);
  form.set('uploaderName', meta.uploaderName);
  form.set('note', meta.note);
  form.set('width', String(meta.width));
  form.set('height', String(meta.height));
  if (thumb) form.set('thumb', new File([thumb], 'thumb.jpg', { type: 'image/jpeg' }));

  return fetch('/api/photos', { method: 'POST', body: form });
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

  // Gerçek sınır yola bağlıdır (doğrudan yükleme mi, sunucudan mı), bu yüzden
  // sunucudan sorulur. Gelene kadar dosya eklemek engellenmez.
  const [limits, setLimits] = useState<UploadLimits>();
  useEffect(() => {
    uploadLimits(TOKEN_URL).then(setLimits);
  }, []);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;

    const max = limits?.maxBytes ?? 25 * 1024 * 1024;
    const tooBig = (file: File) => file.size > max;

    const next: Queued[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      next.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: tooBig(file) ? 'hata' : 'bekliyor',
        error: tooBig(file) ? `${describeLimit(max)} sınırını aşıyor` : undefined,
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
        const current = limits ?? (await uploadLimits(TOKEN_URL));
        if (item.file.size > current.maxBytes) {
          throw new Error(`${describeLimit(current.maxBytes)} sınırını aşıyor`);
        }

        const { blob, width, height } = await makeThumbnail(item.file);
        const meta = { slug, uploaderName, note, width, height };

        // Blob bağlıysa dosya doğrudan depoya gider ve sunucuya yalnızca
        // kaydın kendisi gönderilir. Telefon fotoğrafları Vercel'in 4,5 MB
        // istek sınırını aştığı için sunucudan geçen yol büyük dosyalarda
        // işlemeye hiç ulaşmıyordu.
        const response =
          current.mode === 'sunucu'
            ? await uploadThroughServer(item.file, blob, meta)
            : await uploadThroughBlob(item.file, blob, meta, current.mode);

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Yüklenemedi (${response.status})`);
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
      <div className="mb-[var(--sp-lg)] text-center">
        <p className="t-label" style={{ color: 'var(--c-gold)' }}>
          Fotoğraflarınız
        </p>
        <h1 className="t-display mt-4" style={{ color: 'var(--c-on-dark)' }}>
          {coupleNames}
        </h1>
        <div className="mt-[var(--sp-md)]" style={{ color: 'var(--c-gold)' }}>
          <Divider />
        </div>
        <p className="t-body mx-auto mt-[var(--sp-md)] measure" style={{ color: 'var(--c-on-dark-soft)' }}>
          Çektiğiniz fotoğrafları bizimle paylaşın — düğün albümümüzde yerini alsın.
        </p>
      </div>

      {doneCount > 0 && (
        <motion.div
          className="mb-[var(--sp-md)] flex items-center justify-center gap-3 py-[var(--sp-sm)]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderTop: '1px solid rgba(176, 141, 63, 0.3)',
            borderBottom: '1px solid rgba(176, 141, 63, 0.3)',
          }}
        >
          <span style={{ color: 'var(--c-gold-light)' }}>
            <IconCheck size={18} />
          </span>
          <p className="t-lead" style={{ color: 'var(--c-gold-light)' }}>
            <span className="numerals">{doneCount}</span> fotoğraf yüklendi — teşekkürler
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
        className="field t-lead"
        placeholder="Adınızı yazabilirsiniz"
      />

      <div className="mt-[var(--sp-md)]">
        <label className="field-label" htmlFor="uploader-note">
          Notunuz (İsteğe Bağlı)
        </label>
        <textarea
          id="uploader-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="field t-body resize-none"
          placeholder="Bir dilek bırakmak ister misiniz?"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group mt-[var(--sp-md)] flex w-full flex-col items-center justify-center px-4 py-[var(--sp-lg)] transition-colors duration-500"
        style={{
          border: '1px dashed rgba(176, 141, 63, 0.4)',
          color: 'var(--c-on-dark-soft)',
        }}
      >
        <span
          className="transition-transform duration-500 group-hover:-translate-y-1"
          style={{ color: 'var(--c-gold)' }}
        >
          <IconCamera size={30} />
        </span>
        <span className="t-lead mt-4">Fotoğraf Seç veya Çek</span>
        <span className="t-label mt-2" style={{ color: 'var(--c-on-dark-faint)' }}>
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
            className="mt-[var(--sp-md)] grid grid-cols-3 gap-[var(--sp-xs)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {queue.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="relative aspect-square overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Yerel önizleme blob URL'sidir; next/image optimizasyonu gerekmez. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />

                <div
                  className="absolute inset-x-0 bottom-0 px-1.5 py-1 text-center font-sans text-[10px]"
                  style={{
                    background: 'rgba(9,6,3,0.8)',
                    color:
                      item.status === 'yüklendi'
                        ? '#9ed7a8'
                        : item.status === 'hata'
                          ? '#e2a3a3'
                          : 'var(--c-gold-light)',
                  }}
                >
                  {item.status === 'hata' ? item.error : item.status}
                </div>

                {item.status !== 'yükleniyor' && (
                  <button
                    type="button"
                    onClick={() => removeAt(item.id)}
                    aria-label="Kaldır"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center transition-transform duration-500 hover:rotate-90"
                    style={{ background: 'rgba(9,6,3,0.75)', color: '#e2a3a3' }}
                  >
                    <IconClose size={12} />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {pending > 0 && (
        <button
          type="button"
          onClick={uploadAll}
          disabled={busy}
          className="cta nudge mt-[var(--sp-md)] w-full justify-center"
        >
          {busy ? 'Yükleniyor' : `${pending} Fotoğrafı Gönder`}
          <IconArrow size={14} />
        </button>
      )}

      <p className="t-body mt-[var(--sp-lg)] text-center" style={{ color: 'var(--c-on-dark-faint)' }}>
        Fotoğraflar yalnızca çiftin özel albümünde görünür.
      </p>
    </div>
  );
}
