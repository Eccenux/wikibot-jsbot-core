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
/* global module */
(function(){
	var logTag = '[jsbot]';

	function imdb(after) {
		// redir
		after = after.replace(/\[\[(?:IMDB|Imdb\.com|The Internet Movie Database|Internet Movie Database)([|\]])/ig, '[[IMDb$1');

		// inner text cleanup
		function cleanup(text) {
			text = text.trim()
				.replace(/https?:\/\/www\.imdb\.com\/[^ ]+/, '') // url
				.replace(/<<<[0-9]+>>>$/, '') // .replace('<!-- Tytuł wygenerowany przez bota -->', '')
				.replace(/\((en|ang\.?|język angielski)\)/, '')
				.trim()
				.replace(/^["„](.+)["”]$/, '$1')
				.replace(/ (w|na|[\-–—−]) (\w+ )?(imdb|Internet Movie Database)[\.a-z]*$/i, '')
				.replace(/(^| )imdb[\.a-z]*$/i, '')
				.replace(/[.,\-–—−]$/, '')
				.trim();
			return text;
		}

		// biography
		after = after.replace(/\[https?:\/\/www\.imdb\.com\/name\/nm([0-9a-z]+)\/(?:bio)?(?:\?[^ ]+)? ([^\]]+)\]/g, (a, id, text) => {
			text = cleanup(text);
			if (text.length < 3) {
				text = 'Notka biograficzna';
			}
			return `{{IMDb|osoba|${id}|${text}}}`;
		});
		// awards
		after = after.replace(/\[https?:\/\/www\.imdb\.com\/name\/nm([0-9a-z]+)\/awards(?:\?[^ ]+)? ([^\]]+)\]/g, (a, id, text) => {
			text = cleanup(text)
				.replace(/ ([\-–—−]) (awards?|nagrody|nagroda|lista nagród)$/i, '')
			;
			console.log(`(${text})`);
			if (text.length < 3) {
				text = '';
			}
			return `{{IMDb|osoba nagrody|${id}|${text}}}`;
		});
		// title awards
		after = after.replace(/\[https?:\/\/www\.imdb\.com\/title\/tt([0-9a-z]+)\/awards\/?(?:\?[^ ]+)? ([^\]]+)\]/g, (a, id, text) => {
			text = cleanup(text)
				.replace(/ ([\-–—−]) (awards?|nagrody|nagroda|lista nagród)$/i, '')
			;
			console.log(`(${text})`);
			if (text.length < 3) {
				text = 'lista nagród filmu';
			}
			return `{{IMDb|tytuł nagrody|${id}|${text}}}`;
		});
		// title soundtrack
		after = after.replace(/\[https?:\/\/www\.imdb\.com\/title\/tt([0-9a-z]+)\/soundtrack\/?(?:\?[^ ]+)?( (?:[^\]]+)|)\]/g, (a, id, text) => {
			text = cleanup(text)
				.replace(/ ([\-–—−]) (soundtrack|[Śś]cieżka dźwiękowa)$/i, '')
				.replace(/^(soundtrack|[Śś]cieżka dźwiękowa do)/i, '')
				.trim()
			;
			console.log(`(${text})`);
			if (text.length < 3) {
				text = 'filmu';
			}
			return `{{IMDb|soundtrack|${id}|${text}}}`;
		});
		// title
		after = after.replace(/\[https?:\/\/www\.imdb\.com\/title\/tt([0-9a-z]+)\/?(?:\?[^ ]+)?( (?:[^\]]+)|)\]/g, (a, id, text) => {
			text = cleanup(text);
			console.log(`(${text})`);
			if (text.length < 3) {
				text = 'Film';
			}
			return `{{IMDb|tytuł|${id}|${text}}}`;
		});

		// stuff after link/template
		after = after.replace(/(\{\{IMDb[^}]+\}\}) \{\{lang\|en\}\}/g, (a, imdb) => imdb);
		//{{IMDb|...}}, [[IMDb]],
		//{{IMDb|...}} w bazie [[IMDb]]
		// – biografia w IMDb
		after = after.replace(/(\{\{IMDb[^}]+\}\})[,.]? (?:(?:w|na|[\-–—−]) )?(?:bazie (?:danych )?|biografia w )?(?:\[\[IMDb(?:\|[^\]]+)?\]\]|imdb[.a-z]*)([,.]?)/ig, (a, imdb, dot) => imdb + dot);
		after = after.replace(/(\{\{IMDb[^}]+\}\})[,.]? \{\{lang\|en\}\}/g, (a, imdb) => imdb);

		return after;
	}

	// export
	if (typeof module === 'object' && module.exports) {
		module.exports.imdb = imdb;
	}
})();

