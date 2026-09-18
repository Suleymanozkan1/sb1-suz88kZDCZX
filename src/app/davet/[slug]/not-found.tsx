/**
 * Bulunamayan ya da yayından kaldırılmış davetiye.
 *
 * Ayrı bir dosya olmasının sebebi durum kodu: sayfa içinde bir mesaj
 * döndürmek 200 üretiyordu, yani var olmayan bir davetiye "başarıyla" var
 * gibi yanıtlanıyor ve arama motorlarınca indekslenebiliyordu.
 */
export default function InvitationNotFound() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 text-center"
      style={{ background: 'radial-gradient(ellipse at center, var(--c-ember), var(--c-night))' }}
    >
      <div>
        <h1 className="t-display" style={{ color: 'var(--c-on-dark)' }}>
          Davetiye Bulunamadı
        </h1>
        <p className="t-body mt-4" style={{ color: 'var(--c-on-dark-soft)' }}>
          Bu davetiye mevcut değil veya yayında değil.
        </p>
      </div>
    </main>
  );
}
