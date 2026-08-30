<?php
/**
 * Katılım, dilek ve fotoğraf tabloları.
 *
 * Bunlar bilerek özel tablo; custom post type değil. Tek düğünde binlerce
 * katılım ve fotoğraf kaydı oluşuyor ve hepsi `wp_posts` + `wp_postmeta`
 * içine konsaydı sitenin tamamının sorguları yavaşlardı. Ayrıca bu kayıtlar
 * WordPress'in düzenleyicisinde görünmesi istenen içerik değil.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Tables {

	const DB_VERSION = '1.0.0';

	public static function rsvps() {
		global $wpdb;
		return $wpdb->prefix . 'sahra_rsvps';
	}

	public static function wishes() {
		global $wpdb;
		return $wpdb->prefix . 'sahra_wishes';
	}

	public static function photos() {
		global $wpdb;
		return $wpdb->prefix . 'sahra_photos';
	}

	/** dbDelta ile kurulum; sürüm değişince yeniden çalışır. */
	public static function install() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$collate = $wpdb->get_charset_collate();

		$rsvps  = self::rsvps();
		$wishes = self::wishes();
		$photos = self::photos();

		dbDelta(
			"CREATE TABLE {$rsvps} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				invitation_id bigint(20) unsigned NOT NULL,
				name varchar(191) NOT NULL DEFAULT '',
				phone varchar(64) NOT NULL DEFAULT '',
				guest_count varchar(8) NOT NULL DEFAULT '1',
				attending tinyint(1) NOT NULL DEFAULT 1,
				song_request varchar(191) NOT NULL DEFAULT '',
				note text NOT NULL,
				created_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY invitation_id (invitation_id)
			) {$collate};"
		);

		dbDelta(
			"CREATE TABLE {$wishes} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				invitation_id bigint(20) unsigned NOT NULL,
				name varchar(191) NOT NULL DEFAULT '',
				message text NOT NULL,
				approved tinyint(1) NOT NULL DEFAULT 0,
				created_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY invitation_id (invitation_id),
				KEY approved (approved)
			) {$collate};"
		);

		dbDelta(
			"CREATE TABLE {$photos} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				invitation_id bigint(20) unsigned NOT NULL,
				uploader_name varchar(191) NOT NULL DEFAULT '',
				note varchar(255) NOT NULL DEFAULT '',
				storage varchar(20) NOT NULL DEFAULT 'local',
				file_id varchar(255) NOT NULL,
				mime_type varchar(100) NOT NULL DEFAULT '',
				size bigint(20) unsigned NOT NULL DEFAULT 0,
				created_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY invitation_id (invitation_id)
			) {$collate};"
		);

		update_option( 'sahra_db_version', self::DB_VERSION );
	}

	/** Eklenti güncellendiğinde şemayı yakalar. */
	public static function maybe_upgrade() {
		if ( get_option( 'sahra_db_version' ) !== self::DB_VERSION ) {
			self::install();
		}
	}

	/**
	 * Davetiye silindiğinde ona bağlı her şey de gider.
	 *
	 * Next sürümünde bu kademeli silme unutulmuştu ve hesap silindiğinde
	 * katılımlar, fotoğraflar ve dosyalar veritabanında öksüz kalıyordu.
	 */
	public static function purge_invitation( $invitation_id ) {
		global $wpdb;

		$invitation_id = (int) $invitation_id;

		$dosyalar = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT file_id, storage FROM ' . self::photos() . ' WHERE invitation_id = %d', // phpcs:ignore
				$invitation_id
			)
		);
		foreach ( $dosyalar as $dosya ) {
			Sahra_Storage::delete( $dosya->file_id );
		}

		$wpdb->delete( self::photos(), array( 'invitation_id' => $invitation_id ), array( '%d' ) ); // phpcs:ignore
		$wpdb->delete( self::rsvps(), array( 'invitation_id' => $invitation_id ), array( '%d' ) ); // phpcs:ignore
		$wpdb->delete( self::wishes(), array( 'invitation_id' => $invitation_id ), array( '%d' ) ); // phpcs:ignore
	}
}
