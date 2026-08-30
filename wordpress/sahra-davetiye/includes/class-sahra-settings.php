<?php
/**
 * Genel ayarlar — ortak mekân ve depolama.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Settings {

	const VENUE_OPTION    = 'sahra_venue';
	const STORAGE_OPTION  = 'sahra_storage';
	const FALLBACK_NOTICE = 'sahra_storage_fallback';

	/**
	 * Mekân — TÜM davetiyelerde ortak, yalnızca yönetici değiştirir.
	 *
	 * Tek salonda çalışan bir işletmede adresi her çifte ayrı sormak hem
	 * gereksiz bir soru hem bir hata kaynağıydı: bir çift yanlış yazdığında
	 * yalnızca kendi misafirleri yanlış yere gidiyor, kimse fark etmiyordu.
	 */
	public static function venue() {
		return wp_parse_args(
			get_option( self::VENUE_OPTION, array() ),
			array(
				'venueName' => '',
				'address'   => '',
				'district'  => '',
				'city'      => '',
				'mapUrl'    => '',
			)
		);
	}

	public static function save_venue( $input ) {
		$mevcut = self::venue();
		$temiz  = array();

		foreach ( array_keys( $mevcut ) as $anahtar ) {
			if ( ! array_key_exists( $anahtar, (array) $input ) ) {
				$temiz[ $anahtar ] = $mevcut[ $anahtar ];
				continue;
			}
			$temiz[ $anahtar ] = 'mapUrl' === $anahtar
				? Sahra_Fields::safe_url( $input[ $anahtar ] )
				: sanitize_text_field( (string) $input[ $anahtar ] );
		}

		update_option( self::VENUE_OPTION, $temiz );
		return $temiz;
	}

	/** Depolama ayarı. */
	public static function storage() {
		$ayar = wp_parse_args(
			get_option( self::STORAGE_OPTION, array() ),
			array( 'driver' => 'local', 'drive' => array() )
		);

		$ayar['drive'] = wp_parse_args(
			is_array( $ayar['drive'] ) ? $ayar['drive'] : array(),
			array( 'client_id' => '', 'client_secret' => '', 'refresh_token' => '', 'folder_id' => '' )
		);

		return $ayar;
	}

	public static function save_storage( $input ) {
		$surucu = isset( $input['driver'] ) && 'drive' === $input['driver'] ? 'drive' : 'local';
		$drive  = isset( $input['drive'] ) && is_array( $input['drive'] ) ? $input['drive'] : array();
		$mevcut = self::storage();

		$temiz = array();
		foreach ( array( 'client_id', 'client_secret', 'refresh_token', 'folder_id' ) as $alan ) {
			$deger = isset( $drive[ $alan ] ) ? trim( sanitize_text_field( (string) $drive[ $alan ] ) ) : '';

			/*
			 * Boş bırakılan gizli alan "sil" demek değildir: ayar ekranında
			 * sırlar maskeli gösteriliyor, kaydete basmak jetonu silmemeli.
			 */
			if ( '' === $deger && in_array( $alan, array( 'client_secret', 'refresh_token' ), true ) ) {
				$deger = $mevcut['drive'][ $alan ];
			}

			$temiz[ $alan ] = $deger;
		}

		delete_transient( Sahra_Storage_Drive::TOKEN_CACHE );
		delete_option( self::FALLBACK_NOTICE );
		Sahra_Storage::reset();

		update_option( self::STORAGE_OPTION, array( 'driver' => $surucu, 'drive' => $temiz ) );
		return self::storage();
	}

	/** Drive çalışmadığı için yerele düşüldüğünde yöneticiye söylenecek. */
	public static function note_storage_fallback( $error ) {
		$mesaj = is_wp_error( $error ) ? $error->get_error_message() : (string) $error;
		update_option( self::FALLBACK_NOTICE, $mesaj, false );
	}

	public static function storage_fallback_notice() {
		return get_option( self::FALLBACK_NOTICE, '' );
	}
}
