// =====================================================================================
// ===============================   const_renderer.js   ===============================
// =====================================================================================
"use strict";

const CRYPTO_CALC_VERSION     = "Cryptocalc_version";

const PK_LABEL_ID             = "PK_label_id";

const PK_HEX_ID               = "pk_hex_id";
const PK_B64_ID               = "pk_b64_id";

const SEED_ID                 = "seed_id";
const SALT_ID                 = "salt_id";
const USE_SALT_ID             = "use_salt_id";
const FILE_IMPORT_BTN_ID      = "file_import_btn_id";

const SEEDPHRASE_ID           = "seedphrase_id";
const SEEDPHRASE_4LETTER_ID   = "seedphrase_4letter_id";
const LANG_SELECT_ID          = "lang_select_id";

const UPDATE_BTN_ID           = "update_btn_id";
const RANDOM_BTN_ID           = "random_btn_id";
const CLEAR_BTN_ID            = "clear_btn_id";

const SB_MSG_ID               = "SB_item_message_id";

const WITH_FOCUS_CSS_CLASS    = "WithFocus";
const WITHOUT_FOCUS_CSS_CLASS = "WithoutFocus";

const VALID_VALUE_CSS_CLASS   = "ValidValue";
const INVALID_VALUE_CSS_CLASS = "InvalidValue";

const UPDATE_MSG              = "Use the [Update] button to refresh computed fields";

const log2Main = (msg) => {
	window.ipcMain.log2Main(msg);
}; // log2Main()

if (typeof exports === 'object') {
	exports.CRYPTO_CALC_VERSION     = CRYPTO_CALC_VERSION
	exports.PK_LABEL_ID             = PK_LABEL_ID
	exports.PK_HEX_ID               = PK_HEX_ID
	exports.PK_B64_ID               = PK_B64_ID
	
	exports.SEED_ID                 = SEED_ID
	exports.SALT_ID                 = SALT_ID
	exports.USE_SALT_ID             = USE_SALT_ID
	exports.SEEDPHRASE_ID           = SEEDPHRASE_ID
	exports.LANG_SELECT_ID          = LANG_SELECT_ID
	exports.SEEDPHRASE_4LETTER_ID   = SEEDPHRASE_4LETTER_ID
	
	exports.FILE_IMPORT_BTN_ID      = FILE_IMPORT_BTN_ID
	
	exports.UPDATE_BTN_ID           = UPDATE_BTN_ID
	exports.RANDOM_BTN_ID           = RANDOM_BTN_ID
	exports.CLEAR_BTN_ID            = CLEAR_BTN_ID
	
	exports.SB_MSG_ID               = SB_MSG_ID
	exports.UPDATE_MSG              = UPDATE_MSG
	
	exports.WITH_FOCUS_CSS_CLASS    = WITH_FOCUS_CSS_CLASS
	exports.WITHOUT_FOCUS_CSS_CLASS = WITHOUT_FOCUS_CSS_CLASS
} // exports of 'const_renderer.js'