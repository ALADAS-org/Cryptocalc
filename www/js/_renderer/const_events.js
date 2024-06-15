// =====================================================================================
// ================================   const_events.js   ================================
// =====================================================================================
"use strict";
    
const VIEW_TOGGLE_DEVTOOLS                      = "View/ToggleDevTools";
const TOOLS_OPTIONS                             = "Tools/Options";

const REQUEST_LOG_2_MAIN                        = "request:log2main";
const REQUEST_TOGGLE_DEBUG_PANEL                = "request:toggle_debug_panel";

const REQUEST_OPEN_URL                          = "request:open_URL";

const REQUEST_ENTROPY_SRC_TO_ENTROPY            = "request:entropy_src_to_entropy";
const REQUEST_MNEMONICS_TO_ENTROPY_INFO         = "request:mnemonics_to_entropy_info";
const REQUEST_MNEMONICS_TO_HDWALLET_INFO        = "request:mnemonics_to_hdwallet_info";

const REQUEST_ENTROPY_TO_MNEMONICS              = "request:entropy_to_mnemonics";
const REQUEST_ENTROPY_TO_CHECKSUM               = "request:entropy_to_checksum";
const REQUEST_ENTROPY_SRC_TO_PK                 = "request:entropy_src_to_pk";

const REQUEST_MNEMONICS_AS_4LETTER              = "request:mnemonics_as_4letter";
const REQUEST_CHECK_MNEMONICS                   = "request:check_mnemonics";
const REQUEST_MNEMONICS_TO_WORD_INDEXES         = "request:mnemonics_to_word_indexes";
const REQUEST_GUESS_MNEMONICS_LANG              = "request:guess_mnemonics_lang";

const REQUEST_GET_HD_WALLET                     = "request:get_HD_wallet";
const REQUEST_GET_SOLANA_WALLET                 = "request:get_SOLANA_wallet";

const REQUEST_GET_FORTUNE_COOKIE                = "request:get_FortuneCookie";

const REQUEST_GET_SECP256K1                     = "request:get_Secp256k1";
const REQUEST_GET_UUID                          = "request:get_UUID";

const REQUEST_GET_L10N_KEYPAIRS                     = "request:get_L10n_keypairs";
const REQUEST_GET_L10N_MSG                      = "request:get_L10n_Msg";

const REQUEST_SAVE_WALLET_INFO                  = "request:save_wallet_info";
const REQUEST_IMPORT_RAW_DATA                   = "request:import_raw_data";

const REQUEST_LOAD_IMG_FROM_FILE                = "request:load_image_from_file";
const REQUEST_DROP_RND_CRYPTO_LOGO              = "request:drop_rnd_crypto_logo";

const FromMain_DID_FINISH_LOAD                  = "FromMain:did-finish-load";
const FromMain_FILE_SAVE                        = "FromMain:File/Save";
const FromMain_SET_FORTUNE_COOKIE               = "FromMain:File/Import/Random Fortune Cookie";
const FromMain_SET_SEED_FIELD_VALUE             = "FromMain:Set/SeedFieldValue";
const FromMain_SHOW_ERROR_DIALOG                = "FromMain:ShowErrorDialog";	
const FromMain_HELP_ABOUT                       = "FromMain:Help/About";
const FromMain_SET_RENDERER_VALUE               = "FromMain:Set/RendererValue";
const FromMain_SEND_IMG_URL                     = "FromMain:SendImageURL";

if (typeof exports === 'object') {		
	exports.VIEW_TOGGLE_DEVTOOLS               = VIEW_TOGGLE_DEVTOOLS
    exports.TOOLS_OPTIONS                      = TOOLS_OPTIONS	
	
	exports.REQUEST_LOG_2_MAIN                 = REQUEST_LOG_2_MAIN
	exports.REQUEST_TOGGLE_DEBUG_PANEL         = REQUEST_TOGGLE_DEBUG_PANEL
	
	exports.REQUEST_ENTROPY_SRC_TO_ENTROPY     = REQUEST_ENTROPY_SRC_TO_ENTROPY	
    exports.REQUEST_MNEMONICS_TO_ENTROPY_INFO  = REQUEST_MNEMONICS_TO_ENTROPY_INFO
	exports.REQUEST_ENTROPY_TO_MNEMONICS       = REQUEST_ENTROPY_TO_MNEMONICS
	exports.REQUEST_ENTROPY_TO_CHECKSUM        = REQUEST_ENTROPY_TO_CHECKSUM	
	exports.REQUEST_ENTROPY_SRC_TO_PK          = REQUEST_ENTROPY_SRC_TO_PK
	exports.REQUEST_MNEMONICS_TO_HDWALLET_INFO = REQUEST_MNEMONICS_TO_HDWALLET_INFO
	
	exports.REQUEST_OPEN_URL                   = REQUEST_OPEN_URL	
	
	exports.REQUEST_GET_SECP256K1              = REQUEST_GET_SECP256K1
	exports.REQUEST_GET_UUID                   = REQUEST_GET_UUID
	
	exports.REQUEST_GET_L10N_KEYPAIRS          = REQUEST_GET_L10N_KEYPAIRS
	exports.REQUEST_GET_L10N_MSG               = REQUEST_GET_L10N_MSG	
	
	exports.REQUEST_MNEMONICS_AS_4LETTER       = REQUEST_MNEMONICS_AS_4LETTER
	exports.REQUEST_CHECK_MNEMONICS            = REQUEST_CHECK_MNEMONICS
	exports.REQUEST_MNEMONICS_TO_WORD_INDEXES  = REQUEST_MNEMONICS_TO_WORD_INDEXES
	exports.REQUEST_GUESS_MNEMONICS_LANG       = REQUEST_GUESS_MNEMONICS_LANG
	exports.REQUEST_GET_FORTUNE_COOKIE         = REQUEST_GET_FORTUNE_COOKIE
	
	exports.REQUEST_SAVE_WALLET_INFO           = REQUEST_SAVE_WALLET_INFO
	exports.REQUEST_IMPORT_RAW_DATA            = REQUEST_IMPORT_RAW_DATA
	exports.REQUEST_LOAD_IMG_FROM_FILE         = REQUEST_LOAD_IMG_FROM_FILE 
	exports.REQUEST_DROP_RND_CRYPTO_LOGO       = REQUEST_DROP_RND_CRYPTO_LOGO
	
	exports.REQUEST_GET_HD_WALLET              = REQUEST_GET_HD_WALLET
	exports.REQUEST_GET_SOLANA_WALLET          = REQUEST_GET_SOLANA_WALLET 
	
	exports.FromMain_DID_FINISH_LOAD           = FromMain_DID_FINISH_LOAD
	exports.FromMain_FILE_SAVE                 = FromMain_FILE_SAVE
	exports.FromMain_SEND_IMG_URL              = FromMain_SEND_IMG_URL
	exports.FromMain_SET_FORTUNE_COOKIE        = FromMain_SET_FORTUNE_COOKIE
	exports.FromMain_SHOW_ERROR_DIALOG         = FromMain_SHOW_ERROR_DIALOG
	exports.FromMain_HELP_ABOUT                = FromMain_HELP_ABOUT	
	exports.FromMain_SET_RENDERER_VALUE        = FromMain_SET_RENDERER_VALUE
	exports.FromMain_SET_SEED_FIELD_VALUE      = FromMain_SET_SEED_FIELD_VALUE
} // exports of 'const_events.js'