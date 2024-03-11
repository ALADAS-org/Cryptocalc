// =====================================================================================
// ================================   const_events.js   ================================
// =====================================================================================
"use strict";
    
const VIEW_TOGGLE_DEVTOOLS               = "View/ToggleDevTools";

const REQUEST_LOG_2_MAIN                 = "request:log2main";
const REQUEST_GET_SHA256                 = "request:get_SHA256";
const REQUEST_GET_SECP256K1              = "request:get_Secp256k1";
const REQUEST_GET_WIF                    = "request:get_WIF";

const REQUEST_GET_UUID                   = "request:get_UUID";
const REQUEST_GET_L10N_MSG               = "request:get_L10n_Msg";

const REQUEST_HEX_TO_SEEDPHRASE          = "request:hex_to_seedphrase";
const REQUEST_SEEDPHRASE_TO_PK           = "request:seedphrase_to_pk";
const REQUEST_SEEDPHRASE_AS_4LETTER      = "request:seedphrase_as_4letter";
const REQUEST_CHECK_SEEDPHRASE           = "request:check_seedphrase";
const REQUEST_SEEDPHRASE_TO_WORD_INDICES = "request:seedphrase_to_word_indices";

const FromMain_DID_FINISH_LOAD           = "FromMain:did-finish-load";
const FromMain_FILE_SAVE                 = "FromMain:File/Save";
const FromMain_SET_FORTUNE_COOKIE        = "FromMain:File/Import/Random Fortune Cookie";
const FromMain_SET_SEED_FIELD_VALUE      = "FromMain:Set/SeedFieldValue";
const FromMain_HELP_ABOUT                = "FromMain:Help/About";
const FromMain_SET_RENDERER_VALUE        = "FromMain:Set/RendererValue";

const REQUEST_GET_FORTUNE_COOKIE         = "request:get_FortuneCookie";

const REQUEST_SAVE_PK_INFO               = "request:save_pk_info";
const REQUEST_IMPORT_RAW_DATA            = "request:import_raw_data";

if (typeof exports === 'object') {	
	exports.VIEW_TOGGLE_DEVTOOLS               = VIEW_TOGGLE_DEVTOOLS
	
    exports.REQUEST_LOG_2_MAIN                 = REQUEST_LOG_2_MAIN
	exports.REQUEST_GET_SHA256                 = REQUEST_GET_SHA256
	exports.REQUEST_GET_SECP256K1              = REQUEST_GET_SECP256K1
	exports.REQUEST_GET_WIF                    = REQUEST_GET_WIF
	exports.REQUEST_GET_UUID                   = REQUEST_GET_UUID
	exports.REQUEST_GET_L10N_MSG               = REQUEST_GET_L10N_MSG
	exports.REQUEST_HEX_TO_SEEDPHRASE          = REQUEST_HEX_TO_SEEDPHRASE
	exports.REQUEST_SEEDPHRASE_TO_PK           = REQUEST_SEEDPHRASE_TO_PK
	exports.REQUEST_SEEDPHRASE_AS_4LETTER      = REQUEST_SEEDPHRASE_AS_4LETTER
	exports.REQUEST_CHECK_SEEDPHRASE           = REQUEST_CHECK_SEEDPHRASE
	exports.REQUEST_SEEDPHRASE_TO_WORD_INDICES = REQUEST_SEEDPHRASE_TO_WORD_INDICES
	exports.REQUEST_GET_FORTUNE_COOKIE         = REQUEST_GET_FORTUNE_COOKIE
	
	exports.FromMain_DID_FINISH_LOAD           = FromMain_DID_FINISH_LOAD
	exports.FromMain_FILE_SAVE                 = FromMain_FILE_SAVE
	exports.FromMain_SET_FORTUNE_COOKIE        = FromMain_SET_FORTUNE_COOKIE
	exports.FromMain_HELP_ABOUT                = FromMain_HELP_ABOUT	
	exports.FromMain_SET_RENDERER_VALUE        = FromMain_SET_RENDERER_VALUE
	exports.FromMain_SET_SEED_FIELD_VALUE      = FromMain_SET_SEED_FIELD_VALUE
	
	exports.REQUEST_SAVE_PK_INFO               = REQUEST_SAVE_PK_INFO
	exports.REQUEST_IMPORT_RAW_DATA            = REQUEST_IMPORT_RAW_DATA
} // exports of 'const_events.js'