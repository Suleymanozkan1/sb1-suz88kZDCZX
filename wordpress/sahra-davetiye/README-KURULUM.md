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

## 3. Mekânı girin

**Sahra Davetiye → Mekân**. Buradaki bilgi bütün davetiyelerde görünür;
çift hesapları görebilir ama değiştiremez. Adres değişirse tek yerden
düzeltirsiniz, yayındaki tüm davetiyeler aynı anda güncellenir.

## 4. Çift hesabı açın

**Sahra Davetiye → Çift Hesapları → Hesap Aç**. Parola otomatik üretilir ve
**yalnızca bir kez** gösterilir. **Üçünü Birden Kopyala** düğmesi şunu
panoya alır:

```
Sahra Davetiye — giriş bilgileriniz

Giriş linki: https://siteniz.com/wp-login.php
Kullanıcı adı: ahmet-zeynep
Şifre: ....
```

Bunu doğrudan çifte iletebilirsiniz. Çift giriş yaptığında WordPress
panelinin geri kalanını görmez; doğrudan kendi davetiye ekranına düşer.

## 5. Davetiyeyi oluşturun

**Sahra Davetiye → Yeni Davetiye**. Alanlar on iki bölüme ayrılmıştır ve
Next.js sürümündeki sihirbaz adımlarıyla birebir aynıdır.

Program, SSS ve hikaye alanlarında her satır bir maddedir ve alanlar dikey
çubukla ayrılır:

```
15:00 | Kapı Açılışı | Konukların karşılanması
16:00 | Nikah Töreni | Resmi nikah ve yüzük takma
```

Kaydettikten sonra iki adres oluşur:

| Adres | Ne işe yarar |
| --- | --- |
| `siteniz.com/davet/ahmet-zeynep` | Misafire gönderilecek davetiye |
| `siteniz.com/yukle/ahmet-zeynep` | Masadaki QR kodun açacağı yükleme sayfası |

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

**Çift, mekânı değiştiremiyor** — kasıtlı. Mekân tüm davetiyelerde ortaktır
ve yalnızca yönetici değiştirir.
