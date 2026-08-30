/**
 * Davetiye — istemci davranışı.
 *
 * Next sürümünde bu işi Framer Motion yapıyordu. Burada bağımlılık yok:
 * beliren bölümler, geri sayım, perde, galeri ve formlar düz JS.
 *
 * @package SahraDavetiye
 */
( function () {
	'use strict';

	document.documentElement.classList.remove( 'no-js' );

	var kok = document.querySelector( '.sahra-page' );
	if ( ! kok ) {
		return;
	}

	var veri = window.SahraVeri || {};

	/* ------------------------------------------------------------ belirme */

	/*
	 * Bölümler kaydırıldıkça belirir.
	 *
	 * Ölçüt bilerek "şu anda görünür mü" DEĞİL, "üst kenarı ekranın altını
	 * geçti mi": hızlı kaydırmada ya da bir bağlantıyla aşağı atlayıp geri
	 * dönüldüğünde IntersectionObserver aradaki bölümleri hiç görmeyebiliyor
	 * ve o bölümler kalıcı olarak görünmez kalıyordu. Bu ölçütle bir kez
	 * geçilen her şey açılır ve bir daha kapanmaz.
	 */
	function belirmeyiKur() {
		var hedefler = Array.prototype.slice.call( kok.querySelectorAll( '.reveal' ) );
		if ( ! hedefler.length ) {
			return;
		}

		function tara() {
			var alt = window.innerHeight;
			hedefler = hedefler.filter( function ( el ) {
				var kutu = el.getBoundingClientRect();
				if ( kutu.top < alt - 60 ) {
					el.classList.add( 'is-in' );
					return false;
				}
				return true;
			} );

			if ( ! hedefler.length ) {
				window.removeEventListener( 'scroll', planla );
				window.removeEventListener( 'resize', planla );
			}
		}

		var bekleyen = false;
		function planla() {
			if ( bekleyen ) {
				return;
			}
			bekleyen = true;
			window.requestAnimationFrame( function () {
				bekleyen = false;
				tara();
			} );
		}

		window.addEventListener( 'scroll', planla, { passive: true } );
		window.addEventListener( 'resize', planla );
		tara();
	}

	/* --------------------------------------------------- kaydırma çubuğu */

	function ilerlemeCubugu() {
		var cubuk = kok.querySelector( '.scroll-progress' );
		if ( ! cubuk ) {
			return;
		}

		function guncelle() {
			var toplam = document.body.scrollHeight - window.innerHeight;
			var oran = toplam > 0 ? window.scrollY / toplam : 0;
			cubuk.style.transform = 'scaleX(' + Math.min( 1, Math.max( 0, oran ) ) + ')';
		}

		window.addEventListener( 'scroll', guncelle, { passive: true } );
		window.addEventListener( 'resize', guncelle );
		guncelle();
	}

	/* --------------------------------------------------------- geri sayım */

	function geriSayim() {
		var kutu = kok.querySelector( '[data-countdown]' );
		if ( ! kutu ) {
			return;
		}

		var hedef = new Date( kutu.getAttribute( 'data-countdown' ) ).getTime();
		if ( isNaN( hedef ) ) {
			return;
		}

		var alanlar = {
			gun: kutu.querySelector( '[data-gun]' ),
			saat: kutu.querySelector( '[data-saat]' ),
			dakika: kutu.querySelector( '[data-dakika]' ),
			saniye: kutu.querySelector( '[data-saniye]' )
		};

		function iki( n ) {
			return n < 10 ? '0' + n : String( n );
		}

		function tik() {
			var kalan = Math.max( 0, hedef - Date.now() );
			var saniye = Math.floor( kalan / 1000 );

			if ( alanlar.gun ) {
				alanlar.gun.textContent = String( Math.floor( saniye / 86400 ) );
			}
			if ( alanlar.saat ) {
				alanlar.saat.textContent = iki( Math.floor( saniye / 3600 ) % 24 );
			}
			if ( alanlar.dakika ) {
				alanlar.dakika.textContent = iki( Math.floor( saniye / 60 ) % 60 );
			}
			if ( alanlar.saniye ) {
				alanlar.saniye.textContent = iki( saniye % 60 );
			}
		}

		tik();
		window.setInterval( tik, 1000 );
	}

	/* -------------------------------------------------------------- perde */

	function perde() {
		var perdeEl = kok.querySelector( '.curtain' );
		if ( ! perdeEl ) {
			baslatMuzik( false );
			return;
		}

		var muhur = perdeEl.querySelector( '.seal-button' );
		var gec = perdeEl.querySelector( '.skip' );
		var acildi = false;

		function ac( sesli ) {
			if ( acildi ) {
				return;
			}
			acildi = true;

			perdeEl.classList.add( 'is-cracking' );
			if ( sesli ) {
				cal( perdeEl.getAttribute( 'data-seal-sound' ) );
			}

			window.setTimeout( function () {
				perdeEl.classList.add( 'is-open' );
				document.body.style.overflow = '';
			}, 600 );

			window.setTimeout( function () {
				perdeEl.parentNode && perdeEl.parentNode.removeChild( perdeEl );
				/*
				 * Müzik ancak buradan başlatılabilir: tarayıcılar sesi
				 * yalnızca gerçek bir dokunuş/tıklamadan sonra açıyor.
				 * Sayfa yüklenirken başlatmayı denemek "Tarayıcı sesi
				 * engelledi" uyarısından başka bir şey üretmiyordu.
				 */
				baslatMuzik( sesli );
			}, 2600 );
		}

		document.body.style.overflow = 'hidden';

		muhur && muhur.addEventListener( 'click', function () {
			ac( true );
		} );

		gec && gec.addEventListener( 'click', function () {
			ac( false );
		} );

		document.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key ) {
				ac( false );
			}
		} );
	}

	function cal( src ) {
		if ( ! src ) {
			return;
		}
		try {
			var ses = new Audio( src );
			ses.volume = 0.6;
			ses.play().catch( function () {} );
		} catch ( e ) {}
	}

	/* -------------------------------------------------------------- müzik */

	var muzik = null;

	function baslatMuzik( otomatik ) {
		var dugme = kok.querySelector( '.music-toggle' );
		if ( ! dugme ) {
			return;
		}

		var src = dugme.getAttribute( 'data-src' );
		if ( ! src ) {
			dugme.style.display = 'none';
			return;
		}

		muzik = new Audio( src );
		muzik.loop = true;
		muzik.volume = Math.min( 1, Math.max( 0, parseInt( dugme.getAttribute( 'data-volume' ) || '40', 10 ) / 100 ) );

		function isaretle( caliyor ) {
			dugme.setAttribute( 'aria-pressed', caliyor ? 'true' : 'false' );
			dugme.setAttribute( 'aria-label', caliyor ? 'Müziği durdur' : 'Müziği çal' );
		}

		if ( otomatik ) {
			muzik.play().then( function () {
				isaretle( true );
			} ).catch( function () {
				isaretle( false );
			} );
		} else {
			isaretle( false );
		}

		dugme.addEventListener( 'click', function () {
			if ( muzik.paused ) {
				muzik.play().then( function () {
					isaretle( true );
				} ).catch( function () {
					isaretle( false );
				} );
			} else {
				muzik.pause();
				isaretle( false );
			}
		} );
	}

	/* ------------------------------------------------------------- galeri */

	function galeri() {
		var kutular = kok.querySelectorAll( '.gallery button' );
		var kutu = kok.querySelector( '.lightbox' );
		if ( ! kutular.length || ! kutu ) {
			return;
		}

		var gorsel = kutu.querySelector( 'img' );
		var adresler = Array.prototype.map.call( kutular, function ( b ) {
			return b.getAttribute( 'data-full' );
		} );
		var sira = 0;

		function goster( i ) {
			sira = ( i + adresler.length ) % adresler.length;
			gorsel.src = adresler[ sira ];
			kutu.classList.add( 'is-open' );
			document.body.style.overflow = 'hidden';
		}

		function kapat() {
			kutu.classList.remove( 'is-open' );
			document.body.style.overflow = '';
		}

		Array.prototype.forEach.call( kutular, function ( b, i ) {
			b.addEventListener( 'click', function () {
				goster( i );
			} );
		} );

		kutu.querySelector( '.close' ).addEventListener( 'click', kapat );
		kutu.querySelector( '.prev' ).addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			goster( sira - 1 );
		} );
		kutu.querySelector( '.next' ).addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			goster( sira + 1 );
		} );
		kutu.addEventListener( 'click', function ( e ) {
			if ( e.target === kutu ) {
				kapat();
			}
		} );

		document.addEventListener( 'keydown', function ( e ) {
			if ( ! kutu.classList.contains( 'is-open' ) ) {
				return;
			}
			if ( 'Escape' === e.key ) {
				kapat();
			}
			if ( 'ArrowLeft' === e.key ) {
				goster( sira - 1 );
			}
			if ( 'ArrowRight' === e.key ) {
				goster( sira + 1 );
			}
		} );
	}

	/* ---------------------------------------------------------------- SSS */

	function sss() {
		Array.prototype.forEach.call( kok.querySelectorAll( '.faq-q' ), function ( dugme ) {
			dugme.addEventListener( 'click', function () {
				var oge = dugme.closest( '.faq-item' );
				var acik = oge.classList.toggle( 'is-open' );
				dugme.setAttribute( 'aria-expanded', acik ? 'true' : 'false' );
			} );
		} );
	}

	/* ------------------------------------------------------------ katılım */

	function istek( yol, govde ) {
		return fetch( veri.rest + yol, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( govde )
		} ).then( function ( r ) {
			return r.json().then( function ( j ) {
				if ( ! r.ok ) {
					throw new Error( j.message || 'İstek başarısız' );
				}
				return j;
			} );
		} );
	}

	function katilimFormu() {
		var form = kok.querySelector( '#rsvp-form' );
		if ( ! form ) {
			return;
		}

		var katiliyor = true;
		var sarki = form.querySelector( '#rsvp-song-row' );
		var sayi = form.querySelector( '#rsvp-count-row' );

		Array.prototype.forEach.call( form.querySelectorAll( '[data-attend]' ), function ( dugme ) {
			dugme.addEventListener( 'click', function () {
				katiliyor = 'evet' === dugme.getAttribute( 'data-attend' );

				Array.prototype.forEach.call( form.querySelectorAll( '[data-attend]' ), function ( d ) {
					d.setAttribute( 'aria-pressed', d === dugme ? 'true' : 'false' );
				} );

				// Katılamayan biri ne şarkı ister ne kişi sayısı verir.
				if ( sarki ) {
					sarki.hidden = ! katiliyor;
				}
				if ( sayi ) {
					sayi.hidden = ! katiliyor;
				}
			} );
		} );

		var kisi = '1';
		Array.prototype.forEach.call( form.querySelectorAll( '[data-count]' ), function ( dugme ) {
			dugme.addEventListener( 'click', function () {
				kisi = dugme.getAttribute( 'data-count' );
				Array.prototype.forEach.call( form.querySelectorAll( '[data-count]' ), function ( d ) {
					d.setAttribute( 'aria-pressed', d === dugme ? 'true' : 'false' );
				} );
			} );
		} );

		form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();

			var not = form.querySelector( '.form-note' );
			var gonder = form.querySelector( '[type=submit]' );
			gonder.disabled = true;
			not.textContent = '';

			istek( 'rsvp', {
				slug: veri.slug,
				name: form.querySelector( '#rsvp-name' ).value,
				phone: form.querySelector( '#rsvp-phone' ).value,
				count: katiliyor ? kisi : '0',
				attending: katiliyor,
				songRequest: form.querySelector( '#rsvp-song' ) ? form.querySelector( '#rsvp-song' ).value : '',
				note: form.querySelector( '#rsvp-note' ).value
			} ).then( function () {
				form.innerHTML = '<p class="t-display">Teşekkürler</p><p class="t-body" style="margin-top:1rem">Katılım bildiriminiz alındı.</p>';
			} ).catch( function ( err ) {
				not.textContent = err.message;
				gonder.disabled = false;
			} );
		} );
	}

	function dilekFormu() {
		var form = kok.querySelector( '#wish-form' );
		if ( ! form ) {
			return;
		}

		form.addEventListener( 'submit', function ( e ) {
			e.preventDefault();

			var not = form.querySelector( '.form-note' );
			var tamam = form.querySelector( '.form-ok' );
			var gonder = form.querySelector( '[type=submit]' );

			gonder.disabled = true;
			not.textContent = '';
			tamam.textContent = '';

			istek( 'wishes', {
				slug: veri.slug,
				name: form.querySelector( '#wish-name' ).value,
				message: form.querySelector( '#wish-message' ).value
			} ).then( function () {
				form.reset();
				tamam.textContent = 'Dileğiniz iletildi. Çift onayladıktan sonra bu sayfada görünecek.';
				gonder.disabled = false;
			} ).catch( function ( err ) {
				not.textContent = err.message;
				gonder.disabled = false;
			} );
		} );
	}

	/* --------------------------------------------------------- paylaşma */

	function paylas() {
		Array.prototype.forEach.call( kok.querySelectorAll( '[data-copy]' ), function ( dugme ) {
			dugme.addEventListener( 'click', function () {
				var metin = dugme.getAttribute( 'data-copy' ) || window.location.href;
				var eski = dugme.textContent;

				function bitti() {
					dugme.textContent = 'Kopyalandı';
					window.setTimeout( function () {
						dugme.textContent = eski;
					}, 1800 );
				}

				if ( navigator.clipboard ) {
					navigator.clipboard.writeText( metin ).then( bitti ).catch( function () {
						window.prompt( 'Kopyalayın:', metin );
					} );
				} else {
					window.prompt( 'Kopyalayın:', metin );
				}
			} );
		} );

		var paylasDugme = kok.querySelector( '[data-share]' );
		if ( paylasDugme && navigator.share ) {
			paylasDugme.addEventListener( 'click', function () {
				navigator.share( {
					title: document.title,
					url: window.location.href
				} ).catch( function () {} );
			} );
		} else if ( paylasDugme ) {
			paylasDugme.setAttribute( 'data-copy', window.location.href );
		}
	}

	belirmeyiKur();
	ilerlemeCubugu();
	geriSayim();
	perde();
	galeri();
	sss();
	katilimFormu();
	dilekFormu();
	paylas();
} )();
