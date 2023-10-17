/* global require, describe, it */
const { assert } = require('chai');
const { checkTitle } = require('../src/bioSortPrep');
// const chai = require('chai');
// const assert = chai.assert;

describe('bioSortPrep', () => {
	describe('checkTitle', () => {
		it('powinno zwrócić true dla normalnego tytułu', () => {
			const title = "John Doe";
			const result = checkTitle(title);
			assert.equal(result, true);
		});
	
		it('powinno zwrócić false dla tytułu z jedną literą', () => {
			const title = "A";
			const result = checkTitle(title);
			assert.equal(result, false);
		});
	
		it('powinno zwrócić false dla tytułu bez spacji', () => {
			let title;
			let result;
			title = "John123";
			result = checkTitle(title);
			assert.equal(result, false);
			title = "John-Karamba";
			result = checkTitle(title);
			assert.equal(result, false);
		});
	
		it('powinno usuwać nawiasy i rozpoznać wyraz-miano', () => {
			let title;
			let result;
			title = "John (123)";
			result = checkTitle(title);
			assert.equal(result, false);
			title = "John (abc)";
			result = checkTitle(title);
			assert.equal(result, false);
		});

		it('powinno usuwać nawiasy i rozpoznać imię i nazwisko', () => {
			let title;
			let result;
			title = "Jan Żabecki (123)";
			result = checkTitle(title);
			assert.equal(result, true);
			title = "Karol Ąęcki (abc)";
			result = checkTitle(title);
			assert.equal(result, true);
		});
	});
});
