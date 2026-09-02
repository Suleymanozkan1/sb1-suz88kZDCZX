<?php
/**
 * Davetiye sayfası — tam sayfa şablon.
 *
 * Tema başlığı/altbilgisi bilerek yüklenmiyor: sayfa perdeyle açılan tam
 * ekran bir sahne, temanın menüsü üstüne bindiğinde "bir WordPress
 * sayfasına gömülmüş" gibi görünür.
 *
 * @var array $davetiye
 * @var array $wishes
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$d       = $davetiye;
$conj    = $d['conjunction'] ? $d['conjunction'] : '&';

/*
 * Bölüm numarası sabit yazılamaz: bölümler kapatılabiliyor ve kapalı
 * olanın numarası boşluk bırakıyordu — "01, 03, 06" diye giden bir
 * davetiye. Numara çizim sırasında veriliyor.
 */
$sahra_sayac = 0;
$sahra_no    = static function () use ( &$sahra_sayac ) {
	$sahra_sayac++;
	return str_pad( (string) $sahra_sayac, 2, '0', STR_PAD_LEFT );
};

$marka = Sahra_Settings::brand();
// Gelin solda, damat sağda — panelden bağlantı adresine kadar aynı sıra.
$isimler = trim( $d['brideName'] . ' ' . $conj . ' ' . $d['groomName'] );
$tarih   = Sahra_Render::format_date( $d['weddingDate'] );
$gun     = Sahra_Render::format_weekday( $d['weddingDate'] );
$saat    = Sahra_Render::format_time_range( $d['weddingTime'], $d['weddingEndTime'] );
$muhur   = Sahra_Theme::seal_palette( $d['sealType'] );

$monogram = trim( $d['sealMonogram'] );
if ( '' === $monogram ) {
	$monogram = mb_substr( $d['brideName'], 0, 1 ) . ' ' . $conj . ' ' . mb_substr( $d['groomName'], 0, 1 );
}

$tam_adlar = array_filter(
	array(
		trim( $d['brideName'] . ' ' . $d['brideSurname'] ),
		trim( $d['groomName'] . ' ' . $d['groomSurname'] ),
	)
);

$adres_satiri = implode( ', ', array_filter( array( $d['address'], $d['district'], $d['city'] ) ) );
$konum_sorgu  = rawurlencode( trim( $d['venueName'] . ' ' . $adres_satiri ) );

$kart  = Sahra_Render::card_url( $d['slug'] );
$adres = Sahra_Invitation::url( $d['slug'] );

$geri_sayim = $d['weddingDate']
	? $d['weddingDate'] . 'T' . ( preg_match( '/^\d{2}:\d{2}$/', $d['weddingTime'] ) ? $d['weddingTime'] : '00:00' ) . ':00'
	: '';
?>
<!DOCTYPE html>
<html lang="tr" class="sahra-html no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
	<title><?php echo esc_html( $isimler . ' | ' . $tarih ); ?></title>
	<meta name="description" content="<?php echo esc_attr( $d['invitationText'] ? $d['invitationText'] : $isimler . ' düğün davetiyesi' ); ?>">

	<?php /* Paylaşım kartı: davetiye WhatsApp'ta görselsiz düz bir bağlantı olarak çıkmasın. */ ?>
	<meta property="og:type" content="website">
	<meta property="og:title" content="<?php echo esc_attr( $isimler . ' | Düğün Davetiyesi' ); ?>">
	<meta property="og:description" content="<?php echo esc_attr( implode( ' · ', array_filter( array( $tarih, $d['city'] ) ) ) ); ?>">
	<meta property="og:url" content="<?php echo esc_url( $adres ); ?>">
	<meta property="og:image" content="<?php echo esc_url( $kart ); ?>">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:image" content="<?php echo esc_url( $kart ); ?>">

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap&subset=latin,latin-ext" rel="stylesheet">
	<link rel="stylesheet" href="<?php echo esc_url( SAHRA_URL . 'assets/css/sahra.css?v=' . SAHRA_VERSION ); ?>">

	<?php /* Tema simgeleri en dışta: mühür perdesi ve müzik düğmesi de bu kapsamda kalmalı. */ ?>
	<style><?php echo '.sahra-page{' . esc_html( Sahra_Theme::style( $d['theme'] ) ) . '}'; ?></style>
</head>
<body class="sahra-page">

<div class="scroll-progress" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>

