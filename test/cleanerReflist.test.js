/* global require, describe, it */
const { assert } = require('chai');
const { diffLines } = require('diff');
const { cleanerRefParams, cleanerReflist } = require('../src/mods/cleanerReflist');
// const chai = require('chai');
// const assert = chai.assert;

// const { wp_sk } = require('../sk-copy');
// global.wp_sk = wp_sk;

describe('cleanerRefParams', function () {
	
	function test(text, expectedText) {
		let resultText = cleanerRefParams(text);
		if (resultText !== expectedText) {
			const diff = diffLines(expectedText, resultText);
			console.log('--- diff ---');
			for (const part of diff) {
				const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[0m';
				process.stdout.write(color + part.value + '\x1b[0m');
			}
			console.log('\n-------------');
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

	it('podwójny pipe', function () {
		test(`
{{Przypisy|
 |p_naszywki={{cytuj | url=http://www.uniforminsignia.org/?option=com_insigniasearch&Itemid=53&result=3275 | tytuł=Naszywki brygad WOP | data dostępu=2017-12-17}}
}}
`.trim(), `
{{Przypisy|
<ref name="p_naszywki">{{Cytuj | url=http://www.uniforminsignia.org/?option=com_insigniasearch&Itemid=53&result=3275 | tytuł=Naszywki brygad WOP | data dostępu=2017-12-17}}</ref>
}}
`.trim());
	});

	it('inne szablony', function () {

		test(`
{{Przypisy
|DU={{Dziennik Ustaw|2001|73|760}}
|MB={{Cytuj |autor=MB |tytuł=Uniwersytet Rzeszowski ma nowego rektora |opublikowany=[[Gazeta Wyborcza]] |data=7 marca 2002 |url=https://rzeszow.wyborcza.pl/rzeszow/7,34962,730377.html}}
}}
`.trim(), `
{{Przypisy|
<ref name="DU">{{Dziennik Ustaw|2001|73|760}}</ref>
<ref name="MB">{{Cytuj |autor=MB |tytuł=Uniwersytet Rzeszowski ma nowego rektora |opublikowany=[[Gazeta Wyborcza]] |data=7 marca 2002 |url=https://rzeszow.wyborcza.pl/rzeszow/7,34962,730377.html}}</ref>
}}
`.trim());

	});

	it('notatki Paywall', function () {

		test(`
{{Przypisy
|Council of Europe={{Paywall}} {{Cytuj |url = http://example.com/ |tytuł = Council of Europe Resolution 1671 {2009} }}
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
}}
`.trim(), `
{{Przypisy|
<ref name="Council of Europe">{{Cytuj |url = http://example.com/ |tytuł = Council of Europe Resolution 1671 {2009} }}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
}}
`.trim());

		test(`
{{Przypisy
|Oxford Music Online={{Paywall}} {{Cytuj stronę |url = https://doi.org/10.1093/gmo/9781561592630.article.29993 |tytuł = Webern, Anton (Friedrich Wilhelm von) |autor = Kathryn Bailey Puffett |data = 2015-09-22 |praca = Oxford Music Online. Grove Music Online |id = via Oxford University Press |język = en |archiwum = https://archive.is/Vp8cE |zarchiwizowano = 2018-08-08 |data dostępu = 2018-08-08}}
}}
`.trim(), `
{{Przypisy|
<ref name="Oxford Music Online">{{Cytuj stronę |url = https://doi.org/10.1093/gmo/9781561592630.article.29993 |tytuł = Webern, Anton (Friedrich Wilhelm von) |autor = Kathryn Bailey Puffett |data = 2015-09-22 |praca = Oxford Music Online. Grove Music Online |id = via Oxford University Press |język = en |archiwum = https://archive.is/Vp8cE |zarchiwizowano = 2018-08-08 |data dostępu = 2018-08-08}}</ref>
}}
`.trim());

	});

});

describe('cleanerReflist', function () {
	
	function test(text, expectedText) {
		let resultText = cleanerReflist(text);
		if (resultText !== expectedText) {
			const diff = diffLines(expectedText, resultText);
			console.log('--- diff ---');
			for (const part of diff) {
				const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[0m';
				process.stdout.write(color + part.value + '\x1b[0m');
			}
			console.log('\n-------------');
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
<references>
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
</references>
`.trim());
	});

	it('support link refs', function () {
		test(`
{{Przypisy
|Mielec=[https://encyklopedia.mielec.pl/?p=144 Encyklopedia miasta Mielca, Kalendarium 1944-1989]
}}
`.trim(), `
<references>
<ref name="Mielec">[https://encyklopedia.mielec.pl/?p=144 Encyklopedia miasta Mielca, Kalendarium 1944-1989]</ref>
</references>
`.trim());
	});

	it('support text refs', function () {
		test(`
{{Przypisy
|Encyklika 2025=Encyklika miasta Mielca, Mielec: PWNT, 2025.
}}
`.trim(), `
<references>
<ref name="Encyklika 2025">Encyklika miasta Mielca, Mielec: PWNT, 2025.</ref>
</references>
`.trim());
	});

	it('should support groups with ref-params', function () {
		test(`
{{Przypisy|=mini
|Council of Europe Parliamentary={{cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}
|zawRosja={{cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}
|rfn={{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}
}}
`.trim(), `
<references group="mini">
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
</references>
`.trim());
	});

	it('should support groups with plain refs', function () {
		test(`
{{Przypisy|=mini_ABC
|
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
}}
`.trim(), `
<references group="mini_ABC">
<ref name="Council of Europe Parliamentary">{{Cytuj stronę |url = http://web.archive.org/web/20100710200420/http://assembly.coe.int/Main.asp?link=/Documents/AdoptedText/ta09/ERES1671.htm |tytuł = Council of Europe Parliamentary Assembly Resolution 1671 (2009) – Situation in Belarus |autor = assembly.coe.int |język = en |data dostępu = 2013-06-15}}</ref>
<ref name="zawRosja">{{Cytuj stronę |url = https://www.coe.int/en/web/portal/-/council-of-europe-suspends-russia-s-rights-of-representation |tytuł = Council of Europe suspends Russia’s rights of representation |autor = |opublikowany = Council of Europe |data = 2021-02-25 |język = en |data dostępu = 2021-02-25}}</ref>
<ref name="rfn">{{Cytuj stronę |url = https://www.nytimes.com/1951/05/03/archives/council-of-europe-raises-bonn-to-the-status-of-a-full-member-bonn.html |tytuł = ''Council of Europe Raises Bonn To the Status of a Full Member; BONN IS ADMITTED TO EUROPE COUNCIL'' |autor = Lansing Warren |opublikowany = nytimes.com |data = 3 maja 1951 |język = en |data dostępu = 2023-12-15}}</ref>
</references>
`.trim());
	});

	it('should support questionable group', function () {
		test(`
{{Przypisy|=?|
* <ref name="1.">Białoruś dane z 12.03.2021</ref>
* <ref name="2.">Białoruś dane z 26.03.2021</ref>
}}
`.trim(), `
<references group="?">
<ref name="1.">Białoruś dane z 12.03.2021</ref>
<ref name="2.">Białoruś dane z 26.03.2021</ref>
</references>
`.trim());
	});
});
