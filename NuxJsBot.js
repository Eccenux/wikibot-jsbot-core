/* global mw */
(function(){
	/**/
	mw.hook('userjs.wp_sk.ready').add(function (wp_sk) {
		jsbotsk(wp_sk);
	});
	/**/
	/*
		js-bot
		(tags: jsbot, botjs, botskjs)
		1. Funkcja i test.
		2. [[Wikipedia:Użytkownicy o ukrytej aktywności]] -> [[Specjalna:Uprawnienia/Nux]].
		3. monobook
		4. Wyszukiwanie na edycję:
		```
		$('.searchResultImage-thumbnail').remove();
		$('.mw-search-results a').each(function(a){console.log(this.href)
			this.href += '?action=edit'
			this.href = this.href.replace(/\?.+\?/, '?')
		});
		5. Revert tymczasowych zmian.
		```
	*/
	function jsbotsk(wp_sk) {
		var orig_cleanerWikiVaria = wp_sk.cleanerWikiVaria;
		var summary = ['[[WP:SK]]'];
		wp_sk.cleanerWikiVaria = function(str) {
			// orig
			str = orig_cleanerWikiVaria.apply(this, arguments);
			/**/
			// old link
			summary.push('poprawa linków');
			str = str.replace(/https?:\/\/web.archive.org\/\w+\/\d+\/(http:\/\/(?:www\.)?itsanhonour\.gov\.au\/honours\/\w+\/.+?aus_award_id=)/g, '$1');
			str = str.replace(/([^/])http:\/\/(?:www\.)?itsanhonour\.gov\.au\/honours\/\w+\/.+?aus_award_id=([0-9]+)[&\w=]+/g, '$1https://honours.pmc.gov.au/honours/awards/$2');
			/**
			// skróty w wydaniu
			summary.push('int.');
			str = str.replace(/\{\{[Cc]ytuj[^}]+wydanie[^}]+\}\}/g, function(a){
				return a
					.replace(/(wydanie *=[^|]*)(uzup)([ |])/g, '$1$2.$3')
					.replace(/(wydanie *=[^|]*)(zmi?)([ |])/g, '$1$2.$3')
					.replace(/(wydanie *=[^|]*)(roz|rozsz)([ |])/g, '$1$2.$3')
					.replace(/(wydanie *=[^|]*)(pop|popr)([ |])/g, '$1$2.$3')
				;
			});
			/**/
			return str;
		};
		
		wp_sk.warning = function() {
			if (!wp_sk.nochanges) {
				wpSummary.value = summary.join(', ');
				wpMinoredit.checked = true;
				wpWatchthis.checked = false;
			} else {
				
			}
		}
	}
})();
