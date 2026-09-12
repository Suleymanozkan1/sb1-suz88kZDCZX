<?php
/**
 * Davetli listesi ve katılımlarla eşleştirme.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

/**
 * Katılım bildirimi misafirin kendi yazdığı bir addı; kimin davet
 * edildiği hiçbir yerde durmuyordu. "Henüz cevap vermeyenler" bu yüzden
 * hesaplanamıyordu — eksik olan liste, hesap değil.
 *
 * Liste çiftin; misafire gösterilmiyor.
 */
class Sahra_Guests {

	/**
	 * Eşleştirme anahtarı: aynı kişiyi iki yazımda da bulmak için.
	 *
	 * Misafir "ALİ YILMAZ", çift "Ali Yılmaz" yazıyor; biri araya iki
	 * boşluk koyuyor, biri nokta atıyor. Karşılaştırma harfe ve boşluğa
	 * duyarlı olmamalı. Türkçe küçültme şart: strtolower "İ"yi bozuyor
	 * ve "İNCİ" ile "inci" eşleşmiyordu.
	 *
	 * @param string $ad Ham ad.
	 * @return string Karşılaştırılabilir anahtar.
	 */
	public static function ad_anahtari( $ad ) {
		$ad = Sahra_Fields::tr_lower( (string) $ad );
		// Harf ve rakam dışındaki her şey (nokta, tire, çift boşluk) atılıyor.
		$ad = preg_replace( '/[^\p{L}\p{N}]+/u', ' ', $ad );
		return trim( preg_replace( '/\s+/u', ' ', (string) $ad ) );
	}

	/**
	 * Telefon anahtarı: son 10 hane.
	 *
	 * Aynı numara "0532 111 22 33", "+90 532 111 22 33" ve
	 * "5321112233" diye üç türlü yazılıyor. Ülke kodu ve baştaki sıfır
	 * atılınca üçü de aynı anahtara düşüyor.
	 *
	 * @param string $tel Ham numara.
	 * @return string 10 haneli anahtar, kısa numarada ''.
	 */
	public static function tel_anahtari( $tel ) {
		$haneler = preg_replace( '/\D+/', '', (string) $tel );
		return strlen( (string) $haneler ) >= 10 ? substr( $haneler, -10 ) : '';
	}

