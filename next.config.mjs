/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Paylaşım kartı yazı tipini diskten okuyor; izleyici bu okumayı
    // göremediği için dosyayı sunucu paketine elle dahil ediyoruz.
    outputFileTracingIncludes: {
      '/davet/[slug]/opengraph-image': ['./src/assets/**'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
