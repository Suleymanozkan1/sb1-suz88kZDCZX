<?php
/**
 * Tema ve mühür renkleri — `src/lib/theme.ts` portu.
 *
 * Değerler Next sürümüyle BİREBİR aynı olmak zorunda: iki site aynı
 * görünecekse renkler tek bir sayı bile kaymamalı. Ölçüm de oradan
 * geliyor — beş temanın da en zayıf metni 6.16:1 (AA eşiği 4.5:1).
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Theme {

	public static function tokens() {
		return array(
			'cream-gold'      => array(
				'night' => '#0d0805', 'ink' => '#15100a', 'ember' => '#2a1a0e', 'bronze' => '#6b4a2a',
				'tan' => '#c4a077', 'sand' => '#e6d9c2', 'cream' => '#f2ebdc',
				'gold' => '#c39a48', 'goldLight' => '#e8d5a4', 'goldDeep' => '#5a4413',
				'onLight' => '#1f1409', 'onDark' => '#f6efe1',
				'paperHi' => '#f9f4e9',
				'veilA' => 'rgba(255,255,255,0.55)', 'veilB' => 'rgba(255,255,255,0.2)',
				'veilEdge' => 'rgba(255,255,255,0.6)',
				'foil' => 'linear-gradient(135deg, #6f551c 0%, #b8934a 42%, #61491a 100%)',
				'bridgeA' => '#4a2f18', 'bridgeB' => '#9a7550', 'bridgeC' => '#ddc9a8',
			),
			'ottoman-premium' => array(
				'night' => '#120802', 'ink' => '#1d1006', 'ember' => '#3a1e0b', 'bronze' => '#7d5122',
				'tan' => '#cba36c', 'sand' => '#e9dabb', 'cream' => '#f5eddb',
				'gold' => '#cfa246', 'goldLight' => '#f0dfae', 'goldDeep' => '#54400f',
				'onLight' => '#241708', 'onDark' => '#f8f0dd',
				'paperHi' => '#fbf5e6',
				'veilA' => 'rgba(255,255,255,0.55)', 'veilB' => 'rgba(255,255,255,0.2)',
				'veilEdge' => 'rgba(255,255,255,0.62)',
				'foil' => 'linear-gradient(135deg, #664c12 0%, #b08f42 42%, #57420f 100%)',
				'bridgeA' => '#4f2d12', 'bridgeB' => '#9d7448', 'bridgeC' => '#e0c9a2',
			),
			'minimal-white'   => array(
				'night' => '#141414', 'ink' => '#1c1c1c', 'ember' => '#2e2e2e', 'bronze' => '#6e6e6e',
				'tan' => '#b6b6b6', 'sand' => '#e8e8e8', 'cream' => '#f7f7f7',
				'gold' => '#9a9a9a', 'goldLight' => '#dcdcdc', 'goldDeep' => '#3f3f3f',
				'onLight' => '#161616', 'onDark' => '#f4f4f4',
				'paperHi' => '#ffffff',
				'veilA' => 'rgba(255,255,255,0.6)', 'veilB' => 'rgba(255,255,255,0.24)',
				'veilEdge' => 'rgba(255,255,255,0.7)',
				'foil' => 'linear-gradient(135deg, #3f3f3f 0%, #7d7d7d 42%, #333333 100%)',
				'bridgeA' => '#3a3a3a', 'bridgeB' => '#8f8f8f', 'bridgeC' => '#dcdcdc',
			),
			'beige-gold'      => array(
				'night' => '#1b140b', 'ink' => '#241a0f', 'ember' => '#3a2b17', 'bronze' => '#7d6234',
				'tan' => '#cbb184', 'sand' => '#e7dcc4', 'cream' => '#f4eede',
				'gold' => '#b8913f', 'goldLight' => '#e2cd97', 'goldDeep' => '#54400f',
				'onLight' => '#261c0c', 'onDark' => '#f6f0e2',
				'paperHi' => '#faf5ea',
				'veilA' => 'rgba(255,255,255,0.52)', 'veilB' => 'rgba(255,255,255,0.18)',
				'veilEdge' => 'rgba(255,255,255,0.58)',
				'foil' => 'linear-gradient(135deg, #614a16 0%, #a98c45 42%, #554013 100%)',
				'bridgeA' => '#4a3a20', 'bridgeB' => '#977d4e', 'bridgeC' => '#ddccaa',
			),
			// Açık evre de koyu kalır: baştan sona gece.
			'dark-premium'    => array(
				'night' => '#080503', 'ink' => '#100b06', 'ember' => '#1d140b', 'bronze' => '#4a3620',
				'tan' => '#8a6f4a', 'sand' => '#241a10', 'cream' => '#2b2015',
				'gold' => '#d4b978', 'goldLight' => '#f2e6c6', 'goldDeep' => '#e8d5a3',
				'onLight' => '#f4ead6', 'onDark' => '#f7efdd',
				'paperHi' => '#3a2c1d',
				'veilA' => 'rgba(232,213,163,0.12)', 'veilB' => 'rgba(232,213,163,0.04)',
				'veilEdge' => 'rgba(232,213,163,0.28)',
				'foil' => 'linear-gradient(135deg, #b89a5c 0%, #f2e3b4 42%, #a98d52 100%)',
				'bridgeA' => '#140d07', 'bridgeB' => '#1d1409', 'bridgeC' => '#241a10',
			),
		);
	}

	public static function seal_palettes() {
		return array(
			'gold-wax'     => array( '#F5E6B8', '#C9A84C', '#6B4F1A', 'rgba(201,168,76,0.7)' ),
			'burgundy-wax' => array( '#E8A0A0', '#8B2635', '#3A0812', 'rgba(139,38,53,0.7)' ),
			'emerald-wax'  => array( '#D4AF37', '#1B4332', '#0A1F14', 'rgba(27,67,50,0.6)' ),
			'bronze-wax'   => array( '#F5EDE0', '#B8956A', '#5C4020', 'rgba(184,149,106,0.6)' ),
			'silver-wax'   => array( '#F0EDE8', '#9A9088', '#4A4540', 'rgba(154,144,136,0.5)' ),
			'navy-wax'     => array( '#A8BEDC', '#1E3A5F', '#0A1626', 'rgba(30,58,95,0.65)' ),
			'rose-wax'     => array( '#F3CFC6', '#B76E79', '#5E2F36', 'rgba(183,110,121,0.6)' ),
			'ivory-wax'    => array( '#FBF6EC', '#DDCFB4', '#8A7A5C', 'rgba(221,207,180,0.55)' ),
			'ottoman'      => array( '#F5E6B8', '#C9A84C', '#6B4F1A', 'rgba(201,168,76,0.7)' ),
		);
	}

	public static function seal_palette( $seal ) {
		$hepsi = self::seal_palettes();
		$p     = isset( $hepsi[ $seal ] ) ? $hepsi[ $seal ] : $hepsi['gold-wax'];
		return array(
			'grad1' => $p[0],
			'grad2' => $p[1],
			'grad3' => $p[2],
			'glow'  => $p[3],
		);
	}

	public static function theme( $id ) {
		$hepsi = self::tokens();
		return isset( $hepsi[ $id ] ) ? $hepsi[ $id ] : $hepsi['cream-gold'];
	}

	/** #rrggbb → rgba(...) */
	public static function alpha( $hex, $alpha ) {
		$h = ltrim( (string) $hex, '#' );
		if ( 3 === strlen( $h ) ) {
			$h = $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
		}
		$n = hexdec( $h );
		return sprintf( 'rgba(%d, %d, %d, %s)', ( $n >> 16 ) & 255, ( $n >> 8 ) & 255, $n & 255, $alpha );
	}

	/**
	 * Temanın CSS özel değişkenleri.
	 *
	 * Yumuşak/soluk metin tonları ve kural çizgileri BURADA türetiliyor.
	 * Sabit bırakılsalardı koyu temada açık zeminin metni kâğıdın rengine
	 * karışıyordu — Next sürümünde tam olarak bu hata yaşandı.
	 */
	public static function style( $id ) {
		$t = self::theme( $id );

		$degerler = array(
			'--c-night'          => $t['night'],
			'--c-ink'            => $t['ink'],
			'--c-ember'          => $t['ember'],
			'--c-bronze'         => $t['bronze'],
			'--c-tan'            => $t['tan'],
			'--c-sand'           => $t['sand'],
			'--c-cream'          => $t['cream'],
			'--c-gold'           => $t['gold'],
			'--c-gold-light'     => $t['goldLight'],
			'--c-gold-deep'      => $t['goldDeep'],
			'--c-on-light'       => $t['onLight'],
			'--c-on-light-soft'  => self::alpha( $t['onLight'], '0.92' ),
			'--c-on-light-faint' => self::alpha( $t['onLight'], '0.78' ),
			'--c-on-dark'        => $t['onDark'],
			'--c-on-dark-soft'   => self::alpha( $t['onDark'], '0.88' ),
			'--c-on-dark-faint'  => self::alpha( $t['onDark'], '0.72' ),
			'--c-rule'           => self::alpha( $t['goldDeep'], '0.32' ),
			'--c-rule-dark'      => self::alpha( $t['goldLight'], '0.3' ),
			'--c-paper-hi'       => $t['paperHi'],
			'--c-veil-a'         => $t['veilA'],
			'--c-veil-b'         => $t['veilB'],
			'--c-veil-edge'      => $t['veilEdge'],
			'--c-foil'           => $t['foil'],
			'--c-bridge-a'       => $t['bridgeA'],
			'--c-bridge-b'       => $t['bridgeB'],
			'--c-bridge-c'       => $t['bridgeC'],
		);

		$parcalar = array();
		foreach ( $degerler as $anahtar => $deger ) {
			$parcalar[] = $anahtar . ':' . $deger;
		}
		return implode( ';', $parcalar );
	}

	/** WCAG bağıl parlaklık — paylaşım kartında monogram rengi seçmek için. */
	public static function luminance( $hex ) {
		$h = ltrim( (string) $hex, '#' );
		if ( 3 === strlen( $h ) ) {
			$h = $h[0] . $h[0] . $h[1] . $h[1] . $h[2] . $h[2];
		}
		$n     = hexdec( $h );
		$kanal = array( ( $n >> 16 ) & 255, ( $n >> 8 ) & 255, $n & 255 );
		$cikti = array();
		foreach ( $kanal as $v ) {
			$x       = $v / 255;
			$cikti[] = $x <= 0.04045 ? $x / 12.92 : pow( ( $x + 0.055 ) / 1.055, 2.4 );
		}
		return 0.2126 * $cikti[0] + 0.7152 * $cikti[1] + 0.0722 * $cikti[2];
	}

	/** İki aday arasından zemine göre daha okunaklı olanı. */
	public static function readable_on( $bg, $a, $b ) {
		$z    = self::luminance( $bg );
		$oran = static function ( $renk ) use ( $z ) {
			$l = Sahra_Theme::luminance( $renk );
			return $l > $z ? ( $l + 0.05 ) / ( $z + 0.05 ) : ( $z + 0.05 ) / ( $l + 0.05 );
		};
		return $oran( $a ) >= $oran( $b ) ? $a : $b;
	}
}
