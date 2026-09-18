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
| `salon-alan.mjs` | her salon alanı + marka eşleşmesi + harita görseli | 19/19 |
| `audit-uyari.js` | 15 sayfada PHP uyarısı / JS hatası | 15 temiz |
| `audit-wp-rest.mjs` | her REST ucu, her rol | 13/13 |
| `wp-guvenlik.mjs` | XSS, yetki, dizin aşımı, yükleme, nonce | 18/18 |
| `giris-sinir.mjs` | wp-login devralınmıyor, /davet/giris çalışıyor | 12/12 |
| `kart-qa.mjs` | og etiketleri, bot erişimi, monogram sığması | 26/26 |
| `sihirbaz-qa.js` | sihirbazın davranışları | 8/8 |
| `wp-misafir.js` | katılım, dilek, fotoğraf yükleme | 3/3 |
| `panel-kontrast.js` | panelin her metninin kontrastı | ~2200 metin, 0 sorun |
| `on-tara.sh` (`wpon.js`) | ön yüz kontrastı — 5 tema × 5 tasarım | 25 birleşim temiz |
| `mobil.js` | 390px'te yatay taşma (misafir + panel) **ve punto tabanı — yalnızca MİSAFİR sayfaları**, girdiler dahil | taşma yok, misafirde 16px altı metin yok |
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
| `musteri2.php` | salon adı, yazım onarımı, dilek başlığı yöneticide, sabit bağlaç, işletme imzası | 28/28 |
| `isletme-yetki.js` | işletme yöneticisi rolünün sınırı: eklentinin her ekranı açılıyor, WordPress kapalı, yetki yükseltmesi yok | 24/24 |
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
| `gorsel-punto.js` | görsel adresleri gizli, hediye alanları seçime bağlı, açılış videosu, her bölümdeki Kaydır düğmeleri, mobilde en küçük punto 16px (girdiler dahil), uçtan uca sıkıştırma | 36/36 |
| `harita.php` | koordinat çözümü (iğne/görüntü/query/kısa link/adres), karo birleştirme, imleç, önbellek, elle/türetilmiş koordinat, ağ yokken, bakım kuyruğu, rota, silme | 50/50 |
| `harita-ekran.js` | konumda gerçek harita çiziliyor, yükleniyor, gezilebilir harita sızmıyor, karo sağlayıcısının adı misafire görünmüyor, elle yüklenen görsel eziyor, haritasız salonda panel, panelden yenileme | 27/27 |

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
- **Saydam zemin kontrast turundan GEÇER.** Harita rozetine
  `var(--c-paper)` yazılmıştı; öyle bir belirteç yok, geçersiz değer
  zemini saydam bırakıyor ve krem yazı açık renkli haritanın üstünde
  okunmuyordu. Tarayıcı bunu göremez: saydam zeminde bir ÜST katmanın
  (koyu bölüm) rengini okuyup "temiz" diyor. Görselin üstünde duran her
  öğe için ölçüt ayrıca yazılır: kendi zemini var mı? Belirteç adları da
  uydurulmaz, dosyadan okunur.
- **Şema dışı anahtarla kurulan önkoşul da sessiz bir hiçliktir.**
  `gorsel-punto.js`'in müzik önkoşulunu `showMusic`/`musicTrack` diye
  yazdım; ikisi de şemada yok (doğrusu `soundEnabled` +
  `backgroundMusicUrl`). Önkoşul kurulmadı, düğme çizilmedi ve dört
  ölçüt ölçülmeden kaldı. Önkoşul kurulduktan sonra GERÇEKTEN kurulduğu
  doğrulanır, yoksa tur yüksek sesle düşer.
- **Sabit yazılmış e-posta çakışınca WordPress sessizce reddeder.**
  `istek10.php` çiftin adresini `cift@ornek.test` diye kuruyordu; aynı
  adres başka bir kullanıcıda kayıtlıydı, `wp_update_user` WP_Error
  döndürdü, adres boş kaldı ve rapora bakan BEŞ ölçüt birden düştü —
  ürün suçlandı. Adres artık kullanıcı kimliğinden üretiliyor ve dönen
  hata okunuyor.
