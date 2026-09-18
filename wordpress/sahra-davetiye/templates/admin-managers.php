<?php
/**
 * İşletme yöneticisi hesapları.
 *
 * Eklentideki her şeye erişen, WordPress'in geri kalanına hiç erişmeyen
 * hesaplar. Bu ekrana yalnızca SİTE yöneticisi girer.
 *
 * @var array $hesaplar
 * @var array|false $kimlik
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$sahra_sayfa = 'sahra-yoneticiler';
$giris       = Sahra_Login::url();
include SAHRA_DIR . 'templates/admin-header.php';
?>
	<?php if ( ! empty( $_GET['hata'] ) ) : // phpcs:ignore ?>
		<div class="bildirim hata"><p class="t-body"><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['hata'] ) ) ); // phpcs:ignore ?></p></div>
	<?php endif; ?>

	<?php if ( $kimlik ) : ?>
		<?php
		/* Parola yalnızca özet olarak saklanıyor; iletilebileceği tek an burası. */
		$blok = "Sahra Davetiye — yönetici giriş bilgileriniz\n\n"
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
			<p class="t-body"><?php esc_html_e( 'Bu şifre bir daha gösterilmez — iletmeyi unutmayın.', 'sahra-davetiye' ); ?></p>
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
				<span class="t-label"><?php esc_html_e( 'Yetki', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Yeni İşletme Yöneticisi', 'sahra-davetiye' ); ?></h1>
			<p class="lead"><?php esc_html_e( 'Bu hesap Sahra Davetiye\'deki her şeye erişir: davetiyeler, davetli listeleri, salonlar, menüler, çift hesapları, işletme ve depolama ayarları. WordPress\'in geri kalanına erişemez — yazılar, eklentiler, temalar, site ayarları ve diğer kullanıcılar kapalıdır.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_create_manager' ); ?>
			<input type="hidden" name="sahra_action" value="create_manager">

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="y-login"><?php esc_html_e( 'Kullanıcı Adı *', 'sahra-davetiye' ); ?></label>
					<input id="y-login" type="text" name="username" required placeholder="isletme">
				</div>
				<div class="alan">
					<label class="field-label" for="y-name"><?php esc_html_e( 'Görünen Ad', 'sahra-davetiye' ); ?></label>
					<input id="y-name" type="text" name="display_name" placeholder="Sahra İşletme">
				</div>
			</div>

			<div class="alan">
				<label class="field-label" for="y-mail"><?php esc_html_e( 'E-posta (İsteğe Bağlı)', 'sahra-davetiye' ); ?></label>
				<input id="y-mail" name="email" type="email">
			</div>

			<div class="sahra-adim-alt">
				<button type="submit" class="cta" style="margin-left:auto"><?php esc_html_e( 'Yönetici Hesabı Aç', 'sahra-davetiye' ); ?></button>
			</div>
		</form>
	</section>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">02</span>
				<span class="t-label"><?php esc_html_e( 'Mevcut', 'sahra-davetiye' ); ?></span>
			</div>
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'İşletme Yöneticileri', 'sahra-davetiye' ); ?></h2>
			<p class="lead"><?php esc_html_e( 'Yönetici hesabı açmak ve silmek yalnızca sitenin WordPress yöneticisinde kalır; işletme yöneticisi kendi gibi yönetici üretemez.', 'sahra-davetiye' ); ?></p>
		</header>

		<?php if ( ! $hesaplar ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz işletme yöneticisi hesabı yok.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $hesaplar as $hesap ) : ?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $hesap->display_name ? $hesap->display_name : $hesap->user_login ); ?></span>
						</div>
						<div class="meta">
							<span><?php echo esc_html( $hesap->user_login ); ?></span>
							<?php if ( $hesap->user_email ) : ?>
								<span><?php echo esc_html( $hesap->user_email ); ?></span>
							<?php endif; ?>
						</div>
						<div class="eylem">
							<form method="post">
								<?php wp_nonce_field( 'sahra_reset_manager' ); ?>
								<input type="hidden" name="sahra_action" value="reset_manager">
								<input type="hidden" name="user_id" value="<?php echo esc_attr( $hesap->ID ); ?>">
								<button class="eylem-link"><?php esc_html_e( 'Şifre Sıfırla', 'sahra-davetiye' ); ?></button>
							</form>
							<form method="post" onsubmit="return confirm('<?php echo esc_js( __( 'Bu yönetici hesabı silinecek. Davetiyeler ve salonlar etkilenmez. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
								<?php wp_nonce_field( 'sahra_delete_manager' ); ?>
								<input type="hidden" name="sahra_action" value="delete_manager">
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
