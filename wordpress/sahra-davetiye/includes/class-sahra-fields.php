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
	/*
	 * İsimleri birleştiren bağlaç. Seçenek olarak duruyordu ("ile",
	 * "ve", "×"); her biri başlığın ritmini değiştiriyor ve kart, sayfa,
	 * önizleme üçünde ayrı ayrı hesaplanıyordu. Tek bir işaret kaldı.
	 */
	const CONJUNCTION = '&';

	const VENUE_KEYS = array( 'venueName', 'address', 'district', 'city', 'mapUrl', 'appleMapUrl', 'venueDirections', 'venueInstagram', 'venueInstagramLabel', 'venueChildrenNote' );

	/**
	 * Alanlar: anahtar => array( tip, varsayılan ).
	 *
	 * Tipler: text, textarea, html_off (etiket kabul etmeyen düz metin),
	 * bool, int, url, list (tek kademeli dizi), menu (iki kademeli),
	 * date, time.
	 */
	public static function schema() {
		return array(
			'brideName'              => array( 'text', '' ),
			'groomName'              => array( 'text', '' ),
			'brideSurname'           => array( 'text', '' ),
			'groomSurname'           => array( 'text', '' ),

			'weddingDate'            => array( 'date', '' ),
			// Oturum: saatleri BU belirler, iki alan ondan türer.
			'session'                => array( 'text', 'aksam' ),
			'weddingTime'            => array( 'time', '19:00' ),
			'weddingEndTime'         => array( 'time', '23:00' ),

			'venueId'                => array( 'text', '' ),

			'invitationText'         => array( 'textarea', '' ),

			'sealType'               => array( 'text', 'gold-wax' ),
			/*
			 * Monogram en fazla 8 karakter.
			 *
			 * Sınırsızken "AYŞE & MEHMET" gibi bir giriş hem mührün 110
			 * birimlik çemberinden (141 birim) hem de paylaşım kartının 96
			 * piksellik madalyonundan taşıyordu; küçülterek sığdırmak da
			 * 8 puntoluk okunmaz bir yazı demekti. Monogram kısa olmalı.
			 */
			'sealMonogram'           => array( 'monogram', '' ),
			'invitationDesign'       => array( 'text', 'ottoman' ),

			'coverImage'             => array( 'url', '' ),
			'galleryImages'          => array( 'list', array() ),

			// Bölüm başlıkları — boş bırakılırsa varsayılan metin kullanılır.

			/*
			 * giftEnabled / wishesEnabled aynı zamanda o bölümlerin
			 * "sayfada görünsün" anahtarıdır — diğer bölümlerdeki show*
			 * alanlarının karşılığı. Yeniden adlandırılmadılar; kayıtlı
			 * davetiyelerin bu iki alanı zaten bu anlamda dolu.
			 */
			'giftEnabled'            => array( 'bool', false ),
			'giftNote'               => array( 'textarea', '' ),
			'giftAccountName'        => array( 'text', '' ),
			'giftIban'               => array( 'text', '' ),
			'giftBankName'           => array( 'text', '' ),

			'wishesEnabled'          => array( 'bool', true ),

			'soundEnabled'           => array( 'bool', true ),
			'soundVolume'            => array( 'int', 40 ),
			'backgroundMusicUrl'     => array( 'url', '' ),

			'storyItems'             => array( 'list', array() ),
			/*
			 * Program artık ELLE girilmiyor; oturum tipinden üretiliyor
			 * (bkz. program_for). Tek soru nikahın olup olmadığı: nikah
			 * yoksa o satır hiçbir yerde görünmez.
			 */
			'nikahVar'               => array( 'bool', true ),
			'socialLinks'            => array( 'list', array() ),
			'hashtag'                => array( 'text', '' ),
			'showSocial'             => array( 'bool', true ),

			'rsvpDeadline'           => array( 'date', '' ),

			// ── Menü ──────────────────────────────────────────────────
			'menuId'                 => array( 'text', '' ),
			// 'list' DEĞİL: menü grupları iki kademeli (başlık + öğe dizisi)
			// ve genel liste temizleyicisi ikinci kademeyi düşürüyordu —
			// menü kaydedildiğinde başlıklar kalıyor, yemekler siliniyordu.
			'menuGroups'             => array( 'menu', array() ),

			// ── Ailelerimiz ───────────────────────────────────────────
			/*
			 * Çok satırlı: form bunları textarea olarak soruyor, yer tutucusu
			 * iki satır gösteriyor ve şablon `nl2br()` ile çiziyor. 'text'
			 * olarak durduğu sürece çiftin yazdığı ikinci satır sessizce
			 * birinciye yapışıyordu.
			 */
			'brideFamilyText'        => array( 'textarea', '' ),
			'groomFamilyText'        => array( 'textarea', '' ),

			// ── Çocuk durumu ──────────────────────────────────────────
			/*
			 * Varsayılan AÇIK. Salon çocuklu düğüne göre kurulu (oyun
			 * alanı, palyaço); kapalı başlamak çoğu çifte yanlış cevabı
			 * varsayılan yapıyordu. İstemeyen tiki kaldırır.
			 */
			'childrenWelcome'        => array( 'bool', true ),

			// ── Bölüm görünürlükleri ──────────────────────────────────
			'showLetter'             => array( 'bool', true ),
			'showStory'              => array( 'bool', true ),
			'showDetails'            => array( 'bool', true ),
			'showProgram'            => array( 'bool', true ),
			'showGallery'            => array( 'bool', true ),
			'showLocation'           => array( 'bool', true ),
			'showMenu'               => array( 'bool', true ),
			'showFamily'             => array( 'bool', false ),
			'showChildren'           => array( 'bool', true ),
			'showRsvp'               => array( 'bool', true ),
			'showContact'            => array( 'bool', true ),

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
	/**
	 * Günün programı — oturum tipinden ÜRETİLİR, elle girilmez.
	 *
	 * Saatler salonun işleyişi; çiftin yazacağı bir şey değil. Elle
	 * girilirken kapı saatiyle davetiyede yazan saat birbirinden
	 * ayrılıyordu. Nikah satırı ise ayrı bir soruya bağlı: nikah
	 * yapılmayan düğünde o saat hiç görünmez.
	 *
	 * @param string $oturum   'gunduz' | 'aksam'.
	 * @param bool   $nikah_var Nikah satırı çizilsin mi.
	 * @return array Her satır: time, title, desc.
	 */
	public static function program_for( $oturum, $nikah_var = true ) {
		$saatler = array(
			'aksam'  => array( 'kapi' => '19:00', 'nikah' => '20:00', 'ikram' => '20:30', 'bitis' => '23:00' ),
			'gunduz' => array( 'kapi' => '13:00', 'nikah' => '14:00', 'ikram' => '14:30', 'bitis' => '17:00' ),
		);
		$s = isset( $saatler[ $oturum ] ) ? $saatler[ $oturum ] : $saatler['aksam'];

		$akis = array(
			array( 'time' => $s['kapi'], 'title' => __( 'Kapı Açılışı', 'sahra-davetiye' ), 'desc' => __( 'Misafirlerin karşılanması', 'sahra-davetiye' ) ),
		);
		if ( $nikah_var ) {
			$akis[] = array( 'time' => $s['nikah'], 'title' => __( 'Nikah', 'sahra-davetiye' ), 'desc' => '' );
		}
		$akis[] = array( 'time' => $s['ikram'], 'title' => __( 'İkramlar ve Yemek Servisi', 'sahra-davetiye' ), 'desc' => '' );
		$akis[] = array( 'time' => $s['bitis'], 'title' => __( 'Bitiş', 'sahra-davetiye' ), 'desc' => __( 'Kapanış', 'sahra-davetiye' ) );

		return $akis;
	}


	public static function default_story() {
		return array(
			array( 'year' => '2022', 'title' => 'İlk Tanışma', 'desc' => 'Ortak bir arkadaşın davetinde gözlerimiz ilk kez buluştu.' ),
			array( 'year' => '2023', 'title' => 'Söz', 'desc' => 'Ailelerimizin huzurunda söz verdik.' ),
			array( 'year' => '2024', 'title' => 'Nişan', 'desc' => 'Nişan törenimizde halkalarımızı taktık.' ),
			array( 'year' => '2026', 'title' => 'Düğün', 'desc' => 'Ve şimdi, en güzel adımı birlikte atıyoruz.' ),
		);
	}

	/**
	 * Kayıtlı ses adresi hâlâ geçerli mi?
	 *
	 * Listeden bir parça çıkarılınca onu seçmiş davetiyelerin adresi
	 * olmayan bir dosyayı gösteriyor ve ses sessizce ölüyor. Kendi
	 * yüklediği ses olanlara dokunulmuyor.
	 *
	 * @param string $url Kayıtlı adres.
	 * @return string Geçerliyse adres, hazır parça artık yoksa ''.
	 */
	public static function music_url( $url ) {
		$url = (string) $url;
		$onek = SAHRA_URL . 'assets/muzik/';
		if ( '' === $url || 0 !== strpos( $url, $onek ) ) {
			return $url;
		}
		$dosya = basename( $url, '.mp3' );
		return array_key_exists( $dosya, self::music_tracks() ) ? $url : '';
	}

	/** Eklentiyle gelen hazır ses parçaları. */
	public static function music_tracks() {
		return array(
			'piyano-sakin'   => 'Piyano — Sakin',
			'arp-zarif'      => 'Arp — Zarif',
			'anadolu-ney'    => 'Anadolu — Ney',
		);
	}



	/* ═══════════════════════════════════════════════ metin yardımcıları ══ */

	/**
	 * Türkçe büyük/küçük harf çiftleri.
	 *
	 * PHP'nin mb_* işlevleri Türkçe'yi bilmiyor: "ışık" → "IŞIK" yerine
	 * "IŞIK" beklenirken "ISIK", "istanbul" → "ISTANBUL" çıkıyor. Doğrusu
	 * i↔İ ve ı↔I. Eşleme elle yapılmak zorunda.
	 */
	const TR_BUYUK = array( 'i' => 'İ', 'ı' => 'I', 'ş' => 'Ş', 'ğ' => 'Ğ', 'ü' => 'Ü', 'ö' => 'Ö', 'ç' => 'Ç' );
	const TR_KUCUK = array( 'İ' => 'i', 'I' => 'ı', 'Ş' => 'ş', 'Ğ' => 'ğ', 'Ü' => 'ü', 'Ö' => 'ö', 'Ç' => 'ç' );

	public static function tr_upper( $metin ) {
		return mb_strtoupper( strtr( (string) $metin, self::TR_BUYUK ), 'UTF-8' );
	}

	public static function tr_lower( $metin ) {
		return mb_strtolower( strtr( (string) $metin, self::TR_KUCUK ), 'UTF-8' );
	}

	/**
	 * Ad yazımını düzeltir: "mehmeT" → "Mehmet", "AYŞE" → "Ayşe".
	 *
	 * Çiftler adlarını her türlü yazıyor; davetiyede adın CAPS LOCK ile
	 * durması ürünü ucuzlatıyor. Kısa çizgi ve kesme işareti sonrası da
	 * yeni sözcük sayılır: "ali-can" → "Ali-Can".
	 */
	public static function tr_title( $metin ) {
		/*
		 * Satır sonları KORUNUYOR: aile alanları iki satırlı ve
		 * davetiyede nl2br ile çiziliyor; bütün boşlukları tek boşluğa
		 * indirmek iki satırı birleştirip alt alta yazılanı yan yana
		 * getiriyordu.
		 */
		$metin = preg_replace( '/[ \t]+/u', ' ', (string) $metin );
		$metin = trim( preg_replace( '/[ \t]*\R[ \t]*/u', "\n", $metin ) );
		if ( '' === $metin ) {
			return '';
		}

		$out    = '';
		$basta  = true;
		$uzunluk = mb_strlen( $metin, 'UTF-8' );

		for ( $i = 0; $i < $uzunluk; $i++ ) {
			$harf = mb_substr( $metin, $i, 1, 'UTF-8' );

			if ( preg_match( '/[\s\-\x{2019}\x{0027}\.]/u', $harf ) ) {
				$out  .= $harf;
				$basta = true;
				continue;
			}

			$out  .= $basta ? self::tr_upper( $harf ) : self::tr_lower( $harf );
			$basta = false;
		}

		/*
		 * Bağlaçlar büyük harfle başlamaz: "Ayşe ve Emrah" doğru,
		 * "Ayşe Ve Emrah" değil. Satır başındaki bağlaca dokunulmuyor.
		 */
		$out = preg_replace_callback(
			'/(?<=[\s\-])(Ve|İle|Ile)(?=[\s\-]|$)/u',
			static function ( $e ) {
				return self::tr_lower( $e[1] );
			},
			$out
		);

		return $out;
	}

	/** Listedeki belirtilen alanlarda yazım onarımı. */
	private static function liste_yazim( $liste, $alanlar ) {
		if ( ! is_array( $liste ) ) {
			return $liste;
		}

		foreach ( $liste as $i => $satir ) {
			if ( ! is_array( $satir ) ) {
				continue;
			}
			foreach ( $alanlar as $alan ) {
				if ( isset( $satir[ $alan ] ) ) {
					$liste[ $i ][ $alan ] = self::tr_fix_case( $satir[ $alan ] );
				}
			}
		}

		return $liste;
	}

	/** Menüde grup başlığı ve satırlar. */
	private static function menu_yazim( $menu ) {
		if ( ! is_array( $menu ) ) {
			return $menu;
		}

		foreach ( $menu as $i => $grup ) {
			if ( ! is_array( $grup ) ) {
				continue;
			}
			if ( isset( $grup['title'] ) ) {
				$menu[ $i ]['title'] = self::tr_fix_case( $grup['title'] );
			}
			if ( isset( $grup['items'] ) && is_array( $grup['items'] ) ) {
				$menu[ $i ]['items'] = array_map( array( __CLASS__, 'tr_fix_case' ), $grup['items'] );
			}
		}

		return $menu;
	}

	/**
	 * Bozuk yazılmış sözcüğü onarır: "şaHin" → "Şahin", "YILMAz" → "Yılmaz".
	 *
	 * Serbest metinde sözcük başlarını büyütmek cümleyi bozuyor ("ve" →
	 * "Ve"), tamamını küçültmek de özel adları siliyor. O yüzden yalnızca
	 * KENDİ İÇİNDE bozuk olan sözcüğe dokunuluyor: ilk harften sonra
	 * büyük harf varsa ve sözcük tamamen büyük değilse düzeltiliyor.
	 *
	 * Tamamı büyük sözcükler kasıtlı sayılır ve korunur — "TEB", "IBAN",
	 * "DJ" gibi kısaltmalar düzeltilecek hata değil.
	 */
	/**
	 * Her alanın yazımını kendi kuralıyla onarır.
	 *
	 * Hem kayıtta hem OKUMADA çağrılıyor. Yalnızca kayıtta çalışırken
	 * güncellemeden önce girilmiş davetiyeler ekranda bozuk kalıyordu:
	 * çift o davetiyeyi bir daha kaydetmedikçe "şaHin" öyle duruyor.
	 * Tek liste, iki yol — hangisinden geçtiğinin önemi yok.
	 *
	 * @param array $veri Alanlar.
	 * @return array Onarılmış alanlar.
	 */
	public static function yazim_onar( $veri ) {
		// Ad alanlarında her sözcüğün başı büyük.
		foreach ( array( 'brideName', 'groomName', 'brideSurname', 'groomSurname', 'brideFamilyText', 'groomFamilyText', 'giftAccountName' ) as $key ) {
			if ( isset( $veri[ $key ] ) ) {
				$veri[ $key ] = self::tr_title( $veri[ $key ] );
			}
		}

		/*
		 * Serbest metinde yalnızca BOZUK sözcük onarılıyor.
		 *
		 * Davetiyeyi müşteri dolduruyor ve caps lock yarı yolda kalıyor:
		 * "şaHin", "YILMAz", "HAYATımızın". Sözcük başlarını büyütmek
		 * cümleyi bozardı ("ve" → "Ve"), hepsini küçültmek özel adları
		 * silerdi; tamamı büyük yazılanlar da kasıtlı kısaltma sayılıp
		 * korunuyor.
		 */
		foreach ( array( 'invitationText', 'giftNote', 'giftBankName' ) as $key ) {
			if ( isset( $veri[ $key ] ) ) {
				$veri[ $key ] = self::tr_fix_case( $veri[ $key ] );
			}
		}

		// Listelerde de aynı onarım: hikâye, program, menü ve hesap adları.
		if ( isset( $veri['storyItems'] ) ) {
			$veri['storyItems'] = self::liste_yazim( $veri['storyItems'], array( 'title', 'desc' ) );
		}
		if ( isset( $veri['socialLinks'] ) ) {
			$veri['socialLinks'] = self::liste_yazim( $veri['socialLinks'], array( 'name' ) );
		}
		if ( isset( $veri['menuGroups'] ) ) {
			$veri['menuGroups'] = self::menu_yazim( $veri['menuGroups'] );
		}

		return $veri;
	}

	public static function tr_fix_case( $metin ) {
		$metin = (string) $metin;
		if ( '' === trim( $metin ) ) {
			return '';
		}

		return preg_replace_callback(
			'/\p{L}[\p{L}\x{2019}\x{0027}]*/u',
			static function ( $e ) {
				$sozcuk = $e[0];

				if ( mb_strlen( $sozcuk, 'UTF-8' ) < 2 ) {
					return $sozcuk;
				}

				// Tamamı büyük: kasıtlı kısaltma.
				if ( self::tr_upper( $sozcuk ) === $sozcuk ) {
					return $sozcuk;
				}

				$kuyruk = mb_substr( $sozcuk, 1, null, 'UTF-8' );
				if ( self::tr_lower( $kuyruk ) === $kuyruk ) {
					return $sozcuk; // İçi zaten düzgün.
				}

				return self::tr_upper( mb_substr( $sozcuk, 0, 1, 'UTF-8' ) ) . self::tr_lower( $kuyruk );
			},
			$metin
		);
	}

	/** Türkçe ay adları — bağlantı adresinde kullanılır (ASCII). */
	const AY_SLUG = array(
		1 => 'ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
		'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik',
	);

	/**
	 * Bağlantı adresi: 31-aralik-2026-zehra-ahmet
	 *
	 * Tarih önde çünkü işletme yılda yüzlerce davetiye açıyor; adrese
	 * bakınca hangi güne ait olduğu görünmeli. Gelin adı damattan önce.
	 * Tarih yoksa yalnızca adlar kullanılır.
	 */
	public static function build_slug( $bride, $groom, $date = '' ) {
		$parcalar = array();

		if ( preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', (string) $date, $m ) ) {
			$ay = (int) $m[2];
			if ( isset( self::AY_SLUG[ $ay ] ) ) {
				$parcalar[] = (int) $m[3];
				$parcalar[] = self::AY_SLUG[ $ay ];
				$parcalar[] = $m[1];
			}
		}

		foreach ( array( $bride, $groom ) as $ad ) {
			$ad = sanitize_title( self::tr_lower( $ad ) );
			if ( '' !== $ad ) {
				$parcalar[] = $ad;
			}
		}

		return sanitize_title( implode( '-', $parcalar ) );
	}

	/* ═════════════════════════════════════════════════════════ oturumlar ══ */

	/**
	 * Düğün oturumları.
	 *
	 * Salon yalnızca iki oturum çalışıyor; saati serbest bırakmak çifte
	 * gerçek olmayan bir seçenek sunuyordu (11:00 yazan bir davetiye
	 * salonda karşılığı olmayan bir söz). Saat artık oturumdan türer.
	 */
	public static function sessions() {
		return array(
			'gunduz' => array( 'label' => 'Gündüz Düğünü', 'start' => '13:00', 'end' => '17:00' ),
			'aksam'  => array( 'label' => 'Akşam Düğünü', 'start' => '19:00', 'end' => '23:00' ),
		);
	}

	public static function session( $id ) {
		$hepsi = self::sessions();
		return isset( $hepsi[ $id ] ) ? $hepsi[ $id ] : $hepsi['aksam'];
	}

	/* ════════════════════════════════════════════════════════════ menüler ══ */

	/**
	 * Menü metnini gruplara çevirir.
	 *
	 * Bir satır = bir grup: "ORDÖVR TABAĞI | Amerikan salatası | Kısır".
	 * Program ve hikâye alanlarındaki dikey çubuk düzeniyle aynı; çift
	 * yeni bir söz dizimi öğrenmiyor.
	 */
	public static function parse_menu( $metin ) {
		if ( is_array( $metin ) ) {
			// Zaten ayrıştırılmış geliyorsa yalnızca temizlenir.
			$out = array();
			foreach ( array_slice( $metin, 0, 40 ) as $grup ) {
				if ( ! is_array( $grup ) ) {
					continue;
				}
				$baslik = sanitize_text_field( (string) ( $grup['title'] ?? '' ) );
				$satir  = array();
				foreach ( array_slice( (array) ( $grup['items'] ?? array() ), 0, 40 ) as $oge ) {
					$oge = sanitize_text_field( (string) $oge );
					if ( '' !== $oge ) {
						$satir[] = $oge;
					}
				}
				if ( '' !== $baslik || $satir ) {
					$out[] = array( 'title' => $baslik, 'items' => $satir );
				}
			}
			return $out;
		}

		$out = array();
		foreach ( preg_split( '/\r\n|\r|\n/', (string) $metin ) as $satir ) {
			$satir = trim( $satir );
			if ( '' === $satir ) {
				continue;
			}
			$parcalar = array_map( 'trim', explode( '|', $satir ) );
			$baslik   = sanitize_text_field( array_shift( $parcalar ) );
			$ogeler   = array();
			foreach ( $parcalar as $oge ) {
				$oge = sanitize_text_field( $oge );
				if ( '' !== $oge ) {
					$ogeler[] = $oge;
				}
			}
			if ( '' !== $baslik || $ogeler ) {
				$out[] = array( 'title' => $baslik, 'items' => $ogeler );
			}
			if ( count( $out ) >= 40 ) {
				break;
			}
		}
		return $out;
	}

	/** Grupları düzenlenebilir metne geri çevirir. */
	public static function menu_to_text( $groups ) {
		$satirlar = array();
		foreach ( (array) $groups as $grup ) {
			if ( ! is_array( $grup ) ) {
				continue;
			}
			$parcalar = array( (string) ( $grup['title'] ?? '' ) );
			foreach ( (array) ( $grup['items'] ?? array() ) as $oge ) {
				$parcalar[] = (string) $oge;
			}
			$satirlar[] = implode( ' | ', $parcalar );
		}
		return implode( "\n", $satirlar );
	}

	/**
	 * Eklentiyle gelen hazır menüler.
	 *
	 * İşletmenin basılı menü kartından birebir alındı; fiyat YOK. Yönetici
	 * bunları panelden değiştirebilir, silebilir, yenisini ekleyebilir.
	 */
	public static function default_menus() {
		$ordovr = 'ORDÖVR TABAĞI | Amerikan salatası | 2 adet yaprak sarması | Zerdeçallı arpa şehriye | Kısır | Haydari | Havuç tarator | Pembe sultan';
		$serpme = 'SERPMELER | Soslu ve sossuz patates cipsi tabağı | Kurudite bardağı';
		$icecek = 'İÇECEKLER | Litrelik soft içecek ve su';
		$tatli  = 'TATLI | Dondurmalı pasta veya 2 dilim baklava';
		$salata = 'SALATA | Mevsim salata';
		$meyve  = 'MEYVE | Mevsim meyveleri';

		$ham = array(
			'Kokteyl Menü' => array(
				'ANA YEMEK | Su böreği | Amerikan salatası | Patates salatası | 2 adet yaprak sarması | Kısır | Pembe sultan | Havuç tarator',
				'SERPMELER | Soslu ve sossuz patates cipsi tabağı | Kurudite bardağı',
				'TATLI | Dondurmalı pasta',
				$icecek,
			),
			'Menü 1' => array(
				'ANA YEMEK | Tavuk kavurma / Şinitzel (roll ekmek eşliğinde) | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
				$tatli,
				'SERPMELER | Soslu ve sossuz patates cipsi tabağı | Kurudite bardağı',
				$icecek,
			),
			'Menü 2' => array(
				'ANA YEMEK | Et kavurma (roll ekmek eşliğinde) | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
				$tatli,
				$serpme,
				$icecek,
			),
			'Menü 3' => array(
				$ordovr,
				'ANA YEMEK | Et kavurma (roll ekmek eşliğinde) | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
				$tatli,
				'SERPMELER | Soslu veya sossuz cips tabağı | Kurudite bardağı',
				$icecek,
			),
			'Menü 4' => array(
				$ordovr,
				'ARA SICAK | Su böreği',
				'ANA YEMEK | Et kavurma | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte',
				$salata,
				$tatli,
				$serpme,
				$icecek,
			),
			'Menü 5' => array(
				$ordovr,
				'ARA SICAK | Su böreği / Paçanga böreği | Kalem böreği',
				'ANA YEMEK | Dana rosto veya dana bonfile | Tereyağlı pirinç pilavı | Patates püresi | İçli köfte | Roll ekmek',
				$salata,
				$tatli,
				$meyve,
				$serpme,
				'İÇECEKLER | Litrelik sınırsız soft içecek ve su',
			),
			'Menü 6' => array(
				$ordovr,
				'ARA SICAK | Su böreği / Paçanga böreği | Kalem böreği',
				'ANA YEMEK | Fırın biftek | Tereyağlı pirinç pilavı | Kekik sos eşliğinde sebze türlüsü | Patates püresi | İçli köfte | Roll ekmek',
				$salata,
				$tatli,
				$meyve,
				$serpme,
				'İÇECEKLER | Litrelik sınırsız soft içecek ve su',
			),
			'Menü 7' => array(
				$ordovr,
				'ARA SICAK | Su böreği / Paçanga böreği | Kalem böreği',
				'ANA YEMEK | Fırın kuzu tandır | Tereyağlı pirinç pilavı | Kekik sos eşliğinde sebze türlüsü | Patates püresi | İçli köfte | Roll ekmek',
				$salata,
				$tatli,
				$meyve,
				$serpme,
				'İÇECEKLER | Litrelik sınırsız soft içecek ve su',
			),
		);

		$out = array();
		$i   = 1;
		foreach ( $ham as $ad => $satirlar ) {
			$out[] = array(
				'id'     => 'menu-' . $i,
				'name'   => $ad,
				'groups' => self::parse_menu( implode( "\n", $satirlar ) ),
			);
			$i++;
		}
		return $out;
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

			$temiz = self::sanitize_value( $input[ $key ], $spec[0], $spec[1] );

			/*
			 * Okunamayan bir tarih, DURAN tarihi silmesin.
			 *
			 * Yıla yanlışlıkla fazladan bir hane girilince ("20266-09-19")
			 * kalıp tutmuyor ve boş dönüyordu; sonuç, çiftin girdiği düğün
			 * tarihinin sessizce kaybolmasıydı. Boş göndermek hâlâ
			 * "tarihi kaldır" demek — yalnızca DOLU ama geçersiz olan
			 * yok sayılıyor.
			 */
			if ( 'date' === $spec[0] && '' === $temiz && '' !== trim( (string) $input[ $key ] ) ) {
				continue;
			}

			$out[ $key ] = $temiz;
		}

		// Mekân davetiyede tutulmaz; seçilen salondan gelir.
		foreach ( self::VENUE_KEYS as $key ) {
			unset( $out[ $key ] );
		}

		$out = self::yazim_onar( $out );

		/*
		 * Saat oturumdan TÜRETİLİR, ayrıca sorulmaz. Salon iki oturum
		 * çalışıyor; serbest saat, karşılığı olmayan bir söz veriyordu.
		 */
		$oturum                 = self::session( $out['session'] );
		$out['session']         = isset( self::sessions()[ $out['session'] ] ) ? $out['session'] : 'aksam';
		$out['weddingTime']     = $oturum['start'];
		$out['weddingEndTime']  = $oturum['end'];

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

			case 'monogram':
				return mb_substr( sanitize_text_field( (string) $value ), 0, 8 );

			case 'date':
				$v = sanitize_text_field( (string) $value );
				return preg_match( '/^\d{4}-\d{2}-\d{2}$/', $v ) ? $v : '';

			case 'time':
				$v = sanitize_text_field( (string) $value );
				return preg_match( '/^\d{2}:\d{2}$/', $v ) ? $v : '';

			case 'menu':
				return self::parse_menu( $value );

			case 'list':
				return self::sanitize_list( $value );

			case 'text':
			default:
				return sanitize_text_field( (string) $value );
		}
	}

	/**
	 * Dizi alanları (program, hikaye, galeri, sosyal).
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