- **İki araç AYNI hedefe bakmak zorunda.** `fark-olc.js` adresi
  `/tmp/denetim.json`'dan okuyordu; yazmayı yapan `wp-secim.php` ise "en
  eski yayındaki davetiye"yi seçiyor. `wp-tohum.php` yeniden koşunca
  ikisi ayrı davetiyeye baktı: araç birine yazdı, ötekinin fotoğrafını
  çekti ve beş tasarımın ONU DA "%0.00 aynı" çıktı — ürün suçlandı.
  Ölçen araç, adresi YAZAN araçtan okur (`wp-secim.php` yazdığı slug'ı
  basıyor) ve hedef ortasında değişirse yüksek sesle düşer.
- **Boş iğne ölçüm değildir.** `musteri2.php` "şehir sızmıyor" ölçütünü
  `false === mb_strpos( $metin, $sehir )` diye kuruyordu; salonun şehri
  boş olunca `mb_strpos` SIFIR döndürüyor, ölçüt ölçecek bir şey olmadığı
  hâlde düşüyor ve ürün suçlanıyordu. Şehir yoksa tur önkoşulu kendi
  kurar, kuramazsa çıkar.
- **Yüzde yükseklik, otomatik boyutlanan grid satırına karşı DÖNGÜYE
  girer.** Açılış videosuna `height: 154%` yazıldı; yüzde, içeriğe göre
  büyüyen grid satırına karşı çözülünce kutu 900px yerine 6071px çıktı.
  `vh` görüntü alanına karşı çözülüyor ve katman zaten `inset: 0`.
- **Grid, kendinden BÜYÜK öğeyi ortalamaz — üste hizalar.** Taşmada veri
  kaybını önlemek için. Videoyu büyütmek logoyu yukarı değil AŞAĞI
  taşıdı (%28 → %43): istenenin tam tersi. Büyütmenin yanına açık bir
  `translateY` gerekiyor ve sonuç ölçülerek doğrulanıyor.
- **Kırpmanın güvenli olduğu ölçülür, varsayılmaz.** Geniş ekranda
  video büyütülüp kırpılıyor; kırpılan bölgenin BOŞ olduğu kaynak
  karesinden sayıyla doğrulandı (üstten 269px, alttan 404px; içerik
  540–1250 arasında). Göz kararı "nasılsa boştur" demek logonun üstünü
  kesiyordu.
- **Mock, ürünün kendisi değildir.** Videonun yerleşimini `<img>` ile
  taklit eden bir sayfada ölçüm `cover` gibi davrandı ve yanlış sonuç
  verdi; gerçek sayfadaki `.intro-video` kutusu ölçülünce geometri
  bambaşkaydı. Ölçüm ürünün kendi DOM'unda yapılır. Videoyu çizdirmek
  için `poster` + betiği engelleme yeterli (başsız tarayıcı H.264
  çözemiyor).
- **`clamp`in üst sınırını yükseltmek MOBİLİ hiç etkilemez.** Orta terim
  `vw` tabanlı ve 390px'te değeri küçük kalıyor; telefon her zaman ALT
  SINIRA yapışıyor. Puntoyu üç kez yükselttim, kullanıcı üç kez "hâlâ
  küçük" dedi — çünkü her seferinde tavanı büyütüyordum. Mobil için
  büyütme alt sınırdan yapılır.
- **Sıfırlama kuralı bileşeni EZEBİLİR.** `.sahra-page button`
  (özgüllük 0,1,1) `.cta`dan (0,1,0) daha özgül: `font: inherit` bütün
  düğmeleri gövde puntosuna çakılı tutuyordu ve ölçek yükselince
  düğmeler yerinde kalıyordu ("Gönder" 16px). Kaynak sırası burada
  kurtarmıyor, özgüllük kazanıyor. Sıfırlamalar `:where()` içine alınır
  (özgüllük 0), tarayıcının stilini temizlesin ama bileşenin seçimini
  değil. Hangi kuralın kazandığı tahmin edilmez: CDP ile
  `CSS.getMatchedStylesForNode` okunur.
