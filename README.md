# Dijital Düğün Davetiyesi

Perde açılışı ve balmumu mühür girişiyle açılan, admin panelinden yönetilen
premium dijital düğün davetiyesi.

## Özellikler

### Davetiye sayfası (`/davet/[slug]`)

- **Sinematik giriş** — kadife perdeler, korniş ve balmumu mühür. Mühre tıklanınca
  mühür kırılır, kıvılcımlar saçılır, perdeler açılır ve davetiye ortaya çıkar.
  `Esc` veya "Geç →" ile atlanabilir.
- **Hero** — altın gradyan isimler, tarih/saat/şehir, canlı geri sayım, CTA'lar
- **Mektup** — monogram madalyonu, davet metni, isteğe bağlı besmele/ayet/hadis/dua
- **Hikayemiz** — çift taraflı zaman tüneli, düğün kartı vurgulu
- **Düğün Bilgileri** — lokasyon/tarih/saat/adres kartları, Google Takvim + `.ics` indirme
- **Program** — saatli akış listesi
- **Fotoğraf Galerisi** — klavye ile gezilebilen (`←` `→` `Esc`) lightbox
- **Konum** — gömülü harita, yol tarifi, Google Maps ve Yandex bağlantıları
- **Katılım Formu** — ad/telefon/katılım durumu/kişi sayısı/not, API'ye kaydedilir
- **SSS** — akordeon
- **İletişim** — sosyal hesaplar ve hashtag
- Kaydırma ilerleme çubuğu, düşen altın yapraklar, açılıp kapanabilir arka plan müziği

### Misafir fotoğraf yükleme (`/yukle/[slug]`)

Masalara konan QR kodun açtığı, **giriş gerektirmeyen** sayfa. Misafir yalnızca
fotoğraf yükleyebilir; başka hiçbir veri görünmez.

- Çoklu seçim, telefon kamerasından doğrudan çekim
- İsteğe bağlı ad ve dilek notu
- Fotoğraf başına 25 MB sınırı, yükleme durumu tek tek gösterilir
- Orijinal dosyaya dokunulmaz; galeri önizlemesi misafirin tarayıcısında üretilir

### Roller

| Rol | Erişim |
| --- | --- |
| **admin** | Admin paneli, tüm davetiyeler, hesap açma/silme, tüm galeriler |
| **user** (çift) | Yalnızca kendi davetiyeleri ve kendi özel albümü |
| **misafir** | Yalnızca fotoğraf yükleme sayfası (girişsiz) |

Giriş tek noktadan yapılır: `/giris`. Admin `/admin`'e, çift hesabı `/panel`'e
yönlendirilir. Çift hesabı `/admin`'e gitmeye çalışırsa `/panel`'e döner.

### Admin paneli (`/admin`) — yalnızca admin

- Tüm davetiyeler: önizleme, düzenleme, link kopyalama, QR kod, aktif/pasif, silme
- Her davetiyenin sahibi, katılım ve fotoğraf sayısı listede görünür
- **Hesap yönetimi**: her çift için hesap açma (parola otomatik üretilir ve bir kez
  gösterilir), parola sıfırlama, hesabı silme
- Hesap silindiğinde davetiyeleri, katılım bildirimleri ve yüklenen tüm
  fotoğrafları (disktekiler dahil) birlikte silinir
- Tüm misafir fotoğraflarının galerisi

### Çift paneli (`/panel`) — hesap sahibi

- Kendi davetiyelerini oluşturur ve düzenler (silme yetkisi adminde)
- Kendi **özel albümü**: masadaki QR koddan yüklenen fotoğraflar
- Fotoğrafı büyütme, **orijinali (yüksek çözünürlük) indirme**, tümünü ZIP indirme
- Kendi davetiyelerine gelen katılım bildirimleri

### QR kodlar

Her davetiye için iki ayrı QR üretilir ve PNG olarak indirilebilir:

| QR | Açtığı sayfa | Kullanım |
| --- | --- | --- |
| **Davetiye QR** | `/davet/[slug]` | Misafirlere gönderilir |
| **Fotoğraf QR** | `/yukle/[slug]` | Masalara konur, yalnızca fotoğraf yükleme |

### Davetiye sihirbazı (12 adım)

Çift Bilgileri · Düğün Bilgileri · Davet Metni · Manevi İçerik · Mühür & Tuğra ·
Mektup Tasarımı · Fotoğraflar · Ses Ayarları · Tema · Program · SSS · Hikayemiz