<?php /* ─────────────────────────────────────────────── perde ve mühür */ ?>
<div class="curtain"
	<?php
	/*
	 * Sahne sesleri SABİT dosyalar.
	 *
	 * Bu iki alan çiftin seçiminden çıkarıldığında şablon onları okumaya
	 * devam ediyordu: öznitelikler boş kalıyor, açılış sahnesi sessiz
	 * çalışıyor ve `display_errors` açık sunucularda PHP uyarısı doğrudan
	 * özniteliğin içine basılıyordu.
	 */
	?>
	data-seal-sound="<?php echo esc_url( SAHRA_URL . 'assets/muzik/muhur-kirilma.mp3' ); ?>"
	data-envelope-sound="<?php echo esc_url( SAHRA_URL . 'assets/muzik/zarf-acilma.mp3' ); ?>"
	data-volume="<?php echo esc_attr( (int) $d['soundVolume'] ); ?>"
	data-sound="<?php echo $d['soundEnabled'] ? '1' : '0'; ?>">
	<?php if ( $d['coverImage'] ) : ?>
		<?php
		/*
		 * Kapak fotoğrafı perdenin ARKASINDA duruyor: perde aralanırken
		 * ilk görünen kare çiftin kendi fotoğrafı oluyor. Next sürümünde
		 * hep böyleydi, WordPress'te yalnızca paylaşım kartında
		 * kullanılıyordu.
		 */
		?>
		<div class="curtain-cover" aria-hidden="true">
			<img src="<?php echo esc_url( $d['coverImage'] ); ?>" alt="">
		</div>
	<?php endif; ?>

	<div class="curtain-panel curtain-left">
		<div class="curtain-fabric-rich"></div>
		<div class="curtain-folds-left"></div>
		<div class="curtain-sheer"></div>
	</div>
	<div class="curtain-panel curtain-right">
		<div class="curtain-fabric-rich"></div>
		<div class="curtain-folds-right"></div>
		<div class="curtain-sheer"></div>
	</div>

	<div class="valance" aria-hidden="true">
		<?php for ( $i = 0; $i < 7; $i++ ) : ?>
			<div class="valance-swag"></div>
		<?php endfor; ?>
		<div class="curtain-fringe"></div>
	</div>

	<button type="button" class="skip">Geç →</button>

	<div class="curtain-stage">
		<p class="t-label" style="color:var(--c-gold)">Düğün Davetiyesi</p>
		<h1 class="t-display" style="color:var(--c-on-dark)"><?php echo esc_html( $isimler ); ?></h1>

		<button
			type="button"
			class="seal-button"
			aria-label="Mührü kırarak davetiyeyi aç"
			style="--seal-1:<?php echo esc_attr( $muhur['grad1'] ); ?>;--seal-2:<?php echo esc_attr( $muhur['grad2'] ); ?>;--seal-3:<?php echo esc_attr( $muhur['grad3'] ); ?>;--seal-glow:<?php echo esc_attr( $muhur['glow'] ); ?>">
			<span class="seal-glow" aria-hidden="true"></span>

			<?php if ( $d['sealImage'] ) : ?>
				<?php /* Çift kendi mühür görselini yüklediyse balmumu yerine o kullanılır. */ ?>
				<img class="seal-gorsel" src="<?php echo esc_url( $d['sealImage'] ); ?>" alt="<?php esc_attr_e( 'Mühür', 'sahra-davetiye' ); ?>">
			<?php else : ?>
				<?php
				/*
				 * Mühür SVG olarak çiziliyor.
				 *
				 * Önce CSS gradyanlı bir daireydi ve "Osmanlı Tuğrası"
				 * seçeneği gold balmumundan AYIRT EDİLEMİYORDU: ikisinin
				 * renk paleti aynı, farkı yalnızca tuğra kavisleri. Denetim
				 * dokuz seçenekten sekiz farklı görüntü buldu ve haklıydı.
				 */
				$muhur_mono   = Sahra_Render::tr_upper( str_replace( ' ', '', $monogram ) );
				// Tuğra yalnızca MÜHÜR seçimine bakar: mektup tasarımı da
				// hesaba katılınca dokuz mührün dokuzuna birden tuğra konuyor ve
				// "Osmanlı Tuğrası" seçeneği "Gold Balmumu"ndan ayırt edilemiyordu.
				$osmanli      = ( 'ottoman' === $d['sealType'] );
				?>
				<svg class="seal-svg" viewBox="0 0 110 110" aria-hidden="true">
					<defs>
						<radialGradient id="sahra-wax" cx="35%" cy="30%">
							<stop offset="0%" stop-color="<?php echo esc_attr( $muhur['grad1'] ); ?>"/>
							<stop offset="55%" stop-color="<?php echo esc_attr( $muhur['grad2'] ); ?>"/>
							<stop offset="100%" stop-color="<?php echo esc_attr( $muhur['grad3'] ); ?>"/>
						</radialGradient>
					</defs>

					<circle cx="55" cy="55" r="46" fill="url(#sahra-wax)"/>
					<circle cx="55" cy="55" r="38" fill="none" stroke="<?php echo esc_attr( $muhur['grad1'] ); ?>" stroke-width="0.8" opacity="0.55"/>

					<?php /* dış çentikler */ ?>
					<?php for ( $i = 0; $i < 24; $i++ ) : ?>
						<?php $a = deg2rad( 360 * $i / 24 ); ?>
						<line
							x1="<?php echo esc_attr( round( 55 + 38 * cos( $a ), 2 ) ); ?>"
							y1="<?php echo esc_attr( round( 55 + 38 * sin( $a ), 2 ) ); ?>"
							x2="<?php echo esc_attr( round( 55 + 44 * cos( $a ), 2 ) ); ?>"
							y2="<?php echo esc_attr( round( 55 + 44 * sin( $a ), 2 ) ); ?>"
							stroke="<?php echo esc_attr( $muhur['grad1'] ); ?>" stroke-width="0.7" opacity="0.45"/>
					<?php endfor; ?>

					<text x="55" y="63" text-anchor="middle" font-family="var(--f-display)"
						font-size="<?php echo mb_strlen( $muhur_mono ) > 3 ? 17 : 24; ?>" font-weight="500"
						letter-spacing="1" fill="<?php echo esc_attr( $muhur['grad1'] ); ?>">
						<?php echo esc_html( $muhur_mono ); ?>
					</text>

					<?php if ( $osmanli ) : ?>
						<?php /* Tuğra kavisleri — Osmanlı seçeneğini balmumundan ayıran işaret. */ ?>
						<path d="M30 78 C42 70 68 70 80 78" fill="none" stroke="<?php echo esc_attr( $muhur['grad1'] ); ?>" stroke-width="1" opacity="0.6"/>
						<path d="M38 32 C46 26 64 26 72 32" fill="none" stroke="<?php echo esc_attr( $muhur['grad1'] ); ?>" stroke-width="1" opacity="0.6"/>
					<?php endif; ?>
				</svg>
			<?php endif; ?>
		</button>

		<p class="t-lead" style="font-style:italic;color:var(--c-on-dark-faint)">Mührü kırarak perdeyi açın</p>
	</div>
