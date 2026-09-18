"""
Davetiye arka plan müziklerini üretir.

Neden sentezleniyor: hazır bir parçayı dışarıdan bağlamak hem telif sorunu
hem de kırılganlık demek — projedeki eski varsayılan adres (mixkit) bugün
403 dönüyor ve müzik hiç çalmıyordu. Buradaki parçalar tamamen bu betikle
üretilir, depoda durur ve kimseye bağımlı değildir.

Çalıştırmak için: numpy ve ffmpeg gerekir.
    pip install numpy && apt-get install -y ffmpeg
    python3 scripts/muzik_uret.py

Çıktı: public/muzik/*.mp3
"""

import math
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / 'public' / 'muzik'

# ─────────────────────────────────────────────────────────── nota yardımı

def nota(ad: str) -> float:
    """'A4', 'C#5', 'Bb3' → frekans."""
    adim = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    yari = adim[ad[0]]
    i = 1
    while i < len(ad) and ad[i] in '#b':
        yari += 1 if ad[i] == '#' else -1
        i += 1
    oktav = int(ad[i:])
    return 440.0 * 2 ** ((yari + (oktav - 4) * 12 - 9) / 12)


def zarf(n: int, atak: float, sonum: float, tut: float = 0.0) -> np.ndarray:
    """Yumuşak atak + üstel sönüm. Atak olmadan her nota tıklama sesi verir."""
    t = np.arange(n) / SR
    a = np.clip(t / max(atak, 1e-4), 0, 1) ** 2
    d = np.exp(-np.maximum(t - tut, 0) / sonum)
    return a * d


def kapanis(x: np.ndarray, ms: float = 6.0) -> np.ndarray:
    """Nota sonunda ani kesme olmasın."""
    k = int(SR * ms / 1000)
    if k * 2 < len(x):
        x[-k:] *= np.linspace(1, 0, k)
    return x


# ─────────────────────────────────────────────────────────── tınılar

def piyano(f: float, sure: float, guc: float = 1.0) -> np.ndarray:
    """Çok sayıda harmonik, hafif inharmoniklik — akustik piyanoya yaklaşır."""
    n = int(SR * sure)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for h in range(1, 13):
        # Gerçek tellerde üst harmonikler hafifçe tizleşir.
        fh = f * h * (1 + 0.0004 * h * h)
        if fh > SR / 2.2:
            break
        genlik = 1.0 / (h ** 1.6)
        # Üst harmonikler daha çabuk söner.
        x += genlik * np.sin(2 * np.pi * fh * t) * np.exp(-t * (0.6 + 0.5 * h))
    x *= zarf(n, 0.006, sure * 0.55)
    return kapanis(x * guc)


def arp(f: float, sure: float, guc: float = 1.0) -> np.ndarray:
    """Daha parlak, daha kısa sönümlü tel — arp/telli çalgı."""
    n = int(SR * sure)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for h in range(1, 10):
        fh = f * h
        if fh > SR / 2.2:
            break
        x += (1.0 / (h ** 1.25)) * np.sin(2 * np.pi * fh * t) * np.exp(-t * (1.4 + 0.7 * h))
    x *= zarf(n, 0.003, sure * 0.4)
    return kapanis(x * guc)


def yayli(f: float, sure: float, guc: float = 1.0) -> np.ndarray:
    """Yavaş atak, hafif vibrato, üç ses hafif akortsuz — yaylı grubu."""
    n = int(SR * sure)
    t = np.arange(n) / SR
    vib = 1 + 0.0035 * np.sin(2 * np.pi * 5.2 * t)
    x = np.zeros(n)
    for kayma in (-0.13, 0.0, 0.15):
        fk = f * (1 + kayma / 100)
        for h in range(1, 9):
            fh = fk * h
            if fh > SR / 2.2:
                break
            x += (1.0 / (h ** 1.5)) * np.sin(2 * np.pi * fh * t * vib) / 3
    x *= zarf(n, 0.35, sure * 3.0, tut=sure * 0.55)
    return kapanis(x * guc, 40)


