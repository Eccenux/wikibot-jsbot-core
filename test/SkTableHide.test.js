/* eslint-disable array-bracket-newline */
/* global describe, it */
const { assert } = require('chai');
const bot = require('../src/SkTableHide');
const SkTableHide = bot.SkTableHide;

/**
 * SkTableHide tests
 */
describe('SkTableHide', function () {

	var tables = new SkTableHide();

	describe('findAll', function () {

		it('find all letters', function () {
			var res, expected;

			// test indexes
			res = tables.findAll('abcabcaaaba', 'a');
			console.log(res);
			expected = [ 0, 3, 6, 7, 8, 10 ];
			assert.deepEqual(res, expected);
		});
	});

	describe('show-hide', function () {
		var str = `
			before
			{|
			|
			{| class="wikitable"
			| abc
			|}
			|
			{| class="wikitable"
			| def
			|}
			|
			{| class="sortable"
			| def
			|}
			|}
			after
		`.replace(/\n\t+/g, '\n');

		it('must hide and show', function () {
			var res;
			// test hide
			res = tables.hide(str);
			console.log('hide', res);
			// only 2 tables because by default only wikitable is hidden
			assert.isTrue(tables.findAll(res, '<tab<').length === 2, 'must hide 2 tables');
			// test undo
			var resShow = tables.show(res);
			console.log('resShow', resShow);
			assert.equal(resShow, str, 'must undo to the same wikitext');
		});
		it('test conditional show', function () {
			var res;
			res = tables.hide(str);
			console.log('hide', res);
			assert.isTrue(tables.findAll(res, '<tab<').length === 2, 'must hide 2 tables');
			// show table with "def" which should show one of wikitables
			var resPartial = tables.showIf(res, (text) => text.indexOf('def') >= 0);
			console.log('resPartial', resPartial);
			assert.isTrue(tables.findAll(resPartial, '<tab<').length === 1, 'must hide 1 table');
			// should still show the last hidden table
			var resFull = tables.show(resPartial);
			console.log('resFull', resFull);
			assert.equal(resFull, str, 'must be the same');
		});
	});
});
