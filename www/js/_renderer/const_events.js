// =====================================================================================
// ================================   const_events.js   ================================
// =====================================================================================
"use strict";
    
const DID_FINISH_LOAD                    = "did-finish-load"; // NB: renderer event name
const HELP_ABOUT                         = "Help/About";
const VIEW_TOGGLE_DEVTOOLS               = "View/ToggleDevTools";

const SET_RENDERER_VALUE                 = "Set/RendererValue";
const SET_INPUT_FIELD_VALUE              = "Set/InputFieldValue";

const REQUEST_LOG_2_MAIN                 = "request:log2main";
const REQUEST_GET_SHA256                 = "request:get_SHA256";
const REQUEST_GET_UUID                   = "request:get_UUID";
const REQUEST_HEX_TO_SEEDPHRASE          = "request:hex_to_seedphrase";
const REQUEST_SEEDPHRASE_TO_PK           = "request:seedphrase_to_pk";
const REQUEST_SEEDPHRASE_AS_4LETTER      = "request:seedphrase_as_4letter";
const REQUEST_CHECK_SEEDPHRASE           = "request:check_seedphrase";
const REQUEST_SEEDPHRASE_TO_WORD_INDICES = "request:seedphrase_to_word_indices";

const REQUEST_FILE_SAVE                  = "request:File/Save";
const REQUEST_SAVE_PK_INFO               = "request:save_pk_info";
const REQUEST_IMPORT_RAW_DATA            = "request:import_raw_data";

if (typeof exports === 'object') {
	exports.DID_FINISH_LOAD                    = DID_FINISH_LOAD
	exports.HELP_ABOUT                         = HELP_ABOUT	
	exports.VIEW_TOGGLE_DEVTOOLS               = VIEW_TOGGLE_DEVTOOLS
	exports.SET_RENDERER_VALUE                 = SET_RENDERER_VALUE
	exports.SET_INPUT_FIELD_VALUE              = SET_INPUT_FIELD_VALUE

    exports.REQUEST_LOG_2_MAIN                 = REQUEST_LOG_2_MAIN
	exports.REQUEST_GET_SHA256                 = REQUEST_GET_SHA256
	exports.REQUEST_GET_UUID                   = REQUEST_GET_UUID
	exports.REQUEST_HEX_TO_SEEDPHRASE          = REQUEST_HEX_TO_SEEDPHRASE
	exports.REQUEST_SEEDPHRASE_TO_PK           = REQUEST_SEEDPHRASE_TO_PK
	exports.REQUEST_SEEDPHRASE_AS_4LETTER      = REQUEST_SEEDPHRASE_AS_4LETTER
	exports.REQUEST_CHECK_SEEDPHRASE           = REQUEST_CHECK_SEEDPHRASE
	exports.REQUEST_SEEDPHRASE_TO_WORD_INDICES = REQUEST_SEEDPHRASE_TO_WORD_INDICES
	exports.REQUEST_FILE_SAVE                  = REQUEST_FILE_SAVE
	exports.REQUEST_SAVE_PK_INFO               = REQUEST_SAVE_PK_INFO
	exports.REQUEST_IMPORT_RAW_DATA            = REQUEST_IMPORT_RAW_DATA
} // exports of 'const_events.js'