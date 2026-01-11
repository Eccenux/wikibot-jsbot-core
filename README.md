JsBot 
==========================

Prosty ~bot w stylu AWB oparty na WP:SK.

Program działa w trakcie edycji na stronie, ale ze specjalnym parametrem. Zmiany uruchamiane są wówczas automatycznie, ale można wprowadzania poprawki automatu lub dodatkowe zmiany ręcznie. Dostępny jest normalny edytor, choć domyślnie ukryty.

Parametry specjalne:
- botParam = 'js_bot_ed=1' – uruchomienie auto-edycji (zmian bota). Dodawane do wyszukiwania przez `jsbotsk_search_prep()`.
- skipDiffParam = 'js_bot_nd=1' – pominięcie uruchamiania diffa. Dodawane do wyszukiwania przez `jsbotsk_search_prep(true)`.

(tags: jsbot, botjs, botskjs, js-bot)

## Procedura

### Przygotowanie
0. Włącz/sprawdź ładowanie jsbot.
1. Zmiany w kodzie (w `extraSk.js`):
	- [XOR] Nowy moduł, testy i wywołanie w funkcji `#permSk()`.
	- [XOR] Nowy moduł, tymczasowy i wywołanie w funkcji `#tempSk()`.
	- [XOR] Nowy regexp w funkcji `#minorSk()`.
2. (temp) [[Specjalna:Uprawnienia/Nux]] (włącz [[Wikipedia:Użytkownicy o ukrytej aktywności]]).
3. (temp, opcjonalnie) Ustaw skórkę Książka.
4. (temp, opcjonalnie) Wyłącz podgląd przy edycji.
5. (temp, opcjonalnie) Wyłączenie obrazków (e.g [Image Block (Hemant Vats)](https://addons.mozilla.org/en-US/firefox/addon/image-block/)).

### Zmiany stron
1. Wyszukać coś z użyciem `incategory:"nazwa bez ns"`, `hastemplate:"nazwa bez ns"` itp.
2. Posortować po dacie (najlepiej dacie utworzenia).
3. Przejść na **koniec wyników** (zmienić offset). To jest ważne, bo wyniki zmieniają się w trakcie, ale idąc od końca zmienia się tylko koniec.
4. Przygotowanie wyszukiwania (linki do bot-edycji):
	```
	jsbotsk_search_prep();
	```

Zamiast ręcznego nawigowania, otwierania i zapisu można też uruchomić pół-automat (automat nadzorowany):
https://github.com/Eccenux/wikibot-jsbot-runner

### Zakończenie
Powrót tymczasowych zmian:
1. Ustaw skórkę.
2. Włącz podgląd przy edycji.
3. Włącz obrazki (w addon).
