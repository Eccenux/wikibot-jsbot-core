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

const { Fixabilly } = require("./Fixabilly/Fixabilly");
const { extraSk } = require("./extraSk");
const { cleanerReflist } = require("./mods/cleanerReflist");
var logTag = '[jsbot]';

class NuxJsBot {
	constructor() {
		this.linkPrepDone = false;
		this.botParam = 'js_bot_ed=1';
		this.skipDiffParam = 'js_bot_nd=1';
	}

	/**
	 * Prepare and execute WP:SK.
	 * 
	 * @param {wp_sk} wp_sk Should be ready for execution.
	 */
	run(wp_sk) {
		if (this.isAutoBotEnabled()) {
			let justBot = mw.config.get('wgNamespaceNumber') != 0; // WP:SK only for articles
			this.execute(wp_sk, justBot);
		}
	}

	/** Check for auto-run. */
	isAutoBotEnabled() {
		var model = mw.config.get('wgPageContentModel');
		if (model === "javascript") {
			return false;
		}
		if (location.search.search(this.botParam)>0) {
			return true;
		}
		return false;
	}

	/**
	 * Execute WP:SK.
	 * 
	 * @param {wp_sk} wp_sk Should be ready for execution.
	 * @param {boolean} justBot true = Just run `extraSk()`.
	 */
	execute(wp_sk, justBot) {
		wp_sk.NuxJsBot__summary = []; // our summary list

		// R not in bot
		wp_sk_r_replace_enabled = false;

		// no cats: ludzie wstawiają sobie komentarze w kategorie...
		wp_sk.cleanerMagicLinks = (str) => str;

		// prep. bocik
		this.prepareSk(wp_sk);
		
		let input = document.getElementById('wpTextbox1');
		if (!justBot) {
			wp_sk.NuxJsBot__summary.push('[[WP:SK]]');
			// auto-run
			wp_sk.cleanup(input);
		} else {
			// auto-run with a customCleaner only
			wp_sk.cleanup(input, function(str) {
				str = extraSk(str, wp_sk.NuxJsBot__summary);
				return str;
			});
		}

		// editor toogle
		this.setupToggles();

		// diff & scroll
		this.autoDiff();
	}

	/** Auto-click on diff button. */
	autoDiff() {
		// auto-diff
		setTimeout(() => {
			// scroll on diff load
			let onLoaded = () => {
				document.getElementById('wpSummaryLabel')?.closest('.editOptions')?.scrollIntoView({
					block: 'end'
				});
			};

			// mw.hook...
			const observer = new MutationObserver(() => {
				const diff = document.querySelector('.diff');
				if (diff) {
					observer.disconnect();
					onLoaded();
				}
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});

			// diff-click
			document.getElementById('wpDiff')?.click();
		}, 100);
	}

	/** Setup toggles in bot mode. */
	setupToggles() {
		// Toggle editor
		this.setupBtnToggle({
			label: 'Toggle editor',
			selector: '.wikiEditor-ui',
		});
		// Toggle editor
		this.setupBtnToggle({
			label: 'Toggle preview',
			selector: '#wikiPreview',
		});
	}

	/**
	 * Setup toggle in bot mode.
	 * 
	 * Note! This assumes CSS for .is-shown is added (and assumes default is hidden).
	 * 
	 * @param {Object} o 
	 * @returns 
	 */
	setupBtnToggle(o) {
		// Create button
		const toggleButton = document.createElement('button');
		toggleButton.type = 'button';
		toggleButton.className = 'jsbot-button';
		toggleButton.textContent = o.label;

		// Add click handler
		if (o.selector) {
			toggleButton.addEventListener('click', () => {
				const editorUi = document.querySelector(o.selector);
				if (editorUi) {
					editorUi.classList.toggle('is-shown');
				}
			});
		}

		// Append to first .editButtons
		const editButtons = document.querySelector('.editButtons');
		if (editButtons) {
			editButtons.appendChild(toggleButton);
		}

		return toggleButton;
	}

	/* Select node (range selection). */
	selectNode(nodeSel) {
		var node = document.querySelector(nodeSel);
		if (!node) {
			console.warn(logTag, 'node not found', nodeSel);
		}
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(node);
		selection.removeAllRanges();
		selection.addRange(range);
	}
	/**
	 * Prepare search page for mass-edit.
	 */
	prepareSearch(skipDiff) {
		if (!this.linkPrepDone) {
			$('.searchResultImage-thumbnail').remove();
			var me = this;
			$('.mw-search-results a').each(function() {
				//console.log(this.href)
				this.href += '?action=edit&' + me.botParam;
				if (skipDiff) {
					this.href += '&' + me.skipDiffParam;
				}
				this.href = this.href.replace(/\?.+\?/, '?');
			});
		}
		this.linkPrepDone = true;
		this.selectNode('.mw-search-results-container');
	}
	/**
	 * Prepare WP:SK for execution (add custom procedures).
	 * @param {wp_sk} wp_sk 
	 */
	prepareSk(wp_sk) {
		wp_sk.cleanerReflist = cleanerReflist;

		// dodatki do procesu SK (po zwinięciu nowiki, komentarzy itp)
		var orig_cleanerWikiVaria = wp_sk.cleanerWikiVaria;
		wp_sk.cleanerWikiVaria = function(str) {
			// orig
			str = orig_cleanerWikiVaria.apply(this, arguments);

			str = extraSk(str, wp_sk.NuxJsBot__summary);

			return str;
		};
		
		wp_sk.warning = function() {
			var changes = '0';
			if (!wp_sk.nochanges) {
				changes = '1';
				document.getElementById('wpSummary').value = Array.from(new Set( wp_sk.NuxJsBot__summary )).join(', ');
				// drób
				document.getElementById('wpMinoredit').checked = true;
				// don't watch
				// document.getElementById('wpWatchthis').checked = false;
			} else {
				console.warn(logTag, 'brak zmian');
			}
			document.getElementById('wpSummary').insertAdjacentHTML('afterend', `<span id="jsbot-sk-done" data-changes="${changes}"/>`);
			// auto-diff
			if (location.search.search(this.skipDiffParam) < 0) {
				$('#wpDiff').click();
			}

			// Fixabilly integration
			const fixabilly = new Fixabilly();
			const input = document.getElementById('wpTextbox1');
			fixabilly.detect(input.value);
		}
	}
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.NuxJsBot = NuxJsBot;
	module.exports.logTag = logTag;
}

