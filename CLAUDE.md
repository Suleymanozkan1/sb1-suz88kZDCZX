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
| `wp-audit-alan.php` → `wp-fixture.php` → `wp-audit-calistir.mjs` | her davetiye alanının sayfada etkisi | 42/42 |
| `salon-alan.mjs` | her salon alanı + marka eşleşmesi | 14/14 |
| `audit-uyari.js` | 15 sayfada PHP uyarısı / JS hatası | 15 temiz |
| `audit-wp-rest.mjs` | her REST ucu, her rol | 13/13 |
| `wp-guvenlik.mjs` | XSS, yetki, dizin aşımı, yükleme, nonce | 18/18 |
| `giris-sinir.mjs` | wp-login devralınmıyor, /davet/giris çalışıyor | 12/12 |
| `kart-qa.mjs` | og etiketleri, bot erişimi, monogram sığması | 26/26 |
| `sihirbaz-qa.js` | sihirbazın davranışları | 8/8 |
| `wp-misafir.js` | katılım, dilek, fotoğraf yükleme | 3/3 |
| `panel-kontrast.js` | panelin her metninin kontrastı | ~2200 metin, 0 sorun |
| `on-tara.sh` (`wpon.js`) | ön yüz kontrastı — 5 tema × 5 tasarım | 25 birleşim temiz |
| `mobil.js` | 390px'te yatay taşma | taşma yok |
| `fark-olc.js <alan> <seçenekler>` | tasarım/tema seçenekleri gerçekten farklı mı | en yakın çift ≥ %2 |
| `ayirt.js <etiket> <url> seal <mühürler>` | 9 mühür ayrı mı | 9/9 |
| `yol-tara.js` | panelde dosya yolu görünüyor mu | çift: hiç |
| `wp-hesap-sil3.php` | hesap silinince veri gidiyor mu (davetli listesi dahil) | 8/8 |
| `wp-omur.php`, `wp-tarih-dogru.php`, `wp-uyari-test.php` | davetiye ömrü | 11/11 |
| `kart-silme.php`, `kart-omur.php` | silinen davetiyenin kartı gidiyor mu | 7/7 |
| `slug-guncelle.php`, `slug-isimsiz.php` | tarih/isim sonradan girilince adres | 14/14 |
| `slug-kart.php` | adres değişince eski kart siliniyor mu | öksüz yok |
| `eski-link.php` | dağıtılmış eski link yenisine taşınıyor mu | 6/6 |
| `qr-omur.php` | basılmış QR adres değişince de çalışıyor mu | 10/10 |
| `adres-kenar.php` | taşımanın kenarları: devralınan adres, döngü, kapalı davetiye | 7/7 |
| `kurulum-denetim.php` | her kurulum koşulu kurulup bulgu çıkıyor mu | 19/19 |
| `kurulum-ekran.js` | bulgu ekranda çiziliyor, çift görmüyor | 4/4 |
| `musteri-istekleri.php` | çocuk varsayılanı, salon alanları, paylaşım açıklaması, tarih koruması | 16/16 |
| `musteri-ekran.js` | tarih yalnızca takvimden, adımlar veri kaybetmiyor, çıkış uyarısı | 10/10 |
| `tema-denetim.js` | tarayıcının çizdiği parçalar iki işletim sistemi temasında | 58/58 |
| `musteri2.php` | salon adı, yazım onarımı, dilek başlığı yöneticide, sabit bağlaç | 24/24 |
| `tarih-takvim.js` | dokununca takvim açılıyor; takvimsiz tarayıcıda alan kullanılabilir | 5/5 |
| `yazim-okuma.php` | güncellemeden önce girilmiş davetiyenin yazımı ekranda düzeliyor mu | 24/24 |
| `istek10.php` | kalkan alanlar, hediye Yok/Var, otomatik program, marka, katılım raporu (listesiz kip) | 63/63 |
| `yukari-qa.js` | yukarı çık butonu (masaüstü + mobil), konumda seçim alanı yok | 18/18 |
| `form-qa.js` | panelin GERÇEK form POST'u: katılım anahtarı yöneticide, çift kurcalayamıyor, çelişen iki denetim yok | 18/18 |
| `davetli.php` | davetli listesi: eşleştirme (ad/telefon), sayılar, rapor, gizlilik, kademeli silme | 43/43 |
| `davetli-ekran.js` | davetli ekranı: form kaydediyor, durum tablosu modelle uyuşuyor, başkasının listesi sızmıyor | 17/17 |
| `sosyal-punto.php` | sürüm damgası, marka hesabı, kullanıcı adından bağlantı, ekranda @kullanıcı, açılış videosu | 27/27 |
| `sikistir.php` | yükleme öncesi küçültme ve yeniden sıkıştırma | 10/10 |
| `dilek-onay.php` | dilek onaysız yayımlanmıyor, adressiz istek hiçbir davetiyeye yazmıyor | 15/15 |
| `gorsel-punto.js` | görsel adresleri gizli, hediye alanları seçime bağlı, perde videosu, Kaydır düğmesi, en küçük punto 14px, uçtan uca sıkıştırma | 35/35 |

