// =====================================================================================
// ===============================   const_renderer.js   ===============================
// =====================================================================================
"use strict";

const CRYPTO_CALC_VERSION          = "Cryptocalc_version";

const TOOLS_OPTIONS_DIALOG_ID      = "tools_options_dialog_id"; 

const SEED_TAB_LINK_ID             = "seed_tab_link_id";
const WALLET_TAB_LINK_ID           = "wallet_tab_link_id";

const ENTROPY_SRC_LABEL_ID         = "entropy_src_label_id";

const ENTROPY_SRC_FORTUNES_ID      = "entropy_src_fortunes_id";
const ENTROPY_SRC_IMG_CONTAINER_ID = "entropy_src_img_container_id";
const ENTROPY_SOURCE_IMG_DIV_ID    = "entropy_src_img_div_id";
const ENTROPY_SOURCE_IMG_ID        = "entropy_src_img_id";

const ENTROPY_SOURCE_SELECTOR_ID   = "entropy_src_selector_id";

const ENTROPY_LABEL_ID             = "entropy_label_id";
const ENTROPY_ID                   = "entropy_id";
const ENTROPY_COPY_BTN_ID          = "entropy_copy_btn_id";
const ENTROPY_SIZE_SELECT_ID       = "entropy_bits_select_id";
const CHECKSUM_ID                  = "checksum_id";

const FILE_IMPORT_BTN_ID           = "file_import_btn_id";

const MNEMONICS_ID                 = "mnemonics_id";
const MNEMONICS_COPY_BTN_ID        = "mnemonics_copy_btn_id";

const MNEMONICS_4LETTER_ID         = "mnemonics_4letter_id";
const LANG_SELECT_ID               = "LANG_SELECT_ID";
const WORD_COUNT_SELECT_ID         = "word_count_select_id";

const WORD_INDEXES_ID              = "word_indexes_id";
const WORD_INDEXES_BASE_ID         = "word_indexes_base_id";

const SALT_ID                      = "salt_id";
const USE_SALT_ID                  = "use_salt_id";

const WALLET_BLOCKCHAIN_LABEL_ID   = "wallet_blockchain_label_id";
const WALLET_BLOCKCHAIN_ID         = "wallet_blockchain_id"; 

const COIN_TYPE_ID                 = "coin_type_id";
const ACCOUNT_ID                   = "account_id";
const ADDRESS_INDEX_ID             = "address_index_id";

const DERIVATION_PATH_ID           = "derivation_path_id";

const ADDRESS_ID                   = "address_id";

const WALLET_COIN_ID               = "wallet_coin_id";

const WALLET_EXPLORE_BTN_ID        = "wallet_explore_btn_id";
const WALLET_URL_LINK_ID           = "wallet_URL_link_id";

const WALLET_PK_LABEL_ID           = "wallet_PK_label_id";
const WALLET_PK_HEX_ID             = "wallet_pk_hex_id";

const WIF_FIELD_LINE_ID            = "WIF_field_line_id";
const WIF_LABEL_ID                 = "WIF_label_id";
const WIF_ID                       = "WIF_id";

const PRIV_KEY_FIELD_LINE_ID       = "PRIV_KEY_field_line_id";
const PRIV_KEY_LABEL_ID            = "PRIV_KEY_label_id";
const PRIV_KEY_ID                  = "PRIV_KEY_id";

const UPDATE_LABEL_ID              = "update_label_id";

// --------------------  Main Toolbar  --------------------
const SAVE_ICON_ID                 = "save_icon_id";
const REGENERATE_ICON_ID           = "regenerate_icon_id";
const TOGGLE_DEVTOOLS_ICON_ID      = "toggle_devtools_icon_id";
// --------------------  Main Toolbar		

// --------------------  Buttons Bar  --------------------
const LEFT_BTNBAR_ITEM_ID          = "left_BtnBar_item_id";
const RANDOM_BTN_ID                = "random_btn_id";
const REFRESH_BTN_ID               = "refresh_btn_id";
const RIGHT_BTNBAR_ITEM_ID         = "right_BtnBar_item_id";
// --------------------  Buttons Bar

