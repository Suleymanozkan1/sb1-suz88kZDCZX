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

### Admin paneli (`/admin`)

- Şifre korumalı giriş (`/admin/login`)
- Davetiye listesi: önizleme, düzenleme, link kopyalama, **QR kod** (indirilebilir),
  aktif/pasif yapma, silme (onaylı)
- Gelen katılım bildirimlerinin listesi
- **12 adımlı davetiye sihirbazı** (`/admin/new`, `/admin/[id]`):
  Çift Bilgileri · Düğün Bilgileri · Davet Metni · Manevi İçerik · Mühür & Tuğra ·
  Mektup Tasarımı · Fotoğraflar · Ses Ayarları · Tema · Program · SSS · Hikayemiz
- 6 mühür modeli, 3 mektup tasarımı, 5 renk teması
- Görseller sürükle-bırak/seçerek yüklenir ve kayıtla birlikte saklanır (maks. 4 MB)

## Kurulum

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD değerini değiştirin
npm run dev
```

- Davetiye: <http://localhost:3000/davet/[slug]>
- Admin: <http://localhost:3000/admin>

Üretim derlemesi:

```bash
npm run build && npm start
```

## Ortam değişkenleri

| Değişken | Açıklama | Varsayılan |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Admin paneli şifresi | `admin` |
| `ADMIN_SECRET` | Oturum çerezini imzalayan gizli dize | Şifreden türetilir |

Üretimde her ikisini de mutlaka ayarlayın.

## Veri saklama

Davetiyeler ve katılım bildirimleri `data/invitations.json` ve `data/rsvps.json`
dosyalarında tutulur (`src/lib/store.ts`). Bu dosyalar `.gitignore` içindedir.

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

## Teknolojiler

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
Cormorant Garamond + Jost · qrcode
