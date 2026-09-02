<?php
/**
 * Depolama cephesi — hangi sürücünün konuşacağına burası karar verir.
 *
 * Çağıran taraf (REST uçları, panel) hangi sürücünün açık olduğunu bilmez;
 * Next.js sürümündeki `lib/files.ts` ile aynı yaklaşım. Böylece Drive'a
 * geçmek bir ayar değişikliği, kod değişikliği değil.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Storage {

	/** Fotoğraf başına üst sınır — Next sürümüyle aynı. */
	const MAX_BYTES = 26214400; // 25 MB

	const IMAGE_TYPES = array( 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif' );
	const AUDIO_TYPES = array( 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/mp4' );

	/** @var Sahra_Storage_Driver|null */
	private static $driver = null;

	/** Seçili sürücü. Drive yapılandırılmamışsa yerelde kalınır. */
	public static function driver() {
		if ( null !== self::$driver ) {
			return self::$driver;
		}

		$ayar = Sahra_Settings::storage();

		if ( 'drive' === $ayar['driver'] ) {
			$drive = new Sahra_Storage_Drive( $ayar['drive'] );
			if ( true === $drive->ready() ) {
				self::$driver = $drive;
				return self::$driver;
			}
			/*
			 * Drive ayarı açık ama çalışmıyorsa yükleme tamamen durmasın:
			 * fotoğraf yerele düşer ve yönetici panelde uyarıyı görür.
			 * Misafirin masadaki QR'ı okuttuğu an bir yapılandırma hatası
			 * yüzünden eli boş kalması, kotadan daha kötü bir sonuç.
			 */
			Sahra_Settings::note_storage_fallback( $drive->ready() );
		}

		self::$driver = new Sahra_Storage_Local();
		return self::$driver;
	}

	/** Test/önbellek sıfırlama. */
	public static function reset() {
		self::$driver = null;
	}

	public static function put( $path, $file_name, $mime ) {
		return self::driver()->put( $path, $file_name, $mime );
	}

	public static function get( $id ) {
		return self::driver()->get( $id );
	}

	public static function delete( $id ) {
		return self::driver()->delete( $id );
	}

	/** Yüklenen dosyanın gerçekten kabul edilebilir olup olmadığı. */
	public static function validate_upload( $file, $allowed ) {
		if ( empty( $file['tmp_name'] ) || ! is_uploaded_file( $file['tmp_name'] ) ) {
			return new WP_Error( 'sahra_dosya', __( 'Dosya alınamadı.', 'sahra-davetiye' ), array( 'status' => 400 ) );
		}

		if ( (int) $file['size'] > self::MAX_BYTES ) {
			return new WP_Error(
				'sahra_buyuk',
				__( 'Dosya çok büyük. En fazla 25 MB.', 'sahra-davetiye' ),
				array( 'status' => 413 )
			);
		}

		/*
		 * Tür, gönderilen başlıktan DEĞİL dosyanın kendisinden okunur:
		 * Content-Type istemcinin yazdığı bir metin, .php uzantılı bir
		 * dosyaya "image/png" demek serbest.
		 */
		$kontrol = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'] );
		$mime    = $kontrol['type'] ? $kontrol['type'] : '';

		if ( ! $mime && function_exists( 'finfo_open' ) ) {
			$finfo = finfo_open( FILEINFO_MIME_TYPE );
			$mime  = finfo_file( $finfo, $file['tmp_name'] );
			finfo_close( $finfo );
		}

		if ( ! in_array( $mime, $allowed, true ) ) {
			return new WP_Error(
				'sahra_tur',
				__( 'Bu dosya türü kabul edilmiyor.', 'sahra-davetiye' ),
				array( 'status' => 400 )
			);
		}

		return $mime;
	}

	/** Çakışmayan, tahmin edilemeyen dosya adı. */
	public static function new_name( $mime ) {
		$uzanti = array(
			'image/jpeg'  => 'jpg',
			'image/png'   => 'png',
			'image/webp'  => 'webp',
			'image/heic'  => 'heic',
			'image/heif'  => 'heif',
			'audio/mpeg'  => 'mp3',
			'audio/mp3'   => 'mp3',
			'audio/ogg'   => 'ogg',
			'audio/wav'   => 'wav',
			'audio/x-m4a' => 'm4a',
			'audio/mp4'   => 'm4a',
		);

		$son = isset( $uzanti[ $mime ] ) ? $uzanti[ $mime ] : 'bin';
		return wp_generate_uuid4() . '.' . $son;
	}

	public static function mime_for( $file_name ) {
		$tur = wp_check_filetype( $file_name );
		return $tur['type'] ? $tur['type'] : 'application/octet-stream';
	}
}
