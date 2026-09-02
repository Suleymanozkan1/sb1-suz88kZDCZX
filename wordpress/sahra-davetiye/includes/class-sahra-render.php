<?php
/**
 * Ön yüz — adresler ve şablonlar.
 *
 * Davetiye sayfası WordPress temasının İÇİNDE çizilmiyor; kendi tam sayfa
 * şablonu var ve `template_redirect` üzerinde erkenden devralınıyor.
 * Sebebi basit: sayfa perdeyle açılan tam ekran bir sahne. Temanın başlığı,
 * menüsü, çerez çubuğu ve altbilgisi bunun üstüne binseydi davetiye
 * "bir WordPress sayfasına gömülmüş" gibi görünürdü — oysa iki sürümün
 * birebir aynı görünmesi gerekiyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Render {

	/**
	 * Yeniden yazma kuralları.
	 *
	 * `/davet/giris`       çift ve yönetici girişi
	 * `/davet/{slug}`      davetiye
	 * `/yukle/{slug}`      masadaki QR — misafir fotoğraf yükleme
	 * `/sahra-kart/{slug}` paylaşım kartı (og:image)
	 * `/sahra-dosya/{ad}`  çiftin görselleri (herkese açık)
	 * `/sahra-foto/{id}`   misafir fotoğrafı (yetki ister)
	 */
	public static function add_rewrite_rules() {
		/*
		 * Giriş kuralı davetiye kuralından ÖNCE eklenmeli: `extra_rules_top`
		 * ekleme sırasını koruyor ve `^davet/([^/]+)` "giris"i de bir slug
		 * gibi yakalardı. Aynı sebeple "giris" ayrılmış bir slug
		 * (Sahra_Invitation::RESERVED_SLUGS).
		 */
		add_rewrite_rule( '^davet/giris/?$', 'index.php?sahra_view=login', 'top' );
		add_rewrite_rule( '^davet/([^/]+)/?$', 'index.php?sahra_view=invitation&sahra_slug=$matches[1]', 'top' );
		add_rewrite_rule( '^yukle/([^/]+)/?$', 'index.php?sahra_view=upload&sahra_slug=$matches[1]', 'top' );
		add_rewrite_rule( '^sahra-kart/([^/]+)\.png$', 'index.php?sahra_view=card&sahra_slug=$matches[1]', 'top' );
		add_rewrite_rule( '^sahra-dosya/([^/]+)/?$', 'index.php?sahra_view=file&sahra_file=$matches[1]', 'top' );
		add_rewrite_rule( '^sahra-foto/([0-9]+)/?$', 'index.php?sahra_view=photo&sahra_photo=$matches[1]', 'top' );
		add_rewrite_rule( '^sahra-album/([0-9]+)\.zip$', 'index.php?sahra_view=zip&sahra_album=$matches[1]', 'top' );
	}

	public static function add_query_vars( $vars ) {
		$vars[] = 'sahra_view';
		$vars[] = 'sahra_slug';
		$vars[] = 'sahra_file';
		$vars[] = 'sahra_photo';
		$vars[] = 'sahra_album';
		return $vars;
	}

	/** Kurallar yoksa bir kez yazılır — elle "kalıcı bağlantıları kaydet" gerekmesin. */
	public static function maybe_flush() {
		if ( get_option( 'sahra_rewrite_version' ) === SAHRA_VERSION ) {
			return;
		}
		self::add_rewrite_rules();
		flush_rewrite_rules();
		update_option( 'sahra_rewrite_version', SAHRA_VERSION );
	}

	public static function file_url( $file_id ) {
		return home_url( '/sahra-dosya/' . rawurlencode( $file_id ) );
	}

	public static function photo_url( $photo_id ) {
		return home_url( '/sahra-foto/' . (int) $photo_id );
	}

	public static function card_url( $slug ) {
		return home_url( '/sahra-kart/' . rawurlencode( $slug ) . '.png' );
	}

	public static function zip_url( $invitation_id ) {
		return home_url( '/sahra-album/' . (int) $invitation_id . '.zip' );
	}

	/** Yönlendirme. */
	public static function dispatch() {
		$view = get_query_var( 'sahra_view' );
		if ( ! $view ) {
			return;
		}

		switch ( $view ) {
			case 'login':
				Sahra_Login::render();
				break;
			case 'invitation':
				self::render_invitation();
				break;
			case 'upload':
				self::render_upload();
				break;
			case 'card':
				Sahra_Og_Image::output( get_query_var( 'sahra_slug' ) );
				break;
			case 'file':
				self::stream_file();
				break;
			case 'photo':
				self::stream_photo();
				break;
			case 'zip':
				self::stream_zip();
				break;
		}
	}

	private static function render_invitation() {
		$davetiye = Sahra_Invitation::get_by_slug( get_query_var( 'sahra_slug' ) );

		if ( ! $davetiye || ! $davetiye['isActive'] ) {
			self::not_found();
		}

		$wishes = self::approved_wishes( $davetiye['id'] );

		status_header( 200 );
		include SAHRA_DIR . 'templates/invitation.php';
		exit;
	}

	private static function render_upload() {
		$davetiye = Sahra_Invitation::get_by_slug( get_query_var( 'sahra_slug' ) );

		if ( ! $davetiye || ! $davetiye['isActive'] ) {
			self::not_found();
		}

		status_header( 200 );
		include SAHRA_DIR . 'templates/upload.php';
		exit;
	}

	public static function approved_wishes( $invitation_id ) {
		global $wpdb;
		return $wpdb->get_results( // phpcs:ignore
			$wpdb->prepare(
				'SELECT name, message, created_at FROM ' . Sahra_Tables::wishes() . ' WHERE invitation_id = %d AND approved = 1 ORDER BY created_at DESC LIMIT 50', // phpcs:ignore
				(int) $invitation_id
			)
		);
	}

	/** Çiftin görselleri — davetiyede görünürler, yani herkese açık. */
	private static function stream_file() {
		$id      = (string) get_query_var( 'sahra_file' );
		$icerik  = Sahra_Storage::get( $id );

		if ( is_wp_error( $icerik ) ) {
			status_header( 404 );
			exit;
		}

		self::send_binary( $icerik['body'], $icerik['mime'], true );
	}

	/**
	 * Misafir fotoğrafı — yetki ister.
	 *
	 * Bunlar davetiyede görünmüyor; yalnızca çiftin albümünde. Adresi bilen
	 * herkese açık olsaydı, düğünde çekilmiş özel kareler tahmin edilebilir
	 * bir kimlikle dışarı sızardı.
	 */
	private static function stream_photo() {
		global $wpdb;

		$id    = (int) get_query_var( 'sahra_photo' );
		$satir = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::photos() . ' WHERE id = %d', $id ) ); // phpcs:ignore

		if ( ! $satir ) {
			status_header( 404 );
			exit;
		}

		if ( ! is_user_logged_in() ) {
			status_header( 401 );
			exit;
		}

		if ( ! Sahra_Invitation::can_edit( $satir->invitation_id ) ) {
			status_header( 403 );
			exit;
		}

		$icerik = Sahra_Storage::get( $satir->file_id );
		if ( is_wp_error( $icerik ) ) {
			status_header( 404 );
			exit;
		}

		// ?indir=1 → tarayıcıda açmak yerine kaydet. Çift, misafirin
		// yüklediği kareyi dokunulmamış çözünürlükte almalı.
		$indir = isset( $_GET['indir'] ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( $indir ) {
			header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $satir->file_id ) . '"' );
		}

		// Özel içerik: paylaşımlı ara belleklerde tutulmamalı.
		self::send_binary( $icerik['body'], $icerik['mime'], false );
	}

	/**
	 * Albümün tamamı tek dosyada.
	 *
	 * Yüzlerce kareyi tek tek indirmek işkence; ZipArchive yoksa özellik
	 * sessizce kaybolmasın diye açık bir mesaj veriliyor.
	 */
	private static function stream_zip() {
		global $wpdb;

		$id = (int) get_query_var( 'sahra_album' );

		if ( ! is_user_logged_in() ) {
			status_header( 401 );
			exit;
		}

		if ( ! Sahra_Invitation::can_edit( $id ) ) {
			status_header( 403 );
			exit;
		}

		if ( ! class_exists( 'ZipArchive' ) ) {
			status_header( 501 );
			header( 'Content-Type: text/plain; charset=utf-8' );
			echo esc_html__( 'Sunucuda ZipArchive eklentisi yok; fotoğrafları tek tek indirebilirsiniz.', 'sahra-davetiye' );
			exit;
		}

		$satirlar = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::photos() . ' WHERE invitation_id = %d ORDER BY created_at', $id ) ); // phpcs:ignore
		if ( ! $satirlar ) {
			status_header( 404 );
			exit;
		}

		$davetiye = Sahra_Invitation::get( $id );

		/*
		 * wp_tempnam() DEĞİL: o işlev wp-admin/includes/file.php içinde ve
		 * bu rota ön yüzde (template_redirect) çalışıyor — orada tanımsız
		 * olduğu için istek 500 ile düşüyordu. get_temp_dir() çekirdekte,
		 * her iki tarafta da var.
		 */
		$gecici = tempnam( get_temp_dir(), 'sahra-album-' );
		if ( ! $gecici ) {
			status_header( 500 );
			exit;
		}

		$zip = new ZipArchive();
		if ( true !== $zip->open( $gecici, ZipArchive::OVERWRITE ) ) {
			status_header( 500 );
			exit;
		}

		foreach ( $satirlar as $sira => $satir ) {
			$icerik = Sahra_Storage::get( $satir->file_id );
			if ( is_wp_error( $icerik ) ) {
				continue;
			}
			$uzanti = pathinfo( $satir->file_id, PATHINFO_EXTENSION );
			$ad     = sprintf( '%03d', $sira + 1 );
			if ( $satir->uploader_name ) {
				$ad .= '-' . sanitize_file_name( $satir->uploader_name );
			}
			$zip->addFromString( $ad . '.' . $uzanti, $icerik['body'] );
		}

		$zip->close();

		$dosya_adi = sanitize_file_name( ( $davetiye ? $davetiye['slug'] : 'album' ) . '-album.zip' );

		nocache_headers();
		header( 'Content-Type: application/zip' );
		header( 'Content-Disposition: attachment; filename="' . $dosya_adi . '"' );
		header( 'Content-Length: ' . filesize( $gecici ) );
		readfile( $gecici ); // phpcs:ignore
		wp_delete_file( $gecici );
		exit;
	}

	private static function send_binary( $body, $mime, $public ) {
		nocache_headers();
		header_remove( 'Cache-Control' );
		header( 'Content-Type: ' . $mime );
		header( 'Content-Length: ' . strlen( $body ) );
		header( 'X-Content-Type-Options: nosniff' );
		header(
			$public
				? 'Cache-Control: public, max-age=31536000, immutable'
				: 'Cache-Control: private, max-age=0, no-store'
		);
		echo $body; // phpcs:ignore
		exit;
	}

	private static function not_found() {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
		include get_404_template();
		exit;
	}

	/* -------------------------------------------------- çizim yardımcıları */

	/**
	 * Türkçe büyük harf.
	 *
	 * mb_strtoupper Türkçe'yi bilmiyor: "davetlisiniz" → "DAVETLISINIZ"
	 * çıkıyor, oysa doğrusu "DAVETLİSİNİZ". i → İ ve ı → I eşlemesi elle
	 * yapılmalı. Aynı sorun CSS'te de var; şablonlar bu yüzden lang="tr"
	 * ile çiziliyor.
	 */
	public static function tr_upper( $metin ) {
		$metin = str_replace( array( 'i', 'ı' ), array( 'İ', 'I' ), (string) $metin );
		return mb_strtoupper( $metin, 'UTF-8' );
	}

	const AYLAR = array(
		1 => 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
		'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
	);

	const GUNLER = array(
		'Sunday' => 'Pazar', 'Monday' => 'Pazartesi', 'Tuesday' => 'Salı',
		'Wednesday' => 'Çarşamba', 'Thursday' => 'Perşembe',
		'Friday' => 'Cuma', 'Saturday' => 'Cumartesi',
	);

	/**
	 * "2026-12-05" → "5 Aralık 2026"
	 *
	 * wp_date() sitenin diline bakıyor ve İngilizce bir WordPress kurulumunda
	 * "5 December 2026" üretiyordu. Ürün Türkçe; tarih sitenin dil ayarına
	 * bağlı olmamalı.
	 */
	public static function format_date( $iso ) {
		if ( ! $iso ) {
			return '';
		}
		$zaman = strtotime( $iso );
		if ( ! $zaman ) {
			return '';
		}
		$ay = self::AYLAR[ (int) gmdate( 'n', $zaman ) ];
		return gmdate( 'j', $zaman ) . ' ' . $ay . ' ' . gmdate( 'Y', $zaman );
	}

	public static function format_weekday( $iso ) {
		if ( ! $iso ) {
			return '';
		}
		$zaman = strtotime( $iso );
		if ( ! $zaman ) {
			return '';
		}
		$gun = gmdate( 'l', $zaman );
		return isset( self::GUNLER[ $gun ] ) ? self::GUNLER[ $gun ] : $gun;
	}

	/** "17:00" + "23:30" → "17:00 – 23:30"; bitiş yoksa yalnızca başlangıç. */
	public static function format_time_range( $start, $end ) {
		$b = trim( (string) $start );
		if ( '' === $b ) {
			return '';
		}
		$s = trim( (string) $end );
		return ( '' !== $s && $s !== $b ) ? $b . ' – ' . $s : $b;
	}

	/** Google Takvim damgası. */
	public static function calendar_stamp( $date, $time ) {
		if ( ! $date ) {
			return '';
		}
		$parca = explode( ':', (string) $time );
		$saat  = str_pad( isset( $parca[0] ) ? $parca[0] : '00', 2, '0', STR_PAD_LEFT );
		$dakika = str_pad( isset( $parca[1] ) ? $parca[1] : '00', 2, '0', STR_PAD_LEFT );
		return str_replace( '-', '', $date ) . 'T' . $saat . $dakika . '00';
	}

	/**
	 * Bitiş damgası.
	 *
	 * Bitiş başlangıçtan önceyse (23:00 → 02:00 gibi gece yarısını aşan
	 * düğünler) ertesi güne taşınır; yoksa takvim kaydı negatif süreyle
	 * oluşuyordu.
	 */
	public static function calendar_end_stamp( $date, $time, $end_time ) {
		if ( ! $date ) {
			return '';
		}

		$bas = explode( ':', (string) $time );
		$bh  = (int) ( isset( $bas[0] ) ? $bas[0] : 0 );
		$bm  = (int) ( isset( $bas[1] ) ? $bas[1] : 0 );

		$taban = strtotime( $date . ' 00:00:00' );

		if ( $end_time && preg_match( '/^\d{1,2}:\d{2}$/', $end_time ) ) {
			$son = explode( ':', $end_time );
			$eh  = (int) $son[0];
			$em  = (int) $son[1];
			$gun = ( $eh * 60 + $em ) <= ( $bh * 60 + $bm ) ? 1 : 0;
			$zaman = $taban + ( $gun * DAY_IN_SECONDS ) + ( $eh * HOUR_IN_SECONDS ) + ( $em * MINUTE_IN_SECONDS );
		} else {
			$zaman = $taban + ( ( $bh + 5 ) * HOUR_IN_SECONDS ) + ( $bm * MINUTE_IN_SECONDS );
		}

		return gmdate( 'Ymd\THis', $zaman );
	}

	/** IBAN'ı dörderli gruplar. */
	public static function group_iban( $iban ) {
		$temiz = strtoupper( preg_replace( '/\s+/', '', (string) $iban ) );
		return trim( chunk_split( $temiz, 4, ' ' ) );
	}
}
