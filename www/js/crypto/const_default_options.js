// ======================================================================================
// ============================== const_default_options.js ==============================
// ======================================================================================
"use strict";

const {  LANG, DEFAULT_BLOCKCHAIN,
	     WALLET_MODE, 
		 HD_WALLET_TYPE, SWORD_WALLET_TYPE, SIMPLE_WALLET_TYPE,
	     WALLET_SAVE_PATH, ENTROPY_SIZE, 
	     GUI_THEME, HASHED_SECRETS_IN_CONSOLE_LOG
	  }                    = require('../const_keywords.js');

const DEFAULT_OPTIONS = {
	[DEFAULT_BLOCKCHAIN]: { [HD_WALLET_TYPE]:     "Bitcoin", 
	                        [SIMPLE_WALLET_TYPE]: "Bitcoin",
							[SWORD_WALLET_TYPE]:  "Bitcoin" },
	[WALLET_MODE]:        SIMPLE_WALLET_TYPE,
    // NB: same values as 'www/config/defaults/options.json' (numbers, 256 bits = 24 words)
    [ENTROPY_SIZE]:       { [HD_WALLET_TYPE]: 256, [SWORD_WALLET_TYPE]: 256,
		                    [SIMPLE_WALLET_TYPE]: 256 },
	"Blockchains": { 
		[HD_WALLET_TYPE]:     [ "Bitcoin", "Ethereum", "Binance Smart Chain", "Solana", "Stellar",
                                "Sui", "Ripple", "DogeCoin", "Cardano", "TRON",
					            "Avalanche", "Bitcoin Cash", "LiteCoin", "Ethereum Classic", 
								"Bitcoin SV", "Dash", "Polygon", "VeChain", "Ravencoin", "Firo" ], 
		[SWORD_WALLET_TYPE]:  [ "Bitcoin", "Ethereum", "Binance Smart Chain", "Solana", "Stellar",
								"Polygon", "Sui", "Ripple", "DogeCoin", "Cardano", "TRON",
								"Avalanche", "Bitcoin Cash", "LiteCoin", "Ethereum Classic", 
								"Bitcoin SV", "Dash", "Polygon", "VeChain", "Ravencoin", "Firo" ], 
		[SIMPLE_WALLET_TYPE]: [ "Bitcoin", "Ethereum", "Solana", "DogeCoin", "Avalanche", "LiteCoin", 
		                        "Toncoin", "Horizen", "Polygon", "Terra" ] 
	},
	[LANG]: "EN",
	[WALLET_SAVE_PATH]:"$CRYPTOWALLET/_output",
	[GUI_THEME]: "Default",
	// NB: 'true' => secrets appear as fingerprints in the console log (see redactSecret() in log_utils.js)
	[HASHED_SECRETS_IN_CONSOLE_LOG]: true
}; // DEFAULT_OPTIONS

if ( typeof exports === 'object' ) {
	exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS
} // exports of const_default_options.js