- **Belirteci ATLAYAN sabit değer, ölçek değişince yerinde kalır.** Altı
  kural `font-size: 0.875rem` diye yazılmıştı (`.num`, `.letter-date`,
  `.gal-no`, `.ipucu-dilek`, `.intro-gec`, `.giris-not`) ve punto
  ölçeğinden hiç etkilenmiyordu. Ölçeği yükseltmek bunlara işlemedi.
- **Punto taraması GİRDİLERİ görmüyordu.** Tarama metin düğümü olan
  öğeleri geziyor; `<input>`/`<textarea>` metnini `value`da taşıyor ve
  taramanın dışında kalıyordu. Form alanları tam da orada sabit 1rem'de
  takılı kalmıştı. Tarayıcı artık girdileri de ölçüyor — ve düzeltmeden
  sonra gerçekten yakaladığı ayrıca sınandı.
- **Kullanıcının ekranı ile ölçümün ayrışıyorsa önce SÜRÜMÜ doğrula.**
  "Bende hâlâ küçük" dendiğinde dört tur punto büyüttüm; sorun ölçüde
  değil canlıda hangi dosyanın servis edildiğindeydi. Davetiye sayfası
  `wp_head()` çağırmıyor (yalnızca Google Fonts ve kendi stili yükleniyor),
  yani tema da eklenti de puntoya karışamıyor — ayrışmanın kodda bir
  açıklaması yoktu. Böyle bir durumda tahmin etmek yerine kurulu sürüm
  sorulur.
- **Kendi ekran görüntün kanıt olmayabilir.** 390px'lik bir PNG büyük bir
  ekranda bakıldığında rahat görünüyor, aynı düzen telefonda fiziksel
  boyutta çok daha küçük. Ekran görüntüsü düzeni gösterir, PUNTOYU
  göstermez; punto sayıyla ölçülür.
- **Etiket sınıfı CÜMLE taşımaz.** Kapanış imzası `.t-label` ile
  yazılıydı: o sınıf BÜYÜK HARF ve 0.26em harf aralığı veriyor — iki
  kelimelik bir etikette doğru, tam bir cümlede telefonda dört satıra
  yayılıp okunmuyor. Uzun metin kendi ölçüsünü ister.
- **İKİ stil dosyası var ve ikisi de kendi belirteçlerini tanımlıyor.**
  `sahra.css` davetiyenin, `admin.css` panelin. Bu ayrım BİLEREK var:
  büyük punto yalnızca davetiye için istendi. "Mobilde hâlâ küçük"
  şikâyetini panelin de büyütülmesi gerektiği diye okudum, ikisini
  birden büyüttüm ve paneli şişirdim — kullanıcı geri aldırdı. Bir
  şikâyet hangi EKRAN için söylendiği doğrulanmadan iki yere birden
  uygulanmaz; belirsizse sorulur.
- **Ölçüt, ürün sözleşmesinin geçtiği yere yazılır.** Punto tabanını
  `mobil.js`e eklerken panel sayfalarına da uyguladım; oysa taban yalnızca
  misafir sayfalarının sözleşmesi. Tur artık tabanı yalnızca misafir
  sayfalarında ölçüyor, panelde yalnızca taşmaya bakıyor — yoksa
  denetim, üründe olmayan bir kuralı dayatıyor.
- **Metin göstermeyen denetimin puntosu ölçülmez.** Yeni punto ölçütü ilk
  koşuda `venue[brand]` (radyo) ve `sahra[isActive]` (kutucuk) için
  "16px" diye YANLIŞ ALARM verdi: ikisi de kendi çizimine sahip, metin
  taşımıyor. Kutucuk/radyo/kaydırıcı/renk/dosya taramadan dışlanır.
