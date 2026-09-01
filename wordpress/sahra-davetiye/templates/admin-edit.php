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
$venue       = Sahra_Settings::venue_for( $d['venueId'] ?? '' );
$sahra_sayfa = 'sahra-davetiye-duzenle';

$conj     = $d['conjunction'] ? $d['conjunction'] : '&';
$onizleme = trim( ( $d['brideName'] ? $d['brideName'] : 'Gelin' ) . ' ' . $conj . ' ' . ( $d['groomName'] ? $d['groomName'] : 'Damat' ) );

$adimlar = array(
	'Çift Bilgileri',
	'Düğün Bilgileri',
	'Davet Metni',
	'Mühür & Tuğra',
	'Mektup Tasarımı',
	'Fotoğraflar',
	'Menü',
	'Ailelerimiz',
	'Hediye & Dilekler',
	'Ses Ayarları',
	'Tema',
	'Program',
	'Hikayemiz',
	'Bölümler',
);

$salonlar = Sahra_Settings::venues();
$menuler  = Sahra_Settings::menus();
$marka    = Sahra_Settings::brand();
$omur     = $yeni ? '' : Sahra_Lifecycle::summary( $d );

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
					/* Gelin solda, damat sağda — davetiyedeki sırayla aynı. */
					Sahra_Form::alan( array( 'label' => __( 'Gelin Adı *', 'sahra-davetiye' ), 'name' => 'sahra[brideName]', 'value' => $d['brideName'], 'ph' => 'Zehra', 'sinif' => 'sahra-onizle' ) );
					Sahra_Form::alan( array( 'label' => __( 'Damat Adı *', 'sahra-davetiye' ), 'name' => 'sahra[groomName]', 'value' => $d['groomName'], 'ph' => 'Ahmet', 'sinif' => 'sahra-onizle' ) );
					Sahra_Form::alan( array( 'label' => __( 'Gelin Soyadı', 'sahra-davetiye' ), 'name' => 'sahra[brideSurname]', 'value' => $d['brideSurname'], 'ph' => 'Yılmaz' ) );
					Sahra_Form::alan( array( 'label' => __( 'Damat Soyadı', 'sahra-davetiye' ), 'name' => 'sahra[groomSurname]', 'value' => $d['groomSurname'], 'ph' => 'Demir' ) );
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

				<?php
				/*
				 * Davetiyenin SAHİBİ.
				 *
				 * Burası yokken davetiye her zaman onu OLUŞTURANA
				 * yazılıyordu; yönetici bir çift için davetiye hazırladığında
				 * sahibi yönetici oluyordu. İki sonucu vardı: çift kendi
				 * davetiyesini düzenleyemiyordu ve hesabı silindiğinde
				 * davetiyesi ortada kalıyordu ("hesap silinince davetiyeleri
				 * de silinir" sözü tutulmuyordu). Sahiplik artık burada
				 * açıkça seçiliyor.
				 */
				?>
				<?php if ( $yonetici ) : ?>
					<div class="alan">
						<label class="field-label" for="f-owner"><?php esc_html_e( 'Davetiye Sahibi', 'sahra-davetiye' ); ?></label>
						<select id="f-owner" name="sahra_owner">
							<?php
							$sahra_secili = $yeni ? 0 : (int) $d['ownerId'];
							$sahra_cift   = get_users( array( 'role' => Sahra_Roles::COUPLE, 'orderby' => 'display_name' ) );
							?>
							<option value="0" <?php selected( 0, $sahra_secili ); ?>><?php esc_html_e( '— Çift hesabına bağlama (bende kalsın) —', 'sahra-davetiye' ); ?></option>
							<?php foreach ( $sahra_cift as $sahra_kul ) : ?>
								<option value="<?php echo (int) $sahra_kul->ID; ?>" <?php selected( (int) $sahra_kul->ID, $sahra_secili ); ?>>
									<?php echo esc_html( ( $sahra_kul->display_name ? $sahra_kul->display_name : $sahra_kul->user_login ) . ' (' . $sahra_kul->user_login . ')' ); ?>
								</option>
							<?php endforeach; ?>
						</select>
						<p class="ipucu">
							<?php esc_html_e( 'Davetiyeyi yalnızca sahibi düzenleyebilir. Hesap silinirse davetiyesi de silinir.', 'sahra-davetiye' ); ?>
							<?php if ( ! $sahra_cift ) : ?>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-hesaplar' ) ); ?>"><?php esc_html_e( 'Önce bir çift hesabı açın', 'sahra-davetiye' ); ?></a>
							<?php endif; ?>
						</p>
					</div>
				<?php endif; ?>

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

				<?php
				/*
				 * Saat SERBEST DEĞİL, oturum seçilir.
				 *
				 * Salon yalnızca iki oturum çalışıyor. Serbest saat alanı
				 * çifte gerçekte var olmayan bir seçenek sunuyordu: 11:00
				 * yazan bir davetiye, salonda karşılığı olmayan bir söz.
				 */
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Düğün Oturumu *', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( Sahra_Fields::sessions() as $deger => $oturum ) : ?>
							<label class="secenek">
								<input type="radio" name="sahra[session]" value="<?php echo esc_attr( $deger ); ?>" <?php checked( $deger, $d['session'] ); ?>>
								<span class="ad"><?php echo esc_html( $oturum['label'] ); ?></span>
								<span class="t-body numerals" style="display:block;margin-top:0.3rem;color:var(--c-on-dark-faint)">
									<?php echo esc_html( $oturum['start'] . ' – ' . $oturum['end'] ); ?>
								</span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>

				<?php
				/*
				 * Salon, yöneticinin tanımladıkları arasından SEÇİLİR.
				 * Adresi çifte yazdırmak bir hata kaynağıydı: yanlış yazan
				 * çiftin misafirleri yanlış yere gidiyor, kimse fark
				 * etmiyordu.
				 */
				?>
				<div class="alan">
					<label class="field-label" for="f-venue"><?php esc_html_e( 'Salon *', 'sahra-davetiye' ); ?></label>
					<?php if ( ! $salonlar ) : ?>
						<p class="t-body" style="color:var(--c-danger)"><?php esc_html_e( 'Henüz salon tanımlanmadı.', 'sahra-davetiye' ); ?></p>
						<?php if ( $yonetici ) : ?>
							<p class="ipucu"><a href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-salonlar' ) ); ?>"><?php esc_html_e( 'Salon ekle', 'sahra-davetiye' ); ?></a></p>
						<?php endif; ?>
					<?php else : ?>
						<select id="f-venue" name="sahra[venueId]">
							<?php foreach ( $salonlar as $salon ) : ?>
								<option value="<?php echo esc_attr( $salon['id'] ); ?>" <?php selected( $salon['id'], $venue['id'] ); ?>>
									<?php echo esc_html( $salon['venueName'] . ' — ' . implode( ', ', array_filter( array( $salon['district'], $salon['city'] ) ) ) ); ?>
								</option>
							<?php endforeach; ?>
						</select>
						<p class="ipucu">
							<?php echo esc_html( implode( ', ', array_filter( array( $venue['address'], $venue['district'], $venue['city'] ) ) ) ); ?>
							<?php if ( $yonetici ) : ?>
								· <a href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-salonlar' ) ); ?>"><?php esc_html_e( 'Salonları düzenle', 'sahra-davetiye' ); ?></a>
							<?php endif; ?>
						</p>
					<?php endif; ?>
				</div>

				<?php if ( $omur ) : ?>
					<?php /* Çift "davetiyem ne zamana kadar açık?" diye sormadan görmeli. */ ?>
					<p class="ipucu"><?php echo esc_html( $omur ); ?></p>
				<?php endif; ?>

				<?php
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
				/*
				 * Önizleme: mührün ADI kullanıcıya bir şey anlatmıyor.
				 * "Bronz Balmumu" ile "Gümüş Balmumu" arasındaki farkı
				 * kaydedip davetiyeyi açmadan görmenin yolu yoktu.
				 */
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Önizleme', 'sahra-davetiye' ); ?></span>
					<div class="sahra-onizleme-kutu">
						<div class="sahra-muhur-onizleme" id="sahra-muhur-onizleme"
							data-monogram="<?php echo esc_attr( $d['sealMonogram'] ); ?>"></div>
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

				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Önizleme', 'sahra-davetiye' ); ?></span>
					<div class="sahra-onizleme-kutu">
						<div class="sahra-mektup-onizleme" id="sahra-mektup-onizleme">
							<p class="mo-monogram"><?php echo esc_html( $onizleme ); ?></p>
							<p class="mo-metin"><?php echo esc_html( $d['invitationText'] ? $d['invitationText'] : __( 'Davet metniniz burada görünecek.', 'sahra-davetiye' ) ); ?></p>
							<span class="mo-cizgi" aria-hidden="true"></span>
							<p class="mo-ad"><?php echo esc_html( $onizleme ); ?></p>
						</div>
					</div>
					<p class="ipucu"><?php esc_html_e( 'Renkler seçtiğiniz temadan gelir; burada yalnızca kâğıt ve çerçeve tasarımı görünür.', 'sahra-davetiye' ); ?></p>
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

			</div>

			<?php /* ── 7 Menü ─────────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="6" hidden>
				<?php
				/*
				 * Menü seçilir, sonra üstünde oynanır.
				 *
				 * Menünün ADI davetiyede görünmüyor: misafir için "Menü-3"
				 * bir anlam taşımıyor, o işletmeyle çift arasındaki bir
				 * numara. Davetiyede başlık yalnızca "Menü".
				 */
				?>
				<div class="alan">
					<label class="field-label" for="f-menu"><?php esc_html_e( 'Hazır Menü', 'sahra-davetiye' ); ?></label>
					<select id="f-menu" name="sahra[menuId]" class="sahra-menu-sec">
						<option value=""><?php esc_html_e( '— Menü gösterme —', 'sahra-davetiye' ); ?></option>
						<?php foreach ( $menuler as $menu ) : ?>
							<option value="<?php echo esc_attr( $menu['id'] ); ?>"
								data-icerik="<?php echo esc_attr( Sahra_Fields::menu_to_text( $menu['groups'] ) ); ?>"
								<?php selected( $menu['id'], $d['menuId'] ); ?>>
								<?php echo esc_html( $menu['name'] ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<p class="ipucu"><?php esc_html_e( 'Menü seçince içeriği aşağıya gelir; oradan istediğiniz gibi değiştirebilirsiniz. Menünün adı davetiyede görünmez.', 'sahra-davetiye' ); ?></p>
				</div>

				<div class="alan">
					<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
						<span class="field-label" style="margin:0"><?php esc_html_e( 'Menü İçeriği', 'sahra-davetiye' ); ?></span>
						<button type="button" class="eylem-link sahra-menu-sifirla"><?php esc_html_e( 'Seçili menüye geri dön', 'sahra-davetiye' ); ?></button>
					</div>
					<textarea id="f-menu-icerik" name="sahra[menuText]" rows="9"
						placeholder="ORDÖVR TABAĞI | Amerikan salatası | Kısır | Haydari"><?php echo esc_textarea( $metinler['menu'] ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Her satır bir grup: başlık | öğe | öğe | öğe', 'sahra-davetiye' ); ?></p>
				</div>

			</div>

			<?php /* ── 8 Ailelerimiz ──────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="7" hidden>

				<div class="ikili">
					<?php
					/* Gelin solda, damat sağda — sayfadaki sırayla aynı. */
					Sahra_Form::alan( array( 'label' => __( 'Sol Metin', 'sahra-davetiye' ), 'name' => 'sahra[brideFamilyText]', 'value' => $d['brideFamilyText'], 'type' => 'textarea', 'rows' => 3, 'ph' => "Yılmaz Ailesi\nMehmet & Fatma Yılmaz" ) );
					Sahra_Form::alan( array( 'label' => __( 'Sağ Metin', 'sahra-davetiye' ), 'name' => 'sahra[groomFamilyText]', 'value' => $d['groomFamilyText'], 'type' => 'textarea', 'rows' => 3, 'ph' => "Demir Ailesi\nAli & Ayşe Demir" ) );
					?>
				</div>
			</div>

			<?php /* ── 9 Hediye & Dilekler ────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="8" hidden>
				<label class="anahtar">
					<input type="checkbox" name="sahra[giftEnabled]" value="1" <?php checked( $d['giftEnabled'] ); ?>>
					<span><?php esc_html_e( 'Hediye Bölümünü Göster', 'sahra-davetiye' ); ?></span>
				</label>

				<?php
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

			<?php /* ── 10 Ses Ayarları ─────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="9" hidden>
				<label class="anahtar">
					<input type="checkbox" name="sahra[soundEnabled]" value="1" <?php checked( $d['soundEnabled'] ); ?>>
					<span><?php esc_html_e( 'Arka Plan Müziği Açık', 'sahra-davetiye' ); ?></span>
				</label>

				<?php
				Sahra_Form::ses( __( 'Arka Plan Müziği', 'sahra-davetiye' ), 'sahra[backgroundMusicUrl]', $d['backgroundMusicUrl'], Sahra_Fields::music_tracks() );
				Sahra_Form::alan( array( 'label' => __( 'Ses Düzeyi (%)', 'sahra-davetiye' ), 'name' => 'sahra[soundVolume]', 'value' => (int) $d['soundVolume'], 'type' => 'number' ) );
				?>

				<?php
				/*
				 * Mühür kırılma ve zarf açılma sesi SABİT.
				 *
				 * Bunlar açılış sahnesinin parçası, çiftin zevk meselesi
				 * değil: yanlış uzunlukta ya da yüksek sesli bir dosya
				 * perdenin zamanlamasını bozuyor ve ürünün ilk üç saniyesi
				 * bozuk görünüyordu. Arka plan müziği seçilebilir kalıyor.
				 */
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Sahne Sesleri', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( array( 'muhur-kirilma' => __( 'Mühür Kırılma', 'sahra-davetiye' ), 'zarf-acilma' => __( 'Zarf Açılma', 'sahra-davetiye' ) ) as $dosya => $ad ) : ?>
							<div class="secenek">
								<span class="ad"><?php echo esc_html( $ad ); ?></span>
								<span style="display:flex;gap:1rem;margin-top:0.5rem">
									<button type="button" class="eylem-link sahra-dinle" data-adres="<?php echo esc_url( SAHRA_URL . 'assets/muzik/' . $dosya . '.mp3' ); ?>">
										<?php esc_html_e( 'Dinle', 'sahra-davetiye' ); ?>
									</button>
								</span>
							</div>
						<?php endforeach; ?>
					</div>
					<p class="ipucu"><?php esc_html_e( 'Bu iki ses açılış sahnesinin parçasıdır ve değiştirilemez.', 'sahra-davetiye' ); ?></p>
				</div>
			</div>

			<?php /* ── 11 Tema ─────────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="10" hidden>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Tema', 'sahra-davetiye' ); ?></span>
					<div class="secenekler">
						<?php foreach ( Sahra_Fields::theme_options() as $deger => $etiket ) : ?>
							<?php $t = Sahra_Theme::theme( $deger ); ?>
							<label class="secenek">
								<input type="radio" name="sahra[theme]" value="<?php echo esc_attr( $deger ); ?>" <?php checked( $deger, $d['theme'] ); ?>
									data-night="<?php echo esc_attr( $t['night'] ); ?>"
									data-gold="<?php echo esc_attr( $t['gold'] ); ?>"
									data-goldlight="<?php echo esc_attr( $t['goldLight'] ); ?>"
									data-golddeep="<?php echo esc_attr( $t['goldDeep'] ); ?>"
									data-cream="<?php echo esc_attr( $t['cream'] ); ?>"
									data-paper="<?php echo esc_attr( $t['paperHi'] ); ?>"
									data-sand="<?php echo esc_attr( $t['sand'] ); ?>"
									data-onlight="<?php echo esc_attr( $t['onLight'] ); ?>"
									data-ondark="<?php echo esc_attr( $t['onDark'] ); ?>">
								<span class="ad"><?php echo esc_html( $etiket ); ?></span>
								<span class="ornek" style="background:linear-gradient(90deg,<?php echo esc_attr( $t['night'] ); ?>,<?php echo esc_attr( $t['gold'] ); ?>,<?php echo esc_attr( $t['cream'] ); ?>)"></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>

				<?php
				/*
				 * Tema önizlemesi.
				 *
				 * Renk şeridi hangi renklerin kullanıldığını söylüyordu ama
				 * davetiyenin NEYE benzeyeceğini söylemiyordu. Burada
				 * davetiyenin iki yarısı da var: koyu açılış ve açık mektup.
				 * Seçim değişince ikisi de anında değişiyor.
				 */
				$sahra_tema = Sahra_Theme::theme( $d['theme'] );
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Önizleme', 'sahra-davetiye' ); ?></span>
					<div class="sahra-onizleme-kutu">
						<div class="sahra-tema-onizleme" id="sahra-tema-onizleme"
							style="--to-night:<?php echo esc_attr( $sahra_tema['night'] ); ?>;--to-gold:<?php echo esc_attr( $sahra_tema['gold'] ); ?>;--to-goldlight:<?php echo esc_attr( $sahra_tema['goldLight'] ); ?>;--to-golddeep:<?php echo esc_attr( $sahra_tema['goldDeep'] ); ?>;--to-cream:<?php echo esc_attr( $sahra_tema['cream'] ); ?>;--to-paper:<?php echo esc_attr( $sahra_tema['paperHi'] ); ?>;--to-sand:<?php echo esc_attr( $sahra_tema['sand'] ); ?>;--to-onlight:<?php echo esc_attr( $sahra_tema['onLight'] ); ?>;--to-ondark:<?php echo esc_attr( $sahra_tema['onDark'] ); ?>">
							<div class="to-koyu">
								<span class="to-etiket"><?php esc_html_e( 'Düğün Davetiyesi', 'sahra-davetiye' ); ?></span>
								<span class="to-ad"><?php echo esc_html( $onizleme ); ?></span>
								<span class="to-tarih numerals"><?php echo esc_html( $d['weddingDate'] ? Sahra_Render::format_date( $d['weddingDate'] ) : __( 'Düğün Tarihi', 'sahra-davetiye' ) ); ?></span>
							</div>
							<div class="to-acik">
								<span class="to-mono"><?php echo esc_html( $onizleme ); ?></span>
								<span class="to-satir"></span>
								<span class="to-satir kisa"></span>
							</div>
						</div>
					</div>
					<p class="ipucu"><?php esc_html_e( 'Davetiyenin koyu açılışı ve açık mektup bölümü bu renklerle çizilir.', 'sahra-davetiye' ); ?></p>
				</div>
			</div>

			<?php /* ── 12 Program ─────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="11" hidden>

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

			<?php /* ── 13 Hikayemiz ───────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="12" hidden>

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

				<?php
				Sahra_Form::alan( array( 'label' => __( 'Etiket (Hashtag)', 'sahra-davetiye' ), 'name' => 'sahra[hashtag]', 'value' => $d['hashtag'], 'ph' => '#ZehraveAhmet2026' ) );
				?>

				<div class="alan">
					<label class="field-label" for="f-social"><?php esc_html_e( 'Sosyal Hesaplarınız', 'sahra-davetiye' ); ?></label>
					<textarea id="f-social" name="sahra[socialText]" rows="3" placeholder="Instagram | https://instagram.com/..."><?php echo esc_textarea( $metinler['social'] ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Her satır bir madde: ad | adres', 'sahra-davetiye' ); ?></p>
				</div>

				<?php if ( $marka['instagram'] ) : ?>
					<?php
					/*
					 * İşletmenin kendi hesabı davetiyeye BURADAN değil
					 * ayarlardan gelir — her çifte ayrı yazdırmak, birinin
					 * yanlış yazması ve kimsenin fark etmemesi demekti.
					 */
					?>
					<div class="alan">
						<span class="field-label"><?php esc_html_e( 'Bizim Hesabımız', 'sahra-davetiye' ); ?></span>
						<p class="t-body"><?php echo esc_html( $marka['instagramLabel'] ? $marka['instagramLabel'] : $marka['instagram'] ); ?></p>
						<p class="ipucu"><?php esc_html_e( 'Etiketleme bölümünde otomatik görünür.', 'sahra-davetiye' ); ?></p>
					</div>
				<?php endif; ?>
			</div>

			<?php /* ── 14 Bölümler ────────────────────────────────────── */ ?>
			<div class="sahra-adim" data-adim="13" hidden>
				<?php
				/*
				 * Her bölümün "sayfada görünsün" anahtarı.
				 *
				 * Bir bölümü gizlemenin tek yolu içeriğini boşaltmaktı —
				 * yani çift, sonra geri açmak isterse yazdıklarını
				 * kaybediyordu. Anahtar içeriği koruyor.
				 */
				$sahra_bolumler = array(
					'showLetter'    => __( 'Davet Mektubu', 'sahra-davetiye' ),
					'showStory'     => __( 'Hikayemiz', 'sahra-davetiye' ),
					'showDetails'   => __( 'Düğün Bilgileri', 'sahra-davetiye' ),
					'showProgram'   => __( 'Günün Programı', 'sahra-davetiye' ),
					'showMenu'      => __( 'Menü', 'sahra-davetiye' ),
					'showGallery'   => __( 'Fotoğraf Galerisi', 'sahra-davetiye' ),
					'showLocation'  => __( 'Konum & Harita', 'sahra-davetiye' ),
					'showFamily'    => __( 'Ailelerimiz', 'sahra-davetiye' ),
					'showRsvp'      => __( 'Katılım Formu', 'sahra-davetiye' ),
					'giftEnabled'   => __( 'Hediye', 'sahra-davetiye' ),
					'wishesEnabled' => __( 'Dilek Defteri', 'sahra-davetiye' ),
					'showChildren'  => __( 'Çocuk Notu', 'sahra-davetiye' ),
					'showSocial'    => __( 'Etiketleme', 'sahra-davetiye' ),
					'showContact'   => __( 'Kapanış', 'sahra-davetiye' ),
				);
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Davetiyede Görünecek Bölümler', 'sahra-davetiye' ); ?></span>
					<div class="sahra-bolum-listesi">
						<?php foreach ( $sahra_bolumler as $anahtar => $etiket ) : ?>
							<label class="anahtar">
								<input type="checkbox" name="sahra[<?php echo esc_attr( $anahtar ); ?>]" value="1" <?php checked( ! empty( $d[ $anahtar ] ) ); ?>>
								<span><?php echo esc_html( $etiket ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
					<p class="ipucu"><?php esc_html_e( 'Kapattığınız bölümün içeriği silinmez, yalnızca davetiyede görünmez.', 'sahra-davetiye' ); ?></p>
				</div>

				<?php
				/*
				 * Çocuk durumu tek bir tik.
				 *
				 * Eskiden bu bilgi SSS'te "Çocuklar davetli mi?" diye bir
				 * soru-cevaptı; çift metni elle yazıyordu ve çoğu zaman
				 * kırıcı çıkıyordu. Tek tik, iki hazır cümle.
				 */
				?>
				<div class="alan">
					<span class="field-label"><?php esc_html_e( 'Çocuk Durumu', 'sahra-davetiye' ); ?></span>
					<label class="anahtar">
						<input type="checkbox" name="sahra[childrenWelcome]" value="1" <?php checked( $d['childrenWelcome'] ); ?>>
						<span><?php esc_html_e( 'Çocuklar da davetli', 'sahra-davetiye' ); ?></span>
					</label>
					<p class="ipucu">
						<?php esc_html_e( 'İşaretlenmezse davetiyede "Düğünümüz yalnızca yetişkinlere yöneliktir — minik misafirlerimize iyi uykular" yazar. İşaretlerseniz "Çocuklar da davetlidir" yazar.', 'sahra-davetiye' ); ?>
					</p>
				</div>
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
