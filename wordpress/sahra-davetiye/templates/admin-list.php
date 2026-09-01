<?php
/**
 * Davetiye listesi.
 *
 * @var array $davetiyeler
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$yonetici    = Sahra_Roles::is_manager();
$sahra_sayfa = 'sahra-panel';
$sahra_eylem = sprintf(
	'<a class="cta" href="%s">%s</a>',
	esc_url( admin_url( 'admin.php?page=sahra-davetiye-duzenle' ) ),
	esc_html__( 'Yeni Davetiye', 'sahra-davetiye' )
);

include SAHRA_DIR . 'templates/admin-header.php';
?>

	<?php if ( ! empty( $_GET['silindi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim"><p class="t-body"><?php esc_html_e( 'Silindi.', 'sahra-davetiye' ); ?></p></div>
	<?php endif; ?>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Davetiyeler', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem">
				<?php echo $yonetici ? esc_html__( 'Tüm Davetiyeler', 'sahra-davetiye' ) : esc_html__( 'Davetiyelerim', 'sahra-davetiye' ); ?>
			</h1>
			<p class="lead">
				<?php
				/* translators: %d: davetiye sayısı. */
				echo esc_html( sprintf( _n( '%d davetiye', '%d davetiye', count( $davetiyeler ), 'sahra-davetiye' ), count( $davetiyeler ) ) );
				?>
			</p>
		</header>

		<?php if ( ! $davetiyeler ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz davetiye yok.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $davetiyeler as $d ) : ?>
					<?php
					$conj    = $d['conjunction'] ? $d['conjunction'] : '&';
					$isimler = trim( $d['brideName'] . ' ' . $conj . ' ' . $d['groomName'] );
					$adres   = Sahra_Invitation::url( $d['slug'] );
					$qr      = Sahra_Invitation::upload_url( $d['slug'] );
					$sahip   = get_userdata( $d['ownerId'] );
					?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $isimler ); ?></span>
							<span class="rozet <?php echo $d['isActive'] ? 'acik' : 'kapali'; ?>">
								<?php echo $d['isActive'] ? esc_html__( 'Aktif', 'sahra-davetiye' ) : esc_html__( 'Pasif', 'sahra-davetiye' ); ?>
							</span>
						</div>

						<div class="meta">
							<?php if ( $yonetici ) : ?>
								<?php if ( $sahip && Sahra_Roles::is_couple( $sahip->ID ) ) : ?>
									<span><?php echo esc_html( $sahip->display_name ? $sahip->display_name : $sahip->user_login ); ?></span>
								<?php else : ?>
									<?php
									/* Sahipsiz davetiye sessiz bir tuzak: çift düzenleyemez,
									   hesabı silinince de silinmez. Listede görünsün. */
									?>
									<span class="uyari"><?php esc_html_e( 'çift hesabına bağlı değil', 'sahra-davetiye' ); ?></span>
								<?php endif; ?>
							<?php endif; ?>
							<span class="numerals"><?php echo esc_html( Sahra_Render::format_date( $d['weddingDate'] ) ); ?></span>
							<span class="numerals"><?php echo esc_html( Sahra_Render::format_time_range( $d['weddingTime'], $d['weddingEndTime'] ) ); ?></span>
							<span><?php echo esc_html( $d['city'] ); ?></span>
							<span>/davet/<?php echo esc_html( $d['slug'] ); ?></span>
						</div>

						<div class="eylem">
							<a class="eylem-link" href="<?php echo esc_url( $adres ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Önizle', 'sahra-davetiye' ); ?></a>
							<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-davetiye-duzenle&id=' . $d['id'] ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
							<button type="button" class="eylem-link sahra-copy" data-copy="<?php echo esc_attr( $adres ); ?>"><?php esc_html_e( 'Linki Kopyala', 'sahra-davetiye' ); ?></button>
							<button
								type="button"
								class="eylem-link sahra-qr"
								data-davet="<?php echo esc_attr( $adres ); ?>"
								data-yukle="<?php echo esc_attr( $qr ); ?>"
								data-ad="<?php echo esc_attr( $isimler ); ?>"><?php esc_html_e( 'QR Kod', 'sahra-davetiye' ); ?></button>

							<?php if ( $yonetici ) : ?>
								<form method="post">
									<?php wp_nonce_field( 'sahra_toggle_invitation' ); ?>
									<input type="hidden" name="sahra_action" value="toggle_invitation">
									<input type="hidden" name="invitation_id" value="<?php echo esc_attr( $d['id'] ); ?>">
									<button class="eylem-link">
										<?php echo $d['isActive'] ? esc_html__( 'Pasif Yap', 'sahra-davetiye' ) : esc_html__( 'Yayına Al', 'sahra-davetiye' ); ?>
									</button>
								</form>

								<form method="post" onsubmit="return confirm('<?php echo esc_js( __( 'Davetiye, katılımlar, dilekler ve fotoğraflar silinecek. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
									<?php wp_nonce_field( 'sahra_delete_invitation' ); ?>
									<input type="hidden" name="sahra_action" value="delete_invitation">
									<input type="hidden" name="invitation_id" value="<?php echo esc_attr( $d['id'] ); ?>">
									<button class="eylem-link tehlike"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
								</form>
							<?php endif; ?>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>

	<?php /* QR penceresi — davetiye ve masadaki yükleme adresi için. */ ?>
	<div class="sahra-modal" id="sahra-qr-modal" hidden>
		<div class="sahra-modal-ic" role="dialog" aria-modal="true" aria-labelledby="sahra-qr-baslik">
			<button type="button" class="kapat" aria-label="<?php esc_attr_e( 'Kapat', 'sahra-davetiye' ); ?>">×</button>
			<p class="t-label" style="color:var(--c-gold)"><?php esc_html_e( 'QR Kod', 'sahra-davetiye' ); ?></p>
			<p class="t-h2" id="sahra-qr-baslik" style="margin-top:0.3rem"></p>

			<div class="sahra-qr-secim">
				<button type="button" class="sahra-cip" data-tur="davet" aria-current="true"><?php esc_html_e( 'Davetiye', 'sahra-davetiye' ); ?></button>
				<button type="button" class="sahra-cip" data-tur="yukle" aria-current="false"><?php esc_html_e( 'Fotoğraf Yükleme', 'sahra-davetiye' ); ?></button>
			</div>

			<div class="sahra-qr-kutu" id="sahra-qr-kutu"></div>
			<p class="t-body muted" id="sahra-qr-adres" style="word-break:break-all"></p>

			<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem">
				<button type="button" class="cta" id="sahra-qr-indir"><?php esc_html_e( 'PNG İndir', 'sahra-davetiye' ); ?></button>
				<button type="button" class="eylem-link sahra-copy" id="sahra-qr-kopyala"><?php esc_html_e( 'Adresi Kopyala', 'sahra-davetiye' ); ?></button>
			</div>
		</div>
	</div>
</div>
