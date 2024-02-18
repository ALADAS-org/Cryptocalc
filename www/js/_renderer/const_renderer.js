// =====================================================================================
// ===============================   const_renderer.js   ===============================
// =====================================================================================
"use strict";

const CRYPTO_CALC_VERSION     = "Cryptocalc_version";

const PK_HEX_ID               = "pk_hex_id";
const PK_B64_ID               = "pk_b64_id";

const RAW_DATA_ID             = "raw_data_id";

const MNEMONICS_ID            = "mnemonics_id";
const LANG_SELECT_ID          = "lang_select_id";

const MNEMONICS_4LETTER_ID    = "mnemonics_4letter_id";

const UPDATE_BTN_ID           = "update_btn_id";
const GENERATE_BTN_ID         = "generate_btn_id";
const CLEAR_BTN_ID            = "clear_btn_id";

const WITH_FOCUS_CSS_CLASS    = "WithFocus";
const WITHOUT_FOCUS_CSS_CLASS = "WithoutFocus";

const VALID_VALUE_CSS_CLASS   = "ValidValue";
const INVALID_VALUE_CSS_CLASS = "InvalidValue";

const log2Main = (msg) => {
	window.ipcMain.log2Main(msg);
}; // log2Main()

if (typeof exports === 'object') {
	exports.CRYPTO_CALC_VERSION     = CRYPTO_CALC_VERSION
	exports.PK_HEX_ID               = PK_HEX_ID
	exports.PK_B64_ID               = PK_B64_ID
	
	exports.RAW_DATA_ID             = RAW_DATA_ID
	exports.MNEMONICS_ID            = MNEMONICS_ID
	exports.LANG_SELECT_ID          = LANG_SELECT_ID
	exports.MNEMONICS_4LETTER_ID    = MNEMONICS_4LETTER_ID
	
	exports.UPDATE_BTN_ID           = UPDATE_BTN_ID
	exports.GENERATE_BTN_ID         = GENERATE_BTN_ID
	exports.CLEAR_BTN_ID            = CLEAR_BTN_ID
	
	exports.WITH_FOCUS_CSS_CLASS    = WITH_FOCUS_CSS_CLASS
	exports.WITHOUT_FOCUS_CSS_CLASS = WITHOUT_FOCUS_CSS_CLASS
} // exports of 'const_renderer.js'