def kanun(f: float, sure: float, guc: float = 1.0) -> np.ndarray:
    """Metalik, çabuk sönen tel."""
    n = int(SR * sure)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for h in range(1, 14):
        fh = f * h * (1 + 0.0006 * h * h)
        if fh > SR / 2.2:
            break
        x += (1.0 / (h ** 1.15)) * np.sin(2 * np.pi * fh * t) * np.exp(-t * (2.0 + 0.9 * h))
    x *= zarf(n, 0.002, sure * 0.3)
    return kapanis(x * guc)


def ney(f: float, sure: float, guc: float = 1.0) -> np.ndarray:
    """Nefesli: yumuşak sinüs + üfleme gürültüsü."""
    n = int(SR * sure)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 4.6 * t)
    x = np.sin(2 * np.pi * f * t * vib)
    x += 0.32 * np.sin(2 * np.pi * 2 * f * t * vib)
    x += 0.12 * np.sin(2 * np.pi * 3 * f * t * vib)
    # Üfleme gürültüsü.
    #
    # Tek geçişli kısa bir ortalama yeterli değildi: gürültü 14 kHz'e kadar
    # yayılıp parçayı tıslatıyordu. Art arda uygulanan uzun ortalamalar
    # yüksek frekansları çok daha sert bastırır ve geriye yalnızca nefesin
    # duyulur kısmı kalır.
    nefes = np.random.default_rng(7).normal(0, 1, n)
    for _ in range(4):
        nefes = np.convolve(nefes, np.ones(96) / 96, mode='same')
    nefes /= (np.abs(nefes).max() or 1)
    x += 0.05 * nefes
    x *= zarf(n, 0.12, sure * 2.5, tut=sure * 0.6)
    return kapanis(x * guc, 30)


# ─────────────────────────────────────────────────────────── mekân

def yankı(x: np.ndarray, miktar: float = 0.28, sure: float = 1.9) -> np.ndarray:
    """
    Basit ama ikna edici oda: üstel sönen gürültüyle evrişim.
    Kuru sinyalle karıştırılır, böylece notalar bulanıklaşmaz.
    """
    n = int(SR * sure)
    rng = np.random.default_rng(3)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (SR * sure / 5))
    ir[:int(SR * 0.008)] = 0  # ilk yansımaya kadar boşluk
    ir /= np.abs(ir).sum()
    toplam = len(x) + n
    islak = np.convolve(x, ir, mode='full')[:toplam]
    if len(islak) < toplam:
        islak = np.pad(islak, (0, toplam - len(islak)))
    cikti = np.zeros(toplam)
    cikti[:len(x)] = x
    return cikti * (1 - miktar) + islak * miktar


def son_kirp(sol: np.ndarray, sag: np.ndarray, esik: float = 0.002) -> int:
    """
    Sondaki sessizliğin başladığı yeri bulur.

    Yankı kuyruğu için ayrılan pay, parça bittikten sonra saniyelerce
    sessizlik bırakıyordu; döngüde bu, her turda duyulan bir boşluk demek.
    """
    zarf_ = np.maximum(np.abs(sol), np.abs(sag))
    dolu = np.nonzero(zarf_ > esik)[0]
    return int(dolu[-1]) + 1 if len(dolu) else len(sol)


def dongulendir(x: np.ndarray, giris: float = 1.2, cikis: float = 3.5) -> np.ndarray:
    """
    Parçayı sessizlikten başlatıp sessizliğe indirir.

    MP3 kusursuz döngü veremez: kodlayıcı başa ve sona sessiz örnek ekler, bu
    yüzden `loop` her turda küçük bir boşluk bırakır. Parça zaten sönerek
    bitip sönerek başlıyorsa o boşluk duyulmaz. Kuyruğu başa katlamayı
    denemek ise tersine, döngü noktasında sıçrama üretiyordu.
    """
    y = x.copy()
    g = int(SR * giris)
    c = int(SR * cikis)
    if g < len(y):
        y[:g] *= np.linspace(0, 1, g) ** 1.5
    if c < len(y):
        y[-c:] *= np.linspace(1, 0, c) ** 1.5
    return y


