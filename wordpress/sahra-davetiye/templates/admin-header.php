<?php
/**
 * Panel başlığı ve gezinme — her ekranın üstünde.
 *
 * Next sürümündeki PanelHeader'ın karşılığı. WordPress'in kenar çubuğu
 * kendi ekranlarımızda gizlendiği için gezinme buraya taşındı; "WordPress
 * Paneli" bağlantısı kaçış yolunu açık tutuyor.
 *
 * @var string $sahra_sayfa  Etkin sayfanın slug'ı.
 * @var string $sahra_eylem  Sağ üstteki birincil eylem (isteğe bağlı HTML).
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$sahra_kullanici = wp_get_current_user();
$sahra_yonetici  = Sahra_Roles::is_manager();

$sahra_yollar = array(
	'sahra-panel'    => __( 'Davetiyeler', 'sahra-davetiye' ),
	'sahra-hesap'    => __( 'Katılım & Albüm', 'sahra-davetiye' ),
);

if ( $sahra_yonetici ) {
	$sahra_yollar['sahra-salonlar'] = __( 'Salonlar', 'sahra-davetiye' );
	$sahra_yollar['sahra-menuler']  = __( 'Menüler', 'sahra-davetiye' );
	$sahra_yollar['sahra-hesaplar'] = __( 'Çift Hesapları', 'sahra-davetiye' );
	$sahra_yollar['sahra-isletme']  = __( 'İşletme', 'sahra-davetiye' );
	$sahra_yollar['sahra-depolama'] = __( 'Depolama', 'sahra-davetiye' );
}

$sahra_yollar['sahra-ayarlar'] = __( 'Hesap Ayarları', 'sahra-davetiye' );
?>
<div class="sahra-panel">

	<header class="sahra-head">
		<div class="kimlik">
			<p class="t-label"><?php echo $sahra_yonetici ? esc_html__( 'Admin Paneli', 'sahra-davetiye' ) : esc_html__( 'Davetiye Paneli', 'sahra-davetiye' ); ?></p>
			<p class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Sahra Davetiye', 'sahra-davetiye' ); ?></p>
			<p class="t-body muted" style="margin-top:0.2rem">
				<?php echo esc_html( $sahra_kullanici->display_name ? $sahra_kullanici->display_name : $sahra_kullanici->user_login ); ?>
			</p>
		</div>

		<div class="yollar">
			<?php if ( $sahra_yonetici ) : ?>
				<a class="eylem-link" href="<?php echo esc_url( admin_url() ); ?>"><?php esc_html_e( 'WordPress Paneli', 'sahra-davetiye' ); ?></a>
			<?php endif; ?>
			<?php
			/*
			 * Çıkınca nereye: çift kendi giriş kapısına, yönetici
			 * WordPress'in kendi girişine. Aynı panelin başlığını ikisi de
			 * kullanıyor ama ikisinin kapısı aynı değil.
			 */
			$sahra_cikis_hedefi = ( Sahra_Roles::is_couple() && ! Sahra_Roles::is_manager() )
				? Sahra_Login::url()
				: wp_login_url();
			?>
			<a class="eylem-link" href="<?php echo esc_url( wp_logout_url( $sahra_cikis_hedefi ) ); ?>"><?php esc_html_e( 'Çıkış', 'sahra-davetiye' ); ?></a>
			<?php if ( ! empty( $sahra_eylem ) ) : ?>
				<?php echo wp_kses_post( $sahra_eylem ); ?>
			<?php endif; ?>
		</div>
	</header>

	<nav class="sahra-nav" aria-label="<?php esc_attr_e( 'Panel', 'sahra-davetiye' ); ?>">
		<?php foreach ( $sahra_yollar as $sahra_slug => $sahra_ad ) : ?>
			<a
				href="<?php echo esc_url( admin_url( 'admin.php?page=' . $sahra_slug ) ); ?>"
				<?php echo ( isset( $sahra_sayfa ) && $sahra_sayfa === $sahra_slug ) ? 'aria-current="page"' : ''; ?>>
				<?php echo esc_html( $sahra_ad ); ?>
			</a>
		<?php endforeach; ?>
	</nav>
