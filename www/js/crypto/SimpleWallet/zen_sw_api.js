// =====================================================================================
// ================================    zen_sw_api.js    ================================
// =====================================================================================
"use strict";

const zencashjs = require('zencashjs');

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  }                             = require('../../util/color/color_console_codes.js');
	  
const { pretty_func_header_log,
        pretty_log }                = require('../../util/log/log_utils.js');
	  
const { COIN, COIN_TYPE, NULL_COIN,        
        MAINNET, TESTNET, HORIZEN, COIN_ABBREVIATIONS		
	  }                             = require('../const_blockchains.js');
	  
const { NULL_HEX, 
        PRIVATE_KEY, PUBLIC_KEY_HEX,
        CRYPTO_NET,	MASTER_SEED, ADDRESS, CHAINCODE,
		MASTER_PK_HEX, ACCOUNT_XPRIV, ACCOUNT_XPUB, UUID
      }                             = require('../const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        MNEMONICS, WORD_COUNT, WIF,
        DERIVATION_PATH }           = require('../../const_keywords.js');
		
const { Bip39Utils }  = require('../bip39_utils.js');
const { EntropySize } = require('../entropy_size.js');

// --------------------------------------------------------------------------------------------------
// -----------------------------------------   Zen_SW_API   -----------------------------------------
// --------------------------------------------------------------------------------------------------
class Zen_SW_API { 
	static async GetWallet( entropy_hex, salt_uuid, crypto_net ) {
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		
		let new_zen_wallet = Zen_SW_API.InitializeWallet();
		
		let blockchain = HORIZEN;
		let coin = COIN_ABBREVIATIONS[blockchain];
		
		pretty_func_header_log( "Zen_SW_API.GetWallet", blockchain + " " + coin + " " + crypto_net );
		pretty_log( "Zen_SW_API.gW>> entropy_hex", entropy_hex );
		
		let word_count = EntropySize.GetWordCount( entropy_hex );
		let mnemonics  = Bip39Utils.EntropyToMnemonics( entropy_hex );
		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "Zen_SW_API.gW> mnemonics(" + word_count + ")" , mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "Zen_SW_API.gW>",  mnemonics_items[1] );			
		}
				
		new_zen_wallet[BLOCKCHAIN] = HORIZEN;
		new_zen_wallet[CRYPTO_NET] = crypto_net;
		new_zen_wallet[UUID]       = salt_uuid;
        new_zen_wallet[MNEMONICS]  = mnemonics;

		new_zen_wallet[PRIVATE_KEY] = entropy_hex;
		pretty_log( 'Zen_SW.gW>> private_key ', new_zen_wallet[PRIVATE_KEY] );

		let zen_wif = zencashjs.address.privKeyToWIF(entropy_hex);
		new_zen_wallet[WIF] = zen_wif;
		pretty_log('Zen_SW.gW>> WIF ', new_zen_wallet[WIF]);

		let pub_key = zencashjs.address.privKeyToPubKey(entropy_hex, true); // generate compressed pubKey
		pretty_log('Zen_SW.gW>> pub_key ', pub_key);
                                                                        
		new_zen_wallet[ADDRESS] = zencashjs.address.pubKeyToAddr(pub_key);	
		pretty_log('Zen_SW.gW>> address ', new_zen_wallet[ADDRESS]);

		return new_zen_wallet;
	} // Zen_SW_API.GetWallet()	
	
	static InitializeWallet() {
		let null_wallet = {}; 
		null_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
		null_wallet[CRYPTO_NET]      = "Null-NET";
		null_wallet[UUID]            = "Null-UUID";
		null_wallet[PRIVATE_KEY]     = NULL_HEX;
		null_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
		null_wallet[ADDRESS]         = "Null-ADDRESS";
		null_wallet[MNEMONICS]       = "Null-MNEMONICS";
		return null_wallet;
	} // Zen_SW_API.InitializeWallet()
} // Zen_SW_API class
//=========== ZenHD_API ===========

if (typeof exports === 'object') {
	exports.Zen_SW_API = Zen_SW_API
} // exports of 'zen_sw_api.js'