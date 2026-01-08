/* eslint-disable no-useless-escape */

const { cleanupColList } = require("./mods/perm/cleanupColList");
const { flexColumnTables } = require("./mods/perm/flexColumnTables");
const bioSort = require('./mods/perm/bioSort');
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
				/\{\{[Pp]rzypisy\s+([\|\}])/g,
				'{{Przypisy$1'
			)
		;
		if (after !== str) {
			summary.push('P');
			str = after;
		}
	}

	// `{{Przypisy|=mini}}`
	if (str.includes('Przypisy|=mini')) {
		after = str
			.replace(
				/\{\{Przypisy\|=mini\}\}/g,
				'<references group=mini/>'
			)
			.replace(
				/\{\{Przypisy\|=mini\|\n([\s\S]+?<\/ref>)\s*\n\}\}\n/g,
				'<references group=mini>\n$1\n</references>\n'
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
	{
		after = str
			.replace(
				/\{\{Przypisy\|\s*[0-9]+(em)?\s*\}\}/g,
				'{{Przypisy}}'
			)
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

	if (str.includes('{{Przypisy|')) {
		summary.push('__UWAGA__nadal_ma_Przypisy_lista');
	}

	/**/

	return str;
}

let countChar = (str, char) => {
	let count = 0;
	for (const c of str) {
		if (c === char) count++;
	}
	return count;
};

/**
 * Czyszczenie przypisów-parametrów.
 * 
 * Zmienia to na refy.
 * {{Przypisy
|Council of Europe={{cytuj stronę |...}}
|abecadło={{cytuj|...}}
|kopytko={{Cytuj|...}}
}}
 */
let cleanerRefparams = function (tpl)
{
	if (tpl.search(/=\s*\{\{cytuj/i) >= 0) {
		// Mr obvious
		tpl = tpl
			.replace(/\{\{Paywall\}\}/g, '')
		// new lines
		tpl = tpl
			.replace(/\r\n/g, '\n')
			.replace(/\s*<ref/g, '\n<ref')
			.replace(/(\}\}|<\/ref>)\s*\}\}$/, '$1\n}}')
		;
		// replace
		tpl = tpl
			.replace(/\s*\|\s*([^=]+)\s*=\s*\{\{[cC]ytuj/g, '\n|$1={{Cytuj') // unify
			.replace(/\|([^=]+)=(\{\{Cytuj.+\}\})/g, (a, n, ref)=> countChar(ref, '{') === countChar(ref, '}') ? `<ref name="${n.trim()}">${ref}</ref>` : a)
		;
		tpl = tpl
			.replace(/\{\{Przypisy\n<ref/g, '{{Przypisy|\n<ref')
		;
	}
	return tpl;
}

/**
 * Czyszczenie z WP:SK + cleanerRefparams.
 */
let cleanerReflist = function (str)
{
	var startIndex = str.search(/\{\{Przypisy\s*\|/i);
	if (startIndex < 0) {
		//console.log('[wp_sk]', 'no ref template with params found');
		return false;
	}

	var ending = str.substring(startIndex);
	var indexes = wp_sk.findTemplates(ending);
	if (!indexes.length) {
		console.log('[wp_sk]', 'ref template not found');
		return false;
	}

	var part = indexes[0];
	var tpl = ending.substring(part.start, part.end);

	tpl = cleanerRefparams(tpl);

	// spr. resztek po usunięciu przypisów
	var noRefs = tpl
		.replace(/<ref[^>]*>[\s\S]+?<\/ref>/ig, '')
		.replace(/^\{\{\s*\w+/, '') // tpl start
		.replace(/\}\}$/, '') // tpl end
	;
	// console.log(noRefs);

	// nie może zawierać nazwanych parametrów
	// (powinno pominąć `|grupa=uwagi` oraz `|=uwagi`)
	if (noRefs.search(/\|(\s*\w{2,})?\s*=/) >= 0) {
		console.log('[wp_sk]', 'ref template has extra params');
		return false;
	}

	// oczyść zawartość
	// (zostawia samą treść szablonu, bez kodu szablonu)
	var noTpl = tpl
		.replace(/^\{\{\s*\w+/, '') // tpl start
		.replace(/\}\}$/, '') // tpl end
		.trim()
		.replace(/^\|\s*\w+\s*=/, '') // first param name
		.replace(/^\|/, '') // nameless param
		.trim()
	;
	//console.log(noTpl);
	if (!noTpl.length) {
		console.log('[wp_sk]', 'ref template contents seem empty');
		return false;
	} else if (noTpl.search(/<\/ref>/) < 0 && noTpl.search(/\{\{/) < 0) {
		console.log('[wp_sk]', 'ref template has no refs nor templates');
		return false;
	}

	var fixed = "<references>\n" + noTpl + "\n</references>";
	ending = fixed + ending.substring(part.end);
	var result = str.substring(0, startIndex + part.start) + ending;

	return result;
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
	module.exports.cleanerReflist = cleanerReflist;
	module.exports.cleanerRefparams = cleanerRefparams;
}
