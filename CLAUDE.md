# Sahra Davetiye — çalışma kuralları

## Her işten sonra tam audit ve QA — istisnasız

Kullanıcı bunu kalıcı bir kural olarak istedi. Küçük görünen bir
değişiklikten sonra bile atlanmaz: bu projede bulunan hataların çoğu
"tek satırlık" değişikliklerin yan etkisiydi.

Denetim **davranış ölçer, kod okumaz**. Kelime araması yalan söylüyor:
alan şemada duruyor diye sayfada çiziliyor olması gerekmiyor, metot
yazılmış diye çağrılıyor olması gerekmiyor. Her iddia gerçek kayıt
yolundan geçirilip ekrandan doğrulanır.

### Koşulacak turlar

Betikler: `/tmp/claude-0/.../scratchpad/` (oturum başına yeniden
kurulabilir), yardımcı PHP dosyaları `/tmp/wp-*.php`.

| Tur | Ne ölçer | Beklenen |
|---|---|---|
| `wp-audit-calistir.mjs` | her davetiye alanının sayfada etkisi | 49/49 |
| `salon-alan.mjs` | her salon alanının davetiyede etkisi | 7/7 |
| `audit-uyari.js` | 14 sayfada PHP uyarısı / JS hatası | 14 temiz |
| `audit-wp-rest.mjs` | her REST ucu, her rol | 13/13 |
| `wp-guvenlik.mjs` | XSS, yetki, dizin aşımı, yükleme, nonce | 18/18 |
| `giris-sinir.mjs` | wp-login devralınmıyor, /davet/giris çalışıyor | 12/12 |
| `kart-qa.mjs` | og etiketleri, bot erişimi, monogram sığması | 26/26 |
| `sihirbaz-qa.js` | sihirbazın davranışları | 8/8 |
| `wp-misafir.js` | katılım, dilek, fotoğraf yükleme | 3/3 |
| `panel-kontrast.js` | panelin her metninin kontrastı | ~1000 metin, 0 sorun |
| `wpon.js` | ön yüz kontrastı — 5 tema × 5 tasarım | hepsi temiz |
| `mobil.js` | 390px'te yatay taşma | taşma yok |
| `fark-olc.js` | tasarım/tema seçenekleri gerçekten farklı mı | en yakın çift ≥ %2 |
| `ayirt.js` | 9 mühür ayrı mı | 9/9 |
| `yol-tara.js` | panelde dosya yolu görünüyor mu | çift: hiç |
| `wp-hesap-sil3.php` | hesap silinince veri gidiyor mu | 7/7 |
| `wp-omur.php`, `wp-tarih-dogru.php`, `wp-uyari-test.php` | davetiye ömrü | 11/11 |
| `kart-silme.php`, `kart-omur.php` | silinen davetiyenin kartı gidiyor mu | 7/7 |

Sıfırdan kurmak için: `wp-sifirla.php` → zip'i `plugins/`e aç →
`wp-kur-test.php` → `wp-tohum.php` → `wp-roller-kur.php` → `wp-fixture.php`.

### Denetim yaparken düşülen tuzaklar

Bunların hepsi bu projede gerçekten oldu; tekrar edilmesin.

- **Aracın kendisi de denetlenir.** "Temiz" çıktısı, aracın doğru şeye
  baktığı doğrulanmadan güvenilmez. Betikleri toplu düzenlerken
  `/davet/giris` adresi davetiye adresine dönüştü ve giriş ekranı hiç
  ölçülmediği hâlde tur "14 temiz" dedi.
- **Hash karşılaştırması "farklı mı" sorusunu cevaplamaz.** Tek piksel
  fark "farklı" sayılıyordu; kullanıcı üç tasarımı aynı görüyordu.
  Gözle ayırt edilebilir piksel yüzdesi ölçülür.
- **Gradyanla boyanmış kutunun `backgroundColor`'ı saydam döner.**
  Kontrast tarayıcısı açık kâğıttaki metni koyu panelin üstünde sanıyordu.
- **Test sırası durumu bozar.** Ömür testi davetiyeyi taslağa çeker;
  arkasından koşan kart denetimi 404 sayfasını okur. Testler bilinen
  davetiyeyi hedeflemeli, "ilk gönderi"yi değil.
- **Beklenen değerler sabit yazılmaz**, veriden hesaplanır.
- **php -S yol önbelleği** sembolik bağ değişince eskiyi tutar; eklenti
  yerini değiştirdiysen sunucuyu yeniden başlat.
- **Sonucu olmayan bulgu yoktur:** yanlış alarmsa nedeni yazılır
  (`.notice-*` WordPress'in kendi sınıfları; `planla`/`bitti` işlev
  *referansı* olarak geçiyor), gerçekse düzeltilir.

## Ürün kuralları

- Sürüm **yalnızca WordPress**. Next.js sürümü bırakıldı, denetime girmez.
- Gelin solda, damat sağda — her yerde.
- Bölüm başlıkları sabit; ne çift ne yönetici değiştirir.
- Çiftin ekranında dosya yolu görünmez. Depolama sayfası istisna:
  ayarın kendisi orada ve çift giremiyor.
- Salon bilgisi (adres, yol tarifi, özellikler) yöneticinin; çift seçer,
  yazmaz.
- Yorumlar **neden**i anlatır, ne yaptığını değil. Kod ne yaptığını
  zaten söylüyor.
