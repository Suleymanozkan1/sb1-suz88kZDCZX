<?php
/**
 * Davetiyenin ömrü.
 *
 * Düğün bittikten sonra davetiye kimseye lazım değil: link elden ele
 * dolaşmaya devam ediyor, arama motorlarına düşüyor ve çiftin adresi,
 * telefonu, IBAN'ı süresiz açıkta kalıyor. Bu yüzden düğünden bir gün
 * sonra davetiye YAYINDAN KALKAR.
 *
 * Silme ise ayrı ve çok daha geç bir adım. Misafir fotoğrafları çiftin
 * düğün albümü — bir gün sonra silmek, albümünü indirmeyi unutan çiftin
 * fotoğraflarını yok etmek demekti. Yayından kalkma ile kalıcı silme
 * arasındaki süreyi yönetici belirliyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Lifecycle {

	const HOOK = 'sahra_gunluk_bakim';

	/** Düğün tarihinin damgalandığı meta — yayından kalkma anı. */
	const META_UNPUBLISHED = '_sahra_unpublished_at';

	public static function schedule() {
		if ( ! wp_next_scheduled( self::HOOK ) ) {
			/*
			 * Gece yarısından hemen sonra değil 03:00 civarı: gece yarısı
			 * paylaşımlı hostinglerde herkesin zamanlanmış işi çalışıyor.
			 */
			wp_schedule_event( self::yarin_saat( 3 ), 'daily', self::HOOK );
		}
	}

	public static function unschedule() {
		$zaman = wp_next_scheduled( self::HOOK );
		if ( $zaman ) {
			wp_unschedule_event( $zaman, self::HOOK );
		}
	}

	private static function yarin_saat( $saat ) {
		$simdi = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp
		$hedef = strtotime( gmdate( 'Y-m-d', $simdi ) . ' ' . sprintf( '%02d:00:00', $saat ) );
		if ( $hedef <= $simdi ) {
			$hedef += DAY_IN_SECONDS;
		}
		return $hedef - ( (int) ( get_option( 'gmt_offset' ) * HOUR_IN_SECONDS ) );
	}

	/**
	 * Günlük bakım.
	 *
	 * Tek bir yerde iki iş: süresi dolanları yayından kaldır, çok daha
	 * eskileri sil. Sonucu yöneticiye söylenecek şekilde döner — testte
	 * ve elle çalıştırmada ne olduğu görünsün.
	 */
	public static function run() {
		$ayar   = Sahra_Settings::lifecycle();
		$bugun  = self::bugun();
		$sonuc  = array( 'unpublished' => array(), 'deleted' => array() );

		$davetiyeler = get_posts(
			array(
				'post_type'        => Sahra_Invitation::POST_TYPE,
				'post_status'      => array( 'publish', 'draft' ),
				'posts_per_page'   => -1,
				'suppress_filters' => false,
			)
		);

		foreach ( $davetiyeler as $post ) {
			$ham    = get_post_meta( $post->ID, Sahra_Invitation::META_KEY, true );
			$tarih  = is_array( $ham ) && ! empty( $ham['weddingDate'] ) ? $ham['weddingDate'] : '';

			// Tarihsiz davetiyeye dokunulmaz: ne zaman biteceği bilinmiyor.
			if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $tarih ) ) {
				continue;
			}

			$kapanma = self::gun_ekle( $tarih, $ayar['unpublishDays'] );

			if ( 'publish' === $post->post_status && $bugun >= $kapanma ) {
				wp_update_post( array( 'ID' => $post->ID, 'post_status' => 'draft' ) );
				update_post_meta( $post->ID, self::META_UNPUBLISHED, $bugun );
				$sonuc['unpublished'][] = (int) $post->ID;
				continue;
			}

			if ( ! $ayar['deleteEnabled'] || 'publish' === $post->post_status ) {
				continue;
			}

			/*
			 * Silme sayacı YAYINDAN KALKMA gününden başlar, düğün
			 * gününden değil: yönetici davetiyeyi elle yayından
			 * kaldırdıysa da aynı süre işlesin.
			 */
			$kalkis = get_post_meta( $post->ID, self::META_UNPUBLISHED, true );
			if ( ! $kalkis ) {
				$kalkis = $kapanma;
			}

			if ( $bugun >= self::gun_ekle( $kalkis, $ayar['deleteDays'] ) ) {
				Sahra_Invitation::delete( $post->ID );
				$sonuc['deleted'][] = (int) $post->ID;
			}
		}

		return $sonuc;
	}

	/** Sitenin saat dilimindeki bugün. */
	private static function bugun() {
		return wp_date( 'Y-m-d' );
	}

	private static function gun_ekle( $tarih, $gun ) {
		$zaman = strtotime( $tarih . ' +' . (int) $gun . ' days' );
		return $zaman ? gmdate( 'Y-m-d', $zaman ) : $tarih;
	}

	/**
	 * Fotoğrafların kalıcı olarak silineceği gün.
	 *
	 * Hesap `run()` ile BİREBİR aynı: davetiye yayından kalkmışsa sayaç o
	 * günden, kalkmamışsa düğün + yayından kalkma süresinden işler. İki
	 * yerde iki ayrı hesap olsaydı panelde yazan tarihle gerçekte silinen
	 * gün tutmayacaktı — çift, aslında hâlâ duran albümü kaybettiğini
	 * sanacak ya da tam tersi, indirmeyi son güne bırakıp kaybedecekti.
	 *
	 * Silme kapalıysa ya da düğün tarihi yoksa boş döner: ikisinde de
	 * `run()` o davetiyeye dokunmuyor, yani gerçekten silinmiyor.
	 */
	public static function photo_delete_date( $invitation ) {
		$ayar = Sahra_Settings::lifecycle();

		if ( empty( $ayar['deleteEnabled'] ) || empty( $invitation['weddingDate'] ) ) {
			return '';
		}
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $invitation['weddingDate'] ) ) {
			return '';
		}

		$kalkis = ! empty( $invitation['id'] )
			? get_post_meta( (int) $invitation['id'], self::META_UNPUBLISHED, true )
			: '';
		if ( ! $kalkis ) {
			$kalkis = self::gun_ekle( $invitation['weddingDate'], $ayar['unpublishDays'] );
		}

		return self::gun_ekle( $kalkis, $ayar['deleteDays'] );
	}

	/** Düğünden kaç gün sonra silindiği — tarihi olmayan davetiyeler için. */
	public static function photo_days_after_wedding() {
		$ayar = Sahra_Settings::lifecycle();
		if ( empty( $ayar['deleteEnabled'] ) ) {
			return 0;
		}
		return (int) $ayar['unpublishDays'] + (int) $ayar['deleteDays'];
	}

	/**
	 * Bir davetiyenin ne zaman kapanacağı — panelde gösterilir.
	 *
	 * Çift "davetiyem ne zamana kadar açık?" diye sormadan görmeli;
	 * bir gün aniden kapanan link destek çağrısı demek.
	 */
	public static function summary( $invitation ) {
		$ayar = Sahra_Settings::lifecycle();

		if ( empty( $invitation['weddingDate'] ) ) {
			return '';
		}

		$kapanma = self::gun_ekle( $invitation['weddingDate'], $ayar['unpublishDays'] );
		$metin   = sprintf(
			/* translators: %s: tarih. */
			__( 'Davetiye %s tarihinde yayından kalkar.', 'sahra-davetiye' ),
			Sahra_Render::format_date( $kapanma )
		);

		if ( $ayar['deleteEnabled'] ) {
			$silme  = self::gun_ekle( $kapanma, $ayar['deleteDays'] );
			$metin .= ' ' . sprintf(
				/* translators: %s: tarih. */
				__( 'Fotoğraflar ve katılımlar %s tarihine kadar panelde durur.', 'sahra-davetiye' ),
				Sahra_Render::format_date( $silme )
			);
		}

		return $metin;
	}
}
