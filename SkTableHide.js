
/**
 * Hide tables off from the string.
 */
var SkTableHide = class {
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
		console.log({indexes});
		if (indexes.length) {
			// licząc od ostatniego zamień tabele na zastępniki
			str = this.hideTables(indexes, str);
			// potem muszę spr. czy to wikitable
			// muszę rozwiąznąć tabele bez klasy wikitable (ale tylko do momentu aż trafię na wikitabel)
			console.log({tags:this.tags});
		}
		
		// // [XOR] potnij wg początku i końca tabel
		// var re = /(\n\{\|)/;

		// // [XOR] naiwna (uproszczona) podmiana
		// str = str.replace(/(\{\| class="wikitable"[\s\S]+?\n\|\})/g, (a) => {
		// 	this.t_i++;
		// 	this.tags[this.t_i] = a;
		// });

		return str;
	}

	/**
	 * Hide tables given start indexes.
	 * 
	 * @param {Array} indexes Start indexes.
	 * @param {String} str Input.
	 * @returns 
	 */
	hideTables(indexes, str) {
		const endTag = '\n|}';
		const endLen = endTag.length;
		// licząc od ostatniego zamień tabele na zastępniki
		for (let i = indexes.length - 1; i >= 0; i--) {
			const start = indexes[i];
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
			str = str.substring(0, start) + "<<<" + this.t_i + ">>>" + str.substring(end);

			console.log({ i, str });
		}
		return str;
	}

	show(str) {
		var max_depth = 10;
		// restore
		for (var i = 0; i < max_depth; i++) {
			str = str.replace(/<tab<([0-9]+)>tab>/g, (a, i) => {
				return this.tags[i];
			});
			if (str.search(/<tab<([0-9]+)>tab>/) == -1) {
				break;
			}
		}
		// odescapowanie nowikowe
		str = str.replace(/<tab<#(#*[0-9]+)>tab>/g, '<tab<$1>>>');

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

var tables = new SkTableHide();

var res;

// test indexes
res = tables.findAll('abcabcaaaba', 'a');
console.log(res);

// test hide
res = tables.hide(`
before
{|
|
{| class="wikitable"
| abc
|}
|
{| class="wikitable"
| def
|}
|}
after
`);
console.log(res);