	/** Bir davetiyenin davetli listesi. */
	public static function all( $invitation_id ) {
		global $wpdb;
		return (array) $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				'SELECT * FROM ' . Sahra_Tables::invitees() . ' WHERE invitation_id = %d ORDER BY name ASC', // phpcs:ignore
				(int) $invitation_id
			)
		);
	}

	public static function count( $invitation_id ) {
		global $wpdb;
		return (int) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				'SELECT COUNT(*) FROM ' . Sahra_Tables::invitees() . ' WHERE invitation_id = %d', // phpcs:ignore
				(int) $invitation_id
			)
		);
	}

	/**
	 * Metinden listeyi kurar: bir satır = bir davetli.
	 *
	 * "Ad | Telefon | Kişi" — program, hikâye ve menü alanlarıyla aynı
	 * dikey çubuk düzeni; çift yeni bir söz dizimi öğrenmiyor. İki yüz
	 * davetliyi tek tek forma girmek hiç kullanılmayacak bir ekrandı.
	 *
	 * @param int    $invitation_id Davetiye.
	 * @param string $metin         Satırlar.
	 * @return array eklendi, atlanan (boş ya da tekrar).
	 */
	public static function replace_from_text( $invitation_id, $metin ) {
		global $wpdb;

		$invitation_id = (int) $invitation_id;
		$satirlar      = preg_split( '/\R/u', (string) $metin );
		$kayitlar      = array();
		$gorulen       = array();
		$atlanan       = 0;

		foreach ( (array) $satirlar as $satir ) {
			$parca = array_map( 'trim', explode( '|', (string) $satir ) );
			$ad    = isset( $parca[0] ) ? sanitize_text_field( $parca[0] ) : '';
			if ( '' === $ad ) {
				continue;
			}

			$ad      = Sahra_Fields::tr_title( $ad );
			$anahtar = self::ad_anahtari( $ad );

			// Aynı ad iki kez yazıldıysa bir kez sayılıyor.
			if ( isset( $gorulen[ $anahtar ] ) ) {
				$atlanan++;
				continue;
			}
			$gorulen[ $anahtar ] = true;

			$kayitlar[] = array(
				'invitation_id' => $invitation_id,
				'name'          => $ad,
				'phone'         => isset( $parca[1] ) ? sanitize_text_field( $parca[1] ) : '',
				/*
				 * Kaç kişi DAVET edildiği: "Ali Yılmaz | 0532... | 4" bir
				 * ailenin dört kişilik daveti. Boşsa bir kişi.
				 */
				'party_size'    => isset( $parca[2] ) ? max( 1, min( 50, (int) $parca[2] ) ) : 1,
				'note'          => isset( $parca[3] ) ? sanitize_text_field( $parca[3] ) : '',
				'match_key'     => $anahtar,
				'created_at'    => current_time( 'mysql' ),
			);
		}

		/*
		 * Liste TOPLU değişiyor: tek tek güncellemek, çiftin metinden
		 * sildiği satırın veritabanında kalmasına yol açıyordu.
		 */
		$wpdb->delete( Sahra_Tables::invitees(), array( 'invitation_id' => $invitation_id ), array( '%d' ) ); // phpcs:ignore
		foreach ( $kayitlar as $kayit ) {
			$wpdb->insert( Sahra_Tables::invitees(), $kayit ); // phpcs:ignore
		}

		return array( 'eklendi' => count( $kayitlar ), 'atlanan' => $atlanan );
	}

	/** Listeyi düzenlenebilir metne çevirir. */
	public static function to_text( $invitation_id ) {
		$satir = array();
		foreach ( self::all( $invitation_id ) as $davetli ) {
			$parca = array( $davetli->name );
			if ( '' !== $davetli->phone || (int) $davetli->party_size > 1 ) {
				$parca[] = $davetli->phone;
			}
			if ( (int) $davetli->party_size > 1 ) {
				$parca[] = (string) (int) $davetli->party_size;
			}
			$satir[] = implode( ' | ', $parca );
		}
		return implode( "\n", $satir );
	}

	/**
	 * Listeyi gelen katılımlarla eşleştirir.
	 *
	 * Önce TELEFON, sonra ad. Numara daha güvenilir bir anahtar: iki
	 * "Mehmet Yılmaz" olabiliyor ama numaraları farklı. Adla eşleşme
	 * yalnızca numara yokken ya da tutmadığında deniyor.
	 *
	 * @param int $invitation_id Davetiye.
	 * @return array davetliler (her biri durum+kisi), listede_olmayan, sayilar.
	 */
	public static function reconcile( $invitation_id ) {
		global $wpdb;

		$invitation_id = (int) $invitation_id;
		$davetliler    = self::all( $invitation_id );

		$katilimlar = (array) $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				'SELECT id, name, phone, guest_count, attending FROM ' . Sahra_Tables::rsvps() . ' WHERE invitation_id = %d ORDER BY created_at ASC', // phpcs:ignore
				$invitation_id
			)
		);

		// Katılımlar anahtarlarına göre indeksleniyor.
		$tel_ile = array();
		$ad_ile  = array();
		foreach ( $katilimlar as $k ) {
			$t = self::tel_anahtari( $k->phone );
			if ( '' !== $t && ! isset( $tel_ile[ $t ] ) ) {
				$tel_ile[ $t ] = $k;
			}
			$a = self::ad_anahtari( $k->name );
			if ( '' !== $a && ! isset( $ad_ile[ $a ] ) ) {
				$ad_ile[ $a ] = $k;
			}
		}

		$kullanilan = array();
		$cikti      = array();

		foreach ( $davetliler as $davetli ) {
			$eslesen = null;

			$t = self::tel_anahtari( $davetli->phone );
			if ( '' !== $t && isset( $tel_ile[ $t ] ) && ! isset( $kullanilan[ (int) $tel_ile[ $t ]->id ] ) ) {
				$eslesen = $tel_ile[ $t ];
			}
			if ( ! $eslesen ) {
				$a = $davetli->match_key ? $davetli->match_key : self::ad_anahtari( $davetli->name );
				if ( '' !== $a && isset( $ad_ile[ $a ] ) && ! isset( $kullanilan[ (int) $ad_ile[ $a ]->id ] ) ) {
					$eslesen = $ad_ile[ $a ];
				}
			}

			if ( $eslesen ) {
				$kullanilan[ (int) $eslesen->id ] = true;
			}

			$cikti[] = array(
				'ad'         => $davetli->name,
				'telefon'    => $davetli->phone,
				'davet_kisi' => max( 1, (int) $davetli->party_size ),
				'durum'      => $eslesen ? ( (int) $eslesen->attending ? 'katiliyor' : 'katilmiyor' ) : 'cevapsiz',
				/*
				 * Gelen kişi sayısı BİLDİRİMDEN geliyor: çift dört kişi
				 * davet etmiş olabilir, misafir iki kişi geleceğini
				 * bildirmiş olabilir. Salona gidecek sayı bildirimdir.
				 */
				'gelen_kisi' => $eslesen && (int) $eslesen->attending ? max( 1, (int) $eslesen->guest_count ) : 0,
			);
		}

		// Listede olmayan ama katılım bildiren misafirler.
		$listede_olmayan = array();
		foreach ( $katilimlar as $k ) {
			if ( isset( $kullanilan[ (int) $k->id ] ) ) {
				continue;
			}
			$listede_olmayan[] = array(
				'ad'         => $k->name,
				'durum'      => (int) $k->attending ? 'katiliyor' : 'katilmiyor',
				'gelen_kisi' => (int) $k->attending ? max( 1, (int) $k->guest_count ) : 0,
			);
		}

		return array(
			'davetliler'      => $cikti,
			'listede_olmayan' => $listede_olmayan,
			'sayilar'         => self::sayilar( $cikti, $listede_olmayan ),
		);
	}

	/** Rapor ve panelin kullandığı toplamlar. */
	private static function sayilar( $davetliler, $listede_olmayan ) {
		$s = array(
			'davetli'         => count( $davetliler ),
			'davet_kisi'      => 0,
			'katiliyor'       => 0,
			'katilmiyor'      => 0,
			'cevapsiz'        => 0,
			'gelen_kisi'      => 0,
			'listede_olmayan' => count( $listede_olmayan ),
		);

		foreach ( $davetliler as $d ) {
			$s['davet_kisi'] += $d['davet_kisi'];
			$s[ $d['durum'] ]++;
			$s['gelen_kisi'] += $d['gelen_kisi'];
		}
		foreach ( $listede_olmayan as $d ) {
			$s['gelen_kisi'] += $d['gelen_kisi'];
			if ( 'katiliyor' === $d['durum'] ) {
				$s['katiliyor']++;
			} else {
				$s['katilmiyor']++;
			}
		}

		return $s;
	}
}
