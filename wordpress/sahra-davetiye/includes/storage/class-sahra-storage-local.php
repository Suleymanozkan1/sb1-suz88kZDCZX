<?php
/**
 * Yerel depolama — WordPress yükleme klasörü.
 *
 * Varsayılan sürücü. Küçük kurulumlar ve deneme için yeterli; fotoğraflar
 * `wp-content/uploads/sahra-davetiye/` altında, dizin listelemeye kapalı
 * olarak durur.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Storage_Local implements Sahra_Storage_Driver {

	public function label() {
		return __( 'Bu sunucu (wp-content/uploads)', 'sahra-davetiye' );
	}

	public function ready() {
		$dir = $this->base_dir();
		if ( ! wp_mkdir_p( $dir ) ) {
			return new WP_Error( 'sahra_dizin', __( 'Yükleme klasörü oluşturulamadı.', 'sahra-davetiye' ) );
		}
		if ( ! is_writable( $dir ) ) {
			return new WP_Error( 'sahra_yazma', __( 'Yükleme klasörüne yazılamıyor.', 'sahra-davetiye' ) );
		}
		return true;
	}

	/** uploads/sahra-davetiye — doğrudan tarama kapalı. */
	private function base_dir() {
		$uploads = wp_upload_dir();
		$dir     = trailingslashit( $uploads['basedir'] ) . 'sahra-davetiye';

		if ( ! file_exists( $dir . '/index.html' ) && wp_mkdir_p( $dir ) ) {
			// Dizin listelemesi açık sunucularda misafir fotoğrafları
			// adresi bilen herkese sıralanmasın.
			file_put_contents( $dir . '/index.html', '' ); // phpcs:ignore
		}
		return $dir;
	}

	public function put( $path, $file_name, $mime ) {
		$hazir = $this->ready();
		if ( is_wp_error( $hazir ) ) {
			return $hazir;
		}

		$file_name = sanitize_file_name( $file_name );
		$hedef     = trailingslashit( $this->base_dir() ) . $file_name;

		if ( ! @copy( $path, $hedef ) ) { // phpcs:ignore
			return new WP_Error( 'sahra_kopyala', __( 'Dosya kaydedilemedi.', 'sahra-davetiye' ) );
		}

		return array( 'id' => $file_name, 'meta' => array() );
	}

	public function get( $id ) {
		$yol = trailingslashit( $this->base_dir() ) . sanitize_file_name( $id );
		if ( ! is_readable( $yol ) ) {
			return new WP_Error( 'sahra_yok', __( 'Dosya bulunamadı.', 'sahra-davetiye' ), array( 'status' => 404 ) );
		}
		return array(
			'body' => file_get_contents( $yol ), // phpcs:ignore
			'mime' => Sahra_Storage::mime_for( $id ),
		);
	}

	public function delete( $id ) {
		$yol = trailingslashit( $this->base_dir() ) . sanitize_file_name( $id );
		if ( file_exists( $yol ) ) {
			@unlink( $yol ); // phpcs:ignore
		}
		return true;
	}
}
