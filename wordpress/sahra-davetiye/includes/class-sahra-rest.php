<?php
/**
 * REST uçları.
 *
 * Next sürümündeki `/api/*` rotalarının karşılığı. Yetki kuralları da aynı:
 *   • Katılım, dilek ve masadaki QR'dan fotoğraf yükleme OTURUMSUZ açık —
 *     misafirden hesap istenmez.
 *   • Okuma (katılım listesi, fotoğraf indirme, dilek yönetimi) oturumlu ve
 *     yalnızca davetiyenin sahibine ya da yöneticiye.
 *   • Mekân ayarını yalnızca yönetici yazar.
 *
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

class Sahra_Rest {

	const NS = 'sahra/v1';

	public static function register_routes() {
		$acik  = '__return_true';
		$oturum = array( __CLASS__, 'require_login' );

		register_rest_route(
			self::NS,
			'/invitations',
			array(
				array( 'methods' => 'GET',  'callback' => array( __CLASS__, 'list_invitations' ), 'permission_callback' => $oturum ),
				array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'create_invitation' ), 'permission_callback' => $oturum ),
			)
		);

		register_rest_route(
			self::NS,
			'/invitations/(?P<id>\d+)',
			array(
				array( 'methods' => 'GET',    'callback' => array( __CLASS__, 'get_invitation' ), 'permission_callback' => $oturum ),
				array( 'methods' => 'PUT',    'callback' => array( __CLASS__, 'update_invitation' ), 'permission_callback' => $oturum ),
				array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_invitation' ), 'permission_callback' => $oturum ),
			)
		);

		// Misafir uçları — oturum yok.
		register_rest_route(
			self::NS,
			'/rsvp',
			array(
				array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'create_rsvp' ), 'permission_callback' => $acik ),
				array( 'methods' => 'GET',  'callback' => array( __CLASS__, 'list_rsvps' ), 'permission_callback' => $oturum ),
			)
		);

		register_rest_route(
			self::NS,
			'/rsvp/(?P<id>\d+)',
			array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_rsvp' ), 'permission_callback' => $oturum )
		);

		register_rest_route(
			self::NS,
			'/wishes',
			array(
				array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'create_wish' ), 'permission_callback' => $acik ),
				array( 'methods' => 'GET',  'callback' => array( __CLASS__, 'list_wishes' ), 'permission_callback' => $oturum ),
			)
		);

		register_rest_route(
			self::NS,
			'/wishes/(?P<id>\d+)',
			array(
				array( 'methods' => 'PUT',    'callback' => array( __CLASS__, 'approve_wish' ), 'permission_callback' => $oturum ),
				array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_wish' ), 'permission_callback' => $oturum ),
			)
		);

		register_rest_route(
			self::NS,
			'/photos',
			array(
				array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'upload_photo' ), 'permission_callback' => $acik ),
				array( 'methods' => 'GET',  'callback' => array( __CLASS__, 'list_photos' ), 'permission_callback' => $oturum ),
			)
		);

		register_rest_route(
			self::NS,
			'/photos/(?P<id>\d+)',
			array( 'methods' => 'DELETE', 'callback' => array( __CLASS__, 'delete_photo' ), 'permission_callback' => $oturum )
		);

		// Çiftin kendi görselleri (kapak, galeri, ses).
		register_rest_route(
			self::NS,
			'/media',
			array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'upload_media' ), 'permission_callback' => $oturum )
		);
	}

	/* ------------------------------------------------------------- yetki */

	public static function require_login() {
		return is_user_logged_in()
			? true
			: new WP_Error( 'sahra_yetki', __( 'Yetkisiz', 'sahra-davetiye' ), array( 'status' => 401 ) );
	}

	public static function require_manager() {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'sahra_yetki', __( 'Yetkisiz', 'sahra-davetiye' ), array( 'status' => 401 ) );
		}
		return Sahra_Roles::is_manager()
			? true
			: new WP_Error( 'sahra_yasak', __( 'Bu işlem için yetkiniz yok', 'sahra-davetiye' ), array( 'status' => 403 ) );
	}

	private static function forbidden() {
		return new WP_Error( 'sahra_yasak', __( 'Bu işlem için yetkiniz yok', 'sahra-davetiye' ), array( 'status' => 403 ) );
	}

	private static function not_found() {
		return new WP_Error( 'sahra_yok', __( 'Davetiye bulunamadı', 'sahra-davetiye' ), array( 'status' => 404 ) );
	}

	/**
	 * Misafir uçlarının hedefi: YAYINDA olan bir davetiye.
	 *
	 * Pasife alınmış davetiyeye katılım, dilek ya da fotoğraf kabul edilmez;
	 * yoksa iptal edilmiş bir düğüne veri akmaya devam ederdi.
	 */
	private static function public_invitation( $slug ) {
		$davetiye = Sahra_Invitation::get_by_slug( $slug );
		return ( $davetiye && $davetiye['isActive'] ) ? $davetiye : null;
	}

	/* ------------------------------------------------------- davetiyeler */

	public static function list_invitations() {
		return rest_ensure_response( Sahra_Invitation::all_for_user() );
	}

	public static function get_invitation( $request ) {
		$id = (int) $request['id'];
		if ( ! Sahra_Invitation::can_edit( $id ) ) {
			return self::forbidden();
		}
		$davetiye = Sahra_Invitation::get( $id );
		return $davetiye ? rest_ensure_response( $davetiye ) : self::not_found();
	}

	public static function create_invitation( $request ) {
		if ( ! current_user_can( 'sahra_edit_invitations' ) ) {
			return self::forbidden();
		}

		$govde = (array) $request->get_json_params();

		if ( '' === trim( (string) ( $govde['brideName'] ?? '' ) ) || '' === trim( (string) ( $govde['groomName'] ?? '' ) ) ) {
			return new WP_Error( 'sahra_eksik', __( 'Gelin ve damat adı zorunlu', 'sahra-davetiye' ), array( 'status' => 400 ) );
		}

		/*
		 * Sahip: yönetici başka bir hesap adına açabilir, çift açamaz.
		 * ownerId gövdeden serbestçe okunsaydı çift, davetiyeyi bir
		 * başkasının üstüne yazabilirdi.
		 */
		$sahip = get_current_user_id();
		if ( Sahra_Roles::is_manager() && ! empty( $govde['ownerId'] ) ) {
			$aday = (int) $govde['ownerId'];
			if ( get_userdata( $aday ) ) {
				$sahip = $aday;
			}
		}

		$sonuc = Sahra_Invitation::create( $govde, $sahip );
		return is_wp_error( $sonuc ) ? $sonuc : new WP_REST_Response( $sonuc, 201 );
	}

	public static function update_invitation( $request ) {
		$id = (int) $request['id'];
		if ( ! Sahra_Invitation::can_edit( $id ) ) {
			return self::forbidden();
		}

		$govde = (array) $request->get_json_params();

		// Yayından kaldırma yalnızca yöneticide.
		if ( array_key_exists( 'isActive', $govde ) && ! Sahra_Roles::is_manager() ) {
			unset( $govde['isActive'] );
		}

		$sonuc = Sahra_Invitation::update( $id, $govde );
		return $sonuc ? rest_ensure_response( $sonuc ) : self::not_found();
	}

	public static function delete_invitation( $request ) {
		if ( ! Sahra_Roles::is_manager() ) {
			return self::forbidden();
		}
		Sahra_Invitation::delete( (int) $request['id'] );
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/*
	 * Mekân uçları KALDIRILDI.
	 *
	 * Tek ortak salon döneminden kalmışlardı ve çoklu salona geçince
	 * bozulmuşlardı: save_venue() artık salonun kimliğini döndürüyor,
	 * uç ise dönen değeri hâlâ dizi gibi okuyup ['venueName'] arıyordu.
	 * Hiçbir istemci çağırmıyordu; yazma yetkisi isteyen bozuk bir ucu
	 * ayakta tutmak yerine kaldırıldı. Salonlar panelden yönetiliyor.
	 */

	/* ----------------------------------------------------------- katılım */

	public static function create_rsvp( $request ) {
		global $wpdb;

		$govde    = (array) $request->get_json_params();
		$davetiye = self::public_invitation( $govde['slug'] ?? '' );
		if ( ! $davetiye ) {
			return self::not_found();
		}

		$ad = sanitize_text_field( (string) ( $govde['name'] ?? '' ) );
		$tel = sanitize_text_field( (string) ( $govde['phone'] ?? '' ) );
		if ( '' === $ad || '' === $tel ) {
			return new WP_Error( 'sahra_eksik', __( 'Ad ve telefon zorunlu', 'sahra-davetiye' ), array( 'status' => 400 ) );
		}

		$katiliyor = ! array_key_exists( 'attending', $govde ) || filter_var( $govde['attending'], FILTER_VALIDATE_BOOLEAN );

		$wpdb->insert( // phpcs:ignore
			Sahra_Tables::rsvps(),
			array(
				'invitation_id' => $davetiye['id'],
				'name'          => $ad,
				'phone'         => $tel,
				'guest_count'   => sanitize_text_field( (string) ( $govde['count'] ?? '1' ) ),
				'attending'     => $katiliyor ? 1 : 0,
				// Katılmayan biri şarkı isteyemez; form da gizliyor.
				'song_request'  => $katiliyor ? sanitize_text_field( (string) ( $govde['songRequest'] ?? '' ) ) : '',
				'note'          => sanitize_textarea_field( (string) ( $govde['note'] ?? '' ) ),
				'created_at'    => current_time( 'mysql', true ),
			),
			array( '%d', '%s', '%s', '%s', '%d', '%s', '%s', '%s' )
		);

		return new WP_REST_Response( array( 'ok' => true, 'id' => (int) $wpdb->insert_id ), 201 );
	}

	public static function list_rsvps( $request ) {
		global $wpdb;

		$id = (int) $request->get_param( 'invitationId' );
		if ( $id ) {
			if ( ! Sahra_Invitation::can_edit( $id ) ) {
				return self::forbidden();
			}
			$satirlar = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::rsvps() . ' WHERE invitation_id = %d ORDER BY created_at DESC', $id ) ); // phpcs:ignore
			return rest_ensure_response( $satirlar );
		}

		$izinli = self::owned_ids();
		if ( ! $izinli ) {
			return rest_ensure_response( array() );
		}

		$yer_tutucu = implode( ',', array_fill( 0, count( $izinli ), '%d' ) );
		$satirlar   = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::rsvps() . " WHERE invitation_id IN ({$yer_tutucu}) ORDER BY created_at DESC", $izinli ) ); // phpcs:ignore
		return rest_ensure_response( $satirlar );
	}

	public static function delete_rsvp( $request ) {
		global $wpdb;

		$satir = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::rsvps() . ' WHERE id = %d', (int) $request['id'] ) ); // phpcs:ignore
		if ( ! $satir ) {
			return self::not_found();
		}
		if ( ! Sahra_Invitation::can_edit( $satir->invitation_id ) ) {
			return self::forbidden();
		}

		$wpdb->delete( Sahra_Tables::rsvps(), array( 'id' => (int) $request['id'] ), array( '%d' ) ); // phpcs:ignore
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/* ------------------------------------------------------------- dilek */

	public static function create_wish( $request ) {
		global $wpdb;

		$govde    = (array) $request->get_json_params();
		$davetiye = self::public_invitation( $govde['slug'] ?? '' );
		if ( ! $davetiye ) {
			return self::not_found();
		}

		$mesaj = sanitize_textarea_field( (string) ( $govde['message'] ?? '' ) );
		if ( '' === trim( $mesaj ) ) {
			return new WP_Error( 'sahra_bos', __( 'Mesaj boş olamaz', 'sahra-davetiye' ), array( 'status' => 400 ) );
		}

		$wpdb->insert( // phpcs:ignore
			Sahra_Tables::wishes(),
			array(
				'invitation_id' => $davetiye['id'],
				'name'          => sanitize_text_field( (string) ( $govde['name'] ?? '' ) ),
				'message'       => $mesaj,
				// Onaysız yayımlanmaz: dilek defteri açık bir yazma ucu.
				'approved'      => 0,
				'created_at'    => current_time( 'mysql', true ),
			),
			array( '%d', '%s', '%s', '%d', '%s' )
		);

		return new WP_REST_Response( array( 'ok' => true ), 201 );
	}

	public static function list_wishes( $request ) {
		global $wpdb;

		$id = (int) $request->get_param( 'invitationId' );
		if ( $id ) {
			if ( ! Sahra_Invitation::can_edit( $id ) ) {
				return self::forbidden();
			}
			return rest_ensure_response(
				$wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::wishes() . ' WHERE invitation_id = %d ORDER BY created_at DESC', $id ) ) // phpcs:ignore
			);
		}

		$izinli = self::owned_ids();
		if ( ! $izinli ) {
			return rest_ensure_response( array() );
		}

		$yer_tutucu = implode( ',', array_fill( 0, count( $izinli ), '%d' ) );
		return rest_ensure_response(
			$wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::wishes() . " WHERE invitation_id IN ({$yer_tutucu}) ORDER BY created_at DESC", $izinli ) ) // phpcs:ignore
		);
	}

	public static function approve_wish( $request ) {
		global $wpdb;

		$satir = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::wishes() . ' WHERE id = %d', (int) $request['id'] ) ); // phpcs:ignore
		if ( ! $satir ) {
			return self::not_found();
		}
		if ( ! Sahra_Invitation::can_edit( $satir->invitation_id ) ) {
			return self::forbidden();
		}

		$govde   = (array) $request->get_json_params();
		$onayli = ! array_key_exists( 'approved', $govde ) || filter_var( $govde['approved'], FILTER_VALIDATE_BOOLEAN );

		$wpdb->update( Sahra_Tables::wishes(), array( 'approved' => $onayli ? 1 : 0 ), array( 'id' => (int) $request['id'] ), array( '%d' ), array( '%d' ) ); // phpcs:ignore
		return rest_ensure_response( array( 'ok' => true, 'approved' => $onayli ) );
	}

	public static function delete_wish( $request ) {
		global $wpdb;

		$satir = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::wishes() . ' WHERE id = %d', (int) $request['id'] ) ); // phpcs:ignore
		if ( ! $satir ) {
			return self::not_found();
		}
		if ( ! Sahra_Invitation::can_edit( $satir->invitation_id ) ) {
			return self::forbidden();
		}

		$wpdb->delete( Sahra_Tables::wishes(), array( 'id' => (int) $request['id'] ), array( '%d' ) ); // phpcs:ignore
		return rest_ensure_response( array( 'ok' => true ) );
	}

	/* --------------------------------------------------------- fotoğraf */

	/**
	 * Masadaki QR'dan yükleme — oturum YOK.
	 *
	 * Misafirden hesap istemek, düğün salonunda çalışmayan bir akış. Buna
	 * karşılık uç yalnızca yayındaki bir davetiyeye yazabiliyor, tür ve
	 * boyut dosyanın kendisinden doğrulanıyor ve yüklenen dosya sitenin
	 * medya kütüphanesine hiç girmiyor.
	 */
	public static function upload_photo( $request ) {
		global $wpdb;

		$slug     = sanitize_title( (string) $request->get_param( 'slug' ) );
		$davetiye = self::public_invitation( $slug );
		if ( ! $davetiye ) {
			return self::not_found();
		}

		$dosyalar = $request->get_file_params();
		if ( empty( $dosyalar['file'] ) ) {
			return new WP_Error( 'sahra_dosya', __( 'Dosya alınamadı.', 'sahra-davetiye' ), array( 'status' => 400 ) );
		}

		$mime = Sahra_Storage::validate_upload( $dosyalar['file'], Sahra_Storage::IMAGE_TYPES );
		if ( is_wp_error( $mime ) ) {
			return $mime;
		}

		$ad     = Sahra_Storage::new_name( $mime );
		$sonuc  = Sahra_Storage::put( $dosyalar['file']['tmp_name'], $ad, $mime );
		if ( is_wp_error( $sonuc ) ) {
			return $sonuc;
		}

		$wpdb->insert( // phpcs:ignore
			Sahra_Tables::photos(),
			array(
				'invitation_id' => $davetiye['id'],
				'uploader_name' => sanitize_text_field( (string) $request->get_param( 'uploaderName' ) ),
				'note'          => sanitize_text_field( (string) $request->get_param( 'note' ) ),
				'storage'       => Sahra_Storage::driver() instanceof Sahra_Storage_Drive ? 'drive' : 'local',
				'file_id'       => $sonuc['id'],
				'mime_type'     => $mime,
				'size'          => (int) $dosyalar['file']['size'],
				'created_at'    => current_time( 'mysql', true ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%d', '%s' )
		);

		return new WP_REST_Response( array( 'ok' => true, 'id' => (int) $wpdb->insert_id ), 201 );
	}

	public static function list_photos( $request ) {
		global $wpdb;

		$id = (int) $request->get_param( 'invitationId' );
		if ( $id ) {
			if ( ! Sahra_Invitation::can_edit( $id ) ) {
				return self::forbidden();
			}
			$izinli = array( $id );
		} else {
			$izinli = self::owned_ids();
			if ( ! $izinli ) {
				return rest_ensure_response( array() );
			}
		}

		$yer_tutucu = implode( ',', array_fill( 0, count( $izinli ), '%d' ) );
		$satirlar   = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::photos() . " WHERE invitation_id IN ({$yer_tutucu}) ORDER BY created_at DESC", $izinli ) ); // phpcs:ignore

		foreach ( $satirlar as $satir ) {
			$satir->url = Sahra_Render::photo_url( (int) $satir->id );
		}

		return rest_ensure_response( $satirlar );
	}

	public static function delete_photo( $request ) {
		global $wpdb;

		$satir = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Sahra_Tables::photos() . ' WHERE id = %d', (int) $request['id'] ) ); // phpcs:ignore
		if ( ! $satir ) {
			return self::not_found();
		}
		if ( ! Sahra_Invitation::can_edit( $satir->invitation_id ) ) {
			return self::forbidden();
		}

		Sahra_Storage::delete( $satir->file_id );
		$wpdb->delete( Sahra_Tables::photos(), array( 'id' => (int) $satir->id ), array( '%d' ) ); // phpcs:ignore

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/** Çiftin kendi yüklediği görsel/ses — kapak, galeri, müzik. */
	public static function upload_media( $request ) {
		if ( ! current_user_can( 'sahra_upload_media' ) ) {
			return self::forbidden();
		}

		$dosyalar = $request->get_file_params();
		if ( empty( $dosyalar['file'] ) ) {
			return new WP_Error( 'sahra_dosya', __( 'Dosya alınamadı.', 'sahra-davetiye' ), array( 'status' => 400 ) );
		}

		$tur     = 'audio' === $request->get_param( 'kind' ) ? Sahra_Storage::AUDIO_TYPES : Sahra_Storage::IMAGE_TYPES;
		$mime    = Sahra_Storage::validate_upload( $dosyalar['file'], $tur );
		if ( is_wp_error( $mime ) ) {
			return $mime;
		}

		$ad    = Sahra_Storage::new_name( $mime );
		$sonuc = Sahra_Storage::put( $dosyalar['file']['tmp_name'], $ad, $mime );
		if ( is_wp_error( $sonuc ) ) {
			return $sonuc;
		}

		return new WP_REST_Response(
			array( 'url' => Sahra_Render::file_url( $sonuc['id'] ), 'id' => $sonuc['id'] ),
			201
		);
	}

	/** Oturumun düzenleyebildiği davetiye kimlikleri. */
	private static function owned_ids() {
		return array_map(
			static function ( $d ) {
				return (int) $d['id'];
			},
			Sahra_Invitation::all_for_user()
		);
	}
}
