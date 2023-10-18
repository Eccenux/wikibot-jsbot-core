/**
 * Default sort dla biografii.
 */
function defaultSort(str) {
	let title = mw.config.get('wgTitle');
	let result = _defaultSort(title, str);
	if (result === false) {
		console.warn('defaultSort: skipping');
		return str;
	}
	return result;
}

/**
 * Date string to year.
 * @param {String} date Date string from infobox.
 */
function _dateToYear(date) {
	let year;
	// [[1234]]
	year = /\[\[(?<year>[0-9]{3,}\]\])/.exec(date)?.groups?.year;
	if (year) return year;
	// 12 paź 1234
	year = /[0-9]{1,2} [a-z]\S+ (?<year>[0-9]+)/.exec(date)?.groups?.year;
	if (year) return year;
	// 1234
	if (date.trim().search(/^[0-9]+$/) === 0) {
		return date;
	}
	return year
}

/**
 * Automatic cat. from infobox.
 * @returns categories array
 */
function _autoCat(str) {
	const categories = [];
	// Add birth/death cat. from infobox
	str.replace(/\|\s*data (?<type>urodzenia|śmierci)[ \t]*=[ \t]*(?<value>[^\r\n]*[0-9].*)/g, (a, type, value) => {
		const year = _dateToYear(value);
		if (year) {
			const prefix = (type === 'urodzenia') ? 'Urodzeni' : 'Zmarli';
			categories.push(`[[Kategoria:${prefix} w ${year}]]`);
		}
	});
	return categories;
}

/**
 * Default sort for testing.
 * @private
 * @param {String} str Article wikitext.
 * @param {String} title Page title.
 * @returns 
 */
function _defaultSort(title, str) {
	// {first, last};
	let name = getName(title);
	if (!name) {
		console.warn('not a name');
		return false;
	}

	// check content
	if (str.indexOf('{{SORTUJ:') >= 0) {
		console.warn('has SORTUJ');
		return false;
	}

	// is bio? / has cat(s)
	if (str.search(/Kategoria:(Urodzeni|Zmarli|Ludzie)/) < 0) {
		const categories = _autoCat(str);
		if (categories.length) {
			str += '\n' + categories.join('\n');
		} else {
			console.warn('not a bio');
			return false;
		}
	}

	// ~azjatyckie nazwiska
	if (str.search(/chińskie|Chińska|Chinach|Nihongo/i) >= 0) {
		console.warn('azjatyckie');
		return false;
	}

	let after = str;
	after = after.replace(/\n\[\[Kategoria:/, (a) => {
		console.log('defaultSort: replace', name);
		return `\n{{SORTUJ:${name.last}, ${name.first}}}${a}`;
	});
	return after;
}

/**
 * Name.
 * @param {String} title Page title.
 * @returns {first, last}
 */
function getName(title) {
	let name = false;
	title = title.replace(/ \(.+\)$/, '').trim();	// strip addons
	title.replace(/^((\S)\S+) ((\S)\S+)$/, (a, first, letter1, last, letter2) => {
		let isName = 
			letter1.toLocaleUpperCase() === letter1
			&& letter2.toLocaleUpperCase() === letter2
			&& last.toLocaleUpperCase() !== last	// not all UPPER
		;
		if (!isName) {
			return;
		}
		name = {first, last};
	});
	title.replace(/^((\S)\S+ ((\S)\S+)) ((\S)\S+)$/, (a, first, letter1, second, letter2, last, letterN) => {
		let isName = 
			letter1.toLocaleUpperCase() === letter1
			&& letter2.toLocaleUpperCase() === letter2
			&& letterN.toLocaleUpperCase() === letterN
			&& second.toLocaleUpperCase() !== second	// not all UPPER
		;
		if (!isName) {
			return;
		}
		name = {first, last};
	});
	return name;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.defaultSort = defaultSort;
	module.exports._defaultSort = _defaultSort;	// testing
	module.exports.getName = getName;
}
