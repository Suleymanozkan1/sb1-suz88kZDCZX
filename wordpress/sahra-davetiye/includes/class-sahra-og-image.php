<?php
/**
 * Paylaşım kartı (og:image).
 *
 * Davetiye WhatsApp'ta paylaşıldığında çıkan görsel — davetiyenin ilk
 * izlenimi çoğu zaman burası. Next sürümünde `next/og` (satori) çiziyor;
 * burada aynı düzen GD ile üretiliyor.
 *
 * Kart diske yazılıp yeniden kullanılıyor: her paylaşımda yeniden çizmek,
 * paylaşım anında bot'un beklemesi demek ve bazı botlar beklemiyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Og_Image {

	const W = 1200;
	const H = 630;

	/** Kartı üretir ve gönderir. */
	public static function output( $slug ) {
		$davetiye = Sahra_Invitation::get_by_slug( $slug );

		if ( ! $davetiye || ! $davetiye['isActive'] || ! function_exists( 'imagecreatetruecolor' ) ) {
			status_header( 404 );
			exit;
		}

		$onbellek = self::cache_path( $davetiye );

		if ( ! file_exists( $onbellek ) ) {
			$png = self::draw( $davetiye );
			if ( ! $png ) {
				status_header( 500 );
				exit;
			}
			wp_mkdir_p( dirname( $onbellek ) );
			file_put_contents( $onbellek, $png ); // phpcs:ignore
			// Aynı davetiyenin eski kartları artık kimseye lazım değil.
			self::purge( $davetiye['slug'], basename( $onbellek ) );
		}

		header( 'Content-Type: image/png' );
		header( 'Cache-Control: public, max-age=86400' );
		readfile( $onbellek ); // phpcs:ignore
		exit;
	}

	/**
	 * Önbellek yolu içeriğin özetini taşır.
	 *
	 * Çift isimleri ya da temayı değiştirdiğinde kartın da değişmesi
	 * gerekiyor; sabit bir dosya adı eski kartı sonsuza kadar sabitlerdi.
	 */
	/**
	 * Bir davetiyenin disk üstündeki kartlarını siler.
	 *
	 * İki sızıntı vardı. Kart adı içeriğin özetini taşıyor, yani çift her
	 * isim ya da tema değişikliğinde geriye bir dosya bırakıyordu; bir
	 * davetiye için onlarca öksüz kart birikiyordu. Daha ciddisi: davetiye
	 * KALICI SİLİNDİĞİNDE kart yerinde kalıyordu — üstünde çiftin adı,
	 * şehri ve düğün tarihi yazan bir görsel, "her şey silindi" dediğimiz
	 * hâlde sunucuda duruyordu.
	 *
	 * @param string $slug   Davetiyenin adresi.
	 * @param string $koru   Silinmeyecek dosya adı (yeni yazılan kart).
	 */
	public static function purge( $slug, $koru = '' ) {
		$uploads = wp_upload_dir();
		$dizin   = trailingslashit( $uploads['basedir'] ) . 'sahra-davetiye/kart/';
		if ( ! is_dir( $dizin ) ) {
			return;
		}

		foreach ( (array) glob( $dizin . $slug . '-*.png' ) as $dosya ) {
			if ( $koru && basename( $dosya ) === $koru ) {
				continue;
			}
			// Slug ön eki başka bir slug'ın başlangıcı olabilir: "ayse" ile
			// "ayse-mehmet" karışmasın diye ad kalıbı tam eşleşmeli.
			if ( preg_match( '/^' . preg_quote( $slug, '/' ) . '-[0-9a-f]{32}\.png$/', basename( $dosya ) ) ) {
				wp_delete_file( $dosya );
			}
		}
	}

	private static function cache_path( $davetiye ) {
		$imza = md5(
			wp_json_encode(
				array(
					/*
					 * Sürüm de imzada.
					 *
					 * İmza yalnızca davetiye içeriğine bakıyordu; kartın
					 * ÇİZİMİ değişince (yazı tipi, düzen, monogram biçimi)
					 * eski kart sonsuza kadar önbellekte kalıyor ve
					 * güncelleme kimsenin kartına yansımıyordu.
					 */
					SAHRA_VERSION,
					$davetiye['brideName'],
					$davetiye['groomName'],
					$davetiye['conjunction'],
					$davetiye['weddingDate'],
					$davetiye['city'],
					$davetiye['theme'],
					$davetiye['sealType'],
					$davetiye['sealMonogram'],
					$davetiye['coverImage'],
				)
			)
		);

		$uploads = wp_upload_dir();
		return trailingslashit( $uploads['basedir'] ) . 'sahra-davetiye/kart/' . $davetiye['slug'] . '-' . $imza . '.png';
	}

	private static function draw( $davetiye ) {
		$t     = Sahra_Theme::theme( $davetiye['theme'] );
		$muhur = Sahra_Theme::seal_palette( $davetiye['sealType'] );
		$font  = SAHRA_DIR . 'assets/fonts/cormorant-600.ttf';

		if ( ! is_readable( $font ) ) {
			return false;
		}

		$im = imagecreatetruecolor( self::W, self::H );
		imagealphablending( $im, true );

		$fotograf = self::load_cover( $davetiye );

		if ( $fotograf ) {
			self::draw_cover( $im, $fotograf );
			imagedestroy( $fotograf );
			// Fotoğrafın üstüne perde: isimler her fotoğrafta okunmalı.
			self::veil( $im, $t['night'], 0.90, 0.97 );
			$altin = $t['goldLight'];
		} else {
			self::gradient( $im, $t['night'], $muhur['grad3'], 0.4 );
			$altin = $t['gold'];
		}

		// İnce altın çerçeve
		$cerceve = self::color( $im, $altin, 45 );
		imagesetthickness( $im, 1 );
		imagerectangle( $im, 28, 28, self::W - 29, self::H - 29, $cerceve );

		$acik = self::color( $im, $t['onDark'] );
		$vurgu = self::color( $im, $altin );

		$conjunction = $davetiye['conjunction'] ? $davetiye['conjunction'] : '&';
		$isimler     = trim( $davetiye['brideName'] . ' ' . $conjunction . ' ' . $davetiye['groomName'] );

		/*
		 * Baş harflerin arasında da bağlaç var.
		 *
		 * Kart "AM" yazıyordu; davetiyenin mührü "A&M", panel önizlemesi
		 * "A & M". Aynı çiftin monogramı üç yerde üç türlü görünüyordu ve
		 * kartta iki harf yan yana bir kısaltma gibi okunuyordu.
		 * Madalyon dar olduğu için boşluksuz yazılıyor — davetiyedeki
		 * mühürle birebir aynı biçim.
		 */
		$monogram = trim( (string) $davetiye['sealMonogram'] );
		if ( '' === $monogram ) {
			$monogram = mb_substr( (string) $davetiye['brideName'], 0, 1 )
				. $conjunction
				. mb_substr( (string) $davetiye['groomName'], 0, 1 );
		} else {
			$monogram = str_replace( ' ', '', $monogram );
		}

		$alt = array_filter( array( Sahra_Render::format_date( $davetiye['weddingDate'] ), $davetiye['city'] ) );
		$alt = implode( ' · ', $alt );

		// Mühür madalyonu
		$merkez_x = (int) ( self::W / 2 );
		$disk     = self::color( $im, $muhur['grad2'] );
		$kenar    = self::color( $im, $muhur['grad1'] );
		imagefilledellipse( $im, $merkez_x, 193, 96, 96, $disk );
		imagesetthickness( $im, 2 );
		imageellipse( $im, $merkez_x, 193, 96, 96, $kenar );

		// Fildişi gibi açık mühürlerde koyu, bordo gibi koyularda açık monogram.
		$monogram_rengi = self::color(
			$im,
			Sahra_Theme::readable_on( $muhur['grad2'], $muhur['grad1'], $muhur['grad3'] )
		);
		/*
		 * Monogram madalyona ÖLÇÜLEREK sığdırılıyor.
		 *
		 * 96 piksellik daireye iki harf rahat giriyor, bağlaçla üç karaktere
		 * çıkınca harfler kenara değiyor, çift "AYŞE & MEHMET" yazınca da
		 * daireden taşıyordu. Karakter sayısına göre kademeli bir punto
		 * tablosu bunu çözmüyor: harf genişlikleri eşit değil ("İ" ile "M"
		 * aynı yeri tutmuyor). Bu yüzden metin gerçekten ölçülüp sığana
		 * kadar küçültülüyor.
		 */
		$mono_yazi   = Sahra_Render::tr_upper( $monogram );
		$mono_punto  = 34;
		$mono_aralik = 3;
		$mono_alan   = 74;   // 96'lık dairenin içinde güvenli genişlik

		while ( $mono_punto > 8 && self::text_width( $font, $mono_punto, $mono_yazi, $mono_aralik ) > $mono_alan ) {
			$mono_punto -= 2;
			if ( $mono_punto < 22 ) {
				$mono_aralik = 0;   // küçülürken harf aralığı da kapanır
			} elseif ( $mono_punto < 30 ) {
				$mono_aralik = 1;
			}
		}

		self::centered( $im, $font, $mono_punto, $monogram_rengi, 205, $mono_yazi, $mono_aralik );

		self::centered( $im, $font, 20, $vurgu, 290, Sahra_Render::tr_upper( 'Düğünümüze Davetlisiniz' ), 9 );
		self::centered( $im, $font, mb_strlen( $isimler ) > 30 ? 62 : 78, $acik, 400, $isimler, 0 );

		if ( '' !== $alt ) {
			self::centered( $im, $font, 27, $vurgu, 480, $alt, 0 );

			$kural = self::color( $im, $altin, 50 );
			$genislik = self::text_width( $font, 27, $alt, 0 );
			$bosluk   = (int) ( $genislik / 2 ) + 26;
			imagesetthickness( $im, 1 );
			imageline( $im, $merkez_x - $bosluk - 90, 472, $merkez_x - $bosluk, 472, $kural );
			imageline( $im, $merkez_x + $bosluk, 472, $merkez_x + $bosluk + 90, 472, $kural );
		}

		ob_start();
		imagepng( $im, null, 6 );
		$png = ob_get_clean();
		imagedestroy( $im );

		return $png;
	}

	/** Kapak görselini depodan okur. */
	private static function load_cover( $davetiye ) {
		$aday = '';
		foreach ( array( 'coverImage', 'letterImage' ) as $alan ) {
			if ( ! empty( $davetiye[ $alan ] ) ) {
				$aday = $davetiye[ $alan ];
				break;
			}
		}
		if ( '' === $aday && ! empty( $davetiye['galleryImages'][0] ) ) {
			$aday = $davetiye['galleryImages'][0];
		}
		if ( '' === $aday ) {
			return null;
		}

		// Kendi dosya ucumuzsa depodan doğrudan oku; ağ turu gereksiz.
		if ( preg_match( '#/sahra-dosya/([^/?]+)#', $aday, $eslesme ) ) {
			$icerik = Sahra_Storage::get( rawurldecode( $eslesme[1] ) );
			if ( is_wp_error( $icerik ) ) {
				return null;
			}
			$im = @imagecreatefromstring( $icerik['body'] ); // phpcs:ignore
			return $im ? $im : null;
		}

		$yanit = wp_remote_get( $aday, array( 'timeout' => 15 ) );
		if ( is_wp_error( $yanit ) || 200 !== (int) wp_remote_retrieve_response_code( $yanit ) ) {
			return null;
		}
		$im = @imagecreatefromstring( wp_remote_retrieve_body( $yanit ) ); // phpcs:ignore
		return $im ? $im : null;
	}

	/** Kapağı kırparak kaplar (object-fit: cover). */
	private static function draw_cover( $im, $kaynak ) {
		$kg = imagesx( $kaynak );
		$ky = imagesy( $kaynak );
		if ( $kg < 1 || $ky < 1 ) {
			return;
		}

		$olcek = max( self::W / $kg, self::H / $ky );
		$yg    = (int) round( $kg * $olcek );
		$yy    = (int) round( $ky * $olcek );

		imagecopyresampled(
			$im,
			$kaynak,
			(int) ( ( self::W - $yg ) / 2 ),
			(int) ( ( self::H - $yy ) / 2 ),
			0,
			0,
			$yg,
			$yy,
			$kg,
			$ky
		);
	}

	/** Üstten alta koyulaşan perde. */
	private static function veil( $im, $hex, $ust, $alt ) {
		list( $r, $g, $b ) = self::rgb( $hex );
		for ( $y = 0; $y < self::H; $y++ ) {
			$oran  = $ust + ( $alt - $ust ) * ( $y / self::H );
			$alpha = (int) round( 127 * ( 1 - $oran ) );
			$renk  = imagecolorallocatealpha( $im, $r, $g, $b, $alpha );
			imageline( $im, 0, $y, self::W, $y, $renk );
		}
	}

	/** Fotoğrafsız kart için köşegen gece gradyanı. */
	private static function gradient( $im, $gece, $vurgu, $guc ) {
		list( $r1, $g1, $b1 ) = self::rgb( $gece );
		list( $r2, $g2, $b2 ) = self::rgb( $vurgu );

		for ( $y = 0; $y < self::H; $y++ ) {
			// Ortada vurgu, uçlarda gece.
			$t = 1 - abs( ( $y / self::H ) - 0.55 ) * 2;
			$t = max( 0, $t ) * $guc;

			$renk = imagecolorallocate(
				$im,
				(int) round( $r1 + ( $r2 - $r1 ) * $t ),
				(int) round( $g1 + ( $g2 - $g1 ) * $t ),
				(int) round( $b1 + ( $b2 - $b1 ) * $t )
			);
			imageline( $im, 0, $y, self::W, $y, $renk );
		}
	}

	private static function rgb( $hex ) {
		$h = ltrim( (string) $hex, '#' );
		if ( 3 === strlen( $h ) ) {
			$h = $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
		}
		$n = hexdec( $h );
		return array( ( $n >> 16 ) & 255, ( $n >> 8 ) & 255, $n & 255 );
	}

	private static function color( $im, $hex, $opaklik = 100 ) {
		list( $r, $g, $b ) = self::rgb( $hex );
		$alpha = (int) round( 127 * ( 1 - ( $opaklik / 100 ) ) );
		return imagecolorallocatealpha( $im, $r, $g, $b, $alpha );
	}

	/**
	 * Harf aralıklı, ortalanmış metin.
	 *
	 * GD'de harf aralığı (letter-spacing) yok; etiket satırı aralıksız
	 * yazıldığında Next sürümündeki karakterinden tamamen uzaklaşıyordu.
	 * Bu yüzden aralıklı metin harf harf yerleştiriliyor.
	 */
	private static function centered( $im, $font, $boyut, $renk, $y, $metin, $aralik ) {
		$genislik = self::text_width( $font, $boyut, $metin, $aralik );
		$x        = (int) ( ( self::W - $genislik ) / 2 );

		if ( $aralik <= 0 ) {
			imagettftext( $im, $boyut, 0, $x, $y, $renk, $font, $metin );
			return;
		}

		$harfler = preg_split( '//u', $metin, -1, PREG_SPLIT_NO_EMPTY );
		foreach ( $harfler as $harf ) {
			imagettftext( $im, $boyut, 0, $x, $y, $renk, $font, $harf );
			$x += self::glyph_width( $font, $boyut, $harf ) + $aralik;
		}
	}

	private static function text_width( $font, $boyut, $metin, $aralik ) {
		if ( $aralik <= 0 ) {
			$kutu = imagettfbbox( $boyut, 0, $font, $metin );
			return abs( $kutu[2] - $kutu[0] );
		}

		$harfler = preg_split( '//u', $metin, -1, PREG_SPLIT_NO_EMPTY );
		$toplam  = 0;
		foreach ( $harfler as $harf ) {
			$toplam += self::glyph_width( $font, $boyut, $harf ) + $aralik;
		}
		return max( 0, $toplam - $aralik );
	}

	private static function glyph_width( $font, $boyut, $harf ) {
		$kutu = imagettfbbox( $boyut, 0, $font, $harf );
		$g    = abs( $kutu[2] - $kutu[0] );
		// Boşluğun kutusu sıfır genişlikte döner; ölçüyü elle veriyoruz.
		return ' ' === $harf ? (int) round( $boyut * 0.32 ) : $g;
	}
}
