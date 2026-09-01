# Sahra Davetiye — WordPress Sürümü Kurulumu

Bu klasör, Next.js sürümünün WordPress karşılığıdır. Misafirin gördüğü
davetiye sayfası iki sürümde de aynıdır; panel WordPress'in kendi arayüzünü
kullanır.

---

## 1. Eklentiyi yükleyin

**Yol A — panelden (en kolay)**

1. Bu klasörü (`sahra-davetiye`) zip'leyin: içinde `sahra-davetiye.php`
   doğrudan görünmeli, fazladan bir klasör katmanı olmamalı.
2. WordPress panelinde **Eklentiler → Yeni Ekle → Eklenti Yükle**.
3. Zip dosyasını seçin, **Şimdi Kur** ve ardından **Etkinleştir**.

**Yol B — FTP / dosya yöneticisi**

1. `sahra-davetiye` klasörünü olduğu gibi `wp-content/plugins/` altına
   kopyalayın.
2. **Eklentiler** ekranından **Sahra Davetiye**'yi etkinleştirin.

Etkinleştirme sırasında üç tablo (`..._sahra_rsvps`, `..._sahra_wishes`,
`..._sahra_photos`), **Davetiye Sahibi (Çift)** rolü ve `/davet/...`
adresleri otomatik kurulur.

## 2. Kalıcı bağlantıları açın

