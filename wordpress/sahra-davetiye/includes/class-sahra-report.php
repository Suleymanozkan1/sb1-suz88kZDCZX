<?php
/**
 * Katılım raporu — düğünden 7 ve 1 gün önce çifte e-posta.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

/**
 * Çift, katılımları panelden görebiliyordu ama girip bakması gerekiyordu.
 * Salonun sayı vermesi gereken gün de düğünden bir hafta önce. Rapor
 * kendiliğinden gidiyor.
 */
class Sahra_Report {

	/** Gönderilen raporların kaydı. */
	const META = '_sahra_rapor';

	/** Düğünden kaç gün önce gönderilecek. */
	const GUNLER = array( 7, 1 );

	/**
	 * Günü gelen raporları gönderir.
	 *
	 * Günlük bakımla birlikte çalışıyor.
	 *
	 * @param string $bugun Test için gün geçirilebilir; boşsa bugün.
	 * @return array Gönderilen raporlar: post kimliği => gün listesi.
	 */
	public static function run( $bugun = '' ) {
		$bugun  = $bugun ? $bugun : wp_date( 'Y-m-d' );
		$sonuc  = array();

		$davetiyeler = get_posts(
			array(
				'post_type'        => Sahra_Invitation::POST_TYPE,
				'post_status'      => array( 'publish', 'draft' ),
				'posts_per_page'   => -1,
				'suppress_filters' => false,
			)
		);

		foreach ( $davetiyeler as $post ) {
			$ham   = get_post_meta( $post->ID, Sahra_Invitation::META_KEY, true );
			$tarih = is_array( $ham ) && ! empty( $ham['weddingDate'] ) ? $ham['weddingDate'] : '';

			if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $tarih ) ) {
				continue;
			}

