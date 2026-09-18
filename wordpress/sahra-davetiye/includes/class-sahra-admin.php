<?php
/**
 * Yönetim ekranları.
 *
 * Panel de davetiye sayfası gibi Sahra tasarım diliyle çiziliyor: koyu
 * zemin, altın etiketler, serif başlıklar, adım çipli sihirbaz. WordPress'in
 * gri arayüzü yalnızca ekranın ÇEVRESİNDE kalıyordu ve davetiyeyle aynı
 * ürün gibi durmuyordu; kabuk kendi ekranlarımızda gizleniyor, kaçış yolu
 * başlıktaki "WordPress Paneli" bağlantısı.
 *
 * Oturum, rol ve parola işleri WordPress'in kendi altyapısında kalıyor —
 * yeniden yazmak, hazır ve denenmiş bir güvenlik katmanını çöpe atmak olurdu.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Admin {

	const CAPABILITY = 'sahra_edit_invitations';

	/**
	 * Çift hesabının girebildiği ekranlar.
	 *
	 * Tek yerde: liste hem menüde, hem gezinme çubuğunda, hem de wp-admin
	 * bekçisinde kullanılıyor. Ayrı ayrı yazılıyordu ve biri güncellenmeyi
	 * unutunca çift, kendi hesap ayarları sayfasından dışarı atılıyordu.
	 */
	const COUPLE_PAGES = array( 'sahra-panel', 'sahra-davetiye-duzenle', 'sahra-davetliler', 'sahra-hesap', 'sahra-ayarlar' );

	/** Yalnızca yöneticinin girebildiği ekranlar. */
	const MANAGER_PAGES = array( 'sahra-salonlar', 'sahra-menuler', 'sahra-hesaplar', 'sahra-depolama', 'sahra-isletme' );

	/**
	 * Yalnızca SİTE yöneticisinin girebildiği ekranlar.
	 *
	 * `MANAGER_PAGES`'e yazılmıyor: işletme yöneticisi buraya girerse
	 * kendi gibi yönetici üretebilir ve verilen yetkinin dışına çıkar.
	 */
	const ADMIN_PAGES = array( 'sahra-yoneticiler' );

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
		add_submenu_page( 'sahra-panel', __( 'Davetli Listesi', 'sahra-davetiye' ), __( 'Davetli Listesi', 'sahra-davetiye' ), self::CAPABILITY, 'sahra-davetliler', array( __CLASS__, 'page_guests' ) );
		add_submenu_page( 'sahra-panel', __( 'Katılım & Albüm', 'sahra-davetiye' ), __( 'Katılım & Albüm', 'sahra-davetiye' ), self::CAPABILITY, 'sahra-hesap', array( __CLASS__, 'page_inbox' ) );
		add_submenu_page( 'sahra-panel', __( 'Hesap Ayarları', 'sahra-davetiye' ), __( 'Hesap Ayarları', 'sahra-davetiye' ), self::CAPABILITY, 'sahra-ayarlar', array( __CLASS__, 'page_account' ) );

		if ( Sahra_Roles::is_manager() ) {
			/*
			 * Yetki `manage_options` DEĞİL, eklentinin kendi yetkisi.
			 * Öyleyken bu ekranlara yalnızca WordPress yöneticisi
			 * girebiliyordu; işletme yöneticisi rolü menüyü hiç
			 * görmüyordu.
			 */
			$y = Sahra_Roles::MANAGE;
			add_submenu_page( 'sahra-panel', __( 'Salonlar', 'sahra-davetiye' ), __( 'Salonlar', 'sahra-davetiye' ), $y, 'sahra-salonlar', array( __CLASS__, 'page_venues' ) );
			add_submenu_page( 'sahra-panel', __( 'Menüler', 'sahra-davetiye' ), __( 'Menüler', 'sahra-davetiye' ), $y, 'sahra-menuler', array( __CLASS__, 'page_menus' ) );
			add_submenu_page( 'sahra-panel', __( 'Çift Hesapları', 'sahra-davetiye' ), __( 'Çift Hesapları', 'sahra-davetiye' ), $y, 'sahra-hesaplar', array( __CLASS__, 'page_users' ) );
			add_submenu_page( 'sahra-panel', __( 'İşletme', 'sahra-davetiye' ), __( 'İşletme', 'sahra-davetiye' ), $y, 'sahra-isletme', array( __CLASS__, 'page_business' ) );
			add_submenu_page( 'sahra-panel', __( 'Depolama', 'sahra-davetiye' ), __( 'Depolama', 'sahra-davetiye' ), $y, 'sahra-depolama', array( __CLASS__, 'page_storage' ) );
		}

		/*
		 * İşletme yöneticisi hesaplarını yalnızca SİTE YÖNETİCİSİ açar.
		 *
		 * İşletme yöneticisinin kendi gibi yönetici üretmesi (ya da
		 * birbirlerini silmesi) istenen yetkinin dışında; o yüzden bu
		 * ekran `manage_options` ile korunuyor.
		 */
		if ( Sahra_Roles::is_site_admin() ) {
			add_submenu_page( 'sahra-panel', __( 'İşletme Yöneticileri', 'sahra-davetiye' ), __( 'İşletme Yöneticileri', 'sahra-davetiye' ), 'manage_options', 'sahra-yoneticiler', array( __CLASS__, 'page_managers' ) );
		}
	}

	/** Eklentinin kendi ekranında mıyız? */
	public static function is_our_screen() {
		$sayfa = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		return 0 === strpos( $sayfa, 'sahra-' );
	}

	/**
	 * Panelin kendi görünümü yalnızca kendi ekranlarında.
	 *
	 * Gövde sınıfı olmadan CSS'i yüklemek WordPress'in tamamını karartırdı.
	 */
	public static function body_class( $classes ) {
		return self::is_our_screen() ? $classes . ' sahra-ekran ' : $classes;
	}

	public static function assets( $hook ) {
		if ( ! self::is_our_screen() ) {
			return;
		}

		wp_enqueue_media();

		wp_enqueue_style(
			'sahra-admin-font',
			'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@200;300;400;500&display=swap&subset=latin,latin-ext',
			array(),
			null // phpcs:ignore
		);
		wp_enqueue_style( 'sahra-admin', SAHRA_URL . 'assets/css/admin.css', array( 'sahra-admin-font' ), SAHRA_VERSION );

		// QR kütüphanesi eklentiyle birlikte geliyor: CDN'e bağlamak,
		// internete kapalı kurulumlarda QR kodu sessizce öldürürdü.
		wp_enqueue_script( 'sahra-qrcode', SAHRA_URL . 'assets/js/vendor/qrcode.js', array(), '1.4.4', true );
		wp_enqueue_script( 'sahra-admin', SAHRA_URL . 'assets/js/admin.js', array( 'sahra-qrcode' ), SAHRA_VERSION, true );

		wp_localize_script(
			'sahra-admin',
			'SahraPanel',
			array(
				'rest'  => esc_url_raw( rest_url( Sahra_Rest::NS . '/' ) ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			)
		);
	}

	public static function notices() {
		if ( ! Sahra_Roles::is_manager() ) {
			return;
		}

		/*
		 * Kurulum engelleri her ekranda duyuruluyor, ayrıntı panelde.
		 * Panelin kendisinde tekrar etmiyor: liste zaten orada.
		 */
		$engel = Sahra_Health::blocking();
		if ( $engel && 'sahra-panel' !== ( isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '' ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			printf(
				'<div class="notice notice-error"><p><strong>%s</strong> %s <a href="%s">%s</a></p></div>',
				esc_html__( 'Sahra Davetiye — kurulum eksik:', 'sahra-davetiye' ),
				esc_html( $engel[0]['baslik'] ),
				esc_url( admin_url( 'admin.php?page=sahra-panel' ) ),
				esc_html__( 'Ayrıntılar', 'sahra-davetiye' )
			);
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
				esc_html__( 'Sahra Davetiye: henüz salon tanımlanmadı, davetiyelerde adres görünmeyecek.', 'sahra-davetiye' ),
				esc_url( admin_url( 'admin.php?page=sahra-salonlar' ) ),
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
			case 'save_guests':
				self::save_guests();
				break;
			case 'save_venue':
				self::save_venue();
				break;
			case 'refresh_venue_map':
				self::refresh_venue_map();
				break;
			case 'delete_venue':
				self::delete_venue();
				break;
			case 'save_menu':
				self::save_menu();
				break;
			case 'delete_menu':
				self::delete_menu();
				break;
			case 'save_business':
				self::save_business();
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
			case 'change_password':
				self::change_password();
				break;
			case 'toggle_invitation':
				self::toggle_invitation();
				break;
			case 'create_manager':
				self::create_manager();
				break;
			case 'reset_manager':
				self::reset_manager();
				break;
			case 'delete_manager':
				self::delete_manager();
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
		$ham['socialLinks']  = self::parse_rows( isset( $ham['socialText'] ) ? $ham['socialText'] : '', array( 'name', 'href' ) );
		$ham['menuGroups']   = Sahra_Fields::parse_menu( isset( $ham['menuText'] ) ? $ham['menuText'] : '' );
		unset( $ham['storyText'], $ham['socialText'], $ham['menuText'] );

		/*
		 * Görünürlük anahtarları da onay kutusu: gönderilmediğinde
		 * "kapalı" demektir. Aksi hâlde bir bölümü kapatmak mümkün
		 * olmuyordu — eksik alan "dokunulmadı" sayılıyor.
		 *
		 * showRsvp burada YOK: artık iki seçenekli bir radyo ve her
		 * zaman bir değer geliyor. Listede kalsaydı çiftin gönderisinde
		 * (alan hiç yokken) "kapalı" sayılıp yönetici ayarını
		 * eziyordu. giftEnabled ve wishesEnabled de radyo.
		 */
		foreach ( array(
			'showLetter', 'showStory', 'showDetails', 'showProgram', 'showGallery',
			'showLocation', 'showMenu', 'showFamily', 'showChildren',
			'showContact', 'showSocial', 'childrenWelcome',
		) as $anahtar ) {
			$ham[ $anahtar ] = ! empty( $ham[ $anahtar ] );
		}

		/*
		 * Sahip yalnızca YÖNETİCİDEN kabul edilir. Çift hesabı formu
		 * kurcalayıp davetiyesini başkasına devredemesin — ya da kendine
		 * başkasınınkini alamasın.
		 */
		$sahip = null;
		if ( Sahra_Roles::is_manager() && isset( $_POST['sahra_owner'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$sahip = self::valid_owner( (int) $_POST['sahra_owner'] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		}

		if ( $id ) {
			if ( ! Sahra_Invitation::can_edit( $id ) ) {
				wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
			}
			if ( null !== $sahip ) {
				$ham['ownerId'] = $sahip;
			}
			Sahra_Invitation::update( $id, $ham );
		} else {
			$yeni = Sahra_Invitation::create( $ham, null !== $sahip ? $sahip : get_current_user_id() );
			$id   = is_wp_error( $yeni ) ? 0 : $yeni['id'];
		}

		self::redirect( array( 'page' => 'sahra-davetiye-duzenle', 'id' => $id, 'kaydedildi' => 1 ) );
	}

	/**
	 * Davetli listesini kaydeder.
	 *
	 * Yetki DAVETİYE üzerinden: çift yalnızca kendi davetiyesinin
	 * listesini değiştirebiliyor. Sadece `CAPABILITY` bakılsaydı bir çift
	 * başka bir çiftin listesini yazabilirdi.
	 */
	private static function save_guests() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		check_admin_referer( 'sahra_save_guests' );

		$id = isset( $_POST['invitation_id'] ) ? (int) $_POST['invitation_id'] : 0; // phpcs:ignore
		if ( ! $id || ! Sahra_Invitation::can_edit( $id ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$metin = isset( $_POST['davetliler'] ) ? wp_unslash( $_POST['davetliler'] ) : ''; // phpcs:ignore
		$sonuc = Sahra_Guests::replace_from_text( $id, $metin );

		self::redirect( array( 'page' => 'sahra-davetliler', 'id' => $id, 'kaydedildi' => (int) $sonuc['eklendi'] + 1 ) );
	}

	private static function save_venue() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		$sonuc = Sahra_Settings::save_venue( wp_unslash( $_POST['venue'] ?? array() ) ); // phpcs:ignore
		if ( is_wp_error( $sonuc ) ) {
			self::redirect( array( 'page' => 'sahra-salonlar', 'hata' => rawurlencode( $sonuc->get_error_message() ) ) );
		}

		/*
		 * Harita görseli kayıtla birlikte üretiliyor: yönetici sonucu
		 * hemen görmeli. Üretim başarısızsa KAYIT düşmüyor — salonun
		 * adresi ve özellikleri haritadan bağımsız çalışıyor; bölüm
		 * eski adres paneline düşüyor ve sayfa nedenini yazıyor.
		 */
		$harita = Sahra_Harita::yenile( $sonuc, false );

		self::redirect(
			array(
				'page'       => 'sahra-salonlar',
				'kaydedildi' => 1,
				// false: anahtar adrese hiç yazılmıyor (add_query_arg).
				'harita'     => is_wp_error( $harita ) ? rawurlencode( $harita->get_error_message() ) : false,
			)
		);
	}

	/**
	 * Salonun harita görselini yeniden üretir.
	 *
	 * Koordinat da yeniden çözülüyor: yönetici linki düzeltip bu
	 * düğmeye basıyor. Elle yazılmış koordinat da bu yolla ezilebiliyor
	 * — düğmenin yanındaki not bunu söylüyor.
	 */
	private static function refresh_venue_map() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		$id     = sanitize_key( wp_unslash( $_POST['venue_id'] ?? '' ) ); // phpcs:ignore
		$sonuc  = Sahra_Harita::yenile( $id, true );

		if ( is_wp_error( $sonuc ) ) {
			self::redirect( array( 'page' => 'sahra-salonlar', 'salon' => $id, 'hata' => rawurlencode( $sonuc->get_error_message() ) ) );
		}
		self::redirect( array( 'page' => 'sahra-salonlar', 'salon' => $id, 'harita_yenilendi' => 1 ) );
	}

	private static function delete_venue() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		Sahra_Settings::delete_venue( sanitize_key( wp_unslash( $_POST['venue_id'] ?? '' ) ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-salonlar', 'silindi' => 1 ) );
	}

	private static function save_menu() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		$sonuc = Sahra_Settings::save_menu( wp_unslash( $_POST['menu'] ?? array() ) ); // phpcs:ignore
		if ( is_wp_error( $sonuc ) ) {
			self::redirect( array( 'page' => 'sahra-menuler', 'hata' => rawurlencode( $sonuc->get_error_message() ) ) );
		}
		self::redirect( array( 'page' => 'sahra-menuler', 'kaydedildi' => 1 ) );
	}

	private static function delete_menu() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		Sahra_Settings::delete_menu( sanitize_key( wp_unslash( $_POST['menu_id'] ?? '' ) ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-menuler', 'silindi' => 1 ) );
	}

	private static function save_business() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		Sahra_Settings::save_brand( wp_unslash( $_POST['brand'] ?? array() ) );         // phpcs:ignore
		Sahra_Settings::save_lifecycle( wp_unslash( $_POST['lifecycle'] ?? array() ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-isletme', 'kaydedildi' => 1 ) );
	}

	private static function save_storage() {
		if ( ! Sahra_Roles::is_manager() ) {
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
		if ( ! current_user_can( Sahra_Roles::ACCOUNTS ) ) {
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
		if ( ! current_user_can( Sahra_Roles::ACCOUNTS ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$id      = (int) ( $_POST['user_id'] ?? 0 ); // phpcs:ignore
		$hesap   = get_userdata( $id );
		if ( ! $hesap ) {
			self::redirect( array( 'page' => 'sahra-hesaplar' ) );
		}

		/*
		 * HEDEF gerçekten çift hesabı mı?
		 *
		 * Eskiden yalnızca yetki soruluyordu, hedef sorulmuyordu: bu
		 * ekrana giren biri hazırlanmış bir istekle SİTE YÖNETİCİSİNİN
		 * parolasını sıfırlayıp siteyi devralabilirdi. Yalnızca WordPress
		 * yöneticisi girdiği sürece görünmüyordu; işletme yöneticisi rolü
		 * eklendiğinde gerçek bir yetki yükseltmesi olurdu.
		 */
		if ( ! Sahra_Roles::is_couple( $id ) ) {
			self::redirect( array( 'page' => 'sahra-hesaplar', 'hata' => rawurlencode( __( 'Bu hesap bir çift hesabı değil.', 'sahra-davetiye' ) ) ) );
		}

		$parola = wp_generate_password( 14, false );
		wp_set_password( $parola, $id );

		set_transient( 'sahra_cred_' . get_current_user_id(), array( 'user' => $hesap->user_login, 'pass' => $parola ), 5 * MINUTE_IN_SECONDS );
		self::redirect( array( 'page' => 'sahra-hesaplar', 'yeni' => 1 ) );
	}

	/**
	 * Seçilen sahip gerçekten bir çift hesabı mı?
	 *
	 * 0 → "bende kalsın": davetiye yöneticinin üstünde durur.
	 * Bilinmeyen ya da çift olmayan bir kimlik sessizce yöneticiye düşer;
	 * hazırlanmış bir istekle davetiye rastgele bir kullanıcıya
	 * yazılamamalı.
	 */
	private static function valid_owner( $user_id ) {
		if ( $user_id <= 0 ) {
			return get_current_user_id();
		}
		return Sahra_Roles::is_couple( $user_id ) ? $user_id : get_current_user_id();
	}

	private static function delete_user() {
		if ( ! current_user_can( Sahra_Roles::ACCOUNTS ) ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$id = (int) ( $_POST['user_id'] ?? 0 ); // phpcs:ignore

		// Yalnızca ÇİFT hesapları silinir — bkz. reset_password().
		if ( ! Sahra_Roles::is_couple( $id ) ) {
			self::redirect( array( 'page' => 'sahra-hesaplar', 'hata' => rawurlencode( __( 'Bu hesap bir çift hesabı değil.', 'sahra-davetiye' ) ) ) );
		}

		require_once ABSPATH . 'wp-admin/includes/user.php';
		wp_delete_user( $id );
		self::redirect( array( 'page' => 'sahra-hesaplar', 'silindi' => 1 ) );
	}

	/** Yayına alma / yayından kaldırma — yalnızca yönetici. */
	private static function toggle_invitation() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$id  = (int) ( $_POST['invitation_id'] ?? 0 ); // phpcs:ignore
		$mev = Sahra_Invitation::get( $id );
		if ( $mev ) {
			Sahra_Invitation::update( $id, array( 'isActive' => ! $mev['isActive'] ) );
		}

		self::redirect( array( 'page' => 'sahra-panel' ) );
	}

	private static function delete_invitation() {
		if ( ! Sahra_Roles::is_manager() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		Sahra_Invitation::delete( (int) ( $_POST['invitation_id'] ?? 0 ) ); // phpcs:ignore
		self::redirect( array( 'page' => 'sahra-panel', 'silindi' => 1 ) );
	}

	/**
	 * Kendi parolasını değiştirme.
	 *
	 * Mevcut parola soruluyor: çerezi ele geçiren biri parolayı da
	 * değiştirip hesabı devralamasın.
	 */
	private static function change_password() {
		$kullanici = wp_get_current_user();
		if ( ! $kullanici || ! $kullanici->ID ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$mevcut = (string) ( $_POST['current_password'] ?? '' ); // phpcs:ignore
		$yeni   = (string) ( $_POST['new_password'] ?? '' ); // phpcs:ignore
		$tekrar = (string) ( $_POST['repeat_password'] ?? '' ); // phpcs:ignore

		if ( ! wp_check_password( $mevcut, $kullanici->user_pass, $kullanici->ID ) ) {
			self::redirect( array( 'page' => 'sahra-ayarlar', 'hata' => rawurlencode( __( 'Mevcut parola yanlış.', 'sahra-davetiye' ) ) ) );
		}

		if ( strlen( $yeni ) < 8 ) {
			self::redirect( array( 'page' => 'sahra-ayarlar', 'hata' => rawurlencode( __( 'Yeni parola en az 8 karakter olmalı.', 'sahra-davetiye' ) ) ) );
		}

		if ( $yeni !== $tekrar ) {
			self::redirect( array( 'page' => 'sahra-ayarlar', 'hata' => rawurlencode( __( 'Yeni parolalar birbiriyle uyuşmuyor.', 'sahra-davetiye' ) ) ) );
		}

		wp_set_password( $yeni, $kullanici->ID );
		// Parola değişince WordPress oturumu düşürüyor; kullanıcı burada
		// kalabilsin diye çerez yenileniyor.
		wp_set_auth_cookie( $kullanici->ID, false );

		self::redirect( array( 'page' => 'sahra-ayarlar', 'kaydedildi' => 1 ) );
	}

	/* ------------------------------------------------------- metin ↔ dizi */

	private static function split_lines( $metin ) {
		$satirlar = preg_split( '/\R/', (string) $metin );
		return array_values( array_filter( array_map( 'trim', $satirlar ) ) );
	}

	/**
	 * "a | b | c" biçimindeki satırları nesne dizisine çevirir.
	 *
	 * Program/hikaye için ayrı ayrı tekrarlayıcı arayüz yazmak yerine
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
			array( 'id' => 0, 'slug' => '', 'isActive' => true, 'venueFeatures' => array() )
		);

		/*
		 * Olmayan davetiye: `get()` null döner ve şablon her alanı null
		 * üzerinde okumaya çalışıp sayfayı uyarı çöplüğüne çevirirdi.
		 *
		 * Bu artık uç bir durum değil: günlük bakım süresi dolan
		 * davetiyeleri kendisi siliyor, yani çiftin yer imi ya da
		 * yöneticinin açık sekmesi bir sabah geçersiz olabiliyor.
		 * Yetki hatası da denemez — davetiye gerçekten yok.
		 */
		if ( ! $d ) {
			wp_die(
				esc_html__( 'Bu davetiye bulunamadı. Süresi dolduğu için silinmiş olabilir.', 'sahra-davetiye' ),
				esc_html__( 'Davetiye bulunamadı', 'sahra-davetiye' ),
				array(
					'response'  => 404,
					'back_link' => true,
				)
			);
		}

		$metinler = array(
			'gallery' => implode( "\n", (array) $d['galleryImages'] ),
			'story'   => self::rows_to_text( $d['storyItems'], array( 'year', 'title', 'desc' ) ),
			'menu'    => Sahra_Fields::menu_to_text( $d['menuGroups'] ),
			'social'  => self::rows_to_text( $d['socialLinks'], array( 'name', 'href' ) ),
		);

		include SAHRA_DIR . 'templates/admin-edit.php';
	}

	public static function page_venues() {
		/*
		 * Harita görseli BURADA ÜRETİLMİYOR.
		 *
		 * İlk hâlinde sayfa açılırken eksik haritalar tamamlanıyordu;
		 * her salon iki ağ isteği demek ve denetim ortamındaki 96 salon
		 * sayfayı dakikalarca açtırmadı. Üretim üç yerden koşuyor:
		 * salon kaydedilirken, "Haritayı Yenile" düğmesiyle ve günlük
		 * bakımda (Sahra_Harita::bakim). Sayfa yalnızca SONUCU
		 * gösteriyor.
		 */
		$salonlar = Sahra_Settings::venues();
		$duzenle  = isset( $_GET['salon'] ) ? Sahra_Settings::venue_by_id( sanitize_key( wp_unslash( $_GET['salon'] ) ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification
		$venue    = $duzenle ? $duzenle : Sahra_Settings::empty_venue();
		include SAHRA_DIR . 'templates/admin-venues.php';
	}

	public static function page_menus() {
		$menuler = Sahra_Settings::menus();
		$duzenle = isset( $_GET['menu'] ) ? Sahra_Settings::menu_by_id( sanitize_key( wp_unslash( $_GET['menu'] ) ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification
		$menu    = $duzenle ? $duzenle : Sahra_Settings::empty_menu();
		include SAHRA_DIR . 'templates/admin-menus.php';
	}

	public static function page_business() {
		$brand     = Sahra_Settings::brand();
		$lifecycle = Sahra_Settings::lifecycle();
		include SAHRA_DIR . 'templates/admin-business.php';
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

	/**
	 * İşletme yöneticisi hesapları.
	 *
	 * Eklentideki her şeye erişen, WordPress'in geri kalanına hiç
	 * erişmeyen hesaplar. Yalnızca SİTE yöneticisi açar (bkz. menu()).
	 */
	public static function page_managers() {
		if ( ! Sahra_Roles::is_site_admin() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		$hesaplar = get_users( array( 'role' => Sahra_Roles::MANAGER ) );
		$kimlik   = get_transient( 'sahra_cred_' . get_current_user_id() );
		if ( $kimlik ) {
			delete_transient( 'sahra_cred_' . get_current_user_id() );
		}
		include SAHRA_DIR . 'templates/admin-managers.php';
	}

	private static function create_manager() {
		if ( ! Sahra_Roles::is_site_admin() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}

		$kullanici = sanitize_user( wp_unslash( $_POST['username'] ?? '' ), true ); // phpcs:ignore
		$ad        = sanitize_text_field( wp_unslash( $_POST['display_name'] ?? '' ) ); // phpcs:ignore
		$eposta    = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) ); // phpcs:ignore

		if ( '' === $kullanici ) {
			self::redirect( array( 'page' => 'sahra-yoneticiler', 'hata' => rawurlencode( __( 'Kullanıcı adı zorunlu.', 'sahra-davetiye' ) ) ) );
		}

		$parola = wp_generate_password( 14, false );

		$id = wp_insert_user(
			array(
				'user_login'   => $kullanici,
				'user_pass'    => $parola,
				'user_email'   => $eposta ? $eposta : '',
				'display_name' => $ad ? $ad : $kullanici,
				'role'         => Sahra_Roles::MANAGER,
			)
		);

		if ( is_wp_error( $id ) ) {
			self::redirect( array( 'page' => 'sahra-yoneticiler', 'hata' => rawurlencode( $id->get_error_message() ) ) );
		}

		set_transient( 'sahra_cred_' . get_current_user_id(), array( 'user' => $kullanici, 'pass' => $parola ), 5 * MINUTE_IN_SECONDS );
		self::redirect( array( 'page' => 'sahra-yoneticiler', 'yeni' => 1 ) );
	}

	/**
	 * Hedefin gerçekten İŞLETME YÖNETİCİSİ olduğu doğrulanır.
	 *
	 * Yetki sorup hedefi sormamak, hazırlanmış bir istekle başka bir
	 * kullanıcıya (site yöneticisine) dokunmak demekti.
	 */
	private static function manager_target() {
		$id = (int) ( $_POST['user_id'] ?? 0 ); // phpcs:ignore
		if ( ! $id || ! user_can( $id, Sahra_Roles::MANAGE ) || Sahra_Roles::is_site_admin( $id ) ) {
			self::redirect( array( 'page' => 'sahra-yoneticiler', 'hata' => rawurlencode( __( 'Bu hesap bir işletme yöneticisi değil.', 'sahra-davetiye' ) ) ) );
		}
		return $id;
	}

	private static function reset_manager() {
		if ( ! Sahra_Roles::is_site_admin() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		$id    = self::manager_target();
		$hesap = get_userdata( $id );

		$parola = wp_generate_password( 14, false );
		wp_set_password( $parola, $id );

		set_transient( 'sahra_cred_' . get_current_user_id(), array( 'user' => $hesap->user_login, 'pass' => $parola ), 5 * MINUTE_IN_SECONDS );
		self::redirect( array( 'page' => 'sahra-yoneticiler', 'yeni' => 1 ) );
	}

	private static function delete_manager() {
		if ( ! Sahra_Roles::is_site_admin() ) {
			wp_die( esc_html__( 'Yetkiniz yok.', 'sahra-davetiye' ) );
		}
		$id = self::manager_target();

		require_once ABSPATH . 'wp-admin/includes/user.php';
		wp_delete_user( $id );
		self::redirect( array( 'page' => 'sahra-yoneticiler', 'silindi' => 1 ) );
	}

	public static function page_account() {
		include SAHRA_DIR . 'templates/admin-account.php';
	}

	/**
	 * Davetli listesi ekranı.
	 *
	 * Davetiye seçiliyor, liste metin olarak giriliyor ve karşısında
	 * kimin cevap verdiği duruyor. Liste MİSAFİRE gösterilmiyor —
	 * davetiye şablonu bu tabloya hiç bakmıyor.
	 */
	public static function page_guests() {
		$davetiyeler = Sahra_Invitation::all_for_user();

		$id = isset( $_GET['id'] ) ? (int) $_GET['id'] : 0; // phpcs:ignore WordPress.Security.NonceVerification
		if ( ! $id || ! Sahra_Invitation::can_edit( $id ) ) {
			// Seçim yoksa çiftin ilk davetiyesi: boş bir ekran işe yaramıyor.
			$id = $davetiyeler ? (int) $davetiyeler[0]['id'] : 0;
		}

		$secili = $id ? Sahra_Invitation::get( $id ) : null;
		$metin  = $id ? Sahra_Guests::to_text( $id ) : '';
		$durum  = $id ? Sahra_Guests::reconcile( $id ) : null;

		include SAHRA_DIR . 'templates/admin-guests.php';
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
