/**
 * Panel davranışı.
 *
 * Next sürümündeki sihirbaz, QR penceresi, görsel yükleyici ve ses
 * önizlemesinin karşılığı. Çerçeve yok: WordPress paneline React sokmak,
 * tek bir formun uğruna sayfaya yüzlerce kilobayt eklemek olurdu.
 *
 * @package SahraDavetiye
 */
( function () {
	'use strict';

	var panel = window.SahraPanel || {};

	/* ------------------------------------------------------------ kopyala */

	document.addEventListener( 'click', function ( e ) {
		var dugme = e.target.closest( '.sahra-copy' );
		if ( ! dugme ) {
			return;
		}

		e.preventDefault();

		var metin = dugme.getAttribute( 'data-copy' ) || '';
		var eski = dugme.textContent;

		function bitti() {
			dugme.textContent = 'Kopyalandı';
			window.setTimeout( function () {
				dugme.textContent = eski;
			}, 1800 );
		}

		if ( navigator.clipboard ) {
			navigator.clipboard.writeText( metin ).then( bitti ).catch( function () {
				// Pano izni yoksa (http, eski tarayıcı) metin elle seçilebilsin.
				window.prompt( 'Kopyalayın:', metin );
			} );
		} else {
			window.prompt( 'Kopyalayın:', metin );
		}
	} );

	/* ----------------------------------------------------------- sihirbaz */

	function sihirbaz() {
		var form = document.getElementById( 'sahra-sihirbaz' );
		if ( ! form ) {
			return;
		}

		var adimlar = Array.prototype.slice.call( form.querySelectorAll( '.sahra-adim' ) );
		var cipler = Array.prototype.slice.call( document.querySelectorAll( '.sahra-cip[data-adim]' ) );
		var ilerleme = document.querySelector( '.sahra-ilerleme span' );
		var geri = document.getElementById( 'sahra-geri' );
		var ileri = document.getElementById( 'sahra-ileri' );
		var bitir = document.getElementById( 'sahra-bitir' );
		var sira = 0;

		function goster( i ) {
			sira = Math.max( 0, Math.min( adimlar.length - 1, i ) );

			adimlar.forEach( function ( el, n ) {
				el.hidden = n !== sira;
			} );
			cipler.forEach( function ( c, n ) {
				c.setAttribute( 'aria-current', n === sira ? 'true' : 'false' );
			} );

			if ( ilerleme ) {
				ilerleme.style.width = ( ( sira + 1 ) / adimlar.length ) * 100 + '%';
			}

			geri.hidden = 0 === sira;
			ileri.hidden = sira === adimlar.length - 1;
			bitir.hidden = sira !== adimlar.length - 1;

			// Adım değişince başa dön: uzun adımlarda kullanıcı ortada kalıyordu.
			window.scrollTo( { top: 0, behavior: 'smooth' } );
		}

		cipler.forEach( function ( c ) {
			c.addEventListener( 'click', function () {
				goster( parseInt( c.getAttribute( 'data-adim' ), 10 ) );
			} );
		} );

		geri.addEventListener( 'click', function () {
			goster( sira - 1 );
		} );

		ileri.addEventListener( 'click', function () {
			goster( sira + 1 );
		} );

		/*
		 * Enter tuşu formu göndermesin.
		 *
		 * Sihirbazın ortasındaki bir metin alanında Enter'a basmak bütün
		 * davetiyeyi kaydedip ilk adıma döndürüyordu; kullanıcı hem
		 * beklemediği bir kaydetme yaşıyor hem de yerini kaybediyordu.
		 */
		form.addEventListener( 'keydown', function ( e ) {
			if ( 'Enter' === e.key && 'TEXTAREA' !== e.target.tagName && 'SUBMIT' !== ( e.target.type || '' ).toUpperCase() ) {
				e.preventDefault();
			}
		} );

		goster( 0 );
	}

	/* -------------------------------------------------- canlı önizleme */

	function onizleme() {
		var baslik = document.getElementById( 'sahra-baslik-onizleme' );
		var slugOn = document.getElementById( 'sahra-slug-onizleme' );
		var slug = document.getElementById( 'f-slug' );
		var damat = document.getElementById( 'f-groomname' );
		var gelin = document.getElementById( 'f-bridename' );

		if ( ! baslik || ! damat || ! gelin ) {
			return;
		}

		function bagla() {
			var secili = document.querySelector( 'input[name="sahra[conjunction]"]:checked' );
			return secili ? secili.value : '&';
		}

		/** "Ahmet Yılmaz" → "ahmet-yilmaz"; tire KORUNUR. */
		function slugla( metin ) {
			var harita = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' };
			return metin
				.toLowerCase()
				.replace( /[çğıİöşü]/g, function ( h ) { return harita[ h ] || h; } )
				.replace( /[^a-z0-9-]+/g, '-' )
				.replace( /-+/g, '-' )
				.replace( /^-|-$/g, '' );
		}

		/* Bağlantı adresindeki ay adları — PHP'deki AY_SLUG ile birebir. */
		var AYLAR = [ 'ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
			'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik' ];

		/** "31-eylul-2026-zehra-ahmet" — PHP'deki build_slug'ın karşılığı. */
		function otoSlug( g, d ) {
			var tarih = document.getElementById( 'f-weddingdate' );
			var parca = [];
			var m = tarih && tarih.value ? tarih.value.match( /^(\d{4})-(\d{2})-(\d{2})$/ ) : null;

			if ( m && AYLAR[ parseInt( m[ 2 ], 10 ) - 1 ] ) {
				parca.push( String( parseInt( m[ 3 ], 10 ) ) );
				parca.push( AYLAR[ parseInt( m[ 2 ], 10 ) - 1 ] );
				parca.push( m[ 1 ] );
			}
			parca.push( g, d );
			return slugla( parca.join( '-' ) );
		}

		/*
		 * Ad yazımı ANINDA düzelmiyor: kullanıcı "meh" yazarken her harfte
		 * alanı yeniden yazmak imleci zıplatıyor. Yalnızca ÖNİZLEME
		 * düzeltilmiş hâli gösteriyor; alanın kendisi kaydederken (PHP)
		 * düzeliyor.
		 */
		function duzelt( metin ) {
			return metin.replace( /\S+/g, function ( sozcuk ) {
				return sozcuk.charAt( 0 ).toLocaleUpperCase( 'tr' ) +
					sozcuk.slice( 1 ).toLocaleLowerCase( 'tr' );
			} );
		}

		function guncelle() {
			var g = duzelt( gelin.value ) || 'Gelin';
			var d = duzelt( damat.value ) || 'Damat';

			// Gelin solda, damat sağda.
			baslik.textContent = g + ' ' + bagla() + ' ' + d;

			if ( slugOn ) {
				slugOn.textContent = slug && slug.value ? slugla( slug.value ) : otoSlug( g, d );
			}

			muhurCiz();
			mektupCiz();
		}

		/* ── Mühür önizlemesi ───────────────────────────────────────────
		   Davetiyedeki SVG mührün küçük kopyası: balmumu disk, çentikler
		   ve monogram. Renkler seçili mühür seçeneğinin data'sından. */
		function muhurCiz() {
			var kutu = document.getElementById( 'sahra-muhur-onizleme' );
			if ( ! kutu ) {
				return;
			}

			var secili = document.querySelector( 'input[name="sahra[sealType]"]:checked' );
			var ornek = secili ? secili.closest( '.secenek' ).querySelector( '.ornek' ) : null;
			var renkler = ornek ? ( ornek.getAttribute( 'style' ) || '' ).match( /#[0-9a-f]{3,8}|rgba?\([^)]+\)/gi ) : null;
			if ( ! renkler || renkler.length < 3 ) {
				renkler = [ '#F5E6B8', '#C9A84C', '#6B4F1A' ];
			}

			var mono = document.getElementById( 'f-sealmonogram' );
			var yazi = mono && mono.value ? mono.value : baslikHarfleri();

			var centik = '';
			for ( var i = 0; i < 24; i++ ) {
				var a = ( i / 24 ) * Math.PI * 2;
				centik += '<circle cx="' + ( 60 + Math.cos( a ) * 46 ).toFixed( 1 ) +
					'" cy="' + ( 60 + Math.sin( a ) * 46 ).toFixed( 1 ) +
					'" r="3.4" fill="' + renkler[ 2 ] + '" opacity="0.55"/>';
			}

			kutu.innerHTML =
				'<svg viewBox="0 0 120 120" role="img" aria-label="Mühür önizlemesi">' +
				'<defs><radialGradient id="sahraMuhur" cx="35%" cy="30%">' +
				'<stop offset="0%" stop-color="' + renkler[ 0 ] + '"/>' +
				'<stop offset="55%" stop-color="' + renkler[ 1 ] + '"/>' +
				'<stop offset="100%" stop-color="' + renkler[ 2 ] + '"/>' +
				'</radialGradient></defs>' +
				centik +
				'<circle cx="60" cy="60" r="44" fill="url(#sahraMuhur)"/>' +
				'<circle cx="60" cy="60" r="36" fill="none" stroke="' + renkler[ 0 ] + '" stroke-opacity="0.55"/>' +
				'<text x="60" y="60" text-anchor="middle" dominant-baseline="central" ' +
				'font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="26" ' +
				'fill="' + renkler[ 0 ] + '">' + yaziKac( yazi ) + '</text>' +
				'</svg>';
		}

		function baslikHarfleri() {
			var g = duzelt( gelin.value ) || 'G';
			var d = duzelt( damat.value ) || 'D';
			return g.charAt( 0 ) + ' ' + bagla() + ' ' + d.charAt( 0 );
		}

		function yaziKac( metin ) {
			return String( metin ).replace( /[&<>"]/g, function ( c ) {
				return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ c ];
			} );
		}

		/* ── Mektup tasarımı önizlemesi ────────────────────────────────── */
		function mektupCiz() {
			var kutu = document.getElementById( 'sahra-mektup-onizleme' );
			if ( ! kutu ) {
				return;
			}

			var secili = document.querySelector( 'input[name="sahra[invitationDesign]"]:checked' );
			kutu.className = 'sahra-mektup-onizleme ' + ( secili ? secili.value : 'ottoman' );

			var metin = document.getElementById( 'f-invitationtext' );
			var mono = kutu.querySelector( '.mo-monogram' );
			var ad = kutu.querySelector( '.mo-ad' );
			var gov = kutu.querySelector( '.mo-metin' );

			if ( mono ) { mono.textContent = baslikHarfleri(); }
			if ( ad ) { ad.textContent = baslik.textContent; }
			if ( gov && metin ) {
				gov.textContent = metin.value || 'Davet metniniz burada görünecek.';
			}
		}

		document.addEventListener( 'input', guncelle );
		document.addEventListener( 'change', guncelle );
		guncelle();
	}

	/* ------------------------------------------------------------- menü */

	/*
	 * Menü seçilince içeriği metin alanına düşer; çift oradan istediği
	 * gibi değiştirir. Seçim değişince ÜSTÜNE YAZILIR — ama yalnızca alan
	 * boşsa ya da kullanıcı onaylarsa: elle yazılmış bir menüyü sessizce
	 * silmek, kaybedilen emek demek.
	 */
	( function () {
		var sec = document.querySelector( '.sahra-menu-sec' );
		var kutu = document.getElementById( 'f-menu-icerik' );
		if ( ! sec || ! kutu ) {
			return;
		}

		function seciliIcerik() {
			var opt = sec.options[ sec.selectedIndex ];
			return opt ? ( opt.getAttribute( 'data-icerik' ) || '' ) : '';
		}

		sec.addEventListener( 'change', function () {
			var yeni = seciliIcerik();
			if ( ! kutu.value.trim() || window.confirm( 'Menü içeriği seçtiğiniz menüyle değiştirilsin mi? Yazdıklarınız kaybolur.' ) ) {
				kutu.value = yeni;
			}
		} );

		var sifirla = document.querySelector( '.sahra-menu-sifirla' );
		if ( sifirla ) {
			sifirla.addEventListener( 'click', function () {
				kutu.value = seciliIcerik();
			} );
		}
	}() );

	/* ------------------------------------------------------- hazır metin */

	document.addEventListener( 'click', function ( e ) {
		var dugme = e.target.closest( '.sahra-hazir-metin, .sahra-varsayilan, .sahra-sec-ses' );
		if ( ! dugme ) {
			return;
		}

		e.preventDefault();

		var alan = document.getElementById( dugme.getAttribute( 'data-hedef' ) );
		if ( ! alan ) {
			return;
		}

		alan.value = dugme.getAttribute( 'data-metin' ) || dugme.getAttribute( 'data-adres' ) || '';
		alan.dispatchEvent( new Event( 'input', { bubbles: true } ) );
	} );

	/* ------------------------------------------------------- ses dinleme */

	var calan = null;

	document.addEventListener( 'click', function ( e ) {
		var dugme = e.target.closest( '.sahra-dinle' );
		if ( ! dugme ) {
			return;
		}

		e.preventDefault();

		var adres = dugme.getAttribute( 'data-adres' );
		if ( ! adres ) {
			var alan = document.getElementById( dugme.getAttribute( 'data-alan' ) );
			adres = alan ? alan.value : '';
		}

		if ( ! adres ) {
			return;
		}

		// Aynı düğmeye ikinci basış durdurur; başka bir parça açılınca
		// öncekini susturmak gerekiyor, yoksa üst üste biniyorlar.
		if ( calan && calan.dugme === dugme ) {
			calan.ses.pause();
			dugme.textContent = dugme.dataset.eski || 'Dinle';
			calan = null;
			return;
		}

		if ( calan ) {
			calan.ses.pause();
			calan.dugme.textContent = calan.dugme.dataset.eski || 'Dinle';
		}

		var ses = new Audio( adres );
		dugme.dataset.eski = dugme.textContent;
		dugme.textContent = 'Durdur';

		ses.play().catch( function () {
			dugme.textContent = dugme.dataset.eski;
			calan = null;
		} );

		ses.addEventListener( 'ended', function () {
			dugme.textContent = dugme.dataset.eski;
			calan = null;
		} );

		calan = { ses: ses, dugme: dugme };
	} );

	/* ----------------------------------------------------- medya kütüphanesi */

	document.addEventListener( 'click', function ( e ) {
		var dugme = e.target.closest( '.sahra-media' );
		if ( ! dugme || ! window.wp || ! window.wp.media ) {
			return;
		}

		e.preventDefault();

		var alan = document.getElementById( dugme.getAttribute( 'data-hedef' ) );
		var secici = window.wp.media( { multiple: false } );

		secici.on( 'select', function () {
			var secim = secici.state().get( 'selection' ).first().toJSON();
			alan.value = secim.url;
			alan.dispatchEvent( new Event( 'input', { bubbles: true } ) );
		} );

		secici.open();
	} );

	/* --------------------------------------------------- doğrudan yükleme */

	/*
	 * Dosyalar eklentinin kendi ucuna gidiyor, medya kütüphanesine değil.
	 *
	 * Böylece görseller de misafir fotoğrafları gibi seçilen depoya
	 * (yerel ya da Drive) düşüyor ve WordPress'in medya kütüphanesi
	 * düğün fotoğraflarıyla dolmuyor.
	 */
	document.addEventListener( 'click', function ( e ) {
		var dugme = e.target.closest( '.sahra-yukle' );
		if ( ! dugme ) {
			return;
		}

		e.preventDefault();

		var coklu = '1' === dugme.getAttribute( 'data-coklu' );
		var tur = dugme.getAttribute( 'data-tur' ) || 'image';
		var alan = document.getElementById( dugme.getAttribute( 'data-hedef' ) );
		var durum = dugme.parentNode.querySelector( '.sahra-durum' );

		var girdi = document.createElement( 'input' );
		girdi.type = 'file';
		girdi.accept = 'audio' === tur ? 'audio/*' : 'image/*';
		girdi.multiple = coklu;

		girdi.addEventListener( 'change', function () {
			var dosyalar = Array.prototype.slice.call( girdi.files );
			if ( ! dosyalar.length ) {
				return;
			}

			var kalan = dosyalar.length;
			durum.classList.remove( 'hata' );
			durum.textContent = kalan + ' dosya yükleniyor…';
			dugme.disabled = true;

			var sira = Promise.resolve();

			dosyalar.forEach( function ( dosya ) {
				sira = sira.then( function () {
					var govde = new FormData();
					govde.append( 'file', dosya );
					govde.append( 'kind', tur );

					return fetch( panel.rest + 'media', {
						method: 'POST',
						headers: { 'X-WP-Nonce': panel.nonce },
						body: govde
					} )
						.then( function ( r ) {
							return r.json().then( function ( j ) {
								if ( ! r.ok ) {
									throw new Error( j.message || 'Yüklenemedi' );
								}
								return j;
							} );
						} )
						.then( function ( j ) {
							if ( coklu ) {
								alan.value = ( alan.value ? alan.value.replace( /\s+$/, '' ) + '\n' : '' ) + j.url;
							} else {
								alan.value = j.url;
							}
							alan.dispatchEvent( new Event( 'input', { bubbles: true } ) );
							kalan--;
							durum.textContent = kalan ? kalan + ' dosya kaldı…' : 'Yüklendi ✓';
						} )
						.catch( function ( err ) {
							durum.classList.add( 'hata' );
							durum.textContent = err.message;
						} );
				} );
			} );

			sira.then( function () {
				dugme.disabled = false;
			} );
		} );

		girdi.click();
	} );

	/* ---------------------------------------------------------- önizleme */

	function gorselOnizleme() {
		Array.prototype.forEach.call( document.querySelectorAll( '.sahra-onizleme' ), function ( kutu ) {
			var alan = document.getElementById( kutu.getAttribute( 'data-kaynak' ) );
			if ( ! alan ) {
				return;
			}

			function ciz() {
				var adresler = ( 'TEXTAREA' === alan.tagName ? alan.value.split( /\r?\n/ ) : [ alan.value ] )
					.map( function ( s ) { return s.trim(); } )
					.filter( Boolean );

				kutu.innerHTML = '';

				adresler.forEach( function ( adres, i ) {
					var f = document.createElement( 'figure' );
					var img = document.createElement( 'img' );
					img.src = adres;
					img.alt = '';
					img.loading = 'lazy';

					var sil = document.createElement( 'button' );
					sil.type = 'button';
					sil.textContent = '×';
					sil.setAttribute( 'aria-label', 'Kaldır' );
					sil.addEventListener( 'click', function () {
						var kalanlar = adresler.slice();
						kalanlar.splice( i, 1 );
						alan.value = 'TEXTAREA' === alan.tagName ? kalanlar.join( '\n' ) : '';
						alan.dispatchEvent( new Event( 'input', { bubbles: true } ) );
					} );

					f.appendChild( img );
					f.appendChild( sil );
					kutu.appendChild( f );
				} );
			}

			alan.addEventListener( 'input', ciz );
			ciz();
		} );
	}

	/* ---------------------------------------------------------------- QR */

	function qr() {
		var modal = document.getElementById( 'sahra-qr-modal' );
		if ( ! modal || ! window.qrcode ) {
			return;
		}

		var kutu = document.getElementById( 'sahra-qr-kutu' );
		var baslik = document.getElementById( 'sahra-qr-baslik' );
		var adresEl = document.getElementById( 'sahra-qr-adres' );
		var kopyala = document.getElementById( 'sahra-qr-kopyala' );
		var indir = document.getElementById( 'sahra-qr-indir' );
		var secim = modal.querySelectorAll( '.sahra-qr-secim .sahra-cip' );
		var adresler = { davet: '', yukle: '' };
		var ad = '';
		var etkin = 'davet';

		function ciz() {
			var adres = adresler[ etkin ];

			// Tip 0 = boyutu içeriğe göre seç; 'M' düzeltme düzeyi baskıda
			// lekelenen QR'ların okunmasına yetiyor.
			var kod = window.qrcode( 0, 'M' );
			kod.addData( adres );
			kod.make();

			kutu.innerHTML = kod.createImgTag( 6, 0 );
			adresEl.textContent = adres;
			kopyala.setAttribute( 'data-copy', adres );

			Array.prototype.forEach.call( secim, function ( c ) {
				c.setAttribute( 'aria-current', c.getAttribute( 'data-tur' ) === etkin ? 'true' : 'false' );
			} );
		}

		document.addEventListener( 'click', function ( e ) {
			var dugme = e.target.closest( '.sahra-qr' );
			if ( ! dugme ) {
				return;
			}

			e.preventDefault();
			adresler.davet = dugme.getAttribute( 'data-davet' );
			adresler.yukle = dugme.getAttribute( 'data-yukle' );
			ad = dugme.getAttribute( 'data-ad' );
			baslik.textContent = ad;
			etkin = 'davet';
			modal.hidden = false;
			ciz();
		} );

		Array.prototype.forEach.call( secim, function ( c ) {
			c.addEventListener( 'click', function () {
				etkin = c.getAttribute( 'data-tur' );
				ciz();
			} );
		} );

		modal.querySelector( '.kapat' ).addEventListener( 'click', function () {
			modal.hidden = true;
		} );

		modal.addEventListener( 'click', function ( e ) {
			if ( e.target === modal ) {
				modal.hidden = true;
			}
		} );

		document.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key ) {
				modal.hidden = true;
			}
		} );

		/*
		 * PNG indirme: img etiketi doğrudan indirilemediği için tuvale
		 * çizilip veri adresine dönüştürülüyor. Masaya basılacak kod
		 * ekran görüntüsüyle değil, temiz bir dosyayla çıkmalı.
		 */
		indir.addEventListener( 'click', function () {
			var img = kutu.querySelector( 'img' );
			if ( ! img ) {
				return;
			}

			var olcek = 8;
			var tuval = document.createElement( 'canvas' );
			tuval.width = img.naturalWidth * olcek;
			tuval.height = img.naturalHeight * olcek;

			var ctx = tuval.getContext( '2d' );
			ctx.imageSmoothingEnabled = false;
			ctx.fillStyle = '#fff';
			ctx.fillRect( 0, 0, tuval.width, tuval.height );
			ctx.drawImage( img, 0, 0, tuval.width, tuval.height );

			var bag = document.createElement( 'a' );
			bag.href = tuval.toDataURL( 'image/png' );
			bag.download = ( ad || 'qr' ).replace( /\s+/g, '-' ).toLowerCase() + '-' + etkin + '.png';
			bag.click();
		} );
	}

	/* -------------------------------------------------------------- dilek */

	function istek( yol, yontem, govde ) {
		return fetch( panel.rest + yol, {
			method: yontem,
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': panel.nonce
			},
			body: govde ? JSON.stringify( govde ) : undefined
		} ).then( function ( r ) {
			if ( ! r.ok ) {
				throw new Error( 'İşlem başarısız' );
			}
			return r.json();
		} );
	}

	document.addEventListener( 'click', function ( e ) {
		var satir = e.target.closest( '[data-wish]' );
		if ( ! satir ) {
			return;
		}

		var id = satir.getAttribute( 'data-wish' );

		if ( e.target.closest( '.sahra-wish-toggle' ) ) {
			e.preventDefault();
			var onayla = '1' === e.target.getAttribute( 'data-approve' );
			istek( 'wishes/' + id, 'PUT', { approved: onayla } ).then( function () {
				window.location.reload();
			} );
		}

		if ( e.target.closest( '.sahra-wish-delete' ) ) {
			e.preventDefault();
			if ( ! window.confirm( 'Dilek silinsin mi?' ) ) {
				return;
			}
			istek( 'wishes/' + id, 'DELETE' ).then( function () {
				satir.parentNode.removeChild( satir );
			} );
		}
	} );

	sihirbaz();
	onizleme();
	gorselOnizleme();
	qr();
} )();
