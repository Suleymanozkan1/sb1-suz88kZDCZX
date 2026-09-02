<?php
/**
 * Menüler — yalnızca yönetici.
 *
 * İşletmenin basılı menü kartındaki menüler burada duruyor. Çift bunlardan
 * birini seçip kendi davetiyesinde üstünde oynayabiliyor; buradaki asıl
 * kayıt değişmiyor.
 *
 * Fiyat BİLEREK yok: davetiye misafire gidiyor, fiyat çiftle işletme
 * arasındaki mesele.
 *
 * @var array $menuler
 * @var array $menu    Düzenlenen menü ya da boş iskelet.
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$sahra_sayfa = 'sahra-menuler';
include SAHRA_DIR . 'templates/admin-header.php';

$sahra_duzenliyor = ! empty( $menu['id'] );
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Kaydedildi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem"><?php esc_html_e( 'Bundan sonra bu menüyü seçen çiftler yeni hâlini görür.', 'sahra-davetiye' ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $_GET['hata'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-body" style="color:var(--c-danger)"><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['hata'] ) ) ); // phpcs:ignore ?></p>
		</div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Menü', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem">
				<?php echo $sahra_duzenliyor ? esc_html__( 'Menüyü Düzenle', 'sahra-davetiye' ) : esc_html__( 'Yeni Menü', 'sahra-davetiye' ); ?>
			</h1>
			<p class="lead"><?php esc_html_e( 'Menünün adı yalnızca panelde görünür; davetiyede başlık yalnızca “Menü” olur.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_save_menu' ); ?>
			<input type="hidden" name="sahra_action" value="save_menu">
			<input type="hidden" name="menu[id]" value="<?php echo esc_attr( $menu['id'] ); ?>">

			<div class="alan">
				<label class="field-label" for="m-name"><?php esc_html_e( 'Menü Adı *', 'sahra-davetiye' ); ?></label>
				<input id="m-name" type="text" name="menu[name]" value="<?php echo esc_attr( $menu['name'] ); ?>" placeholder="Menü 3" required>
			</div>

			<div class="alan">
				<label class="field-label" for="m-groups"><?php esc_html_e( 'Menü İçeriği', 'sahra-davetiye' ); ?></label>
				<textarea id="m-groups" name="menu[groups]" rows="10" placeholder="ORDÖVR TABAĞI | Amerikan salatası | Kısır | Haydari&#10;ANA YEMEK | Et kavurma | Tereyağlı pirinç pilavı&#10;TATLI | Dondurmalı pasta veya 2 dilim baklava"><?php echo esc_textarea( Sahra_Fields::menu_to_text( $menu['groups'] ) ); ?></textarea>
				<p class="ipucu"><?php esc_html_e( 'Her satır bir grup: başlık | öğe | öğe | öğe', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="sahra-adim-alt">
				<?php if ( $sahra_duzenliyor ) : ?>
					<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-menuler' ) ); ?>"><?php esc_html_e( 'Vazgeç', 'sahra-davetiye' ); ?></a>
				<?php endif; ?>
				<button type="submit" class="cta" style="margin-left:auto">
					<?php echo $sahra_duzenliyor ? esc_html__( 'Kaydet', 'sahra-davetiye' ) : esc_html__( 'Menü Ekle', 'sahra-davetiye' ); ?>
				</button>
			</div>
		</form>
	</section>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">02</span>
				<span class="t-label"><?php esc_html_e( 'Mevcut', 'sahra-davetiye' ); ?></span>
			</div>
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Menüler', 'sahra-davetiye' ); ?></h2>
		</header>

		<?php if ( ! $menuler ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz menü yok.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $menuler as $sahra_menu ) : ?>
					<?php
					$sahra_ozet = array();
					foreach ( array_slice( $sahra_menu['groups'], 0, 4 ) as $sahra_grup ) {
						$sahra_ozet[] = $sahra_grup['title'];
					}
					?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $sahra_menu['name'] ); ?></span>
						</div>
						<div class="meta">
							<span><?php echo esc_html( implode( ' · ', $sahra_ozet ) ); ?></span>
							<span>
								<?php
								/* translators: %d: grup sayısı. */
								echo esc_html( sprintf( _n( '%d grup', '%d grup', count( $sahra_menu['groups'] ), 'sahra-davetiye' ), count( $sahra_menu['groups'] ) ) );
								?>
							</span>
						</div>
						<div class="eylem">
							<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-menuler&menu=' . rawurlencode( $sahra_menu['id'] ) ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
							<form method="post" onsubmit="return confirm('<?php echo esc_js( __( 'Menü silinecek. Bu menüyü seçmiş davetiyelerin içeriği yerinde kalır. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
								<?php wp_nonce_field( 'sahra_delete_menu' ); ?>
								<input type="hidden" name="sahra_action" value="delete_menu">
								<input type="hidden" name="menu_id" value="<?php echo esc_attr( $sahra_menu['id'] ); ?>">
								<button class="eylem-link tehlike"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
							</form>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
</div>