Sıfırdan kurmak için: `wp-sifirla.php` → zip'i `plugins/`e aç →
`wp-kur-test.php` → `wp-tohum.php` → `wp-roller-kur.php` → `wp-fixture.php`.

**Sıra:** ömür (`wp-omur.php`) ve hesap silme turları fixture'ı taslağa
çeker ya da siler; onlardan sonra koşan tarayıcı turları 404 okuyup her
şeyi "yok" der. Tarayıcı turları ÖNCE, ömür/silme turları EN SON — ya da
aralarında `wp-fixture.php` yeniden koşulur.

**Eşzamanlı koşulmaz.** Kontrast taraması 25 birleşim için aynı
davetiyenin temasını ve tasarımını yazıyor; arka planda koşarken PHP
turlarını başlatmak ikisini birden bozuyor (turlar taramanın yazdığı
durumu, tarama turların yazdığını okuyor). Bir tur biterken öteki
başlar.

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
  arkasından koşan kart denetimi 404 sayfasını okur. Instagram testi
  davetiyenin salonunu değiştirir; salon denetimi yanlış salonu yamalayıp
  "hiçbir alan görünmüyor" der. Testler hedefi VERİDEN okumalı — sabit bir
  kimlik ya da "ilk gönderi" değil.
- **Beklenen değerler sabit yazılmaz**, veriden hesaplanır.
- **php -S yol önbelleği** sembolik bağ değişince eskiyi tutar; eklenti
  yerini değiştirdiysen sunucuyu yeniden başlat.
- **Boş ölçüm bir sonuç değildir.** Araç hiçbir şey ölçmeden de
  "geçti" diyebiliyor: `fark-olc.js` argümansız çağrılınca
  karşılaştıracak çift bulamadan "hepsi farklı" dedi; `audit-uyari.js`
  olmayan bir kimlikle sihirbazı açtığı için "0 adım" gezip temiz
  saydı. Turun KAÇ şey ölçtüğü de okunur, yalnızca sonucu değil.
- **Var olmayan seçeneği ölçmek.** Temalar `blush-rose`/`sage-ivory`
  diye ölçüldü; ikisi de yok, ürün sessizce varsayılana düşüyor ve
  fark %0.00 çıkıyordu. Seçenek listesi üründen okunur, akıldan değil.
- **Kontrast turu "çirkin"i ölçmez.** Çıplak bir input beyaz üstüne
  siyah yazıdır ve kontrastı GEÇER; koyu sayfada beyaz bir kutu olarak
  durması ayrı bir ölçüttür. Tarayıcının çizdiği parçalar (otomatik
  doldurma, takvim simgesi, açılır liste, kaydırma çubuğu) `tema-denetim.js`
  ile iki işletim sistemi temasında ayrıca ölçülür.
- **Stil okumadan önce tarayıcı yenilemeyi bekler.** `el.focus()`
  çağırıp hemen `getComputedStyle` okumak eski değeri veriyor ve odak
  göstergesi "hiç değişmiyor" sanılıyordu. Odak sayfanın DIŞINDAN
  verilip beklenmeli.
