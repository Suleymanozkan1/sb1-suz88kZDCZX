'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

/** Dosyayı base64 data URI'ye çevirir; seçilen görsel kayıtla birlikte saklanır. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}

const MAX_BYTES = 4 * 1024 * 1024;

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
  const images = Array.isArray(value) ? value : value ? [value] : [];

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError('');

    const accepted: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(`${file.name} 4 MB sınırını aşıyor.`);
        continue;
      }
      accepted.push(await readAsDataUrl(file));
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
        className="flex w-full flex-col items-center justify-center rounded-xl px-4 py-8 transition-all"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(201,168,76,0.3)',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span className="font-serif text-2xl" style={{ color: '#C9A84C' }}>
          ＋
        </span>
        <span className="mt-2 font-sans text-xs">📁 Tıklayın veya sürükleyin</span>
        {multiple && (
          <span className="mt-1 font-sans text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
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
        <p className="mt-2 font-sans text-xs" style={{ color: '#f0a3a3' }}>
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={`${src.slice(0, 20)}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl">
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
                  className="absolute left-1 top-1 rounded-full px-2 py-0.5 font-sans text-[9px]"
                  style={{ background: 'rgba(201,168,76,0.85)', color: '#1a0f08' }}
                >
                  Öne çıkan
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Görseli kaldır"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#f0a3a3' }}
              >
                ✕
              </button>

              {multiple && images.length > 1 && (
                <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Sola taşı"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs disabled:opacity-30"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#E8D5A3' }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Sağa taşı"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs disabled:opacity-30"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#E8D5A3' }}
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
