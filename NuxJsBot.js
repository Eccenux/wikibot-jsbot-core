/* global mw, $ */
(function(){
	var logTag = '[jsbot]';

	class NuxJsBot {
		constructor() {
			this.linkPrepDone = false;
		}
		
		/**
		 * Prepare and execute WP:SK.
		 * 
		 * @param {wp_sk} wp_sk Should be ready for execution.
		 */
		run(wp_sk) {
			var model = mw.config.get('wgPageContentModel');
			if (model === "javascript") {
				return;
			}
			// prep. bocik
			this.prepareSk(wp_sk);
			// auto-run
			wp_sk.cleanup( document.getElementById( 'wpTextbox1' ) );
			// drób
			$('#wpMinoredit').prop('checked', 'checked');
			// auto-diff
			$('#wpDiff').click();
		}
	
		/* Select node (range selection). */
		selectNode(nodeSel) {
			var node = document.querySelector(nodeSel);
			if (!node) {
				console.warn(logTag, 'node not found', nodeSel);
			}
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(node);
			selection.removeAllRanges();
			selection.addRange(range);
		}
		/**
		 * Prepare search page for mass-edit.
		 */
		prepareSearch() {
			if (!this.linkPrepDone) {
				$('.searchResultImage-thumbnail').remove();
				$('.mw-search-results a').each(function() {
					//console.log(this.href)
					this.href += '?action=edit'
					this.href = this.href.replace(/\?.+\?/, '?')
				});
			}
			this.linkPrepDone = true;
			this.selectNode('.mw-search-results-container');
		}
		/*
			js-bot
			(tags: jsbot, botjs, botskjs)
			1. Funkcja i test.
			2. [[Wikipedia:Użytkownicy o ukrytej aktywności]] -> [[Specjalna:Uprawnienia/Nux]].
			3. monobook
			4. Wyszukiwanie na edycję:
			...
			5. Zkomentuj mw.hook.
		*/
		prepareSk(wp_sk) {
			var orig_cleanerWikiVaria = wp_sk.cleanerWikiVaria;
			var summary = ['[[WP:SK]]'];
			wp_sk.cleanerWikiVaria = function(str) {
				var after = '';
				// orig
				str = orig_cleanerWikiVaria.apply(this, arguments);
				// col-begin/break
				after = str.replace(/(\{\{col-begin[^}]*\}\})\s+(\{\{col-break)/g, '$1$2');
				if (after !== str) {
					summary.push('odstęp col-begin/break');
					str = after;
				} else {
					console.warn(logTag, 'brak dopasowania')
				}
				/**
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
					console.warn(logTag, 'brak zmian');
				}
			}
		}
	}
	
	// bot instance
	const jsbot = new NuxJsBot();
	
	// run when WP:SK is fully ready
	mw.hook('userjs.wp_sk.redir.done').add(function (wp_sk) {
		jsbot.run(wp_sk);
	});
	
	// export
	window.jsbotsk_search_prep = function() {
		jsbot.prepareSearch();
	};
})();
