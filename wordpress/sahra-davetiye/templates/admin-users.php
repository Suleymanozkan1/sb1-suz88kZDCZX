<?php
/**
 * Çift hesapları.
 *
 * @var array $hesaplar
 * @var array|false $kimlik
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$sahra_sayfa = 'sahra-hesaplar';
// Çifte verilecek adres: filtre kalktığı için doğrudan yazılıyor.
$giris       = Sahra_Login::url();
include SAHRA_DIR . 'templates/admin-header.php';
?>
	<?php if ( ! empty( $_GET['hata'] ) ) : // phpcs:ignore ?>
		<div class="bildirim hata"><p class="t-body"><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['hata'] ) ) ); // phpcs:ignore ?></p></div>
	<?php endif; ?>

	<?php if ( $kimlik ) : ?>
		<?php
		/*
		 * Giriş bilgileri kutusu.
		 *
		 * Parola sunucuda yalnızca özet olarak saklandığı için burada, bir
		 * kez görünür. Üç satır tek tuşla kopyalanıyor; eskiden giriş adresi
		 * kutuda hiç yazmadığı için her seferinde elle ekleniyordu.
		 */
		$blok = "Sahra Davetiye — giriş bilgileriniz\n\n"
			. 'Giriş linki: ' . $giris . "\n"
			. 'Kullanıcı adı: ' . $kimlik['user'] . "\n"
			. 'Şifre: ' . $kimlik['pass'];
		?>
		<div class="bildirim sahra-cred">
			<p class="t-label"><?php esc_html_e( 'Giriş Bilgileri', 'sahra-davetiye' ); ?></p>
			<dl>
				<dt><?php esc_html_e( 'Giriş Linki', 'sahra-davetiye' ); ?></dt>
				<dd><?php echo esc_html( $giris ); ?></dd>
				<dt><?php esc_html_e( 'Kullanıcı Adı', 'sahra-davetiye' ); ?></dt>
				<dd><?php echo esc_html( $kimlik['user'] ); ?></dd>
				<dt><?php esc_html_e( 'Şifre', 'sahra-davetiye' ); ?></dt>
				<dd class="gizli"><?php echo esc_html( $kimlik['pass'] ); ?></dd>
			</dl>
			<p class="t-body"><?php esc_html_e( 'Bu şifre bir daha gösterilmez — çifte iletmeyi unutmayın.', 'sahra-davetiye' ); ?></p>
			<p style="margin-top:1rem">
				<button type="button" class="cta sahra-copy" data-copy="<?php echo esc_attr( $blok ); ?>">
					<?php esc_html_e( 'Üçünü Birden Kopyala', 'sahra-davetiye' ); ?>
				</button>
			</p>
		</div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Hesaplar', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Yeni Hesap', 'sahra-davetiye' ); ?></h1>
			<p class="lead"><?php esc_html_e( 'Her çift için bir hesap. Parola otomatik üretilir ve bir kez gösterilir.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_create_user' ); ?>
			<input type="hidden" name="sahra_action" value="create_user">

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="u-login"><?php esc_html_e( 'Kullanıcı Adı *', 'sahra-davetiye' ); ?></label>
					<input id="u-login" type="text" name="username" required placeholder="ahmet-zeynep">
				</div>
				<div class="alan">
					<label class="field-label" for="u-name"><?php esc_html_e( 'Görünen Ad', 'sahra-davetiye' ); ?></label>
					<input id="u-name" type="text" name="display_name" placeholder="Ahmet &amp; Zeynep">
				</div>
			</div>

			<div class="alan">
				<label class="field-label" for="u-mail"><?php esc_html_e( 'E-posta (İsteğe Bağlı)', 'sahra-davetiye' ); ?></label>
				<input id="u-mail" name="email" type="email">
			</div>

			<div class="sahra-adim-alt">
				<button type="submit" class="cta" style="margin-left:auto"><?php esc_html_e( 'Hesap Aç', 'sahra-davetiye' ); ?></button>
			</div>
		</form>
	</section>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">02</span>
				<span class="t-label"><?php esc_html_e( 'Mevcut', 'sahra-davetiye' ); ?></span>
			</div>
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Çift Hesapları', 'sahra-davetiye' ); ?></h2>
		</header>

		<?php if ( ! $hesaplar ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz çift hesabı yok.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $hesaplar as $hesap ) : ?>
					<?php $sayi = count( Sahra_Invitation::all_for_user( $hesap->ID ) ); ?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $hesap->display_name ? $hesap->display_name : $hesap->user_login ); ?></span>
						</div>
						<div class="meta">
							<span><?php echo esc_html( $hesap->user_login ); ?></span>
							<?php if ( $hesap->user_email ) : ?>
								<span><?php echo esc_html( $hesap->user_email ); ?></span>
							<?php endif; ?>
							<span>
								<?php
								/* translators: %d: davetiye sayısı. */
								echo esc_html( sprintf( _n( '%d davetiye', '%d davetiye', $sayi, 'sahra-davetiye' ), $sayi ) );
								?>
							</span>
						</div>
						<div class="eylem">
							<form method="post">
								<?php wp_nonce_field( 'sahra_reset_password' ); ?>
								<input type="hidden" name="sahra_action" value="reset_password">
								<input type="hidden" name="user_id" value="<?php echo esc_attr( $hesap->ID ); ?>">
								<button class="eylem-link"><?php esc_html_e( 'Şifre Sıfırla', 'sahra-davetiye' ); ?></button>
							</form>
							<form method="post" onsubmit="return confirm('<?php echo esc_js( __( 'Hesap, davetiyeleri, katılımları ve fotoğrafları silinecek. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
								<?php wp_nonce_field( 'sahra_delete_user' ); ?>
								<input type="hidden" name="sahra_action" value="delete_user">
								<input type="hidden" name="user_id" value="<?php echo esc_attr( $hesap->ID ); ?>">
								<button class="eylem-link tehlike"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
							</form>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
</div>