def yaz(ad: str, sol: np.ndarray, sag: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    tepe = max(np.abs(sol).max(), np.abs(sag).max())
    sol, sag = sol / tepe * 0.82, sag / tepe * 0.82
    # Yumuşak tavan: sert kırpma yerine tanh.
    sol, sag = np.tanh(sol * 1.05), np.tanh(sag * 1.05)

    stereo = np.stack([sol, sag], axis=1)
    pcm = (stereo * 32767).astype('<i2')

    wav = OUT / f'{ad}.wav'
    with wave.open(str(wav), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    mp3 = OUT / f'{ad}.mp3'
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav),
         '-codec:a', 'libmp3lame', '-b:a', '112k', '-ar', '44100', str(mp3)],
        check=True,
    )
    wav.unlink()
    print(f'  {mp3.name}  {mp3.stat().st_size / 1024:.0f} KB  {len(sol) / SR:.1f} sn')


# ─────────────────────────────────────────────────────────── besteler

# Kaç kez dönülecek. Arka planda çalan bir parçada iki tur fazla tekrar
# hissi veriyordu; üç tur, sönerek biten yapıyla birlikte yeterli uzunluk.
TUR = 3

def yerlestir(hedef: np.ndarray, ses: np.ndarray, an: float, pan: float = 0.0):
    """Sesi zaman çizgisine yerleştirir. pan: -1 sol, +1 sağ."""
    i = int(an * SR)
    n = min(len(ses), len(hedef[0]) - i)
    if n <= 0:
        return
    sol = math.sqrt((1 - pan) / 2)
    sag = math.sqrt((1 + pan) / 2)
    hedef[0][i:i + n] += ses[:n] * sol
    hedef[1][i:i + n] += ses[:n] * sag


def besteci(sure: float):
    n = int(SR * sure)
    return [np.zeros(n), np.zeros(n)]


def piyano_sakin():
    """
    Re majör, I–V–vi–IV. Sağ elde kırık akor, solda kök.
    Düğün davetiyesinde en çok istenen sıcak ve sade piyano dokusu.
    """
    vurus = 0.5                      # 120 BPM
    olcu = vurus * 4
    akorlar = [
        (['D3'], ['F#4', 'A4', 'D5', 'A4']),
        (['A2'], ['E4', 'A4', 'C#5', 'A4']),
        (['B2'], ['F#4', 'B4', 'D5', 'B4']),
        (['G2'], ['D4', 'G4', 'B4', 'G4']),
    ]
    tur = len(akorlar) * olcu
    parca = besteci(tur * TUR + 4.0)

    for tekrar in range(TUR):
        for i, (bas, ust) in enumerate(akorlar):
            t0 = tekrar * tur + i * olcu
            for b in bas:
                yerlestir(parca, piyano(nota(b), 2.2, 0.5), t0, -0.12)
                yerlestir(parca, piyano(nota(b) * 2, 2.0, 0.22), t0 + vurus * 2, -0.1)
            # Kırık akor sekizlikler hâlinde iki kez dolaşır.
            for j in range(8):
                ad = ust[j % len(ust)]
                guc = 0.34 if j % 2 == 0 else 0.24
                yerlestir(parca, piyano(nota(ad), 1.4, guc), t0 + j * vurus / 2, 0.14)

    # Ezgi: ikinci turda üstte sade bir çizgi.
    ezgi = [('A5', 0.0, 1.5), ('F#5', 1.5, 0.5), ('E5', 2.0, 2.0),
            ('D5', 4.0, 1.5), ('E5', 5.5, 0.5), ('F#5', 6.0, 2.0)]
    for tekrar in (1, 2):
        for ad, an, uz in ezgi:
            yerlestir(parca, piyano(nota(ad), uz + 0.6, 0.30), tekrar * tur + an, 0.05)

    return parca


