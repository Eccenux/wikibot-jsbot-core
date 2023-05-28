JsBot 
==========================

Simple JS ~bot based on WP:SK.

(tags: jsbot, botjs, botskjs, js-bot)

Procedura:	
0. Włącz ładowanie jsbot.
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


Zamiast pkt 4. można też uruchomić pół-automat (automat nadzorowany):
https://github.com/Eccenux/wikibot-jsbot-runner

Potrzebny jest Chrome Canary.
