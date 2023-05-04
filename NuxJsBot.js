/**
 * Simple JS ~bot.
 * 
 * (tags: jsbot, botjs, botskjs, js-bot)
 * 
 * Procedura:	
	0. (temp) Włącz ładowanie jsbot.
	1. Zmiana w `prepareSk()` i test.
	2. (temp) [[Specjalna:Uprawnienia/Nux]] (włącz [[Wikipedia:Użytkownicy o ukrytej aktywności]]).
	3. (temp) monobook
	4. Przygotowanie wyszukiwania (linki do edycji): jsbotsk_search_prep();
	5. (temp) Wyłączenie obrazków (reguły uBlock):
		upload.wikimedia.org * image block
		pl.wikipedia.org * image block
	...
	X. Powrót tymczasowych zmian.
 * 
 * @see NuxJsBot.js (in varia-linter)
 */
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
		/**
		 * Prepare WP:SK for execution (add custom procedures).
		 * @param {wp_sk} wp_sk 
		 */
		prepareSk(wp_sk) {
			var orig_cleanerWikiVaria = wp_sk.cleanerWikiVaria;
			var summary = ['[[WP:SK]]'];
			var me = this;
			wp_sk.cleanerWikiVaria = function(str) {
				var after = '';
				// orig
				str = orig_cleanerWikiVaria.apply(this, arguments);
				// col-begin/break
				after = str.replace(/(\{\{col-begin[^}]*\}\})\s+(\{\{col-break)/g, '$1$2');
				if (after !== str) {
					summary.push('odstęp col-begin/break');
					str = after;
				// } else {
				// 	console.warn(logTag, 'brak dopasowania')
				}
				// col-begin with a list
				after = me.cleanupColList(str);
				if (after !== str) {
					summary.push('poprawa ciągłości, [[WP:Dostępność]]');
					str = after;
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
					document.getElementById('wpSummary').value = summary.join(', ');
					// drób
					document.getElementById('wpMinoredit').checked = true;
					// don't watch
					document.getElementById('wpWatchthis').checked = false;
				} else {
					console.warn(logTag, 'brak zmian');
				}
				// auto-diff
				$('#wpDiff').click();
			}
		}
		/**
		 * Usuwanie col-break łamiących ciągłość listy.
		 * 
		 * Przykład poprawek:
		 * https://pl.wikipedia.org/w/index.php?title=Mistrzostwa_%C5%9Awiata_w_Snookerze_2023&diff=70266096&oldid=70265967
		 * @param {String} str 
		 */
		cleanupColList(str) {
			// ręcznie dłubana tabela
			if (str.search(/\|\s*<ol start/) > 0) {
				// 1 = 1st cell, 2=2nd cell
				const re = /\{\|[|\s]+((?:\n#.+)+)\n(?:\|\s*\w+[^|]+\||\|)\s*<ol start.+>([\s\S]+?)<\/ol>\s+\|\}/g;
				const top = '{{Układ wielokolumnowy |szerokość=20em |liczba=2 |skurcz=1 |1=<nowiki />';
				str = str.replace(re, (a, list1, list2) => {
					list2 = list2.replace(/\s*<li>\s*/g, '\n# ')
						.replace(/<\/li>/g, '')
						.trim()
					;
					list1 = list1.trim();

					return `${top}\n${list1}\n${list2}\n}}`
				});
			}
			// bardziej typowa lista pocięta col-break
			if (str.search(/\{\{col-break\}\}[ \n]*\n\*/) > 0) {
				const re = /\{\{col-begin[^}]*\}\}([\s\S]+?)\{\{col-end\}\}/g;
				const top = '{{Układ wielokolumnowy |szerokość=20em |liczba=2 |skurcz=0 | 1=<nowiki />';
				const liRe = /\n\*.+/g;
				const lineRe = /\n/g;
				const breaksRe = /\s*\{\{col-break[^}]*\}\}\s*/g;
				str = str.replace(re, (a, content) => {
					// remove breaks to get actual content
					content = content.replace(breaksRe, '\n')
						.trim()
					;
					// make sure content is a list
					if (content.match(liRe).length !== content.match(lineRe).length) {
						console.warn(logTag, 'not a list, skipping', content);
						return a;
					}
		
					return `${top}\n${content}\n}}`
				});
			}
			return str;
		}
	}
	
	// bot instance
	const jsbot = new NuxJsBot();
	
	// run when WP:SK is fully ready
	mw.hook('userjs.wp_sk.redir.done').add(function (wp_sk, hasRedirs) {
		console.log(logTag, 'redir done', wp_sk, hasRedirs);
		jsbot.run(wp_sk);
	});

	mw.hook('userjs.wp_sk.button_created').add(function (wp_sk) {
		console.log(logTag, 'button_created', wp_sk);
	});

	// export
	window.jsbotsk_search_prep = function() {
		jsbot.prepareSearch();
	};
})();
