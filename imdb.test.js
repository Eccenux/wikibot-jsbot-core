var bot = require('./NuxJsBot');
var imdb = bot.imdb;

/* global imdb */
function test(text) {
	// wrap
	text = `[http://www.imdb.com/name/nm0091906/bio  ${text}]`;
	return imdb(text);
}
test('Biografia Hideyo Amamoto w bazie imdb.com (en)');
test('Biografia Hideyo Amamoto w imdb.com (en)');
test('Biografia Hideyo Amamoto w imdb.com (ang.)');
test('Biografia Hideyo Amamoto na imdb.com (ang.)');

function t(text) {
	// wrap
	let after = imdb(text);
	console.log(after);
	return after;
}
t(`[http://www.imdb.com/name/nm0091906/bio  Nikita Bogosłowski] w bazie [[IMDb]]`)
t(`[http://www.imdb.com/name/nm0091906/bio  Nikita Bogosłowski], [[IMDb]], abc`)
//imdb(`[https://www.imdb.com/name/nm0246994/bio Sheila E. – Biography<!-- Tytuł wygenerowany przez bota -->].`)
t(`[https://www.imdb.com/name/nm0246994/bio Sheila E. – Biography<<<2>>>]`)
t(`[http://www.imdb.com/name/nm0351842/bio Biografia na imdb] {{lang|en}}`)
t(`[http://www.imdb.com/name/nm0552222/bio Duane Martin] w bazie [[IMDb|Internet Movie Database]]`)
t(`[http://www.imdb.com/name/nm0471086/bio Marco Kreuzpaintner − biography]. [[IMDb|Internet Movie Database]]. {{lang|en}} [dostęp 2010-05-08]`)
t(`[http://www.imdb.com/name/nm0826594/bio Biografia Katherine Stenholm, IMDB]`)
t(`[http://www.imdb.com/name/nm4703025/bio Emily Bett Rickards bio - imdb.com]`)
t(`[http://www.imdb.com/name/nm0017982/bio?ref_=nm_ov_bio_sm Dragoljub Aleksić] – biografia w IMDb {{lang|en}}`)
t(`[http://www.imdb.com/name/nm0355181/bio http://www.imdb.com/name/nm0355181/bio]`)
t(`[https://www.imdb.com/name/nm1047336/?ref_=nv_sr_1 Billy Graham] w bazie danych [[IMDb]]`)
t(`[http://www.imdb.com/name/nm0324162/ Armando Robles Godoy na Internet Movie Database]`)

console.log('done');