/**
 * Filtrowanie wyszukiwania.
 * 
 * Szybki filtr usuwający tytuły z pseudonimem itp.
 */
function prepareSearch() {
	$('.mw-search-result').each(function () {
		let title = this.querySelector('.mw-search-result-heading a')?.textContent;
		if (!title) {
			console.warn('broken title?');
			return;
		}
		// Sprawdzenie tytułu (filtr)
		if (!checkTitle(title)) {
			console.log(`skipping: ${title}`)
			$(this).remove();
		}
	});
}

/**
 * Sprawdzenie czy tytuł jest normalnym imieniem z nazwiskiem (czy mianem).
 */
function checkTitle(rawTitle) {
	// Usunięcie wyrażeń w nawiasach z tytułu.
	let title = rawTitle.replace(/\(.*\)/g, '').trim();

	// Tytułu bez spacji jest zły.
	if (title.search(/ /) < 0) {
		return false;
	}

	// Zenon z Akwinu jest zły.
	if (title.search(/ \w /) >= 0) {
		return false;
	}

	// Mistrz jest zły.
	if (title.startsWith('Mistrz')) {
		return false;
	}

	return true;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.prepareSearch = prepareSearch;
	module.exports.checkTitle = checkTitle;
}