</div>

<main class="journey">

	<div class="phase-dark">

		<?php /* ─────────────────────────────────────────────────── hero */ ?>
		<section id="hero" class="hero">
			<div class="wrap">
				<p class="t-label reveal" style="color:var(--c-gold)">Düğünümüze Davetlisiniz</p>

				<h1 class="t-hero hero-names reveal" style="margin-top:var(--sp-sm)">
					<?php echo esc_html( $d['brideName'] ); ?>
					<span class="hero-amp"><?php echo esc_html( $conj ); ?></span>
					<?php echo esc_html( $d['groomName'] ); ?>
				</h1>

				<?php
				/*
				 * Aileler, isimlerin hemen ALTINDA.
				 *
				 * Ayrı bir bölümdeyken sayfanın ortasında, isimlerden çok
				 * uzakta kalıyordu; oysa davetiyenin geleneğinde aileler
				 * çiftin adının altında durur. Küçük punto bilerek: burası
				 * kimin evlendiğini söyleyen yer, aileler onun altında
				 * ikinci satır.
				 *
				 * Gelin solda, damat sağda — sayfanın geri kalanıyla aynı sıra.
				 */
				$sahra_aile = array_filter( array( $d['brideFamilyText'], $d['groomFamilyText'] ) );
				?>
				<?php if ( $d['showFamily'] && $sahra_aile ) : ?>
					<div class="hero-aile reveal">
						<?php if ( $d['brideFamilyText'] ) : ?>
							<div class="hero-aile-taraf">
								<span class="t-label hero-aile-etiket">Gelin Ailesi</span>
								<span class="hero-aile-metin"><?php echo nl2br( esc_html( $d['brideFamilyText'] ) ); ?></span>
							</div>
						<?php endif; ?>
						<?php if ( $d['groomFamilyText'] ) : ?>
							<div class="hero-aile-taraf">
								<span class="t-label hero-aile-etiket">Damat Ailesi</span>
								<span class="hero-aile-metin"><?php echo nl2br( esc_html( $d['groomFamilyText'] ) ); ?></span>
							</div>
						<?php endif; ?>
					</div>
				<?php endif; ?>

				<div class="hero-meta t-body numerals reveal">
					<?php foreach ( array_filter( array( $tarih, $gun, $saat, $d['city'] ) ) as $parca ) : ?>
						<span><?php echo esc_html( $parca ); ?></span>
					<?php endforeach; ?>
				</div>

				<?php if ( $geri_sayim ) : ?>
					<div class="countdown reveal" data-countdown="<?php echo esc_attr( $geri_sayim ); ?>">
						<div><span class="val" data-gun>0</span><span class="lab">Gün</span></div>
						<div><span class="val" data-saat>00</span><span class="lab">Saat</span></div>
						<div><span class="val" data-dakika>00</span><span class="lab">Dakika</span></div>
						<div><span class="val" data-saniye>00</span><span class="lab">Saniye</span></div>
					</div>
				<?php endif; ?>

				<div class="hero-actions reveal">
					<a href="#rsvp" class="cta">Katılım Durumunu Belirt</a>
					<a href="#details" class="link-underline" style="color:var(--c-on-dark-soft)">Detayları Gör</a>
				</div>
			</div>

			<?php /* Kaydırma daveti — kompozisyonla aynı sol kenara hizalı. */ ?>
			<div class="kaydir-daveti">
				<span class="t-label">Kaydır</span>
				<span class="kaydir-cizgi" aria-hidden="true"></span>
			</div>
		</section>

		<?php /* ───────────────────────────────────────────────── mektup */ ?>
		<?php if ( $d['showLetter'] ) : ?>
		<section id="letter" class="section-gap">
			<div class="letter-wrap">
				<span class="letter-shadow" aria-hidden="true"></span>

				<article class="letter reveal <?php echo esc_attr( $d['invitationDesign'] ); ?>">
					<?php if ( 'vellum' === $d['invitationDesign'] ) : ?>
						<span class="veil" aria-hidden="true"></span>
					<?php endif; ?>

					<?php if ( in_array( $d['invitationDesign'], array( 'ottoman', 'classic', 'vellum' ), true ) ) : ?>
						<span class="frame" aria-hidden="true"></span>
					<?php endif; ?>

					<?php if ( $d['letterImage'] ) : ?>
						<div class="letter-photo">
							<img src="<?php echo esc_url( $d['letterImage'] ); ?>" alt="<?php echo esc_attr( implode( ' ' . $conj . ' ', $tam_adlar ) ); ?>">
						</div>
					<?php endif; ?>

					<p class="letter-monogram"><?php echo esc_html( $monogram ); ?></p>

					<?php if ( $d['invitationText'] ) : ?>
						<p class="letter-text"><?php echo esc_html( $d['invitationText'] ); ?></p>
					<?php endif; ?>

					<div class="letter-sign">
						<span class="stem" aria-hidden="true"></span>
						<?php if ( $tam_adlar ) : ?>
							<p class="letter-names"><?php echo esc_html( implode( '  ' . $conj . '  ', $tam_adlar ) ); ?></p>
						<?php endif; ?>
						<p class="letter-date numerals"><?php echo esc_html( implode( ' · ', array_filter( array( $tarih, $d['city'] ) ) ) ); ?></p>
					</div>
				</article>
			</div>
		</section>
		<?php endif; ?>
	</div>

	<div class="bridge bridge-to-light" aria-hidden="true"><span></span></div>

	<div class="phase-light">

		<?php /* ───────────────────────────────────────────────── hikaye */ ?>
		<?php if ( $d['showStory'] && ! empty( $d['storyItems'] ) ) : ?>
			<section id="story" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal">
						<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
						<span class="t-label">Bizim</span>
					</div>
					<h2 class="t-display section-title reveal">Hikayemiz</h2>

					<div class="timeline">
						<?php foreach ( $d['storyItems'] as $oge ) : ?>
							<div class="timeline-item reveal">
								<p class="timeline-year"><?php echo esc_html( isset( $oge['year'] ) ? $oge['year'] : '' ); ?></p>
								<p class="timeline-title"><?php echo esc_html( isset( $oge['title'] ) ? $oge['title'] : '' ); ?></p>
								<p class="timeline-desc t-body"><?php echo esc_html( isset( $oge['desc'] ) ? $oge['desc'] : '' ); ?></p>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</section>
		<?php endif; ?>

		<?php /* ───────────────────────────────────────────────── detaylar */ ?>
		<?php if ( $d['showDetails'] ) : ?>
		<section id="details" class="section-gap">
			<div class="wrap">
				<div class="section-head reveal">
					<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
					<span class="t-label">Detaylar</span>
				</div>
				<h2 class="t-display section-title reveal">Düğün Bilgileri</h2>

				<div class="detail-list">
					<div class="detail-row reveal">
						<span class="lab">Mekân</span>
						<span class="val"><?php echo esc_html( $d['venueName'] ? $d['venueName'] : '—' ); ?></span>
						<span class="sub"><?php echo esc_html( implode( ', ', array_filter( array( $d['district'], $d['city'] ) ) ) ); ?></span>
					</div>
					<div class="detail-row reveal">
						<span class="lab">Tarih</span>
						<span class="val numerals"><?php echo esc_html( $tarih ? $tarih : '—' ); ?></span>
						<span class="sub"><?php echo esc_html( $gun ); ?></span>
					</div>
					<div class="detail-row reveal">
						<span class="lab">Saat</span>
						<span class="val numerals"><?php echo esc_html( $saat ? $saat : '—' ); ?></span>
					</div>
					<?php if ( $d['address'] ) : ?>
						<div class="detail-row reveal">
							<span class="lab">Adres</span>
							<span class="val"><?php echo esc_html( $d['address'] ); ?></span>
							<span class="sub"><?php echo esc_html( $d['district'] ); ?></span>
						</div>
					<?php endif; ?>
				</div>

				<?php if ( $d['weddingDate'] ) : ?>
					<?php
					$takvim = add_query_arg(
						array(
							'action' => 'TEMPLATE',
							'text'   => rawurlencode( $isimler . ' Düğünü' ),
							'dates'  => Sahra_Render::calendar_stamp( $d['weddingDate'], $d['weddingTime'] ) . '/' . Sahra_Render::calendar_end_stamp( $d['weddingDate'], $d['weddingTime'], $d['weddingEndTime'] ),
							'location' => rawurlencode( trim( $d['venueName'] . ' ' . $adres_satiri ) ),
						),
						'https://calendar.google.com/calendar/render'
					);
					?>
					<p class="reveal" style="margin-top:var(--sp-md)">
						<a class="cta cta-on-light" href="<?php echo esc_url( $takvim ); ?>" target="_blank" rel="noopener">Takvime Ekle</a>
					</p>
				<?php endif; ?>
			</div>
		</section>
		<?php endif; ?>

		<?php /* ───────────────────────────────────────────────── program */ ?>
		<?php if ( $d['showProgram'] && ! empty( $d['programItems'] ) ) : ?>
			<section id="program" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal">
						<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
						<span class="t-label">Akış</span>
					</div>
					<h2 class="t-display section-title reveal">Günün Programı</h2>

					<div class="program-list">
						<?php foreach ( $d['programItems'] as $oge ) : ?>
							<div class="program-row reveal">
								<span class="lab numerals"><?php echo esc_html( isset( $oge['time'] ) ? $oge['time'] : '' ); ?></span>
								<span class="val"><?php echo esc_html( isset( $oge['title'] ) ? $oge['title'] : '' ); ?></span>
								<span class="sub"><?php echo esc_html( isset( $oge['desc'] ) ? $oge['desc'] : '' ); ?></span>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</section>
		<?php endif; ?>

		<?php /* ──────────────────────────────────────────────────── menü */ ?>
		<?php
		/*
		 * Menünün ADI davetiyede GÖRÜNMÜYOR.
		 *
		 * Misafir için "Menü-3" bir anlam taşımıyor; o, işletmeyle çift
		 * arasındaki bir numara. Başlık yalnızca "Menü", içerik ise çiftin
		 * üstünde oynayabildiği kopyası.
		 */
		?>
		<?php if ( $d['showMenu'] && ! empty( $d['menuGroups'] ) ) : ?>
			<section id="menu" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal">
						<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
						<span class="t-label">İkram</span>
					</div>
					<h2 class="t-display section-title reveal">Menü</h2>

					<div class="menu-grid">
						<?php foreach ( $d['menuGroups'] as $sahra_grup ) : ?>
							<div class="menu-grup reveal">
								<?php if ( ! empty( $sahra_grup['title'] ) ) : ?>
									<h3 class="menu-grup-baslik"><?php echo esc_html( $sahra_grup['title'] ); ?></h3>
								<?php endif; ?>
								<?php if ( ! empty( $sahra_grup['items'] ) ) : ?>
									<ul class="menu-liste">
										<?php foreach ( $sahra_grup['items'] as $sahra_oge ) : ?>
											<li><?php echo esc_html( $sahra_oge ); ?></li>
										<?php endforeach; ?>
									</ul>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</section>
		<?php endif; ?>

		<?php /* ────────────────────────────────────────────────── galeri */ ?>
		<?php if ( $d['showGallery'] ) : ?>
		<section id="gallery" class="section-gap">
			<div class="wrap">
				<div class="section-head reveal">
					<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
					<span class="t-label">Anılar</span>
				</div>
				<h2 class="t-display section-title reveal">Fotoğraf Galerisi</h2>

				<?php if ( ! empty( $d['galleryImages'] ) ) : ?>
					<div class="gallery">
						<?php foreach ( $d['galleryImages'] as $i => $src ) : ?>
							<button type="button" class="reveal" data-full="<?php echo esc_url( $src ); ?>" aria-label="<?php echo esc_attr( 'Anı ' . ( $i + 1 ) . ' — büyüt' ); ?>">
								<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( 'Anı ' . ( $i + 1 ) ); ?>" loading="lazy">
								<?php /* Üzerine gelince ince bir çerçeve içe doğru çizilir, altta sıra numarası belirir. */ ?>
								<span class="gal-cerceve" aria-hidden="true"></span>
								<span class="gal-no numerals" aria-hidden="true"><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
							</button>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<p class="t-body" style="color:var(--c-on-light-faint)">Fotoğraflar yakında burada olacak.</p>
				<?php endif; ?>
			</div>
		</section>
		<?php endif; ?>

		<?php /* ─────────────────────────────────────────────────── konum */ ?>
		<?php if ( $d['showLocation'] ) : ?>
		<section id="location" class="section-gap">
			<div class="wrap">
				<div class="section-head reveal">
					<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
					<span class="t-label">Konum</span>
				</div>
				<h2 class="t-display section-title reveal">Nasıl Gelirsiniz?</h2>

				<?php
				/*
				 * Harita sağda, bilgi solda: ortalanmış buton üçlüsü yerine
				 * asimetrik bir yerleşim — sayfanın ritmini kırıyor. Next
				 * sürümüyle birebir aynı düzen.
				 */
				?>
				<div class="konum-duzen">
					<div class="konum-bilgi reveal">
						<p class="t-h2" style="color:var(--c-on-light)"><?php echo esc_html( $d['venueName'] ); ?></p>
						<p class="t-body" style="color:var(--c-on-light-soft);margin-top:0.75rem"><?php echo esc_html( $adres_satiri ); ?></p>

						<?php if ( $d['venueDirections'] ) : ?>
							<p class="konum-tarif"><?php echo nl2br( esc_html( $d['venueDirections'] ) ); ?></p>
						<?php endif; ?>

						<?php
						/*
						 * Salonun özellikleri misafirin O AKŞAM vereceği kararları
						 * etkiliyor: arabayla mı geleyim, çocuğumu getirebilir
						 * miyim, tekerlekli sandalye geçer mi. Bu yüzden adresin
						 * hemen altında; ayrı bir bölüme koymak, sorunun
						 * sorulduğu yerden uzaklaştırmak olurdu.
						 */
						?>
						<?php if ( ! empty( $d['venueFeatures'] ) ) : ?>
							<ul class="salon-ozellik">
								<?php foreach ( $d['venueFeatures'] as $sahra_ozellik ) : ?>
									<li><span aria-hidden="true">✓</span><?php echo esc_html( $sahra_ozellik ); ?></li>
								<?php endforeach; ?>
							</ul>
						<?php endif; ?>

						<?php if ( $konum_sorgu ) : ?>
							<div class="konum-baglantilar">
								<a class="cta cta-on-light nudge" target="_blank" rel="noopener"
									href="<?php echo esc_url( 'https://www.google.com/maps/dir/?api=1&destination=' . $konum_sorgu ); ?>">
									Yol Tarifi Al
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>
									</svg>
								</a>
								<span class="konum-ikincil">
									<a class="link-underline" target="_blank" rel="noopener"
										href="<?php echo esc_url( $d['mapUrl'] ? $d['mapUrl'] : 'https://www.google.com/maps/search/?api=1&query=' . $konum_sorgu ); ?>">Google Maps</a>
									<?php
									/*
									 * Apple Haritalar iPhone'da yerleşik uygulamayı açıyor;
									 * misafirlerin önemli bir kısmı bu telefonu kullanıyor ve
									 * Google Maps kurulu olmayabiliyor. Diğer cihazlarda
									 * maps.apple.com bir web haritasına düşüyor, ölü bağlantı
									 * olmuyor.
									 */
									?>
									<a class="link-underline" target="_blank" rel="noopener"
										href="<?php echo esc_url( 'https://maps.apple.com/?q=' . $konum_sorgu ); ?>">Apple Haritalar</a>
									<a class="link-underline" target="_blank" rel="noopener"
										href="<?php echo esc_url( 'https://yandex.com.tr/harita/?text=' . $konum_sorgu ); ?>">Yandex Harita</a>
								</span>
							</div>
						<?php endif; ?>
					</div>

					<div class="map-frame reveal">
						<?php /* Haritanın ARKASI: Google engelli bir ağda yüklenmezse burası boş bir dikdörtgen kalmasın. */ ?>
						<div class="map-fallback" aria-hidden="true">
							<p class="t-label" style="color:var(--c-gold-deep)">Harita</p>
							<p class="t-h2"><?php echo esc_html( $d['venueName'] ); ?></p>
							<p class="t-body" style="color:var(--c-on-light-faint)"><?php echo esc_html( $adres_satiri ); ?></p>
						</div>

						<?php if ( $konum_sorgu ) : ?>
							<iframe
								src="<?php echo esc_url( 'https://www.google.com/maps?q=' . $konum_sorgu . '&output=embed' ); ?>"
								title="Düğün Lokasyonu"
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								allowfullscreen></iframe>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</section>
		<?php endif; ?>

		<?php /* ───────────────────────────────────────────────── çocuklar */ ?>
		<?php
		/*
		 * Eskiden bu bilgi SSS'te "Çocuklar davetli mi?" diye bir soru-cevaptı
		 * ve metni çift elle yazıyordu; çoğu zaman kırıcı çıkıyordu. Tek tik,
		 * iki hazır cümle. Kabul edilen söyleyiş: yetişkinlere yönelik bir
		 * düğünde çocuklara "iyi uykular" denir.
		 */
		?>
		<?php if ( $d['showChildren'] ) : ?>
			<section id="children" class="section-gap-kisa">
				<div class="wrap-narrow">
					<p class="cocuk-not reveal">
						<span class="cocuk-tik" aria-hidden="true">✓</span>
						<?php if ( $d['childrenWelcome'] ) : ?>
							<?php esc_html_e( 'Çocuklar da davetlidir — minik misafirlerimizi de bekliyoruz.', 'sahra-davetiye' ); ?>
						<?php else : ?>
							<?php esc_html_e( 'Düğünümüz yalnızca yetişkinlere yöneliktir — minik misafirlerimize iyi uykular.', 'sahra-davetiye' ); ?>
						<?php endif; ?>
					</p>
				</div>
			</section>
		<?php endif; ?>
	</div>

	<div class="bridge bridge-to-dark" aria-hidden="true"><span></span></div>

	<div class="phase-dark">

		<?php /* ────────────────────────────────────────────────── katılım */ ?>
		<?php if ( $d['showRsvp'] ) : ?>
		<section id="rsvp" class="section-gap">
			<div class="wrap-narrow">
				<div class="section-head reveal" style="color:var(--c-gold)">
					<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
					<span class="t-label">Katılım</span>
				</div>
				<h2 class="t-display section-title reveal" style="color:var(--c-on-dark)">Sizi Aramızda Görmek İsteriz</h2>

				<?php if ( $d['rsvpDeadline'] ) : ?>
					<p class="t-body reveal" style="margin-top:-1.5rem;margin-bottom:var(--sp-md);color:var(--c-on-dark-faint)">
						<?php
						/* translators: %s: son bildirim tarihi. */
						echo esc_html( sprintf( __( 'Lütfen %s tarihine kadar bildirim yapınız.', 'sahra-davetiye' ), Sahra_Render::format_date( $d['rsvpDeadline'] ) ) );
						?>
					</p>
				<?php endif; ?>

				<form id="rsvp-form" class="reveal" novalidate>
					<div class="field-row">
						<label class="field-label" for="rsvp-name">Ad Soyad</label>
						<input class="field" id="rsvp-name" type="text" name="name" required placeholder="Adınız">
					</div>

					<div class="field-row">
						<label class="field-label" for="rsvp-phone">Telefon</label>
						<input class="field" id="rsvp-phone" type="tel" name="phone" required placeholder="05xx xxx xx xx">
					</div>

					<div class="field-row">
						<span class="field-label">Katılacak mısınız?</span>
						<div class="choice">
							<button type="button" data-attend="evet" aria-pressed="true">Katılıyorum</button>
							<button type="button" data-attend="hayir" aria-pressed="false">Katılamıyorum</button>
						</div>
					</div>

					<?php
					/*
					 * "5+" yerine "Diğer" ve kesin sayı.
					 *
					 * Çift bu formu masa düzeni için okuyor: "5+" ona 5 mi 9 mu
					 * olduğunu söylemiyordu. Beşten fazlası için sayıyı misafir
					 * yazıyor.
					 */
					?>
					<div class="field-row" id="rsvp-count-row">
						<span class="field-label">Kaç Kişi Geleceksiniz?</span>
						<div class="choice">
							<?php foreach ( array( '1', '2', '3', '4' ) as $n ) : ?>
								<button type="button" data-count="<?php echo esc_attr( $n ); ?>" aria-pressed="<?php echo '1' === $n ? 'true' : 'false'; ?>"><?php echo esc_html( $n ); ?></button>
							<?php endforeach; ?>
							<button type="button" data-count="diger" aria-pressed="false">Diğer</button>
						</div>
						<label class="rsvp-diger" id="rsvp-count-other-row" hidden>
							<span class="field-label">Kaç Kişi?</span>
							<input class="field" id="rsvp-count-other" type="number" min="5" max="50" step="1" value="5" inputmode="numeric">
						</label>
					</div>

					<div class="field-row" id="rsvp-song-row">
						<label class="field-label" for="rsvp-song">Çalmasını İstediğiniz Şarkı (İsteğe Bağlı)</label>
						<input class="field" id="rsvp-song" type="text" placeholder="Şarkı ve sanatçı">
					</div>

					<div class="field-row">
						<label class="field-label" for="rsvp-note">Notunuz (İsteğe Bağlı)</label>
						<input class="field" id="rsvp-note" type="text" placeholder="Bir dilek bırakmak ister misiniz?">
					</div>

					<p class="form-note" role="alert"></p>

					<button type="submit" class="cta" style="margin-top:var(--sp-sm)">Gönder</button>
				</form>
			</div>
		</section>
		<?php endif; ?>

		<?php /* ─────────────────────────────────────────────────── hediye */ ?>
		<?php if ( $d['giftEnabled'] && ( $d['giftIban'] || $d['giftRegistryUrl'] ) ) : ?>
			<section id="gift" class="section-gap">
				<div class="wrap-narrow center">
					<div class="section-head reveal" style="color:var(--c-gold);justify-content:center">
						<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
						<span class="t-label">Hediye</span>
					</div>
					<h2 class="t-display section-title reveal" style="color:var(--c-on-dark)">Hediye</h2>

					<p class="t-body measure reveal" style="margin-inline:auto;color:var(--c-on-dark-soft)">
						<?php echo esc_html( $d['giftNote'] ? $d['giftNote'] : 'Varlığınız en büyük hediye. Yine de katkıda bulunmak isterseniz:' ); ?>
					</p>

					<?php if ( $d['giftIban'] ) : ?>
						<div class="reveal" style="margin-top:var(--sp-md)">
							<?php if ( $d['giftAccountName'] ) : ?>
								<p class="t-lead" style="color:var(--c-on-dark)"><?php echo esc_html( $d['giftAccountName'] ); ?></p>
							<?php endif; ?>
							<?php if ( $d['giftBankName'] ) : ?>
								<p class="t-label" style="color:var(--c-gold)"><?php echo esc_html( $d['giftBankName'] ); ?></p>
							<?php endif; ?>
							<p class="iban" style="margin-top:var(--sp-sm)"><?php echo esc_html( Sahra_Render::group_iban( $d['giftIban'] ) ); ?></p>
							<button type="button" class="cta" style="margin-top:var(--sp-sm)" data-copy="<?php echo esc_attr( Sahra_Render::group_iban( $d['giftIban'] ) ); ?>">IBAN’ı Kopyala</button>
						</div>
					<?php endif; ?>

					<?php if ( $d['giftRegistryUrl'] ) : ?>
						<p class="reveal" style="margin-top:var(--sp-md)">
							<a class="cta" href="<?php echo esc_url( $d['giftRegistryUrl'] ); ?>" target="_blank" rel="noopener">Hediye Listesi</a>
						</p>
					<?php endif; ?>
				</div>
			</section>
		<?php endif; ?>

		<?php /* ─────────────────────────────────────────────── dilek defteri */ ?>
		<?php if ( $d['wishesEnabled'] ) : ?>
			<section id="wishes" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal" style="color:var(--c-gold)">
						<span class="num numerals"><?php echo esc_html( $sahra_no() ); ?></span>
						<span class="t-label"><?php echo esc_html( $d['wishesSubtitle'] ? $d['wishesSubtitle'] : 'Bize Bir Not Bırakın' ); ?></span>
					</div>
					<h2 class="t-display section-title reveal" style="color:var(--c-on-dark)"><?php echo esc_html( $d['wishesTitle'] ? $d['wishesTitle'] : 'Dilek Defteri' ); ?></h2>

					<?php if ( $wishes ) : ?>
						<div class="wish-grid" style="margin-bottom:var(--sp-md)">
							<?php foreach ( $wishes as $dilek ) : ?>
								<div class="wish-card reveal">
									<blockquote>“<?php echo esc_html( $dilek->message ); ?>”</blockquote>
									<?php if ( $dilek->name ) : ?>
										<p class="who"><?php echo esc_html( $dilek->name ); ?></p>
									<?php endif; ?>
								</div>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>

					<form id="wish-form" class="reveal wrap-narrow" style="padding:0">
						<div class="field-row">
							<label class="field-label" for="wish-name">Adınız (İsteğe Bağlı)</label>
							<input class="field" id="wish-name" type="text" placeholder="Adınız">
						</div>
						<div class="field-row">
							<label class="field-label" for="wish-message">Dileğiniz</label>
							<textarea class="field" id="wish-message" rows="3" required placeholder="Bir iki satır…"></textarea>
						</div>

						<p class="form-note" role="alert"></p>
						<p class="form-ok" role="status"></p>

						<button type="submit" class="cta" style="margin-top:var(--sp-sm)">Dileğimi Bırak</button>
					</form>
				</div>
			</section>
		<?php endif; ?>

		<?php /* ──────────────────────────────────────────────── iletişim */ ?>
		<?php if ( $d['showContact'] ) : ?>
		<section id="contact" class="section-gap kapanis">
			<?php if ( $d['hashtag'] ) : ?>
				<?php /* Hayalet hashtag — arka planda, okunaklı olmayacak kadar sönük. */ ?>
				<span class="hayalet-etiket" aria-hidden="true"><?php echo esc_html( $d['hashtag'] ); ?></span>
			<?php endif; ?>
			<div class="wrap center" style="position:relative">
				<?php
				/*
				 * Site haritası değil, bir varış noktası: isimler sayfadaki en
				 * büyük ikinci tipografiyle geri gelir, başlık ise küçük bir
				 * etiket olarak üstte durur. Ziyaretçinin akılda tutacağı son
				 * kare budur — Next sürümüyle birebir aynı hiyerarşi.
				 */
				?>
				<p class="t-label reveal" style="color:var(--c-gold)">Görüşmek Üzere</p>
				<h2 class="t-display reveal" style="color:var(--c-on-dark);margin-top:var(--sp-sm)">
					<?php echo esc_html( $d['brideName'] ); ?>
					<em style="color:var(--c-gold)"><?php echo esc_html( $conj ); ?></em>
					<?php echo esc_html( $d['groomName'] ); ?>
				</h2>

				<?php
				/*
				 * Etiketleme bloğu: çiftin hesapları + İŞLETMENİN hesabı.
				 *
				 * İşletmenin hesabı davetiyeden değil ayardan geliyor — her
				 * çifte ayrı yazdırmak, birinin yanlış yazması ve kimsenin
				 * fark etmemesi demekti.
				 */
				$sahra_etiketler = array();
				foreach ( (array) $d['socialLinks'] as $bag ) {
					if ( ! empty( $bag['href'] ) ) {
						$sahra_etiketler[] = array(
							'name' => ! empty( $bag['name'] ) ? $bag['name'] : $bag['href'],
							'href' => $bag['href'],
						);
					}
				}
				if ( $marka['instagram'] ) {
					$sahra_etiketler[] = array(
						'name' => $marka['instagramLabel'] ? $marka['instagramLabel'] : 'Sahra Davet',
						'href' => $marka['instagram'],
					);
				}
				?>
				<?php if ( $d['showSocial'] && ( $d['hashtag'] || $sahra_etiketler ) ) : ?>
					<div class="etiket-blok reveal">
						<p class="t-label" style="color:var(--c-gold)">Etiketlemeyi Unutmayın</p>

						<?php if ( $sahra_etiketler ) : ?>
							<p class="etiket-hesaplar">
								<?php foreach ( $sahra_etiketler as $sahra_bag ) : ?>
									<a class="link-underline" href="<?php echo esc_url( $sahra_bag['href'] ); ?>" target="_blank" rel="noopener">
										<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
											<rect x="3.5" y="3.5" width="17" height="17" rx="5"/>
											<circle cx="12" cy="12" r="4"/>
											<circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>
										</svg>
										<?php echo esc_html( $sahra_bag['name'] ); ?>
									</a>
								<?php endforeach; ?>
							</p>
						<?php endif; ?>

						<?php if ( $d['hashtag'] ) : ?>
							<p class="etiket-hashtag"><?php echo esc_html( $d['hashtag'] ); ?></p>
						<?php endif; ?>
					</div>
				<?php endif; ?>

				<p class="reveal" style="margin-top:var(--sp-md);display:flex;gap:var(--sp-sm);justify-content:center;flex-wrap:wrap">
					<button type="button" class="cta" data-share>Davetiyeyi Paylaş</button>
					<button type="button" class="cta" data-copy="<?php echo esc_attr( $adres ); ?>">Bağlantıyı Kopyala</button>
				</p>

				<p class="t-label reveal" style="color:var(--c-on-dark-faint);margin-top:var(--sp-lg)">Sevgiyle hazırlandı</p>
			</div>
		</section>
		<?php endif; ?>
	</div>
