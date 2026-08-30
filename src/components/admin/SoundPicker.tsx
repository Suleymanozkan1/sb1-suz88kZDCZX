'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconClose, IconMusic } from '@/components/invitation/Ornaments';
import { describeLimit, newFileName, uploadDirect, uploadLimits } from '@/lib/upload-client';
import type { Track } from '@/lib/music';

const TOKEN_URL = '/api/upload/token';
const PRESIGNED_URL = '/api/upload/presigned';

/**
 * Sesi depoya yükler ve adresini döndürür — görsel yükleyiciyle aynı yol.
 * Blob bağlıysa dosya doğrudan depoya gider; aksi hâlde sunucu ucundan.
 */
async function uploadAudio(file: File): Promise<string> {
  const limits = await uploadLimits(TOKEN_URL);
  if (file.size > limits.maxBytes) {
    throw new Error(`Dosya ${describeLimit(limits.maxBytes)} sınırını aşıyor`);
  }

  if (limits.mode !== 'sunucu') {
    const { url } = await uploadDirect(file, {
      tokenUrl: TOKEN_URL,
      presignedUrl: PRESIGNED_URL,
      mode: limits.mode,
      space: 'public',
      fileName: newFileName(file.type),
    });
    return url;
  }

  const form = new FormData();
  form.set('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Ses yüklenemedi (${response.status})`);
  }
  const { url } = await response.json();
  return url as string;
}

/**
 * Hazır seslerden biri seçilir ya da kendi dosyası yüklenir.
 *
 * Önce yalnızca bir adres kutusu vardı; bir adres yazmadan ses seçmek
 * mümkün değildi ve varsayılan adres de çalışmıyordu. Burada her seçenek
 * dinlenebilir, böylece davetiye yayına alınmadan önce sesin gerçekten
 * çaldığı görülür.
 */
