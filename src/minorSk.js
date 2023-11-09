/* eslint-disable no-useless-escape */

/**
 * Non-temporary changes.
 * 
 * Either stable or to be kept permanently when it will be stable enough.
 * 
 * @param {wp_sk} wp_sk 
 */
function permSk(str) {
			let after;

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
function minorSk(str) {
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
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.permSk = permSk;
	module.exports.minorSk = minorSk;
}
