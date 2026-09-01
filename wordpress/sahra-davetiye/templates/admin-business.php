<?php
/**
 * İşletme ayarları — yalnızca yönetici.
 *
 * İki şey: işletmenin kendi Instagram hesabı (her davetiyenin etiketleme
 * bölümünde görünür) ve davetiyenin ömrü.
 *
 * @var array $brand
 * @var array $lifecycle
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$sahra_sayfa = 'sahra-isletme';
include SAHRA_DIR . 'templates/admin-header.php';
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Kaydedildi', 'sahra-davetiye' ); ?></p>
		</div>
	<?php endif; ?>

	<form method="post">
		<?php wp_nonce_field( 'sahra_save_business' ); ?>
		<input type="hidden" name="sahra_action" value="save_business">

		<section class="sahra-sec">
			<header>
				<div class="ust">
					<span class="num">01</span>
					<span class="t-label"><?php esc_html_e( 'Sosyal', 'sahra-davetiye' ); ?></span>
				</div>
				<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Bizim Hesabımız', 'sahra-davetiye' ); ?></h1>
				<p class="lead"><?php esc_html_e( 'Her davetiyenin etiketleme bölümünde, çiftin kendi hesabının yanında görünür.', 'sahra-davetiye' ); ?></p>
			</header>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="b-ig-label"><?php esc_html_e( 'Görünecek Ad', 'sahra-davetiye' ); ?></label>
					<input id="b-ig-label" type="text" name="brand[instagramLabel]" value="<?php echo esc_attr( $brand['instagramLabel'] ); ?>" placeholder="@sahradavet">
				</div>
				<div class="alan">
					<label class="field-label" for="b-ig"><?php esc_html_e( 'Instagram Adresi', 'sahra-davetiye' ); ?></label>
					<input id="b-ig" type="url" name="brand[instagram]" value="<?php echo esc_attr( $brand['instagram'] ); ?>" placeholder="https://instagram.com/sahradavet">
				</div>
			</div>
			<p class="ipucu"><?php esc_html_e( 'Boş bırakılırsa davetiyede yalnızca çiftin kendi hesabı görünür.', 'sahra-davetiye' ); ?></p>
		</section>

		<section class="sahra-sec">
			<header>
				<div class="ust">
					<span class="num">02</span>
					<span class="t-label"><?php esc_html_e( 'Ömür', 'sahra-davetiye' ); ?></span>
				</div>
				<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Davetiye Ne Kadar Açık Kalsın?', 'sahra-davetiye' ); ?></h2>
				<?php
				/*
				 * İki kademe, bilerek.
				 *
				 * Düğün bitince davetiye kimseye lazım değil: link elden ele
				 * dolaşmaya devam ediyor ve çiftin adresi, telefonu, IBAN'ı
				 * süresiz açıkta kalıyor. Ama misafir fotoğrafları çiftin
				 * düğün albümü — onları da aynı gün silmek, albümünü
				 * indirmeyi unutan çiftin düğün fotoğraflarını yok etmekti.
				 */
				?>
				<p class="lead"><?php esc_html_e( 'Önce link kapanır, veriler panelde durur. Kalıcı silme çok daha sonra.', 'sahra-davetiye' ); ?></p>
			</header>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="l-unpub"><?php esc_html_e( 'Düğünden Kaç Gün Sonra Yayından Kalksın?', 'sahra-davetiye' ); ?></label>
					<input id="l-unpub" type="number" min="0" max="365" name="lifecycle[unpublishDays]" value="<?php echo esc_attr( $lifecycle['unpublishDays'] ); ?>">
					<p class="ipucu"><?php esc_html_e( '1 = düğünün ertesi günü. 0 = düğün günü.', 'sahra-davetiye' ); ?></p>
				</div>

				<div class="alan">
					<label class="field-label" for="l-del"><?php esc_html_e( 'Yayından Kalktıktan Kaç Gün Sonra Silinsin?', 'sahra-davetiye' ); ?></label>
					<input id="l-del" type="number" min="1" max="3650" name="lifecycle[deleteDays]" value="<?php echo esc_attr( $lifecycle['deleteDays'] ); ?>">
					<p class="ipucu"><?php esc_html_e( 'Davetiye, misafir fotoğrafları, katılımlar ve dilekler kalıcı silinir.', 'sahra-davetiye' ); ?></p>
				</div>
			</div>

			<label class="anahtar">
				<input type="checkbox" name="lifecycle[deleteEnabled]" value="1" <?php checked( $lifecycle['deleteEnabled'] ); ?>>
				<span><?php esc_html_e( 'Kalıcı silme açık', 'sahra-davetiye' ); ?></span>
			</label>
			<p class="ipucu"><?php esc_html_e( 'Kapatırsanız davetiyeler yalnızca yayından kalkar; hiçbir şey kendiliğinden silinmez.', 'sahra-davetiye' ); ?></p>

			<div class="sahra-adim-alt">
				<button type="submit" class="cta" style="margin-left:auto"><?php esc_html_e( 'Kaydet', 'sahra-davetiye' ); ?></button>
			</div>
		</section>
	</form>
</div>
