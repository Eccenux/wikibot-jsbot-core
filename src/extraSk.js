/* eslint-disable no-useless-escape */

const { cleanupColList } = require("./cleanupColList");
const { flexColumnTables } = require("./flexColumnTables");
const bioSort = require('./bioSort');

function extraSk(str, summary) {
	str = permSk(str, summary);
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

	/**/
	// // szablon imdb
	// after = imdb(str);
	// if (after !== str) {
	// 	summary.push('szablon imdb');
	// 	str = after;
	// }
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
	/**/
	// Supercount i xtools
	// [http://tools.wmflabs.org/supercount/index.php?user={{urlencode:{{{1}}}}}&project=pl.wikipedia Statystyki]
	// [http://tools.wmflabs.org/xtools/pages/index.php?user={{urlencode:{{{1}}}}}&lang=pl&wiki=wikipedia&namespace=0&getall=1&redirects=noredirects Utworzone]
	after = str
		.replace(
			/https?:\/\/tools\.wmflabs\.org\/supercount\/(?:index\.php)\?user=([^&]+)&project=pl.wikipedia/g,
			'https://xtools.wmcloud.org/ec/pl.wikipedia/$1'
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
	return str;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.extraSk = extraSk;
	module.exports.permSk = permSk;
	module.exports.minorSk = minorSk;
}
