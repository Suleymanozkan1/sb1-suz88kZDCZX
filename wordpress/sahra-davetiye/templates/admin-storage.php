<?php
/**
 * Depolama ayarları.
 *
 * @var array $storage
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$drive = $storage['drive'];
$sina  = isset( $_GET['sina'] ) ? sanitize_text_field( wp_unslash( $_GET['sina'] ) ) : ''; // phpcs:ignore
?>
<div class="wrap sahra-admin">
	<h1><?php esc_html_e( 'Depolama', 'sahra-davetiye' ); ?></h1>
	<p class="description">
		<?php esc_html_e( 'Misafirlerin masadaki QR koddan yüklediği fotoğraflar nereye kaydedilsin? Bir düğünde bu dosyalar kolayca birkaç gigabayta çıkar; barındırma kotanız dolarsa yalnızca fotoğraflar değil sitenin tamamı etkilenir.', 'sahra-davetiye' ); ?>
	</p>

	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<?php if ( 'ok' === $sina || '' === $sina ) : ?>
			<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Kaydedildi ve bağlantı doğrulandı.', 'sahra-davetiye' ); ?></p></div>
		<?php else : ?>
			<div class="notice notice-error"><p><strong><?php esc_html_e( 'Kaydedildi ama Google Drive bağlantısı çalışmıyor:', 'sahra-davetiye' ); ?></strong> <?php echo esc_html( $sina ); ?></p>
			<p><?php esc_html_e( 'Bu hâliyle fotoğraflar bu sunucuya kaydedilmeye devam eder.', 'sahra-davetiye' ); ?></p></div>
		<?php endif; ?>
	<?php endif; ?>

	<form method="post">
		<?php wp_nonce_field( 'sahra_save_storage' ); ?>
		<input type="hidden" name="sahra_action" value="save_storage">

		<table class="form-table">
			<tr>
				<th><?php esc_html_e( 'Depolama Yeri', 'sahra-davetiye' ); ?></th>
				<td>
					<label><input type="radio" name="storage[driver]" value="local" <?php checked( 'local', $storage['driver'] ); ?>> <?php esc_html_e( 'Bu sunucu (wp-content/uploads)', 'sahra-davetiye' ); ?></label><br>
					<label><input type="radio" name="storage[driver]" value="drive" <?php checked( 'drive', $storage['driver'] ); ?>> <?php esc_html_e( 'Google Drive', 'sahra-davetiye' ); ?></label>
				</td>
			</tr>
		</table>

		<h2><?php esc_html_e( 'Google Drive', 'sahra-davetiye' ); ?></h2>
		<p class="description"><?php esc_html_e( 'Kurulum adımları eklenti klasöründeki README-KURULUM.md dosyasında.', 'sahra-davetiye' ); ?></p>

		<table class="form-table">
			<tr>
				<th><label for="d-id"><?php esc_html_e( 'Client ID', 'sahra-davetiye' ); ?></label></th>
				<td><input class="large-text code" id="d-id" name="storage[drive][client_id]" value="<?php echo esc_attr( $drive['client_id'] ); ?>"></td>
			</tr>
			<tr>
				<th><label for="d-secret"><?php esc_html_e( 'Client Secret', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="large-text code" id="d-secret" name="storage[drive][client_secret]" value="" placeholder="<?php echo $drive['client_secret'] ? esc_attr__( '•••••••• (kayıtlı — değiştirmek için yazın)', 'sahra-davetiye' ) : ''; ?>">
					<p class="description"><?php esc_html_e( 'Boş bırakırsanız kayıtlı değer korunur.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="d-token"><?php esc_html_e( 'Refresh Token', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="large-text code" id="d-token" name="storage[drive][refresh_token]" value="" placeholder="<?php echo $drive['refresh_token'] ? esc_attr__( '•••••••• (kayıtlı — değiştirmek için yazın)', 'sahra-davetiye' ) : ''; ?>">
					<p class="description"><?php esc_html_e( 'Boş bırakırsanız kayıtlı değer korunur.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label for="d-folder"><?php esc_html_e( 'Klasör Kimliği', 'sahra-davetiye' ); ?></label></th>
				<td>
					<input class="large-text code" id="d-folder" name="storage[drive][folder_id]" value="<?php echo esc_attr( $drive['folder_id'] ); ?>">
					<p class="description"><?php esc_html_e( 'Drive klasörünü açtığınızda adres çubuğunda /folders/ sonrası gelen kısım. Boş bırakılırsa dosyalar sürücünün kökine yazılır.', 'sahra-davetiye' ); ?></p>
				</td>
			</tr>
		</table>

		<?php submit_button( __( 'Kaydet ve Sına', 'sahra-davetiye' ) ); ?>
	</form>
</div>
