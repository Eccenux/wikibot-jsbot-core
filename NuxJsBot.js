/* eslint-disable no-useless-escape */
/**
 * Simple JS ~bot.
 * 
 * (tags: jsbot, botjs, botskjs, js-bot)
 * 
 * Procedura:	
	0. Włącz/sprawdź ładowanie jsbot.
	1. Nowa funkcja w `prepareSk()` i test.
	2. (temp) [[Specjalna:Uprawnienia/Nux]] (włącz [[Wikipedia:Użytkownicy o ukrytej aktywności]]).
	3. (temp) monobook
	4. Przygotowanie wyszukiwania (linki do bot-edycji):
		```
		jsbotsk_search_prep();
		```
	5. (temp, opcjonalne) Wyłączenie obrazków (reguły uBlock):
		upload.wikimedia.org * image block
		pl.wikipedia.org * image block
	...
	X. Powrót tymczasowych zmian.
 * 
 * @see https://github.com/Eccenux/wikibot-jsbot-core
 * @see https://github.com/Eccenux/wikibot-jsbot-runner
 */
/* global mw, $ */
/* global SkTableHide */
/* global module */
(function(){
	var logTag = '[jsbot]';

	function imdb(after) {
		after = after.replace(/\[https?:\/\/www\.imdb\.com\/name\/nm([0-9a-z]+)\/(?:bio)?(?:\?[^ ]+)? ([^\]]+)\]/g, (a, id, text) => {
			text = text.trim()
				.replace(/https?:\/\/www\.imdb\.com\/[^ ]+/, '') // url
				.replace(/<<<[0-9]+>>>$/, '') // .replace('<!-- Tytuł wygenerowany przez bota -->', '')
				.replace(/\((en|ang\.?|język angielski)\)/, '')
				.trim()
				.replace(/ (w|na|[\-–—]) (\w+ )?(imdb|Internet Movie Database)[\.a-z]*$/i, '')
				.replace(/(^| )imdb[\.a-z]*$/i, '')
				.replace(/[.,\-–—]$/, '')
				.trim();
			if (text.length < 3) {
				text = 'Notka biograficzna';
			}
			return `{{IMDb|osoba|${id}|${text}}}`;
		});
		after = after.replace(/(\{\{IMDb[^}]+\}\}) \{\{lang\|en\}\}/g, (a, imdb) => imdb);
		//{{IMDb|...}}, [[IMDb]],
		//{{IMDb|...}} w bazie [[IMDb]]
		// – biografia w IMDb
		after = after.replace(/(\{\{IMDb[^}]+\}\})[,.]? (?:(?:w|na|[\-–—]) )?(?:bazie (?:danych )?|biografia w )?(?:\[\[IMDb(?:\|[^\]]+)?\]\]|imdb[.a-z]*)([,.]?)/ig, (a, imdb, dot) => imdb + dot);
		after = after.replace(/(\{\{IMDb[^}]+\}\})[,.]? \{\{lang\|en\}\}/g, (a, imdb) => imdb);

		return after;
	}

	class NuxJsBot {
		constructor() {
			this.linkPrepDone = false;
			this.botParam = 'js_bot_ed=1';
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
			if (location.search.search(this.botParam)>0) {
				wp_sk.cleanup( document.getElementById( 'wpTextbox1' ) );
			}
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
				var me = this;
				$('.mw-search-results a').each(function() {
					//console.log(this.href)
					this.href += '?action=edit&' + me.botParam;
					this.href = this.href.replace(/\?.+\?/, '?');
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
				/**/
				// imdb bio
				after = imdb(str);
				if (after !== str) {
					summary.push('imdb bio');
					str = after;
				}
				// col-begin with a list
				after = me.cleanupColList(str);
				if (after !== str) {
					summary.push('poprawa ciągłości, [[WP:Dostępność]]');
					str = after;
				}
				// table -> wikiflex
				after = me.flexColumnTables(str);
				if (after !== str) {
					summary.push('wikiflex, [[WP:Dostępność]]');
					str = after;
				}
				/**
				// col-begin bez break (unstable!)
				if (str.search(/col-break/i)<0 && str.search(/col-begin/i)>0) {
					after = str.replace(/\{\{col-(begin|end)[^}]*\}\}/ig, '');
					if (after !== str) {
						summary.push('samotne col-begin/end');
						str = after;
					}
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
		/** Count regexp occurences. */
		countRe(text, re) {
			const m = text.match(re);
			return m ? m.length : 0;
		}
		/** Podmiana pseudo-tabel na wikiflex. */
		flexColumnTables(str) {
			// zwijanie
			var tables = new SkTableHide();

			str = tables.hide(str);

			// [[Wikipedysta:Nux/test_sk_table_hide#Niby_kolumny]]
			str = str.replace(/\n\{\|\n[|\-\n]*\n\|\s*(<tab<[0-9]+>tab>)\s*\|\s*(<tab<[0-9]+>tab>)\s*\n\|\}/g
				, '\n<div class="wikiflex">\n$1\n$2\n</div>'
			);

			// j/w ale z col-begin/end
			str = str.replace(/\n\{\{col-begin\}\}\n\s*(<tab<[0-9]+>tab>)\s*(?:\||\{\{col-(?:break|2)\}\})\s*(<tab<[0-9]+>tab>)\s*(?:\{\{col-end\}\}|\n\|\})/g
				, '\n<div class="wikiflex">\n$1\n$2\n</div>'
			);
			
			str = tables.show(str);

			return str;
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
			if (str.search(/\{\{col-(break|2)\}\}[ \n]*\n\*/) > 0) {
				const re = /\{\{col-begin[^}]*\}\}([\s\S]+?)\{\{col-end\}\}/g;
				const top = '{{Układ wielokolumnowy |szerokość=20em |liczba=2 |skurcz=0 | 1=<nowiki />';
				const liRe = /\n\*.+/g;
				const lineRe = /\n/g;
				const breaksRe = /\s*\{\{col-(break|2)[^}]*\}\}\s*/g;
				str = str.replace(re, (a, content) => {
					// break early when no li/lines inside
					if (content.search(liRe) < 0 || content.search(lineRe) < 0) {
						return a;
					}
					// remove breaks to get actual content
					content = content.replace(breaksRe, '\n')
						.trim()
					;
					// make sure content is a list
					if (this.countRe(content, liRe) !== this.countRe(content, lineRe)) {
						console.warn(logTag, 'not a list, skipping\n', content);
						return a;
					}
		
					return `${top}\n${content}\n}}`
				});
			}
			return str;
		}
	}


	// export
	if (typeof module === 'object' && module.exports) {
		module.exports.imdb = imdb;
		module.exports.NuxJsBot = NuxJsBot;
	}
})();

