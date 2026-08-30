# WordPress Sürümü

Bu klasör, kök dizindeki Next.js uygulamasının WordPress karşılığıdır.
İki sürüm ayrı ayrı çalışır; ortak kod paylaşmazlar.

## Neden iki ayrı sürüm?

WordPress PHP + MySQL üzerinde çalışır; kökteki uygulama Node.js + React
(Next.js), Postgres ve Blob deposu üzerinde. Birini diğerine "uyarlamak"
mümkün değil — bu yüzden aynı ürün iki kez, her platformun kendi diliyle
yazıldı.

## Hangi sürüm nerede?

| | Next.js (kök) | WordPress (`wordpress/`) |
| --- | --- | --- |
| Çalıştığı yer | Vercel, Node.js sunucu | Herhangi bir WordPress barındırması |
| Veritabanı | Postgres | Sitenin MySQL'i |
| Dosyalar | Vercel Blob | Sunucu diski **veya Google Drive** |
| Oturum | Kendi çerez katmanı | WordPress kullanıcıları ve rolleri |
| Panel | Kendi arayüzü | WordPress paneli |
| Davetiye sayfası | Aynı | Aynı |

Misafirin gördüğü sayfa — perde, mühür, mektup, geri sayım, katılım formu,
dilek defteri, paylaşım kartı — iki sürümde de aynı tasarım simgeleriyle,
aynı ölçülerle çizilir.

## Kurulum

[`sahra-davetiye/README-KURULUM.md`](sahra-davetiye/README-KURULUM.md)
