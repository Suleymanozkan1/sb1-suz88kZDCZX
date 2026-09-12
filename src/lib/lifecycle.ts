import { deleteInvitation, getSettings, listInvitations, updateInvitation } from './store';
import { removeFiles } from './files';
import type { Invitation } from './types';

/**
 * Davetiyenin ömrü — WordPress sürümündeki `Sahra_Lifecycle`'ın karşılığı.
 *
 * Düğün bittikten sonra davetiye kimseye lazım değil: link elden ele
 * dolaşmaya devam ediyor, arama motorlarına düşüyor ve çiftin adresi,
 * telefonu, IBAN'ı süresiz açıkta kalıyor. Bu yüzden düğünden bir gün
 * sonra davetiye YAYINDAN KALKAR.
 *
 * Silme ise ayrı ve çok daha geç bir adım. Misafir fotoğrafları çiftin
 * düğün albümü — bir gün sonra silmek, albümünü indirmeyi unutan çiftin
 * fotoğraflarını yok etmek demekti.
 */

function bugun(): string {
  // Sunucunun saat dilimi ne olursa olsun Türkiye günü esas alınır:
  // düğün 23:00'te biterken UTC'de ertesi gün başlamış oluyor.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
}

function gunEkle(tarih: string, gun: number): string {
  const t = new Date(`${tarih}T00:00:00Z`);
  if (Number.isNaN(t.getTime())) return tarih;
  t.setUTCDate(t.getUTCDate() + gun);
  return t.toISOString().slice(0, 10);
}

const GECERLI_TARIH = /^\d{4}-\d{2}-\d{2}$/;

export interface LifecycleResult {
  unpublished: string[];
  deleted: string[];
}

/** Günlük bakım: süresi dolanı yayından kaldır, çok eskiyi sil. */
export async function runLifecycle(): Promise<LifecycleResult> {
  const settings = await getSettings();
  const { unpublishDays, deleteDays, deleteEnabled } = settings.lifecycle;
  const gun = bugun();

  const sonuc: LifecycleResult = { unpublished: [], deleted: [] };
  const rows = await listInvitations();

  for (const inv of rows) {
    // Tarihsiz davetiyeye dokunulmaz: ne zaman biteceği bilinmiyor.
    if (!GECERLI_TARIH.test(inv.weddingDate)) continue;

    const kapanma = gunEkle(inv.weddingDate, unpublishDays);

    if (inv.isActive && gun >= kapanma) {
      await updateInvitation(inv.id, { isActive: false });
      sonuc.unpublished.push(inv.id);
      continue;
    }

    if (!deleteEnabled || inv.isActive) continue;

    /*
     * Silme sayacı düğün gününden değil YAYINDAN KALKMA gününden başlar;
     * yönetici davetiyeyi elle yayından kaldırdıysa da aynı süre işlesin.
     * Elle kaldırılanlar için `updatedAt` en iyi yaklaşım.
     */
    const kalkis = kapanma > inv.updatedAt.slice(0, 10) ? kapanma : inv.updatedAt.slice(0, 10);

    if (gun >= gunEkle(kalkis, deleteDays)) {
      const { files } = await deleteInvitation(inv.id);
      await removeFiles(files);
      sonuc.deleted.push(inv.id);
    }
  }

  return sonuc;
}

/** Panelde gösterilen özet — çift sormadan görmeli. */
export function lifecycleSummary(
  invitation: Pick<Invitation, 'weddingDate'>,
  lifecycle: { unpublishDays: number; deleteDays: number; deleteEnabled: boolean },
  formatDate: (d: string) => string,
): string {
  if (!GECERLI_TARIH.test(invitation.weddingDate)) return '';

  const kapanma = gunEkle(invitation.weddingDate, lifecycle.unpublishDays);
  let metin = `Davetiye ${formatDate(kapanma)} tarihinde yayından kalkar.`;

  if (lifecycle.deleteEnabled) {
    metin += ` Fotoğraflar ve katılımlar ${formatDate(gunEkle(kapanma, lifecycle.deleteDays))} tarihine kadar panelde durur.`;
  }

  return metin;
}
