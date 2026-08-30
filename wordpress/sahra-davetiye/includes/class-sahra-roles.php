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

	public static function install() {
		remove_role( self::COUPLE );

		add_role(
			self::COUPLE,
			__( 'Davetiye Sahibi (Çift)', 'sahra-davetiye' ),
			array(
				'read'                     => true,
				'sahra_edit_invitations'   => true,
				'sahra_upload_media'       => true,
			)
		);

		$yonetici = get_role( 'administrator' );
		if ( $yonetici ) {
			$yonetici->add_cap( 'sahra_edit_invitations' );
			$yonetici->add_cap( 'sahra_manage_invitations' );
			$yonetici->add_cap( 'sahra_upload_media' );
		}
	}

	/** Yönetici mi? */
	public static function is_manager( $user_id = null ) {
		$user_id = $user_id ? (int) $user_id : get_current_user_id();
		return user_can( $user_id, 'sahra_manage_invitations' ) || user_can( $user_id, 'manage_options' );
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
		if ( ! self::is_couple() ) {
			return;
		}

		$ekran = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		$izin  = array( 'sahra-panel', 'sahra-davetiye-duzenle', 'sahra-hesap' );

		if ( in_array( $ekran, $izin, true ) ) {
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
