/* global require, describe, it */
const { assert } = require('chai');
const bioSort = require('../src/bioSort');
// const chai = require('chai');
// const assert = chai.assert;

describe('bioSort', function () {
	
	describe('getName', function () {
		it('should match name', function () {
			let result;
			result = bioSort.getName('Zenon Życzeniowy');
			assert.hasAllKeys(result, ['first', 'last']);
			
			result = bioSort.getName('Żanet Źródlana-Ślęzak');
			assert.hasAllKeys(result, ['first', 'last']);
			assert.equal(result.last, 'Źródlana-Ślęzak');

			result = bioSort.getName('Klementyna Anna Świca');
			assert.hasAllKeys(result, ['first', 'last']);
			assert.equal(result.first, 'Klementyna Anna');
			assert.equal(result.last, 'Świca');

			result = bioSort.getName('Igor Kopyłow (naukowiec)');
			assert.hasAllKeys(result, ['first', 'last']);
			assert.equal(result.first, 'Igor');
			assert.equal(result.last, 'Kopyłow');
		});
		it('should skip non-name', function () {
			let result;
			result = bioSort.getName('Karolina II Sobieska');
			assert.equal(result, false);
			result = bioSort.getName('Franc IV');
			assert.equal(result, false);
			result = bioSort.getName('Pociąg towarowy');
			assert.equal(result, false);
			result = bioSort.getName('Sopoty');
			assert.equal(result, false);
			result = bioSort.getName('Jezioro śląskie');
			assert.equal(result, false);
		});
	});

	describe('_defaultSort', function () {
		let goodArt = `Abc

			[[Kategoria:Urodzeni w 1992]]
		`.replace(/\n\t+/g, '\n');
		it('should skip by title', function () {
			let result;
			result = bioSort._defaultSort('Pociąg', goodArt);
			assert.equal(result, false);
		});
		it('should add sort', function () {
			let result;
			const sort = '{{SORTUJ:Życzeniowy, Zenon}}';
			result = bioSort._defaultSort('Zenon Życzeniowy', goodArt);
			assert.isTrue(result.indexOf(sort) > 0);
		});
		it('should not duplicate sort', function () {
			let result;
			const sort = '{{SORTUJ:Życzeniowy, Zenon}}';
			result = bioSort._defaultSort('Zenon Życzeniowy', goodArt);
			assert.isTrue(result.indexOf(sort) > 0);
			result = bioSort._defaultSort('Kamila Abecka', result);
			assert.equal(result, false);
		});
		it('should skip too short', function () {
			let result;
			result = bioSort._defaultSort('Zenon Życzeniowy', 'Mało Niczego.');
			assert.equal(result, false);
			result = bioSort._defaultSort('Zenon Życzeniowy', 'Mało Niczego. [[Kategoria:Abc]]');
			assert.equal(result, false);
		});
	});
});
