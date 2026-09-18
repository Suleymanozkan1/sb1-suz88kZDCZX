<?php
/**
 * Salonlar — yalnızca yönetici.
 *
 * İşletmenin birden fazla salonu var; çift kendi davetiyesinde bunlardan
 * birini seçiyor. Adres hâlâ çiftin YAZDIĞI bir şey değil: yanlış yazan
 * bir çiftin misafirleri yanlış yere gidiyor ve kimse fark etmiyordu.
 *
 * @var array      $salonlar
 * @var array      $venue    Düzenlenen salon ya da boş iskelet.
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$sahra_sayfa = 'sahra-salonlar';
include SAHRA_DIR . 'templates/admin-header.php';

$sahra_duzenliyor = ! empty( $venue['id'] );
?>
	<?php if ( ! empty( $_GET['kaydedildi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Kaydedildi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem"><?php esc_html_e( 'Bu salonu kullanan tüm davetiyelerde güncellendi.', 'sahra-davetiye' ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $harita_eksik ) ) : ?>
		<?php
		/*
		 * Harita gelmeyince davetiye sessizce eski adres paneline
		 * düşüyor ve kuran kişi nedenini göremiyordu. Eksik varsa
		 * burada yazıyor: üretim arka planda kuyruğa alındı, olmazsa
		 * düğme elde.
		 */
		?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Harita bekleniyor', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem">
				<?php
				printf(
					/* translators: %d: salon sayısı. */
					esc_html__( '%d salonun konum haritası henüz üretilmedi; davetiyede onun yerine adres yazısı görünüyor. Üretim arka planda sıraya alındı — sayfayı birkaç saniye sonra yenileyin. Gelmezse aşağıdaki listeden "Haritayı Yenile" deyin.', 'sahra-davetiye' ),
					count( $harita_eksik )
				);
				?>
			</p>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $_GET['harita_yenilendi'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Harita yenilendi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem"><?php esc_html_e( 'Bu salonu kullanan tüm davetiyelerde yeni harita görünür.', 'sahra-davetiye' ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $_GET['harita'] ) ) : // phpcs:ignore ?>
		<div class="bildirim">
			<p class="t-label"><?php esc_html_e( 'Salon kaydedildi, harita üretilemedi', 'sahra-davetiye' ); ?></p>
			<p class="t-body" style="margin-top:0.3rem;color:var(--c-danger)"><?php echo esc_html( sanitize_text_field( wp_unslash( $_GET['harita'] ) ) ); // phpcs:ignore ?></p>
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
				<span class="t-label"><?php esc_html_e( 'Salon', 'sahra-davetiye' ); ?></span>
			</div>
			<h1 class="t-display" style="margin-top:0.4rem">
				<?php echo $sahra_duzenliyor ? esc_html__( 'Salonu Düzenle', 'sahra-davetiye' ) : esc_html__( 'Yeni Salon', 'sahra-davetiye' ); ?>
			</h1>
			<p class="lead"><?php esc_html_e( 'Çift, davetiyesini hazırlarken buradaki salonlardan birini seçer.', 'sahra-davetiye' ); ?></p>
		</header>

		<form method="post">
			<?php wp_nonce_field( 'sahra_save_venue' ); ?>
			<input type="hidden" name="sahra_action" value="save_venue">
			<input type="hidden" name="venue[id]" value="<?php echo esc_attr( $venue['id'] ); ?>">

			<?php
			/*
			 * Salon adı YAZILMIYOR, marka SEÇİLİYOR.
			 *
			 * İki marka var ve her birinin kendi Instagram hesabı; adı ve
			 * hesabı ayrı ayrı yazdırmak, birini değiştirip ötekini
			 * unutmak demekti — misafir Sahra'nın davetiyesinde Grand'ın
			 * hesabını görüyordu. Tek seçim ikisini birden belirliyor.
			 */
			$sahra_markalar = Sahra_Settings::brands();
			$sahra_secili   = Sahra_Settings::brand_key( $venue['brand'] );
			?>
			<div class="alan">
				<span class="field-label"><?php esc_html_e( 'Marka *', 'sahra-davetiye' ); ?></span>
				<div class="secenekler">
					<?php foreach ( $sahra_markalar as $sahra_anahtar => $sahra_marka ) : ?>
						<label class="secenek">
							<input type="radio" name="venue[brand]" value="<?php echo esc_attr( $sahra_anahtar ); ?>" <?php checked( $sahra_anahtar, $sahra_secili ); ?>>
							<span class="ad"><?php echo esc_html( $sahra_marka['label'] ); ?></span>
						</label>
					<?php endforeach; ?>
				</div>
				<p class="ipucu">
					<?php
					printf(
						/* translators: 1: davetiyede görünen salon adı, 2: Instagram hesabı. */
						esc_html__( 'Davetiyede "%1$s" yazar, etiketleme bölümünde %2$s görünür.', 'sahra-davetiye' ),
						esc_html( $sahra_markalar[ $sahra_secili ]['venueName'] ),
						esc_html( $sahra_markalar[ $sahra_secili ]['venueInstagramLabel'] )
					);
					?>
				</p>
			</div>

			<div class="alan">
				<label class="field-label" for="v-address"><?php esc_html_e( 'Adres *', 'sahra-davetiye' ); ?></label>
				<input id="v-address" type="text" name="venue[address]" value="<?php echo esc_attr( $venue['address'] ); ?>" placeholder="Bağdat Caddesi No 120" required>
			</div>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="v-district"><?php esc_html_e( 'İlçe', 'sahra-davetiye' ); ?></label>
					<input id="v-district" type="text" name="venue[district]" value="<?php echo esc_attr( $venue['district'] ); ?>" placeholder="Kadıköy">
				</div>
				<div class="alan">
					<label class="field-label" for="v-city"><?php esc_html_e( 'İl', 'sahra-davetiye' ); ?></label>
					<input id="v-city" type="text" name="venue[city]" value="<?php echo esc_attr( $venue['city'] ); ?>" placeholder="İstanbul">
				</div>
			</div>

			<div class="ikili">
				<div class="alan">
					<label class="field-label" for="v-map"><?php esc_html_e( 'Google Maps Linki', 'sahra-davetiye' ); ?></label>
					<input id="v-map" type="url" name="venue[mapUrl]" value="<?php echo esc_attr( $venue['mapUrl'] ); ?>" placeholder="https://maps.google.com/...">
				</div>
				<div class="alan">
					<label class="field-label" for="v-apple"><?php esc_html_e( 'Apple Haritalar Linki', 'sahra-davetiye' ); ?></label>
					<input id="v-apple" type="url" name="venue[appleMapUrl]" value="<?php echo esc_attr( $venue['appleMapUrl'] ); ?>" placeholder="https://maps.apple/p/...">
					<p class="ipucu"><?php esc_html_e( 'Boş bırakılırsa adresten üretilir; üretilen sorgu bazen komşu bir işletmeyi gösteriyor. Apple Haritalar\'da salonu bulup "Paylaş" ile aldığınız adresi buraya yapıştırın.', 'sahra-davetiye' ); ?></p>
				</div>
			</div>

			<?php
			/*
			 * Konum bölümündeki harita GÖRÜNÜMÜ.
			 *
			 * Koordinat yukarıdaki Google Maps linkinden (olmazsa
			 * adresten) kendiliğinden çözülüyor; bu blok çoğu zaman
			 * yalnızca sonucu GÖSTERİYOR. Elle yazma, adresten çözülen
			 * nokta komşu binaya düştüğünde tek çıkış yolu.
			 */
			$sahra_harita_hazir = Sahra_Harita::hazir( $venue );
			$sahra_harita_url   = Sahra_Harita::url( $venue );
			$sahra_harita_hata  = $sahra_duzenliyor ? Sahra_Harita::son_hata( $venue ) : '';
			?>
			<div class="alan">
				<span class="field-label"><?php esc_html_e( 'Harita Görünümü', 'sahra-davetiye' ); ?></span>

				<?php if ( $sahra_harita_hazir ) : ?>
					<p class="ipucu" style="margin-bottom:0.6rem"><?php esc_html_e( 'Davetiyenin konum bölümünde bu harita görünüyor. Harita verisi OpenStreetMap katkıcılarından geliyor.', 'sahra-davetiye' ); ?></p>
					<img src="<?php echo esc_url( $sahra_harita_url ); ?>" alt="" style="width:100%;max-width:30rem;border-radius:0.5rem;display:block">
				<?php elseif ( $sahra_duzenliyor ) : ?>
					<p class="ipucu" style="color:var(--c-danger)">
						<?php
						echo esc_html(
							$sahra_harita_hata
								? $sahra_harita_hata
								: __( 'Harita görseli henüz üretilmedi. Google Maps linkini girip kaydedin.', 'sahra-davetiye' )
						);
						?>
					</p>
				<?php else : ?>
					<p class="ipucu"><?php esc_html_e( 'Salonu kaydettiğinizde Google Maps linkinden (ya da adresten) üretilir.', 'sahra-davetiye' ); ?></p>
				<?php endif; ?>

				<div class="ikili" style="margin-top:0.9rem">
					<div class="alan">
						<label class="field-label" for="v-lat"><?php esc_html_e( 'Enlem', 'sahra-davetiye' ); ?></label>
						<input id="v-lat" type="text" inputmode="decimal" name="venue[venueLat]" value="<?php echo esc_attr( $venue['venueLat'] ); ?>" placeholder="41.043100">
					</div>
					<div class="alan">
						<label class="field-label" for="v-lng"><?php esc_html_e( 'Boylam', 'sahra-davetiye' ); ?></label>
						<input id="v-lng" type="text" inputmode="decimal" name="venue[venueLng]" value="<?php echo esc_attr( $venue['venueLng'] ); ?>" placeholder="29.008900">
					</div>
				</div>
				<p class="ipucu"><?php esc_html_e( 'Boş bırakın: linkten çözülür. Elle yazarsanız o nokta kullanılır — adresten çözülen konum bazen komşu binaya düşüyor.', 'sahra-davetiye' ); ?></p>
			</div>

			<?php
			/*
			 * Elle yüklenen harita EKRAN GÖRÜNTÜSÜ, üretilen görünümün
			 * yerine geçiyor: üretilen harita yanlış yeri gösteriyorsa
			 * ya da işletme kendi işaretlediği bir görseli kullanmak
			 * istiyorsa. Bir kez yüklenir, o salonu seçen bütün
			 * davetiyelerde çıkar.
			 */
			Sahra_Form::gorsel(
				__( 'Harita Görseli (elle)', 'sahra-davetiye' ),
				'venue[venueMapImage]',
				$venue['venueMapImage'],
				__( 'Gerekmiyor: harita yukarıda kendiliğinden üretiliyor. Yalnızca kendi ekran görüntünüzü kullanmak isterseniz yükleyin — yüklediğiniz görsel üretilen haritanın yerine geçer.', 'sahra-davetiye' )
			);
			?>

			<?php
			/*
			 * Instagram hesabı da MARKADAN geliyor; ayrıca sorulmuyor.
			 * Elle yazılırken bir salona öteki markanın hesabı
			 * bağlanabiliyordu.
			 */
			?>

			<?php
			/*
			 * Salonun özellikleri MİSAFİR için yazılır, işletme için değil.
			 * "Kapalı otopark", "Metroya 5 dk", "Çocuk oyun alanı" gibi
			 * satırlar misafirin o akşam vereceği kararları etkiliyor;
			 * "1200 kişilik kapasite" etkilemiyor.
			 */
			?>
			<?php
			/*
			 * Yol tarifi burada, çiftin formunda değil.
			 *
			 * Aynı salona gelen herkes aynı yoldan geliyor: tarifi her
			 * çifte ayrı yazdırmak hem gereksiz bir soru, hem de birinin
			 * yanlış yazıp kimsenin fark etmemesi demekti. Yönetici bir
			 * kez yazıyor, o salonu seçen bütün davetiyelerde çıkıyor.
			 */
			?>
			<?php
			/*
			 * Çocuklu düğünde salonun ne sunduğu.
			 *
			 * Davetiye "çocuklar da davetlidir" diyor; asıl merak edilen
			 * şey çocuğun orada ne yapacağı. Bu da salonun bilgisi —
			 * yalnızca çocuklar davetliyken, o cümlenin altında çıkıyor.
			 */
			?>
			<div class="alan">
				<label class="field-label" for="v-cocuk"><?php esc_html_e( 'Çocuklar İçin Hizmetler', 'sahra-davetiye' ); ?></label>
				<input id="v-cocuk" type="text" name="venue[venueChildrenNote]" value="<?php echo esc_attr( $venue['venueChildrenNote'] ); ?>" placeholder="Palyaço hizmetimiz ve çocuk oyun alanımız bulunmaktadır.">
				<p class="ipucu"><?php esc_html_e( 'Yalnızca çift "çocuklar da davetli" seçtiyse, davetiyede o cümlenin altında görünür.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="alan">
				<label class="field-label" for="v-directions"><?php esc_html_e( 'Nasıl Gelirsiniz?', 'sahra-davetiye' ); ?></label>
				<textarea id="v-directions" name="venue[venueDirections]" rows="4" placeholder="E-5'ten Kadıköy çıkışına dönüp sahil yolunu takip edin. Marmaray Ayrılıkçeşme durağından 10 dakika yürüme mesafesinde."><?php echo esc_textarea( $venue['venueDirections'] ); ?></textarea>
				<p class="ipucu"><?php esc_html_e( 'Davetiyenin konum bölümünde, adresin altında görünür. Boş bırakılırsa hiç çıkmaz.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="alan">
				<label class="field-label" for="v-features"><?php esc_html_e( 'Misafirin İşine Yarayacak Bilgiler', 'sahra-davetiye' ); ?></label>
				<textarea id="v-features" name="venue[features]" rows="6" placeholder="Kapalı otopark (ücretsiz)&#10;Vale hizmeti&#10;Metro Kadıköy'e 5 dk yürüme&#10;Engelli erişimi&#10;Çocuk oyun alanı ve palyaço"><?php echo esc_textarea( implode( "\n", (array) $venue['features'] ) ); ?></textarea>
				<p class="ipucu"><?php esc_html_e( 'Her satır bir madde. Davetiyenin konum bölümünde liste olarak görünür.', 'sahra-davetiye' ); ?></p>
			</div>

			<div class="sahra-adim-alt">
				<?php if ( $sahra_duzenliyor ) : ?>
					<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-salonlar' ) ); ?>"><?php esc_html_e( 'Vazgeç', 'sahra-davetiye' ); ?></a>
				<?php endif; ?>
				<button type="submit" class="cta" style="margin-left:auto">
					<?php echo $sahra_duzenliyor ? esc_html__( 'Kaydet', 'sahra-davetiye' ) : esc_html__( 'Salon Ekle', 'sahra-davetiye' ); ?>
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
			<h2 class="t-display" style="margin-top:0.4rem"><?php esc_html_e( 'Salonlar', 'sahra-davetiye' ); ?></h2>
		</header>

		<?php if ( ! $salonlar ) : ?>
			<p class="sahra-bos"><?php esc_html_e( 'Henüz salon yok. Yukarıdan ilk salonu ekleyin.', 'sahra-davetiye' ); ?></p>
		<?php else : ?>
			<div class="sahra-list">
				<?php foreach ( $salonlar as $sahra_salon ) : ?>
					<article class="sahra-row">
						<div class="ana">
							<span class="t-h2"><?php echo esc_html( $sahra_salon['venueName'] ); ?></span>
							<span class="t-label"><?php echo esc_html( Sahra_Settings::brands()[ Sahra_Settings::brand_key( $sahra_salon['brand'] ) ]['venueInstagramLabel'] ); ?></span>
						</div>
						<div class="meta">
							<span><?php echo esc_html( implode( ', ', array_filter( array( $sahra_salon['address'], $sahra_salon['district'], $sahra_salon['city'] ) ) ) ); ?></span>
							<?php
							/*
							 * Haritanın durumu LİSTEDE duruyor: eksikse
							 * hangi salonda eksik olduğu ve nedeni
							 * görünmeden, kuran kişi yalnızca
							 * davetiyede harita olmadığını fark
							 * ediyordu.
							 */
							$sahra_harita_var = Sahra_Harita::hazir( $sahra_salon ) || $sahra_salon['venueMapImage'];
							$sahra_neden      = $sahra_harita_var ? '' : Sahra_Harita::son_hata( $sahra_salon );
							?>
							<span<?php echo $sahra_harita_var ? '' : ' style="color:var(--c-danger)"'; ?>>
								<?php
								if ( $sahra_harita_var ) {
									esc_html_e( 'harita hazır', 'sahra-davetiye' );
								} elseif ( $sahra_neden ) {
									echo esc_html( $sahra_neden );
								} else {
									esc_html_e( 'harita yok', 'sahra-davetiye' );
								}
								?>
							</span>
							<span>
								<?php
								/* translators: %d: özellik sayısı. */
								echo esc_html( sprintf( _n( '%d bilgi', '%d bilgi', count( $sahra_salon['features'] ), 'sahra-davetiye' ), count( $sahra_salon['features'] ) ) );
								?>
							</span>
						</div>
						<div class="eylem">
							<a class="eylem-link" href="<?php echo esc_url( admin_url( 'admin.php?page=sahra-salonlar&salon=' . rawurlencode( $sahra_salon['id'] ) ) ); ?>"><?php esc_html_e( 'Düzenle', 'sahra-davetiye' ); ?></a>
							<?php
							/*
							 * Haritayı yenileme AYRI bir düğme: salon
							 * taşınmadığı hâlde harita yanlış yeri
							 * gösteriyorsa (link düzeltildi, koordinat
							 * elle yazıldı) kaydet düğmesine basmak
							 * yetmiyor — koordinat duruyorsa yeniden
							 * çözülmüyor.
							 */
							?>
							<form method="post">
								<?php wp_nonce_field( 'sahra_refresh_venue_map' ); ?>
								<input type="hidden" name="sahra_action" value="refresh_venue_map">
								<input type="hidden" name="venue_id" value="<?php echo esc_attr( $sahra_salon['id'] ); ?>">
								<button class="eylem-link"><?php esc_html_e( 'Haritayı Yenile', 'sahra-davetiye' ); ?></button>
							</form>
							<form method="post" onsubmit="return confirm('<?php echo esc_js( __( 'Salon silinecek. Bu salonu seçmiş davetiyeler ilk salona düşer. Emin misiniz?', 'sahra-davetiye' ) ); ?>')">
								<?php wp_nonce_field( 'sahra_delete_venue' ); ?>
								<input type="hidden" name="sahra_action" value="delete_venue">
								<input type="hidden" name="venue_id" value="<?php echo esc_attr( $sahra_salon['id'] ); ?>">
								<button class="eylem-link tehlike"><?php esc_html_e( 'Sil', 'sahra-davetiye' ); ?></button>
							</form>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
</div>
