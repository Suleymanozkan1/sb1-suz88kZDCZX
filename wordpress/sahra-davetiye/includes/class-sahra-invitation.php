<?php
/**
 * Davetiye — özel içerik türü ve okuma/yazma.
 *
 * Alanların tamamı tek bir meta anahtarında (JSON) durur. Next sürümünde de
 * aynı karar verilmişti (`jsonb data` sütunu): davetiyenin elli küsur alanı
 * sık değişiyor ve her biri ayrı bir postmeta satırı olsaydı tek davetiyeyi
 * okumak elli satırlık bir birleştirmeye dönerdi. Sorgulanan tek şey slug,
 * o da zaten `post_name`.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Invitation {

	const POST_TYPE = 'sahra_davetiye';
	const META_KEY  = '_sahra_data';

	public static function register_post_type() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'          => __( 'Davetiyeler', 'sahra-davetiye' ),
					'singular_name' => __( 'Davetiye', 'sahra-davetiye' ),
				),
				// Kendi ekranları var; WordPress'in yazı düzenleyicisi
				// bu veri için yanlış araç.
				'public'              => false,
				'show_ui'             => false,
				'show_in_rest'        => false,
				'exclude_from_search' => true,
				'supports'            => array( 'title', 'author' ),
				'rewrite'             => false,
				'capability_type'     => 'post',
			)
		);
	}

	/**
	 * Davetiyeyi tam hâliyle döndürür.
	 *
	 * Mekân BURADA ekleniyor; tek yerde olduğu için hiçbir bölüm ortak
	 * ayardan haberdar olmak zorunda değil ve biri unutulup eski adresi
	 * göstermiyor.
	 */
	public static function get( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return null;
		}

		$ham = get_post_meta( $post->ID, self::META_KEY, true );
		$ham = is_array( $ham ) ? $ham : array();

		$data  = array_merge( Sahra_Fields::defaults(), $ham );

		/*
		 * Mekân, çiftin SEÇTİĞİ salondan gelir; alanları davetiyede
		 * saklanmaz. Böylece salonun adresi değişince yayındaki bütün
		 * davetiyeler aynı anda düzelir.
		 */
		$salon = Sahra_Settings::venue_for( $data['venueId'] );
		foreach ( Sahra_Fields::VENUE_KEYS as $anahtar ) {
			$data[ $anahtar ] = $salon[ $anahtar ];
		}
		$data['venueFeatures'] = $salon['features'];
		$data['venueId']       = $salon['id'] ? $salon['id'] : $data['venueId'];

		$data['id']       = (int) $post->ID;
		$data['slug']     = $post->post_name;
		$data['ownerId']  = (int) $post->post_author;
		$data['isActive'] = ( 'publish' === $post->post_status );

		return $data;
	}

	public static function get_by_slug( $slug ) {
		$posts = get_posts(
			array(
				'name'             => sanitize_title( $slug ),
				'post_type'        => self::POST_TYPE,
				'post_status'      => array( 'publish', 'draft' ),
				'numberposts'      => 1,
				'suppress_filters' => false,
			)
		);
		return $posts ? self::get( $posts[0]->ID ) : null;
	}

	/** Yöneticiye hepsi, çifte yalnızca kendisininki. */
	public static function all_for_user( $user_id = null ) {
		$user_id = $user_id ? (int) $user_id : get_current_user_id();

		$args = array(
			'post_type'      => self::POST_TYPE,
			'post_status'    => array( 'publish', 'draft' ),
			'posts_per_page' => 200,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		if ( ! Sahra_Roles::is_manager( $user_id ) ) {
			$args['author'] = $user_id;
		}

		return array_map(
			static function ( $post ) {
				return self::get( $post->ID );
			},
			get_posts( $args )
		);
	}

	public static function can_edit( $post_id, $user_id = null ) {
		$user_id = $user_id ? (int) $user_id : get_current_user_id();
		if ( Sahra_Roles::is_manager( $user_id ) ) {
			return true;
		}
		$post = get_post( $post_id );
		return $post && (int) $post->post_author === $user_id && user_can( $user_id, 'sahra_edit_invitations' );
	}

	/**
	 * Ürüne ait adreslerle çakışan slug'lar.
	 *
	 * `/davet/giris` giriş ekranı; bir davetiye "giris" slug'ını alsaydı
	 * kendi sayfası hiç açılmaz, çift de giriş yapamazdı. Sessiz bir
	 * çakışma yerine slug'a bir sonek ekleniyor.
	 */
	const RESERVED_SLUGS = array( 'giris', 'cikis', 'panel', 'admin' );

	/**
	 * Slug verilmediğinde üretilen adres: 31-eylul-2026-zehra-ahmet
	 *
	 * Tarih önde: işletme yılda yüzlerce davetiye açıyor, adrese bakınca
	 * hangi güne ait olduğu görünmeli.
	 */
	private static function auto_slug( $data ) {
		$slug = Sahra_Fields::build_slug(
			$data['brideName'] ?? '',
			$data['groomName'] ?? '',
			$data['weddingDate'] ?? ''
		);
		return self::safe_slug( $slug ? $slug : __( 'davetiye', 'sahra-davetiye' ) );
	}

	/** Ayrılmış bir slug istendiyse ürünle çakışmayan bir sürümü. */
	private static function safe_slug( $slug ) {
		$slug = sanitize_title( $slug );
		if ( in_array( $slug, self::RESERVED_SLUGS, true ) ) {
			$slug .= '-davetiye';
		}
		return $slug;
	}

	/** Yeni davetiye. Slug çakışmasını WordPress kendi çözer. */
	public static function create( $input, $owner_id ) {
		$data = Sahra_Fields::sanitize( $input );

		// Gelin solda, damat sağda — başlıktan bağlantı adresine kadar.
		$baslik = trim( ( $data['brideName'] ?? '' ) . ' & ' . ( $data['groomName'] ?? '' ) );
		if ( '' === trim( $baslik, ' &' ) ) {
			$baslik = __( 'Davetiye', 'sahra-davetiye' );
		}

		$istenen = isset( $input['slug'] ) ? self::safe_slug( $input['slug'] ) : '';

		$post_id = wp_insert_post(
			array(
				'post_type'   => self::POST_TYPE,
				'post_title'  => $baslik,
				'post_name'   => $istenen ? $istenen : self::auto_slug( $data ),
				'post_status' => 'publish',
				'post_author' => (int) $owner_id,
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, self::META_KEY, $data );
		return self::get( $post_id );
	}

	/**
	 * Güncelleme.
	 *
	 * Sahiplik gövdeden değiştirilemez ve mekân alanları düşürülür
	 * (Sahra_Fields::sanitize içinde) — hazırlanmış bir istekle bile
	 * ortak adresin değiştirilememesi gerekiyor.
	 */
	public static function update( $post_id, $input ) {
		$post = get_post( $post_id );
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return null;
		}

		$mevcut = get_post_meta( $post_id, self::META_KEY, true );
		$data   = Sahra_Fields::sanitize( $input, is_array( $mevcut ) ? $mevcut : array() );

		update_post_meta( $post_id, self::META_KEY, $data );

		$guncelle = array( 'ID' => $post_id );

		$baslik = trim( ( $data['brideName'] ?? '' ) . ' & ' . ( $data['groomName'] ?? '' ) );
		if ( '' !== trim( $baslik, ' &' ) ) {
			$guncelle['post_title'] = $baslik;
		}

		if ( isset( $input['slug'] ) && '' !== self::safe_slug( $input['slug'] ) ) {
			$guncelle['post_name'] = self::safe_slug( $input['slug'] );
		}

		/*
		 * Sahip devri. Çağıran taraf yetkiyi zaten denetliyor
		 * (Sahra_Admin::valid_owner); burada yalnızca gerçekten var olan
		 * bir kullanıcıya yazıldığından emin olunuyor — post_author'ı
		 * olmayan bir kimliğe kaydırmak davetiyeyi kimsenin göremediği
		 * bir yere düşürürdü.
		 */
		if ( isset( $input['ownerId'] ) ) {
			$sahip = (int) $input['ownerId'];
			if ( $sahip > 0 && get_userdata( $sahip ) ) {
				$guncelle['post_author'] = $sahip;
			}
		}

		if ( array_key_exists( 'isActive', $input ) ) {
			$aktif = filter_var( $input['isActive'], FILTER_VALIDATE_BOOLEAN );
			$guncelle['post_status'] = $aktif ? 'publish' : 'draft';
		}

		if ( count( $guncelle ) > 1 ) {
			wp_update_post( $guncelle );
		}

		return self::get( $post_id );
	}

	/** Silme — bağlı katılım, dilek ve fotoğraflarla birlikte. */
	public static function delete( $post_id ) {
		// Paylaşım kartı da gitsin: üstünde çiftin adı, şehri ve düğün
		// tarihi yazıyor ve "her şey silindi" dediğimiz yerde kalıyordu.
		$post = get_post( $post_id );
		if ( $post ) {
			Sahra_Og_Image::purge( $post->post_name );
		}

		Sahra_Tables::purge_invitation( $post_id );
		wp_delete_post( $post_id, true );
		return true;
	}

	public static function url( $slug ) {
		return home_url( '/davet/' . rawurlencode( $slug ) );
	}

	public static function upload_url( $slug ) {
		return home_url( '/yukle/' . rawurlencode( $slug ) );
	}
}
