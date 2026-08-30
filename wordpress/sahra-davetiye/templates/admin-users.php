<?php
/**
 * Çift hesapları.
 *
 * @var array $hesaplar
 * @var array|false $kimlik
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$giris = wp_login_url();
?>
<div class="wrap sahra-admin">
	<h1><?php esc_html_e( 'Çift Hesapları', 'sahra-davetiye' ); ?></h1>

	<?php if ( ! empty( $_GET['hata'] ) ) : // phpcs:ignore ?>
		<div class="notice notice-error"><p><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['hata'] ) ) ); // phpcs:ignore ?></p></div>
	<?php endif; ?>

	<?php if ( $kimlik ) : ?>
		<?php
		/*
		 * Giriş bilgileri kutusu.
		 *
		 * Parola yalnızca burada, bir kez görünür — sunucuda özet olarak
		 * saklandığı için ikinci bir gösterme şansı yok. Üç satır da tek
		 * tuşla kopyalanıyor; eskiden giriş adresi kutuda hiç yazmadığı
		 * için her seferinde elle ekleniyordu.
		 */
		$blok = "Sahra Davetiye — giriş bilgileriniz\n\n"
			. 'Giriş linki: ' . $giris . "\n"
			. 'Kullanıcı adı: ' . $kimlik['user'] . "\n"
			. 'Şifre: ' . $kimlik['pass'];
		?>
		<div class="notice notice-success sahra-cred">
			<h2><?php esc_html_e( 'Giriş Bilgileri', 'sahra-davetiye' ); ?></h2>
			<dl>
				<dt><?php esc_html_e( 'Giriş Linki', 'sahra-davetiye' ); ?></dt>
				<dd><code><?php echo esc_html( $giris ); ?></code></dd>
				<dt><?php esc_html_e( 'Kullanıcı Adı', 'sahra-davetiye' ); ?></dt>
				<dd><code><?php echo esc_html( $kimlik['user'] ); ?></code></dd>
				<dt><?php esc_html_e( 'Şifre', 'sahra-davetiye' ); ?></dt>
				<dd><code><?php echo esc_html( $kimlik['pass'] ); ?></code></dd>
			</dl>
			<p><?php esc_html_e( 'Bu şifre bir daha gösterilmez — çifte iletmeyi unutmayın.', 'sahra-davetiye' ); ?></p>
			<button type="button" class="button button-primary sahra-copy" data-copy="<?php echo esc_attr( $blok ); ?>">
				<?php esc_html_e( 'Üçünü Birden Kopyala', 'sahra-davetiye' ); ?>
			</button>
		</div>
	<?php endif; ?>

	<h2><?php esc_html_e( 'Yeni Hesap', 'sahra-davetiye' ); ?></h2>
	<form method="post">
		<?php wp_nonce_field( 'sahra_create_user' ); ?>
		<input type="hidden" name="sahra_action" value="create_user">
		<table class="form-table">
			<tr>
				<th><label for="u-login"><?php esc_html_e( 'Kullanıcı Adı', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="u-login" name="username" required placeholder="ahmet-zeynep"></td>
			</tr>
			<tr>
				<th><label for="u-name"><?php esc_html_e( 'Görünen Ad', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="u-name" name="display_name" placeholder="Ahmet &amp; Zeynep"></td>
			</tr>
			<tr>
				<th><label for="u-mail"><?php esc_html_e( 'E-posta (İsteğe Bağlı)', 'sahra-davetiye' ); ?></label></th>
				<td><input class="regular-text" id="u-mail" name="email" type="email"></td>
			</tr>
		</table>
		<?php submit_button( __( 'Hesap Aç', 'sahra-davetiye' ) ); ?>
	</form>

	<h2><?php esc_html_e( 'Mevcut Hesaplar', 'sahra-davetiye' ); ?></h2>
	<?php if ( ! $hesaplar ) : ?>
		<p><?php esc_html_e( 'Henüz çift hesabı yok.', 'sahra-davetiye' ); ?></p>
	<?php else : ?>
		<table class="widefat striped">
			<thead><tr>
				<th><?php esc_html_e( 'Kullanıcı', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Ad', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Davetiye', 'sahra-davetiye' ); ?></th>
				<th></th>
			</tr></thead>
			<tbody>
			<?php foreach ( $hesaplar as $hesap ) : ?>
				<?php $sayi = count( Sahra_Invitation::all_for_user( $hesap->ID ) ); ?>
				<tr>
					<td><code><?php echo esc_html( $hesap->user_login ); ?></code></td>
					<td><?php echo esc_html( $hesap->display_name ); ?></td>
					<td><?php echo esc_html( $sayi ); ?></td>
					<td>
						<form method="post" style="display:inline">
							<?php wp_nonce_field( 'sahra_reset_password' ); ?>
							<input type="hidden" name="sahra_action" value="reset_password">
							<input type="hidden" name="user_id" value="<?php echo esc_attr( $hesap->ID ); ?>">
							<button class="button"><?php esc_html_e( 'Şifre Sıfırla', 'sahra-davetiye' ); ?></button>
						</form>
						<form method="post" style="display:inline" onsubmit="return confirm('<?php echo esc_js( __( 'Hesap, davetiyeleri, katılımları ve fotoğrafları silinecek. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
							<?php wp_nonce_field( 'sahra_delete_user' ); ?>
							<input type="hidden" name="sahra_action" value="delete_user">
							<input type="hidden" name="user_id" value="<?php echo esc_attr( $hesap->ID ); ?>">
							<button class="button button-link-delete"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
						</form>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	<?php endif; ?>
</div>
