<?php
/**
 * Kurulum denetimi.
 *
 * Bu eklentinin canlıda sessizce yanlış çalıştığı yerler hep sunucu
 * ayarlarıydı: kalıcı bağlantı "Düz" olunca davetiye adresi web
 * sunucusundan 404 dönüyor ve WordPress hiç çalışmıyor; GD yoksa
 * paylaşım kartı üretilmiyor ve WhatsApp önizlemesi boş çıkıyor. Hiçbiri
 * hata vermiyor — kuran kişi "bozuk" diyor, nedenini göremiyor.
 *
 * Burada ölçülen şeyler ürünün kendi kodu değil, ürünün ÇALIŞMASI için
 * gereken ortam. O yüzden ayrı duruyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Health {

	/**
	 * Bulgular.
	 *
	 * @return array{seviye:string,baslik:string,cozum:string}[]
	 *         seviye: 'engel' — bir özellik hiç çalışmıyor.
	 *                 'oneri' — çalışıyor ama beklenenden dar.
	 */
	public static function checks() {
		$bulgu = array();

		/*
		 * Kalıcı bağlantı "Düz" ise /davet/... adresini WordPress değil,
		 * web sunucusu karşılıyor ve dosya bulamayıp 404 veriyor. En sık
		 * karşılaşılan kurulum arızası bu.
		 */
		if ( '' === (string) get_option( 'permalink_structure' ) ) {
			$bulgu[] = array(
				'seviye' => 'engel',
				'baslik' => __( 'Kalıcı bağlantılar "Düz" ayarlı — davetiye adresleri açılmaz.', 'sahra-davetiye' ),
				'cozum'  => __( 'Ayarlar → Kalıcı Bağlantılar\'dan "Yazı adı"nı seçip kaydedin.', 'sahra-davetiye' ),
			);
		}

		// Kart GD ile çiziliyor; yoksa üretilmiyor ve önizleme boş kalıyor.
		if ( ! function_exists( 'imagecreatetruecolor' ) || ! function_exists( 'imagettftext' ) ) {
			$bulgu[] = array(
				'seviye' => 'engel',
				'baslik' => __( 'Sunucuda GD görüntü kütüphanesi yok — paylaşım kartı üretilemez.', 'sahra-davetiye' ),
				'cozum'  => __( 'Hosting sağlayıcınızdan PHP GD eklentisini (yazı tipi desteğiyle) açmasını isteyin.', 'sahra-davetiye' ),
			);
		}

		foreach ( self::missing_tables() as $eksik ) {
			$bulgu[] = array(
				'seviye' => 'engel',
				'baslik' => sprintf(
					/* translators: %s: tablo adı. */
					__( 'Veritabanı tablosu kurulmamış: %s', 'sahra-davetiye' ),
					$eksik
				),
				'cozum'  => __( 'Eklentiyi devre dışı bırakıp yeniden etkinleştirin; tablolar etkinleştirmede kuruluyor.', 'sahra-davetiye' ),
			);
		}

		/*
		 * Ömür işi düğünden sonra davetiyeyi yayından kaldırıyor ve
		 * fotoğrafları siliyor. Zamanlanmamışsa panelde söz verilen şey
		 * hiç olmuyor.
		 */
		if ( ! wp_next_scheduled( Sahra_Lifecycle::HOOK ) ) {
			$bulgu[] = array(
				'seviye' => 'engel',
				'baslik' => __( 'Günlük bakım zamanlanmamış — davetiyeler düğünden sonra yayından kalkmaz.', 'sahra-davetiye' ),
				'cozum'  => __( 'Eklentiyi devre dışı bırakıp yeniden etkinleştirin.', 'sahra-davetiye' ),
			);
		} elseif ( defined( 'DISABLE_WP_CRON' ) && DISABLE_WP_CRON ) {
			$bulgu[] = array(
				'seviye' => 'oneri',
				'baslik' => __( 'WordPress zamanlayıcısı kapalı; günlük bakım ancak sunucu görevine bağlıysa çalışır.', 'sahra-davetiye' ),
				'cozum'  => __( 'Sunucuda wp-cron.php\'yi günde bir çağıran bir görev tanımlı olduğundan emin olun.', 'sahra-davetiye' ),
			);
		}

		/*
		 * Ürünün fotoğraf sınırı 25 MB ama sunucunun sınırı çoğu paylaşımlı
		 * hostta bunun altında. Misafir telefonundan yüklerken görülüyor.
		 */
		$sunucu = (int) wp_max_upload_size();
		if ( $sunucu > 0 && $sunucu < Sahra_Storage::MAX_BYTES ) {
			$bulgu[] = array(
				'seviye' => 'oneri',
				'baslik' => sprintf(
					/* translators: 1: sunucu sınırı, 2: ürünün sınırı. */
					__( 'Sunucunun yükleme sınırı %1$s; ürünün fotoğraf sınırı %2$s.', 'sahra-davetiye' ),
					size_format( $sunucu ),
					size_format( Sahra_Storage::MAX_BYTES )
				),
				'cozum'  => __( 'Misafirler bu boyutun üstündeki kareleri yükleyemez. Sınırı yükseltmek için hosting sağlayıcınıza başvurun.', 'sahra-davetiye' ),
			);
		}

		// Yerel depolamada yazılamayan klasör = hiç fotoğraf kaydedilmemesi.
		if ( 'local' === Sahra_Settings::storage()['driver'] ) {
			$dizin = wp_upload_dir();
			if ( ! empty( $dizin['error'] ) ) {
				$bulgu[] = array(
					'seviye' => 'engel',
					'baslik' => __( 'Yükleme klasörüne yazılamıyor — misafir fotoğrafları kaydedilemez.', 'sahra-davetiye' ),
					'cozum'  => __( 'Hosting sağlayıcınızdan yükleme klasörünün yazma iznini düzeltmesini isteyin.', 'sahra-davetiye' ),
				);
			}
		}

		/*
		 * Paylaşım kartının güvenli adresi yalnızca https'te basılıyor;
		 * bazı uygulamalar http görselini önizlemede göstermiyor.
		 */
		if ( 0 !== strpos( (string) home_url(), 'https://' ) ) {
			$bulgu[] = array(
				'seviye' => 'oneri',
				'baslik' => __( 'Site https değil — bazı uygulamalar paylaşım görselini göstermez.', 'sahra-davetiye' ),
				'cozum'  => __( 'Siteye SSL sertifikası tanımlayın ve adresi https olarak güncelleyin.', 'sahra-davetiye' ),
			);
		}

		return $bulgu;
	}

	/** Engel sayılan bulgu var mı? */
	public static function blocking() {
		return array_values(
			array_filter(
				self::checks(),
				static function ( $b ) {
					return 'engel' === $b['seviye'];
				}
			)
		);
	}

	/**
	 * Kurulmamış tablolar.
	 *
	 * "SHOW TABLES" yerine tabloya dokunulup hata olup olmadığına
	 * bakılıyor: kurulumların bir kısmı SQLite katmanı üzerinde çalışıyor
	 * ve orada SHOW TABLES aynı cevabı vermiyor.
	 */
	private static function missing_tables() {
		global $wpdb;

		$eksik  = array();
		$onceki = $wpdb->suppress_errors( true );

		foreach ( array( Sahra_Tables::rsvps(), Sahra_Tables::wishes(), Sahra_Tables::photos() ) as $tablo ) {
			$wpdb->last_error = '';
			$wpdb->get_var( "SELECT 1 FROM {$tablo} LIMIT 1" ); // phpcs:ignore
			if ( '' !== (string) $wpdb->last_error ) {
				$eksik[] = $tablo;
			}
		}

		$wpdb->suppress_errors( $onceki );
		return $eksik;
	}
}