			foreach ( self::GUNLER as $gun ) {
				if ( self::gun_ekle( $tarih, -$gun ) !== $bugun ) {
					continue;
				}
				if ( self::gonderildi_mi( $post->ID, $tarih, $gun ) ) {
					continue;
				}
				if ( self::gonder( $post->ID, $gun ) ) {
					self::isaretle( $post->ID, $tarih, $gun );
					$sonuc[ $post->ID ][] = $gun;
				}
			}
		}

		return $sonuc;
	}

	/**
	 * Bir davetiyenin katılım özeti.
	 *
	 * @param int $post_id Davetiye.
	 * @return array katilanlar, katilmayanlar, kisi, cevap.
	 */
	public static function ozet( $post_id ) {
		global $wpdb;

		$satirlar = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				'SELECT name, guest_count, attending FROM ' . Sahra_Tables::rsvps() . ' WHERE invitation_id = %d ORDER BY created_at ASC', // phpcs:ignore
				(int) $post_id
			)
		);

		$ozet = array( 'katilanlar' => array(), 'katilmayanlar' => array(), 'kisi' => 0 );

		foreach ( (array) $satirlar as $satir ) {
			$ad = trim( (string) $satir->name );
			if ( (int) $satir->attending ) {
				/*
				 * Kişi sayısı metin olarak tutuluyor ("2", "5+" dönemi
				 * gibi): sayıya çevrilirken en az 1 sayılıyor, yoksa
				 * boş bir alan katılımı görünmez kılıyor.
				 */
				$kisi                   = max( 1, (int) $satir->guest_count );
				$ozet['katilanlar'][]   = array( 'ad' => $ad, 'kisi' => $kisi );
				$ozet['kisi']          += $kisi;
			} else {
				$ozet['katilmayanlar'][] = array( 'ad' => $ad, 'kisi' => 0 );
			}
		}

		$ozet['cevap'] = count( $ozet['katilanlar'] ) + count( $ozet['katilmayanlar'] );

		return $ozet;
	}

	/** Raporun gövdesi — düz metin; e-posta istemcisi ne olursa okunur. */
	public static function govde( $post_id, $gun ) {
		$d    = Sahra_Invitation::get( $post_id );
		$ozet = self::ozet( $post_id );
		/*
		 * Davetli listesi varsa rapor ONUN üzerinden yazılıyor: kimin
		 * cevap vermediği ancak kimin davet edildiği biliniyorsa
		 * söylenebilir. Liste girilmemişse eski, dar özete düşülüyor ve
		 * neyin bilinmediği açıkça yazılıyor.
		 */
		$liste  = Sahra_Guests::count( $post_id ) > 0 ? Sahra_Guests::reconcile( $post_id ) : null;

		$isimler = trim( $d['brideName'] . ' ' . Sahra_Fields::CONJUNCTION . ' ' . $d['groomName'] );
		$satir   = array();

		$satir[] = sprintf(
			/* translators: 1: çiftin adları, 2: kaç gün kaldığı. */
			__( '%1$s — düğüne %2$d gün kaldı.', 'sahra-davetiye' ),
			$isimler,
			(int) $gun
		);
		$satir[] = '';
		$satir[] = sprintf( __( 'Düğün tarihi: %s', 'sahra-davetiye' ), $d['weddingDate'] );
		$satir[] = sprintf( __( 'Salon: %s', 'sahra-davetiye' ), $d['venueName'] );
		$satir[] = '';
		$satir[] = '── ' . __( 'ÖZET', 'sahra-davetiye' ) . ' ──';
		if ( $liste ) {
			$s = $liste['sayilar'];
			$satir[] = sprintf( __( 'Toplam davetli: %d', 'sahra-davetiye' ), $s['davetli'] );
			$satir[] = sprintf( __( 'Davet edilen kişi: %d', 'sahra-davetiye' ), $s['davet_kisi'] );
			$satir[] = sprintf( __( 'Katılacak davetli: %d', 'sahra-davetiye' ), $s['katiliyor'] );
			$satir[] = sprintf( __( 'Katılmayacak davetli: %d', 'sahra-davetiye' ), $s['katilmiyor'] );
			$satir[] = sprintf( __( 'Henüz cevap vermeyen: %d', 'sahra-davetiye' ), $s['cevapsiz'] );
			$satir[] = sprintf( __( 'Katılacak toplam kişi: %d', 'sahra-davetiye' ), $s['gelen_kisi'] );
		} else {
			$satir[] = sprintf( __( 'Cevap veren davetli: %d', 'sahra-davetiye' ), $ozet['cevap'] );
			$satir[] = sprintf( __( 'Katılacak davetli: %d', 'sahra-davetiye' ), count( $ozet['katilanlar'] ) );
			$satir[] = sprintf( __( 'Katılacak toplam kişi: %d', 'sahra-davetiye' ), $ozet['kisi'] );
			$satir[] = sprintf( __( 'Katılmayacak davetli: %d', 'sahra-davetiye' ), count( $ozet['katilmayanlar'] ) );
		}
		$satir[] = '';

		if ( $liste ) {
			$bolumler = array(
				'katiliyor'  => __( 'KATILACAKLAR', 'sahra-davetiye' ),
				'katilmiyor' => __( 'KATILMAYACAKLAR', 'sahra-davetiye' ),
				'cevapsiz'   => __( 'HENÜZ CEVAP VERMEYENLER', 'sahra-davetiye' ),
			);
			foreach ( $bolumler as $durum => $baslik ) {
				$satir[] = '── ' . $baslik . ' ──';
				$bos     = true;
				foreach ( $liste['davetliler'] as $davetli ) {
					if ( $durum !== $davetli['durum'] ) {
						continue;
					}
					$bos = false;
					if ( 'katiliyor' === $durum ) {
						$satir[] = sprintf( '%s — %d kişi', $davetli['ad'], $davetli['gelen_kisi'] );
					} elseif ( 'cevapsiz' === $durum && $davetli['telefon'] ) {
						// Aranacak kişi: numarası elinin altında olsun.
						$satir[] = sprintf( '%s — %s', $davetli['ad'], $davetli['telefon'] );
					} else {
						$satir[] = $davetli['ad'];
					}
				}
				if ( $bos ) {
					$satir[] = __( 'Yok.', 'sahra-davetiye' );
				}
				$satir[] = '';
			}

			if ( $liste['listede_olmayan'] ) {
				$satir[] = '── ' . __( 'LİSTEDE OLMAYANLAR', 'sahra-davetiye' ) . ' ──';
				$satir[] = __( 'Katılım bildirdi ama davetli listesinde bulunamadı (adı farklı yazılmış olabilir):', 'sahra-davetiye' );
				foreach ( $liste['listede_olmayan'] as $davetli ) {
					$satir[] = 'katiliyor' === $davetli['durum']
						? sprintf( '%s — %d kişi', $davetli['ad'], $davetli['gelen_kisi'] )
						: sprintf( '%s — %s', $davetli['ad'], __( 'katılamıyor', 'sahra-davetiye' ) );
				}
				$satir[] = '';
			}
		} else {
			$satir[] = '── ' . __( 'KATILACAKLAR', 'sahra-davetiye' ) . ' ──';
			if ( $ozet['katilanlar'] ) {
				foreach ( $ozet['katilanlar'] as $kisi ) {
					$satir[] = sprintf( '%s — %d kişi', $kisi['ad'], $kisi['kisi'] );
				}
			} else {
				$satir[] = __( 'Henüz yok.', 'sahra-davetiye' );
			}
			$satir[] = '';

			$satir[] = '── ' . __( 'KATILMAYACAKLAR', 'sahra-davetiye' ) . ' ──';
			if ( $ozet['katilmayanlar'] ) {
				foreach ( $ozet['katilmayanlar'] as $kisi ) {
					$satir[] = $kisi['ad'];
				}
			} else {
				$satir[] = __( 'Henüz yok.', 'sahra-davetiye' );
			}
			$satir[] = '';

			/* Liste girilmemiş: eksik olanın ne olduğu ve nasıl doldurulacağı yazılıyor. */
			$satir[] = __( 'Not: Davetli listesi girilmediği için "henüz cevap vermeyenler" ve "toplam davetli" hesaplanamıyor. Panelden Davetli Listesi sayfasına listenizi yazarsanız bu rapor onları da içerir.', 'sahra-davetiye' );
			$satir[] = '';
		}
		$satir[] = sprintf( __( 'Davetiye: %s', 'sahra-davetiye' ), home_url( '/davet/' . $d['slug'] ) );

		return implode( "\n", $satir );
	}

	/** Çiftin kayıtlı e-posta adresi. */
	private static function adres( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return '';
		}
		$kullanici = get_userdata( (int) $post->post_author );
		return ( $kullanici && is_email( $kullanici->user_email ) ) ? $kullanici->user_email : '';
	}

	/** Raporu gönderir; adres yoksa false. */
	private static function gonder( $post_id, $gun ) {
		$adres = self::adres( $post_id );
		if ( '' === $adres ) {
			return false;
		}

		$d      = Sahra_Invitation::get( $post_id );
		$baslik = sprintf(
			/* translators: 1: çiftin adları, 2: kaç gün kaldığı. */
			__( '%1$s — katılım raporu (%2$d gün kaldı)', 'sahra-davetiye' ),
			trim( $d['brideName'] . ' ' . Sahra_Fields::CONJUNCTION . ' ' . $d['groomName'] ),
			(int) $gun
		);

		return (bool) wp_mail( $adres, $baslik, self::govde( $post_id, $gun ) );
	}

	/**
	 * Gönderim kaydı DÜĞÜN TARİHİYLE birlikte tutuluyor.
	 *
	 * Yalnızca "7 gün raporu gitti" yazılsaydı, tarih değişince yeni
	 * tarihin raporu hiç gitmezdi. Tarih anahtarın içinde olduğu için
	 * tarih değişince gönderim günleri de kendiliğinden yeniden
	 * hesaplanıyor ve rapor yeni tarihe göre bir kez daha gidiyor.
	 */
	private static function anahtar( $tarih, $gun ) {
		return $tarih . ':' . (int) $gun;
	}

	private static function gonderildi_mi( $post_id, $tarih, $gun ) {
		$kayit = get_post_meta( $post_id, self::META, true );
		return is_array( $kayit ) && in_array( self::anahtar( $tarih, $gun ), $kayit, true );
	}

	private static function isaretle( $post_id, $tarih, $gun ) {
		$kayit = get_post_meta( $post_id, self::META, true );
		$kayit = is_array( $kayit ) ? $kayit : array();
		$kayit[] = self::anahtar( $tarih, $gun );
		update_post_meta( $post_id, self::META, array_values( array_unique( $kayit ) ) );
	}

	private static function gun_ekle( $tarih, $gun ) {
		$zaman = strtotime( $tarih . ' ' . ( (int) $gun >= 0 ? '+' : '' ) . (int) $gun . ' days' );
		return $zaman ? gmdate( 'Y-m-d', $zaman ) : $tarih;
	}
}
