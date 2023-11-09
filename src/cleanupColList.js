/* eslint-disable no-useless-escape */
const { logTag } = require("./NuxJsBot");

/** Count regexp occurences. */
function countRe(text, re) {
		const m = text.match(re);
		return m ? m.length : 0;
}

/**
 * Usuwanie col-break łamiących ciągłość listy.
 * 
 * Przykład poprawek:
 * https://pl.wikipedia.org/w/index.php?title=Mistrzostwa_%C5%9Awiata_w_Snookerze_2023&diff=70266096&oldid=70265967
 * @param {String} str 
 */
function cleanupColList(str) {
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
				if (countRe(content, liRe) !== countRe(content, lineRe)) {
					console.warn(logTag, 'not a list, skipping\n', content);
					return a;
				}
	
				return `${top}\n${content}\n}}`
			});
		}
		return str;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.cleanupColList = cleanupColList;
}

