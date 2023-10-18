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

		function art(birth='', death='') {
			return `{{Artysta infobox
				|  pseudonim            = Gal
				|  grafika              = 
				|  opis grafiki         = 
				|  data urodzenia       = ${birth}
				|  data śmierci         = ${death}
				|  miejsce urodzenia    = 
			   }}
			   [[Kategoria:Koptyko]]
		   `.replace(/\n\t+/g, '\n');
		}

		it('should add birth category from year', function () {
			let result, year;

			result = bioSort._defaultSort('Zenon Życzeniowy', art(''));
			assert.equal(result, false, 'no year, no cat');
			
			year = '1234';
			result = bioSort._defaultSort('Zenon Życzeniowy', art(year));
			assert.isTrue(result.indexOf('Kategoria:Urodzeni w ' + year) > 0, result);

			result = bioSort._defaultSort('Zenon Życzeniowy', art(`[[${year}]]`));
			assert.isTrue(result.indexOf('Kategoria:Urodzeni w ' + year) > 0, result);
		});
		it('should add birth category from date', function () {
			let result, year;
			year = '1234';
			result = bioSort._defaultSort('Zenon Życzeniowy', art(`[[21 lutego]] [[${year}]]`));
			assert.isTrue(result.indexOf('Kategoria:Urodzeni w ' + year) > 0, result);
			result = bioSort._defaultSort('Zenon Życzeniowy', art(`21 lutego [[${year}]]`));
			assert.isTrue(result.indexOf('Kategoria:Urodzeni w ' + year) > 0, result);
			result = bioSort._defaultSort('Zenon Życzeniowy', art(`21 lutego ${year}`));
			assert.isTrue(result.indexOf('Kategoria:Urodzeni w ' + year) > 0, result);
		});

		it('should add death category', function () {
			let result, year;

			result = bioSort._defaultSort('Zenon Życzeniowy', art(''));
			assert.equal(result, false, 'no year, no cat');
			
			year = '1234';
			result = bioSort._defaultSort('Zenon Życzeniowy', art('', year));
			assert.isTrue(result.indexOf('Kategoria:Zmarli w ' + year) > 0, result);

			result = bioSort._defaultSort('Zenon Życzeniowy', art('', `[[${year}]]`));
			assert.isTrue(result.indexOf('Kategoria:Zmarli w ' + year) > 0, result);
		});
		
		it('should add all categories', function () {
			let result, year;
			year = '1234';
			birthYear = '1321';
			result = bioSort._defaultSort('Zenon Życzeniowy', art(birthYear, `[[17 października]] [[${year}]]`));
			assert.isTrue(result.indexOf('Kategoria:Zmarli w ' + year) > 0, result);
			assert.isTrue(result.indexOf('Kategoria:Urodzeni w ' + birthYear) > 0, result);
		});
	});
});
