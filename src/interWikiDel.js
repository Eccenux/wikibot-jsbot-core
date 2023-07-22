/**
 * Usuwanie interwiki.
 * 
 * Do usuwania przestarzałych wpisów z artykułów.
 * ```
 * prepareSk(wp_sk) {
 * 	...
 *  // usuń przestarzałe wpisy interwiki
 * 	wp_sk.cleanerMagicLinks = interWikiDel;
 * }
 * ```
 * 
 * Póki co odrzucone/porzucone:
 * https://pl.wikipedia.org/wiki/Wikipedia:Zadania_dla_bot%C3%B3w/Archiwum/b%C5%82%C4%99dne/2023#Stare_interwiki
 * 
 * @param {String} str 
 * @returns {String}
 */
function interWikiDel (str)
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

module.exports.interWikiDel = interWikiDel;