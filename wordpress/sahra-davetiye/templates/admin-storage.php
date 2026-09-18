<?php
/**
 * Depolama ayarları.
 *
 * @var array $storage
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$sahra_sayfa = 'sahra-depolama';
$drive       = $storage['drive'];
$sina        = isset( $_GET['sina'] ) ? sanitize_text_field( wp_unslash( $_GET['sina'] ) ) : ''; // phpcs:ignore
include SAHRA_DIR . 'templates/admin-header.php';
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<?php if ( 'ok' === $sina || '' === $sina ) : ?>
			<div class="bildirim"><p class="t-body"><?php esc_html_e( 'Kaydedildi ve bağlantı doğrulandı.', 'sahra-davetiye' ); ?></p></div>
		<?php else : ?>
			<div class="bildirim hata">
				<p class="t-label"><?php esc_html_e( 'Google Drive bağlantısı çalışmıyor', 'sahra-davetiye' ); ?></p>
				<p class="t-body" style="margin-top:0.3rem"><?php echo esc_html( $sina ); ?></p>
				<p class="t-body"><?php esc_html_e( 'Bu hâliyle fotoğraflar bu sunucuya kaydedilmeye devam eder.', 'sahra-davetiye' ); ?></p>
			</div>
		<?php endif; ?>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Depolama', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Fotoğraflar Nereye?', 'sahra-davetiye' ); ?></h1>
			<p class="lead"><?php esc_html_e( 'Bir düğünde misafir fotoğrafları kolayca birkaç gigabayta çıkar; barındırma kotanız dolarsa yalnızca fotoğraflar değil sitenin tamamı etkilenir.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_save_storage' ); ?>
			<input type="hidden" name="sahra_action" value="save_storage">

			<div class="alan">
				<span class="field-label"><?php esc_html_e( 'Depolama Yeri', 'sahra-davetiye' ); ?></span>
				<div class="secenekler">
					<label class="secenek">
						<input type="radio" name="storage[driver]" value="local" <?php checked( 'local', $storage['driver'] ); ?>>
						<span class="ad"><?php esc_html_e( 'Bu Sunucu', 'sahra-davetiye' ); ?></span>
						<span class="t-body" style="display:block"><?php esc_html_e( 'wp-content/uploads', 'sahra-davetiye' ); ?></span>
					</label>
					<label class="secenek">
						<input type="radio" name="storage[driver]" value="drive" <?php checked( 'drive', $storage['driver'] ); ?>>
						<span class="ad"><?php esc_html_e( 'Google Drive', 'sahra-davetiye' ); ?></span>
						<span class="t-body" style="display:block"><?php esc_html_e( 'Barındırmanızdan yer kaplamaz', 'sahra-davetiye' ); ?></span>
					</label>
				</div>
			</div>

			<div class="alan">
				<p class="t-label" style="color:var(--c-gold)"><?php esc_html_e( 'Google Drive', 'sahra-davetiye' ); ?></p>
				<p class="ipucu"><?php esc_html_e( 'Kurulum adımları eklenti klasöründeki README-KURULUM.md dosyasında.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="alan">
				<label class="field-label" for="d-id"><?php esc_html_e( 'Client ID', 'sahra-davetiye' ); ?></label>
				<input id="d-id" type="text" name="storage[drive][client_id]" value="<?php echo esc_attr( $drive['client_id'] ); ?>">
			</div>

			<div class="alan">
				<label class="field-label" for="d-secret"><?php esc_html_e( 'Client Secret', 'sahra-davetiye' ); ?></label>
				<input id="d-secret" type="password" name="storage[drive][client_secret]" value=""
					placeholder="<?php echo $drive['client_secret'] ? esc_attr__( 'Kayıtlı — değiştirmek için yazın', 'sahra-davetiye' ) : ''; ?>">
				<p class="ipucu"><?php esc_html_e( 'Boş bırakırsanız kayıtlı değer korunur.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="alan">
				<label class="field-label" for="d-token"><?php esc_html_e( 'Refresh Token', 'sahra-davetiye' ); ?></label>
				<input id="d-token" type="password" name="storage[drive][refresh_token]" value=""
					placeholder="<?php echo $drive['refresh_token'] ? esc_attr__( 'Kayıtlı — değiştirmek için yazın', 'sahra-davetiye' ) : ''; ?>">
				<p class="ipucu"><?php esc_html_e( 'Boş bırakırsanız kayıtlı değer korunur.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="alan">
				<label class="field-label" for="d-folder"><?php esc_html_e( 'Klasör Kimliği', 'sahra-davetiye' ); ?></label>
				<input id="d-folder" type="text" name="storage[drive][folder_id]" value="<?php echo esc_attr( $drive['folder_id'] ); ?>">
				<p class="ipucu"><?php esc_html_e( 'Drive klasörünü açtığınızda adreste /folders/ sonrası gelen kısım. Boşsa dosyalar sürücünün kökine yazılır.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="sahra-adim-alt">
				<span class="t-body muted">
					<?php
					/* translators: %s: etkin depolama sürücüsü. */
					echo esc_html( sprintf( __( 'Şu an kullanılan: %s', 'sahra-davetiye' ), Sahra_Storage::driver()->label() ) );
					?>
				</span>
				<button type="submit" class="cta"><?php esc_html_e( 'Kaydet ve Sına', 'sahra-davetiye' ); ?></button>
			</div>
		</form>
	</section>
</div>
