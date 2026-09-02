/** Geçersiz ya da yayından kaldırılmış yükleme bağlantısı. */
export default function UploadNotFound() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 text-center"
      style={{ background: 'radial-gradient(ellipse at center, var(--c-ember), var(--c-night))' }}
    >
      <div>
        <h1 className="t-display" style={{ color: 'var(--c-on-dark)' }}>
          Sayfa Bulunamadı
        </h1>
        <p className="t-body mt-4" style={{ color: 'var(--c-on-dark-soft)' }}>
          Bu yükleme bağlantısı geçerli değil.
        </p>
      </div>
    </main>
  );
}