def arp_zarif():
    """Fa majör, arp dokusu. Piyanodan daha ince ve ışıltılı bir alternatif."""
    vurus = 0.55
    olcu = vurus * 4
    akorlar = [
        ['F3', 'C4', 'F4', 'A4', 'C5', 'F5'],
        ['A3', 'E4', 'A4', 'C5', 'E5', 'A5'],
        ['Bb3', 'F4', 'Bb4', 'D5', 'F5', 'Bb5'],
        ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'],
    ]
    tur = len(akorlar) * olcu
    parca = besteci(tur * TUR + 4.0)

    for tekrar in range(TUR):
        for i, akor in enumerate(akorlar):
            t0 = tekrar * tur + i * olcu
            # Yukarı ve aşağı dolaşan arpej.
            sira = akor + akor[-2:0:-1]
            for j, ad in enumerate(sira):
                pan = -0.35 + 0.7 * (j / max(len(sira) - 1, 1))
                yerlestir(parca, arp(nota(ad), 1.6, 0.32), t0 + j * olcu / len(sira), pan)
            yerlestir(parca, yayli(nota(akor[0]) / 2, olcu, 0.14), t0, 0.0)

    return parca


def yayli_duygusal():
    """La minör → Do majör dokusunda yaylı yastığı; en duygusal seçenek."""
    olcu = 3.0
    akorlar = [
        ['A3', 'C4', 'E4'],
        ['F3', 'A3', 'C4'],
        ['C3', 'E3', 'G3'],
        ['G3', 'B3', 'D4'],
    ]
    tur = len(akorlar) * olcu
    parca = besteci(tur * TUR + 4.0)

    for tekrar in range(TUR):
        for i, akor in enumerate(akorlar):
            t0 = tekrar * tur + i * olcu
            for k, ad in enumerate(akor):
                pan = -0.3 + 0.3 * k
                yerlestir(parca, yayli(nota(ad), olcu * 0.95, 0.30), t0, pan)
            yerlestir(parca, yayli(nota(akor[0]) / 2, olcu * 0.95, 0.18), t0, 0.0)

    ezgi = [('E5', 0.0, 2.5), ('D5', 3.0, 2.5), ('C5', 6.0, 2.5), ('B4', 9.0, 2.5),
            ('C5', 12.0, 3.0), ('E5', 15.0, 3.0), ('D5', 18.0, 5.5)]
    for tekrar in range(TUR):
        for ad, an, uz in ezgi:
            yerlestir(parca, yayli(nota(ad), uz, 0.24), tekrar * tur + an, 0.1)
            yerlestir(parca, arp(nota(ad) * 2, 1.2, 0.07), tekrar * tur + an, 0.25)

    return parca


def anadolu():
    """
    Nihavend dokusunda kanun + ney. Türk düğünlerine yakın duran seçenek.
    Karar sesi Re; dizi: Re Mi Fa Sol La Sib Do.
    """
    vurus = 0.6
    olcu = vurus * 4
    akorlar = [
        (['D3', 'A3'], ['D4', 'F4', 'A4', 'D5']),
        (['G3', 'D4'], ['G4', 'Bb4', 'D5', 'G5']),
        (['Bb2', 'F3'], ['F4', 'A4', 'Bb4', 'D5']),
        (['A2', 'E3'], ['E4', 'A4', 'C#5', 'E5']),
    ]
    tur = len(akorlar) * olcu
    parca = besteci(tur * TUR + 4.0)

    for tekrar in range(TUR):
        for i, (bas, ust) in enumerate(akorlar):
            t0 = tekrar * tur + i * olcu
            for b in bas:
                yerlestir(parca, kanun(nota(b), 2.0, 0.30), t0, -0.2)
            for j in range(8):
                ad = ust[j % len(ust)]
                yerlestir(parca, kanun(nota(ad), 1.2, 0.26 if j % 2 == 0 else 0.18),
                          t0 + j * vurus / 2, 0.2)

    ezgi = [('A4', 0.0, 1.8), ('Bb4', 1.8, 0.6), ('A4', 2.4, 1.2), ('G4', 3.6, 1.8),
            ('F4', 5.4, 1.2), ('G4', 6.6, 0.6), ('A4', 7.2, 2.4),
            ('D5', 9.6, 1.8), ('C5', 11.4, 0.6), ('Bb4', 12.0, 1.2), ('A4', 13.2, 3.0)]
    for tekrar in (1, 2):
        for ad, an, uz in ezgi:
            yerlestir(parca, ney(nota(ad), uz, 0.34), tekrar * tur + an, 0.0)

    return parca



