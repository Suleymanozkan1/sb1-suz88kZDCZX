<?php
/**
 * Katılımlar, dilekler ve misafir albümü.
 *
 * @var array $davetiyeler
 * @var array $katilimlar
 * @var array $dilekler
 * @var array $fotograflar
 * @package SahraDavetiye
 */
defined( 'ABSPATH' ) || exit;

$bekleyen = 0;
foreach ( $dilekler as $dilek ) {
	if ( ! $dilek->approved ) {
		$bekleyen++;
	}
}
?>
<div class="wrap sahra-admin">
	<h1><?php esc_html_e( 'Katılım & Albüm', 'sahra-davetiye' ); ?></h1>

	<h2><?php esc_html_e( 'Katılım Bildirimleri', 'sahra-davetiye' ); ?> <span class="count">(<?php echo esc_html( count( $katilimlar ) ); ?>)</span></h2>
	<?php if ( ! $katilimlar ) : ?>
		<p><?php esc_html_e( 'Henüz katılım bildirimi yok.', 'sahra-davetiye' ); ?></p>
	<?php else : ?>
		<table class="widefat striped">
			<thead><tr>
				<th><?php esc_html_e( 'Ad', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Telefon', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Durum', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Kişi', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Şarkı İsteği', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Not', 'sahra-davetiye' ); ?></th>
			</tr></thead>
			<tbody>
			<?php foreach ( $katilimlar as $k ) : ?>
				<tr>
					<td><?php echo esc_html( $k->name ); ?></td>
					<td><?php echo esc_html( $k->phone ); ?></td>
					<td><?php echo $k->attending ? esc_html__( 'Katılıyor', 'sahra-davetiye' ) : esc_html__( 'Katılamıyor', 'sahra-davetiye' ); ?></td>
					<td><?php echo esc_html( $k->guest_count ); ?></td>
					<td><?php echo esc_html( $k->song_request ); ?></td>
					<td><?php echo esc_html( $k->note ); ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	<?php endif; ?>

	<h2><?php esc_html_e( 'Dilek Defteri', 'sahra-davetiye' ); ?>
		<?php if ( $bekleyen ) : ?>
			<span class="count"><?php
				/* translators: %d: onay bekleyen dilek sayısı. */
				echo esc_html( sprintf( __( '(%d dilek onayınızı bekliyor)', 'sahra-davetiye' ), $bekleyen ) );
			?></span>
		<?php endif; ?>
	</h2>
	<?php if ( ! $dilekler ) : ?>
		<p><?php esc_html_e( 'Henüz dilek yok.', 'sahra-davetiye' ); ?></p>
	<?php else : ?>
		<table class="widefat striped" id="sahra-wishes">
			<thead><tr>
				<th><?php esc_html_e( 'Kimden', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Mesaj', 'sahra-davetiye' ); ?></th>
				<th><?php esc_html_e( 'Durum', 'sahra-davetiye' ); ?></th>
				<th></th>
			</tr></thead>
			<tbody>
			<?php foreach ( $dilekler as $dilek ) : ?>
				<tr data-wish="<?php echo esc_attr( $dilek->id ); ?>">
					<td><?php echo esc_html( $dilek->name ); ?></td>
					<td><?php echo esc_html( $dilek->message ); ?></td>
					<td class="durum"><?php echo $dilek->approved ? esc_html__( 'Yayında', 'sahra-davetiye' ) : esc_html__( 'Onay bekliyor', 'sahra-davetiye' ); ?></td>
					<td>
						<button class="button sahra-wish-toggle" data-approve="<?php echo $dilek->approved ? '0' : '1'; ?>">
							<?php echo $dilek->approved ? esc_html__( 'Yayından Kaldır', 'sahra-davetiye' ) : esc_html__( 'Onayla', 'sahra-davetiye' ); ?>
						</button>
						<button class="button button-link-delete sahra-wish-delete"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
	<?php endif; ?>

	<h2><?php esc_html_e( 'Misafir Fotoğrafları', 'sahra-davetiye' ); ?> <span class="count">(<?php echo esc_html( count( $fotograflar ) ); ?>)</span></h2>
	<p class="description">
		<?php
		$surucu = Sahra_Storage::driver()->label();
		/* translators: %s: depolama sürücüsünün adı. */
		echo esc_html( sprintf( __( 'Yeni yüklemeler şuraya kaydediliyor: %s', 'sahra-davetiye' ), $surucu ) );
		?>
	</p>
	<?php if ( ! $fotograflar ) : ?>
		<p><?php esc_html_e( 'Henüz fotoğraf yok. Masalara koyduğunuz QR kod bu albümü doldurur.', 'sahra-davetiye' ); ?></p>
	<?php else : ?>
		<div class="sahra-photos">
			<?php foreach ( $fotograflar as $foto ) : ?>
				<figure>
					<a href="<?php echo esc_url( Sahra_Render::photo_url( $foto->id ) ); ?>" target="_blank" rel="noopener">
						<img src="<?php echo esc_url( Sahra_Render::photo_url( $foto->id ) ); ?>" alt="" loading="lazy">
					</a>
					<figcaption>
						<?php echo esc_html( $foto->uploader_name ? $foto->uploader_name : __( 'İsimsiz', 'sahra-davetiye' ) ); ?>
						· <?php echo esc_html( size_format( (int) $foto->size ) ); ?>
						· <?php echo esc_html( $foto->storage ); ?>
					</figcaption>
				</figure>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</div>

<script>
window.SahraPanel = {
	rest: <?php echo wp_json_encode( esc_url_raw( rest_url( Sahra_Rest::NS . '/' ) ) ); ?>,
	nonce: <?php echo wp_json_encode( wp_create_nonce( 'wp_rest' ) ); ?>
};
</script>
