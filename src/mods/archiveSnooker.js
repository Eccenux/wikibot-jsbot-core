/**
 * Sprzątanie martwych linków snookerowych.
 * 
 * Przykład:
 * https://pl.wikipedia.org/w/index.php?title=John_Higgins&diff=prev&oldid=74307019
 * 
 * TODO:
 * - linki zew. tj. [http...]
 * - cytuj stronę bez parametru archiwum (nie tylko <ref>, również bibliografia)
 * - cytuj bez parametru archiwum
 * - parametr url w szablonach cytuj musi się zaczynać odpowiednio (wybranym adresem, a nie np. webrachive)
 * - wyciąganie daty dostępu z cytujów?
 *  
 * @param {String} str wikitext z wp_sk (bez nowiki itp)
 * @returns {String} poprawiony str (lub ten sam jeśli nie było zmian)
 */
function archiveSnooker (str)
{
	// data archiwizacji zbliżona do końca serwisu 147.com.pl
	// najnowsze kierują na licytację domeny
	let archive147comDt = `20161115180000`;
	let archive147comDate = `2016-11-15`;
	let archive147plDt = `20201208230000`;
	let archive147plDate = `2020-12-08`;

	// podmiana LZ 147.com.pl na archiwum z okolic 2016 roku (nie na najnowsze!)
	str = str.replace(/\[(http:\/\/147\.com\.pl[^ \]]+)/g, function(a, url) {
		return `[${toArchiveUrl(archive147comDt, url)}`;
	});

	// http://www.snookerworld.pl/ -> https (wszędzie)
	str = str.replace(/http:\/\/www\.snookerworld\.pl\//g, 'https://www.snookerworld.pl/');

	// Uwaga! Wypadałoby mieć tu usuwanie LZ jeśli zostają puste.
	// usuwanie LZ: `* [http://147.pl/`
	str = str.replace(/\n\*\s*\[http:\/\/147\.pl\/.+/g, '');

	// podmiana szablonów cytuj zawierających stare domeny
	// http://147.pl
	// http://147.com.pl
	str = str.replace(/\{\{([cC]ytuj (?:stronę)?)(\s*\|[^\}]+147[^\}]+)\}\}/g, (a, tpl, content)=>{
		// nie ma `url=http://147...`? -> skip
		if (content.search(/[ =]http:\/\/147\.(pl|com\.pl)/) < 0) {
			return a;
		}
		// parametr archiwum? -> skip
		if (content.search(/archiwum\s*=\s*http/) >= 0) {
			return a;
		}

		// usuń archiwum
		content = content.replace(/\|\s*(archiwum|zarchiwizowano)\s*=[^|]*/g, '');

		// pobierz url
		let urlData = {
			date: '',
			url: '',
		}
		content.replace(/url\s*=([^|]+)/, (a, url) => {
			url = url.trim();
			if (url.startsWith('http://147.pl')) {
				urlData.date = archive147plDate;
				urlData.url = toArchiveUrl(archive147plDt, url);
			} else if (url.startsWith('http://147.com.pl')) {
				urlData.date = archive147comDate;
				urlData.url = toArchiveUrl(archive147comDt, url);
			} else {
				console.error('[archiveSnooker]', 'WTF url?', url);
			}
			return '';
		});

		// dodaj archiwum
		// content += `|archiwum = ${urlData.url} |zarchiwizowano= ${urlData.date}`;
		// bez daty (właściwej daty archiwizacji nie znamy)
		content += `|archiwum = ${urlData.url}`;
		return `{{${tpl}${content}}}`;
	});

	return str;
};

function toArchiveUrl(dtString, url) {
	return `https://web.archive.org/web/${dtString}/${encodeURI(url)}`;
}

module.exports.archiveSnooker = archiveSnooker;

// quickTests();

function test(str) {
	let after = archiveSnooker (str);
	console.log(str);
	console.log(after);
}

function quickTests() {
	// nie ruszaj archiwum
	test(`* {{Cytuj 
		|url = http://147.pl/articles.php?_cat=snookerzysci&_id=85
		|archiwum = https://web.archive.org/web/20190809220934/https://wyborcza.pl/7,75400,24963690,dajmy-lasom-posadzic-sie-samym.html 
		|tytuł = Dajmy lasom posadzić się samym 
		}}
	`.replace(/\n[\t ]*/g, ' '));
	// dodaj
	test(`* {{Cytuj 
		|url = http://147.pl/articles.php?_cat=snookerzysci&_id=85
		|tytuł = Dajmy lasom posadzić się samym 
		}}
	`.replace(/\n[\t ]*/g, ' '));
	// usuń archiwum
	test(`* {{Cytuj 
		|url = http://147.pl/articles.php?_cat=snookerzysci&_id=85
		|tytuł = Dajmy lasom posadzić się samym 
		|archiwum = 
		|zarchiwizowano= 2013-09-20
		}}
	`.replace(/\n[\t ]*/g, ' '));
}