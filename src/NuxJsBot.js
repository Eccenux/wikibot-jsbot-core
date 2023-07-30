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

const { SkTableHide } = require("./SkTableHide");
var logTag = '[jsbot]';

class NuxJsBot {
	constructor() {
		this.linkPrepDone = false;
		this.botParam = 'js_bot_ed=1';
		this.skipDiffParam = 'js_bot_nd=1';
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
		if (location.search.search(this.botParam)>0) {
			// prep. bocik
			this.prepareSk(wp_sk);
			// auto-run
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
	prepareSearch(skipDiff) {
		if (!this.linkPrepDone) {
			$('.searchResultImage-thumbnail').remove();
			var me = this;
			$('.mw-search-results a').each(function() {
				//console.log(this.href)
				this.href += '?action=edit&' + me.botParam;
				if (skipDiff) {
					this.href += '&' + me.skipDiffParam;
				}
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

		// dodatki do procesu SK (po zwinięciu nowiki, komentarzy itp)
		wp_sk.cleanerWikiVaria = function(str) {
			var after = '';
			// orig
			str = orig_cleanerWikiVaria.apply(this, arguments);
			/**/
			// // szablon imdb
			// after = imdb(str);
			// if (after !== str) {
			// 	summary.push('szablon imdb');
			// 	str = after;
			// }
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
			after = str
				// .replace(/autor link *= *Adam Przybylski *(\|)/g, 'autor link = Adam Przybylski (1896–1945)$1')
				.replaceAll('[[John Fowler]]', '[[John Fowler (wynalazca)|John Fowler]]')
				.replaceAll('[[John Fowler|', '[[John Fowler (wynalazca)|')
			;
			if (after !== str) {
				summary.push('popr. linka: John Fowler');
				str = after;
			}
			/**/
			// 2*hiero
			after = str
				.replace(/:hiero[ \t]*=[ \t]*\<hiero>.{1,30}\<\/hiero>[ \t]*\<hiero>[^|}]+/g
					, (a) => a.replace(/<\/hiero>[ \t]*\<hiero>/g, ' ')
				);
			;
			if (after !== str) {
				summary.push('2*hiero [[WP:ZDBOT]]');
				str = after;
			}
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
			var changes = '0';
			if (!wp_sk.nochanges) {
				changes = '1';
				document.getElementById('wpSummary').value = summary.join(', ');
				// drób
				document.getElementById('wpMinoredit').checked = true;
				// don't watch
				// document.getElementById('wpWatchthis').checked = false;
			} else {
				console.warn(logTag, 'brak zmian');
			}
			document.getElementById('wpSummary').insertAdjacentHTML('afterend', `<span id="jsbot-sk-done" data-changes="${changes}"/>`);
			// auto-diff
			if (location.search.search(this.skipDiffParam) < 0) {
				$('#wpDiff').click();
			}
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
	module.exports.NuxJsBot = NuxJsBot;
	module.exports.logTag = logTag;
}

