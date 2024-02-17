// =====================================================================================
// ================================   const_events.js   ================================
// =====================================================================================
"use strict";
    
const DID_FINISH_LOAD               = "did-finish-load"; // NB: renderer event name
const HELP_ABOUT                    = "Help/About";
const VIEW_TOGGLE_DEVTOOLS          = "View/ToggleDevTools";
const SET_RENDERER_VALUE            = "Set/RendererValue";

const REQUEST_LOG_2_MAIN            = "request:log2main";
const REQUEST_GET_SHA256            = "request:get_SHA256";
const REQUEST_HEX_TO_SEEDPHRASE     = "request:hex_to_seedphrase";
const REQUEST_SEEDPHRASE_AS_4LETTER = "request:seedphrase_as_4letter";

if (typeof exports === 'object') {
	exports.DID_FINISH_LOAD                = DID_FINISH_LOAD
	exports.HELP_ABOUT                     = HELP_ABOUT	
	exports.VIEW_TOGGLE_DEVTOOLS           = VIEW_TOGGLE_DEVTOOLS
	exports.SET_RENDERER_VALUE             = SET_RENDERER_VALUE

    exports.REQUEST_LOG_2_MAIN             = REQUEST_LOG_2_MAIN
	exports.REQUEST_GET_SHA256             = REQUEST_GET_SHA256
	exports.REQUEST_HEX_TO_SEEDPHRASE      = REQUEST_HEX_TO_SEEDPHRASE
	exports.REQUEST_SEEDPHRASE_AS_4LETTER  = REQUEST_SEEDPHRASE_AS_4LETTER
} // exports of 'const_events.js'