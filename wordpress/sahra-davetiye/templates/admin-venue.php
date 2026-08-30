<?php
/**
 * Ortak mekân — yalnızca yönetici.
 *
 * @var array $venue
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap sahra-admin">
	<h1><?php esc_html_e( 'Mekân', 'sahra-davetiye' ); ?></h1>
	<p class="description">
		<?php esc_html_e( 'Buradaki bilgi TÜM davetiyelerde görünür. Çift hesapları bunu göremez ve değiştiremez.', 'sahra-davetiye' ); ?>
	</p>

	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Kaydedildi — yayındaki tüm davetiyelerde güncellendi.', 'sahra-davetiye' ); ?></p></div>
	<?php endif; ?>

	<form method="post">
		<?php wp_nonce_field( 'sahra_save_venue' ); ?>
		<input type="hidden" name="sahra_action" value="save_venue">

		<table class="form-table">
			<tr>
				<th><label for="v-name"><?php esc_html_e( 'Salon / Mekân Adı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="v-name" name="venue[venueName]" value="<?php echo esc_attr( $venue['venueName'] ); ?>" placeholder="Sahra Bahçe Düğün Salonu"></td>
			</tr>
			<tr>
				<th><label for="v-address"><?php esc_html_e( 'Adres', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="v-address" name="venue[address]" value="<?php echo esc_attr( $venue['address'] ); ?>" placeholder="Bağdat Caddesi No 120"></td>
			</tr>
			<tr>
				<th><label for="v-district"><?php esc_html_e( 'İlçe', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="v-district" name="venue[district]" value="<?php echo esc_attr( $venue['district'] ); ?>" placeholder="Kadıköy"></td>
			</tr>
			<tr>
				<th><label for="v-city"><?php esc_html_e( 'İl', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="v-city" name="venue[city]" value="<?php echo esc_attr( $venue['city'] ); ?>" placeholder="İstanbul"></td>
			</tr>
			<tr>
				<th><label for="v-map"><?php esc_html_e( 'Google Maps Linki', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="v-map" name="venue[mapUrl]" value="<?php echo esc_attr( $venue['mapUrl'] ); ?>" placeholder="https://maps.google.com/..."></td>
			</tr>
		</table>

		<?php submit_button( __( 'Kaydet', 'sahra-davetiye' ) ); ?>
	</form>
</div>
