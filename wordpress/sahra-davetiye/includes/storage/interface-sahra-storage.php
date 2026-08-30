<?php
/**
 * Depolama sürücüsü arayüzü.
 *
 * Misafir fotoğrafları bir düğünde kolayca on binlerce megabayta çıkıyor.
 * WordPress'in kendi yükleme klasörü bunun için yanlış yer: paylaşımlı
 * hosting kotası dolduğunda yalnızca fotoğraflar değil, sitenin tamamı
 * (yedekler, güncellemeler, medya) durur. Bu yüzden depolama takılıp
 * çıkarılabilir bir sürücü.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

interface Sahra_Storage_Driver {

	/** Sürücünün kullanıma hazır olup olmadığı; değilse sebebi WP_Error. */
	public function ready();

	/**
	 * Dosyayı yazar.
	 *
	 * @param string $path      Geçici dosyanın diskteki yolu.
	 * @param string $file_name Depoda kullanılacak ad.
	 * @param string $mime      İçerik türü.
	 * @return array|WP_Error   array( 'id' => ..., 'meta' => array() )
	 */
	public function put( $path, $file_name, $mime );

	/**
	 * Dosyayı okur.
	 *
	 * @return array|WP_Error array( 'body' => ikili veri, 'mime' => ... )
	 */
	public function get( $id );

	/** Dosyayı siler. Yoksa da başarılı sayılır. */
	public function delete( $id );

	/** Panelde gösterilecek kısa durum metni. */
	public function label();
}
