<?php
/**
 * Giriş ekranı — Next sürümündeki /giris sayfasının karşılığı.
 *
 * @var string $hata  Boş değilse gösterilecek hata metni.
 * @var string $hedef Girişten sonra gidilecek adres (doğrulanmış).
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;
?>
<!DOCTYPE html>
<html lang="tr" class="sahra-html no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex, nofollow">
	<title><?php esc_html_e( 'Giriş — Sahra Davetiye', 'sahra-davetiye' ); ?></title>

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@200;300;400&display=swap&subset=latin,latin-ext" rel="stylesheet">
	<link rel="stylesheet" href="<?php echo esc_url( SAHRA_URL . 'assets/css/sahra.css?v=' . SAHRA_VERSION ); ?>">
	<style><?php echo '.sahra-page{' . esc_html( Sahra_Theme::style( 'cream-gold' ) ) . '}'; ?></style>
</head>
<body class="sahra-page giris-page">

<div class="grain" aria-hidden="true"></div>

<main class="giris-card">
	<header>
		<p class="t-label" style="color:var(--c-gold)"><?php esc_html_e( 'Sahra Davetiye', 'sahra-davetiye' ); ?></p>
		<h1 class="t-display" style="margin-top:0.6rem"><?php esc_html_e( 'Giriş', 'sahra-davetiye' ); ?></h1>
		<span class="giris-rule" aria-hidden="true"></span>
	</header>

	<form method="post" action="<?php echo esc_url( Sahra_Login::url() ); ?>">
		<?php wp_nonce_field( 'sahra_login', '_sahra_nonce' ); ?>
		<input type="hidden" name="sahra_login" value="1">
		<input type="hidden" name="redirect_to" value="<?php echo esc_attr( $hedef ); ?>">

		<div class="field-row">
			<label class="field-label" for="log"><?php esc_html_e( 'Kullanıcı Adı', 'sahra-davetiye' ); ?></label>
			<input class="field t-lead" id="log" type="text" name="log" autocomplete="username"
				autocapitalize="none" spellcheck="false" required placeholder="kullaniciadi">
		</div>

		<div class="field-row">
			<label class="field-label" for="pwd"><?php esc_html_e( 'Parola', 'sahra-davetiye' ); ?></label>
			<input class="field t-lead" id="pwd" type="password" name="pwd"
				autocomplete="current-password" required placeholder="••••••••">
		</div>

		<?php if ( $hata ) : ?>
			<p class="giris-hata" role="alert"><?php echo esc_html( $hata ); ?></p>
		<?php endif; ?>

		<button type="submit" class="cta"><?php esc_html_e( 'Giriş Yap', 'sahra-davetiye' ); ?></button>
	</form>

	<?php
	/*
	 * Parola sıfırlama bilerek YOK. Çift hesabının e-postası çoğu zaman
	 * hiç girilmiyor; "size posta gönderdik" diyen bir bağlantı, gelmeyecek
	 * bir postayı beklettirir. Parolayı zaten davetiyeyi hazırlayan kişi
	 * veriyor ve panelden tek tuşla sıfırlayabiliyor.
	 */
	?>
	<p class="giris-not"><?php esc_html_e( 'Parolanızı unuttuysanız davetiyenizi hazırlayan kişiyle iletişime geçin.', 'sahra-davetiye' ); ?></p>
</main>

<script>document.documentElement.classList.remove( 'no-js' );</script>
</body>
</html>