- 6 mühür modeli, 3 mektup tasarımı, 5 renk teması
- Arka plan müziği, mühür kırılma ve zarf açılma sesleri ayrı ayrı verilebilir
- Galeri görselleri sürükle-bırak ile eklenir, oklarla sıralanır (maks. 4 MB)
- Her adımda kaydedilebilir; tamamlanan adımlar ✓ ile işaretlenir

## Kurulum

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD değerini değiştirin
npm run dev
```

İlk çalıştırmada `admin` kullanıcısı `ADMIN_PASSWORD` ile otomatik oluşturulur.

- Giriş: <http://localhost:3000/giris>
- Admin paneli: <http://localhost:3000/admin>
- Çift paneli: <http://localhost:3000/panel>
- Davetiye: <http://localhost:3000/davet/[slug]>
- Fotoğraf yükleme: <http://localhost:3000/yukle/[slug]>

Üretim derlemesi:

```bash
npm run build && npm start
```

## Ortam değişkenleri

| Değişken | Açıklama | Varsayılan |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Admin paneli şifresi | `admin` |
| `ADMIN_SECRET` | Oturum çerezini imzalayan gizli dize | Şifreden türetilir |

Üretimde her ikisini de mutlaka ayarlayın. `ADMIN_PASSWORD` yalnızca ilk
çalıştırmada admin hesabını oluştururken kullanılır; `ADMIN_SECRET` oturum
çerezini imzalar ve değiştirilirse açık oturumlar düşer.

### Güvenlik notu

Fotoğraf yükleme ucu, masadaki QR'ı okutan herkesin girişsiz kullanabilmesi için
kasıtlı olarak açıktır. Korumalar: davetiye aktif olmalı, yalnızca görsel MIME
türleri kabul edilir ve dosya başına 25 MB sınırı vardır. Halka açık bir kurulumda
bu ucun önüne ayrıca hız sınırlama (rate limit) koymanız önerilir.

## Veri saklama

| Ne | Nerede |
| --- | --- |
| Hesaplar | `data/users.json` (parolalar scrypt ile özetlenir) |
| Davetiyeler | `data/invitations.json` |
| Katılım bildirimleri | `data/rsvps.json` |
| Fotoğraf kayıtları | `data/photos.json` |
| Fotoğraf dosyaları | `data/uploads/` (orijinaller, dokunulmadan) |

Hepsi `.gitignore` içindedir. Fotoğraf dosya adları sunucuda yeniden üretilir;
istemciden gelen ad hiç kullanılmaz.

**Not:** Vercel gibi salt-okunur/geçici dosya sistemine sahip ortamlarda yazma
işlemi sessizce başarısız olur ve veriler yalnızca süreç ömrü boyunca bellekte
kalır. Kalıcı kayıt için `src/lib/store.ts` içindeki fonksiyonları bir veritabanı
sürücüsüyle (MongoDB, Postgres, Supabase vb.) değiştirmeniz yeterlidir — API
rotaları ve arayüz bu modülün dışına bağımlı değildir.

## API

| Yöntem | Yol | Yetki | Açıklama |
| --- | --- | --- | --- |
| `GET` | `/api/invitations` | — | Tüm davetiyeler |
| `GET` | `/api/invitations?slug=...` | — | Slug ile tek davetiye |
| `POST` | `/api/invitations` | Admin | Yeni davetiye |
| `GET` | `/api/invitations/[id]` | — | ID ile davetiye |
| `PUT` | `/api/invitations/[id]` | Admin | Güncelle |
| `DELETE` | `/api/invitations/[id]` | Admin | Sil |
| `POST` | `/api/rsvp` | — | Katılım bildirimi gönder |
| `GET` | `/api/rsvp` | Admin | Katılım bildirimlerini listele |
| `DELETE` | `/api/rsvp?id=...` | Admin | Katılım bildirimini sil |
| `POST` / `DELETE` | `/api/auth` | — | Giriş / çıkış |
| `GET` / `POST` | `/api/users` | Admin | Hesapları listele / hesap aç |
| `PUT` / `DELETE` | `/api/users/[id]` | Admin | Parola sıfırla / hesabı sil |
| `POST` | `/api/photos` | — | **Misafir fotoğraf yükleme** (QR akışı) |
| `GET` | `/api/photos` | Oturum | Erişilebilen fotoğrafları listele |
| `DELETE` | `/api/photos/[id]` | Sahip/Admin | Fotoğrafı sil |
| `GET` | `/api/photos/[id]/file` | Sahip/Admin | Orijinal (`?size=thumb`, `?download=1`) |
| `GET` | `/api/photos/zip` | Sahip/Admin | Galeriyi ZIP olarak indir |

## Teknolojiler

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Cormorant Garamond + Jost · qrcode
