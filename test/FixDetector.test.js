const { assert } = require('chai');
const { describe } = require('mocha');

const { FixDetector } = require('../src/Fixabilly/FixDetector');
const { dashDetector } = require('../src/Fixabilly/dashDetector');

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

	it('should only return successfull detector', () => {
		detector.addDetector(/potent/, 'Potent Detector');
		detector.addDetector(/potent2/, 'Potent2 Detector');
		const text = 'This text contains the word "potential" and "potent".';
		const results = detector.detect(text);
		assert.strictEqual(results.length, 1);
		assert.strictEqual(results[0].title, 'Potent Detector');
	});

	describe('dashDetector', () => {
		it('should not match an image in infobox', () => {
			detector.addDetector(dashDetector, 'Dash Count');
			const text = `
				{{Artysta infobox
				|imię i nazwisko       = Janina Siedakowa - Kowalska
				|imię i nazwisko org   = 
				|pseudonim             = 
				|grafika               = Paris - Salon du livre 2012 - 001.jpg
				|logo                  = Paris - Salon du livre 2012 - 001.png
				|herb                  = Paris - Salon du livre 2012 - 001.svg
				|hymn1                 = Paris - Salon du livre 2012 - 001.ogg
				|hymn2                 = Paris - Salon du livre 2012 - 00ż.mp4
				}}
				Abc.
			`.replace(/(\r?\n)\t+/g, '$1');
			const expected = 1;
			const results = detector.detect(text);
			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].title, 'Dash Count');
			assert.strictEqual(results[0].count, expected);
		});
		it('should not match an image in text', () => {
			detector.addDetector(dashDetector, 'Dash Count');
			const text = `
				[[Plik:Paris - Salon du livre.jpg|thumb|240px|Janina Kowalska we Florencji, 2006]]
				[[File:Paris - Salon du livre.jpg|thumb|Janina Kowalska we Florencji, 2006]]
				[[Plik:Paris - Salon du livre.jpg|thumb]]
				[[Plik:Paris - Salon du livre.jpg|thumb|Paris - Salon [[2020]]]]
				[[Plik:Paris - Salon du livre.jpg|thumb|Paris - Salon]]
				[[File:Paris - Salon du livre.jpg]]Paris - Salon [[2020]].
			`.replace(/(\r?\n)\t+/g, '$1');
			const expected = 3;
			const results = detector.detect(text);
			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].title, 'Dash Count');
			assert.strictEqual(results[0].count, expected);
		});

		it('should not match image names in gallery', () => {
			detector.addDetector(dashDetector, 'Dash Count');
			const text = `
				<gallery widths="200px" heights="160px">
				Paris - Salon du livre1.jpg|Janina Kowalska we Florencji, 2006
				Paris - Salon du livre2.jpg|Janina Kowalska we [[Florencji]], 2006
				Paris - Salon du livre3.jpg
				Paris - Salon du livre4.jpg|Paris - Salon [[2020]]
				Paris - Salon du livre5.jpg|Paris - Salon
				</gallery>
				Paris - Salon [[2020]].
			`.replace(/(\r?\n)\t+/g, '$1');
			const expected = 3;
			const results = detector.detect(text);
			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].title, 'Dash Count');
			assert.strictEqual(results[0].count, expected);
		});
	});
});
