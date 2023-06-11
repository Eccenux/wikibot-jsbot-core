
/**
 * SkTableHide tests
 */
var tables = new SkTableHide();

var res;

// test indexes
res = tables.findAll('abcabcaaaba', 'a');
console.log(res);

// test hide
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
|}
after
`;
res = tables.hide(str);
console.log('hide', res);
// test undo
var resShow = tables.show(res);
console.log('resShow', resShow);
if (resShow === str) {
	console.log('OK :)');
} else {
	console.error('Not the same!', {resShow, str});
}

// test conditional show
var resPartial = tables.showIf(res, (text) => text.search(/^\{\|.+class.+wikitable/) < 0);
console.log('resPartial', resPartial);
var resFull = tables.show(resPartial);
console.log('resFull', resFull);
if (resFull === str) {
	console.log('OK :)');
} else {
	console.error('Not the same!', {resFull, str});
}
