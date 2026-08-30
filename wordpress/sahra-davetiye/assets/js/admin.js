/**
 * Panel yardımcıları — kopyalama, medya seçici, dilek onayı.
 *
 * @package SahraDavetiye
 */
( function () {
	'use strict';

	/* Tek tuşla kopyalama (giriş bilgileri, davetiye bağlantısı). */
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
				window.prompt( 'Kopyalayın:', metin );
			} );
		} else {
			// Pano izni yoksa (http, eski tarayıcı) metin elle seçilebilsin.
			window.prompt( 'Kopyalayın:', metin );
		}
	} );

	/* Hazır ses parçalarını alana yazan kısayollar. */
	document.addEventListener( 'click', function ( e ) {
		var dugme = e.target.closest( '.sahra-pick' );
		if ( ! dugme ) {
			return;
		}
		e.preventDefault();
		var alan = document.getElementById( dugme.getAttribute( 'data-target' ) );
		if ( alan ) {
			alan.value = dugme.getAttribute( 'data-value' );
		}
	} );

	/* WordPress medya kütüphanesinden görsel/ses seçme. */
	document.addEventListener( 'click', function ( e ) {
		var alan = e.target.closest( '.sahra-media' );
		if ( ! alan || ! window.wp || ! window.wp.media ) {
			return;
		}

		var secici = window.wp.media( { multiple: false } );

		secici.on( 'select', function () {
			var secim = secici.state().get( 'selection' ).first().toJSON();
			alan.value = secim.url;
		} );

		secici.open();
	} );

	/* Dilek onaylama / silme. */
	var panel = window.SahraPanel;
	if ( ! panel ) {
		return;
	}

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
} )();