export default function SoundPicker({
  label,
  hint,
  presets,
  value,
  onChange,
  allowNone = false,
}: {
  label: string;
  hint?: string;
  presets: Track[];
  value: string;
  onChange: (next: string) => void;
  allowNone?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState('');
  const [loading, setLoading] = useState('');
  /** Yarışan önizleme isteklerini ayırt eder. */
  const biletRef = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Sayfa değişince ya da bileşen kaldırılınca ses arkada çalmaya devam etmesin.
  useEffect(() => {
    return () => {
      biletRef.current += 1;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  /**
   * Önizleme.
   *
   * Üç ayrı sorun burada birleşiyordu:
   *
   *  1. play() reddedilen HER durumda "tarayıcı engelledi" deniyordu. Oysa
   *     ret sebebi çoğu zaman bu değil: dosya açılamamış (desteklenmeyen
   *     biçim, bozuk yükleme) ya da bir sonraki parçaya geçildiği için
   *     istek iptal edilmiş olabiliyor. Yanlış teşhis, çiftin sorunu
   *     tarayıcıda aramasına yol açıyordu.
   *  2. Bir parça çalarken başkasına basınca öncekinin bekleyen play()
   *     çağrısı iptal oluyor (AbortError) ve o iptal, yeni parça sorunsuz
   *     çalarken bile ekrana hata yazıyordu.
   *  3. Dosya ağdan gelene kadar düğme hiçbir şey söylemiyordu; yavaş
   *     bağlantıda "bastım, bir şey olmadı" hissi veriyordu.
   */
  async function preview(url: string) {
    if (!url) return;

    if (playing === url) {
      durdur();
      return;
    }

    // Yalnızca en son istek durumu değiştirebilsin.
    const bilet = ++biletRef.current;
    durdur();
    setError('');
    setLoading(url);

    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = 0.7;
    audio.onended = () => {
      if (biletRef.current === bilet) setPlaying('');
    };
    audioRef.current = audio;

    try {
      await audio.play();
      if (biletRef.current !== bilet) {
        audio.pause();
        return;
      }
      setPlaying(url);
    } catch (err) {
      if (biletRef.current !== bilet) return;
      const ad = err instanceof Error ? err.name : '';
      // Yeni bir önizlemeye geçildiği için iptal edildiyse söylenecek bir şey yok.
      if (ad !== 'AbortError') {
        setError(
          ad === 'NotAllowedError'
            ? 'Tarayıcı sesi engelledi. Sayfada bir yere tıklayıp tekrar deneyin.'
            : 'Bu ses dosyası açılamadı. Farklı bir biçimde (mp3) yüklemeyi deneyin.',
        );
      }
      setPlaying('');
    } finally {
      if (biletRef.current === bilet) setLoading('');
    }
  }

  function durdur() {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying('');
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await uploadAudio(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ses yüklenemedi');
    } finally {
      setBusy(false);
    }
  }

  const custom = Boolean(value) && !presets.some((p) => p.url === value);
  const options = [
    ...presets,
    ...(allowNone
      ? [{ id: '', url: '', label: 'Ses yok', description: 'Bu ses hiç çalınmaz.' }]
      : []),
  ];

  return (
    <div>
      <span className="field-label">{label}</span>
      {hint && (
        <p className="t-body mb-2" style={{ color: 'var(--c-on-dark-faint)' }}>
          {hint}
        </p>
      )}

      <div className="space-y-2">
        {options.map((track) => {
          const selected = value === track.url;
          return (
            <div
              key={track.id || 'yok'}
              className="flex items-center gap-3 px-4 py-3 transition-colors duration-300"
              style={{
                border: selected
                  ? '1px solid rgba(176, 141, 63, 0.55)'
                  : '1px solid rgba(176, 141, 63, 0.18)',
                background: selected ? 'rgba(176, 141, 63, 0.07)' : 'transparent',
              }}
            >
              <button
                type="button"
                onClick={() => onChange(track.url)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    border: '1px solid rgba(176, 141, 63, 0.5)',
                    color: 'var(--c-gold-light)',
                  }}
                >
                  {selected && <IconCheck size={10} />}
                </span>
                <span>
                  <span className="t-body block" style={{ color: 'var(--c-on-dark)' }}>
                    {track.label}
                  </span>
                  <span className="t-label block" style={{ color: 'var(--c-on-dark-faint)' }}>
                    {track.description}
                  </span>
                </span>
              </button>

              {track.url && (
                <button
                  type="button"
                  onClick={() => preview(track.url)}
                  aria-label={playing === track.url ? 'Durdur' : 'Dinle'}
                  disabled={loading === track.url}
                  className="shrink-0 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    border: '1px solid rgba(176, 141, 63, 0.35)',
                    color: 'var(--c-gold-light)',
                  }}
                >
                  {loading === track.url ? '…' : playing === track.url ? 'Durdur' : 'Dinle'}
                </button>
              )}
            </div>
          );
        })}

        {custom && (
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              border: '1px solid rgba(176, 141, 63, 0.55)',
              background: 'rgba(176, 141, 63, 0.07)',
            }}
          >
            <span style={{ color: 'var(--c-gold-light)' }}>
              <IconMusic size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="t-body block" style={{ color: 'var(--c-on-dark)' }}>
                Kendi ses dosyanız
              </span>
              <span
                className="t-label block truncate"
                style={{ color: 'var(--c-on-dark-faint)' }}
              >
                {value}
              </span>
            </span>
            <button
              type="button"
              onClick={() => preview(value)}
              className="shrink-0 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.18em]"
              style={{ border: '1px solid rgba(176, 141, 63, 0.35)', color: 'var(--c-gold-light)' }}
            >
              {loading === value ? '…' : playing === value ? 'Durdur' : 'Dinle'}
            </button>
            <button
              type="button"
              onClick={() => onChange(presets[0]?.url ?? '')}
              aria-label="Kaldır"
              className="shrink-0"
              style={{ color: '#e2a3a3' }}
            >
              <IconClose size={12} />
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="mt-3 w-full px-4 py-3 font-sans text-[11px] uppercase tracking-[0.18em] transition-colors duration-300"
        style={{ border: '1px dashed rgba(176, 141, 63, 0.35)', color: 'var(--c-gold-light)' }}
      >
        {busy ? 'Yükleniyor…' : 'Kendi ses dosyanızı yükleyin'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {error && (
        <p className="t-body mt-2" style={{ color: '#e2a3a3' }}>
          {error}
        </p>
      )}
    </div>
  );
}