- **Değişken kökte olmayabilir.** Panelde belirteçler `body.sahra-ekran`
  üzerinde; `documentElement`'ten okumak `var(--c-night)`'ı krem
  gösteriyordu.
- **Oturum açıkken /davet/giris panele yönleniyor.** Misafir sayfaları
  oturumsuz bir bağlamda ölçülür; aynı bağlamda ölçmek "sayfa yok"
  diyordu.
- **`:not()` özgüllük ekler.** On `:not()` zinciri temel kuralı
  (0,11,1) yapıyor; kısa yazılmış `:focus` kuralı altta kalıp hiç
  uygulanmıyordu.
- **Bir etiketi bağlantısız ölçmek.** `venueInstagramLabel` hesap
  adresi boşken ölçüldü; etiketleyecek bağlantı olmayınca görünmüyor ve
  "alan çalışmıyor" sanıldı. Alan, gerçek kullanım bağlamında ölçülür.
- **Turun HEDEFİ veriden okunur, aracın içine yazılmaz.** Bu bir kere
  daha, iki ayrı araçta oldu: `wp-audit-calistir.mjs` adresi sabit
  tutuyordu, fixture yeniden kurulunca slug'a `-2` eklendi ve tur 46
  alanın hepsini "sayfada karşılığı yok" saydı; `wp-secim.php` de sabit
  slug'la sorguladığı için tarih değişip adres güncellenince HİÇBİR ŞEY
  yazmadan sessizce döndü ve dokuz mührün dokuzu aynı ekran görüntüsünü
  verince tur ürünü suçladı. Araç hedefi bulamazsa yüksek sesle düşmeli.
- **Şemada olmayan alana yazmak sessiz bir hiçliktir.** `fark-olc.js`
  `design` diye çağrıldı; şemadaki ad `invitationDesign`. Junk anahtar
  yazıldı, sayfa hiç değişmedi ve beş tasarım "%0.00 aynı" çıktı.
  `wp-secim.php` artık şema dışı alanı reddediyor.
- **Eksik ölçüm de boş ölçüm sayılır.** `wpon.js` etiketsiz çağrılınca
  25 birleşimden BİRİNİ ölçüp "== undefined: temiz" dedi ve tarama
  tamamlanmış sanıldı; `ayirt.js` argümansız çağrılınca "0 seçenek, 0
  ayrı görünüm" ile "hepsi farklı" dedi. Argüman alan tur, argümansız
  çalışmayı reddeder.
- **Seed betiği ürünle birlikte eskir.** `wp-audit-alan.php` şemadan
  çıkarılmış 23 bölüm başlığını ve `conjunction`'ı ölçmeye devam
  ediyordu. Alan listesi `Sahra_Fields::defaults()` ile süzülüyor
  (`wp-audit-suz.php`).
- **Kayıt yolundaki kural GEÇMİŞ veriyi düzeltmez.** Yazım onarımı
  yalnızca `sanitize()`'a eklenmişti; güncellemeden önce girilmiş
  davetiye çift onu bir daha kaydetmedikçe ekranda "şaHin" kalıyordu.
  Böyle bir kural okuma yoluna da konur.
- **Tur kendi bıraktığı duruma takılır.** `wp-uyari-test.php`'nin 4.
  adımı "yayından kalktı" damgasını yazıyor ve temizlemiyordu; ikinci
  koşuda 1–2. adımlar düğün tarihinden saydığını varsaydığı hâlde ürün
  (doğru biçimde) o damgadan sayınca tur ürünü suçladı. Her tur iki kez
  koşulabilmeli; bıraktığı damgayı kendisi siler.
- **Süzülen çıktıda çöken koşu sessizce kayboluyor.** 25 birleşimlik
  taramayı süren betik yalnızca `temiz|SORUN` satırlarını basıyordu;
  bir birleşim çökünce hiç satır çıkmadı ve tarama eksik tamamlandığı
  hâlde temiz göründü. Sürücü artık verdict satırı çıkmayan birleşimi
  "ÖLÇÜLEMEDİ" diye sayıp turu düşürüyor.
