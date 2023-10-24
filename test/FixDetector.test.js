const { assert } = require('chai');
const { describe } = require('mocha');

const { FixDetector } = require('../src/Fixabilly/FixDetector');

describe('FixDetector', () => {
	let detector;

	beforeEach(() => {
		detector = new FixDetector();
	});

	it('should add a new detector', () => {
		detector.addDetector(/pattern/, 'Pattern Detector');
		assert.strictEqual(detector.detectors.length, 1);
	});

	it('should detect matches using RegExp detector', () => {
		detector.addDetector(/potent/, 'Potent Detector');
		const text = 'This text contains the word "potential" and "potent".';
		const results = detector.detect(text);
		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].title, 'Potent Detector');
		assert.strictEqual(results[0].count, 2);
	});

	it('should detect matches using Function detector', () => {
		detector.addDetector(text => text?.match(/ - /g)?.length ?? 0, 'Dash Count');
		const text = `
			abc - 123 - x
			def - ghi
			aaa-1
		`;
		const expected = 3;
		const results = detector.detect(text);
		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].title, 'Dash Count');
		assert.strictEqual(results[0].count, expected);
	});
});
