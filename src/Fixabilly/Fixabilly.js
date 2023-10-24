const { FixDetector } = require("./FixDetector");

/**
 * Fixability Billy.
 * 
 * Detect potential changes and display them on the edit form.
 */
class Fixabilly {
	constructor() {
		this.detectors = new FixDetector();
		// non-pl quote
		this.detectors.addDetector(/([^=])"([^|"\]})> \n\t.,?;][^"]*?[^=| \n\t]|[^"|{}\[\]]{1,3})"([^>|])/, 'cudzysłów pl');
		// dashes
		this.detectors.addDetector(/ - /, 'pauza');
	}

	/**
	 * Detect and display changes.
	 * @param {String} text 
	 * @returns 
	 */
	detect(text, render=true) {
		const results = this.detectors.detect(text);
		if (render) {
			this.render(results);
		}
		return results;
	}

	/** Show res. */
	render(results) {
		const info = results.map(r=>`${r.title} (${r.count})`).join(', ');
		document.querySelector('.editOptions').insertAdjacentHTML('afterbegin', `<div style="
			border: 1px solid black;
			background: gold;
			padding: .2em .5em;
			margin-bottom: .5em;
		">Potencjał zmian: ${info}.</div>`)
	}
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.Fixabilly = Fixabilly;
}
