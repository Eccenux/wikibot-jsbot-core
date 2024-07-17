JsBot 
==========================

Simple JS ~bot based on WP:SK.

(tags: jsbot, botjs, botskjs, js-bot)

Procedura:

0. Włącz/sprawdź ładowanie jsbot.
1. Zmiany w kodzie (w `extraSk.js`):
	- [XOR] Nowy moduł, testy i wywołwanie w funkcji `#permSk()`.
	- [XOR] Nowy moduł, tymczasowy i wywołwanie w funkcji `#tempSk()`.
	- [XOR] Nowy regexp w funkcji `#minorSk()`.
2. (temp) [[Specjalna:Uprawnienia/Nux]] (włącz [[Wikipedia:Użytkownicy o ukrytej aktywności]]).
3. (temp) monobook.
4. Przygotowanie wyszukiwania (linki do bot-edycji):
	```
	jsbotsk_search_prep();
	```
5. (temp, opcjonalne) Wyłączenie obrazków (AdBlocker Ultimate).

X. Powrót tymczasowych zmian.


Zamiast pkt 4. można też uruchomić pół-automat (automat nadzorowany):
https://github.com/Eccenux/wikibot-jsbot-runner

Potrzebny jest Chrome Canary.
