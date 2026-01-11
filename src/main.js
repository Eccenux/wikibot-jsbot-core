const { NuxJsBot, logTag } = require("./NuxJsBot");

// bot instance
const jsbot = new NuxJsBot();

// export: main
window.NuxJsBot_jsbot = jsbot;

if (jsbot.isAutoBotEnabled()) {
	// disable redirs (makes things faster, doesn't require preview)
	window.wp_sk_redir_enabled = false;
	// R not in bot
	wp_sk_r_replace_enabled = false;

	// run when WP:SK is ready
	mw.hook('userjs.wp_sk.ready').add(function (wp_sk) {
		mw.hook('wikiEditor.toolbarReady').add(function ($textarea) {
			console.log(logTag, 'toolbarReady', wp_sk, {$textarea});
			jsbot.run(wp_sk);

			// extra for hidden img
			setTimeout(() => {
				document.querySelectorAll('#wikiEditor-section-main .group-custom img')?.forEach(img => {
					if (img.alt) img.parentElement.setAttribute('data-alt', img.alt);
					if (img.title) img.parentElement.setAttribute('title', img.title);
				});
			}, 3000);
		});
	});
}

// export: helper on search page
window.jsbotsk_search_prep = function(skipDiff) {
	jsbot.prepareSearch(skipDiff);
};

// bio sort
const bioSortPrep = require('./bioSortPrep');
window.jsbotsk_biosort_prep = function(skipDiff) {
	bioSortPrep.prepareSearch();
	jsbot.prepareSearch(skipDiff);
};

// extra
const { ReviewCheck } = require("./ReviewCheck");
window.ReviewCheck = ReviewCheck;
