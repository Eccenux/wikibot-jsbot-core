(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

		// usuń przestarzałe wpisy
		wp_sk.cleanerMagicLinks_off = function (str)
		{
			// zbieranie
			str = wp_sk.cat.gather(str);
			let before = str;
			str = wp_sk.iWiki.gather(str);

			if (before !== str) {
				summary.push('stare interwiki');
			}
			
			// usuwanie pozostawionych przy zbieraniu i innych wielokrotnych, pustych wierszy
			str = str.replace(/[\n]{3,}/g, '\n\n');
		
			// wstawienie na koniec (call not copy to have "this")
			str = str.replace(/\s*$/, function(a) {return wp_sk.cat.output(a)});
		
			return str;
		};

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
			var changes = '0';
			if (!wp_sk.nochanges) {
				changes = '1';
				document.getElementById('wpSummary').value = summary.join(', ');
				// drób
				document.getElementById('wpMinoredit').checked = true;
				// don't watch
				document.getElementById('wpWatchthis').checked = false;
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


},{"./SkTableHide":3}],2:[function(require,module,exports){
/* global mw, Promise */

/**
 * Check if pages are reviewed.
 */
class ReviewCheck {

	/**
	 * Check pages.
	 * @param {NodeList} links Page links to check.
	 * @returns {Promise}
	 */
	check(links) {
		let titles = this.extractTitles(links);
		let result = new Promise((resolve, reject) => {
			this.checkReviewed(titles).then(resolve, reject);
		});
		return result;
	}
	
	/**
	 * Check reviewed.
	 * @param {Array} titles {t:title, a:node}
	 * @returns {Promise}
	 */
	checkReviewed(titles) {
		let result = new Promise((resolve, reject) => {
			const api = new mw.Api();
			api.get( {
				action: 'query',
				prop: 'flagged',
				titles: titles.map(o=>o.t),
			} ).done( ( data ) => {
				let pages = Object.values(data.query.pages);
				console.log('done', pages);
				let reviewed = this.findReviewed(pages);
				let rTitles = reviewed.map(r=>r.title);
				let result = {
					reviewed: titles.filter(o=>rTitles.indexOf(o.t)>=0),
					stale: titles.filter(o=>rTitles.indexOf(o.t)<0),
				};
				console.log('done', {rTitles, result});
				resolve(result);
			} ).fail( () => {
				console.error('failed to get reviewd data');
				reject();
			} );
		});
		return result;
	}

	/**
	 * Find reviewd pages in the set.
	 * 
	 * prop=flagged spec:
	 * https://www.mediawiki.org/wiki/Extension:FlaggedRevs#prop=flagged
	 * 
	 * @param {Array} pages Array of objects that are returned by a query with prop=flagged.
	 * @returns {Array} Filtered array of page objects.
	 */
	findReviewed(pages) {
		return pages.filter(page => {
			// was reviewed at all
			if ('flagged' in page) {
				// doesn't have pending changes
				if (!('pending_since' in page.flagged)) {
					return true;
				}
			}
			return false;
		});
	}

	/**
	 * Extract titles from node.
	 * 
	 * Skips non-article pages.
	 * 
	 * @param {NodeList} links Page links to check.
	 * @returns {Array} {t:title, a:a}
	 */
	extractTitles(links) {
		let titles = [];
		for (const a of links) {
			let title = this.extractTitle(a);
			if (title && title.length) {
				titles.push({t:title, a:a});
			}
		}
		return titles;
	}

	/**
	 * Extract article title from node.
	 * 
	 * Skips non-article pages.
	 * 
	 * @param {Node} a 
	 */
	extractTitle(a) {
		const u = new URL(a.href);
		let title = decodeURIComponent(u.pathname.replace(/\/wiki\//, ''));
		const mwT = mw.Title.newFromText(title);
		if (mwT.namespace != 0) {
			return '';
		}
		return mwT.getPrefixedText();
	}
}

/*
// mark unreviewed
var reviewCheck = new ReviewCheck();
var links = document.querySelectorAll('.mw-search-results a');
reviewCheck.check(links).then((result) => {
	result.stale.forEach(o => {
		o.a.style.cssText = 'background:yellow;';
	});	
});
*/

// export
if (typeof module === 'object' && module.exports) {
	module.exports.ReviewCheck = ReviewCheck;
}

},{}],3:[function(require,module,exports){
/**
 * Hide tables off from the string.
 */
var SkTableHide = class {
	/**
	 * Init.
	 * @param {Function} cond Bool function (true => keep table when hidding).
	 */
	constructor(cond) {
		// defaults to only hide wikitables
		// (note that plain tables inside wikitables will still be hidden)
		if (typeof cond !== 'function') {
			cond = (text) => text.search(/^\{\|.*class.+wikitable/) < 0;
		}
		this.cond = cond;
	}
	hide(str) {
		// porządkowanie nowych wierszy (normalnie samo sk to robi)
		str = str.replace(/\r\n/g, '\n');

		// escapowanie przed tabelkowe
		str = str.replace(/<tab<(#*[0-9]+)>tab>/g, '<tab<#$1>tab>');

		// reset
		this.t_i = -1;
		this.tags = [];

		// wyszukaj początki tabel
		var indexes = this.findAll(str, '\n{|');
		if (indexes.length) {
			// licząc od ostatniego zamień tabele na zastępniki
			str = this.hideTables(indexes, str);
			// potem muszę spr. czy to wikitable
			// muszę rozwiąznąć tabele bez klasy wikitable (ale tylko do momentu aż trafię na wikitabel)
			str = this.showIf(str, this.cond);
		}

		return str;
	}

	/**
	 * Hide tables given start indexes.
	 * 
	 * @param {Array} indexes Start indexes.
	 * @param {String} str Input.
	 * @returns Str with hidden tables (replaced with a marker).
	 */
	hideTables(indexes, str) {
		const endTag = '\n|}';
		const endLen = endTag.length;
		// licząc od ostatniego zamień tabele na zastępniki
		for (let i = indexes.length - 1; i >= 0; i--) {
			let start = indexes[i] + 1;	// skip initial new line
			let end = str.indexOf(endTag, start);
			if (end < 0) {
				console.error('Unclosed table found!', { start, text: str.substring(start, start + 30) + '...' });
				continue;
			}
			// dopisanie do tablicy zawartości
			end += endLen;
			this.t_i++;
			this.tags[this.t_i] = str.substring(start, end);
			// zwiń ostatnią tabelę (na razie nie patrz czy to wikitable)
			str = str.substring(0, start) + "<tab<" + this.t_i + ">tab>" + str.substring(end);
		}
		return str;
	}

	/**
	 * Show when condition is met.
	 * @param {String} str Transformed string.
	 * @param {Function} cond Bool function (true => show).
	 * @returns Partially reverted.
	 */
	showIf(str, cond) {
		var max_depth = 10;
		var tagRe = /<tab<([0-9]+)>tab>/g;
		// restore
		for (var i = 0; i < max_depth; i++) {
			var replaced = 0;
			str = str.replace(tagRe, (a, ti) => {
				let text = this.tags[ti];
				if (cond(text, ti)) {
					replaced++;
					return text;
				} else {
					return a;
				}
			});
			if (!replaced || str.search(tagRe) == -1) {
				break;
			}
		}
		return str;
	}

	show(str) {
		var max_depth = 10;
		var tagRe = /<tab<([0-9]+)>tab>/g;
		// restore
		for (var i = 0; i < max_depth; i++) {
			str = str.replace(tagRe, (a, ti) => {
				return this.tags[ti];
			});
			if (str.search(tagRe) == -1) {
				break;
			}
		}
		// odescapowanie nowikowe
		str = str.replace(/<tab<#(#*[0-9]+)>tab>/g, '<tab<$1>tab>');

		return str;
	}

	/**
	 * Find all needle indexes in hay.
	 * @param {String} hay Search in.
	 * @param {String} needle What to search for.
	 * @returns 
	 */
	findAll(hay, needle) {
		var indexes = [];
		var i = -1;
		while ((i = hay.indexOf(needle, i + 1)) >= 0) {
			indexes.push(i);
		}
		return indexes;
	}
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.SkTableHide = SkTableHide;
}

},{}],4:[function(require,module,exports){
const { NuxJsBot, logTag } = require("./NuxJsBot");

// bot instance
const jsbot = new NuxJsBot();

// run when WP:SK is fully ready
mw.hook('userjs.wp_sk.redir.done').add(function (wp_sk, hasRedirs) {
	console.log(logTag, 'redir done', wp_sk, hasRedirs);
	jsbot.run(wp_sk);
});

// export
window.jsbotsk_search_prep = function(skipDiff) {
	jsbot.prepareSearch(skipDiff);
};

// extra
const { ReviewCheck } = require("./ReviewCheck");
window.ReviewCheck = ReviewCheck;

},{"./NuxJsBot":1,"./ReviewCheck":2}]},{},[4]);