</main>

<?php if ( $d['soundEnabled'] && $d['backgroundMusicUrl'] ) : ?>
	<button type="button" class="music-toggle"
		data-src="<?php echo esc_url( $d['backgroundMusicUrl'] ); ?>"
		data-volume="<?php echo esc_attr( (int) $d['soundVolume'] ); ?>"
		aria-pressed="false" aria-label="Müziği çal">
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<rect x="1" y="6" width="2" height="4" fill="currentColor"/>
			<rect x="5" y="3" width="2" height="10" fill="currentColor"/>
			<rect x="9" y="5" width="2" height="6" fill="currentColor"/>
			<rect x="13" y="7" width="2" height="2" fill="currentColor"/>
		</svg>
	</button>
<?php endif; ?>

<div class="lightbox" role="dialog" aria-modal="true" aria-label="Fotoğraf">
	<button type="button" class="close" aria-label="Kapat">×</button>
	<button type="button" class="nav prev" aria-label="Önceki">‹</button>
	<img src="" alt="">
	<button type="button" class="nav next" aria-label="Sonraki">›</button>
</div>

<script>
window.SahraVeri = {
	rest: <?php echo wp_json_encode( esc_url_raw( rest_url( Sahra_Rest::NS . '/' ) ) ); ?>,
	slug: <?php echo wp_json_encode( $d['slug'] ); ?>
};
</script>
<script src="<?php echo esc_url( SAHRA_URL . 'assets/js/sahra.js?v=' . SAHRA_VERSION ); ?>"></script>
</body>
</html>
