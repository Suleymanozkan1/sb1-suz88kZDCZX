<?php
/**
 * Google Drive depolama sürücüsü.
 *
 * Misafir fotoğrafları WordPress'in barındırma kotasını doldurmasın diye:
 * bir düğünde 300 misafirin 25 MB'lık kareleri kolayca birkaç gigabayta
 * çıkıyor ve paylaşımlı hostingde kota dolduğunda yalnızca fotoğraflar
 * değil sitenin tamamı (yedek, güncelleme, medya) duruyor.
 *
 * Google'ın PHP SDK'sı BİLE BİLE kullanılmıyor: eklentiye onlarca megabaytlık
 * bir bağımlılık ağacı eklemek, bu işin gerektirdiği üç uç nokta için
 * ödenmeyecek bir bedel. Drive REST v3 doğrudan `wp_remote_*` ile konuşuluyor.
 *
 * Yetki için "yenileme jetonu" (refresh token) kullanılır: bir kez alınır,
 * süresiz geçerlidir ve erişim jetonu ondan üretilir. Kurulum adımları
 * README-KURULUM.md içinde.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Storage_Drive implements Sahra_Storage_Driver {

	const TOKEN_URL     = 'https://oauth2.googleapis.com/token';
	const UPLOAD_URL    = 'https://www.googleapis.com/upload/drive/v3/files';
	const FILES_URL     = 'https://www.googleapis.com/drive/v3/files';
	const TOKEN_CACHE   = 'sahra_drive_token';

	private $settings;

	public function __construct( $settings ) {
		$this->settings = wp_parse_args(
			$settings,
			array(
				'client_id'     => '',
				'client_secret' => '',
				'refresh_token' => '',
				'folder_id'     => '',
			)
		);
	}

	public function label() {
		return __( 'Google Drive', 'sahra-davetiye' );
	}

	public function ready() {
		foreach ( array( 'client_id', 'client_secret', 'refresh_token' ) as $alan ) {
			if ( '' === trim( (string) $this->settings[ $alan ] ) ) {
				return new WP_Error(
					'sahra_drive_eksik',
					__( 'Google Drive bilgileri eksik. Sahra Davetiye → Ayarlar bölümünü doldurun.', 'sahra-davetiye' )
				);
			}
		}

		$jeton = $this->access_token();
		return is_wp_error( $jeton ) ? $jeton : true;
	}

	/**
	 * Erişim jetonu.
	 *
	 * Google'ın verdiği jeton bir saat geçerli; her istekte yenilemek hem
	 * yavaş hem gereksiz. Bittiğinden beş dakika önce düşecek şekilde
	 * önbelleğe alınır.
	 */
	private function access_token() {
		$onbellek = get_transient( self::TOKEN_CACHE );
		if ( $onbellek ) {
			return $onbellek;
		}

		$yanit = wp_remote_post(
			self::TOKEN_URL,
			array(
				'timeout' => 20,
				'body'    => array(
					'client_id'     => $this->settings['client_id'],
					'client_secret' => $this->settings['client_secret'],
					'refresh_token' => $this->settings['refresh_token'],
					'grant_type'    => 'refresh_token',
				),
			)
		);

		if ( is_wp_error( $yanit ) ) {
			return $yanit;
		}

		$govde = json_decode( wp_remote_retrieve_body( $yanit ), true );
		if ( empty( $govde['access_token'] ) ) {
			$sebep = isset( $govde['error_description'] ) ? $govde['error_description'] : wp_remote_retrieve_response_code( $yanit );
			return new WP_Error(
				'sahra_drive_jeton',
				/* translators: %s: Google'ın döndürdüğü hata. */
				sprintf( __( 'Google Drive yetkisi alınamadı: %s', 'sahra-davetiye' ), $sebep )
			);
		}

		$omur = isset( $govde['expires_in'] ) ? (int) $govde['expires_in'] : 3600;
		set_transient( self::TOKEN_CACHE, $govde['access_token'], max( 60, $omur - 300 ) );

		return $govde['access_token'];
	}

	/**
	 * Yükleme — sürdürülebilir (resumable) akış.
	 *
	 * Çok parçalı (multipart) yükleme Google'da 5 MB ile sınırlı; ürünün
	 * fotoğraf sınırı 25 MB. Bu yüzden tek yol olarak resumable kullanılıyor:
	 * önce üstveriyle oturum açılır, dönen adrese içerik yazılır.
	 */
	public function put( $path, $file_name, $mime ) {
		$jeton = $this->access_token();
		if ( is_wp_error( $jeton ) ) {
			return $jeton;
		}

		$ustveri = array( 'name' => $file_name );
		if ( trim( (string) $this->settings['folder_id'] ) !== '' ) {
			$ustveri['parents'] = array( trim( $this->settings['folder_id'] ) );
		}

		$oturum = wp_remote_post(
			add_query_arg(
				array( 'uploadType' => 'resumable', 'supportsAllDrives' => 'true' ),
				self::UPLOAD_URL
			),
			array(
				'timeout' => 30,
				'headers' => array(
					'Authorization'           => 'Bearer ' . $jeton,
					'Content-Type'            => 'application/json; charset=UTF-8',
					'X-Upload-Content-Type'   => $mime,
					'X-Upload-Content-Length' => (string) filesize( $path ),
				),
				'body'    => wp_json_encode( $ustveri ),
			)
		);

		if ( is_wp_error( $oturum ) ) {
			return $oturum;
		}

		$adres = wp_remote_retrieve_header( $oturum, 'location' );
		if ( ! $adres ) {
			return new WP_Error(
				'sahra_drive_oturum',
				__( 'Google Drive yükleme oturumu açılamadı.', 'sahra-davetiye' )
			);
		}

		$icerik = file_get_contents( $path ); // phpcs:ignore
		if ( false === $icerik ) {
			return new WP_Error( 'sahra_okuma', __( 'Yüklenen dosya okunamadı.', 'sahra-davetiye' ) );
		}

		$yazma = wp_remote_request(
			$adres,
			array(
				'method'  => 'PUT',
				// Büyük dosyalar varsayılan 5 saniyeye sığmaz.
				'timeout' => 120,
				'headers' => array(
					'Content-Type'   => $mime,
					'Content-Length' => (string) strlen( $icerik ),
				),
				'body'    => $icerik,
			)
		);

		if ( is_wp_error( $yazma ) ) {
			return $yazma;
		}

		$sonuc = json_decode( wp_remote_retrieve_body( $yazma ), true );
		if ( empty( $sonuc['id'] ) ) {
			return new WP_Error(
				'sahra_drive_yukleme',
				__( 'Fotoğraf Google Drive\'a yüklenemedi.', 'sahra-davetiye' )
			);
		}

		return array( 'id' => $sonuc['id'], 'meta' => array( 'drive' => true ) );
	}

	/**
	 * Okuma.
	 *
	 * Dosya doğrudan Drive adresinden gösterilmiyor, siteden akıtılıyor:
	 * Drive'ın paylaşım adresleri hem hız sınırına takılıyor hem de
	 * fotoğrafı bağlantıyı bilen herkese açıyor. Böylece yetki denetimi
	 * WordPress tarafında kalıyor.
	 */
	public function get( $id ) {
		$jeton = $this->access_token();
		if ( is_wp_error( $jeton ) ) {
			return $jeton;
		}

		$yanit = wp_remote_get(
			add_query_arg(
				array( 'alt' => 'media', 'supportsAllDrives' => 'true' ),
				self::FILES_URL . '/' . rawurlencode( $id )
			),
			array(
				'timeout' => 60,
				'headers' => array( 'Authorization' => 'Bearer ' . $jeton ),
			)
		);

		if ( is_wp_error( $yanit ) ) {
			return $yanit;
		}

		$kod = (int) wp_remote_retrieve_response_code( $yanit );
		if ( 200 !== $kod ) {
			return new WP_Error(
				'sahra_drive_okuma',
				__( 'Fotoğraf Google Drive üzerinden okunamadı.', 'sahra-davetiye' ),
				array( 'status' => 404 === $kod ? 404 : 502 )
			);
		}

		$mime = wp_remote_retrieve_header( $yanit, 'content-type' );

		return array(
			'body' => wp_remote_retrieve_body( $yanit ),
			'mime' => $mime ? $mime : 'application/octet-stream',
		);
	}

	public function delete( $id ) {
		$jeton = $this->access_token();
		if ( is_wp_error( $jeton ) ) {
			return $jeton;
		}

		wp_remote_request(
			add_query_arg( array( 'supportsAllDrives' => 'true' ), self::FILES_URL . '/' . rawurlencode( $id ) ),
			array(
				'method'  => 'DELETE',
				'timeout' => 20,
				'headers' => array( 'Authorization' => 'Bearer ' . $jeton ),
			)
		);

		return true;
	}

	/** Ayar ekranındaki "Bağlantıyı Sına" düğmesi için. */
	public function test() {
		$jeton = $this->access_token();
		if ( is_wp_error( $jeton ) ) {
			return $jeton;
		}

		$hedef = trim( (string) $this->settings['folder_id'] );
		if ( '' === $hedef ) {
			return true;
		}

		$yanit = wp_remote_get(
			add_query_arg(
				array( 'fields' => 'id,name,mimeType', 'supportsAllDrives' => 'true' ),
				self::FILES_URL . '/' . rawurlencode( $hedef )
			),
			array(
				'timeout' => 20,
				'headers' => array( 'Authorization' => 'Bearer ' . $jeton ),
			)
		);

		if ( is_wp_error( $yanit ) ) {
			return $yanit;
		}

		$govde = json_decode( wp_remote_retrieve_body( $yanit ), true );
		if ( empty( $govde['id'] ) ) {
			return new WP_Error(
				'sahra_drive_klasor',
				__( 'Klasör bulunamadı. Klasör kimliğini ve klasörün bu hesapla paylaşıldığını kontrol edin.', 'sahra-davetiye' )
			);
		}

		if ( isset( $govde['mimeType'] ) && 'application/vnd.google-apps.folder' !== $govde['mimeType'] ) {
			return new WP_Error(
				'sahra_drive_klasor_degil',
				__( 'Verilen kimlik bir klasöre ait değil.', 'sahra-davetiye' )
			);
		}

		return $govde['name'];
	}
}
