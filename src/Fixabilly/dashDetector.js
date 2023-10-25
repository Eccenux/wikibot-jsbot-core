/**
 * Detect dashes.
 * 
 * Might be Polish specific.
 * @param {String} origText 
 * @returns n > 0 number of matches
 */
function dashDetector(origText) {
	let text = origText;
	// remove obvious images
	text = text.replace(/\[\[Plik:/ig, '[[File:');
	text = text.replace(/\[\[File:.+?[\|\]]/ig, '');
	// remove infobox images
	text = text.replace(/= [^\|]+[0-9a-żółćęśąźń]\.[a-z][^\|]+/ig, '=\n');
	// detect 
	return text?.match(/ - /g)?.length ?? 0;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.dashDetector = dashDetector;
}
