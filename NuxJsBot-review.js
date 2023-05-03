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