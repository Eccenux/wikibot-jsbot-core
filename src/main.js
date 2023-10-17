const { NuxJsBot, logTag } = require("./NuxJsBot");

// bot instance
const jsbot = new NuxJsBot();

// run when WP:SK is fully ready
mw.hook('userjs.wp_sk.redir.done').add(function (wp_sk, hasRedirs) {
	console.log(logTag, 'redir done', wp_sk, hasRedirs);
	jsbot.run(wp_sk);
});

// export
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
