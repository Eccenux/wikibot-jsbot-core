/** Detector definition. */
class Detector {
	constructor(detector, title) {
		this.detector = ()=>false;
		// detector types
		if (detector instanceof RegExp) {
			const regex = new RegExp(detector, 'g');
			this.detector = (text) => {
				const matchCount = (text.match(regex) || []).length;
				return matchCount;
			}
		}
		else if (detector instanceof Function) {
			this.detector = detector;
		}
		else {
			console.warn('Unknow detector type');
		}

		this.title = title;
	}
}

/** Result definition. */
class FixResult {
	constructor(detector, count) {
		this.title = detector.title;
		this.count = count;
	}
	/**
	 * Make a match.
	 * @param {String} text .
	 * @param {Detector} detector .
	 */
	static make(text, detector) {
		const count = detector.detector(text);
		if (count) {
			return new FixResult(detector, count);
		}
		return false;
	}
}

/**
 * Detect potential fixes.
 */
export default class FixDetector {
	constructor() {
		this.detectors = [];
	}

	/**
	 * Add a new fix detector.
	 * @param {RegExp|Function} detector Detection regexp or a function working on text
	 * 	(function should return match count).
	 * @param {String} title Short info.
	 */
	addDetector(detector, title) {
		const newDetector = new Detector(detector, title);
		this.detectors.push(newDetector);
	}

	/**
	 * Detect text based on added detectors.
	 * @param {String} text Article text (wikicode).
	 */
	detect(text) {
		const results = this.detectors.map(detector => FixResult.make(detector));
		return results;
	}
}
