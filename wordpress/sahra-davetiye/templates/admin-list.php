<?php
/**
 * Davetiye listesi.
 *
 * @var array $davetiyeler
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;
$yonetici = Sahra_Roles::is_manager();
?>
<div class="wrap sahra-admin">
	<h1 class="wp-heading-inline"><?php esc_html_e( 'Davetiyeler', 'sahra-davetiye' ); ?></h1>
	<a href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-davetiye-duzenle' ) ); ?>" class="page-title-action"><?php esc_html_e( 'Yeni Davetiye', 'sahra-davetiye' ); ?></a>

	<?php if ( ! empty( $_GET['silindi'] ) ) : // phpcs:ignore ?>
		<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Silindi.', 'sahra-davetiye' ); ?></p></div>
	<?php endif; ?>

	<?php if ( ! $davetiyeler ) : ?>
		<p><?php esc_html_e( 'Henüz davetiye yok.', 'sahra-davetiye' ); ?></p>
	<?php else : ?>
		<table class="widefat striped">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Çift', 'sahra-davetiye' ); ?></th>
					<th><?php esc_html_e( 'Tarih', 'sahra-davetiye' ); ?></th>
					<th><?php esc_html_e( 'Durum', 'sahra-davetiye' ); ?></th>
					<th><?php esc_html_e( 'Bağlantılar', 'sahra-davetiye' ); ?></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
			<?php foreach ( $davetiyeler as $d ) : ?>
				<?php
				$conj    = $d['conjunction'] ? $d['conjunction'] : '&';
				$isimler = trim( $d['groomName'] . ' ' . $conj . ' ' . $d['brideName'] );
				$adres   = Sahra_Invitation::url( $d['slug'] );
				$qr      = Sahra_Invitation::upload_url( $d['slug'] );
				?>
				<tr>
					<td>
						<strong><?php echo esc_html( $isimler ); ?></strong><br>
						<code><?php echo esc_html( $d['slug'] ); ?></code>
					</td>
					<td><?php echo esc_html( Sahra_Render::format_date( $d['weddingDate'] ) ); ?><br>
						<span class="description"><?php echo esc_html( Sahra_Render::format_time_range( $d['weddingTime'], $d['weddingEndTime'] ) ); ?></span>
					</td>
					<td><?php echo $d['isActive'] ? esc_html__( 'Yayında', 'sahra-davetiye' ) : esc_html__( 'Pasif', 'sahra-davetiye' ); ?></td>
					<td>
						<a href="<?php echo esc_url( $adres ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Davetiye', 'sahra-davetiye' ); ?></a> ·
						<a href="<?php echo esc_url( $qr ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'QR Yükleme', 'sahra-davetiye' ); ?></a><br>
						<button type="button" class="button-link sahra-copy" data-copy="<?php echo esc_attr( $adres ); ?>"><?php esc_html_e( 'Bağlantıyı kopyala', 'sahra-davetiye' ); ?></button>
					</td>
					<td>
						<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-davetiye-duzenle&id=' . $d['id'] ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
						<?php if ( $yonetici ) : ?>
							<form method="post" style="display:inline" onsubmit="return confirm('<?php echo esc_js( __( 'Davetiye, katılımlar ve fotoğraflar silinecek. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
								<?php wp_nonce_field( 'sahra_delete_invitation' ); ?>
								<input type="hidden" name="sahra_action" value="delete_invitation">
								<input type="hidden" name="invitation_id" value="<?php echo esc_attr( $d['id'] ); ?>">
								<button class="button button-link-delete"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
							</form>
						<?php endif; ?>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	<?php endif; ?>
</div>
