<?php
/**
 * Salonlar — yalnızca yönetici.
 *
 * İşletmenin birden fazla salonu var; çift kendi davetiyesinde bunlardan
 * birini seçiyor. Adres hâlâ çiftin YAZDIĞI bir şey değil: yanlış yazan
 * bir çiftin misafirleri yanlış yere gidiyor ve kimse fark etmiyordu.
 *
 * @var array      $salonlar
 * @var array      $venue    Düzenlenen salon ya da boş iskelet.
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$sahra_sayfa = 'sahra-salonlar';
include SAHRA_DIR . 'templates/admin-header.php';

$sahra_duzenliyor = ! empty( $venue['id'] );
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Kaydedildi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem"><?php esc_html_e( 'Bu salonu kullanan tüm davetiyelerde güncellendi.', 'sahra-davetiye' ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $_GET['hata'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-body" style="color:var(--c-danger)"><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['hata'] ) ) ); // phpcs:ignore ?></p>
		</div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Salon', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem">
				<?php echo $sahra_duzenliyor ? esc_html__( 'Salonu Düzenle', 'sahra-davetiye' ) : esc_html__( 'Yeni Salon', 'sahra-davetiye' ); ?>
			</h1>
			<p class="lead"><?php esc_html_e( 'Çift, davetiyesini hazırlarken buradaki salonlardan birini seçer.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_save_venue' ); ?>
			<input type="hidden" name="sahra_action" value="save_venue">
			<input type="hidden" name="venue[id]" value="<?php echo esc_attr( $venue['id'] ); ?>">

			<div class="alan">
				<label class="field-label" for="v-name"><?php esc_html_e( 'Salon Adı *', 'sahra-davetiye' ); ?></label>
				<input id="v-name" type="text" name="venue[venueName]" value="<?php echo esc_attr( $venue['venueName'] ); ?>" placeholder="Sahra Bahçe Düğün Salonu" required>
			</div>

			<div class="alan">
				<label class="field-label" for="v-address"><?php esc_html_e( 'Adres', 'sahra-davetiye' ); ?></label>
				<input id="v-address" type="text" name="venue[address]" value="<?php echo esc_attr( $venue['address'] ); ?>" placeholder="Bağdat Caddesi No 120">
			</div>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="v-district"><?php esc_html_e( 'İlçe', 'sahra-davetiye' ); ?></label>
					<input id="v-district" type="text" name="venue[district]" value="<?php echo esc_attr( $venue['district'] ); ?>" placeholder="Kadıköy">
				</div>
				<div class="alan">
					<label class="field-label" for="v-city"><?php esc_html_e( 'İl', 'sahra-davetiye' ); ?></label>
					<input id="v-city" type="text" name="venue[city]" value="<?php echo esc_attr( $venue['city'] ); ?>" placeholder="İstanbul">
				</div>
			</div>

			<div class="alan">
				<label class="field-label" for="v-map"><?php esc_html_e( 'Google Maps Linki', 'sahra-davetiye' ); ?></label>
				<input id="v-map" type="url" name="venue[mapUrl]" value="<?php echo esc_attr( $venue['mapUrl'] ); ?>" placeholder="https://maps.google.com/...">
			</div>

			<?php
			/*
			 * Salonun özellikleri MİSAFİR için yazılır, işletme için değil.
			 * "Kapalı otopark", "Metroya 5 dk", "Çocuk oyun alanı" gibi
			 * satırlar misafirin o akşam vereceği kararları etkiliyor;
			 * "1200 kişilik kapasite" etkilemiyor.
			 */
			?>
			<?php
			/*
			 * Yol tarifi burada, çiftin formunda değil.
			 *
			 * Aynı salona gelen herkes aynı yoldan geliyor: tarifi her
			 * çifte ayrı yazdırmak hem gereksiz bir soru, hem de birinin
			 * yanlış yazıp kimsenin fark etmemesi demekti. Yönetici bir
			 * kez yazıyor, o salonu seçen bütün davetiyelerde çıkıyor.
			 */
			?>
			<div class="alan">
				<label class="field-label" for="v-directions"><?php esc_html_e( 'Nasıl Gelirsiniz?', 'sahra-davetiye' ); ?></label>
				<textarea id="v-directions" name="venue[venueDirections]" rows="4" placeholder="E-5'ten Kadıköy çıkışına dönüp sahil yolunu takip edin. Marmaray Ayrılıkçeşme durağından 10 dakika yürüme mesafesinde."><?php echo esc_textarea( $venue['venueDirections'] ); ?></textarea>
				<p class="ipucu"><?php esc_html_e( 'Davetiyenin konum bölümünde, adresin altında görünür. Boş bırakılırsa hiç çıkmaz.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="alan">
				<label class="field-label" for="v-features"><?php esc_html_e( 'Misafirin İşine Yarayacak Bilgiler', 'sahra-davetiye' ); ?></label>
				<textarea id="v-features" name="venue[features]" rows="6" placeholder="Kapalı otopark (ücretsiz)&#10;Vale hizmeti&#10;Metro Kadıköy'e 5 dk yürüme&#10;Engelli erişimi&#10;Çocuk oyun alanı ve palyaço"><?php echo esc_textarea( implode( "\n", (array) $venue['features'] ) ); ?></textarea>
				<p class="ipucu"><?php esc_html_e( 'Her satır bir madde. Davetiyenin konum bölümünde liste olarak görünür.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="sahra-adim-alt">
				<?php if ( $sahra_duzenliyor ) : ?>
					<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-salonlar' ) ); ?>"><?php esc_html_e( 'Vazgeç', 'sahra-davetiye' ); ?></a>
				<?php endif; ?>
				<button type="submit" class="cta" style="margin-left:auto">
					<?php echo $sahra_duzenliyor ? esc_html__( 'Kaydet', 'sahra-davetiye' ) : esc_html__( 'Salon Ekle', 'sahra-davetiye' ); ?>
				</button>
			</div>
		</form>
	</section>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">02</span>
				<span class="t-label"><?php esc_html_e( 'Mevcut', 'sahra-davetiye' ); ?></span>
			</div>
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Salonlar', 'sahra-davetiye' ); ?></h2>
		</header>

		<?php if ( ! $salonlar ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz salon yok. Yukarıdan ilk salonu ekleyin.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $salonlar as $sahra_salon ) : ?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $sahra_salon['venueName'] ); ?></span>
						</div>
						<div class="meta">
							<span><?php echo esc_html( implode( ', ', array_filter( array( $sahra_salon['address'], $sahra_salon['district'], $sahra_salon['city'] ) ) ) ); ?></span>
							<span>
								<?php
								/* translators: %d: özellik sayısı. */
								echo esc_html( sprintf( _n( '%d bilgi', '%d bilgi', count( $sahra_salon['features'] ), 'sahra-davetiye' ), count( $sahra_salon['features'] ) ) );
								?>
							</span>
						</div>
						<div class="eylem">
							<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-salonlar&salon=' . rawurlencode( $sahra_salon['id'] ) ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
							<form method="post" onsubmit="return confirm('<?php echo esc_js( __( 'Salon silinecek. Bu salonu seçmiş davetiyeler ilk salona düşer. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
								<?php wp_nonce_field( 'sahra_delete_venue' ); ?>
								<input type="hidden" name="sahra_action" value="delete_venue">
								<input type="hidden" name="venue_id" value="<?php echo esc_attr( $sahra_salon['id'] ); ?>">
								<button class="eylem-link tehlike"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
							</form>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
</div>
