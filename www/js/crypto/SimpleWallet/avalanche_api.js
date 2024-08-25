// ====================================================================================
// ==============================    avalanche_api.js    ==============================
// ====================================================================================
"use strict";

// NB: indeed in "Avalanche (C-chain)", an Ethereum wallet can be used

// -------- 2024/02/29: Test import avec Avalanche/AVAX dans Guarda.com --------
//  OK : avec Private Key (Hex)
//  OK : avec Seedphrase
const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }     = require('../util/color/color_console_codes.js');
		
const { NULL_COIN, 
	    ETHEREUM, AVALANCHE,  
		MAINNET, TESTNET,
		COIN_ABBREVIATIONS
      }                    = require('./const_blockchains.js');
	  
const { PRIVATE_KEY_HEX, ADDRESS
	  }                    = require('./const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN
	  }                    = require('../const_keywords.js');
	  
const { hexWithoutPrefix 
	  }                    = require('./hex_utils.js');

class Avalanche_API {
    static async GetWallet( entropy_hex, salt_uuid, crypto_net ) {
		let coin = COIN_ABBREVIATIONS[AVALANCHE];
		console.log(  ">> " + _CYAN_ + "Avalanche_API.GetWallet " + _END_ + AVALANCHE + " " + coin + " " + crypto_net);
		console.log("   entropy_hex: " + entropy_hex);
		
		let new_wallet = await HD_Wallet_API.GetWallet( entropy_hex, salt_uuid, ETHEREUM, crypto_net);			
	    new_wallet[BLOCKCHAIN]      = AVALANCHE;
		new_wallet[ADDRESS]         = new_wallet[ADDRESS].toLowerCase();
		new_wallet[PRIVATE_KEY_HEX] = hexWithoutPrefix(new_wallet[PRIVATE_KEY_HEX]);
		return new_wallet;
	} // Avalanche_API.GetWallet()
} // Avalanche_API class

if (typeof exports === 'object') {
	exports.Avalanche_API = Avalanche_API
} // exports of 'avalanche_api.js'