# ─────────────────────────────────────────────────────────── efektler

def muhur_kirilma():
    """
    Mühür kırılırken duyulan kısa ses: boğuk bir çatlama + üstüne yumuşak
    bir çan. Gerçek balmumu sesini taklit etmez, ama açılış anını
    duyulur kılar ve sahneyle uyumludur.
    """
    sure = 1.8
    n = int(SR * sure)
    t = np.arange(n) / SR
    rng = np.random.default_rng(11)

    # Çatlama: çok kısa, alçak frekanslı gürültü patlaması.
    catlak = rng.normal(0, 1, n)
    for _ in range(3):
        catlak = np.convolve(catlak, np.ones(64) / 64, mode='same')
    catlak /= (np.abs(catlak).max() or 1)
    catlak *= np.exp(-t / 0.06)

    # Çan: mühür açılışının "tamam" duygusu.
    can = np.zeros(n)
    for f, g in ((523.25, 1.0), (784.0, 0.5), (1046.5, 0.3), (1568.0, 0.12)):
        can += g * np.sin(2 * np.pi * f * t) * np.exp(-t / (0.9 - g * 0.35))
    can *= zarf(n, 0.004, 0.8)

    x = 0.55 * catlak + 0.45 * can / (np.abs(can).max() or 1)
    return kapanis(x, 60)


def zarf_acilma():
    """Kâğıt hışırtısı: dar bantlı, hızlı sönen yumuşak gürültü."""
    sure = 1.2
    n = int(SR * sure)
    t = np.arange(n) / SR
    rng = np.random.default_rng(23)

    x = rng.normal(0, 1, n)
    for _ in range(2):
        x = np.convolve(x, np.ones(20) / 20, mode='same')
    x /= (np.abs(x).max() or 1)
    # İki dalga: zarfın açılması ve kâğıdın çıkması.
    x *= np.exp(-t / 0.25) * (1 + 0.6 * np.sin(2 * np.pi * 2.5 * t))
    x *= zarf(n, 0.02, 0.45)
    return kapanis(x, 60)


EFEKTLER = {
    'muhur-kirilma': muhur_kirilma,
    'zarf-acilma': zarf_acilma,
}


PARCALAR = {
    'piyano-sakin': piyano_sakin,
    'arp-zarif': arp_zarif,
    'yayli-duygusal': yayli_duygusal,
    'anadolu-ney': anadolu,
}

if __name__ == '__main__':
    print('Müzikler üretiliyor:')
    for ad, yap in PARCALAR.items():
        parca = yap()
        sol_ham, sag_ham = yankı(parca[0]), yankı(parca[1])
        son = son_kirp(sol_ham, sag_ham)
        yaz(ad, dongulendir(sol_ham[:son]), dongulendir(sag_ham[:son]))

    print('Efekt sesleri:')
    for ad, yap in EFEKTLER.items():
        ses = yankı(yap(), miktar=0.22, sure=1.2)
        son = son_kirp(ses, ses)
        yaz(ad, ses[:son], ses[:son])