- **"İlk salon" da sabit kimlik sayılır.** `musteri-istekleri.php`
  `venues()[0]`'ı yamalıyordu; davetiye başka bir salonu kullanıyordu ve
  tur yamadığı salonu hiç göstermeyen sayfaya bakıp "çocuk hizmeti
  görünmüyor" dedi. Hedef salon davetiyenin `venueId`'sinden okunur.
- **API'den ölçmek formu ölçmez.** Bütün turlar
  `Sahra_Invitation::update()` üzerinden yazıyordu; oysa çift ve yönetici
  FORMU kullanıyor. Hediye için eklediğim Yok/Var radyosu, görünürlük
  listesindeki aynı adlı onay kutusuyla çelişiyordu ve son gelen öteki
  seçimi eziyordu — hiçbir tur bunu görmedi. `form-qa.js` gerçek POST'u
  ölçüyor: aynı ada sahip iki denetim var mı, kaydetmek gerçekten
  kaydediyor mu, çift kurcalayınca ne oluyor.
- **Önkoşulu tur kendi kurar.** `yukari-qa.js` müzik açık değilken
  çakışmayı ölçemiyordu ve başka bir tur müziği kapattığında sessizce
  eksik ölçüyordu; `istek10.php` de "ilk postayı" okuyup başka bir
  davetiyenin raporunu kendi raporu sanıyordu. Tur önkoşulunu kurar ve
  ölçtüğü şeyi kimliğiyle arar.
- **Yeni ekran, turların sayfa listesine de eklenir.** Davetli listesi
  sayfası beş turun sabit sayfa listesinde yoktu: kontrast, uyarı, mobil,
  yol ve tema turları onu hiç ölçmedi. Sayfa eklendiğinde liste de
  güncellenir — yoksa yeni ekran denetimin dışında kalıyor.
- **Yeni ekran, yetki beyaz listesine de eklenir.** `COUPLE_PAGES`'e
  yazılmadığı için çift yeni sayfaya girdiğinde sessizce davetiye
  listesine düşüyordu; sayfa 200 dönüyor, içerik başka. "Kod 200" sayfanın
  açıldığını göstermiyor, içerikten doğrulanmalı.
- **Tur, GİRİŞ YAPTIĞI hesabı hedeflemeli.** `davetli-ekran.js` önkoşulu
  "ilk sahra_cift kullanıcısı" için kuruyor, oturumu 'cift' ile açıyordu;
  ikisi farklı çıkınca davetiye o çifte ait olmadı, ekran başka bir
  davetiyeye düştü ve tur kendi kurduğu veriyi hiç görmedi. Üstelik o
  bozuk koşu listeyi YANLIŞ davetiyeye yazdı ve arkasından koşan
  `istek10.php`'yi düşürdü.
- **`innerText` GİRDİ DEĞERLERİNİ görmüyor.** Kapak ve galeri adresleri
  görünür bir `<input>`/`<textarea>` içinde duruyordu: ekranda apaçık
  yazıyor ama metin düğümü olmadığı için `yol-tara.js` "çift: hiç" dedi.
  Ekran görüntüsü aracı yalanladı. Tarayıcı artık görünür girdilerin
  değerlerini de okuyor — ve düzeltmeden sonra aracın gerçekten
  yakaladığı ayrıca sınandı.
- **Ürünün hatası, aracın "çalışıyor" görünmesini sağlayabilir.**
  `get_by_slug('')` WordPress'in "en yeni gönderi"sine düşüyordu; hesap
  silme tohumu ucu `invitationId` ile çağırıyor ve dileği şans eseri
  doğru davetiyeye yazıyordu. Hata düzeltilince tohum 404 aldı ve asıl
  yanlış görünür oldu.
- **Kabuk süzgeci çıktının tamamını yutabilir.** `php -S` tek süreçli:
  2,4 MB'lık video isteği sunucuyu kilitleyip bütün turları zaman
  aşımına düşürdü. `PHP_CLI_SERVER_WORKERS` ile koşuluyor.
- **Video "kötü açılıyor"un nedeni kodda değil DOSYADA olabilir.**
  `moov` atomu dosyanın sonundaydı: tarayıcı oynatmaya başlamadan önce
  2,4 MB'ın tamamını indirmek zorundaydı. `-movflags +faststart` ile
  yeniden kodlandı (465 KB). Medya sorunlarında önce atom sırası ve bit
  hızı ölçülür.
