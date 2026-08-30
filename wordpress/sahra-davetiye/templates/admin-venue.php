<?php
/**
 * Ortak mekân — yalnızca yönetici.
 *
 * @var array $venue
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$sahra_sayfa = 'sahra-mekan';
include SAHRA_DIR . 'templates/admin-header.php';
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Kaydedildi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem"><?php esc_html_e( 'Yayındaki tüm davetiyelerde güncellendi.', 'sahra-davetiye' ); ?></p>
		</div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Mekân', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Düğün Salonu', 'sahra-davetiye' ); ?></h1>
			<p class="lead"><?php esc_html_e( 'Buradaki bilgi tüm davetiyelerde görünür; çift hesapları değiştiremez.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_save_venue' ); ?>
			<input type="hidden" name="sahra_action" value="save_venue">

			<div class="alan">
				<label class="field-label" for="v-name"><?php esc_html_e( 'Salon / Mekân Adı *', 'sahra-davetiye' ); ?></label>
				<input id="v-name" name="venue[venueName]" value="<?php echo esc_attr( $venue['venueName'] ); ?>" placeholder="Sahra Bahçe Düğün Salonu">
			</div>

			<div class="alan">
				<label class="field-label" for="v-address"><?php esc_html_e( 'Adres', 'sahra-davetiye' ); ?></label>
				<input id="v-address" name="venue[address]" value="<?php echo esc_attr( $venue['address'] ); ?>" placeholder="Bağdat Caddesi No 120">
			</div>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="v-district"><?php esc_html_e( 'İlçe', 'sahra-davetiye' ); ?></label>
					<input id="v-district" name="venue[district]" value="<?php echo esc_attr( $venue['district'] ); ?>" placeholder="Kadıköy">
				</div>
				<div class="alan">
					<label class="field-label" for="v-city"><?php esc_html_e( 'İl', 'sahra-davetiye' ); ?></label>
					<input id="v-city" name="venue[city]" value="<?php echo esc_attr( $venue['city'] ); ?>" placeholder="İstanbul">
				</div>
			</div>

			<div class="alan">
				<label class="field-label" for="v-map"><?php esc_html_e( 'Google Maps Linki', 'sahra-davetiye' ); ?></label>
				<input id="v-map" name="venue[mapUrl]" value="<?php echo esc_attr( $venue['mapUrl'] ); ?>" placeholder="https://maps.google.com/...">
			</div>

			<div class="sahra-adim-alt">
				<button type="submit" class="cta" style="margin-left:auto"><?php esc_html_e( 'Kaydet', 'sahra-davetiye' ); ?></button>
			</div>
		</form>
	</section>
</div>
