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
		// add birth cat. from infobox
		const paramRe = /\|\s*data urodzenia\s*=\s*\[*([0-9]+)/;
		const match = str.match(paramRe);
		if (match && match[1]) {
			const year = match[1];
			const category = `[[Kategoria:Urodzeni w ${year}]]`;
			str += '\n' + category;
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