- **Aracın kendi hareketi ölçümü bozabilir.** "Kaydır" düğmesi
  kahramanda duruyor; Playwright tıklamak için sayfayı oraya geri
  kaydırıyor ve ikinci dokunuş hep aynı yere gidiyordu. Ölçüt "iki kez
  basınca iki kat" değil, "tam bölüm sınırına iniyor mu" olarak
  değiştirildi; art arda dokunuş sayfanın içinden ölçülüyor.
- **Ürün sözleşmesi değişince TURUN ÖLÇÜTÜ de değişir.** Salon adı ve
  Instagram hesabı markadan türetilmeye başlayınca `salon-alan.mjs` ve
  `wp-audit-calistir.mjs` o alanlara damga basmaya devam etti: damga
  artık yazılamıyor, sayfada görünmüyor ve turlar "venueName çalışmıyor"
  dedi. Damga, hâlâ elle yazılabilen bir alana (adres) taşındı; türetilen
  alanlar için ölçüt "damga göründü mü" değil "marka iki değeri birden
  değiştirdi mi".
- **Aracın ARGÜMANI yanlış verilince de sessizce ölçer.** `ayirt.js`'e
  taban adres yerine davetiyenin tam adresi verildi; adres iki kez
  eklenip 404 döndü ve tur dokuz mührün dokuzunu da AYNI hata sayfasından
  tartıp "1 ayrı görünüm" dedi — ürün suçlandı, oysa dokuz mühür
  gerçekten farklıydı. Üstelik aracın kendi sözlüğü şemadan ayrı
  (`seal` → `sealType`) ve tanımadığı tür sessizce `theme`'e düşüyordu.
  Tur artık hedef sayfanın 200 döndüğünü ve ölçeceği öğenin sayfada
  bulunduğunu doğruluyor, ölçemediği seçenek varsa "ÖLÇÜLEMEDİ" diye
  düşüyor.
- **Ön ek karşılaştırması gerilemeyi göremez.** `salon-alan.mjs`'e
  beklenen etiket `@sahradavet` diye ELLE yazılmıştı; gerçek değer
  `@sahradavetsalonu` olduğu için `includes()` geçiyordu. Kullanıcının
  bildirdiği tam o gerileme (etiketin `@sahradavet`e dönmesi) turdan
  geçerdi. Beklenen değer artık `Sahra_Settings::brands()`'ten okunuyor;
  ürünle birlikte okumak totoloji olmasın diye ölçüt sözleşmenin kendisi:
  etiket, hesabın adresindeki kullanıcı adının TA KENDİSİ olmalı — ve
  etiket sayfanın tamamında değil, o hesabın KENDİ bağlantısının içinde
  aranıyor (sayfada çiftin kendi Instagram bağlantısı da var).
- **Bir önceki koşudan kalan önkoşul dosyası turu boşa çevirir.**
  `wp-hesap-sil3.php` `/tmp/silinecek.json`'u okuyordu; dosya eski koşudan
  kalınca hesap zaten silinmişti, bütün sayaçlar 0 okundu ve "silindi mi"
  diye soran yedi ölçüt boşlukta "geçti" dedi. Yalnızca "veri gerçekten
  var mı" ölçütü düştüğü için fark edildi. Tur artık tohumu kendi koşuyor.
- **Video PERDEYE arka plan olamaz.** İki ayrı nedenle: `.curtain-video`
  `z-index: 0`'dayken donuk perde panelleri üstüne boyanıyor ve video HİÇ
  görünmüyordu; öne alınınca da asıl sorun çıktı — varlığın ortasındaki
  Sahra logosu ve telefon numarası, perdedeki "Zehra & Ahmet" ile mührün
  tam üstüne düşüyor. İki ortalanmış altın kompozisyon birbiriyle
  çakışıyor. Karar ekran görüntüsünden verildi, koddan değil: video
  perdenin ÖNÜNDE bağımsız bir açılış katmanı olarak duruyor.
