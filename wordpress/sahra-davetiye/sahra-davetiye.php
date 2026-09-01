<?php
/**
 * Plugin Name:       Sahra Davetiye
 * Plugin URI:        https://github.com/Suleymanozkan1/sb1-suz88kZDCZX
 * Description:       Perde açılışı ve balmumu mühür girişiyle açılan, panelden yönetilen dijital düğün davetiyesi. Next.js sürümünün WordPress karşılığı.
 * Version:           1.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Sahra Davetiye
 * Text Domain:       sahra-davetiye
 * Domain Path:       /languages
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

define( 'SAHRA_VERSION', '1.1.0' );
define( 'SAHRA_FILE', __FILE__ );
define( 'SAHRA_DIR', plugin_dir_path( __FILE__ ) );
define( 'SAHRA_URL', plugin_dir_url( __FILE__ ) );

/*
 * Yükleme sırası önemli: depolama arayüzü sürücülerden, alan şeması da
 * şemayı okuyan her şeyden önce gelmeli.
 */
require_once SAHRA_DIR . 'includes/class-sahra-fields.php';
require_once SAHRA_DIR . 'includes/storage/interface-sahra-storage.php';
require_once SAHRA_DIR . 'includes/storage/class-sahra-storage-local.php';
require_once SAHRA_DIR . 'includes/storage/class-sahra-storage-drive.php';
require_once SAHRA_DIR . 'includes/class-sahra-storage.php';
require_once SAHRA_DIR . 'includes/class-sahra-tables.php';
require_once SAHRA_DIR . 'includes/class-sahra-settings.php';
require_once SAHRA_DIR . 'includes/class-sahra-roles.php';
require_once SAHRA_DIR . 'includes/class-sahra-invitation.php';
require_once SAHRA_DIR . 'includes/class-sahra-theme.php';
require_once SAHRA_DIR . 'includes/class-sahra-rest.php';
require_once SAHRA_DIR . 'includes/class-sahra-og-image.php';
require_once SAHRA_DIR . 'includes/class-sahra-lifecycle.php';
require_once SAHRA_DIR . 'includes/class-sahra-login.php';
require_once SAHRA_DIR . 'includes/class-sahra-render.php';
require_once SAHRA_DIR . 'includes/class-sahra-form.php';
require_once SAHRA_DIR . 'includes/class-sahra-admin.php';
require_once SAHRA_DIR . 'includes/class-sahra-plugin.php';

/**
 * Etkinleştirme.
 *
 * Tablolar, rol ve yeniden yazma kuralları burada kurulur. Kuralları
 * kaydetmeden `flush_rewrite_rules()` çağırmak işe yaramaz; önce kayıt,
 * sonra temizleme.
 */
function sahra_activate() {
	Sahra_Tables::install();
	Sahra_Roles::install();
	Sahra_Invitation::register_post_type();
	Sahra_Render::add_rewrite_rules();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'sahra_activate' );

/** Devre dışı bırakma — kurallar temizlenir, veri durur. */
function sahra_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'sahra_deactivate' );

Sahra_Plugin::instance();
