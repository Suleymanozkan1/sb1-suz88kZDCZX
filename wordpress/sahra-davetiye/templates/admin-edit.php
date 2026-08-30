<?php
/**
 * Davetiye düzenleme.
 *
 * Alanlar ve gruplandırma Next sürümündeki on iki adımla birebir aynı;
 * WordPress'te adım adım sihirbaz yerine tek sayfa bölümler kullanılıyor,
 * çünkü panelde kaydet düğmesinin tek ve öngörülebilir olması gerekiyor.
 *
 * @var array $d
 * @var array $metinler
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$yeni     = empty( $d['id'] );
$yonetici = Sahra_Roles::is_manager();
$venue    = Sahra_Settings::venue();
?>
<div class="wrap sahra-admin">
	<h1><?php echo $yeni ? esc_html__( 'Yeni Davetiye', 'sahra-davetiye' ) : esc_html__( 'Davetiye Düzenle', 'sahra-davetiye' ); ?></h1>

	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="notice notice-success is-dismissible">
			<p>
				<?php esc_html_e( 'Kaydedildi.', 'sahra-davetiye' ); ?>
				<?php if ( ! $yeni ) : ?>
					<a href="<?php echo esc_url( Sahra_Invitation::url( $d['slug'] ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Davetiyeyi görüntüle', 'sahra-davetiye' ); ?></a>
				<?php endif; ?>
			</p>
		</div>
	<?php endif; ?>

	<form method="post" class="sahra-form">
		<?php wp_nonce_field( 'sahra_save_invitation' ); ?>
		<input type="hidden" name="sahra_action" value="save_invitation">
		<input type="hidden" name="invitation_id" value="<?php echo esc_attr( $d['id'] ); ?>">

		<h2>1 — <?php esc_html_e( 'Çift Bilgileri', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-groom"><?php esc_html_e( 'Damat Adı', 'sahra-davetiye' ); ?> *</label></th>
				<td><input class="regular-text" id="f-groom" name="sahra[groomName]" required value="<?php echo esc_attr( $d['groomName'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-groom-s"><?php esc_html_e( 'Damat Soyadı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="f-groom-s" name="sahra[groomSurname]" value="<?php echo esc_attr( $d['groomSurname'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-bride"><?php esc_html_e( 'Gelin Adı', 'sahra-davetiye' ); ?> *</label></th>
				<td><input class="regular-text" id="f-bride" name="sahra[brideName]" required value="<?php echo esc_attr( $d['brideName'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-bride-s"><?php esc_html_e( 'Gelin Soyadı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="f-bride-s" name="sahra[brideSurname]" value="<?php echo esc_attr( $d['brideSurname'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-conj"><?php esc_html_e( 'Bağlaç', 'sahra-davetiye' ); ?></label></th>
				<td>
					<select id="f-conj" name="sahra[conjunction]">
						<?php foreach ( Sahra_Fields::conjunction_options() as $secenek ) : ?>
							<option value="<?php echo esc_attr( $secenek ); ?>" <?php selected( $secenek, $d['conjunction'] ); ?>><?php echo esc_html( $secenek ); ?></option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr>
				<th><label for="f-slug"><?php esc_html_e( 'Bağlantı Adresi', 'sahra-davetiye' ); ?></label></th>
				<td>
					<code><?php echo esc_html( home_url( '/davet/' ) ); ?></code>
					<input id="f-slug" name="sahra[slug]" value="<?php echo esc_attr( $d['slug'] ); ?>" placeholder="ahmet-zeynep">
				</td>
			</tr>
			<?php if ( $yonetici && ! $yeni ) : ?>
				<tr>
					<th><?php esc_html_e( 'Durum', 'sahra-davetiye' ); ?></th>
					<td>
						<label><input type="checkbox" name="sahra[isActive]" value="1" <?php checked( $d['isActive'] ); ?>> <?php esc_html_e( 'Yayında', 'sahra-davetiye' ); ?></label>
					</td>
				</tr>
			<?php endif; ?>
		</table>

		<h2>2 — <?php esc_html_e( 'Düğün Bilgileri', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-date"><?php esc_html_e( 'Düğün Tarihi', 'sahra-davetiye' ); ?> *</label></th>
				<td><input type="date" id="f-date" name="sahra[weddingDate]" value="<?php echo esc_attr( $d['weddingDate'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-time"><?php esc_html_e( 'Başlangıç Saati', 'sahra-davetiye' ); ?> *</label></th>
				<td><input type="time" id="f-time" name="sahra[weddingTime]" value="<?php echo esc_attr( $d['weddingTime'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-endtime"><?php esc_html_e( 'Bitiş Saati', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input type="time" id="f-endtime" name="sahra[weddingEndTime]" value="<?php echo esc_attr( $d['weddingEndTime'] ); ?>">
					<p class="description"><?php esc_html_e( 'Boş bırakılırsa davetiyede yalnızca başlangıç saati yazar.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><?php esc_html_e( 'Mekân', 'sahra-davetiye' ); ?></th>
				<td>
					<?php /* Mekân burada SORULMUYOR: tüm davetiyelerde ortak ve yalnızca yönetici değiştirir. */ ?>
					<p>
						<strong><?php echo esc_html( $venue['venueName'] ? $venue['venueName'] : __( 'Henüz belirlenmedi', 'sahra-davetiye' ) ); ?></strong><br>
						<?php echo esc_html( implode( ', ', array_filter( array( $venue['address'], $venue['district'], $venue['city'] ) ) ) ); ?>
					</p>
					<p class="description">
						<?php esc_html_e( 'Mekân tüm davetiyelerde ortaktır ve yalnızca yönetici tarafından değiştirilir.', 'sahra-davetiye' ); ?>
						<?php if ( $yonetici ) : ?>
							<a href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-mekan' ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
						<?php endif; ?>
					</p>
				</td>
			</tr>
			<tr>
				<th><label for="f-deadline"><?php esc_html_e( 'Katılım Bildirim Son Tarihi', 'sahra-davetiye' ); ?></label></th>
				<td><input type="date" id="f-deadline" name="sahra[rsvpDeadline]" value="<?php echo esc_attr( $d['rsvpDeadline'] ); ?>"></td>
			</tr>
		</table>

		<h2>3 — <?php esc_html_e( 'Davet Metni', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-text"><?php esc_html_e( 'Davet Metni', 'sahra-davetiye' ); ?></label></th>
				<td><textarea class="large-text" id="f-text" name="sahra[invitationText]" rows="4"><?php echo esc_textarea( $d['invitationText'] ); ?></textarea></td>
			</tr>
		</table>

		<h2>4 — <?php esc_html_e( 'Mühür & Tuğra', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-seal"><?php esc_html_e( 'Mühür', 'sahra-davetiye' ); ?></label></th>
				<td>
					<select id="f-seal" name="sahra[sealType]">
						<?php foreach ( Sahra_Fields::seal_options() as $deger => $etiket ) : ?>
							<option value="<?php echo esc_attr( $deger ); ?>" <?php selected( $deger, $d['sealType'] ); ?>><?php echo esc_html( $etiket ); ?></option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr>
				<th><label for="f-monogram"><?php esc_html_e( 'Monogram', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="regular-text" id="f-monogram" name="sahra[sealMonogram]" value="<?php echo esc_attr( $d['sealMonogram'] ); ?>" placeholder="A &amp; Z">
					<p class="description"><?php esc_html_e( 'Boş bırakılırsa adların baş harfleri kullanılır.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
		</table>

		<h2>5 — <?php esc_html_e( 'Mektup Tasarımı', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-design"><?php esc_html_e( 'Tasarım', 'sahra-davetiye' ); ?></label></th>
				<td>
					<select id="f-design" name="sahra[invitationDesign]">
						<?php foreach ( Sahra_Fields::design_options() as $deger => $etiket ) : ?>
							<option value="<?php echo esc_attr( $deger ); ?>" <?php selected( $deger, $d['invitationDesign'] ); ?>><?php echo esc_html( $etiket ); ?></option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr>
				<th><label for="f-letter-img"><?php esc_html_e( 'Mektup Fotoğrafı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="large-text sahra-media" id="f-letter-img" name="sahra[letterImage]" value="<?php echo esc_attr( $d['letterImage'] ); ?>"></td>
			</tr>
		</table>

		<h2>6 — <?php esc_html_e( 'Fotoğraflar', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-cover"><?php esc_html_e( 'Kapak Fotoğrafı', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="large-text sahra-media" id="f-cover" name="sahra[coverImage]" value="<?php echo esc_attr( $d['coverImage'] ); ?>">
					<p class="description"><?php esc_html_e( 'Paylaşım kartında (WhatsApp önizlemesi) da bu görsel kullanılır.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="f-gallery"><?php esc_html_e( 'Galeri', 'sahra-davetiye' ); ?></label></th>
				<td>
					<textarea class="large-text code" id="f-gallery" name="sahra[galleryImagesText]" rows="5"><?php echo esc_textarea( $metinler['gallery'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'Her satıra bir görsel adresi. Fotoğraflar galeride aynı boyutta gösterilir.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="f-gal-title"><?php esc_html_e( 'Galeri Başlığı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="f-gal-title" name="sahra[gallerySectionTitle]" value="<?php echo esc_attr( $d['gallerySectionTitle'] ); ?>" placeholder="Fotoğraf Galerisi"></td>
			</tr>
		</table>

		<h2>7 — <?php esc_html_e( 'Hediye & Dilekler', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><?php esc_html_e( 'Hediye Bölümü', 'sahra-davetiye' ); ?></th>
				<td><label><input type="checkbox" name="sahra[giftEnabled]" value="1" <?php checked( $d['giftEnabled'] ); ?>> <?php esc_html_e( 'Göster', 'sahra-davetiye' ); ?></label></td>
			</tr>
			<tr>
				<th><label for="f-iban"><?php esc_html_e( 'IBAN', 'sahra-davetiye' ); ?></label></th>
				<td><input class="large-text code" id="f-iban" name="sahra[giftIban]" value="<?php echo esc_attr( $d['giftIban'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-acc"><?php esc_html_e( 'Hesap Sahibi', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="f-acc" name="sahra[giftAccountName]" value="<?php echo esc_attr( $d['giftAccountName'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-bank"><?php esc_html_e( 'Banka', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="f-bank" name="sahra[giftBankName]" value="<?php echo esc_attr( $d['giftBankName'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="f-gift-note"><?php esc_html_e( 'Hediye Notu', 'sahra-davetiye' ); ?></label></th>
				<td><textarea class="large-text" id="f-gift-note" name="sahra[giftNote]" rows="2"><?php echo esc_textarea( $d['giftNote'] ); ?></textarea></td>
			</tr>
			<tr>
				<th><label for="f-registry"><?php esc_html_e( 'Hediye Listesi Bağlantısı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="large-text" id="f-registry" name="sahra[giftRegistryUrl]" value="<?php echo esc_attr( $d['giftRegistryUrl'] ); ?>"></td>
			</tr>
			<tr>
				<th><?php esc_html_e( 'Dilek Defteri', 'sahra-davetiye' ); ?></th>
				<td>
					<label><input type="checkbox" name="sahra[wishesEnabled]" value="1" <?php checked( $d['wishesEnabled'] ); ?>> <?php esc_html_e( 'Göster', 'sahra-davetiye' ); ?></label>
					<p class="description"><?php esc_html_e( 'Misafir dilekleri onayınızdan geçmeden davetiyede görünmez.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
		</table>

		<h2>8 — <?php esc_html_e( 'Ses Ayarları', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><?php esc_html_e( 'Arka Plan Müziği', 'sahra-davetiye' ); ?></th>
				<td><label><input type="checkbox" name="sahra[soundEnabled]" value="1" <?php checked( $d['soundEnabled'] ); ?>> <?php esc_html_e( 'Açık', 'sahra-davetiye' ); ?></label></td>
			</tr>
			<tr>
				<th><label for="f-music"><?php esc_html_e( 'Müzik Dosyası', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="large-text sahra-media" id="f-music" name="sahra[backgroundMusicUrl]" value="<?php echo esc_attr( $d['backgroundMusicUrl'] ); ?>">
					<p class="description">
						<?php esc_html_e( 'Hazır parçalar:', 'sahra-davetiye' ); ?>
						<?php foreach ( array( 'piyano-sakin', 'arp-zarif', 'yayli-duygusal', 'anadolu-ney' ) as $parca ) : ?>
							<button type="button" class="button-link sahra-pick" data-target="f-music" data-value="<?php echo esc_url( SAHRA_URL . 'assets/muzik/' . $parca . '.mp3' ); ?>"><?php echo esc_html( $parca ); ?></button>
						<?php endforeach; ?>
					</p>
				</td>
			</tr>
			<tr>
				<th><label for="f-volume"><?php esc_html_e( 'Ses Düzeyi', 'sahra-davetiye' ); ?></label></th>
				<td><input type="number" min="0" max="100" id="f-volume" name="sahra[soundVolume]" value="<?php echo esc_attr( (int) $d['soundVolume'] ); ?>"> %</td>
			</tr>
			<tr>
				<th><label for="f-seal-sound"><?php esc_html_e( 'Mühür Kırılma Sesi', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="large-text sahra-media" id="f-seal-sound" name="sahra[sealBreakSound]" value="<?php echo esc_attr( $d['sealBreakSound'] ); ?>">
					<p class="description">
						<button type="button" class="button-link sahra-pick" data-target="f-seal-sound" data-value="<?php echo esc_url( SAHRA_URL . 'assets/muzik/muhur-kirilma.mp3' ); ?>">muhur-kirilma</button>
					</p>
				</td>
			</tr>
		</table>

		<h2>9 — <?php esc_html_e( 'Tema', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-theme"><?php esc_html_e( 'Tema', 'sahra-davetiye' ); ?></label></th>
				<td>
					<select id="f-theme" name="sahra[theme]">
						<?php foreach ( Sahra_Fields::theme_options() as $deger => $etiket ) : ?>
							<option value="<?php echo esc_attr( $deger ); ?>" <?php selected( $deger, $d['theme'] ); ?>><?php echo esc_html( $etiket ); ?></option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
		</table>

		<h2>10 — <?php esc_html_e( 'Program', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-program"><?php esc_html_e( 'Günün Akışı', 'sahra-davetiye' ); ?></label></th>
				<td>
					<textarea class="large-text code" id="f-program" name="sahra[programText]" rows="6" placeholder="15:00 | Kapı Açılışı | Konukların karşılanması"><?php echo esc_textarea( $metinler['program'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'Her satır bir madde: saat | başlık | açıklama', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
		</table>

		<h2>11 — <?php esc_html_e( 'Sık Sorulan Sorular', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-faq"><?php esc_html_e( 'Sorular', 'sahra-davetiye' ); ?></label></th>
				<td>
					<textarea class="large-text code" id="f-faq" name="sahra[faqText]" rows="6" placeholder="Çocuklar davetli mi? | Düğünümüz yetişkinlere özel planlanmıştır."><?php echo esc_textarea( $metinler['faq'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'Her satır bir madde: soru | cevap', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
		</table>

		<h2>12 — <?php esc_html_e( 'Hikayemiz', 'sahra-davetiye' ); ?></h2>
		<table class="form-table">
			<tr>
				<th><label for="f-story"><?php esc_html_e( 'Zaman Tüneli', 'sahra-davetiye' ); ?></label></th>
				<td>
					<textarea class="large-text code" id="f-story" name="sahra[storyText]" rows="6" placeholder="2022 | İlk Tanışma | Ortak bir arkadaşın davetinde"><?php echo esc_textarea( $metinler['story'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'Her satır bir madde: yıl | başlık | açıklama', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="f-social"><?php esc_html_e( 'Sosyal Hesaplar', 'sahra-davetiye' ); ?></label></th>
				<td>
					<textarea class="large-text code" id="f-social" name="sahra[socialText]" rows="3" placeholder="Instagram | https://instagram.com/..."><?php echo esc_textarea( $metinler['social'] ); ?></textarea>
					<p class="description"><?php esc_html_e( 'Her satır bir madde: ad | adres', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="f-hashtag"><?php esc_html_e( 'Etiket (Hashtag)', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="f-hashtag" name="sahra[hashtag]" value="<?php echo esc_attr( $d['hashtag'] ); ?>" placeholder="#AhmetveZeynep"></td>
			</tr>
		</table>

		<?php submit_button( $yeni ? __( 'Davetiyeyi Oluştur', 'sahra-davetiye' ) : __( 'Kaydet', 'sahra-davetiye' ) ); ?>
	</form>
</div>
