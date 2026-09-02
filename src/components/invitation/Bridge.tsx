/**
 * Bölüm köprüsü — rengin döndüğü, metin barındırmayan nefes aralığı.
 *
 * Renk dönüşü neden burada: önce tüm sayfa boyunca uzanan tek bir gradyan
 * vardı ve durakları sayfa YÜZDESİNE göre yerleştirilmişti. Bu, içeriğin
 * uzunluğuna bağımlıydı — bir davetiyeye fazladan fotoğraf, soru ya da
 * program satırı eklenince bölümler kayıyor, koyu metin açık zemine (ya da
 * tersi) düşüyordu. Aynı hata iki kez yaşandı.
 *
 * Artık dönüş burada, iki evrenin arasında oluyor. Köprünün kendisinde
 * hiç metin yok, dolayısıyla ara tonların üzerinde okunacak bir şey de yok;
 * içerik ne kadar uzarsa uzasın bölümler kendi düz zeminlerinde kalır.
 */
export default function Bridge({
  direction,
  height = 'clamp(9rem, 26vh, 17rem)',
}: {
  /** toLight: geceden gündüze · toDark: gündüzden geceye */
  direction: 'toLight' | 'toDark';
  height?: string;
}) {
  /*
     Duraklar (renk, yüzde) çifti olarak tutulur.

     Önce yalnızca dizi ters çevriliyordu ama yüzdeler yerinde kalıyordu:
     "sand %88, #ddc9a8 %76" gibi geriye giden bir sıra çıkıyor, tarayıcı
     azalan durakları öncekine sabitliyor ve gradyan bir yerde ani kesmeye
     dönüşüyordu. Aşağı yönde konumun kendisi de yansıtılmalı.
  */
  const duraklar: [string, number][] = [
    ['var(--c-night)', 0],
    ['var(--c-ink)', 8],
    ['var(--c-ember)', 18],
    ['var(--c-bridge-a)', 28],
    ['var(--c-bronze)', 40],
    ['var(--c-bridge-b)', 52],
    ['var(--c-tan)', 64],
    ['var(--c-bridge-c)', 76],
    ['var(--c-sand)', 88],
    ['var(--c-cream)', 100],
  ];

  /*
     Köprünün açık ucu, komşusu olan evrenin o kenardaki rengiyle aynı
     olmalı. Açık evre krem başlayıp kumla bittiği için yukarı yönde uç
     krem, aşağı yönde kumdur; ikisini de krem yapmak köprünün üstünde
     görünür bir basamak bırakıyordu.
  */
  const acikUc = direction === 'toLight' ? 'var(--c-cream)' : 'var(--c-sand)';
  const tamSira: [string, number][] = duraklar.map(([renk, yuzde]) =>
    yuzde === 100 ? [acikUc, 100] : [renk, yuzde],
  );

  const sira =
    direction === 'toLight'
      ? tamSira
      : [...tamSira].reverse().map(([renk, yuzde]): [string, number] => [renk, 100 - yuzde]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height, background: `linear-gradient(180deg, ${sira.map(([r, y]) => `${r} ${y}%`).join(', ')})` }}
      aria-hidden
    >
      <span
        className="block w-px"
        style={{
          height: '34%',
          background: 'linear-gradient(180deg, transparent, rgba(176,141,63,0.4), transparent)',
        }}
      />
    </div>
  );
}
