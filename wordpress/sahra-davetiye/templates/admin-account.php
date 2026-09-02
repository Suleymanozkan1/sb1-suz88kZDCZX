<?php
/**
 * Hesap ayarları — kendi parolasını değiştirme.
 *
 * Mevcut parola soruluyor: çerezi ele geçiren biri parolayı da değiştirip
 * hesabı devralamasın.
 *
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$sahra_sayfa = 'sahra-ayarlar';
$kullanici   = wp_get_current_user();
include SAHRA_DIR . 'templates/admin-header.php';
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim"><p class="t-body"><?php esc_html_e( 'Parolanız değiştirildi.', 'sahra-davetiye' ); ?></p></div>
	<?php endif; ?>

	<?php if ( ! empty( $_GET['hata'] ) ) : // phpcs:ignore ?>
		<div class="bildirim hata"><p class="t-body"><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['hata'] ) ) ); // phpcs:ignore ?></p></div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Hesap', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Hesap Ayarları', 'sahra-davetiye' ); ?></h1>
			<p class="lead">
				<?php
				/* translators: %s: kullanıcı adı. */
				echo esc_html( sprintf( __( 'Kullanıcı adınız: %s', 'sahra-davetiye' ), $kullanici->user_login ) );
				?>
			</p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_change_password' ); ?>
			<input type="hidden" name="sahra_action" value="change_password">

			<div class="alan">
				<label class="field-label" for="p-cur"><?php esc_html_e( 'Mevcut Parola', 'sahra-davetiye' ); ?></label>
				<input id="p-cur" type="password" name="current_password" required autocomplete="current-password">
			</div>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="p-new"><?php esc_html_e( 'Yeni Parola', 'sahra-davetiye' ); ?></label>
					<input id="p-new" type="password" name="new_password" required autocomplete="new-password">
				</div>
				<div class="alan">
					<label class="field-label" for="p-rep"><?php esc_html_e( 'Yeni Parola (Tekrar)', 'sahra-davetiye' ); ?></label>
					<input id="p-rep" type="password" name="repeat_password" required autocomplete="new-password">
				</div>
			</div>

			<p class="ipucu"><?php esc_html_e( 'En az 8 karakter.', 'sahra-davetiye' ); ?></p>

			<div class="sahra-adim-alt">
				<button type="submit" class="cta" style="margin-left:auto"><?php esc_html_e( 'Parolayı Değiştir', 'sahra-davetiye' ); ?></button>
			</div>
		</form>
	</section>
</div>
