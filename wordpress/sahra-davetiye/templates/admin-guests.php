<?php
/**
 * Davetli listesi — çiftin kimi davet ettiği ve kimin cevap verdiği.
 *
 * Liste MİSAFİRE GÖSTERİLMEZ: davetiye şablonu bu veriye hiç bakmıyor.
 *
 * @var array      $davetiyeler
 * @var array|null $secili
 * @var string     $metin
 * @var array|null $durum
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$sahra_sayfa = 'sahra-davetliler';
include SAHRA_DIR . 'templates/admin-header.php';

$sahra_etiket = array(
	'katiliyor'  => __( 'Katılıyor', 'sahra-davetiye' ),
	'katilmiyor' => __( 'Katılamıyor', 'sahra-davetiye' ),
	'cevapsiz'   => __( 'Cevap yok', 'sahra-davetiye' ),
);
$sahra_sinif = array( 'katiliyor' => 'acik', 'katilmiyor' => 'kapali', 'cevapsiz' => 'bekler' );
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label">
				<?php
				printf(
					/* translators: %d: kaydedilen davetli sayısı. */
					esc_html__( 'Kaydedildi — %d davetli', 'sahra-davetiye' ),
					max( 0, (int) $_GET['kaydedildi'] - 1 ) // phpcs:ignore
				);
				?>
			</p>
		</div>
	<?php endif; ?>

	<?php if ( ! $davetiyeler ) : ?>
		<section class="sahra-sec">
			<p class="sahra-bos"><?php esc_html_e( 'Önce bir davetiye oluşturun.', 'sahra-davetiye' ); ?></p>
		</section>
	<?php else : ?>

		<?php /* Birden fazla davetiyesi olan çift hangisini düzenlediğini seçiyor. */ ?>
		<?php if ( count( $davetiyeler ) > 1 ) : ?>
			<section class="sahra-sec">
				<div class="alan">
					<label class="field-label" for="g-davetiye"><?php esc_html_e( 'Davetiye', 'sahra-davetiye' ); ?></label>
					<select id="g-davetiye" onchange="window.location = this.value">
						<?php foreach ( $davetiyeler as $sahra_dav ) : ?>
							<option value="<?php echo esc_url( admin_url( 'admin.php?page=sahra-davetliler&id=' . (int) $sahra_dav['id'] ) ); ?>"
								<?php selected( (int) $sahra_dav['id'], (int) $secili['id'] ); ?>>
								<?php echo esc_html( trim( $sahra_dav['brideName'] . ' ' . Sahra_Fields::CONJUNCTION . ' ' . $sahra_dav['groomName'] ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</div>
			</section>
		<?php endif; ?>

		<section class="sahra-sec">
			<header>
				<div class="ust">
					<span class="num">01</span>
					<span class="t-label"><?php esc_html_e( 'Liste', 'sahra-davetiye' ); ?></span>
				</div>
				<h1 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Kimi Davet Ettiniz?', 'sahra-davetiye' ); ?></h1>
				<?php
				/*
				 * Liste TOPLU giriliyor, tek tek değil.
				 *
				 * İki yüz davetliyi satır satır forma girmek kimsenin
				 * kullanmayacağı bir ekrandı; çift listeyi zaten bir yerde
				 * tutuyor ve yapıştırmak istiyor. Dikey çubuk düzeni
				 * program ve menü alanlarıyla aynı.
				 */
				?>
				<p class="lead"><?php esc_html_e( 'Her satır bir davetli. Bu liste yalnızca sizde durur, davetiyede görünmez.', 'sahra-davetiye' ); ?></p>
			</header>

			<form method="post">
				<?php wp_nonce_field( 'sahra_save_guests' ); ?>
				<input type="hidden" name="sahra_action" value="save_guests">
				<input type="hidden" name="invitation_id" value="<?php echo esc_attr( (int) $secili['id'] ); ?>">

				<div class="alan">
					<label class="field-label" for="g-liste"><?php esc_html_e( 'Davetliler', 'sahra-davetiye' ); ?></label>
					<textarea id="g-liste" name="davetliler" rows="14" placeholder="Ali Yılmaz | 0532 111 22 33 | 4&#10;Ayşe Demir | 0533 222 33 44&#10;Mehmet Kaya"><?php echo esc_textarea( $metin ); ?></textarea>
					<p class="ipucu"><?php esc_html_e( 'Ad | Telefon | Kaç kişi davet edildi. Telefon ve sayı isteğe bağlı; sayı boşsa 1 kişi sayılır.', 'sahra-davetiye' ); ?></p>
					<p class="ipucu"><?php esc_html_e( 'Telefon yazarsanız eşleştirme daha güvenilir olur: aynı adda iki misafir olabilir.', 'sahra-davetiye' ); ?></p>
				</div>

				<div class="sahra-adim-alt">
					<button type="submit" class="cta" style="margin-left:auto"><?php esc_html_e( 'Listeyi Kaydet', 'sahra-davetiye' ); ?></button>
				</div>
			</form>
		</section>

		<section class="sahra-sec">
			<header>
				<div class="ust">
					<span class="num">02</span>
					<span class="t-label"><?php esc_html_e( 'Durum', 'sahra-davetiye' ); ?></span>
				</div>
				<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Kim Cevap Verdi?', 'sahra-davetiye' ); ?></h2>
				<p class="lead">
					<?php
					$sahra_s = $durum['sayilar'];
					printf(
						/* translators: 1: davetli, 2: katılan, 3: katılmayan, 4: cevapsız, 5: gelecek kişi. */
						esc_html__( '%1$d davetli · %2$d katılıyor · %3$d katılamıyor · %4$d cevap yok · toplam %5$d kişi gelecek', 'sahra-davetiye' ),
						(int) $sahra_s['davetli'],
						(int) $sahra_s['katiliyor'],
						(int) $sahra_s['katilmiyor'],
						(int) $sahra_s['cevapsiz'],
						(int) $sahra_s['gelen_kisi']
					);
					?>
				</p>
			</header>

			<?php if ( ! $durum['davetliler'] ) : ?>
				<p class="sahra-bos"><?php esc_html_e( 'Liste boş. Yukarıya davetlilerinizi yazın.', 'sahra-davetiye' ); ?></p>
			<?php else : ?>
				<div class="sahra-list">
					<?php foreach ( $durum['davetliler'] as $sahra_d ) : ?>
						<article class="sahra-row">
							<div class="ana">
								<span class="t-h2"><?php echo esc_html( $sahra_d['ad'] ); ?></span>
								<span class="rozet <?php echo esc_attr( $sahra_sinif[ $sahra_d['durum'] ] ); ?>">
									<?php echo esc_html( $sahra_etiket[ $sahra_d['durum'] ] ); ?>
								</span>
							</div>
							<div class="meta">
								<?php if ( 'katiliyor' === $sahra_d['durum'] ) : ?>
									<span>
										<?php
										printf(
											/* translators: %d: gelecek kişi sayısı. */
											esc_html__( '%d kişi geliyor', 'sahra-davetiye' ),
											(int) $sahra_d['gelen_kisi']
										);
										?>
									</span>
								<?php endif; ?>
								<?php if ( $sahra_d['davet_kisi'] > 1 ) : ?>
									<span>
										<?php
										printf(
											/* translators: %d: davet edilen kişi sayısı. */
											esc_html__( '%d kişi davetli', 'sahra-davetiye' ),
											(int) $sahra_d['davet_kisi']
										);
										?>
									</span>
								<?php endif; ?>
								<?php if ( $sahra_d['telefon'] ) : ?>
									<span><?php echo esc_html( $sahra_d['telefon'] ); ?></span>
								<?php endif; ?>
							</div>
						</article>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<?php
			/*
			 * Listede olmayan ama katılım bildiren misafirler.
			 *
			 * Sessizce atılamaz: salona o kişiler de geliyor. Çift ya
			 * listeye ekliyor ya da yazımı düzeltiyor.
			 */
			?>
			<?php if ( $durum['listede_olmayan'] ) : ?>
				<h3 class="t-h2" style="margin-top:var(--sp-md)"><?php esc_html_e( 'Listede Olmayanlar', 'sahra-davetiye' ); ?></h3>
				<p class="ipucu"><?php esc_html_e( 'Bu misafirler katılım bildirdi ama listede bulunamadı. Adı farklı yazılmış olabilir; listeye ekleyebilir ya da yazımı düzeltebilirsiniz.', 'sahra-davetiye' ); ?></p>
				<div class="sahra-list">
					<?php foreach ( $durum['listede_olmayan'] as $sahra_d ) : ?>
						<article class="sahra-row">
							<div class="ana">
								<span class="t-h2"><?php echo esc_html( $sahra_d['ad'] ); ?></span>
								<span class="rozet <?php echo esc_attr( $sahra_sinif[ $sahra_d['durum'] ] ); ?>">
									<?php echo esc_html( $sahra_etiket[ $sahra_d['durum'] ] ); ?>
								</span>
							</div>
							<?php if ( 'katiliyor' === $sahra_d['durum'] ) : ?>
								<div class="meta">
									<span>
										<?php
										printf(
											/* translators: %d: gelecek kişi sayısı. */
											esc_html__( '%d kişi geliyor', 'sahra-davetiye' ),
											(int) $sahra_d['gelen_kisi']
										);
										?>
									</span>
								</div>
							<?php endif; ?>
						</article>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</section>
	<?php endif; ?>
</div>
