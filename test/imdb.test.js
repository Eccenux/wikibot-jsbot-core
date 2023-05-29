/* global require, describe, it */
const { assert } = require('chai');
const bot = require('../NuxJsBot');
const imdb = bot.imdb;
// const chai = require('chai');
// const assert = chai.assert;

describe('imdb', function () {
	
	describe('Link text cleanup', function () {
		function test(text, expectedText) {
			// wrap
			if (!text.startsWith('[')) {
				text = `[http://www.imdb.com/name/nm0091906/bio  ${text}]`;
			}
			if (typeof expectedText !== 'string') {
				expectedText = 'Hideyo Amamoto';
			}
			let result = imdb(text);
			let resultText = result.replace(/\{\{IMDb\|osoba\|[0-9]+\|([^}]+)\}\}/, '$1');
			if (resultText !== expectedText) {
				console.log({text, result, resultText, expectedText});
			}
			assert.equal(resultText, expectedText);
		}
		it('should remove w bazie', function () {
			test('Hideyo Amamoto w bazie imdb.com (en)');
			test('Hideyo Amamoto w imdb.com (en)');
			test('Hideyo Amamoto w imdb.com (ang.)');
			test('Hideyo Amamoto - imdb.com');
			test('Hideyo Amamoto  - imdb.com');
			test('Hideyo Amamoto, IMDB');
			test('Hideyo Amamoto na Internet Movie Database');
		});
		it('should remove na imdb', function () {
			test('Hideyo Amamoto na imdb.com (ang.)');
		});
		it('should remove bot title mark', function () {
			//imdb(`[https://www.imdb.com/name/nm0246994/bio Sheila E. – Biography<!-- Tytuł wygenerowany przez bota -->].`)
			test('Hideyo Amamoto<<<0>>>');
			test('Hideyo Amamoto<<<1>>>');
			test('Hideyo Amamoto<<<12>>>');
			test('Hideyo Amamoto<<<197>>>');
		});
		
		it('should resolve empty', function () {
			let expected = `Notka biograficzna`;
			test(`[http://www.imdb.com/name/nm0355181/bio http://www.imdb.com/name/nm0355181/bio]`, expected)
			test(`[http://www.imdb.com/name/nm0355181/bio imdb]`, expected)
		});
	});
	describe('After link cleanup', function () {
		function test(text, expected) {
			// wrap
			let result = imdb(text);
			if (result !== expected) {
				console.log({text, result, expected});
			}
			assert.equal(result, expected);
		}
		it('should remove w bazie', function () {
			// remove
			let expected = `{{IMDb|osoba|0091906|Nikita Bogosłowski}}`;
			test(`[http://www.imdb.com/name/nm0091906/bio  Nikita Bogosłowski] w bazie [[IMDb]]`, expected);
			// keep addition
			test(`[http://www.imdb.com/name/nm0091906/bio  Nikita Bogosłowski], [[IMDb]], abc`, expected + `, abc`);
			test(`[http://www.imdb.com/name/nm0091906/bio  Nikita Bogosłowski]. [[IMDb]]. abc`, expected + `. abc`);
			// extra
			test(`[http://www.imdb.com/name/nm0091906/bio?ref_=nm_ov_bio_sm Nikita Bogosłowski] – biografia w IMDb {{lang|en}}`, expected);
			test(`[https://www.imdb.com/name/nm0091906/?ref_=nv_sr_1 Nikita Bogosłowski] w bazie danych [[IMDb]]`, expected);
			test(`[https://www.imdb.com/name/nm0091906/?ref_=nv_sr_1 Nikita Bogosłowski] w bazie danych [[IMDb.com]]`, expected);
		});
		it('should remove w bazie i en', function () {
			let expected = `{{IMDb|osoba|0552222|Duane Martin}}`;
			test(`[http://www.imdb.com/name/nm0552222/bio Duane Martin] {{lang|en}}`, expected)
			test(`[http://www.imdb.com/name/nm0552222/bio Duane Martin] w bazie [[IMDb|Internet Movie Database]]`, expected)
			test(`[http://www.imdb.com/name/nm0552222/bio Duane Martin]. [[IMDb|Internet Movie Database]]. {{lang|en}}`, expected)
			test(`[http://www.imdb.com/name/nm0552222/bio Duane Martin], [[IMDb|Internet Movie Database]], {{lang|en}}`, expected)
		});
		it('should keep data dostępu', function () {
			let expected = `{{IMDb|osoba|0471086|Marco Kreuzpaintner}} [dostęp 2010-05-08]`;
			test(`[http://www.imdb.com/name/nm0471086/bio Marco Kreuzpaintner]. [[IMDb|Internet Movie Database]]. {{lang|en}} [dostęp 2010-05-08]`, expected)
			test(`[http://www.imdb.com/name/nm0471086/bio Marco Kreuzpaintner] [[IMDb|Internet Movie Database]] [dostęp 2010-05-08]`, expected)
			test(`[http://www.imdb.com/name/nm0471086/bio Marco Kreuzpaintner] [[Internet Movie Database]] [dostęp 2010-05-08]`, expected)
			test(`[http://www.imdb.com/name/nm0471086/bio Marco Kreuzpaintner] [dostęp 2010-05-08]`, expected)
		});
	});

	describe('imdb awards', function () {
		function test(text, expected) {
			// wrap
			let result = imdb(text);
			if (result !== expected) {
				console.log({text, result, expected});
			}
			assert.equal(result, expected);
		}
		it('should convert to awards', function () {
			let expected = `{{IMDb|osoba nagrody|0000040|Stanley Kubrick}}`;
			test(`[https://www.imdb.com/name/nm0000040/awards Stanley Kubrick]`, expected);
		});
		it('should remove w bazie', function () {
			// remove
			let expected = `{{IMDb|osoba nagrody|0000134|Nagrody Roberta De Niro}}`;
			test(`[http://www.imdb.com/name/nm0000134/awards Nagrody Roberta De Niro] w bazie IMDb {{lang|en}}`, expected);
		});
		it('should remove awards', function () {
			// remove
			let expected = `{{IMDb|osoba nagrody|0122782|Marilyn Burns}}`;
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd Marilyn Burns − Awards]`, expected);
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd Marilyn Burns − Award − IMDb]`, expected);
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd Marilyn Burns − nagrody]`, expected);
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd Marilyn Burns − lista nagród]`, expected);
		});
		it('should remove quotes', function () {
			// remove
			let expected = `{{IMDb|osoba nagrody|0122782|Marilyn Burns}}`;
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd "Marilyn Burns"]`, expected);
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd 'Marilyn Burns']`, expected);
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd „Marilyn Burns”]`, expected);
			test(`[http://www.imdb.com/name/nm1488800/awards?ref_=nm_awd "Ti West − Award − IMDb"]. imdb.com. {{lang|en}} [dostęp 2013-12-12]`, `{{IMDb|osoba nagrody|1488800|Ti West}} [dostęp 2013-12-12]`);
		});
		it('should keep single quote', function () {
			// remove
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd Marilyn Burns']`, `{{IMDb|osoba nagrody|0122782|Marilyn Burns'}}`);
			test(`[http://www.imdb.com/name/nm0122782/awards?ref_=nm_awd Marilyn Burn's]`, `{{IMDb|osoba nagrody|0122782|Marilyn Burn's}}`);
		});
	});

	describe('imdb redir', function () {
		function test(text, expected) {
			// wrap
			let result = imdb(text);
			if (result !== expected) {
				console.log({text, result, expected});
			}
			assert.equal(result, expected);
		}
		it('should convert to awards', function () {
			test(`[[IMDb.com]]`, `[[IMDb]]`);
			test(`[[IMDb.com|abc]]`, `[[IMDb|abc]]`);
		});
	});
});
