<?php
/**
 * Sihirbazın form parçaları.
 *
 * Şablonun içinde global işlev olarak duruyorlardı; function_exists sarmalı
 * onları koşullu hale getiriyor, koşullu işlevler de PHP tarafından yukarı
 * taşınmıyordu. Sınıfa alınınca hem sıra sorunu kalkıyor hem de ad çakışma
 * riski yok oluyor.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Form {

	/** Alanın kimliğini ad özniteliğinden türetir: sahra[groomName] → f-groomname */
	private static function id( $name ) {
		return 'f-' . sanitize_key( str_replace( array( 'sahra[', ']' ), '', $name ) );
	}

	/** Tek alan — panelde her alan aynı görünsün. */
	public static function alan( $args ) {
		$a = wp_parse_args(
			$args,
			array(
				'label' => '',
				'name'  => '',
				'value' => '',
				'type'  => 'text',
				'ph'    => '',
				'ipucu' => '',
				'rows'  => 4,
				'sinif' => '',
				'id'    => '',
			)
		);

		$id = $a['id'] ? $a['id'] : self::id( $a['name'] );
		?>
		<div class="alan">
			<label class="field-label" for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $a['label'] ); ?></label>

			<?php if ( 'textarea' === $a['type'] ) : ?>
				<textarea id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $a['name'] ); ?>"
					rows="<?php echo (int) $a['rows']; ?>" placeholder="<?php echo esc_attr( $a['ph'] ); ?>"
					class="<?php echo esc_attr( $a['sinif'] ); ?>"><?php echo esc_textarea( $a['value'] ); ?></textarea>
			<?php else : ?>
				<input id="<?php echo esc_attr( $id ); ?>" type="<?php echo esc_attr( $a['type'] ); ?>"
					name="<?php echo esc_attr( $a['name'] ); ?>" value="<?php echo esc_attr( $a['value'] ); ?>"
					placeholder="<?php echo esc_attr( $a['ph'] ); ?>" class="<?php echo esc_attr( $a['sinif'] ); ?>">
			<?php endif; ?>

			<?php if ( $a['ipucu'] ) : ?>
				<p class="ipucu"><?php echo esc_html( $a['ipucu'] ); ?></p>
			<?php endif; ?>
		</div>
		<?php
	}

	/** Görsel alanı: doğrudan yükleme + medya kütüphanesi + elle adres. */
	public static function gorsel( $label, $name, $value, $ipucu = '', $coklu = false ) {
		$id = self::id( $name );
		?>
		<div class="alan">
			<label class="field-label" for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label>

			<?php if ( $coklu ) : ?>
				<textarea id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $name ); ?>" rows="5"><?php echo esc_textarea( $value ); ?></textarea>
			<?php else : ?>
				<input id="<?php echo esc_attr( $id ); ?>" type="text" name="<?php echo esc_attr( $name ); ?>"
					value="<?php echo esc_attr( $value ); ?>" placeholder="https://...">
			<?php endif; ?>

			<div class="sahra-yukleyici">
				<button type="button" class="cta sahra-yukle" data-hedef="<?php echo esc_attr( $id ); ?>" <?php echo $coklu ? 'data-coklu="1"' : ''; ?>>
					<?php esc_html_e( 'Bilgisayardan Yükle', 'sahra-davetiye' ); ?>
				</button>
				<button type="button" class="eylem-link sahra-media" data-hedef="<?php echo esc_attr( $id ); ?>">
					<?php esc_html_e( 'Medya Kütüphanesi', 'sahra-davetiye' ); ?>
				</button>
				<span class="sahra-durum"></span>
			</div>

			<div class="sahra-onizleme" data-kaynak="<?php echo esc_attr( $id ); ?>"></div>

			<?php if ( $ipucu ) : ?>
				<p class="ipucu"><?php echo esc_html( $ipucu ); ?></p>
			<?php endif; ?>
		</div>
		<?php
	}

	/** Ses alanı: hazır parçalar, önizleme ve kendi dosyası. */
	public static function ses( $label, $name, $value, $hazirlar ) {
		$id = self::id( $name );

		/*
		 * Adres GİZLİ bir alanda tutuluyor.
		 *
		 * Eskiden açık bir metin kutusuydu ve seçim yapılınca içine
		 * ".../wp-content/plugins/sahra-davetiye/assets/muzik/piyano-sakin.mp3"
		 * yazıyordu. Çiftin gördüğü ekranda bir dosya yolunun işi yok;
		 * üstelik elle düzenlenebildiği için tek harf değişince ses
		 * sessizce ölüyordu. Artık ekranda SEÇİLEN SESİN ADI duruyor.
		 */
		$secili = '';
		foreach ( $hazirlar as $dosya => $ad ) {
			if ( $value && SAHRA_URL . 'assets/muzik/' . $dosya . '.mp3' === $value ) {
				$secili = $ad;
			}
		}
		if ( '' === $secili && $value ) {
			$secili = __( 'Kendi yüklediğiniz ses', 'sahra-davetiye' );
		}
		?>
		<div class="alan">
			<span class="field-label"><?php echo esc_html( $label ); ?></span>
			<input id="<?php echo esc_attr( $id ); ?>" type="hidden" name="<?php echo esc_attr( $name ); ?>"
				value="<?php echo esc_attr( $value ); ?>">

			<p class="sahra-secili-ses" data-alan="<?php echo esc_attr( $id ); ?>"
				data-bos="<?php esc_attr_e( 'Ses seçilmedi', 'sahra-davetiye' ); ?>"
				data-kendi="<?php esc_attr_e( 'Kendi yüklediğiniz ses', 'sahra-davetiye' ); ?>">
				<?php echo esc_html( $secili ? $secili : __( 'Ses seçilmedi', 'sahra-davetiye' ) ); ?>
			</p>

			<div class="secenekler" style="margin-top:0.75rem">
				<?php foreach ( $hazirlar as $dosya => $ad ) : ?>
					<?php $adres = SAHRA_URL . 'assets/muzik/' . $dosya . '.mp3'; ?>
					<div class="secenek">
						<span class="ad"><?php echo esc_html( $ad ); ?></span>
						<span style="display:flex;gap:1rem;margin-top:0.5rem">
							<button type="button" class="eylem-link sahra-sec-ses"
								data-hedef="<?php echo esc_attr( $id ); ?>"
								data-ad="<?php echo esc_attr( $ad ); ?>"
								data-adres="<?php echo esc_url( $adres ); ?>">
								<?php esc_html_e( 'Seç', 'sahra-davetiye' ); ?>
							</button>
							<button type="button" class="eylem-link sahra-dinle" data-adres="<?php echo esc_url( $adres ); ?>">
								<?php esc_html_e( 'Dinle', 'sahra-davetiye' ); ?>
							</button>
						</span>
					</div>
				<?php endforeach; ?>
			</div>

			<div class="sahra-yukleyici">
				<button type="button" class="cta sahra-yukle" data-hedef="<?php echo esc_attr( $id ); ?>" data-tur="audio">
					<?php esc_html_e( 'Kendi Sesini Yükle', 'sahra-davetiye' ); ?>
				</button>
				<button type="button" class="eylem-link sahra-dinle" data-alan="<?php echo esc_attr( $id ); ?>">
					<?php esc_html_e( 'Seçileni Dinle', 'sahra-davetiye' ); ?>
				</button>
				<span class="sahra-durum"></span>
			</div>
		</div>
		<?php
	}

	/** Nesne dizisini "a | b | c" satırlarına çevirir. */
	public static function satirlar( $liste, $anahtarlar ) {
		$satirlar = array();

		foreach ( $liste as $oge ) {
			$parcalar = array();
			foreach ( $anahtarlar as $anahtar ) {
				$parcalar[] = isset( $oge[ $anahtar ] ) ? $oge[ $anahtar ] : '';
			}
			$satirlar[] = implode( ' | ', $parcalar );
		}

		return implode( "\n", $satirlar );
	}
}
