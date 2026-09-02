<?php
/**
 * Genel ayarlar — ortak mekân ve depolama.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Settings {

	const VENUE_OPTION     = 'sahra_venue';    // tek salon dönemi — göçte okunur
	const VENUES_OPTION    = 'sahra_venues';
	const MENUS_OPTION     = 'sahra_menus';
	const BRAND_OPTION     = 'sahra_brand';
	const LIFECYCLE_OPTION = 'sahra_lifecycle';
	const STORAGE_OPTION   = 'sahra_storage';
	const FALLBACK_NOTICE  = 'sahra_storage_fallback';

	/** Salonun boş iskeleti. */
	public static function empty_venue() {
		return array(
			'id'        => '',
			'venueName' => '',
			'address'   => '',
			'district'  => '',
			'city'      => '',
			'mapUrl'    => '',
			/*
			 * Yol tarifi salonun kendi bilgisi, çiftin değil: aynı salona
			 * gelen herkes aynı yoldan geliyor. Yöneticinin bir kez
			 * yazdığı metin, o salonu seçen bütün davetiyelerde çıkıyor —
			 * ve salon değişince hepsi birden düzeliyor.
			 */
			'venueDirections' => '',
			/*
			 * Her salonun kendi Instagram hesabı.
			 *
			 * İşletmenin tek bir hesabı varsayılıyordu; oysa salonların
			 * ayrı hesapları var ve misafir hangi salondaysa orayı
			 * etiketlemeli. Boş bırakılırsa işletmenin genel hesabına
			 * düşülüyor — tek hesaplı kurulumlar bozulmasın.
			 */
			'venueInstagram'      => '',
			'venueInstagramLabel' => '',
			'features'  => array(),
		);
	}

	/**
	 * Salonlar — yönetici tanımlar, çift aralarından seçer.
	 *
	 * Başta tek bir ortak salon vardı: adresi her çifte ayrı sormak hem
	 * gereksiz bir soru hem bir hata kaynağıydı. Ama işletmenin birden
	 * fazla salonu olunca tek adres yanlış oldu; artık liste. Adres yine
	 * çiftin YAZDIĞI bir şey değil, yöneticinin tanımladıklarından seçtiği
	 * bir şey — yanlış adres yazma riski duruyor.
	 */
	public static function venues() {
		$ham = get_option( self::VENUES_OPTION, null );

		if ( null === $ham ) {
			// Tek salon döneminden göç: eski kayıt listenin ilk üyesi olur.
			$eski = get_option( self::VENUE_OPTION, array() );
			if ( is_array( $eski ) && ! empty( $eski['venueName'] ) ) {
				$eski['id']       = 'salon-1';
				$eski['features'] = array();
				$liste            = array( wp_parse_args( $eski, self::empty_venue() ) );
				update_option( self::VENUES_OPTION, $liste );
				return $liste;
			}
			return array();
		}

		$out = array();
		foreach ( (array) $ham as $salon ) {
			if ( is_array( $salon ) ) {
				$out[] = wp_parse_args( $salon, self::empty_venue() );
			}
		}
		return $out;
	}

	/** Kimliğe göre salon; yoksa null. */
	public static function venue_by_id( $id ) {
		foreach ( self::venues() as $salon ) {
			if ( (string) $salon['id'] === (string) $id ) {
				return $salon;
			}
		}
		return null;
	}

	/**
	 * Davetiyenin kullanacağı salon.
	 *
	 * Seçim yoksa ya da seçilen salon silinmişse İLK salona düşülür:
	 * davetiyenin adres bölümünün bomboş kalması, yanlış salonu
	 * göstermekten daha kötü bir sonuç değil ama misafir için daha
	 * kullanışsız. Yine de hiç salon yoksa boş iskelet döner.
	 */
	public static function venue_for( $venue_id = '' ) {
		$salon = $venue_id ? self::venue_by_id( $venue_id ) : null;
		if ( $salon ) {
			return $salon;
		}
		$hepsi = self::venues();
		return $hepsi ? $hepsi[0] : self::empty_venue();
	}

	/** Geriye dönük: tek salon bekleyen çağrılar için ilk salon. */
	public static function venue() {
		return self::venue_for( '' );
	}

	/** Salonu ekler ya da günceller; kimliği döner. */
	public static function save_venue( $input ) {
		$liste = self::venues();
		$id    = isset( $input['id'] ) ? sanitize_key( (string) $input['id'] ) : '';

		$temiz = self::empty_venue();
		foreach ( array( 'venueName', 'address', 'district', 'city' ) as $anahtar ) {
			$temiz[ $anahtar ] = isset( $input[ $anahtar ] ) ? sanitize_text_field( (string) $input[ $anahtar ] ) : '';
		}
		// Çok satırlı olabilir; satır sonları korunsun diye textarea temizliği.
		$temiz['venueDirections'] = isset( $input['venueDirections'] )
			? sanitize_textarea_field( (string) $input['venueDirections'] )
			: '';

		$temiz['venueInstagram']      = isset( $input['venueInstagram'] ) ? Sahra_Fields::safe_url( $input['venueInstagram'] ) : '';
		$temiz['venueInstagramLabel'] = isset( $input['venueInstagramLabel'] ) ? sanitize_text_field( (string) $input['venueInstagramLabel'] ) : '';
		$temiz['mapUrl']   = isset( $input['mapUrl'] ) ? Sahra_Fields::safe_url( $input['mapUrl'] ) : '';
		$temiz['features'] = self::satirlar( isset( $input['features'] ) ? $input['features'] : '' );

		if ( '' === $temiz['venueName'] ) {
			return new WP_Error( 'sahra_salon_adi', __( 'Salon adı zorunlu.', 'sahra-davetiye' ) );
		}

		$yer = -1;
		foreach ( $liste as $i => $salon ) {
			if ( $id && (string) $salon['id'] === $id ) {
				$yer = $i;
				break;
			}
		}

		if ( $yer >= 0 ) {
			$temiz['id'] = $id;
			$liste[ $yer ] = $temiz;
		} else {
			$temiz['id'] = self::yeni_id( 'salon', wp_list_pluck( $liste, 'id' ) );
			$liste[]     = $temiz;
		}

		update_option( self::VENUES_OPTION, array_values( $liste ) );
		return $temiz['id'];
	}

	public static function delete_venue( $id ) {
		$liste = array_values(
			array_filter( self::venues(), static function ( $salon ) use ( $id ) {
				return (string) $salon['id'] !== (string) $id;
			} )
		);
		update_option( self::VENUES_OPTION, $liste );
		return true;
	}

	/* ------------------------------------------------------------- menüler */

	public static function empty_menu() {
		return array( 'id' => '', 'name' => '', 'groups' => array() );
	}

	/**
	 * Menüler — yönetici tanımlar, çift birini seçip üstünde oynayabilir.
	 *
	 * Fiyat BİLEREK yok: davetiye misafire gidiyor, fiyat çiftle işletme
	 * arasındaki mesele. Menünün adı da davetiyede görünmüyor; misafirin
	 * "Menü-3" görmesinin bir anlamı yok, başlık yalnızca "Menü".
	 */
	public static function menus() {
		$ham = get_option( self::MENUS_OPTION, null );
		if ( null === $ham ) {
			$liste = Sahra_Fields::default_menus();
			update_option( self::MENUS_OPTION, $liste );
			return $liste;
		}

		$out = array();
		foreach ( (array) $ham as $menu ) {
			if ( is_array( $menu ) ) {
				$out[] = wp_parse_args( $menu, self::empty_menu() );
			}
		}
		return $out;
	}

	public static function menu_by_id( $id ) {
		foreach ( self::menus() as $menu ) {
			if ( (string) $menu['id'] === (string) $id ) {
				return $menu;
			}
		}
		return null;
	}

	public static function save_menu( $input ) {
		$liste = self::menus();
		$id    = isset( $input['id'] ) ? sanitize_key( (string) $input['id'] ) : '';

		$ad = isset( $input['name'] ) ? sanitize_text_field( (string) $input['name'] ) : '';
		if ( '' === $ad ) {
			return new WP_Error( 'sahra_menu_adi', __( 'Menü adı zorunlu.', 'sahra-davetiye' ) );
		}

		$temiz = array(
			'id'     => $id,
			'name'   => $ad,
			'groups' => Sahra_Fields::parse_menu( isset( $input['groups'] ) ? $input['groups'] : '' ),
		);

		$yer = -1;
		foreach ( $liste as $i => $menu ) {
			if ( $id && (string) $menu['id'] === $id ) {
				$yer = $i;
				break;
			}
		}

		if ( $yer >= 0 ) {
			$liste[ $yer ] = $temiz;
		} else {
			$temiz['id'] = self::yeni_id( 'menu', wp_list_pluck( $liste, 'id' ) );
			$liste[]     = $temiz;
		}

		update_option( self::MENUS_OPTION, array_values( $liste ) );
		return $temiz['id'];
	}

	public static function delete_menu( $id ) {
		$liste = array_values(
			array_filter( self::menus(), static function ( $menu ) use ( $id ) {
				return (string) $menu['id'] !== (string) $id;
			} )
		);
		update_option( self::MENUS_OPTION, $liste );
		return true;
	}

	/* ---------------------------------------------------------- işletme */

	/** İşletmenin kendi bilgileri — davetiyede "bizi etiketleyin" için. */
	public static function brand() {
		return wp_parse_args(
			get_option( self::BRAND_OPTION, array() ),
			array( 'instagram' => '', 'instagramLabel' => '' )
		);
	}

	public static function save_brand( $input ) {
		$temiz = array(
			'instagram'      => Sahra_Fields::safe_url( isset( $input['instagram'] ) ? $input['instagram'] : '' ),
			'instagramLabel' => sanitize_text_field( isset( $input['instagramLabel'] ) ? (string) $input['instagramLabel'] : '' ),
		);
		update_option( self::BRAND_OPTION, $temiz );
		return $temiz;
	}

	/* -------------------------------------------------------- yaşam süresi */

	/**
	 * Davetiyenin ömrü.
	 *
	 * Düğün bitince davetiye artık kimseye lazım değil ama misafir
	 * fotoğrafları çifte lazım. Bu yüzden iki kademe: önce LİNK kapanır
	 * (davetiye yayından kalkar), veriler panelde durur; ancak epey sonra
	 * her şey kalıcı silinir. Tek kademede silmek, albümünü indirmeyi
	 * unutan çiftin düğün fotoğraflarını yok etmek demekti.
	 */
	public static function lifecycle() {
		$ayar = wp_parse_args(
			get_option( self::LIFECYCLE_OPTION, array() ),
			array( 'unpublishDays' => 1, 'deleteDays' => 30, 'deleteEnabled' => true )
		);

		$ayar['unpublishDays'] = max( 0, min( 365, (int) $ayar['unpublishDays'] ) );
		$ayar['deleteDays']    = max( 1, min( 3650, (int) $ayar['deleteDays'] ) );
		$ayar['deleteEnabled'] = (bool) $ayar['deleteEnabled'];

		return $ayar;
	}

	public static function save_lifecycle( $input ) {
		$temiz = array(
			'unpublishDays' => isset( $input['unpublishDays'] ) ? (int) $input['unpublishDays'] : 1,
			'deleteDays'    => isset( $input['deleteDays'] ) ? (int) $input['deleteDays'] : 30,
			'deleteEnabled' => ! empty( $input['deleteEnabled'] ),
		);
		update_option( self::LIFECYCLE_OPTION, $temiz );
		return self::lifecycle();
	}

	/* ------------------------------------------------------------ yardımcı */

	/** Çakışmayan, okunur kimlik: salon-1, salon-2 ... */
	private static function yeni_id( $onek, $mevcut ) {
		$i = count( (array) $mevcut ) + 1;
		do {
			$id = $onek . '-' . $i;
			$i++;
		} while ( in_array( $id, (array) $mevcut, true ) );
		return $id;
	}

	/** Çok satırlı metni temiz bir listeye çevirir. */
	public static function satirlar( $metin ) {
		if ( is_array( $metin ) ) {
			$metin = implode( "\n", $metin );
		}
		$out = array();
		foreach ( preg_split( '/\r\n|\r|\n/', (string) $metin ) as $satir ) {
			$satir = sanitize_text_field( trim( $satir ) );
			if ( '' !== $satir ) {
				$out[] = $satir;
			}
		}
		return array_slice( $out, 0, 60 );
	}

	/** Depolama ayarı. */
	public static function storage() {
		$ayar = wp_parse_args(
			get_option( self::STORAGE_OPTION, array() ),
			array( 'driver' => 'local', 'drive' => array() )
		);

		$ayar['drive'] = wp_parse_args(
			is_array( $ayar['drive'] ) ? $ayar['drive'] : array(),
			array( 'client_id' => '', 'client_secret' => '', 'refresh_token' => '', 'folder_id' => '' )
		);

		return $ayar;
	}

	public static function save_storage( $input ) {
		$surucu = isset( $input['driver'] ) && 'drive' === $input['driver'] ? 'drive' : 'local';
		$drive  = isset( $input['drive'] ) && is_array( $input['drive'] ) ? $input['drive'] : array();
		$mevcut = self::storage();

		$temiz = array();
		foreach ( array( 'client_id', 'client_secret', 'refresh_token', 'folder_id' ) as $alan ) {
			$deger = isset( $drive[ $alan ] ) ? trim( sanitize_text_field( (string) $drive[ $alan ] ) ) : '';

			/*
			 * Boş bırakılan gizli alan "sil" demek değildir: ayar ekranında
			 * sırlar maskeli gösteriliyor, kaydete basmak jetonu silmemeli.
			 */
			if ( '' === $deger && in_array( $alan, array( 'client_secret', 'refresh_token' ), true ) ) {
				$deger = $mevcut['drive'][ $alan ];
			}

			$temiz[ $alan ] = $deger;
		}

		delete_transient( Sahra_Storage_Drive::TOKEN_CACHE );
		delete_option( self::FALLBACK_NOTICE );
		Sahra_Storage::reset();

		update_option( self::STORAGE_OPTION, array( 'driver' => $surucu, 'drive' => $temiz ) );
		return self::storage();
	}

	/** Drive çalışmadığı için yerele düşüldüğünde yöneticiye söylenecek. */
	public static function note_storage_fallback( $error ) {
		$mesaj = is_wp_error( $error ) ? $error->get_error_message() : (string) $error;
		update_option( self::FALLBACK_NOTICE, $mesaj, false );
	}

	public static function storage_fallback_notice() {
		return get_option( self::FALLBACK_NOTICE, '' );
	}
}
