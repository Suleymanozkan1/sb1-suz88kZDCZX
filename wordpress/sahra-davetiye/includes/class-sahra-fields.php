<?php
/**
 * Davetiye alan şeması — tek kaynak.
 *
 * Next.js sürümünde bu şema `src/lib/types.ts` + `src/lib/defaults.ts`
 * ikilisiydi. İki sürümün alanları birebir aynı olmak zorunda; burada
 * dağılırsa iki site sessizce ayrışır. Bu yüzden alanlar tek yerde,
 * tipleriyle birlikte tanımlı ve hem kaydetme (temizleme) hem çizim
 * tarafı buradan okuyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Fields {

	/** Mekân alanları — davetiyede DEĞİL, ortak ayarda durur. */
	const VENUE_KEYS = array( 'venueName', 'address', 'district', 'city', 'mapUrl' );

	/**
	 * Alanlar: anahtar => array( tip, varsayılan ).
	 *
	 * Tipler: text, textarea, html_off (etiket kabul etmeyen düz metin),
	 * bool, int, url, list (dizi), date, time.
	 */
	public static function schema() {
		return array(
			'brideName'              => array( 'text', '' ),
			'groomName'              => array( 'text', '' ),
			'brideSurname'           => array( 'text', '' ),
			'groomSurname'           => array( 'text', '' ),
			'conjunction'            => array( 'text', '&' ),

			'weddingDate'            => array( 'date', '' ),
			'weddingTime'            => array( 'time', '16:00' ),
			'weddingEndTime'         => array( 'time', '23:00' ),

			'invitationText'         => array( 'textarea', '' ),

			'sealType'               => array( 'text', 'gold-wax' ),
			'sealMonogram'           => array( 'text', '' ),
			'sealImage'              => array( 'url', '' ),
			'invitationDesign'       => array( 'text', 'ottoman' ),
			'letterImage'            => array( 'url', '' ),

			'coverImage'             => array( 'url', '' ),
			'galleryImages'          => array( 'list', array() ),
			'gallerySectionTitle'    => array( 'text', '' ),
			'gallerySectionSubtitle' => array( 'text', '' ),

			// Bölüm başlıkları — boş bırakılırsa varsayılan metin kullanılır.
			'detailsSectionTitle'    => array( 'text', '' ),
			'detailsSectionSubtitle' => array( 'text', '' ),
			'programSectionTitle'    => array( 'text', '' ),
			'programSectionSubtitle' => array( 'text', '' ),
			'locationSectionTitle'   => array( 'text', '' ),
			'locationSectionSubtitle' => array( 'text', '' ),
			'faqSectionTitle'        => array( 'text', '' ),
			'faqSectionSubtitle'     => array( 'text', '' ),
			'rsvpSectionTitle'       => array( 'text', '' ),
			'rsvpSectionSubtitle'    => array( 'text', '' ),
			'contactSectionTitle'    => array( 'text', '' ),

			'giftEnabled'            => array( 'bool', false ),
			'giftTitle'              => array( 'text', '' ),
			'giftNote'               => array( 'textarea', '' ),
			'giftAccountName'        => array( 'text', '' ),
			'giftIban'               => array( 'text', '' ),
			'giftBankName'           => array( 'text', '' ),
			'giftRegistryUrl'        => array( 'url', '' ),

			'wishesEnabled'          => array( 'bool', true ),
			'wishesTitle'            => array( 'text', '' ),
			'wishesSubtitle'         => array( 'text', '' ),

			'soundEnabled'           => array( 'bool', true ),
			'soundVolume'            => array( 'int', 40 ),
			'backgroundMusicUrl'     => array( 'url', '' ),
			'sealBreakSound'         => array( 'url', '' ),
			'envelopeOpenSound'      => array( 'url', '' ),

			'storySectionTitle'      => array( 'text', '' ),
			'storySectionSubtitle'   => array( 'text', '' ),
			'storyItems'             => array( 'list', array() ),
			'programItems'           => array( 'list', array() ),
			'faqItems'               => array( 'list', array() ),
			'socialLinks'            => array( 'list', array() ),
			'hashtag'                => array( 'text', '' ),

			'rsvpDeadline'           => array( 'date', '' ),

			'theme'                  => array( 'text', 'cream-gold' ),
		);
	}

	/** Seçenek listeleri — sihirbazdaki açılır kutular. */
	public static function seal_options() {
		return array(
			'gold-wax'      => 'Gold Balmumu',
			'burgundy-wax'  => 'Bordo Balmumu',
			'emerald-wax'   => 'Zümrüt Balmumu',
			'bronze-wax'    => 'Bronz Balmumu',
			'silver-wax'    => 'Gümüş Balmumu',
			'navy-wax'      => 'Lacivert Balmumu',
			'rose-wax'      => 'Gül Kurusu Balmumu',
			'ivory-wax'     => 'Fildişi Balmumu',
			'ottoman'       => 'Osmanlı Tuğrası',
		);
	}

	public static function design_options() {
		return array(
			'ottoman' => 'Osmanlı',
			'classic' => 'Klasik',
			'minimal' => 'Minimal',
			'arch'    => 'Kemerli',
			'vellum'  => 'Vellum',
		);
	}

	public static function theme_options() {
		return array(
			'cream-gold'      => 'Krem & Gold',
			'ottoman-premium' => 'Osmanlı Premium',
			'minimal-white'   => 'Minimal Beyaz',
			'beige-gold'      => 'Bej & Gold',
			'dark-premium'    => 'Koyu Premium',
		);
	}

	/** Bağlaç seçenekleri, örnekleriyle — Next sürümündeki kartların aynısı. */
	public static function conjunction_options() {
		return array(
			'&'   => 'Ahmet & Ayşe',
			'ile' => 'Ahmet ile Ayşe',
			've'  => 'Ahmet ve Ayşe',
			'×'   => 'Ahmet × Ayşe',
		);
	}

	/** Hazır davet metinleri. */
	public static function ready_texts() {
		return array(
			'Klasik'      => 'Bu mutlu günümüzde sizleri de aramızda görmekten büyük mutluluk duyarız.',
			'Zarif'       => 'Hayatımızın en özel gününde, sevdiklerimizle birlikte olmak dileğiyle sizleri aramızda görmekten onur duyarız.',
			'Samimi'      => 'Bir ömür boyu sürecek yolculuğumuzun ilk adımını atarken, siz değerli misafirlerimizi de yanımızda görmek isteriz.',
			'Geleneksel'  => 'Evliliğimizin ilk gününde bizimle olmanız, mutluluğumuzu kat kat artıracaktır. Teşrifleriniz bizi onurlandıracaktır.',
		);
	}

	/** "Varsayılanları yükle" düğmelerinin içeriği. */
	public static function default_program() {
		return array(
			array( 'time' => '15:00', 'title' => 'Kapı Açılışı', 'desc' => 'Konukların karşılanması ve yerleşimi' ),
			array( 'time' => '16:00', 'title' => 'Nikah Töreni', 'desc' => 'Resmi nikah ve yüzük takma' ),
			array( 'time' => '16:30', 'title' => 'Kokteyl & Fotoğraf', 'desc' => 'Kadeh kaldırma ve anı fotoğrafları' ),
			array( 'time' => '18:00', 'title' => 'Akşam Yemeği', 'desc' => 'Özel menü ile birlikte sofra zevki' ),
			array( 'time' => '20:00', 'title' => 'Düğün Pastası', 'desc' => 'İlk dilim kesme ve kutlama' ),
			array( 'time' => '20:30', 'title' => 'Müzik & Eğlence', 'desc' => 'Canlı müzik ve dans keyfi' ),
		);
	}

	public static function default_faq() {
		return array(
			array( 'q' => 'Çocuklar davetli mi?', 'a' => 'Düğünümüz yetişkinlere özel bir kutlama olarak planlanmıştır. Küçük misafirlerimizin olmamasını rica ediyoruz.' ),
			array( 'q' => 'Otopark mevcut mu?', 'a' => 'Mekan bünyesinde kapalı otopark bulunmaktadır. Ücretsiz olarak hizmet vermektedir.' ),
			array( 'q' => 'Konaklama önerisi var mı?', 'a' => 'Mekanın çevresinde birçok butik otel mevcuttur. Özel fiyatlar için bizimle iletişime geçebilirsiniz.' ),
			array( 'q' => 'Düğün programı ne zaman başlıyor?', 'a' => 'Kapılar 30 dk önce açılacak, tören belirtilen saatte başlayacaktır.' ),
		);
	}

	public static function default_story() {
		return array(
			array( 'year' => '2022', 'title' => 'İlk Tanışma', 'desc' => 'Ortak bir arkadaşın davetinde gözlerimiz ilk kez buluştu.' ),
			array( 'year' => '2023', 'title' => 'Söz', 'desc' => 'Ailelerimizin huzurunda söz verdik.' ),
			array( 'year' => '2024', 'title' => 'Nişan', 'desc' => 'Nişan törenimizde halkalarımızı taktık.' ),
			array( 'year' => '2026', 'title' => 'Düğün', 'desc' => 'Ve şimdi, en güzel adımı birlikte atıyoruz.' ),
		);
	}

	/** Eklentiyle gelen hazır ses parçaları. */
	public static function music_tracks() {
		return array(
			'piyano-sakin'   => 'Piyano — Sakin',
			'arp-zarif'      => 'Arp — Zarif',
			'yayli-duygusal' => 'Yaylı — Duygusal',
			'anadolu-ney'    => 'Anadolu — Ney',
		);
	}

	public static function seal_sounds() {
		return array( 'muhur-kirilma' => 'Mühür Kırılma' );
	}

	public static function envelope_sounds() {
		return array( 'zarf-acilma' => 'Zarf Açılma' );
	}

	/** Boş davetiye — şemadaki varsayılanlar. */
	public static function defaults() {
		$out = array();
		foreach ( self::schema() as $key => $spec ) {
			$out[ $key ] = $spec[1];
		}
		return $out;
	}

	/**
	 * Gelen ham veriyi şemaya göre temizler.
	 *
	 * Bilinmeyen anahtarlar DÜŞÜRÜLÜR: gövdeye fazladan alan koyup meta'yı
	 * şişirmek ya da mekân alanını geri sızdırmak mümkün olmasın.
	 */
	public static function sanitize( $input, $current = array() ) {
		$schema = self::schema();
		$out    = array_merge( self::defaults(), is_array( $current ) ? $current : array() );

		foreach ( $schema as $key => $spec ) {
			if ( ! array_key_exists( $key, (array) $input ) ) {
				continue;
			}
			$out[ $key ] = self::sanitize_value( $input[ $key ], $spec[0], $spec[1] );
		}

		// Mekân davetiyede tutulmaz; ortak ayardan gelir.
		foreach ( self::VENUE_KEYS as $key ) {
			unset( $out[ $key ] );
		}

		return $out;
	}

	private static function sanitize_value( $value, $type, $fallback ) {
		switch ( $type ) {
			case 'bool':
				return filter_var( $value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ) ?? (bool) $fallback;

			case 'int':
				return max( 0, min( 100, (int) $value ) );

			case 'url':
				return self::safe_url( (string) $value );

			case 'textarea':
				return sanitize_textarea_field( (string) $value );

			case 'date':
				$v = sanitize_text_field( (string) $value );
				return preg_match( '/^\d{4}-\d{2}-\d{2}$/', $v ) ? $v : '';

			case 'time':
				$v = sanitize_text_field( (string) $value );
				return preg_match( '/^\d{2}:\d{2}$/', $v ) ? $v : '';

			case 'list':
				return self::sanitize_list( $value );

			case 'text':
			default:
				return sanitize_text_field( (string) $value );
		}
	}

	/**
	 * Dizi alanları (program, SSS, hikaye, galeri, sosyal).
	 *
	 * Derinlik bir kademe: her öğe ya düz metin ya da düz metinlerden oluşan
	 * bir nesne. İç içe yapıya izin verilmiyor ki meta sınırsız büyümesin.
	 */
	private static function sanitize_list( $value ) {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$out = array();
		foreach ( array_slice( $value, 0, 200 ) as $item ) {
			if ( is_string( $item ) ) {
				$temiz = self::safe_url( $item );
				if ( '' === $temiz ) {
					$temiz = sanitize_text_field( $item );
				}
				if ( '' !== $temiz ) {
					$out[] = $temiz;
				}
				continue;
			}

			if ( is_array( $item ) ) {
				$satir = array();
				foreach ( $item as $k => $v ) {
					if ( is_scalar( $v ) ) {
						$anahtar = sanitize_key( $k );
						$satir[ $anahtar ] = 'href' === $anahtar
							? self::safe_url( (string) $v )
							: sanitize_text_field( (string) $v );
					}
				}
				if ( $satir ) {
					$out[] = $satir;
				}
			}
		}
		return $out;
	}

	/**
	 * Yalnızca güvenli şemalar.
	 *
	 * Next sürümünde `lib/safe-url.ts` aynı işi yapıyor: javascript: ve data:
	 * adresleri kullanıcı girdisinden geldiğinde bağlantıya dönüşmemeli.
	 * Göreli yollar (/wp-content/... gibi) korunur.
	 */
	public static function safe_url( $value ) {
		$value = trim( (string) $value );
		if ( '' === $value ) {
			return '';
		}
		if ( 0 === strpos( $value, '/' ) && 0 !== strpos( $value, '//' ) ) {
			return esc_url_raw( $value, array( 'http', 'https' ) );
		}
		return esc_url_raw( $value, array( 'http', 'https', 'mailto', 'tel' ) );
	}
}
