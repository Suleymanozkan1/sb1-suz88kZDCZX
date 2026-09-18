<?php
/**
 * Konum bölümündeki GERÇEK harita görünümü.
 *
 * Üç deneme oldu. (1) Google'ın gömülü haritası: gezilebilir olduğu için
 * misafir onun üzerinde başka bir yer seçebiliyor, yol tarifini yanlış
 * noktadan alabiliyordu. (2) Yerine konan düz adres paneli: hiçbir şey
 * göstermiyor, misafir salonun nerede olduğunu görmüyor. (3) Yöneticinin
 * elle yüklediği ekran görüntüsü: yüklenmediği sürece (2)'ye düşüyor ve
 * pratikte yüklenmiyor.
 *
 * Bu yüzden harita görseli ÜRETİLİYOR: salonun koordinatı OpenStreetMap
 * karolarından birleştirilip diske yazılıyor. Durağan bir görsel olduğu
 * için üzerinde gezilemiyor (seçim de yapılamıyor) ama gerçek bir harita
 * görünümü — sokaklar, çevredeki isimler, salonun üstünde imleç.
 *
 * Google Static Maps yerine OSM: anahtar ve faturalandırma gerektirmiyor.
 * Karşılığında atıf zorunlu ve görselin üstüne basılıyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Harita {

	/** Karo boyu — OSM standardı. */
	const KARO = 256;

	/**
	 * Görsel ölçüsü 16/10: şablondaki `.map-gorsel` aynı orana kırpıyor,
	 * başka bir oran görselin kenarlarını boşa çıkarırdı.
	 *
	 * 1024x640 ile başladı ve HARİTA UZAK görünüyordu: kutu telefonda
	 * 360px, masaüstünde ~365px; 1024px'lik görsel 2,8 kat küçülünce
	 * ekranda z16 haritası z14,5 gibi duruyor, sokak adları okunmuyor.
	 * 768 genişlik küçültmeyi 2,1 kata indiriyor ve bir yakınlık
	 * basamağı eklenince ekrandaki ölçek sokak seviyesine geliyor.
	 * Yan etkisi iyi: 20 karo yerine 12, ~90 KB yerine ~150 KB.
	 */
	const G = 768;
	const Y = 480;

	/**
	 * Yakınlık: salonun bulunduğu sokak ve çevresindeki iki üç blok.
	 * Daha uzağı "şehir neresi" sorusuna cevap veriyor ama misafirin
	 * sorusu "hangi sokak".
	 *
	 * 17, ekrandaki KÜÇÜLTMEYE karşılık geliyor: görsel kutusundan
	 * 2,1 kat büyük çiziliyor, yani bir basamak yakından başlamak
	 * gerekiyor (iki kat = bir yakınlık basamağı).
	 */
	const YAKINLIK = 17;

	/** OSM karo sunucusu, kullanım politikası gereği tanıtıcı istiyor. */
	const KARO_SUNUCU = 'https://tile.openstreetmap.org/';

	/**
	 * Koordinat çözülemeyen salon için ikinci bir denemeye girilmesin:
	 * her panel açılışında ağ isteği yapmak, çözülemeyen bir adres için
	 * sayfayı yavaşlatmaktan başka bir şey yapmıyor.
	 */
	const DENEME_OPTION = 'sahra_harita_deneme';

	/** Günlük bakım kancası. */
	const BAKIM_HOOK = 'sahra_harita_bakim';

	/**
	 * Bir bakım turunda işlenecek en çok salon sayısı.
	 *
	 * Her salon iki ağ isteği demek; sınırsız bir tur, salonu çok olan
	 * bir kurulumda cron isteğini zaman aşımına düşürüyor.
	 */
	const SINIR = 5;

	/* --------------------------------------------------------- koordinat */

	/**
	 * Salonun koordinatı ya da null.
	 *
	 * Kayıtta duran değer okunuyor; ÜRETİM yolu (ağ) ayrı
	 * (bkz. cozumle). Davetiye çizilirken ağa çıkılmaz.
	 */
	public static function koordinat( $salon ) {
		$lat = isset( $salon['venueLat'] ) ? self::sayi( $salon['venueLat'] ) : null;
		$lng = isset( $salon['venueLng'] ) ? self::sayi( $salon['venueLng'] ) : null;

		if ( null === $lat || null === $lng ) {
			return null;
		}
		if ( abs( $lat ) > 90 || abs( $lng ) > 180 ) {
			return null;
		}
		/*
		 * 0,0 Gine Körfezi'nde bir nokta: pratikte "boş" demek ve
		 * üstündeki karolar da denizden ibaret. Salon orada olamaz.
		 */
		if ( 0.0 === $lat && 0.0 === $lng ) {
			return null;
		}

		return array( 'lat' => $lat, 'lng' => $lng );
	}

	/** Ondalık ayırıcısı virgül de olabiliyor (yönetici elle yazıyor). */
	private static function sayi( $ham ) {
		$ham = trim( str_replace( ',', '.', (string) $ham ) );
		if ( '' === $ham || ! is_numeric( $ham ) ) {
			return null;
		}
		return (float) $ham;
	}

	/**
	 * Koordinatı AĞDAN çözer: harita linkinden, olmazsa adresten.
	 *
	 * Yalnızca yönetici yolundan (salon kaydı / panel) çağrılır.
	 *
	 * @return array|null lat/lng ya da null.
	 */
	public static function cozumle( $salon ) {
		$link = isset( $salon['mapUrl'] ) ? (string) $salon['mapUrl'] : '';

		if ( $link ) {
			$k = self::linkten( $link );
			if ( $k ) {
				return $k;
			}
			/*
			 * Paylaş düğmesinin verdiği kısa link koordinat taşımıyor;
			 * yönlendirmesi izlenince uzun adrese (ve koordinata)
			 * çıkıyor. Yöneticiden "uzun linki bul" istemek, yanlış
			 * link yapıştırmanın yolunu açardı.
			 */
			$uzun = self::kisa_linki_ac( $link );
			if ( $uzun ) {
				$k = self::linkten( $uzun );
				if ( $k ) {
					return $k;
				}
			}
		}

		if ( ! empty( $salon['appleMapUrl'] ) ) {
			$k = self::linkten( (string) $salon['appleMapUrl'] );
			if ( $k ) {
				return $k;
			}
		}

		return self::adresten( $salon );
	}

	/**
	 * Harita linkindeki koordinat.
	 *
	 * Sıra önemli: `!3d/!4d` İĞNENİN kendisi, `@lat,lng` ise o an
	 * ekranda duran GÖRÜNTÜNÜN merkezi. İkisi aynı linkte birden
	 * bulunuyor ve merkez, kullanıcı haritayı kaydırdığı için salondan
	 * yüzlerce metre uzakta olabiliyor.
	 */
	public static function linkten( $url ) {
		$url = (string) $url;

		if ( preg_match( '/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $url, $m ) ) {
			return self::dogrula( $m[1], $m[2] );
		}

		// ?q= / ?query= / &ll= / &destination= / &center= : açıkça verilen nokta.
		if ( preg_match( '/[?&](?:q|query|ll|sll|destination|center|daddr)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i', $url, $m ) ) {
			return self::dogrula( $m[1], $m[2] );
		}

		if ( preg_match( '/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $m ) ) {
			return self::dogrula( $m[1], $m[2] );
		}

		return null;
	}

	private static function dogrula( $lat, $lng ) {
		return self::koordinat( array( 'venueLat' => $lat, 'venueLng' => $lng ) );
	}

	/** Kısa linkin yönlendirdiği uzun adres. */
	private static function kisa_linki_ac( $url ) {
		$yanit = wp_remote_get(
			$url,
			array(
				'timeout'     => 12,
				'redirection' => 0,
				'user-agent'  => self::tanitici(),
			)
		);

		if ( is_wp_error( $yanit ) ) {
			return '';
		}

		$yer = wp_remote_retrieve_header( $yanit, 'location' );
		if ( is_array( $yer ) ) {
			$yer = end( $yer );
		}

		return (string) $yer;
	}

	/**
	 * Adresten koordinat (Nominatim).
	 *
	 * Son çare: link koordinat taşımıyorsa. Salon kaydı başına bir kez
	 * çağrıldığı için servisin kullanım sınırının içinde kalıyor.
	 */
	private static function adresten( $salon ) {
		$parcalar = array_filter(
			array(
				isset( $salon['address'] ) ? $salon['address'] : '',
				isset( $salon['district'] ) ? $salon['district'] : '',
				isset( $salon['city'] ) ? $salon['city'] : '',
			)
		);

		if ( ! $parcalar ) {
			return null;
		}

		$yanit = wp_remote_get(
			add_query_arg(
				array(
					'q'               => rawurlencode( implode( ', ', $parcalar ) ),
					'format'          => 'json',
					'limit'           => 1,
					'accept-language' => 'tr',
				),
				'https://nominatim.openstreetmap.org/search'
			),
			array( 'timeout' => 15, 'user-agent' => self::tanitici() )
		);

		if ( is_wp_error( $yanit ) || 200 !== (int) wp_remote_retrieve_response_code( $yanit ) ) {
			return null;
		}

		$veri = json_decode( wp_remote_retrieve_body( $yanit ), true );
		if ( ! is_array( $veri ) || empty( $veri[0]['lat'] ) || empty( $veri[0]['lon'] ) ) {
			return null;
		}

		return self::dogrula( $veri[0]['lat'], $veri[0]['lon'] );
	}

	/**
	 * İstemci tanıtıcısı.
	 *
	 * OSM'nin kullanım politikası tanınabilir bir tanıtıcı istiyor;
	 * genel bir kütüphane adıyla çıkan istekler engelleniyor.
	 */
	private static function tanitici() {
		return 'SahraDavetiye/' . SAHRA_VERSION . ' (+' . home_url( '/' ) . ')';
	}

	/* ------------------------------------------------------------ görsel */

	/** Bu salonun harita görseli üretilmiş mi? */
	public static function hazir( $salon ) {
		$yol = self::onbellek_yolu( $salon );
		return $yol && file_exists( $yol );
	}

	/**
	 * Davetiyede kullanılacak adres.
	 *
	 * Doğrudan yükleme dizininin adresi verilmiyor: sunucudaki dosya
	 * yolu görünür oluyor ve dizin dışarıya açık olmayabiliyor. Kart
	 * (og:image) ile aynı yol: kendi rotasından servis ediliyor.
	 */
	public static function url( $salon ) {
		if ( empty( $salon['id'] ) || ! self::hazir( $salon ) ) {
			return '';
		}
		return Sahra_Render::harita_url( $salon['id'] );
	}

	/** Rotanın çıktısı. */
	public static function output( $venue_id ) {
		$salon = Sahra_Settings::venue_by_id( $venue_id );

		if ( ! $salon || ! self::koordinat( $salon ) ) {
			status_header( 404 );
			exit;
		}

		$yol = self::onbellek_yolu( $salon );

		/*
		 * Önbellek silinmişse burada yeniden üretiliyor: davetiye
		 * sayfası zaten çizilmiş oluyor ve görsel ayrı bir istekle
		 * geldiği için sayfa beklemiyor. Kırık görsel göstermekten iyi.
		 */
		if ( ! file_exists( $yol ) ) {
			$sonuc = self::uret( $salon );
			if ( is_wp_error( $sonuc ) ) {
				status_header( 404 );
				exit;
			}
		}

		header( 'Content-Type: image/jpeg' );
		header( 'Cache-Control: public, max-age=604800' );
		readfile( $yol ); // phpcs:ignore
		exit;
	}

	/**
	 * Görseli üretir ve diske yazar.
	 *
	 * @return string|WP_Error Dosya yolu ya da hata.
	 */
	public static function uret( $salon ) {
		if ( ! function_exists( 'imagecreatetruecolor' ) ) {
			return new WP_Error( 'sahra_harita_gd', __( 'Sunucuda GD görsel kütüphanesi yok; harita görseli üretilemiyor.', 'sahra-davetiye' ) );
		}

		$k = self::koordinat( $salon );
		if ( ! $k ) {
			return new WP_Error( 'sahra_harita_koordinat', __( 'Salonun koordinatı yok.', 'sahra-davetiye' ) );
		}

		$im = self::karolari_birlestir( $k );
		if ( is_wp_error( $im ) ) {
			return $im;
		}

		self::imlec( $im );

		/*
		 * JPEG, PNG değil: aynı harita PNG olarak 526 KB, JPEG 82
		 * olarak 145 KB. Davetiye telefondan açılıyor ve buradaki 380
		 * KB, sayfanın en pahalı isteği olurdu. Karolardaki sokak
		 * adları bu ölçekte (1024px görsel, 358px kutu) zaten
		 * okunmuyor; kaybedilen ayrıntı görünmüyor.
		 *
		 * Kalite 82: eklentinin yüklenen görsellerde kullandığı değer.
		 */
		ob_start();
		imagejpeg( $im, null, 82 );
		$veri = ob_get_clean();
		imagedestroy( $im );

		$yol = self::onbellek_yolu( $salon );
		wp_mkdir_p( dirname( $yol ) );

		if ( false === file_put_contents( $yol, $veri ) ) { // phpcs:ignore
			return new WP_Error( 'sahra_harita_yazma', __( 'Harita görseli diske yazılamadı.', 'sahra-davetiye' ) );
		}

		// Aynı salonun eski koordinatına ait görsel artık kimseye lazım değil.
		self::temizle( $salon['id'], basename( $yol ) );

		return $yol;
	}

	/**
	 * Karoları tek tuvale birleştirir.
	 *
	 * Klasik "slippy map" hesabı: koordinat KÜRESEL piksel uzayına
	 * çevriliyor, tuval o noktanın çevresinden kesiliyor ve kesite
	 * düşen karolar yerlerine kopyalanıyor.
	 */
	private static function karolari_birlestir( $k ) {
		$n   = pow( 2, self::YAKINLIK );
		$px  = ( $k['lng'] + 180 ) / 360 * $n * self::KARO;
		$rad = deg2rad( $k['lat'] );
		$py  = ( 1 - log( tan( $rad ) + 1 / cos( $rad ) ) / M_PI ) / 2 * $n * self::KARO;

		$sol = $px - self::G / 2;
		$ust = $py - self::Y / 2;

		$im = imagecreatetruecolor( self::G, self::Y );
		// Karo gelmeyen yer denizin rengi değil, haritanın kâğıdı olsun.
		imagefill( $im, 0, 0, imagecolorallocate( $im, 242, 239, 233 ) );

		$x0 = (int) floor( $sol / self::KARO );
		$x1 = (int) floor( ( $sol + self::G - 1 ) / self::KARO );
		$y0 = (int) floor( $ust / self::KARO );
		$y1 = (int) floor( ( $ust + self::Y - 1 ) / self::KARO );

		$gelen  = 0;
		$istek  = 0;

		for ( $x = $x0; $x <= $x1; $x++ ) {
			for ( $y = $y0; $y <= $y1; $y++ ) {
				// Kutuplardan taşan satır yok; boylamda ise dünya dönüyor.
				if ( $y < 0 || $y >= $n ) {
					continue;
				}
				$istek++;
				$karo = self::karo( ( $x % $n + $n ) % $n, $y );
				if ( ! $karo ) {
					continue;
				}
				imagecopy(
					$im,
					$karo,
					(int) round( $x * self::KARO - $sol ),
					(int) round( $y * self::KARO - $ust ),
					0,
					0,
					self::KARO,
					self::KARO
				);
				imagedestroy( $karo );
				$gelen++;
			}
		}

		/*
		 * Eksik karo ile yayına çıkılmaz: yarısı boş bir harita, hiç
		 * harita olmamasından daha kötü görünüyor (misafir eksik
		 * bölgeyi "burada bir şey yok" diye okuyor). Hepsi gelmezse
		 * salon adres paneline düşüyor.
		 */
		if ( ! $istek || $gelen < $istek ) {
			imagedestroy( $im );
			return new WP_Error(
				'sahra_harita_karo',
				sprintf(
					/* translators: 1: gelen karo sayısı, 2: istenen karo sayısı. */
					__( 'Harita karoları indirilemedi (%1$d/%2$d). Sunucunun dışarıya erişimi olmayabilir.', 'sahra-davetiye' ),
					$gelen,
					$istek
				)
			);
		}

		return $im;
	}

	/** Tek karo. */
	private static function karo( $x, $y ) {
		$yanit = wp_remote_get(
			self::KARO_SUNUCU . self::YAKINLIK . '/' . $x . '/' . $y . '.png',
			array( 'timeout' => 15, 'user-agent' => self::tanitici() )
		);

		if ( is_wp_error( $yanit ) || 200 !== (int) wp_remote_retrieve_response_code( $yanit ) ) {
			return null;
		}

		$im = @imagecreatefromstring( wp_remote_retrieve_body( $yanit ) ); // phpcs:ignore
		return $im ? $im : null;
	}

	/**
	 * Salonun üstündeki imleç.
	 *
	 * Üç kat büyük çizilip küçültülüyor: GD'nin dolgulu şekillerinde
	 * kenar yumuşatma yok, imleç haritanın üstünde tırtıklı duruyordu.
	 */
	private static function imlec( $im ) {
		$olcek = 3;
		$g     = 54 * $olcek;
		$y     = 72 * $olcek;

		$kat = imagecreatetruecolor( $g, $y );
		imagealphablending( $kat, false );
		imagesavealpha( $kat, true );
		imagefill( $kat, 0, 0, imagecolorallocatealpha( $kat, 0, 0, 0, 127 ) );
		imagealphablending( $kat, true );

		$altin = imagecolorallocate( $kat, 176, 137, 74 );
		$koyu  = imagecolorallocate( $kat, 26, 24, 22 );
		$krem  = imagecolorallocate( $kat, 250, 247, 240 );

		$merkez = (int) ( $g / 2 );
		$capr   = 22 * $olcek;

		// Damla: daire + aşağı inen üçgen.
		imagefilledpolygon(
			$kat,
			array(
				$merkez - 15 * $olcek, 40 * $olcek,
				$merkez + 15 * $olcek, 40 * $olcek,
				$merkez, 70 * $olcek,
			),
			$koyu
		);
		imagefilledellipse( $kat, $merkez, 26 * $olcek, $capr * 2, $capr * 2, $koyu );
		imagefilledpolygon(
			$kat,
			array(
				$merkez - 12 * $olcek, 40 * $olcek,
				$merkez + 12 * $olcek, 40 * $olcek,
				$merkez, 66 * $olcek,
			),
			$altin
		);
		imagefilledellipse( $kat, $merkez, 26 * $olcek, ( $capr - 3 * $olcek ) * 2, ( $capr - 3 * $olcek ) * 2, $altin );
		imagefilledellipse( $kat, $merkez, 26 * $olcek, 9 * $olcek * 2, 9 * $olcek * 2, $krem );

		/*
		 * İmlecin UCU koordinatın üstünde durmalı, ortası değil: daire
		 * merkeze konunca iğne salonun kuzeyinde bir yeri gösteriyor.
		 */
		imagecopyresampled(
			$im,
			$kat,
			(int) ( self::G / 2 - 54 / 2 ),
			(int) ( self::Y / 2 - 70 ),
			0,
			0,
			54,
			72,
			$g,
			$y
		);
		imagedestroy( $kat );
	}

	/*
	 * ATIF GÖRSELE BASILMIYOR.
	 *
	 * İlk hâlinde 17 puntoyla görselin köşesine yazılıyordu: 1024px'lik
	 * görsel telefonda 358px'e ölçekleniyor ve o yazı 6px'e düşüyor —
	 * okunmuyor, yani atıf da yapılmamış oluyor. Üstelik davetiyenin
	 * "mobilde hiçbir metin 16px'in altında değil" kuralı bir görselin
	 * içindeki yazıyı hiç ölçmüyor: kural sessizce delinirdi.
	 *
	 * Atıf artık haritanın ALTINDA, HTML metni olarak duruyor
	 * (`.map-atif`): puntosu ölçeğe bağlı, kendi zemini sayfanın kâğıdı
	 * ve OpenStreetMap telif sayfasına giden gerçek bir bağlantı
	 * taşıyor — görselin içindeki yazı bağlantı olamıyordu.
	 */

	/* --------------------------------------------------------- önbellek */

	/**
	 * Önbellek yolu koordinatın özetini taşıyor.
	 *
	 * Salon taşınınca ya da yakınlık/çizim değişince eski görselin
	 * sonsuza kadar sabitlenmemesi için — kartta (og:image) aynı hata
	 * yapılmış ve eski kart hiç yenilenmemişti.
	 */
	private static function onbellek_yolu( $salon ) {
		$k = self::koordinat( $salon );
		if ( ! $k || empty( $salon['id'] ) ) {
			return '';
		}

		$imza = md5(
			wp_json_encode(
				array( SAHRA_VERSION, $k['lat'], $k['lng'], self::YAKINLIK, self::G, self::Y )
			)
		);

		$uploads = wp_upload_dir();
		return trailingslashit( $uploads['basedir'] ) . 'sahra-davetiye/harita/' . sanitize_key( $salon['id'] ) . '-' . $imza . '.jpg';
	}

	/**
	 * Salonun disk üstündeki harita görsellerini siler.
	 *
	 * @param string $venue_id Salon kimliği.
	 * @param string $koru     Silinmeyecek dosya adı (yeni yazılan görsel).
	 */
	public static function temizle( $venue_id, $koru = '' ) {
		$venue_id = sanitize_key( $venue_id );
		if ( '' === $venue_id ) {
			return;
		}

		$uploads = wp_upload_dir();
		$dizin   = trailingslashit( $uploads['basedir'] ) . 'sahra-davetiye/harita/';
		if ( ! is_dir( $dizin ) ) {
			return;
		}

		/*
		 * İki uzantı da süpürülüyor: görsel bir dönem PNG yazılıyordu
		 * ve biçim değişince eski dosyalar öksüz kaldı — imzada yalnızca
		 * SÜRÜM var, uzantı yok.
		 */
		foreach ( (array) glob( $dizin . $venue_id . '-*.{jpg,png}', GLOB_BRACE ) as $dosya ) {
			if ( $koru && basename( $dosya ) === $koru ) {
				continue;
			}
			// "salon-1" ile "salon-12" karışmasın: ad kalıbı tam eşleşmeli.
			if ( preg_match( '/^' . preg_quote( $venue_id, '/' ) . '-[0-9a-f]{32}\.(jpg|png)$/', basename( $dosya ) ) ) {
				wp_delete_file( $dosya );
			}
		}
	}

	/* ---------------------------------------------------------- yönetici */

	/**
	 * Koordinatı yoksa çözer, görseli yoksa üretir — SINIRLI SAYIDA.
	 *
	 * Panel açılırken çağrılıyordu ve denetim ortamında 96 salon
	 * bulunuyor: her biri için iki ağ isteği, sayfa dakikalarca
	 * açılmıyordu. Artık günlük bakımdan (ve sürüm değişince bir kez)
	 * koşuyor; bir turda en çok SINIR salon işleniyor, kalan varsa
	 * kendini yeniden kuruyor.
	 *
	 * Çözülemeyen salon için bir daha ağa çıkılmıyor: adresi
	 * bulunamayan bir salon yüzünden her bakım turu boşa gitmesin.
	 * Adres ya da link değişince imza değişiyor ve deneme hakkı
	 * kendiliğinden yenileniyor.
	 *
	 * @return int İşlenen (üretilmeye çalışılan) salon sayısı.
	 */
	public static function bakim() {
		$denemeler = self::denemeler();
		$islenen   = 0;
		$kalan     = 0;

		foreach ( Sahra_Settings::venues() as $salon ) {
			if ( self::hazir( $salon ) ) {
				continue;
			}

			$imza = self::adres_imzasi( $salon );
			if ( isset( $denemeler[ $salon['id'] ]['imza'] ) && $denemeler[ $salon['id'] ]['imza'] === $imza ) {
				continue;
			}

			if ( $islenen >= self::SINIR ) {
				$kalan++;
				continue;
			}

			$islenen++;
			$sonuc = self::yenile( $salon['id'], false );

			if ( is_wp_error( $sonuc ) ) {
				/*
				 * Hata MESAJI da saklanıyor: panelde "üretilemedi"
				 * demek yetmiyor, yönetici nedenini (link mi, sunucunun
				 * ağı mı) görmeden düzeltemiyor.
				 */
				$denemeler[ $salon['id'] ] = array( 'imza' => $imza, 'hata' => $sonuc->get_error_message() );
			} else {
				unset( $denemeler[ $salon['id'] ] );
			}
		}

		update_option( self::DENEME_OPTION, $denemeler );

		// Kalan varsa bakım kendini yeniden kuruyor; sıra bitene kadar.
		if ( $kalan ) {
			wp_schedule_single_event( time() + 120, self::BAKIM_HOOK );
		}

		return $islenen;
	}

	/**
	 * Sürüm değişince bakımı bir kez kurar.
	 *
	 * Eklenti güncellendiğinde var olan salonların koordinatı yok:
	 * yöneticiden her salonu tek tek yeniden kaydetmesini istemek,
	 * kimsenin yapmayacağı bir iş. Kuyruğa atılıyor, panel beklemiyor.
	 */
	public static function maybe_schedule_backfill() {
		if ( get_option( 'sahra_harita_surum' ) === SAHRA_VERSION ) {
			return;
		}
		update_option( 'sahra_harita_surum', SAHRA_VERSION );

		if ( ! wp_next_scheduled( self::BAKIM_HOOK ) ) {
			wp_schedule_single_event( time() + 30, self::BAKIM_HOOK );
		}
	}

	/** Salonun son üretim hatası (geçerli adres imzası için). */
	public static function son_hata( $salon ) {
		$denemeler = self::denemeler();
		$kayit     = isset( $denemeler[ $salon['id'] ] ) ? $denemeler[ $salon['id'] ] : null;

		if ( ! $kayit || ! isset( $kayit['imza'] ) || $kayit['imza'] !== self::adres_imzasi( $salon ) ) {
			return '';
		}
		return isset( $kayit['hata'] ) ? (string) $kayit['hata'] : '';
	}

	private static function denemeler() {
		$ham = get_option( self::DENEME_OPTION, array() );
		return is_array( $ham ) ? $ham : array();
	}

	/**
	 * Bir salonun koordinatını ve görselini yeniler.
	 *
	 * @param string $venue_id Salon kimliği.
	 * @param bool   $zorla    true: koordinat duruyor olsa da yeniden çözülür.
	 * @return string|WP_Error Dosya yolu ya da hata.
	 */
	public static function yenile( $venue_id, $zorla = true ) {
		$salon = Sahra_Settings::venue_by_id( $venue_id );
		if ( ! $salon ) {
			return new WP_Error( 'sahra_harita_salon', __( 'Salon bulunamadı.', 'sahra-davetiye' ) );
		}

		if ( $zorla || ! self::koordinat( $salon ) ) {
			$k = self::cozumle( $salon );
			if ( ! $k ) {
				/*
				 * Adres değişip koordinat silinmişse diskteki görsel
				 * ESKİ yeri gösteriyor: yanlış adresi gösteren bir
				 * harita, hiç harita olmamasından kötü.
				 */
				self::temizle( $venue_id );
				return new WP_Error(
					'sahra_harita_cozum',
					__( 'Salonun konumu bulunamadı. Google Maps linkini kontrol edin ya da enlem/boylamı elle yazın.', 'sahra-davetiye' )
				);
			}
			Sahra_Settings::set_venue_coords( $venue_id, $k['lat'], $k['lng'] );
			$salon = Sahra_Settings::venue_by_id( $venue_id );
		}

		return self::uret( $salon );
	}

	/** Koordinatı üreten alanların özeti — değişince yeniden çözülür. */
	public static function adres_imzasi( $salon ) {
		return md5(
			implode(
				'|',
				array(
					isset( $salon['mapUrl'] ) ? $salon['mapUrl'] : '',
					isset( $salon['appleMapUrl'] ) ? $salon['appleMapUrl'] : '',
					isset( $salon['address'] ) ? $salon['address'] : '',
					isset( $salon['district'] ) ? $salon['district'] : '',
					isset( $salon['city'] ) ? $salon['city'] : '',
				)
			)
		);
	}
}