- **Sonucu olmayan bulgu yoktur:** yanlış alarmsa nedeni yazılır
  (`.notice-*` WordPress'in kendi sınıfları; `planla`/`bitti` işlev
  *referansı* olarak geçiyor), gerçekse düzeltilir.

## Ürün kuralları

- Sürüm **yalnızca WordPress**. Next.js sürümü bırakıldı, denetime girmez.
- Gelin solda, damat sağda — her yerde.
- Bölüm başlıkları sabit; çift değiştiremez. İstisna: dilek defteri
  başlığı, yönetici işletme sayfasından bir kez yazar, bütün
  davetiyelerde aynı görünür.
- Çiftin ekranında dosya yolu görünmez. Depolama sayfası istisna:
  ayarın kendisi orada ve çift giremiyor.
- Salon bilgisi (adres, yol tarifi, özellikler) yöneticinin; çift seçer,
  yazmaz.
- Salonun ADI ve Instagram hesabı MARKADAN gelir (Sahra / Grand);
  yönetici de yazamaz, yalnızca markayı seçer. Yanlış eşleştirme
  mümkün değil.
- Günün programı düğün tipinden (gündüz/akşam) ÜRETİLİR, elle
  girilmez. Tek soru nikah: yoksa o satır hiç çizilmez.
- Davetli listesi ÇİFTİN özel verisi: davetiyede hiç görünmez, başka
  çift göremez. Katılımlarla telefon (öncelik) ve ada göre eşleşir;
  eşleşmeyen bildirim "listede olmayan" olarak ayrıca gösterilir.
- Katılım formu YÖNETİCİNİN anahtarı (`Sahra_Fields::MANAGER_KEYS`):
  salona kaç kişi geleceğini işletme sayıyor. Çift göremez, gönderse de
  yok sayılır. Kapalıyken kahramandaki "Katılım Durumunu Belirt"
  düğmesi de çizilmez.
- Misafir ya da çift konum/harita üzerinde seçim yapamaz. Gömülü
  gezilebilir harita kaldırıldı; konum yalnızca gösterilir, harita
  uygulaması bağlantıları salonu doğru noktada açar.
- **Her yayında `SAHRA_VERSION` yükseltilir.** Stil ve betik adresleri
  `?v=SAHRA_VERSION` taşıyor; sürüm sabit kalınca tarayıcı eski dosyayı
  önbellekten veriyor ve yeni özellik "gelmemiş" görünüyor. Yukarı çık
  butonu tam olarak bu yüzden görünmedi.
- Davetiye açılışta SESSİZ: müzik kendiliğinden çalmaz, misafir sağ
  alttaki düğmeye dokununca başlar. Kahramanda katılım düğmesi yok;
  katılım bölümü sayfada durur.
- Açılış videosu perdenin ÖNÜNDE bağımsız bir katman: sessiz, tam
  ekran, "Geç →" ile atlanabilir, bitince kendiliğinden kapanır.
  Yüklenmezse (ya da azaltılmış hareket isteniyorsa) hiç çizilmez ve
  sahne olduğu gibi çalışır. Perdeye arka plan YAPILMAZ: varlığın
  logosu ve telefonu çiftin adlarıyla çakışıyor. Video dosyası
  `+faststart` ile kodlanır — `moov` atomu sonda kalırsa tarayıcı
  oynatmadan önce dosyanın tamamını indiriyor.
- "Kaydır" bir düğmedir: her dokunuş bir sonraki BÖLÜMÜN tepesine
  götürür.
- Sosyal hesap etiketinde adres değil `@kullanıcıadı` görünür.
- Çift kendi Instagram'ını kullanıcı adıyla yazabilir (`@perihan`);
  adres üründe tamamlanır.
- Yüklenen görseller depoya yazılmadan önce küçültülüp yeniden
  sıkıştırılır (uzun kenar 2000 px, JPEG 82). Çevrilemeyen dosya
  olduğu gibi yüklenir — sıkıştırma yüzünden yükleme düşmez.
- Dilek çiftin onayından geçmeden YAYIMLANMAZ; form bunu açıkça yazar.
- Yorumlar **neden**i anlatır, ne yaptığını değil. Kod ne yaptığını
  zaten söylüyor.