**Ayarlar → Kalıcı Bağlantılar** ekranına girip **Yazı adı** seçeneğini
seçin ve kaydedin. (Zaten "Sade" dışında bir seçenekteyseniz sadece
**Değişiklikleri Kaydet**'e basmanız yeterli.)

Bu adım atlanırsa `/davet/ahmet-zeynep` adresleri 404 verir.

## 3. Salonlarınızı girin

**Sahra Davetiye → Salonlar**. Her salon için ad, adres ve Google Maps
linki. Çift, davetiyesini hazırlarken bu salonlardan birini **seçer** —
adresi kendisi yazmaz. Adres değişirse tek yerden düzeltirsiniz, o salonu
kullanan tüm davetiyeler aynı anda güncellenir.

**"Misafirin işine yarayacak bilgiler"** alanına her satıra bir madde
yazın: `Kapalı otopark (ücretsiz)`, `Metroya 5 dk yürüme`, `Engelli
erişimi`, `Çocuk oyun alanı ve palyaço`. Bunlar davetiyenin harita
bölümünde liste olarak çıkar. Misafirin o akşam vereceği kararları
etkileyen şeyleri yazın; "1200 kişi kapasite" gibi işletme bilgilerini
değil.

## 3b. Menüleri kontrol edin

**Sahra Davetiye → Menüler**. Basılı menü kartınızdaki sekiz menü hazır
geliyor (Kokteyl + Menü 1–7), **fiyatsız**. Değiştirebilir, silebilir,
yenisini ekleyebilirsiniz. Her satır bir grup:

```
ORDÖVR TABAĞI | Amerikan salatası | Kısır | Haydari
ANA YEMEK | Et kavurma | Tereyağlı pirinç pilavı
```

Çift bunlardan birini seçip **kendi kopyası üzerinde** oynayabilir;
buradaki asıl kayıt değişmez. Menünün adı davetiyede **görünmez** —
misafir için "Menü-3" bir anlam taşımaz, başlık yalnızca "Menü" olur.

## 3c. İşletme ayarları

**Sahra Davetiye → İşletme**. İki şey:

- **Instagram hesabınız** — her davetiyenin "Etiketlemeyi Unutmayın"
  bölümünde, çiftin kendi hesabının yanında görünür.
- **Davetiye ömrü** — aşağıda.

## 4. Çift hesabı açın

**Sahra Davetiye → Çift Hesapları → Hesap Aç**. Parola otomatik üretilir ve
**yalnızca bir kez** gösterilir. **Üçünü Birden Kopyala** düğmesi şunu
panoya alır:

```
Sahra Davetiye — giriş bilgileriniz

Giriş linki: https://siteniz.com/davet/giris
Kullanıcı adı: ahmet-zeynep
Şifre: ....
```

Bunu doğrudan çifte iletebilirsiniz. Çift giriş yaptığında WordPress
panelinin geri kalanını görmez; doğrudan kendi davetiye ekranına düşer.

### Davetiye ne kadar açık kalır?

İki kademe:

1. **Düğünden 1 gün sonra** davetiye **yayından kalkar**. Link kapanır,
   misafir göremez. Sebebi: düğün bitince link elden ele dolaşmaya devam
   ediyor, arama motorlarına düşüyor ve çiftin adresi, telefonu, IBAN'ı
   süresiz açıkta kalıyor.
2. **Yayından kalktıktan 30 gün sonra** her şey **kalıcı silinir** —
   davetiye, misafir fotoğrafları, katılımlar, dilekler.

Neden iki kademe? Misafir fotoğrafları çiftin düğün albümü. Bir gün sonra
silmek, albümünü indirmeyi unutan çiftin düğün fotoğraflarını yok etmek
olurdu. Çift bu 30 gün içinde **Katılım & Albüm** ekranından albümü tek
ZIP olarak indirebilir.

İki süre de **İşletme** ekranından değiştirilir; kalıcı silmeyi tamamen
kapatabilirsiniz. Süreler davetiye sihirbazında çifte de yazılı olarak
gösterilir.

> Bu iş WordPress'in kendi zamanlayıcısına (WP-Cron) bağlıdır ve site
> ziyaret edildikçe çalışır. Aylardır hiç ziyaret almayan bir sitede
> gecikebilir.

### Giriş ekranı hakkında

Giriş **`/davet/giris`** adresinden yapılır — WordPress'in mavi giriş
formu değil, davetiyeyle aynı tasarımda bir sayfa. `wp-login.php` adresine
gidilirse de buraya yönlendirilir, yani çift o ekranı hiç görmez.

Yönetici için bir kaçış yolu bırakıldı: **`wp-login.php?sahra=wp`** her
zaman WordPress'in kendi giriş ekranını açar. Bir eklenti çakışması bu
sayfayı bozarsa kendi sitenizden kilitlenmezsiniz — bu adresi bir yere
not edin.

Parola sıfırlama bağlantısı bilerek yok: çift hesaplarında çoğu zaman
e-posta bulunmuyor. Parolayı **Çift Hesapları → Şifre Sıfırla** ile siz
üretip iletiyorsunuz.

## 5. Davetiyeyi oluşturun

**Sahra Davetiye → Yeni Davetiye**. Alanlar on dört bölüme ayrılmıştır ve
Next.js sürümündeki sihirbaz adımlarıyla birebir aynıdır.

Bilmeniz gereken birkaç davranış:

- **Adların yazımı otomatik düzelir.** "mehmeT" → "Mehmet", "AYŞE" →
  "Ayşe". Türkçe kuralına göre: "ışık" → "Işık", "istanbul" → "İstanbul".
- **Gelin solda, damat sağda** — formdan davetiyeye, bağlantı adresinden
  paylaşım kartına kadar aynı sıra.
- **Saat seçilmez, oturum seçilir**: Gündüz (13:00–17:00) ya da Akşam
  (19:00–23:00). Saatler oturumdan gelir.
- **Salon listeden seçilir**, adres yazılmaz.
- **Mühür ve mektup tasarımının canlı önizlemesi** ilgili adımlarda
  görünür; kaydedip davetiyeyi açmadan farkı görebilirsiniz.
- **Mühür kırılma ve zarf açılma sesi sabittir.** Açılış sahnesinin
  parçası; yanlış uzunlukta bir dosya perdenin zamanlamasını bozuyor.
  Arka plan müziği seçilebilir.
- **Son adım "Bölümler"**: her bölümün "sayfada görünsün" anahtarı. Bir
  bölümü kapatınca içeriği silinmez, yalnızca davetiyede görünmez.
- **Çocuk durumu tek tik.** İşaretlenmezse davetiyede "Düğünümüz yalnızca
  yetişkinlere yöneliktir — minik misafirlerimize iyi uykular" yazar.

Program, menü ve hikaye alanlarında her satır bir maddedir ve alanlar
dikey çubukla ayrılır:

```
15:00 | Kapı Açılışı | Konukların karşılanması
16:00 | Nikah Töreni | Resmi nikah ve yüzük takma
```

Kaydettikten sonra iki adres oluşur. Bağlantı adresi boş bırakılırsa
**tarih + adlardan** üretilir:

| Adres | Ne işe yarar |
| --- | --- |
| `siteniz.com/davet/19-eylul-2026-zehra-ahmet` | Misafire gönderilecek davetiye |
| `siteniz.com/yukle/19-eylul-2026-zehra-ahmet` | Masadaki QR kodun açacağı yükleme sayfası |

Tarih önde çünkü yılda yüzlerce davetiye açıyorsunuz; adrese bakınca
hangi güne ait olduğu görünmeli. İsterseniz adresi elle de yazabilirsiniz.

---

## Misafir fotoğrafları nereye kaydedilsin?

**Sahra Davetiye → Depolama**

Bir düğünde 200–300 misafirin yüklediği kareler kolayca birkaç gigabayta
çıkar. Paylaşımlı barındırmada kota dolduğunda yalnızca fotoğraflar değil
sitenin tamamı (yedek, güncelleme, medya) durur. Bu yüzden iki seçenek var:

- **Bu sunucu** — varsayılan. Dosyalar `wp-content/uploads/sahra-davetiye/`
  altında durur. Küçük kurulumlar ve deneme için yeterli.
- **Google Drive** — dosyalar sizin Drive hesabınıza yazılır, WordPress
  barındırmanızdan yer kaplamaz.

Fotoğraflar Drive'ın paylaşım adresinden değil, sitenizden akıtılarak
gösterilir; böylece yetki denetimi WordPress tarafında kalır ve bağlantıyı
bilen birine açılmaz.

### Google Drive bağlantısı

Bu adımlar bir kez yapılır ve Google Cloud panelinde geçer.

1. <https://console.cloud.google.com/> adresinde bir proje oluşturun.
2. **APIs & Services → Library** → **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen** → **External** → uygulama
   adını ve e-postanızı yazın. **Test users** bölümüne kendi Google
   hesabınızı ekleyin (uygulamayı yayımlamanız gerekmez).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → tür **Desktop app**. Çıkan **Client ID** ve **Client Secret**'ı
   saklayın.
5. Yenileme jetonunu (refresh token) almak için tarayıcıda
   <https://developers.google.com/oauthplayground/> açın:
   - Sağ üstteki dişliden **Use your own OAuth credentials** işaretleyin ve
     4. adımdaki Client ID / Secret'ı girin.
   - Soldaki listede **Drive API v3** altından `https://www.googleapis.com/auth/drive.file`
     kapsamını seçin, **Authorize APIs** deyin ve hesabınızla giriş yapın.
   - **Exchange authorization code for tokens** deyin. Çıkan
     **Refresh token** değerini kopyalayın.
6. Drive'da fotoğraflar için bir klasör açın. Klasörü açtığınızda adres
   çubuğunda `/folders/` sonrasında görünen dizi, **klasör kimliğidir**.
7. **Sahra Davetiye → Depolama** ekranına Client ID, Client Secret, Refresh
   Token ve klasör kimliğini girip **Kaydet ve Sına** deyin. Ekran
   bağlantının çalışıp çalışmadığını söyler.

Drive ayarı açık ama bağlantı çalışmıyorsa fotoğraflar **sessizce
kaybolmaz**: yüklemeler bu sunucuya düşer ve panelde bir uyarı görürsünüz.
Misafirin masadaki QR'ı okuttuğu an bir yapılandırma hatası yüzünden eli
boş kalması, kotadan daha kötü bir sonuç olurdu.

---

## Yükleme boyutu sınırı

Ürünün sınırı fotoğraf başına **25 MB**. Barındırmanız bunun altındaysa
misafirlerin telefon fotoğrafları reddedilir. `php.ini` (ya da hosting
panelindeki PHP ayarları) şu değerleri en az şu kadar olmalı:

```
upload_max_filesize = 25M
post_max_size = 26M
max_execution_time = 120
memory_limit = 256M
```

Hangi değerlerin geçerli olduğunu **Araçlar → Site Sağlığı → Bilgi → Sunucu**
ekranından görebilirsiniz.

## Paylaşım kartı

Davetiye WhatsApp'ta paylaşıldığında çıkan 1200×630 görsel otomatik
üretilir (`/sahra-kart/ahmet-zeynep.png`) ve diske önbelleklenir. Çiftin
adı, tarihi ya da teması değişince kart kendiliğinden yenilenir.

Bunun için PHP'nin **GD** eklentisinin FreeType desteğiyle derlenmiş olması
gerekir — neredeyse her barındırmada vardır. Yoksa kart üretilmez, davetiye
çalışmaya devam eder.

## Sık karşılaşılanlar

**`/davet/...` 404 veriyor** — 2. adımdaki kalıcı bağlantı ayarı yapılmamış.
**Ayarlar → Kalıcı Bağlantılar → Değişiklikleri Kaydet** yeterlidir.

**Davetiyede temanın menüsü/altbilgisi çıkıyor** — çıkmamalı; davetiye kendi
tam sayfa şablonuyla çizilir. Görüyorsanız başka bir eklenti
`template_redirect` üzerinde daha erken devralıyor olabilir.

**Harita boş görünüyor** — Google Maps'e erişilemiyor (kurum ağı, reklam
engelleyici). Haritanın arkasında mekân adı ve adres yazar; sayfa boş bir
dikdörtgen bırakmaz.

**Çift, salon adresini değiştiremiyor** — kasıtlı. Çift yalnızca sizin
tanımladığınız salonlar arasından seçer. Adresi çifte yazdırmak bir hata
kaynağıydı: yanlış yazan bir çiftin misafirleri yanlış yere gidiyor ve
kimse fark etmiyordu.

**Davetiye kendiliğinden kapandı** — düğünden 1 gün sonra yayından kalkar
(bkz. "Davetiye ne kadar açık kalır?"). Süreyi **İşletme** ekranından
değiştirebilir, davetiyeyi **Davetiyeler** listesinden elle yeniden
yayına alabilirsiniz.

**Menüde "Menü 3" yazmıyor** — kasıtlı. Menünün adı yalnızca panelde
görünür; davetiyede başlık her zaman "Menü".
