<?php
/**
 * Yönetim ekranları.
 *
 * Misafirin gördüğü davetiye sayfası Next sürümüyle piksel piksel aynı;
 * panel ise WordPress'in kendi arayüz diline uyuyor. Bilerek: WordPress'in
 * içinde ona benzemeyen bir panel çizmek hem yabancı duruyor hem de
 * oturum, rol ve parola sıfırlama gibi hazır işleyen şeyleri yeniden
 * yazmayı gerektirirdi. Alanların ve adımların kümesi birebir aynı.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Admin {

	const CAPABILITY = 'sahra_edit_invitations';

	public static function menu() {
		add_menu_page(
			__( 'Sahra Davetiye', 'sahra-davetiye' ),
			__( 'Sahra Davetiye', 'sahra-davetiye' ),
			self::CAPABILITY,
			'sahra-panel',
			array( __CLASS__, 'page_list' ),
			'dashicons-heart',
			26
		);

		add_submenu_page( 'sahra-panel', __( 'Davetiyeler', 'sahra-davetiye' ), __( 'Davetiyeler', 'sahra-davetiye' ), self::CAPABILITY, 'sahra-panel', array( __CLASS__, 'page_list' ) );
		add_submenu_page( 'sahra-panel', __( 'Davetiye Düzenle', 'sahra-davetiye' ), __( 'Yeni Davetiye', 'sahra-davetiye' ), self::CAPABILITY, 'sahra-davetiye-duzenle', array( __CLASS__, 'page_edit' ) );
		add_submenu_page( 'sahra-panel', __( 'Katılım & Albüm', 'sahra-davetiye' ), __( 'Katılım & Albüm', 'sahra-davetiye' ), self::CAPABILITY, 'sahra-hesap', array( __CLASS__, 'page_inbox' ) );

		if ( Sahra_Roles::is_manager() ) {
			add_submenu_page( 'sahra-panel', __( 'Mekân', 'sahra-davetiye' ), __( 'Mekân', 'sahra-davetiye' ), 'manage_options', 'sahra-mekan', array( __CLASS__, 'page_venue' ) );
			add_submenu_page( 'sahra-panel', __( 'Çift Hesapları', 'sahra-davetiye' ), __( 'Çift Hesapları', 'sahra-davetiye' ), 'manage_options', 'sahra-hesaplar', array( __CLASS__, 'page_users' ) );
			add_submenu_page( 'sahra-panel', __( 'Depolama', 'sahra-davetiye' ), __( 'Depolama', 'sahra-davetiye' ), 'manage_options', 'sahra-depolama', array( __CLASS__, 'page_storage' ) );
		}
	}

	public static function assets( $hook ) {
		if ( false === strpos( (string) $hook, 'sahra' ) ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'sahra-admin', SAHRA_URL . 'assets/css/admin.css', array(), SAHRA_VERSION );
		wp_enqueue_script( 'sahra-admin', SAHRA_URL . 'assets/js/admin.js', array(), SAHRA_VERSION, true );
	}

	public static function notices() {
		if ( ! Sahra_Roles::is_manager() ) {
			return;
		}

		$uyari = Sahra_Settings::storage_fallback_notice();
		if ( $uyari ) {
			printf(
				'<div class="notice notice-warning"><p><strong>%s</strong> %s</p></div>',
				esc_html__( 'Sahra Davetiye — Google Drive kullanılamadı, fotoğraflar bu sunucuya kaydediliyor:', 'sahra-davetiye' ),
				esc_html( $uyari )
			);
		}

		if ( '' === Sahra_Settings::venue()['venueName'] ) {
			printf(
				'<div class="notice notice-info"><p>%s <a href="%s">%s</a></p></div>',
				esc_html__( 'Sahra Davetiye: mekân bilgisi henüz girilmedi, davetiyelerde adres görünmeyecek.', 'sahra-davetiye' ),
				esc_url( admin_url( 'admin.php?page=sahra-mekan' ) ),
				esc_html__( 'Şimdi girin', 'sahra-davetiye' )
			);
		}
	}

	/* --------------------------------------------------------- POST akışı */

	public static function handle_post() {
		if ( empty( $_POST['sahra_action'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}

		$eylem = sanitize_key( wp_unslash( $_POST['sahra_action'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		check_admin_referer( 'sahra_' . $eylem );

		switch ( $eylem ) {
			case 'save_invitation':
				self::save_invitation();
				break;
			case 'save_venue':
				self::save_venue();
				break;
			case 'save_storage':
				self::save_storage();
				break;
			case 'create_user':
				self::create_user();
				break;
			case 'reset_password':
				self::reset_password();
				break;
			case 'delete_user':
				self::delete_user();
				break;
			case 'delete_invitation':
				self::delete_invitation();
				break;
		}
	}

	private static function redirect( $args ) {
		wp_safe_redirect( add_query_arg( $args, admin_url( 'admin.php' ) ) );
		exit;
	}

	private static function save_invitation() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$ham = isset( $_POST['sahra'] ) ? wp_unslash( $_POST['sahra'] ) : array(); // phpcs:ignore
		$id  = isset( $_POST['invitation_id'] ) ? (int) $_POST['invitation_id'] : 0;

		// Onay kutuları gönderilmediğinde "kapalı" demektir; şema bunu
		// bilemez, çünkü eksik alanı "dokunulmadı" sayıyor.
		foreach ( array( 'giftEnabled', 'wishesEnabled', 'soundEnabled' ) as $anahtar ) {
			$ham[ $anahtar ] = ! empty( $ham[ $anahtar ] );
		}

		$ham['galleryImages'] = self::split_lines( isset( $ham['galleryImagesText'] ) ? $ham['galleryImagesText'] : '' );
		unset( $ham['galleryImagesText'] );

		$ham['storyItems']   = self::parse_rows( isset( $ham['storyText'] ) ? $ham['storyText'] : '', array( 'year', 'title', 'desc' ) );
		$ham['programItems'] = self::parse_rows( isset( $ham['programText'] ) ? $ham['programText'] : '', array( 'time', 'title', 'desc' ) );
		$ham['faqItems']     = self::parse_rows( isset( $ham['faqText'] ) ? $ham['faqText'] : '', array( 'q', 'a' ) );
		$ham['socialLinks']  = self::parse_rows( isset( $ham['socialText'] ) ? $ham['socialText'] : '', array( 'name', 'href' ) );
		unset( $ham['storyText'], $ham['programText'], $ham['faqText'], $ham['socialText'] );

		if ( $id ) {
			if ( ! Sahra_Invitation::can_edit( $id ) ) {
				wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
			}
			Sahra_Invitation::update( $id, $ham );
		} else {
			$yeni = Sahra_Invitation::create( $ham, get_current_user_id() );
			$id   = is_wp_error( $yeni ) ? 0 : $yeni['id'];
		}

		self::redirect( array( 'page' => 'sahra-davetiye-duzenle', 'id' => $id, 'kaydedildi' => 1 ) );
	}

	private static function save_venue() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		Sahra_Settings::save_venue( wp_unslash( $_POST['venue'] ?? array() ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-mekan', 'kaydedildi' => 1 ) );
	}

	private static function save_storage() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		Sahra_Settings::save_storage( wp_unslash( $_POST['storage'] ?? array() ) ); // phpcs:ignore

		$sonuc = 'ok';
		$ayar  = Sahra_Settings::storage();

		if ( 'drive' === $ayar['driver'] ) {
			$drive = new Sahra_Storage_Drive( $ayar['drive'] );
			$sina  = $drive->test();
			$sonuc = is_wp_error( $sina ) ? $sina->get_error_message() : 'ok';
		}

		self::redirect( array( 'page' => 'sahra-depolama', 'kaydedildi' => 1, 'sina' => rawurlencode( $sonuc ) ) );
	}

	/**
	 * Çift hesabı açar.
	 *
	 * Parola sunucuda yalnızca özet olarak saklandığı için bir kez
	 * gösterilir; bu, çifte iletilebileceği tek andır.
	 */
	private static function create_user() {
		if ( ! current_user_can( 'create_users' ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$kullanici = sanitize_user( wp_unslash( $_POST['username'] ?? '' ), true ); // phpcs:ignore
		$ad        = sanitize_text_field( wp_unslash( $_POST['display_name'] ?? '' ) ); // phpcs:ignore
		$eposta    = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) ); // phpcs:ignore

		if ( '' === $kullanici ) {
			self::redirect( array( 'page' => 'sahra-hesaplar', 'hata' => rawurlencode( __( 'Kullanıcı adı zorunlu.', 'sahra-davetiye' ) ) ) );
		}

		$parola = wp_generate_password( 14, false );

		$id = wp_insert_user(
			array(
				'user_login'   => $kullanici,
				'user_pass'    => $parola,
				'user_email'   => $eposta ? $eposta : '',
				'display_name' => $ad ? $ad : $kullanici,
				'role'         => Sahra_Roles::COUPLE,
			)
		);

		if ( is_wp_error( $id ) ) {
			self::redirect( array( 'page' => 'sahra-hesaplar', 'hata' => rawurlencode( $id->get_error_message() ) ) );
		}

		set_transient( 'sahra_cred_' . get_current_user_id(), array( 'user' => $kullanici, 'pass' => $parola ), 5 * MINUTE_IN_SECONDS );
		self::redirect( array( 'page' => 'sahra-hesaplar', 'yeni' => 1 ) );
	}

	private static function reset_password() {
		if ( ! current_user_can( 'edit_users' ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$id      = (int) ( $_POST['user_id'] ?? 0 ); // phpcs:ignore
		$hesap   = get_userdata( $id );
		if ( ! $hesap ) {
			self::redirect( array( 'page' => 'sahra-hesaplar' ) );
		}

		$parola = wp_generate_password( 14, false );
		wp_set_password( $parola, $id );

		set_transient( 'sahra_cred_' . get_current_user_id(), array( 'user' => $hesap->user_login, 'pass' => $parola ), 5 * MINUTE_IN_SECONDS );
		self::redirect( array( 'page' => 'sahra-hesaplar', 'yeni' => 1 ) );
	}

	private static function delete_user() {
		if ( ! current_user_can( 'delete_users' ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		require_once ABSPATH . 'wp-admin/includes/user.php';
		wp_delete_user( (int) ( $_POST['user_id'] ?? 0 ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-hesaplar', 'silindi' => 1 ) );
	}

	private static function delete_invitation() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		Sahra_Invitation::delete( (int) ( $_POST['invitation_id'] ?? 0 ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-panel', 'silindi' => 1 ) );
	}

	/* ------------------------------------------------------- metin ↔ dizi */

	private static function split_lines( $metin ) {
		$satirlar = preg_split( '/\R/', (string) $metin );
		return array_values( array_filter( array_map( 'trim', $satirlar ) ) );
	}

	/**
	 * "a | b | c" biçimindeki satırları nesne dizisine çevirir.
	 *
	 * Program/SSS/hikaye için ayrı ayrı tekrarlayıcı arayüz yazmak yerine
	 * tek bir metin alanı: panelde çok daha az JavaScript, çiftin
	 * gözünde çok daha az tıklama.
	 */
	private static function parse_rows( $metin, $anahtarlar ) {
		$out = array();

		foreach ( self::split_lines( $metin ) as $satir ) {
			$parcalar = array_map( 'trim', explode( '|', $satir ) );
			$satir_dizi = array();

			foreach ( $anahtarlar as $i => $anahtar ) {
				$satir_dizi[ $anahtar ] = isset( $parcalar[ $i ] ) ? $parcalar[ $i ] : '';
			}

			$out[] = $satir_dizi;
		}

		return $out;
	}

	private static function rows_to_text( $liste, $anahtarlar ) {
		if ( ! is_array( $liste ) ) {
			return '';
		}

		$satirlar = array();
		foreach ( $liste as $oge ) {
			$parcalar = array();
			foreach ( $anahtarlar as $anahtar ) {
				$parcalar[] = isset( $oge[ $anahtar ] ) ? $oge[ $anahtar ] : '';
			}
			$satirlar[] = implode( ' | ', $parcalar );
		}
		return implode( "\n", $satirlar );
	}

	/* ------------------------------------------------------------ ekranlar */

	public static function page_list() {
		$davetiyeler = Sahra_Invitation::all_for_user();
		include SAHRA_DIR . 'templates/admin-list.php';
	}

	public static function page_edit() {
		$id = isset( $_GET['id'] ) ? (int) $_GET['id'] : 0; // phpcs:ignore WordPress.Security.NonceVerification

		if ( $id && ! Sahra_Invitation::can_edit( $id ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$d = $id ? Sahra_Invitation::get( $id ) : array_merge(
			Sahra_Fields::defaults(),
			Sahra_Settings::venue(),
			array( 'id' => 0, 'slug' => '', 'isActive' => true )
		);

		$metinler = array(
			'gallery' => implode( "\n", (array) $d['galleryImages'] ),
			'story'   => self::rows_to_text( $d['storyItems'], array( 'year', 'title', 'desc' ) ),
			'program' => self::rows_to_text( $d['programItems'], array( 'time', 'title', 'desc' ) ),
			'faq'     => self::rows_to_text( $d['faqItems'], array( 'q', 'a' ) ),
			'social'  => self::rows_to_text( $d['socialLinks'], array( 'name', 'href' ) ),
		);

		include SAHRA_DIR . 'templates/admin-edit.php';
	}

	public static function page_venue() {
		$venue = Sahra_Settings::venue();
		include SAHRA_DIR . 'templates/admin-venue.php';
	}

	public static function page_storage() {
		$storage = Sahra_Settings::storage();
		include SAHRA_DIR . 'templates/admin-storage.php';
	}

	public static function page_users() {
		$hesaplar = get_users( array( 'role' => Sahra_Roles::COUPLE ) );
		$kimlik   = get_transient( 'sahra_cred_' . get_current_user_id() );
		if ( $kimlik ) {
			delete_transient( 'sahra_cred_' . get_current_user_id() );
		}
		include SAHRA_DIR . 'templates/admin-users.php';
	}

	public static function page_inbox() {
		global $wpdb;

		$davetiyeler = Sahra_Invitation::all_for_user();
		$idler       = array_map(
			static function ( $d ) {
				return (int) $d['id'];
			},
			$davetiyeler
		);

		$katilimlar = array();
		$dilekler   = array();
		$fotograflar = array();

		if ( $idler ) {
			$yt = implode( ',', array_fill( 0, count( $idler ), '%d' ) );
			$katilimlar  = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::rsvps() . " WHERE invitation_id IN ({$yt}) ORDER BY created_at DESC", $idler ) ); // phpcs:ignore
			$dilekler    = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::wishes() . " WHERE invitation_id IN ({$yt}) ORDER BY created_at DESC", $idler ) ); // phpcs:ignore
			$fotograflar = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::photos() . " WHERE invitation_id IN ({$yt}) ORDER BY created_at DESC", $idler ) ); // phpcs:ignore
		}

		include SAHRA_DIR . 'templates/admin-inbox.php';
	}
}
