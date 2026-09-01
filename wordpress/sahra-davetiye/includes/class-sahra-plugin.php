<?php
/**
 * Kancaların bağlandığı yer.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Plugin {

	private static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', array( $this, 'init' ) );
		add_filter( 'query_vars', array( 'Sahra_Render', 'add_query_vars' ) );

		// Tema hiçbir şey çizmeden devralınmalı; şablon tam sayfa.
		add_action( 'template_redirect', array( 'Sahra_Render', 'dispatch' ), 1 );

		add_action( 'rest_api_init', array( 'Sahra_Rest', 'register_routes' ) );

		add_action( 'admin_menu', array( 'Sahra_Admin', 'menu' ) );
		add_action( 'admin_init', array( 'Sahra_Roles', 'guard_admin' ) );
		add_action( 'admin_init', array( 'Sahra_Admin', 'handle_post' ) );
		add_action( 'admin_enqueue_scripts', array( 'Sahra_Admin', 'assets' ) );
		add_filter( 'admin_body_class', array( 'Sahra_Admin', 'body_class' ) );
		add_action( 'admin_notices', array( 'Sahra_Admin', 'notices' ) );
		add_action( 'init', array( 'Sahra_Roles', 'trim_admin_ui' ) );

		// Çift hesabı giriş sonrası kendi paneline gitsin.
		add_filter( 'login_redirect', array( $this, 'login_redirect' ), 10, 3 );

		/*
		 * Giriş ekranı: WordPress'in mavi formu yerine Sahra'nın kendi
		 * sayfası. Filtre, panelin "Çıkış" bağlantısından hesap kartındaki
		 * "Giriş linki"ne kadar her yeri tek noktadan düzeltiyor.
		 */
		add_filter( 'login_url', array( 'Sahra_Login', 'filter_login_url' ), 10, 3 );
		add_filter( 'logout_redirect', array( 'Sahra_Login', 'filter_logout_redirect' ), 10, 3 );
		add_action( 'login_init', array( 'Sahra_Login', 'redirect_wp_login' ) );

		// Davetiye silinince katılım/dilek/fotoğrafları da gitsin.
		add_action( 'before_delete_post', array( $this, 'on_delete_post' ) );
		add_action( 'deleted_user', array( $this, 'on_delete_user' ) );
	}

	public function init() {
		Sahra_Invitation::register_post_type();
		Sahra_Render::add_rewrite_rules();
		Sahra_Render::maybe_flush();
		Sahra_Tables::maybe_upgrade();
	}

	public function login_redirect( $redirect_to, $requested, $user ) {
		if ( is_wp_error( $user ) || ! $user instanceof WP_User ) {
			return $redirect_to;
		}
		if ( user_can( $user, 'sahra_edit_invitations' ) && ! Sahra_Roles::is_manager( $user->ID ) ) {
			return admin_url( 'admin.php?page=sahra-panel' );
		}
		return $redirect_to;
	}

	public function on_delete_post( $post_id ) {
		if ( Sahra_Invitation::POST_TYPE === get_post_type( $post_id ) ) {
			Sahra_Tables::purge_invitation( $post_id );
		}
	}

	/**
	 * Hesap silinince davetiyeleri de gider.
	 *
	 * Next sürümünde bu kademeli silme başta yoktu: hesap siliniyor,
	 * davetiyesi yayında kalmaya devam ediyordu.
	 */
	public function on_delete_user( $user_id ) {
		$davetiyeler = get_posts(
			array(
				'post_type'      => Sahra_Invitation::POST_TYPE,
				'author'         => (int) $user_id,
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
			)
		);

		foreach ( $davetiyeler as $id ) {
			Sahra_Invitation::delete( $id );
		}
	}
}
