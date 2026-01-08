/* global require, describe, it */
const { assert } = require('chai');
const { cleanerRefparams } = require('../src/extraSk');
// const chai = require('chai');
// const assert = chai.assert;

describe('cleanerRefparams', function () {
	
	function test(text, expectedText) {
		let resultText = cleanerRefparams(text);
		if (resultText !== expectedText) {
			console.log({text, resultText, expectedText});
		}
		assert.equal(resultText, expectedText);
	}

	it('should replace all', function () {
		test(`
{{Przypisy
|Council of Europe Parliamentary={{cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}
|zawRosja={{cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
}}
`.trim(), `
{{Przypisy|
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
}}
`.trim());
	});

	it('should work with pl', function () {
		test(`
{{Przypisy
| zażół gęślą jażźń = {{cytuj|url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}
}}
`.trim(), `
{{Przypisy|
<ref name="zażół gęślą jażźń">{{Cytuj|url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
}}
`.trim());
	});

	it('should work inline', function () {
		test(`
			{{Przypisy| zażół gęślą jażźń = {{cytuj|url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}}}
		`.trim()
		, `
{{Przypisy|
<ref name="zażół gęślą jażźń">{{Cytuj|url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
}}
`.trim());
	});

	it('should work with refs', function () {
		test(`
{{Przypisy|
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="zawRosja2">{{Cytuj |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
|Council of Europe Parliamentary={{cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
}}
`.trim(), `
{{Przypisy|
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="zawRosja2">{{Cytuj |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
}}
`.trim());

		test(`
{{Przypisy
|Council of Europe Parliamentary={{cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
<ref name="zawRosja2">{{Cytuj |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
}}
`.trim(), `
{{Przypisy|
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
<ref name="zawRosja2">{{Cytuj |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
}}
`.trim());

		test(`
{{Przypisy
|Council of Europe Parliamentary={{cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
}}
`.trim(), `
{{Przypisy|
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
}}
`.trim());
	});

	it('should work with tricky refs', function () {
		// refs in the same line as a param
		test(`
{{Przypisy
|Council of Europe Parliamentary={{cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
}}
`.trim(), `
{{Przypisy|
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja1">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
}}
`.trim());


	});


});
