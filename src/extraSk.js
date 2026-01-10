/* eslint-disable no-useless-escape */

const { cleanupColList } = require("./mods/perm/cleanupColList");
const { flexColumnTables } = require("./mods/perm/flexColumnTables");
const bioSort = require('./mods/perm/bioSort');
const { cleanerReflist } = require("./mods/cleanerReflist");
// const { archiveSnooker } = require('./mods/archiveSnooker');

function extraSk(str, summary) {
	str = permSk(str, summary);
	str = tempSk(str, summary);
	str = minorSk(str, summary);
	return str;
}

/**
 * Non-temporary changes.
 * 
 * Either stable or to be kept permanently when it will be stable enough.
 * 
 * @param {wp_sk} wp_sk 
 */
function permSk(str, summary) {
	let after;

	let mainNs = mw.config.get('wgNamespaceNumber') == 0;

	if (!mainNs) {
		return str;
	}

	// col-begin with a list
	after = cleanupColList(str);
	if (after !== str) {
		summary.push('poprawa ciągłości, [[WP:Dostępność]]');
		str = after;
	}

	// table -> wikiflex
	after = flexColumnTables(str);
	if (after !== str) {
		summary.push('wikiflex, [[WP:Dostępność]]');
		str = after;
	}

	// bio art
	after = bioSort.defaultSort(str);
	if (after !== str) {
		summary.push('sortowanie kat.');
		str = after;
	}
	return str;
}

/**
 * Minor, temporary wiki-cleanup.
 * 
 * Note! Large changes should get a separate file like e.g. `bioSort.js`.
 * @param {wp_sk} wp_sk 
 */
function minorSk(str, summary) {
	let after;

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
	/**
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
	// Supercount i xtools
	// [http://tools.wmflabs.org/supercount/index.php?user={{urlencode:{{{1}}}}}&project=pl.wikipedia Statystyki]
	// [http://tools.wmflabs.org/xtools/pages/index.php?user={{urlencode:{{{1}}}}}&lang=pl&wiki=wikipedia&namespace=0&getall=1&redirects=noredirects Utworzone]
	after = str
		.replace(
			/https?:\/\/tools\.wmflabs\.org\/supercount\/(?:index\.php)\?user=([^&]+)&project=([a-z]+.wiki[pm]edia)(&[a-z0-9=]+)?/g,
			'https://xtools.wmcloud.org/ec/$2/$1'
		)
		.replace(
			/http:\/\/tools\.wmflabs\.org\/xtools\/pages\/(?:index\.php)?\?user=([^&]+)&lang=pl&wiki=wikipedia&namespace=0&getall=1&redirects=noredirects/g,
			'https://xtools.wmcloud.org/pages/pl.wikipedia.org/$1'
		)
	;
	if (after !== str) {
		summary.push('supercount/xtools url');
		str = after;
	}
	/**/
	// Nauka Polska -> archiwum.nauka-polska.pl
	after = str
		.replace(
			/([^\/])https?:\/\/nauka-polska\.pl/g,
			'$1https://archiwum.nauka-polska.pl'
		)
	;
	if (after !== str) {
		summary.push('archiwum.nauka-polska');
		str = after;
	}
	/**/

	// spacje i wielkość liter
	{
		after = str
			.replace(
				/\{\{[Pp]rzypisy\s*([\|\}])/g,
				'{{Przypisy$1'
			)
			.replace(/<ref\s+name=(["']{2,})([^'">]+)(["']{2,})/g, (a, c1, name, c2) => {
				if (c1 != c2) a;
				return `<ref name="${name}"`;
			})
		;
		if (after !== str) {
			summary.push('P');
			str = after;
		}
	}

	// `{{Przypisy|=mini/nav}}`
	if (str.includes('Przypisy|=')) {
		after = str
			.replace(
				/\{\{Przypisy\|=([a-z]+)\}\}/g,
				'<references group=$1/>'
			)
			.replace(
				/\{\{Przypisy\|=([a-z]+)\|\n([\s\S]+?<\/ref>)\s*\n\}\}\n/g,
				'<references group=$1>\n$2\n</references>\n'
			)
		;
		if (after !== str) {
			summary.push('Przypisy mini');
			str = after;
		}
	}

	// nie lista
	// \{\{Przypisy\|\s*[0-9]+(em)?\s*\}\}
	// {{Przypisy}}
	let nopRe = /\{\{Przypisy\|[^|={}<]{1,50}\}\}/g;
	if (str.search(nopRe) >= 0) {
		after = str
			.replace(
				nopRe,
				'{{Przypisy}}'
			)
			// // {{Przypisy|<!-- bez nagłówka -->}}
			// .replace(
			// 	///\{\{Przypisy\|\s*<!--[^>}]+-->\s*\}\}/g,
			// 	/\{\{Przypisy\|\s*<<<[0-9]+>>>\s*\}\}/g,
			// 	'{{Przypisy}}'
			// )
		;
		if (after !== str) {
			summary.push('Przypisy nie-lista');
			str = after;
		}
	}

	{
		after = cleanerReflist(str);
		if (after && after !== str) {
			summary.push('Przypisy → references');
			str = after;
		}
	}

	let classReflistStill = 'nuxjsbot-reflist-still';
	let selectorReflistStill = '.' + classReflistStill;
	if (str.includes('{{Przypisy|')) {
		summary.push('__UWAGA__nadal_ma_Przypisy_lista');
		let el = document.querySelector(selectorReflistStill);
		if (el) {
			el.classList.add(`${classReflistStill}-shake`);
			setTimeout(() => el.classList.remove(`${classReflistStill}-shake`), 500);
		} else {
			document.querySelector('.editOptions').insertAdjacentHTML('afterbegin', `<div class="${classReflistStill}" style="
				border: 1px solid black;
				background: darkred; color: white;
				padding: .2em .5em;
				margin-bottom: .5em;
			">UWAGA! Nadal ma {{Przypisy|...}}.</div>
			<style>
				@keyframes ${classReflistStill}-shake {
					0%, 100% { transform: translateX(0); }
					20%, 60% { transform: translateX(-10px); }
					40%, 80% { transform: translateX(10px); }
				}
				.${classReflistStill}-shake {
					animation: ${classReflistStill}-shake 0.5s;
				}
			</style>
			`);
		}
	} else {
		let el = document.querySelector(selectorReflistStill);
		if (el) {
			el.style.display = 'none';
		}
	}

	/**/

	return str;
}

/**
 * Modular, but temporary changes.
 * 
 * Changes speficic for current work.
 * 
 * @param {wp_sk} wp_sk 
 */
function tempSk(str, summary) {
	let after;

	// // szablon imdb
	// after = imdb(str);
	// if (after !== str) {
	// 	summary.push('szablon imdb');
	// 	str = after;
	// }

	// // snooker webarchive (url cleanup)
	// after = archiveSnooker(str);
	// if (after !== str) {
	// 	summary.push('sprzątanie linków');
	// 	str = after;
	// }
	
	return str;
}


// export
if (typeof module === 'object' && module.exports) {
	module.exports.extraSk = extraSk;
}