const SB_MSG_ID                    = "SB_item_message_id";

const WITH_FOCUS_CSS_CLASS         = "WithFocus";
const WITHOUT_FOCUS_CSS_CLASS      = "WithoutFocus";

const VALID_VALUE_CSS_CLASS        = "ValidValue";
const INVALID_VALUE_CSS_CLASS      = "InvalidValue";

const UPDATE_MSG                   = "Use the [Update] button to refresh computed fields";

const NOT_SAME_LANG_MSGID          = "NOT_SAME_LANG_MSGID";
const INVALID_WORD_COUNT_MSGID     = "INVALID_WORD_COUNT_MSGID";

//const HTML_NODE_IDS              = [ SEED_TAB_LINK_ID, WALLET_TAB_LINK_ID,
//                                     ENTROPY_SRC_LABEL_ID, ENTROPY_LABEL_ID,
//                                     UPDATE_BTN_ID, RANDOM_BTN_ID, CLEAR_BTN_ID, 
//									   WALLET_EXPLORE_BTN_ID
//								     ];

const log2Main = (msg) => {
	window.ipcMain.log2Main(msg);
}; // log2Main()

if (typeof exports === 'object') {
	exports.CRYPTO_CALC_VERSION        = CRYPTO_CALC_VERSION
	
	exports.ENTROPY_LABEL_ID           = ENTROPY_LABEL_ID	
	exports.ENTROPY_SRC_FORTUNES_ID    = ENTROPY_SRC_FORTUNES_ID
	exports.ENTROPY_ID                 = ENTROPY_ID
	exports.ENTROPY_SIZE_SELECT_ID     = ENTROPY_SIZE_SELECT_ID
	exports.WORD_COUNT_SELECT_ID       = WORD_COUNT_SELECT_ID
	exports.FILE_IMPORT_BTN_ID         = FILE_IMPORT_BTN_ID
	
	exports.ENTROPY_SOURCE_IMG_ID      = ENTROPY_SOURCE_IMG_ID
	
	exports.MNEMONICS_ID               = MNEMONICS_ID
	exports.LANG_SELECT_ID             = LANG_SELECT_ID
	exports.MNEMONICS_4LETTER_ID       = MNEMONICS_4LETTER_ID	
	
	exports.SALT_ID                    = SALT_ID
	exports.USE_SALT_ID                = USE_SALT_ID
	
	exports.WORD_INDEXES_ID            = WORD_INDEXES_ID
	
	exports.WALLET_BLOCKCHAIN_LABEL_ID = WALLET_BLOCKCHAIN_LABEL_ID
	exports.WALLET_BLOCKCHAIN_ID       = WALLET_BLOCKCHAIN_ID
	exports.WALLET_COIN_ID             = WALLET_COIN_ID
	exports.WALLET_EXPLORE_BTN_ID      = WALLET_EXPLORE_BTN_ID
	exports.WALLET_URL_LINK_ID         = WALLET_URL_LINK_ID
		
	exports.ADDRESS_ID                 = ADDRESS_ID
	exports.DERIVATION_PATH_ID         = DERIVATION_PATH_ID
	exports.WALLET_PK_LABEL_ID         = WALLET_PK_LABEL_ID
    exports.WALLET_PK_HEX_ID           = WALLET_PK_HEX_ID
	
	exports.WIF_ID                     = WIF_ID
	exports.PRIV_KEY_ID                = PRIV_KEY_ID
	exports.CHECKSUM_ID				   = CHECKSUM_ID
	
	exports.UPDATE_LABEL_ID            = UPDATE_LABEL_ID
	
	exports.RANDOM_BTN_ID              = RANDOM_BTN_ID
	
	exports.SB_MSG_ID                  = SB_MSG_ID
	exports.UPDATE_MSG                 = UPDATE_MSG
	
	exports.WITH_FOCUS_CSS_CLASS       = WITH_FOCUS_CSS_CLASS
	exports.WITHOUT_FOCUS_CSS_CLASS    = WITHOUT_FOCUS_CSS_CLASS
} // exports of 'const_renderer.js'