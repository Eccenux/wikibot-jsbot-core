// for quickDebug
// const { wp_sk } = require("../sk-copy");

const PIPE_ERZAC = '⧱⧱';
/**
 * Escape pipes for inner templates.
 * 
 * @param {string} str can be any wikicode fragment.
 */
function escapePipes(str) {
	let indexes = findTemplates(str);
	let contentParts = [];
	let lastPart = 0;
	for (const part of indexes) {
		let before = str.substring(lastPart, part.start);
		contentParts.push(before);

		let middle = str.substring(part.start, part.end).replace(/\|/g, PIPE_ERZAC);
		contentParts.push(middle);

		lastPart = part.end
	}
	contentParts.push(str.substring(lastPart)); // final part, might be empty
	return contentParts.join('');
}
function unescapePipes(str) {
	return str.replace(new RegExp(PIPE_ERZAC, 'g'), '|');
}

/**
 * Find templates.
 * 
 * Uses state machine search to find all templates that might have sub-templates.
 * 
 * Originally as: `wp_sk.findTemplates`
 * 
 * @param {String} wiki Wikicode.
 * @returns Indexes of templates found [{start, end}].
 */
function findTemplates(wiki) {
	var zaw = wiki;
	var debug = false;
	var result = [];

	function add(start, end) {
		if (debug) {
			console.log('template found: ', {
				start: start,
				end: end
			}, '(' + zaw.substring(start, end) + ')');
		}
		result.push({start: start, end: end});
	}

	var start = zaw.indexOf('{{');
	var lastEnd = zaw.lastIndexOf('}}');
	var state = 'in';
	var sublevel = 0;
	for (var current = start + 2; current < lastEnd;) {
		var chars = zaw.substr(current, 2);
		var found = false;

		// in template
		if (state == 'in') {
			if (chars === '}}') {
				state = 'out';
				found = true;
			} else if (chars === '{{') {
				state = 'sub';
				sublevel = 1;
			}
		// in sub-template
		} else if (state == 'sub') {
			if (chars === '}}') {
				sublevel--;
				if (sublevel <= 0) {
					state = 'in';
				}
			}
			if (chars === '{{') {
				sublevel++;
			}
		// out of template
		} else if (state == 'out') {
			if (chars === '{{') {
				state = 'in';
				start = current;
			}
		}

		if (debug) {
			console.log({
				state: state,
				chars: chars,
				sublevel: sublevel
			});
		}

		// next
		if (chars === '}}' || chars === '}}') {
			current += 2;
		} else {
			current++;
		}
		// template found
		if (found) {
			add(start, current);
		}
	}
	add(start, lastEnd + 2);

	return result;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.escapePipes = escapePipes;
	module.exports.unescapePipes = unescapePipes;
	module.exports.findTemplates = findTemplates;
}
