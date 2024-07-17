/* eslint-disable no-useless-escape */

const { SkTableHide } = require("../../SkTableHide");

/** Podmiana pseudo-tabel na wikiflex. */
function flexColumnTables(str) {
		// zwijanie
		var tables = new SkTableHide();

		str = tables.hide(str);

		// [[Wikipedysta:Nux/test_sk_table_hide#Niby_kolumny]]
		str = str.replace(/\n\{\|\n[|\-\n]*\n\|\s*(<tab<[0-9]+>tab>)\s*\|\s*(<tab<[0-9]+>tab>)\s*\n\|\}/g
			, '\n<div class="wikiflex">\n$1\n$2\n</div>'
		);

		// j/w ale z col-begin/end
		str = str.replace(/\n\{\{col-begin\}\}\n\s*(<tab<[0-9]+>tab>)\s*(?:\||\{\{col-(?:break|2)\}\})\s*(<tab<[0-9]+>tab>)\s*(?:\{\{col-end\}\}|\n\|\})/g
			, '\n<div class="wikiflex">\n$1\n$2\n</div>'
		);
		
		str = tables.show(str);

		return str;
}

// export
if (typeof module === 'object' && module.exports) {
	module.exports.flexColumnTables = flexColumnTables;
}

