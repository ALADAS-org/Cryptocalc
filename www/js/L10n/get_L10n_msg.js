// ==========================================================================================
// ===================================   get_L10n_msg.js   ==================================
// ==========================================================================================
// https://github.com/notepad-plus-plus/notepad-plus-plus/tree/aa0be9973ba6cf1c4206952de75655436accbcfa/PowerEditor/installer/nativeLang
"use strict";

const fs = require('fs');
const MSG_IDS = [ "File", "Quit" ];

const getL10nMsg = (msg_id) => {
	//console.log(">> ---------- getL10nMsg ----------");
	//console.log(">> msg_id: '" + msg_id + "'");	
	let L10n_msg = "";
	let lang     = getLocale();
	let filename = "gui-msg-" + lang + ".json";
	//console.log(">> filename: '" + filename + "'");	
	let locale_json_str = fs.readFileSync(__dirname + "/" + filename);
	if (locale_json_str != undefined) {
		let json_data = JSON.parse(locale_json_str);
	    L10n_msg = json_data[msg_id];
		//console.log("   i18n_msg['" + msg_id + "'] = " + i18n_msg);
	}
	return L10n_msg;
}; // getL10nMsg()

const getLocale = () => {
	let locale = Intl.DateTimeFormat().resolvedOptions().locale;
	let lang = (locale == undefined) ? 'en' : locale.substring(0,2);
    return lang;
}; // getLocale()

const test_getL10nMsg = () => {
	console.log(">> ---------- test_getL10nMsg ----------");
	console.log("   Locale: '" + getLocale() + "'");
	let L10n_msg = "";
	for (let i=0; i<MSG_IDS.length; i++) {
		let msg_id = MSG_IDS[i];
		L10n_msg = getL10nMsg(msg_id);
		console.log("   L10n_msg['" + msg_id + "'] = " + L10n_msg);
	}	
}; // test_getL10nMsg()

//test_getL10nMsg();

if (typeof exports === 'object') {
	exports.getL10nMsg    = getL10nMsg
} // exports of 'get_L10n_msg.js'let locale