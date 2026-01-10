const { escapePipes, unescapePipes, findTemplates } = require("../tplParser");

// quickDebug();

/**
 * Tokenize template conent.
 * 
 * Specific in that it allows refs to be a separate thing (escape a parameter).
 * 
 * @param {string} tpl wikicode
 * @returns 
 */
function tokenizeRefParams(tpl) {
	// split by params and refs
	let tokens = ('|'+tpl).split(/(\|[^<=\|]+=|<ref[\s\S]+?<\/ref>)/);
	// console.debug( '----------\n', tpl );
	// console.debug( '----------\n', JSON.stringify(tokens, null, '\t') );
	// ~AST
	let ast = [];
	let item = {};
	let pushAst = () => {
		ast.push(item);
		item = {};
	};
	for (let token of tokens) {
		token = token.trim();
		if (!token) {
			continue;
		}
		if (token.startsWith('|')) {
			item.tokenType = 'PARAM';
			item.name = token.replace(/^\|\s*/,'').replace(/\s*=$/,''); // trim "|DU=" -> "DU"
		} else if (token.startsWith('<ref')) {
			item.tokenType = 'REF';
			item.content = token;
			pushAst();
		} else {
			item.content = token.replace(/^\|\s*/,'').replace(/\s*=$/,'');
			pushAst();
		}
	}
	// console.debug( '----------\n', JSON.stringify(ast, null, '\t') );
	return ast;
}

/**
 * Czyszczenie przypisów-parametrów.
 * 
 * Zmienia to na refy.
 * {{Przypisy
|Council of Europe={{cytuj stronę |...}}
|abecadło={{cytuj|...}}
|kopytko={{Cytuj|...}}
}}
 */
function cleanerRefParams(rawTpl)
{
	// console.debug( '----------\n', rawTpl );

	// needless icon (most articles are behind one)
	let tpl = rawTpl.replace(/\{\{Paywall\}\}/gi, '');

	// no params
	if (tpl.search(/\|\s*([^=|]+)\s*=\s*\{\{/) < 0) {
		return tpl;
	}

	// get actual content
	tpl = tpl
		.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
		.trim()
		.replace(/^\{\{Przypisy\s*\|\s*/, '')
		.replace(/\s*\}\}$/g, '')
	;
	// cleanup
	tpl = tpl
		// .replace(/\s*<ref/g, '\n<ref')
		// .replace(/(\}\}|<\/ref>)\s*\}\}$/, '$1\n}}')
		.replace(/\s*\|\s*\|/g, '|')
		.replace(/\{\{cytuj/g, '{{Cytuj')
		// .replace(/\s*\|\s*([^=|]+)\s*=\s*\{\{/g, '\n|$1={{')
	;

	// escape pipes in tpls
	// tpl = tpl.replace(/\{\{[^}]+\}\}/g, (a) => a.replace(/\|/g, PIPE_ERZAC));
	tpl = escapePipes(tpl);

	let ast = tokenizeRefParams(tpl);
	
	// replace and merge
	tpl = '';
	for (const item of ast) {
		if (item.tokenType == 'PARAM') {
			tpl += `\n<ref name="${item.name}">${item.content}</ref>`;
		} else {
			tpl += '\n'+item.content;
		}
	}

	// unescape
	tpl = unescapePipes(tpl);

	// bring back full tpl
	tpl = `{{Przypisy|\n${tpl.trim()}\n}}`;

	return tpl;
}

/**
 * Czyszczenie z WP:SK + cleanerRefParams.
 */
function cleanerReflist(str)
{
	var startIndex = str.search(/\{\{Przypisy\s*\|/i);
	if (startIndex < 0) {
		//console.log('[wp_sk]', 'no ref template with params found');
		return false;
	}

	var ending = str.substring(startIndex);
	var indexes = findTemplates(ending);
	if (!indexes.length) {
		console.log('[wp_sk]', 'ref template not found');
		return false;
	}

	var part = indexes[0];
	var tpl = ending.substring(part.start, part.end);

	tpl = cleanerRefParams(tpl);

	// spr. resztek po usunięciu przypisów
	var noRefs = tpl
		.replace(/<ref[^>]*>[\s\S]+?<\/ref>/ig, '')
		.replace(/^\{\{\s*\w+/, '') // tpl start
		.replace(/\}\}$/, '') // tpl end
	;
	// console.log(noRefs);

	// nie może zawierać nazwanych parametrów
	// (powinno pominąć `|grupa=uwagi` oraz `|=uwagi`)
	if (noRefs.search(/\|(\s*\w{2,})?\s*=/) >= 0) {
		console.log('[wp_sk]', 'ref template has extra params');
		return false;
	}

	// oczyść zawartość
	// (zostawia samą treść szablonu, bez kodu szablonu)
	var noTpl = tpl
		.replace(/^\{\{\s*\w+/, '') // tpl start
		.replace(/\}\}$/, '') // tpl end
		.trim()
		.replace(/^\|\s*\w+\s*=/, '') // first param name
		.replace(/^\|/, '') // nameless param
		.trim()
	;
	//console.log(noTpl);
	if (!noTpl.length) {
		console.log('[wp_sk]', 'ref template contents seem empty');
		return false;
	} else if (noTpl.search(/<\/ref>/) < 0 && noTpl.search(/\{\{/) < 0) {
		console.log('[wp_sk]', 'ref template has no refs nor templates');
		return false;
	}

	var fixed = "<references>\n" + noTpl + "\n</references>";
	ending = fixed + ending.substring(part.end);
	var result = str.substring(0, startIndex + part.start) + ending;

	wp_sk.NuxJsBot__summary.push('Przypisy → references');

	return result;
}

if (typeof module === 'object' && module.exports) {
	module.exports.tokenizeRefParams = tokenizeRefParams;
	module.exports.cleanerReflist = cleanerReflist;
	module.exports.cleanerRefParams = cleanerRefParams;
}


function quickDebug() {
	cleanerRefParams(`
{{Przypisy
|DU2001={{Dziennik Ustaw|2001|73|760}}.
<ref name="DU2025">{{Dziennik Ustaw|2025|12|3456}}</ref>
|MB={{cytuj |autor=MB |tytuł=Uniwersytet Rzeszowski ma nowego rektora |opublikowany=[[Gazeta Wyborcza|Wyborcza]] |data=7 marca 2002 |url=https://rzeszow.wyborcza.pl/rzeszow/7,34962,730377.html}}
<ref name="abc">{{abc|123}}{{def|ghi}}</ref>
<ref name="a12">{{outer|t in={{inner|param}}}}</ref>
}}
	`);
}
