<?php
/**
 * Roller.
 *
 * Next sürümündeki üç rolün karşılığı:
 *   admin   → WordPress yöneticisi (manage_options)
 *   user    → sahra_cift: yalnızca kendi davetiyesini düzenler
 *   misafir → oturumsuz; yalnızca QR ile fotoğraf yükleyebilir
 *
 * Çift rolü bilerek `subscriber` üzerine kurulu: WordPress panelinin geri
 * kalanına (yazı, medya kütüphanesi, eklenti) hiçbir erişimi olmamalı.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Roles {

	const COUPLE = 'sahra_cift';

	/**
	 * İşletme yöneticisi rolü.
	 *
	 * Eklentideki her şeye erişir, WordPress'in geri kalanına hiç
	 * erişmez. Bu rol olmadan tek seçenek kişiyi WordPress YÖNETİCİSİ
	 * yapmaktı: o zaman eklentiler, temalar, bütün kullanıcılar ve site
	 * ayarları da eline geçiyordu — istenen bu değil.
	 *
	 * `subscriber` gibi sıfırdan kuruluyor: WordPress yetkisi verilmiyor,
	 * yalnızca eklentinin kendi yetkileri.
	 */
	const MANAGER = 'sahra_isletme';

	/** Eklentinin yönetim yetkisi (salon, menü, işletme, depolama…). */
	const MANAGE = 'sahra_manage_invitations';

	/**
	 * ÇİFT hesabı açma/sıfırlama/silme yetkisi.
	 *
	 * WordPress'in `create_users`/`edit_users`/`delete_users` yetkileri
	 * bu iş için kullanılmaz: onlar HER kullanıcıyı kapsıyor, işletme
	 * yöneticisi yöneticinin parolasını sıfırlayıp siteyi devralabilirdi.
	 * Bu yetki yalnızca çift hesaplarını kapsıyor; hedefin gerçekten çift
	 * olduğu `Sahra_Admin` tarafında ayrıca doğrulanıyor.
	 */
	const ACCOUNTS = 'sahra_manage_accounts';

	/** Rol sürümü: değişince roller yeniden kurulur. */
	const VERSION = '1.1.0';

	public static function install() {
		remove_role( self::COUPLE );
		remove_role( self::MANAGER );

		add_role(
			self::COUPLE,
			__( 'Davetiye Sahibi (Çift)', 'sahra-davetiye' ),
			array(
				'read'                     => true,
				'sahra_edit_invitations'   => true,
				'sahra_upload_media'       => true,
			)
		);

		add_role(
			self::MANAGER,
			__( 'Sahra İşletme Yöneticisi', 'sahra-davetiye' ),
			array(
				'read'                   => true,
				'sahra_edit_invitations' => true,
				'sahra_upload_media'     => true,
				self::MANAGE             => true,
				self::ACCOUNTS           => true,
			)
		);

		$yonetici = get_role( 'administrator' );
		if ( $yonetici ) {
			$yonetici->add_cap( 'sahra_edit_invitations' );
			$yonetici->add_cap( self::MANAGE );
			$yonetici->add_cap( self::ACCOUNTS );
			$yonetici->add_cap( 'sahra_upload_media' );
		}

		update_option( 'sahra_roles_version', self::VERSION );
	}

	/**
	 * Eklenti güncellendiğinde rolleri yakalar.
	 *
	 * `install()` yalnızca etkinleştirmede koşuyor; zip üzerine
	 * yazıldığında yeni rol hiç oluşmuyor ve ekran "yetkiniz yok" diyordu.
	 */
	public static function maybe_upgrade() {
		if ( get_option( 'sahra_roles_version' ) !== self::VERSION ) {
			self::install();
		}
	}

	/** Sitenin WordPress yöneticisi mi? (işletme yöneticisi DEĞİL) */
	public static function is_site_admin( $user_id = null ) {
		$user_id = $user_id ? (int) $user_id : get_current_user_id();
		return user_can( $user_id, 'manage_options' );
	}

	/** Yönetici mi? */
	public static function is_manager( $user_id = null ) {
		$user_id = $user_id ? (int) $user_id : get_current_user_id();
		return user_can( $user_id, self::MANAGE ) || user_can( $user_id, 'manage_options' );
	}

	/** Çift hesabı mı? */
	public static function is_couple( $user_id = null ) {
		$user_id = $user_id ? (int) $user_id : get_current_user_id();
		return user_can( $user_id, 'sahra_edit_invitations' ) && ! self::is_manager( $user_id );
	}

	/**
	 * Çift hesabının WordPress panelinin geri kalanına girmesini engeller.
	 *
	 * Rolde yetki vermemek yeterli değil: /wp-admin açıldığında çift boş bir
	 * gösterge paneli görüyor ve "yanlış yere geldim" hissi veriyordu.
	 * Doğrudan davetiye ekranına yönlendiriliyor.
	 */
	public static function guard_admin() {
		if ( ! is_admin() || wp_doing_ajax() || ! is_user_logged_in() ) {
			return;
		}
		/*
		 * Site yöneticisine dokunulmaz; geri kalan eklenti kullanıcıları
		 * (çift ve İŞLETME YÖNETİCİSİ) eklentinin ekranlarıyla sınırlı.
		 * İşletme yöneticisi de WordPress'in gösterge panelinde,
		 * yazılarda, eklentilerde işi yok.
		 */
		if ( self::is_site_admin() ) {
			return;
		}
		if ( ! self::is_couple() && ! self::is_manager() ) {
			return;
		}

		$ekran = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification

		// İzinli ekranların listesi Sahra_Admin'de, menüyle aynı yerde.
		$izinli = self::is_manager()
			? array_merge( Sahra_Admin::COUPLE_PAGES, Sahra_Admin::MANAGER_PAGES )
			: Sahra_Admin::COUPLE_PAGES;

		if ( in_array( $ekran, $izinli, true ) ) {
			return;
		}

		wp_safe_redirect( admin_url( 'admin.php?page=sahra-panel' ) );
		exit;
	}

	/** Çift için gereksiz panel bileşenlerini kaldırır. */
	public static function trim_admin_ui() {
		if ( ! self::is_couple() ) {
			return;
		}
		show_admin_bar( false );
		remove_action( 'welcome_panel', 'wp_welcome_panel' );
	}
}
