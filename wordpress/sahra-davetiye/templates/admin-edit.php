<?php
/**
 * Davetiye sihirbazı.
 *
 * Next sürümündeki on iki adımın karşılığı: çipler, ilerleme çizgisi,
 * "İleri / Geri" ve her adımda çalışan "Şimdi Kaydet". Tek form, tek
 * gönderim — adımlar yalnızca görünürlük.
 *
 * @var array $d
 * @var array $metinler
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$yeni        = empty( $d['id'] );
$yonetici    = Sahra_Roles::is_manager();
$venue       = Sahra_Settings::venue();
$sahra_sayfa = 'sahra-davetiye-duzenle';

$conj     = $d['conjunction'] ? $d['conjunction'] : '&';
$onizleme = trim( ( $d['groomName'] ? $d['groomName'] : 'Damat' ) . ' ' . $conj . ' ' . ( $d['brideName'] ? $d['brideName'] : 'Gelin' ) );

$adimlar = array(
	'Çift Bilgileri',
	'Düğün Bilgileri',
	'Davet Metni',
	'Mühür & Tuğra',
	'Mektup Tasarımı',
	'Fotoğraflar',
	'Hediye & Dilekler',
	'Ses Ayarları',
	'Tema',
	'Program',
	'SSS',
	'Hikayemiz',
);

$sahra_eylem = $yeni ? '' : sprintf(
	'<a class="eylem-link" href="%s" target="_blank" rel="noopener">%s</a>',
	esc_url( Sahra_Invitation::url( $d['slug'] ) ),
	esc_html__( 'Önizle', 'sahra-davetiye' )
);

include SAHRA_DIR . 'templates/admin-header.php';
?>

	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Kaydedildi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem">
				<?php if ( ! $yeni ) : ?>
					<a href="<?php echo esc_url( Sahra_Invitation::url( $d['slug'] ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Davetiyeyi görüntüle', 'sahra-davetiye' ); ?></a>
				<?php endif; ?>
			</p>
		</div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="t-label"><?php esc_html_e( 'Davetiye Sihirbazı', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem">
				<?php echo $yeni ? esc_html__( 'Yeni Davetiye', 'sahra-davetiye' ) : esc_html( $onizleme ); ?>
			</h1>
		</header>

		<div class="sahra-cipler" role="tablist">
			<?php foreach ( $adimlar as $i => $ad ) : ?>
				<button type="button" class="sahra-cip" data-adim="<?php echo (int) $i; ?>" aria-current="<?php echo 0 === $i ? 'true' : 'false'; ?>">
					<span class="no"><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span><?php echo esc_html( $ad ); ?>
				</button>
			<?php endforeach; ?>
		</div>

		<div class="sahra-ilerleme"><span style="width:<?php echo esc_attr( 100 / count( $adimlar ) ); ?>%"></span></div>

		<form method="post" id="sahra-sihirbaz" data-toplam="<?php echo count( $adimlar ); ?>">
			<?php wp_nonce_field( 'sahra_save_invitation' ); ?>
			<input type="hidden" name="sahra_action" value="save_invitation">
			<input type="hidden" name="invitation_id" value="<?php echo esc_attr( $d['id'] ); ?>">

			<?php /* ── 1 Çift Bilgileri ───────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="0">
				<div class="ikili">
					<?php
					Sahra_Form::alan( array( 'label' => __( 'Damat Adı *', 'sahra-davetiye' ), 'name' => 'sahra[groomName]', 'value' => $d['groomName'], 'ph' => 'Mehmet', 'sinif' => 'sahra-onizle' ) );
					Sahra_Form::alan( array( 'label' => __( 'Gelin Adı *', 'sahra-davetiye' ), 'name' => 'sahra[brideName]', 'value' => $d['brideName'], 'ph' => 'Ayşe', 'sinif' => 'sahra-onizle' ) );
					Sahra_Form::alan( array( 'label' => __( 'Damat Soyadı', 'sahra-davetiye' ), 'name' => 'sahra[groomSurname]', 'value' => $d['groomSurname'], 'ph' => 'Demir' ) );
					Sahra_Form::alan( array( 'label' => __( 'Gelin Soyadı', 'sahra-davetiye' ), 'name' => 'sahra[brideSurname]', 'value' => $d['brideSurname'], 'ph' => 'Yılmaz' ) );
					?>
				</div>

				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Başlıkta Nasıl Gösterilsin?', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( Sahra_Fields::conjunction_options() as $deger => $ornek ) : ?>
							<label class="secenek">
								<input type="radio" name="sahra[conjunction]" value="<?php echo esc_attr( $deger ); ?>" <?php checked( $deger, $conj ); ?> class="sahra-onizle">
								<span class="t-label" style="color:var(--c-gold)"><?php esc_html_e( 'Örnek', 'sahra-davetiye' ); ?></span>
								<span class="ad" style="display:block"><?php echo esc_html( $ornek ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>

				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Önizleme', 'sahra-davetiye' ); ?></span>
					<p class="t-h2" id="sahra-baslik-onizleme"><?php echo esc_html( $onizleme ); ?></p>
					<p class="ipucu"><?php echo esc_html( home_url( '/davet/' ) ); ?><span id="sahra-slug-onizleme"><?php echo esc_html( $d['slug'] ); ?></span></p>
				</div>

				<?php
				Sahra_Form::alan(
					array(
						'label' => __( 'Bağlantı Adresi (slug)', 'sahra-davetiye' ),
						'name'  => 'sahra[slug]',
						'value' => $d['slug'],
						'ph'    => 'mehmet-ayse',
						'ipucu' => __( 'Boş bırakılırsa adlardan üretilir. Tire korunur.', 'sahra-davetiye' ),
						'id'    => 'f-slug',
					)
				);
				?>

				<?php if ( $yonetici && ! $yeni ) : ?>
					<label class="anahtar">
						<input type="checkbox" name="sahra[isActive]" value="1" <?php checked( $d['isActive'] ); ?>>
						<span><?php esc_html_e( 'Yayında', 'sahra-davetiye' ); ?></span>
					</label>
				<?php endif; ?>
			</div>

			<?php /* ── 2 Düğün Bilgileri ──────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="1" hidden>
				<?php Sahra_Form::alan( array( 'label' => __( 'Düğün Tarihi *', 'sahra-davetiye' ), 'name' => 'sahra[weddingDate]', 'value' => $d['weddingDate'], 'type' => 'date' ) ); ?>

				<div class="ikili">
					<?php
					Sahra_Form::alan( array( 'label' => __( 'Başlangıç Saati *', 'sahra-davetiye' ), 'name' => 'sahra[weddingTime]', 'value' => $d['weddingTime'], 'type' => 'time' ) );
					Sahra_Form::alan( array( 'label' => __( 'Bitiş Saati', 'sahra-davetiye' ), 'name' => 'sahra[weddingEndTime]', 'value' => $d['weddingEndTime'], 'type' => 'time', 'ipucu' => __( 'Boşsa davetiyede yalnızca başlangıç yazar.', 'sahra-davetiye' ) ) );
					?>
				</div>

				<?php
				/*
				 * Mekân burada SORULMUYOR: tüm davetiyelerde aynı salon geçerli
				 * ve yalnızca yönetici değiştirebiliyor. Yine de hangi adresin
				 * görüneceğini göstermek gerekiyor.
				 */
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Mekân', 'sahra-davetiye' ); ?></span>
					<p class="t-lead"><?php echo esc_html( $venue['venueName'] ? $venue['venueName'] : __( 'Henüz belirlenmedi', 'sahra-davetiye' ) ); ?></p>
					<p class="t-body muted"><?php echo esc_html( implode( ', ', array_filter( array( $venue['address'], $venue['district'], $venue['city'] ) ) ) ); ?></p>
					<p class="ipucu">
						<?php esc_html_e( 'Mekân tüm davetiyelerde ortaktır ve yalnızca yönetici değiştirir.', 'sahra-davetiye' ); ?>
						<?php if ( $yonetici ) : ?>
							<a href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-mekan' ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
						<?php endif; ?>
					</p>
				</div>

				<?php
				Sahra_Form::bolum_basligi( $d, 'details', 'Detaylar', 'Düğün Bilgileri' );
				Sahra_Form::bolum_basligi( $d, 'location', 'Konum', 'Nasıl Gelirsiniz?' );
				Sahra_Form::alan( array( 'label' => __( 'Katılım Bildirim Son Tarihi', 'sahra-davetiye' ), 'name' => 'sahra[rsvpDeadline]', 'value' => $d['rsvpDeadline'], 'type' => 'date' ) );
				?>
			</div>

			<?php /* ── 3 Davet Metni ──────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="2" hidden>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Hazır Metinler', 'sahra-davetiye' ); ?></span>
					<div class="secenekler" style="grid-template-columns:1fr">
						<?php foreach ( Sahra_Fields::ready_texts() as $etiket => $metin ) : ?>
							<button type="button" class="secenek sahra-hazir-metin" data-hedef="f-invitationtext" data-metin="<?php echo esc_attr( $metin ); ?>" style="text-align:left">
								<span class="t-label" style="color:var(--c-gold)"><?php echo esc_html( $etiket ); ?></span>
								<span class="t-body" style="display:block;margin-top:0.4rem;font-style:italic"><?php echo esc_html( $metin ); ?></span>
							</button>
						<?php endforeach; ?>
					</div>
				</div>

				<?php
				Sahra_Form::alan(
					array(
						'label' => __( 'Veya Kendi Metninizi Yazın', 'sahra-davetiye' ),
						'name'  => 'sahra[invitationText]',
						'value' => $d['invitationText'],
						'type'  => 'textarea',
						'rows'  => 5,
						'ph'    => __( 'Davet metninizi buraya yazın...', 'sahra-davetiye' ),
						'id'    => 'f-invitationtext',
					)
				);

				Sahra_Form::bolum_basligi( $d, 'rsvp', 'Katılım', 'Sizi Aramızda Görmek İsteriz' );
				Sahra_Form::alan( array( 'label' => __( 'İletişim Bölümü Başlığı', 'sahra-davetiye' ), 'name' => 'sahra[contactSectionTitle]', 'value' => $d['contactSectionTitle'], 'ph' => 'Görüşmek Üzere' ) );
				?>
			</div>

			<?php /* ── 4 Mühür & Tuğra ────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="3" hidden>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Mühür', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( Sahra_Fields::seal_options() as $deger => $etiket ) : ?>
							<?php $p = Sahra_Theme::seal_palette( $deger ); ?>
							<label class="secenek">
								<input type="radio" name="sahra[sealType]" value="<?php echo esc_attr( $deger ); ?>" <?php checked( $deger, $d['sealType'] ); ?>>
								<span class="ad"><?php echo esc_html( $etiket ); ?></span>
								<span class="ornek" style="background:linear-gradient(90deg,<?php echo esc_attr( $p['grad1'] ); ?>,<?php echo esc_attr( $p['grad2'] ); ?>,<?php echo esc_attr( $p['grad3'] ); ?>)"></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>

				<?php
				Sahra_Form::alan(
					array(
						'label' => __( 'Monogram', 'sahra-davetiye' ),
						'name'  => 'sahra[sealMonogram]',
						'value' => $d['sealMonogram'],
						'ph'    => 'M & A',
						'ipucu' => __( 'Boş bırakılırsa adların baş harfleri kullanılır.', 'sahra-davetiye' ),
					)
				);

				Sahra_Form::gorsel(
					__( 'Mühür Görseli (İsteğe Bağlı)', 'sahra-davetiye' ),
					'sahra[sealImage]',
					$d['sealImage'],
					__( 'Yüklerseniz balmumu mühür yerine bu görsel kullanılır.', 'sahra-davetiye' )
				);
				?>
			</div>

			<?php /* ── 5 Mektup Tasarımı ──────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="4" hidden>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Tasarım', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( Sahra_Fields::design_options() as $deger => $etiket ) : ?>
							<label class="secenek">
								<input type="radio" name="sahra[invitationDesign]" value="<?php echo esc_attr( $deger ); ?>" <?php checked( $deger, $d['invitationDesign'] ); ?>>
								<span class="ad"><?php echo esc_html( $etiket ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>

				<?php Sahra_Form::gorsel( __( 'Mektup Fotoğrafı', 'sahra-davetiye' ), 'sahra[letterImage]', $d['letterImage'] ); ?>
			</div>

			<?php /* ── 6 Fotoğraflar ──────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="5" hidden>
				<?php
				Sahra_Form::gorsel(
					__( 'Kapak Fotoğrafı', 'sahra-davetiye' ),
					'sahra[coverImage]',
					$d['coverImage'],
					__( 'Paylaşım kartında (WhatsApp önizlemesi) da bu görsel kullanılır.', 'sahra-davetiye' )
				);
				?>

				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Galeri', 'sahra-davetiye' ); ?></span>
					<div class="sahra-yukleyici">
						<button type="button" class="cta sahra-yukle" data-hedef="f-gallery" data-coklu="1"><?php esc_html_e( 'Fotoğraf Yükle', 'sahra-davetiye' ); ?></button>
						<span class="sahra-durum"></span>
					</div>
					<textarea id="f-gallery" name="sahra[galleryImagesText]" rows="5" class="sahra-galeri-metin"><?php echo esc_textarea( $metinler['gallery'] ); ?></textarea>
					<div class="sahra-onizleme" data-kaynak="f-gallery"></div>
					<p class="ipucu"><?php esc_html_e( 'Her satıra bir görsel adresi. Fotoğraflar galeride aynı boyutta gösterilir.', 'sahra-davetiye' ); ?></p>
				</div>

				<?php Sahra_Form::bolum_basligi( $d, 'gallery', 'Anılar', 'Fotoğraf Galerisi' ); ?>
			</div>

			<?php /* ── 7 Hediye & Dilekler ────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="6" hidden>
				<label class="anahtar">
					<input type="checkbox" name="sahra[giftEnabled]" value="1" <?php checked( $d['giftEnabled'] ); ?>>
					<span><?php esc_html_e( 'Hediye Bölümünü Göster', 'sahra-davetiye' ); ?></span>
				</label>

				<?php
				Sahra_Form::alan( array( 'label' => __( 'Bölüm Başlığı', 'sahra-davetiye' ), 'name' => 'sahra[giftTitle]', 'value' => $d['giftTitle'], 'ph' => 'Hediye' ) );
				Sahra_Form::alan( array( 'label' => __( 'Hediye Notu', 'sahra-davetiye' ), 'name' => 'sahra[giftNote]', 'value' => $d['giftNote'], 'type' => 'textarea', 'rows' => 2, 'ph' => 'Varlığınız en büyük hediye...' ) );
				Sahra_Form::alan( array( 'label' => __( 'IBAN', 'sahra-davetiye' ), 'name' => 'sahra[giftIban]', 'value' => $d['giftIban'], 'ph' => 'TR33 0006 1005 1978 6457 8413 26' ) );
				?>
				<div class="ikili">
					<?php
					Sahra_Form::alan( array( 'label' => __( 'Hesap Sahibi', 'sahra-davetiye' ), 'name' => 'sahra[giftAccountName]', 'value' => $d['giftAccountName'] ) );
					Sahra_Form::alan( array( 'label' => __( 'Banka', 'sahra-davetiye' ), 'name' => 'sahra[giftBankName]', 'value' => $d['giftBankName'] ) );
					?>
				</div>
				<?php Sahra_Form::alan( array( 'label' => __( 'Hediye Listesi Bağlantısı', 'sahra-davetiye' ), 'name' => 'sahra[giftRegistryUrl]', 'value' => $d['giftRegistryUrl'], 'type' => 'url' ) ); ?>

				<label class="anahtar">
					<input type="checkbox" name="sahra[wishesEnabled]" value="1" <?php checked( $d['wishesEnabled'] ); ?>>
					<span><?php esc_html_e( 'Dilek Defterini Göster', 'sahra-davetiye' ); ?></span>
				</label>
				<p class="ipucu"><?php esc_html_e( 'Misafir dilekleri onayınızdan geçmeden davetiyede görünmez.', 'sahra-davetiye' ); ?></p>

				<div class="ikili">
					<?php
					Sahra_Form::alan( array( 'label' => __( 'Dilek Alt Başlık', 'sahra-davetiye' ), 'name' => 'sahra[wishesSubtitle]', 'value' => $d['wishesSubtitle'], 'ph' => 'Bize Bir Not Bırakın' ) );
					Sahra_Form::alan( array( 'label' => __( 'Dilek Başlık', 'sahra-davetiye' ), 'name' => 'sahra[wishesTitle]', 'value' => $d['wishesTitle'], 'ph' => 'Dilek Defteri' ) );
					?>
				</div>
			</div>

			<?php /* ── 8 Ses Ayarları ─────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="7" hidden>
				<label class="anahtar">
					<input type="checkbox" name="sahra[soundEnabled]" value="1" <?php checked( $d['soundEnabled'] ); ?>>
					<span><?php esc_html_e( 'Arka Plan Müziği Açık', 'sahra-davetiye' ); ?></span>
				</label>

				<?php
				Sahra_Form::ses( __( 'Arka Plan Müziği', 'sahra-davetiye' ), 'sahra[backgroundMusicUrl]', $d['backgroundMusicUrl'], Sahra_Fields::music_tracks() );
				Sahra_Form::alan( array( 'label' => __( 'Ses Düzeyi (%)', 'sahra-davetiye' ), 'name' => 'sahra[soundVolume]', 'value' => (int) $d['soundVolume'], 'type' => 'number' ) );
				Sahra_Form::ses( __( 'Mühür Kırılma Sesi', 'sahra-davetiye' ), 'sahra[sealBreakSound]', $d['sealBreakSound'], Sahra_Fields::seal_sounds() );
				Sahra_Form::ses( __( 'Zarf Açılma Sesi', 'sahra-davetiye' ), 'sahra[envelopeOpenSound]', $d['envelopeOpenSound'], Sahra_Fields::envelope_sounds() );
				?>
			</div>

			<?php /* ── 9 Tema ─────────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="8" hidden>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Tema', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( Sahra_Fields::theme_options() as $deger => $etiket ) : ?>
							<?php $t = Sahra_Theme::theme( $deger ); ?>
							<label class="secenek">
								<input type="radio" name="sahra[theme]" value="<?php echo esc_attr( $deger ); ?>" <?php checked( $deger, $d['theme'] ); ?>>
								<span class="ad"><?php echo esc_html( $etiket ); ?></span>
								<span class="ornek" style="background:linear-gradient(90deg,<?php echo esc_attr( $t['night'] ); ?>,<?php echo esc_attr( $t['gold'] ); ?>,<?php echo esc_attr( $t['cream'] ); ?>)"></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>
			</div>

			<?php /* ── 10 Program ─────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="9" hidden>
				<?php Sahra_Form::bolum_basligi( $d, 'program', 'Akış', 'Günün Programı' ); ?>

				<div class="alan">
					<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
						<span class="field-label" style="margin:0"><?php esc_html_e( 'Program Maddeleri', 'sahra-davetiye' ); ?></span>
						<button type="button" class="eylem-link sahra-varsayilan" data-hedef="f-program"
							data-metin="<?php echo esc_attr( Sahra_Form::satirlar( Sahra_Fields::default_program(), array( 'time', 'title', 'desc' ) ) ); ?>">
							<?php esc_html_e( 'Varsayılanları Yükle', 'sahra-davetiye' ); ?>
						</button>
					</div>
					<textarea id="f-program" name="sahra[programText]" rows="7" placeholder="15:00 | Kapı Açılışı | Konukların karşılanması"><?php echo esc_textarea( $metinler['program'] ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Her satır bir madde: saat | başlık | açıklama', 'sahra-davetiye' ); ?></p>
				</div>
			</div>

			<?php /* ── 11 SSS ─────────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="10" hidden>
				<?php Sahra_Form::bolum_basligi( $d, 'faq', 'Merak Edilenler', 'Sık Sorulan Sorular' ); ?>

				<div class="alan">
					<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
						<span class="field-label" style="margin:0"><?php esc_html_e( 'Sorular', 'sahra-davetiye' ); ?></span>
						<button type="button" class="eylem-link sahra-varsayilan" data-hedef="f-faq"
							data-metin="<?php echo esc_attr( Sahra_Form::satirlar( Sahra_Fields::default_faq(), array( 'q', 'a' ) ) ); ?>">
							<?php esc_html_e( 'Varsayılanları Yükle', 'sahra-davetiye' ); ?>
						</button>
					</div>
					<textarea id="f-faq" name="sahra[faqText]" rows="7" placeholder="Çocuklar davetli mi? | Düğünümüz yetişkinlere özel planlanmıştır."><?php echo esc_textarea( $metinler['faq'] ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Her satır bir madde: soru | cevap', 'sahra-davetiye' ); ?></p>
				</div>
			</div>

			<?php /* ── 12 Hikayemiz ───────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="11" hidden>
				<?php Sahra_Form::bolum_basligi( $d, 'story', 'Bizim', 'Hikayemiz' ); ?>

				<div class="alan">
					<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
						<span class="field-label" style="margin:0"><?php esc_html_e( 'Zaman Tüneli', 'sahra-davetiye' ); ?></span>
						<button type="button" class="eylem-link sahra-varsayilan" data-hedef="f-story"
							data-metin="<?php echo esc_attr( Sahra_Form::satirlar( Sahra_Fields::default_story(), array( 'year', 'title', 'desc' ) ) ); ?>">
							<?php esc_html_e( 'Varsayılanları Yükle', 'sahra-davetiye' ); ?>
						</button>
					</div>
					<textarea id="f-story" name="sahra[storyText]" rows="6" placeholder="2022 | İlk Tanışma | Ortak bir arkadaşın davetinde"><?php echo esc_textarea( $metinler['story'] ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Her satır bir madde: yıl | başlık | açıklama', 'sahra-davetiye' ); ?></p>
				</div>

				<div class="alan">
					<label class="field-label" for="f-social"><?php esc_html_e( 'Sosyal Hesaplar', 'sahra-davetiye' ); ?></label>
					<textarea id="f-social" name="sahra[socialText]" rows="3" placeholder="Instagram | https://instagram.com/..."><?php echo esc_textarea( $metinler['social'] ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Her satır bir madde: ad | adres', 'sahra-davetiye' ); ?></p>
				</div>

				<?php Sahra_Form::alan( array( 'label' => __( 'Etiket (Hashtag)', 'sahra-davetiye' ), 'name' => 'sahra[hashtag]', 'value' => $d['hashtag'], 'ph' => '#MehmetveAyşe' ) ); ?>
			</div>

			<div class="sahra-adim-alt">
				<button type="button" class="eylem-link" id="sahra-geri" hidden><?php esc_html_e( '← Geri', 'sahra-davetiye' ); ?></button>

				<div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;margin-left:auto">
					<button type="submit" class="eylem-link"><?php esc_html_e( 'Şimdi Kaydet', 'sahra-davetiye' ); ?></button>
					<button type="button" class="cta" id="sahra-ileri"><?php esc_html_e( 'İleri →', 'sahra-davetiye' ); ?></button>
					<button type="submit" class="cta" id="sahra-bitir" hidden>
						<?php echo $yeni ? esc_html__( 'Davetiyeyi Oluştur', 'sahra-davetiye' ) : esc_html__( 'Kaydet', 'sahra-davetiye' ); ?>
					</button>
				</div>
			</div>
		</form>
	</section>
</div>
<?php
