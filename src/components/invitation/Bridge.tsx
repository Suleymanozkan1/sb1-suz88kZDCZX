/**
 * Bölüm köprüsü — metin barındırmayan bir nefes aralığı.
 *
 * Sayfanın renk yolculuğu gece ile gündüz arasında dönerken ara tonlardan
 * geçer; bu ara tonların üzerinde ne açık ne koyu metin okunur. Köprü, o
 * dönüşe metinsiz bir koşu mesafesi verir. Ortadaki ince dikey çizgi
 * boşluğun kasıtlı olduğunu belli eder — sayfa bitmiş gibi durmaz.
 */
export default function Bridge({ height = '58vh' }: { height?: string }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height }}
      aria-hidden
    >
      <span
        className="block w-px"
        style={{
          height: '38%',
          background:
            'linear-gradient(180deg, transparent, rgba(176,141,63,0.35), transparent)',
        }}
      />
    </div>
  );
}
