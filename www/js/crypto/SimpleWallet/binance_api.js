// ====================================================================================
// ===============================    binance_api.js    ===============================
// ====================================================================================
"use strict";

// NB: Adaptation of 'avalanche_api.js'

// -------- 2024/02/29: Test import avec Avalanche/AVAX dans Guarda.com --------
//  OK : avec Private Key (Hex)
//  OK : avec Seedphrase
const { _CYAN_, _END_ } = require('../util/color/color_console_codes.js');
		
const { ETHEREUM, BINANCE_BSC,  
		COIN_ABBREVIATIONS }   = require('./const_blockchains.js');
	  
const { PRIVATE_KEY, ADDRESS } = require('./const_wallet.js');	  
const { BLOCKCHAIN }           = require('../const_keywords.js');	  
const { hexWithoutPrefix }     = require('./hex_utils.js');

class Binance_API {
    static async GetWallet( entropy_hex, salt_uuid, crypto_net ) {
		let coin = COIN_ABBREVIATIONS[BINANCE_BSC];
		console.log(  ">> " + _CYAN_ + "Binance_API.GetWallet " + _END_ + BINANCE_BSC + " " + coin + " " + crypto_net);
		console.log("   entropy_hex: " + entropy_hex);
		
		let new_wallet = await HD_Wallet_API.GetWallet( entropy_hex, salt_uuid, ETHEREUM, crypto_net);			
	    new_wallet[BLOCKCHAIN]  = BINANCE_BSC;
		new_wallet[ADDRESS]     = new_wallet[ADDRESS].toLowerCase();
		new_wallet[PRIVATE_KEY] = hexWithoutPrefix(new_wallet[PRIVATE_KEY]);
		return new_wallet;
	} // Binance_API.GetWallet()
} // Binance_API class

if (typeof exports === 'object') {
	exports.Binance_API = Binance_API
} // exports of 'binance_api.js'