- **Sütun oranı PUNTOYLA birlikte değişir.** Konum bölümü `4fr 8fr` idi;
  punto 16→23px olunca aynı sütun 285px'te kaldı, satır başına ~13
  karakter düştü ve yol tarifi 19 satıra çıkıp sol sütunu 1429px yaptı
  (sağdaki panel 357px). Punto ölçeği değişince ona bağlı DÜZENLER de
  gözden geçirilir; ölçü, satır sayısı ve bölüm yüksekliğiyle doğrulanır.
- **Videodaki "artefakt" içerik çıkabilir.** Alt kısımdaki gri dikdörtgeni
  bir kodlama artefaktı sandım; kareyi büyütünce "BAŞAKŞEHİR" şube
  etiketi olduğu görüldü. Kaldırmadan önce NE olduğu okunur — ve bandın
  sınırları bütün karelerde ölçülür: sabit değil, soldan açılıyor
  (x 328→750, y 1325→1428, t≥2sn). Açılış parlamasında bütün kare aydınlık
  olduğu için kutu ancak t≥2sn'den sonra açılır; sürekli açık bir siyah
  kutu parlamanın üstünde görünürdü.
- **WordPress'in kullanıcı yetkileri bu iş için fazla geniş.**
  `create_users`/`edit_users`/`delete_users` HER kullanıcıyı kapsıyor;
  çift hesabı ekranı bu yetkilerle korunuyordu ve hedefin kim olduğu
  SORULMUYORDU. Yalnızca WordPress yöneticisi girdiği sürece görünmedi;
  işletme yöneticisi rolü eklenince gerçek bir yetki yükseltmesi olurdu.
  Gerileme sınaması bunu kanıtladı: koruma kaldırılınca tur SİTE
  YÖNETİCİSİNİ SİLDİ. Yetki eklenti yetkisine indirildi ve hedefin çift
  olduğu doğrulanıyor.
- **Yıkıcı sınamanın hedefi TEK KULLANIMLIK olur.** O gerileme sınaması
  doğrudan kimlik 1'i hedefliyordu ve ürün gerçekten açık olduğu için
  bütün ortamı bozdu (yöneticiyi elle yeniden kurmak gerekti). Ölçüt aynı
  kalır ("çift olmayan bir hesaba dokunulamıyor"), hedef atılabilir bir
  hesap olur.
- **Tur, VAR OLAN veriyi kurcalamaz; kendi hesabını kurar.**
  `isletme-yetki.js` "çift parolası sıfırlanabiliyor" ölçütü için var olan
  ilk çift hesabını (audit-cift) hedefliyordu; parolasını değiştirdi ve
  arkasından koşan `audit-wp-rest.mjs` 401 alıp "çift kendi katılımlarını
  okuyamıyor" diye ürünü suçladı. Tur kendi hesabını açar ve siler;
  `wp-roller-kur.php` de var olan hesabın parolasını tazeliyor
  (önkoşul kendini onarmalı).
- **404 sayfasını ölçmek ürünü suçlamaya dönüşür.** Ömür turları
  davetiyeyi taslağa çekince `mobil.js` WordPress'in KENDİ 404 temasını
  ölçtü ve "The page you are looking for…" 18px, "Search" 16px diye punto
  tabanının düştüğünü bildirdi. Tur artık sayfanın ürüne ait olduğunu
  (`.sahra-page`/`.sahra-panel`) doğruluyor, değilse yüksek sesle düşüyor.
