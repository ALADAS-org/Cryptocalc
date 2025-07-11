// ======================================================================================
// ============================== const_default_options.js ==============================
// ======================================================================================
"use strict";

const {  LANG, DEFAULT_BLOCKCHAIN,
	     WALLET_MODE, 
		 HD_WALLET_TYPE, SWORD_WALLET_TYPE, SIMPLE_WALLET_TYPE,
	     WALLET_SAVE_PATH, ENTROPY_SIZE, 
	     GUI_THEME  
	  }                    = require('../const_keywords.js');

const DEFAULT_OPTIONS = {
	[DEFAULT_BLOCKCHAIN]: { [HD_WALLET_TYPE]:     "Bitcoin", 
	                        [SIMPLE_WALLET_TYPE]: "Bitcoin",
							[SWORD_WALLET_TYPE]:  "Bitcoin" },
	[WALLET_MODE]:        SIMPLE_WALLET_TYPE,
    [ENTROPY_SIZE]:       { [HD_WALLET_TYPE]:"128", [SWORD_WALLET_TYPE]: "128",
		                    [SIMPLE_WALLET_TYPE]: "256" },
	"Blockchains": { 
		[HD_WALLET_TYPE]:     [ "Bitcoin","Ethereum","Solana",
                                "Ripple","DogeCoin","Cardano","TRON",
					            "Avalanche","Bitcoin Cash",
								"LiteCoin","Dash","Firo", "ZCASH" ], 
		[SWORD_WALLET_TYPE]:  [ "Bitcoin","Ethereum","Solana",
								"Ripple","DogeCoin","Cardano","TRON",
								"Avalanche","Bitcoin Cash",
								"LiteCoin","Dash","Firo", "ZCASH" ], 
		[SIMPLE_WALLET_TYPE]: [ "Bitcoin","Ethereum","Solana",
                                "DogeCoin","Avalanche","LiteCoin"] 
	},
	[LANG]: "EN",
	[WALLET_SAVE_PATH]:"$CRYPTOWALLET/_output",
	[GUI_THEME]: "Default"
}; // DEFAULT_OPTIONS

if ( typeof exports === 'object' ) {
	exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS
} // exports of const_default_options.js