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
| `ADMIN_PASSWORD` | Admin hesabı ilk oluşturulurken kullanılan parola | `admin` |
| `ADMIN_SECRET` | Oturum çerezini imzalayan gizli dize | Şifreden türetilir |
| `POSTGRES_URL` | Varsa SQL sürücüsü devreye girer | — (dosya sürücüsü) |
| `BLOB_READ_WRITE_TOKEN` | Varsa dosyalar Vercel Blob'a yazılır | — (yerel disk) |

İlk ikisini üretimde mutlaka ayarlayın. Son ikisi Vercel'de depolama
bağladığınızda otomatik eklenir.

## Veri saklama

Uygulama iki depolama sürücüsüyle gelir ve seçimi ortam değişkenlerine göre
kendisi yapar — kodda değişiklik gerekmez.

| Ortam | Kayıtlar | Dosyalar |
| --- | --- | --- |
| Yerel geliştirme | `data/*.json` | `data/uploads/` |
| Üretim | Postgres (`POSTGRES_URL`) | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |

`POSTGRES_URL` tanımlıysa SQL sürücüsü, değilse dosya sürücüsü devreye girer
(`src/lib/store/index.ts`). Aynı mantık dosyalar için `src/lib/files.ts`
içindedir. Böylece `npm run dev` hiçbir servis kurmadan çalışır, üretimde ise
veriler kalıcı olur.

Postgres şeması ilk sorguda kendiliğinden oluşturulur; ayrı bir migration
adımı yoktur. Davetiyenin sık değişen alanları tek bir `jsonb` sütununda
durur, yalnızca sorgulanan alanlar (`slug`, `owner_id`, `is_active`) ayrı
sütundadır — yeni bir davetiye alanı eklemek şema değişikliği gerektirmez.

### Dosyalarda iki ayrı isim alanı

Bu ayrım bir güvenlik sınırıdır:

- **private** — misafirlerin yüklediği fotoğraflar. Yalnızca yetki denetimi
  yapan `/api/photos/[id]/file` ucundan okunur, adresi hiç dışarı verilmez.
- **public** — davetiyede görünen kapak/galeri/mühür görselleri. Doğrudan
  servis edilir.

Genel uç (`/api/files/[name]`) yalnızca `public` alanını okur; sızan bir dosya
adı özel bir fotoğrafı açığa çıkaramaz.

## Vercel'e kurulum

### 1. Projeyi içe aktarın

<https://vercel.com/new> → GitHub deponuzu seçin → **Import**. Next.js
otomatik algılanır, ayar değiştirmeniz gerekmez.

İlk dağıtım hata vermeden tamamlanır ama veriler henüz kalıcı değildir —
depolamayı bağlayana kadar öyle kalır.

### 2. Postgres bağlayın

Proje sayfasında **Storage** → **Create Database** → **Postgres** → bölge
olarak Frankfurt (`fra1`) önerilir → **Connect**.

Vercel `POSTGRES_URL` değişkenini projeye kendisi ekler. Tabloları siz
oluşturmayacaksınız; uygulama ilk isteğinde kurar.

### 3. Blob bağlayın

**Storage** → **Create** → **Blob** → **Connect**.

`BLOB_READ_WRITE_TOKEN` yine otomatik eklenir.

### 4. İki değişkeni elle girin

**Settings** → **Environment Variables**:

| Değişken | Değer |
| --- | --- |
| `ADMIN_PASSWORD` | Admin hesabının parolası |
| `ADMIN_SECRET` | `openssl rand -base64 32` çıktısı |

### 5. Yeniden dağıtın

**Deployments** → son dağıtım → **Redeploy**. Yeni değişkenler ancak bundan
sonra devreye girer.

### 6. Giriş yapın

`https://<projeniz>.vercel.app/giris` → kullanıcı adı `admin`, parola
4. adımda verdiğiniz `ADMIN_PASSWORD`.

> `ADMIN_PASSWORD` yalnızca admin hesabı **ilk kez oluşturulurken** kullanılır.
> Sonradan değiştirmek parolayı değiştirmez; parolayı unutursanız Postgres'te
> `delete from users where role = 'admin';` çalıştırıp yeniden dağıtın.

### Maliyet

Vercel Hobby planı, Postgres ve Blob'un ücretsiz katmanları bir düğün için
fazlasıyla yeter. Blob'un ücretsiz katmanı 1 GB depolama verir — 25 MB
sınırıyla yaklaşık 40 tam çözünürlüklü fotoğraf, sıkıştırılmış telefon
fotoğraflarıyla çok daha fazlası demektir.

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
| `POST` | `/api/upload` | Oturum | Davetiye görseli yükle (public alan) |
| `GET` | `/api/files/[name]` | — | Davetiye görselini servis et (public alan) |
| `GET` / `POST` | `/api/users` | Admin | Hesapları listele / hesap aç |
| `PUT` / `DELETE` | `/api/users/[id]` | Admin | Parola sıfırla / hesabı sil |
| `POST` | `/api/photos` | — | **Misafir fotoğraf yükleme** (QR akışı) |
| `GET` | `/api/photos` | Oturum | Erişilebilen fotoğrafları listele |
| `DELETE` | `/api/photos/[id]` | Sahip/Admin | Fotoğrafı sil |
| `GET` | `/api/photos/[id]/file` | Sahip/Admin | Orijinal (`?size=thumb`, `?download=1`) |
| `GET` | `/api/photos/zip` | Sahip/Admin | Galeriyi ZIP olarak indir |

## Teknolojiler

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Cormorant Garamond + Jost · qrcode · pg · Vercel Blob