- **Ekran doğrulaması tahmin edilen BAŞLIKLA yapılmaz.** `isletme-yetki.js`
  ilk koşuda 'Davetiye Sihirbazı' gibi metinler arıyordu; menü CSS ile
  BÜYÜK HARFE çevrildiği ve Türkçe noktalı İ kaybolduğu için ("DAVETLI
  LISTESI") sayfalar açık olduğu hâlde dört ölçüt düştü. Ölçüt şablonun
  kendi beyanı: `$sahra_sayfa` → `aria-current="page"`, menüde yer almayan
  ekran için kendi form eylemi. Ayrıca gövde NAV DIŞINDAN okunur — gezinme
  çubuğu her ekranda bütün sayfa adlarını içeriyor.
- **403 "engellendi" demektir.** Aynı turda WordPress ekranlarının kapalı
  olduğunu ölçerken 403'ü başarısız saymıştım; engel üç biçimde geliyor:
  HTTP 403, bekçinin yönlendirmesi, ya da WordPress'in kendi yetki metni.
- **Açılış animasyonu bitmeden YERLEŞİM ölçülmez.** `.reveal` 1,45 sn
  boyunca `translateY(22px)`'den geliyor; 700 ms sonra okunan kutu hâlâ
  yolda ve harita atfı "haritanın 2px İÇİNDE" görünüyordu — tur ürünü
  suçladı, oysa yerleşim doğruydu. Ölçümden önce ilgili öğenin
  `transform`ı `none` olana kadar beklenir.
- **Görselin İÇİNE basılan yazı ölçekle küçülür.** Harita atfı 17
  puntoyla görselin köşesine yazılmıştı: 768px'lik görsel telefonda
  360px'e inince yazı 8px oluyor, yani atıf yapılmamış sayılır. Üstelik
  punto tabanı turu bir görselin içindeki yazıyı HİÇ ölçmüyor: kural
  sessizce delinirdi. Okunması gereken yazı HTML'de durur.
- **Kayıt katmanına AĞ isteği konmaz.** Koordinat çözümü ilk hâlinde
  `Sahra_Settings::save_venue` içindeydi: salon kaydeden HER yol (tohum
  betikleri, salon alanı yamalayan turlar, panelin kendisi) her kayıtta
  saniyelerce bekliyordu — `salon-alan.mjs`'in 19 yaması 19 ağ isteği
  demekti. Ağ işi yönetici yolunda, kayıttan SONRA koşar.
- **Panel açılışına AĞ işi bağlanmaz.** Eksik haritalar salonlar sayfası
  açılırken tamamlanıyordu; her salon iki ağ isteği demek ve denetim
  ortamındaki 96 salon sayfayı dakikalarca açtırmadı. Toplu iş kuyruğa
  (cron) girer, sınırlı sayıda koşar ve sayfa yalnızca SONUCU gösterir.
- **"Sayı düşmedi" ölçütü kimliği ölçmez.** Bakım turunun ikinci koşusu,
  ilk koşunun dokunmadığı BAŞKA beş salonu işliyor: sayı yine 5 çıkıyor
  ve "aynı salon iki kez denendi" sanılıyordu. Ölçülecek şey sayı değil
  hangi KİMLİKLERİN işlendiği — ve ikinci koşu ağ kapalıyken yapılıp
  işlenen her salonun kayda geçmesi sağlanıyor.
- **Tur DÜŞERKEN de bıraktığını toplar.** Gerileme sınamasında
  ÖLÇÜLEMEDİ yolundan çıkıldı ve turun açtığı salon ortada kaldı; dört
  öksüz salon birikti ve arkasından koşan turlar onları ölçerdi.
  Temizlik hem başarı hem hata yolunda koşar.
- **Yeniden yazma kuralları SÜRÜME bağlı yazılıyor.** Harita rotasını
  `.png`'den `.jpg`'ye çevirdim; `sahra_rewrite_version` zaten
  SAHRA_VERSION'a eşit olduğu için kurallar yenilenmedi ve rota 404
  döndü — ürün değil ortam hatası, ama aynı şey sürüm yükseltmeyi
  unutunca CANLIDA olur. Rota kalıbı değiştiğinde sürüm de yükselir.
- **Sonucu olmayan bulgu yoktur:** yanlış alarmsa nedeni yazılır
  (`.notice-*` WordPress'in kendi sınıfları; `planla`/`bitti` işlev
  *referansı* olarak geçiyor), gerçekse düzeltilir.

## Ürün kuralları

- Sürüm **yalnızca WordPress**. Next.js sürümü bırakıldı, denetime girmez.
- Gelin solda, damat sağda — her yerde.
- Bölüm başlıkları sabit; çift değiştiremez. İstisna: dilek defteri
  başlığı, yönetici işletme sayfasından bir kez yazar, bütün
  davetiyelerde aynı görünür.
- Davetiyenin en altında işletmenin imzası durur: "Bu eşsiz dijital
  deneyim, Sahra Davet tarafından çiftimize armağan edilmiştir." Sabit
  metin — davetiyeyi armağan eden işletme imzasını da kendisi atar, çift
  değiştiremez.
- **İşletme yöneticisi rolü** (`sahra_isletme`): eklentideki her şeye
  erişir (davetiyeler, davetli listeleri, salonlar, menüler, çift
  hesapları, işletme, depolama), WordPress'in geri kalanına HİÇ erişmez.
  Yönetim ekranları `manage_options` değil eklentinin kendi yetkisiyle
  (`sahra_manage_invitations`) korunuyor. Yönetici hesabı AÇMAK ve SİLMEK
  sitenin WordPress yöneticisinde kalır — işletme yöneticisi kendi gibi
  yönetici üretemez. Çift hesabı açma/sıfırlama/silme yetkisi
  (`sahra_manage_accounts`) yalnızca ÇİFT hesaplarını kapsar; hedefin
  gerçekten çift olduğu ayrıca doğrulanıyor.
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
- Açılış videosunda ŞUBE ETİKETİ yoktur: kaynakta alt kısımda
  "BAŞAKŞEHİR" bandı vardı, aynı video her salonun davetiyesinde
  oynadığı için yanlış şubeyi gösteriyordu. Siyahla kapatıldı
  (x 315–765, y 1315–1445, yalnızca t≥2sn — açılış parlaması
  dokunulmadan kalsın diye).
- Konumda GERÇEK ama DURAĞAN bir harita var: salonun koordinatından
  OpenStreetMap karoları birleştirilip üretilen bir görsel
  (`Sahra_Harita`). Üzerinde gezilemez (seçim de yapılamaz), dokunuş
  salonu telefonun harita uygulamasında açar. Önce elle yüklenmiş ekran
  görüntüsü kullanılır (yöneticinin çıkış yolu), yoksa üretilen harita,
  o da yoksa eski adres paneli — koordinatı çözülemeyen salon yüzünden
  bölüm boşalmaz.
  - Koordinat yöneticiden İSTENMEZ: Google Maps linkinden çözülür
    (`!3d/!4d` iğne, `@lat,lng` görüntü merkezi, `q/query/ll/destination`,
    kısa linkin yönlendirmesi), olmazsa adresten (Nominatim). Enlem/boylam
    alanları yine elle yazılabilir ve elle yazılan kazanır: adresten
    çözülen nokta komşu binaya düşebiliyor. Elle yazılan koordinat adres
    değişse de korunur; TÜRETİLMİŞ koordinat adres değişince silinir
    (eski nokta artık başka bir yeri gösteriyor) ve yeniden çözülür.
  - Kayıt katmanı AĞA ÇIKMAZ: çözüm yönetici yolunda, kayıttan sonra
    koşar.
  - Görsel 768x480 (16/10) ve yakınlık 18. Ölçü keyfi değil: kutu
    telefonda ~360px, yani görsel 2,1 kat küçülüyor ve iki kat küçülme
    bir yakınlık basamağı demek. 1024x640/z16 ile başlandı ve harita
    ekranda z14,5 gibi uzak görünüyordu; z17'de sokak adları ancak
    seçiliyordu. Yakınlık, 768px'lik görsele değil telefondaki GERÇEK
    360px'lik kutuya bakılarak seçildi.
  - Dosya JPEG 82 (~90 KB): aynı harita PNG olarak 526 KB ve davetiyenin
    en pahalı isteği olurdu.
  - MİSAFİRE karo sağlayıcısının adı görünmez: davetiyede başka bir
    markanın adının yazması istenmedi (kullanıcının kararı). Bir dönem
    haritanın altında `© OpenStreetMap katkıcıları` yazıyordu, kaldırıldı;
    `harita-ekran.js` sayfanın tamamında (metin + bağlantı/görsel
    adresleri) bu adın geçmediğini ölçüyor. Karoların kullanım koşulu
    görünür atıf istiyor — bilgi, yöneticinin salon ekranında yazılı
    duruyor; tamamen kurallı kalmak istenirse anahtarlı bir sağlayıcıya
    (Google Static Maps / Mapbox) geçilir, orada marka görselin kendi
    içinde geliyor.
  - Üretim MİSAFİR yolunda hiç koşmaz: salon kaydedilirken, "Haritayı
    Yenile" düğmesiyle ve günlük bakımda (tur başına en çok 5 salon)
    koşar. Çözülemeyen salon kayda geçer ve aynı adresle bir daha
    denenmez; panelde nedeni yazar.
- **Her yayında `SAHRA_VERSION` yükseltilir**, ama artık tek güvence o
  değil: varlık adresleri (stil, betik, VİDEO — üç şablonda da)
  `sahra_varlik()` ile üretiliyor ve dosyanın
  `filemtime` damgasını da taşıyor (`?v=1.4.0.1789586199`). Sürüm
  yükseltmeyi unutmak ya da sunucuda önbellek eklentisi bulunmak yeni
  dosyanın gelmemesine yol açıyordu; damga dosya değişince kendiliğinden
  değişiyor.
- **Punto ölçüsü YALNIZCA davetiye sayfasında ayrı tutulur.** Misafirin
  gördüğü davetiyede mobilde hiçbir metin 16px'in altında değil (girdiler
  dahil); gövde 18px. Bir ara taban 21px'e çıkarılmıştı, ama o ölçü
  kullanıcının ekranında ÖNBELLEKTEN küçük görünen bir sayfayı telafi
  etmek için seçilmişti — önbellek düzelince fazla iri kaldı. PANEL kendi
  ölçeğinde
  kalır (`admin.css`): orası çiftin doldurduğu bir form ekranı, davetiye
  değil. İki dosya ayrı belirteç tanımlıyor ve bu BİLEREK böyle; birini
  büyütürken ötekine dokunulmaz.
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
- "Kaydır" HER bölümde bir düğmedir (son bölüm hariç: altında
  gidilecek yer yok). Her düğme KENDİ bölümünden sonrakinin tepesine
  götürür — hedef kaydırma konumundan değil, düğmenin bölümünden
  hesaplanır. Sayfa dibe dayandığında son basış oraya iner.
- Sosyal hesap etiketinde adres değil `@kullanıcıadı` görünür.
- Çift kendi Instagram'ını kullanıcı adıyla yazabilir (`@perihan`);
  adres üründe tamamlanır.
- Yüklenen görseller depoya yazılmadan önce küçültülüp yeniden
  sıkıştırılır (uzun kenar 2000 px, JPEG 82). Çevrilemeyen dosya
  olduğu gibi yüklenir — sıkıştırma yüzünden yükleme düşmez.
- IBAN gibi KOPYALANAN/OKUNAN diziler süslü yazıyla yazılmaz: düz, tek
  genişlikli yazı (`--f-mono`) ve `tabular-nums`. Süslü yazının eski
  üslup rakamları farklı yükseklikte ve 0/O ayrımını yitiriyor; hane
  hane okunan bir dizide bu okuma hatası demek.
- Dilek çiftin onayından geçmeden YAYIMLANMAZ; form bunu açıkça yazar.
- Yorumlar **neden**i anlatır, ne yaptığını değil. Kod ne yaptığını
  zaten söylüyor.
