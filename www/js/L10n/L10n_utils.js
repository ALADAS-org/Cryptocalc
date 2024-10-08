// ==========================================================================================
// ====================================   L10n_utils.js   ===================================
// ==========================================================================================
// https://github.com/notepad-plus-plus/notepad-plus-plus/tree/aa0be9973ba6cf1c4206952de75655436accbcfa/PowerEditor/installer/nativelang
"use strict";

const fs = require('fs');
const MSG_IDS = [ "File", "Quit" ];

class L10nUtils {
	static GetLocalizedMsg( msg_id ) {
		//console.log(">> ---------- L10nUtils.GetLocalizedMsg ----------");
		//console.log(">> msg_id: '" + msg_id + "'");	
		
		let L10n_msg = "";
		let lang     = L10nUtils.GetLocale();
		let filename = "gui-msg-" + lang + ".json";
		//console.log(">> filename: '" + filename + "'");	
		let locale_json_str = fs.readFileSync(__dirname + "/" + filename);
		
		//console.log(">> locale_json_str: '" + locale_json_str + "'");	
		if ( locale_json_str == undefined ) {
			L10n_msg = msg_id; 
		}	
		else {
			let json_data = JSON.parse( locale_json_str );
			if ( json_data[msg_id] != undefined ) 	L10n_msg = json_data[msg_id];
		    else                                    L10n_msg = msg_id;	
			//console.log("   i18n_msg['" + msg_id + "'] = " + i18n_msg);
		}
		return L10n_msg;
	} // L10nUtils.GetLocalizedMsg()
	
	static GetKeyPairs() {
		//console.log(">> ---------- L10nUtils.GetKeys ----------");
		//console.log(">> msg_id: '" + msg_id + "'");	
		let L10n_keypairs = {};
		let lang          = L10nUtils.GetLocale();
		
		//console.log("   lang: " + lang);
		let filename  = "gui-msg-" + lang + ".json";
		//console.log(">> filename: '" + filename + "'");	
		let locale_json_str = fs.readFileSync(__dirname + "/" + filename);
		if (locale_json_str != undefined) {
			L10n_keypairs = JSON.parse( locale_json_str );
			//console.log("   L10n_keys: " + JSON.stringify(L10n_keypairs));
		}
		return L10n_keypairs;
	} // L10nUtils.GetKeyPairs()

	static GetLocale() {
		let locale = Intl.DateTimeFormat().resolvedOptions().locale;
		//console.log("   GetLocale locale: '" + locale + "'");
		
		let lang = (locale == undefined) ? "en" : locale.substring(0,2);
		//console.log("   GetLocale lang: '" + lang + "'");
		return lang;
	} // L10nUtils.GetLocale()
} // L10nUtils class

const test_GetLocalizedMsg = () => {
	console.log(">> ---------- test_L10nUtils.GetLocalizedMsg ----------");
	console.log("   Locale: '" + L10nUtils.GetLocale() + "'");
	let L10n_msg = "";
	for (let i=0; i < MSG_IDS.length; i++) {
		let msg_id = MSG_IDS[i];
		L10n_msg = L10nUtils.GetLocalizedMsg(msg_id);
		console.log("   L10n_msg['" + msg_id + "'] = " + L10n_msg);
	}	
}; // test_GetLocalizedMsg()

//test_GetLocalizedMsg();

if (typeof exports === 'object') {
	exports.L10nUtils = L10nUtils
} // exports of 'L10n_utils.js'let locale