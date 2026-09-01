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
$sahra_sayfa = 'sahra-hesap';

$bekleyen = 0;
foreach ( $dilekler as $dilek ) {
	if ( ! $dilek->approved ) {
		$bekleyen++;
	}
}

$gelen  = 0;
$toplam_kisi = 0;
foreach ( $katilimlar as $k ) {
	if ( $k->attending ) {
		$gelen++;
		$toplam_kisi += (int) preg_replace( '/\D/', '', $k->guest_count ) ?: 1;
	}
}

$boyut = 0;
foreach ( $fotograflar as $foto ) {
	$boyut += (int) $foto->size;
}

include SAHRA_DIR . 'templates/admin-header.php';
?>
	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">01</span>
				<span class="t-label"><?php esc_html_e( 'Katılım', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Gelen Bildirimler', 'sahra-davetiye' ); ?></h1>
			<p class="lead">
				<?php
				printf(
					/* translators: 1: toplam bildirim, 2: katılan bildirim, 3: toplam kişi. */
					esc_html__( '%1$d bildirim · %2$d katılıyor · yaklaşık %3$d kişi', 'sahra-davetiye' ),
					count( $katilimlar ),
					(int) $gelen,
					(int) $toplam_kisi
				);
				?>
			</p>
		</header>

		<?php if ( ! $katilimlar ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz katılım bildirimi yok.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $katilimlar as $k ) : ?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $k->name ); ?></span>
							<span class="rozet <?php echo $k->attending ? 'acik' : 'kapali'; ?>">
								<?php echo $k->attending ? esc_html__( 'Katılıyor', 'sahra-davetiye' ) : esc_html__( 'Katılamıyor', 'sahra-davetiye' ); ?>
							</span>
							<?php if ( $k->attending ) : ?>
								<span class="t-body muted"><?php echo esc_html( $k->guest_count ); ?> <?php esc_html_e( 'kişi', 'sahra-davetiye' ); ?></span>
							<?php endif; ?>
						</div>
						<div class="meta">
							<span class="numerals"><?php echo esc_html( $k->phone ); ?></span>
							<?php if ( $k->song_request ) : ?>
								<span><?php esc_html_e( 'Şarkı isteği:', 'sahra-davetiye' ); ?> <?php echo esc_html( $k->song_request ); ?></span>
							<?php endif; ?>
						</div>
						<?php if ( $k->note ) : ?>
							<p class="t-body" style="margin-top:0.4rem;font-style:italic">“<?php echo esc_html( $k->note ); ?>”</p>
						<?php endif; ?>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">02</span>
				<span class="t-label"><?php esc_html_e( 'Dilek Defteri', 'sahra-davetiye' ); ?></span>
			</div>
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Misafir Dilekleri', 'sahra-davetiye' ); ?></h2>
			<?php if ( $bekleyen ) : ?>
				<p class="lead">
					<?php
					/* translators: %d: onay bekleyen dilek sayısı. */
					echo esc_html( sprintf( __( '%d dilek onayınızı bekliyor.', 'sahra-davetiye' ), $bekleyen ) );
					?>
				</p>
			<?php endif; ?>
		</header>

		<?php if ( ! $dilekler ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz dilek yok.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $dilekler as $dilek ) : ?>
					<article class="sahra-row" data-wish="<?php echo esc_attr( $dilek->id ); ?>">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $dilek->name ? $dilek->name : __( 'İsimsiz', 'sahra-davetiye' ) ); ?></span>
							<span class="rozet <?php echo $dilek->approved ? 'acik' : 'kapali'; ?> durum">
								<?php echo $dilek->approved ? esc_html__( 'Yayında', 'sahra-davetiye' ) : esc_html__( 'Onay bekliyor', 'sahra-davetiye' ); ?>
							</span>
						</div>
						<p class="t-body" style="margin-top:0.4rem;font-style:italic">“<?php echo esc_html( $dilek->message ); ?>”</p>
						<div class="eylem">
							<button type="button" class="eylem-link sahra-wish-toggle" data-approve="<?php echo $dilek->approved ? '0' : '1'; ?>">
								<?php echo $dilek->approved ? esc_html__( 'Yayından Kaldır', 'sahra-davetiye' ) : esc_html__( 'Onayla', 'sahra-davetiye' ); ?>
							</button>
							<button type="button" class="eylem-link tehlike sahra-wish-delete"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>

	<section class="sahra-sec">
		<header>
			<div class="ust">
				<span class="num">03</span>
				<span class="t-label"><?php esc_html_e( 'Albüm', 'sahra-davetiye' ); ?></span>
			</div>
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Misafir Fotoğrafları', 'sahra-davetiye' ); ?></h2>
			<p class="lead">
				<?php
				printf(
					/* translators: 1: fotoğraf sayısı, 2: toplam boyut, 3: depolama sürücüsü. */
					esc_html__( '%1$d fotoğraf · %2$s · masadaki QR koddan yüklenir · yeni yüklemeler: %3$s', 'sahra-davetiye' ),
					count( $fotograflar ),
					esc_html( size_format( $boyut ) ),
					esc_html( Sahra_Storage::driver()->label() )
				);
				?>
			</p>
		</header>

		<?php
		/*
		 * Silme uyarısı albümün EN ÜSTÜNDE, fotoğrafların hemen yanında.
		 * Çift burayı düğün albümü sanıyor ve süresiz duracağını
		 * varsayıyor; silineceğini silindikten sonra öğrenmemeli.
		 *
		 * Kaç gün sonra olduğu burada, hangi TARİHTE olduğu her davetiyenin
		 * kendi başlığında: bir yöneticinin listesinde farklı düğün
		 * tarihli davetiyeler yan yana duruyor, tek bir tarih hepsi için
		 * yanlış olurdu.
		 */
		$sahra_gun = Sahra_Lifecycle::photo_days_after_wedding();
		?>
		<?php if ( $sahra_gun ) : ?>
			<p class="sahra-uyari">
				<span class="sahra-uyari-ikon" aria-hidden="true">!</span>
				<span>
					<?php
					printf(
						/* translators: %d: gün sayısı. */
						esc_html__( 'Fotoğraflar düğünden %d gün sonra kalıcı olarak silinir. İndirmeyi unutmayın.', 'sahra-davetiye' ),
						(int) $sahra_gun
					);
					?>
				</span>
			</p>
		<?php endif; ?>

		<?php if ( ! $fotograflar ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz fotoğraf yok. Masalara koyduğunuz QR kod bu albümü doldurur.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<?php
			// Albümü davetiyeye göre grupla: ZIP her davetiye için ayrı.
			$grup = array();
			foreach ( $fotograflar as $foto ) {
				$grup[ (int) $foto->invitation_id ][] = $foto;
			}
			?>
			<?php foreach ( $grup as $davetiye_id => $liste ) : ?>
				<?php $dv = Sahra_Invitation::get( $davetiye_id ); ?>
				<?php $sahra_silme = $dv ? Sahra_Lifecycle::photo_delete_date( $dv ) : ''; ?>
				<div style="margin-bottom:var(--sp-md)">
					<div style="display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:0.75rem">
						<span class="t-lead"><?php echo esc_html( $dv ? trim( $dv['brideName'] . ' & ' . $dv['groomName'] ) : __( 'Davetiye', 'sahra-davetiye' ) ); ?></span>
						<a class="eylem-link" href="<?php echo esc_url( Sahra_Render::zip_url( $davetiye_id ) ); ?>">
							<?php
							/* translators: %d: fotoğraf sayısı. */
							echo esc_html( sprintf( __( 'Tümünü İndir (%d)', 'sahra-davetiye' ), count( $liste ) ) );
							?>
						</a>
					</div>

					<?php if ( $sahra_silme ) : ?>
						<p class="sahra-silme-tarihi">
							<?php
							printf(
								/* translators: %s: tarih. */
								esc_html__( 'Bu albüm %s tarihinde silinir.', 'sahra-davetiye' ),
								esc_html( Sahra_Render::format_date( $sahra_silme ) )
							);
							?>
						</p>
					<?php endif; ?>

					<div class="sahra-fotograflar">
						<?php foreach ( $liste as $foto ) : ?>
							<figure>
								<a href="<?php echo esc_url( add_query_arg( 'indir', '1', Sahra_Render::photo_url( $foto->id ) ) ); ?>">
									<img src="<?php echo esc_url( Sahra_Render::photo_url( $foto->id ) ); ?>" alt="" loading="lazy">
								</a>
								<figcaption>
									<?php echo esc_html( $foto->uploader_name ? $foto->uploader_name : __( 'İsimsiz', 'sahra-davetiye' ) ); ?>
									· <?php echo esc_html( size_format( (int) $foto->size ) ); ?>
								</figcaption>
							</figure>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endforeach; ?>
		<?php endif; ?>
	</section>
</div>
