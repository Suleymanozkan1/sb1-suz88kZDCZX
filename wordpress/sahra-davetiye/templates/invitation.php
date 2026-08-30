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
$isimler = trim( $d['groomName'] . ' ' . $conj . ' ' . $d['brideName'] );
$tarih   = Sahra_Render::format_date( $d['weddingDate'] );
$gun     = Sahra_Render::format_weekday( $d['weddingDate'] );
$saat    = Sahra_Render::format_time_range( $d['weddingTime'], $d['weddingEndTime'] );
$muhur   = Sahra_Theme::seal_palette( $d['sealType'] );

$monogram = trim( $d['sealMonogram'] );
if ( '' === $monogram ) {
	$monogram = mb_substr( $d['groomName'], 0, 1 ) . ' ' . $conj . ' ' . mb_substr( $d['brideName'], 0, 1 );
}

$tam_adlar = array_filter(
	array(
		trim( $d['groomName'] . ' ' . $d['groomSurname'] ),
		trim( $d['brideName'] . ' ' . $d['brideSurname'] ),
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
<div class="curtain" data-seal-sound="<?php echo esc_url( $d['sealBreakSound'] ); ?>">
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
			<span class="seal-disc" aria-hidden="true"></span>
			<span class="seal-monogram" style="color:<?php echo esc_attr( Sahra_Theme::readable_on( $muhur['grad2'], $muhur['grad1'], $muhur['grad3'] ) ); ?>">
				<?php echo esc_html( Sahra_Render::tr_upper( str_replace( ' ', '', $monogram ) ) ); ?>
			</span>
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
					<?php echo esc_html( $d['groomName'] ); ?>
					<span class="hero-amp"><?php echo esc_html( $conj ); ?></span>
					<?php echo esc_html( $d['brideName'] ); ?>
				</h1>

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
					<a href="#details" class="link-underline" style="color:var(--c-on-dark-faint)">Detayları Gör</a>
				</div>
			</div>
		</section>

		<?php /* ───────────────────────────────────────────────── mektup */ ?>
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
	</div>

	<div class="bridge bridge-to-light" aria-hidden="true"><span></span></div>

	<div class="phase-light">

		<?php /* ───────────────────────────────────────────────── hikaye */ ?>
		<?php if ( ! empty( $d['storyItems'] ) ) : ?>
			<section id="story" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal">
						<span class="num numerals">01</span>
						<span class="t-label"><?php echo esc_html( $d['storySectionSubtitle'] ? $d['storySectionSubtitle'] : 'Bizim' ); ?></span>
					</div>
					<h2 class="t-display section-title reveal"><?php echo esc_html( $d['storySectionTitle'] ? $d['storySectionTitle'] : 'Hikayemiz' ); ?></h2>

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
		<section id="details" class="section-gap">
			<div class="wrap">
				<div class="section-head reveal">
					<span class="num numerals">02</span>
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
						<span class="sub">Kapılar yarım saat önce açılır</span>
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

		<?php /* ───────────────────────────────────────────────── program */ ?>
		<?php if ( ! empty( $d['programItems'] ) ) : ?>
			<section id="program" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal">
						<span class="num numerals">03</span>
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

		<?php /* ────────────────────────────────────────────────── galeri */ ?>
		<section id="gallery" class="section-gap">
			<div class="wrap">
				<div class="section-head reveal">
					<span class="num numerals">04</span>
					<span class="t-label"><?php echo esc_html( $d['gallerySectionSubtitle'] ? $d['gallerySectionSubtitle'] : 'Anılar' ); ?></span>
				</div>
				<h2 class="t-display section-title reveal"><?php echo esc_html( $d['gallerySectionTitle'] ? $d['gallerySectionTitle'] : 'Fotoğraf Galerisi' ); ?></h2>

				<?php if ( ! empty( $d['galleryImages'] ) ) : ?>
					<div class="gallery">
						<?php foreach ( $d['galleryImages'] as $i => $src ) : ?>
							<button type="button" class="reveal" data-full="<?php echo esc_url( $src ); ?>" aria-label="<?php echo esc_attr( 'Anı ' . ( $i + 1 ) . ' — büyüt' ); ?>">
								<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( 'Anı ' . ( $i + 1 ) ); ?>" loading="lazy">
							</button>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<p class="t-body" style="color:var(--c-on-light-faint)">Fotoğraflar yakında burada olacak.</p>
				<?php endif; ?>
			</div>
		</section>

		<?php /* ─────────────────────────────────────────────────── konum */ ?>
		<section id="location" class="section-gap">
			<div class="wrap">
				<div class="section-head reveal">
					<span class="num numerals">05</span>
					<span class="t-label">Konum</span>
				</div>
				<h2 class="t-display section-title reveal">Nasıl Gelirsiniz?</h2>

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

				<?php if ( $konum_sorgu ) : ?>
					<p class="reveal" style="margin-top:var(--sp-md);display:flex;gap:var(--sp-sm);flex-wrap:wrap">
						<a class="cta cta-on-light" target="_blank" rel="noopener"
							href="<?php echo esc_url( $d['mapUrl'] ? $d['mapUrl'] : 'https://www.google.com/maps/search/?api=1&query=' . $konum_sorgu ); ?>">Google Maps</a>
						<a class="cta cta-on-light" target="_blank" rel="noopener"
							href="<?php echo esc_url( 'https://www.google.com/maps/dir/?api=1&destination=' . $konum_sorgu ); ?>">Yol Tarifi</a>
					</p>
				<?php endif; ?>
			</div>
		</section>

		<?php /* ───────────────────────────────────────────────────── SSS */ ?>
		<?php if ( ! empty( $d['faqItems'] ) ) : ?>
			<section id="faq" class="section-gap">
				<div class="wrap">
					<div class="section-head reveal">
						<span class="num numerals">06</span>
						<span class="t-label">Merak Edilenler</span>
					</div>
					<h2 class="t-display section-title reveal">Sık Sorulan Sorular</h2>

					<div class="faq-list">
						<?php foreach ( $d['faqItems'] as $i => $oge ) : ?>
							<div class="faq-item reveal">
								<button type="button" class="faq-q" aria-expanded="false">
									<span><?php echo esc_html( isset( $oge['q'] ) ? $oge['q'] : '' ); ?></span>
									<span aria-hidden="true">+</span>
								</button>
								<div class="faq-a">
									<p class="t-body"><?php echo esc_html( isset( $oge['a'] ) ? $oge['a'] : '' ); ?></p>
								</div>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			</section>
		<?php endif; ?>
	</div>

	<div class="bridge bridge-to-dark" aria-hidden="true"><span></span></div>

	<div class="phase-dark">

		<?php /* ────────────────────────────────────────────────── katılım */ ?>
		<section id="rsvp" class="section-gap">
			<div class="wrap-narrow">
				<div class="section-head reveal" style="color:var(--c-gold)">
					<span class="num numerals">07</span>
					<span class="t-label">Katılım</span>
				</div>
				<h2 class="t-display section-title reveal" style="color:var(--c-on-dark)">Sizi Aramızda Görmek İsteriz</h2>

				<form id="rsvp-form" class="reveal" novalidate>
					<div class="field-row">
						<label class="field-label" for="rsvp-name">Ad Soyad</label>
						<input class="field" id="rsvp-name" name="name" required placeholder="Adınız">
					</div>

					<div class="field-row">
						<label class="field-label" for="rsvp-phone">Telefon</label>
						<input class="field" id="rsvp-phone" name="phone" required placeholder="05xx xxx xx xx">
					</div>

					<div class="field-row">
						<span class="field-label">Katılacak mısınız?</span>
						<div class="choice">
							<button type="button" data-attend="evet" aria-pressed="true">Katılıyorum</button>
							<button type="button" data-attend="hayir" aria-pressed="false">Katılamıyorum</button>
						</div>
					</div>

					<div class="field-row" id="rsvp-count-row">
						<span class="field-label">Kaç Kişi Geleceksiniz?</span>
						<div class="choice">
							<?php foreach ( array( '1', '2', '3', '4', '5+' ) as $n ) : ?>
								<button type="button" data-count="<?php echo esc_attr( $n ); ?>" aria-pressed="<?php echo '1' === $n ? 'true' : 'false'; ?>"><?php echo esc_html( $n ); ?></button>
							<?php endforeach; ?>
						</div>
					</div>

					<div class="field-row" id="rsvp-song-row">
						<label class="field-label" for="rsvp-song">Çalmasını İstediğiniz Şarkı (İsteğe Bağlı)</label>
						<input class="field" id="rsvp-song" placeholder="Şarkı ve sanatçı">
					</div>

					<div class="field-row">
						<label class="field-label" for="rsvp-note">Notunuz (İsteğe Bağlı)</label>
						<input class="field" id="rsvp-note" placeholder="Bir dilek bırakmak ister misiniz?">
					</div>

					<p class="form-note" role="alert"></p>

					<button type="submit" class="cta" style="margin-top:var(--sp-sm)">Gönder</button>
				</form>
			</div>
		</section>

		<?php /* ─────────────────────────────────────────────────── hediye */ ?>
		<?php if ( $d['giftEnabled'] && ( $d['giftIban'] || $d['giftRegistryUrl'] ) ) : ?>
			<section id="gift" class="section-gap">
				<div class="wrap-narrow center">
					<div class="section-head reveal" style="color:var(--c-gold);justify-content:center">
						<span class="num numerals">08</span>
						<span class="t-label">Hediye</span>
					</div>
					<h2 class="t-display section-title reveal" style="color:var(--c-on-dark)"><?php echo esc_html( $d['giftTitle'] ? $d['giftTitle'] : 'Hediye' ); ?></h2>

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
						<span class="num numerals">09</span>
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
							<label class="field-label" for="wish-name">Adınız</label>
							<input class="field" id="wish-name" placeholder="Adınız">
						</div>
						<div class="field-row">
							<label class="field-label" for="wish-message">Dileğiniz</label>
							<textarea class="field" id="wish-message" rows="3" required placeholder="Bir iki satır…"></textarea>
						</div>

						<p class="form-note" role="alert"></p>
						<p class="form-ok" role="status"></p>

						<button type="submit" class="cta" style="margin-top:var(--sp-sm)">Dileğimi Gönder</button>
					</form>
				</div>
			</section>
		<?php endif; ?>

		<?php /* ──────────────────────────────────────────────── iletişim */ ?>
		<section id="contact" class="section-gap">
			<div class="wrap center">
				<h2 class="t-display reveal" style="color:var(--c-on-dark)">Görüşmek Üzere</h2>
				<p class="t-lead reveal" style="color:var(--c-gold);margin-top:var(--sp-sm)"><?php echo esc_html( $isimler ); ?></p>

				<?php if ( $d['hashtag'] ) : ?>
					<p class="t-label reveal" style="color:var(--c-on-dark-faint);margin-top:var(--sp-sm)"><?php echo esc_html( $d['hashtag'] ); ?></p>
				<?php endif; ?>

				<?php if ( ! empty( $d['socialLinks'] ) ) : ?>
					<p class="reveal" style="margin-top:var(--sp-sm);display:flex;gap:var(--sp-sm);justify-content:center;flex-wrap:wrap">
						<?php foreach ( $d['socialLinks'] as $bag ) : ?>
							<?php if ( ! empty( $bag['href'] ) ) : ?>
								<a class="link-underline" style="color:var(--c-on-dark-soft)" href="<?php echo esc_url( $bag['href'] ); ?>" target="_blank" rel="noopener">
									<?php echo esc_html( isset( $bag['name'] ) ? $bag['name'] : $bag['href'] ); ?>
								</a>
							<?php endif; ?>
						<?php endforeach; ?>
					</p>
				<?php endif; ?>

				<p class="reveal" style="margin-top:var(--sp-md);display:flex;gap:var(--sp-sm);justify-content:center;flex-wrap:wrap">
					<button type="button" class="cta" data-share>Davetiyeyi Paylaş</button>
					<button type="button" class="cta" data-copy="<?php echo esc_attr( $adres ); ?>">Bağlantıyı Kopyala</button>
				</p>

				<p class="t-label reveal" style="color:var(--c-on-dark-faint);margin-top:var(--sp-lg)">Sevgiyle Hazırlandı</p>
			</div>
		</section>
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
