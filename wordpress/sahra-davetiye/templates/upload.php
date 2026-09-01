<?php
/**
 * Misafir fotoğraf yükleme — masadaki QR kodun açtığı sayfa.
 *
 * Giriş GEREKTİRMEZ ve bilerek çıplaktır: misafir yalnızca fotoğraf
 * yükleyebilir, davetiyeye ya da başka bir veriye buradan erişemez.
 * Düğün salonunda hesap açtırmak işleyen bir akış değil.
 *
 * @var array $davetiye
 * @package SahraDavetiye
 */

defined( 'ABSPATH' ) || exit;

$d       = $davetiye;
$conj    = $d['conjunction'] ? $d['conjunction'] : '&';
$isimler = trim( $d['groomName'] . ' ' . $conj . ' ' . $d['brideName'] );
?>
<!DOCTYPE html>
<html lang="tr" class="sahra-html no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex, nofollow">
	<title><?php echo esc_html( $isimler . ' — Fotoğraf Yükle' ); ?></title>

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@200;300;400&display=swap&subset=latin,latin-ext" rel="stylesheet">
	<link rel="stylesheet" href="<?php echo esc_url( SAHRA_URL . 'assets/css/sahra.css?v=' . SAHRA_VERSION ); ?>">
	<style><?php echo '.sahra-page{' . esc_html( Sahra_Theme::style( $d['theme'] ) ) . '}'; ?></style>
</head>
<body class="sahra-page upload-page">

<div class="grain" aria-hidden="true"></div>

<main class="upload-card">
	<p class="t-label" style="color:var(--c-gold)">Düğün Albümü</p>
	<h1 class="t-display" style="margin-top:var(--sp-sm)"><?php echo esc_html( $isimler ); ?></h1>
	<p class="t-body measure" style="margin:var(--sp-sm) auto 0;color:var(--c-on-dark-soft)">
		Çektiğiniz fotoğrafları buradan yükleyebilirsiniz. Yalnızca çift görecek.
	</p>

	<form id="upload-form" class="dropzone">
		<div class="field-row">
			<label class="field-label" for="up-name">Adınız (İsteğe Bağlı)</label>
			<input class="field" id="up-name" type="text" placeholder="Adınız">
		</div>

		<div class="field-row">
			<label class="field-label" for="up-note">Notunuz (İsteğe Bağlı)</label>
			<input class="field" id="up-note" type="text" placeholder="Bir not bırakın">
		</div>

		<div class="field-row">
			<label class="field-label" for="up-file">Fotoğraflar</label>
			<?php /* capture: telefonda doğrudan kameraya erişir. */ ?>
			<input class="field" id="up-file" type="file" accept="image/*" multiple capture="environment">
		</div>

		<p class="t-body" style="color:var(--c-on-dark-faint)">Fotoğraf başına en fazla 25 MB.</p>

		<p class="form-note" role="alert"></p>

		<button type="submit" class="cta" style="margin-top:var(--sp-sm)">Yükle</button>
	</form>

	<div class="upload-list" id="upload-list" role="status" aria-live="polite"></div>
</main>

<script>
( function () {
	document.documentElement.classList.remove( 'no-js' );

	var rest = <?php echo wp_json_encode( esc_url_raw( rest_url( Sahra_Rest::NS . '/photos' ) ) ); ?>;
	var slug = <?php echo wp_json_encode( $d['slug'] ); ?>;

	var form = document.getElementById( 'upload-form' );
	var girdi = document.getElementById( 'up-file' );
	var liste = document.getElementById( 'upload-list' );
	var not = form.querySelector( '.form-note' );
	var gonder = form.querySelector( '[type=submit]' );

	function satir( ad ) {
		var el = document.createElement( 'div' );
		el.className = 'upload-row';
		el.innerHTML = '<span></span><span class="durum">Bekliyor</span>';
		el.firstChild.textContent = ad;
		liste.appendChild( el );
		return el;
	}

	/*
	 * Fotoğraflar TEK TEK gönderiliyor.
	 *
	 * Hepsini tek istekte toplamak, düğün salonunun zayıf bağlantısında
	 * tek bir kopukluğun bütün seçimi çöpe atması demekti; ayrıca
	 * sunucunun istek gövdesi sınırına çok daha çabuk çarpılıyordu.
	 */
	function yukle( dosya, el ) {
		var govde = new FormData();
		govde.append( 'file', dosya );
		govde.append( 'slug', slug );
		govde.append( 'uploaderName', document.getElementById( 'up-name' ).value );
		govde.append( 'note', document.getElementById( 'up-note' ).value );

		el.querySelector( '.durum' ).textContent = 'Yükleniyor…';

		return fetch( rest, { method: 'POST', body: govde } )
			.then( function ( r ) {
				return r.json().then( function ( j ) {
					if ( ! r.ok ) {
						throw new Error( j.message || 'Yüklenemedi' );
					}
					return j;
				} );
			} )
			.then( function () {
				el.querySelector( '.durum' ).textContent = 'Yüklendi ✓';
			} )
			.catch( function ( err ) {
				var durum = el.querySelector( '.durum' );
				durum.textContent = err.message;
				durum.classList.add( 'hata' );
			} );
	}

	form.addEventListener( 'submit', function ( e ) {
		e.preventDefault();
		not.textContent = '';

		var dosyalar = Array.prototype.slice.call( girdi.files );
		if ( ! dosyalar.length ) {
			not.textContent = 'Önce fotoğraf seçin.';
			return;
		}

		gonder.disabled = true;
		liste.innerHTML = '';

		var sira = Promise.resolve();
		dosyalar.forEach( function ( dosya ) {
			var el = satir( dosya.name );
			sira = sira.then( function () {
				return yukle( dosya, el );
			} );
		} );

		sira.then( function () {
			gonder.disabled = false;
			girdi.value = '';
		} );
	} );
} )();
</script>
</body>
</html>
