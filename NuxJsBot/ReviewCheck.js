/* global mw, Promise */

/**
 * Check if pages are reviewed.
 */
class ReviewCheck {

	/**
	 * Check pages.
	 * @param {NodeList} links Page links to check.
	 * @returns {Promise}
	 */
	check(links) {
		let titles = this.extractTitles(links);
		let result = new Promise((resolve, reject) => {
			this.checkReviewed(titles).then(resolve, reject);
		});
		return result;
	}
	
	/**
	 * Check reviewed.
	 * @param {Array} titles {t:title, a:node}
	 * @returns {Promise}
	 */
	checkReviewed(titles) {
		let result = new Promise((resolve, reject) => {
			const api = new mw.Api();
			api.get( {
				action: 'query',
				prop: 'flagged',
				titles: titles.map(o=>o.t),
			} ).done( ( data ) => {
				let pages = Object.values(data.query.pages);
				console.log('done', pages);
				let reviewed = this.findReviewed(pages);
				let rTitles = reviewed.map(r=>r.title);
				let result = {
					reviewed: titles.filter(o=>rTitles.indexOf(o.t)>=0),
					stale: titles.filter(o=>rTitles.indexOf(o.t)<0),
				}
				console.log('done', {rTitles, result});
				resolve(result);
			} ).fail( () => {
				console.error('failed to get reviewd data');
				reject();
			} );
		});
		return result;
	}

	/**
	 * Find reviewd pages in the set.
	 * 
	 * prop=flagged spec:
	 * https://www.mediawiki.org/wiki/Extension:FlaggedRevs#prop=flagged
	 * 
	 * @param {Array} pages Array of objects that are returned by a query with prop=flagged.
	 * @returns {Array} Filtered array of page objects.
	 */
	findReviewed(pages) {
		return pages.filter(page => {
			// was reviewed at all
			if ('flagged' in page) {
				// doesn't have pending changes
				if (!('pending_since' in page.flagged)) {
					return true;
				}
			}
			return false;
		});
	}

	/**
	 * Extract titles from node.
	 * 
	 * Skips non-article pages.
	 * 
	 * @param {NodeList} links Page links to check.
	 * @returns {Array} {t:title, a:a}
	 */
	extractTitles(links) {
		let titles = [];
		for (const a of links) {
			let title = this.extractTitle(a);
			if (title && title.length) {
				titles.push({t:title, a:a});
			}
		}
		return titles;
	}

	/**
	 * Extract article title from node.
	 * 
	 * Skips non-article pages.
	 * 
	 * @param {Node} a 
	 */
	extractTitle(a) {
		const u = new URL(a.href);
		let title = decodeURIComponent(u.pathname.replace(/\/wiki\//, ''));
		const mwT = mw.Title.newFromText(title);
		if (mwT.namespace != 0) {
			return '';
		}
		return mwT.getPrefixedText();
	}
}

/*
// mark unreviewed
var reviewCheck = new ReviewCheck();
var links = document.querySelectorAll('.mw-search-results a');
reviewCheck.check(links).then((result) => {
	result.stale.forEach(o => {
		o.a.style.cssText = 'background:yellow;';
	});	
});
*/