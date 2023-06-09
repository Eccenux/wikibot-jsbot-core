/* eslint-disable no-useless-escape */
/**
 * Simple JS ~bot.
 * 
 * (tags: jsbot, botjs, botskjs, js-bot)
 * 
 * Procedura:	
	0. Włącz/sprawdź ładowanie jsbot.
	1. Nowa funkcja w `prepareSk()` i test.
	2. (temp) [[Specjalna:Uprawnienia/Nux]] (włącz [[Wikipedia:Użytkownicy o ukrytej aktywności]]).
	3. (temp) monobook
	4. Przygotowanie wyszukiwania (linki do bot-edycji):
		```
		jsbotsk_search_prep();
		```
	5. (temp, opcjonalne) Wyłączenie obrazków (reguły uBlock):
		upload.wikimedia.org * image block
		pl.wikipedia.org * image block
	...
	X. Powrót tymczasowych zmian.
 * 
 * @see https://github.com/Eccenux/wikibot-jsbot-core
 * @see https://github.com/Eccenux/wikibot-jsbot-runner
 */
/* global mw */
(function(){
	var logTag = '[jsbot]';

	// include imdb
	// include NuxJsBot

	// bot instance
	const jsbot = new NuxJsBot();
	
	// run when WP:SK is fully ready
	mw.hook('userjs.wp_sk.redir.done').add(function (wp_sk, hasRedirs) {
		console.log(logTag, 'redir done', wp_sk, hasRedirs);
		jsbot.run(wp_sk);
	});

	mw.hook('userjs.wp_sk.button_created').add(function (wp_sk) {
		console.log(logTag, 'button_created', wp_sk);
	});

	// export
	window.jsbotsk_search_prep = function(skipDiff) {
		jsbot.prepareSearch(skipDiff);
	};
})();


