'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { IconClose, IconImage } from '@/components/invitation/Ornaments';

/**
 * Görseli depoya yükler ve adresini döndürür.
 *
 * Eskiden dosya base64'e çevrilip kaydın içine gömülüyordu; bu, her davetiye
 * satırını megabaytlarca büyütüyor ve sayfa yüklemesini yavaşlatıyordu.
 * Artık dosya bir kez yüklenir, kayıtta yalnızca adresi durur.
 */
async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.set('file', file);

  const response = await fetch('/api/upload', { method: 'POST', body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'Görsel yüklenemedi');
  }
  const { url } = await response.json();
  return url as string;
}

const MAX_BYTES = 25 * 1024 * 1024;

export default function ImageUploader({
  label,
  value,
  multiple = false,
  onChange,
}: {
  label: string;
  /** Tekli kullanımda data URI, çoklu kullanımda data URI dizisi. */
  value: string | string[];
  multiple?: boolean;
  onChange: (next: string | string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const images = Array.isArray(value) ? value : value ? [value] : [];

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setBusy(true);

    const accepted: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          setError(`${file.name} 25 MB sınırını aşıyor.`);
          continue;
        }
        accepted.push(await uploadImage(file));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi');
    } finally {
      setBusy(false);
    }

    if (accepted.length === 0) return;
    onChange(multiple ? [...images, ...accepted] : accepted[0]);
  }

  function removeAt(index: number) {
    if (multiple) onChange(images.filter((_, i) => i !== index));
    else onChange('');
  }

  /** Galeri sırası davetiyede birebir kullanıldığı için elle değiştirilebilir. */
  function move(index: number, delta: number) {
    const target = index + delta;
    if (!multiple || target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <span className="field-label">{label}</span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group flex w-full flex-col items-center justify-center px-4 py-[var(--sp-md)] transition-colors duration-500"
        style={{ border: '1px dashed rgba(176, 141, 63, 0.35)', color: 'var(--c-on-dark-soft)' }}
      >
        <span
          className="transition-transform duration-500 group-hover:-translate-y-0.5"
          style={{ color: 'var(--c-gold)' }}
        >
          <IconImage size={22} />
        </span>
        <span className="t-body mt-3">{busy ? 'Yükleniyor…' : 'Tıklayın veya sürükleyin'}</span>
        {multiple && (
          <span className="t-label mt-1" style={{ color: 'var(--c-on-dark-faint)' }}>
            Birden fazla fotoğraf ekleyin
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && (
        <p className="t-body mt-2" style={{ color: '#e2a3a3' }}>
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-[var(--sp-sm)] grid grid-cols-3 gap-[var(--sp-xs)] sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={`${src.slice(0, 20)}-${i}`} className="group relative aspect-square overflow-hidden">
              <Image
                src={src}
                alt={`Görsel ${i + 1}`}
                fill
                unoptimized
                sizes="120px"
                className="object-cover"
              />
              {multiple && i === 0 && (
                <span
                  className="absolute left-1 top-1 px-2 py-0.5 font-sans text-[9px]"
                  style={{ background: 'var(--c-gold-light)', color: 'var(--c-night)' }}
                >
                  Öne çıkan
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Görseli kaldır"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center opacity-0 transition-all duration-500 hover:rotate-90 group-hover:opacity-100"
                style={{ background: 'rgba(9,6,3,0.75)', color: '#e2a3a3' }}
              >
                <IconClose size={12} />
              </button>

              {multiple && images.length > 1 && (
                <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Sola taşı"
                    className="flex h-6 w-6 items-center justify-center text-xs disabled:opacity-30"
                    style={{ background: 'rgba(9,6,3,0.75)', color: 'var(--c-gold-light)' }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Sağa taşı"
                    className="flex h-6 w-6 items-center justify-center text-xs disabled:opacity-30"
                    style={{ background: 'rgba(9,6,3,0.75)', color: 'var(--c-gold-light)' }}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
