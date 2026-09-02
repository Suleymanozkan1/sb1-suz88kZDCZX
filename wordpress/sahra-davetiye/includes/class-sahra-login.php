<?php
/**
 * Çiftin giriş ekranı — /davet/giris
 *
 * Çifte wp-login.php'yi göstermek istemiyoruz: mavi WordPress logosu,
 * "Beni hatırla", "Parolanızı mı unuttunuz?" ve site adına dönüş
 * bağlantısıyla müşteriye "size bir davetiye ürünü sattık" değil "size
 * bir WordPress kurulumu verdik" diyor. Bu yüzden çifte verdiğimiz adres
 * burası.
 *
 * Ama bu ekran GENEL GİRİŞİN YERİNE GEÇMİYOR. wp-login.php olduğu gibi
 * duruyor ve WordPress'in ürettiği giriş bağlantılarına dokunulmuyor:
 * site sahibi kendi sitesine her zamanki gibi giriyor, eklenti onun
 * yönetim girişini devralmıyor. Bir dönem wp-login.php buraya
 * yönlendiriliyordu; bu, çifte ait bir ekranı herkese dayatmaktı.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Login {

	const SLUG = 'davet/giris';

	/** Giriş sayfasının adresi. */
	public static function url( $redirect_to = '' ) {
		$adres = home_url( '/' . self::SLUG );
		if ( $redirect_to ) {
			$adres = add_query_arg( 'redirect_to', rawurlencode( $redirect_to ), $adres );
		}
		return $adres;
	}

	/**
	 * Çıkıştan sonra çift kendi kapısına döner.
	 *
	 * Yalnızca ÇİFT için: yöneticinin çıkışı WordPress'in kendi akışında
	 * kalıyor, yoksa site sahibi kendi panelinden çıkınca müşteri ekranına
	 * düşerdi.
	 */
	public static function filter_logout_redirect( $redirect_to, $requested, $user ) {
		if ( $requested ) {
			return $requested;
		}
		$uid = $user instanceof WP_User ? $user->ID : 0;
		return ( $uid && Sahra_Roles::is_couple( $uid ) && ! Sahra_Roles::is_manager( $uid ) )
			? self::url()
			: $redirect_to;
	}

	/**
	 * Sayfayı çizer; POST ise önce girişi dener.
	 *
	 * `template_redirect` üzerinde çalışıyor: henüz hiçbir çıktı
	 * verilmediği için oturum çerezi başlıkla birlikte gidebiliyor.
	 */
	public static function render() {
		$hata  = '';
		$hedef = self::requested_redirect();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['sahra_login'] ) ) {
			$hata = self::attempt( $hedef );
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		if ( is_user_logged_in() ) {
			wp_safe_redirect( $hedef ? $hedef : self::home_for_user() );
			exit;
		}

		status_header( 200 );
		nocache_headers();
		include SAHRA_DIR . 'templates/login.php';
		exit;
	}

	/**
	 * Girişi dener. Başarılıysa yönlendirir, başarısızsa mesaj döndürür.
	 */
	private static function attempt( $hedef ) {
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$nonce = isset( $_POST['_sahra_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['_sahra_nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'sahra_login' ) ) {
			// Form sayfada çok uzun beklemiş olabilir; suçlama, yeniden dene.
			return __( 'Oturum süresi doldu. Lütfen tekrar deneyin.', 'sahra-davetiye' );
		}

		$kullanici = isset( $_POST['log'] ) ? sanitize_user( wp_unslash( $_POST['log'] ), false ) : '';
		$parola    = isset( $_POST['pwd'] ) ? (string) wp_unslash( $_POST['pwd'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		if ( '' === $kullanici || '' === $parola ) {
			return __( 'Kullanıcı adı ve parola gerekli.', 'sahra-davetiye' );
		}

		$sonuc = wp_signon(
			array(
				'user_login'    => $kullanici,
				'user_password' => $parola,
				'remember'      => true,
			),
			is_ssl()
		);

		if ( is_wp_error( $sonuc ) ) {
			/*
			 * Hangi yarının yanlış olduğu SÖYLENMİYOR. WordPress'in kendi
			 * mesajı "Bilinmeyen kullanıcı adı" diyerek hangi hesapların
			 * var olduğunu dışarı sızdırıyor; bu sayfanın adresi ise
			 * müşteriye açıkça veriliyor.
			 */
			return __( 'Kullanıcı adı veya parola hatalı.', 'sahra-davetiye' );
		}

		wp_set_current_user( $sonuc->ID );

		wp_safe_redirect( $hedef ? $hedef : self::home_for_user( $sonuc->ID ) );
		exit;
	}

	/** Rolün kendi başlangıç ekranı. */
	public static function home_for_user( $user_id = null ) {
		if ( Sahra_Roles::is_manager( $user_id ) || Sahra_Roles::is_couple( $user_id ) ) {
			return admin_url( 'admin.php?page=sahra-panel' );
		}
		return admin_url();
	}

	/** İstenen hedef — yalnızca bu siteye ait olması şartıyla. */
	private static function requested_redirect() {
		// phpcs:disable WordPress.Security.NonceVerification
		$ham = '';
		if ( isset( $_POST['redirect_to'] ) ) {
			$ham = esc_url_raw( wp_unslash( $_POST['redirect_to'] ) );
		} elseif ( isset( $_GET['redirect_to'] ) ) {
			$ham = esc_url_raw( wp_unslash( $_GET['redirect_to'] ) );
		}
		// phpcs:enable WordPress.Security.NonceVerification

		if ( ! $ham ) {
			return '';
		}
		// Açık yönlendirme olmasın: site dışına çıkan hedef atılır.
		return wp_validate_redirect( $ham, '' );
	}
}
