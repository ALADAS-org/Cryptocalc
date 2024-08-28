// ====================================================================================
// =================================   hd_wallet.js   =================================
// ====================================================================================
"use strict";

const bip39 = require('bip39');

const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }  = require('../../util/color/color_console_codes.js');
		
const { getFunctionCallerName,
        pretty_func_header_log,
        pretty_log }       = require('../../util/log/log_utils.js');
		
const { NULL_COIN, COIN, COIN_TYPE,
	    ETHEREUM, BITCOIN, DOGECOIN, LITECOIN, 
		SOLANA, CARDANO, RIPPLE, 
		EOS, DASH, FIRO, TRON, 
		AVALANCHE, BITCOIN_CASH,   
		MAINNET, TESTNET,
		COIN_ABBREVIATIONS
      }                    = require('../const_blockchains.js');
	  
const { NULL_HEX, CRYPTO_NET, 
        ADDRESS, 
		PRIVATE_KEY_HEX, PUBLIC_KEY_HEX,
		PRIV_KEY
	  }                    = require('../const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        WALLET_MODE, HD_WALLET_TYPE,
        UUID, MNEMONICS, WIF,
        ACCOUNT, ADDRESS_INDEX, DERIVATION_PATH,		
        WORD_COUNT, MNEMONICS_KP
	  }                    = require('../../const_keywords.js');
	  
	  
const { hexWithoutPrefix,  
        uint8ArrayToHex 
	  }                    = require('../hex_utils.js');

const { Bip39Utils }       = require('../bip39_utils.js');
const { Bip32Utils }       = require('./bip32_utils.js');
const { EntropySize }      = require('../entropy_size.js');
const { CardanoHD_API }    = require('./cardano_hd_api.js');
const { SolanaHD_API }     = require('./solana_hd_api.js');
	
class HDWallet {	
    static async GetWallet( entropy_hex, salt_uuid, blockchain, crypto_net, account, address_index  ) {
		let coin = COIN_ABBREVIATIONS[blockchain];
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		
		pretty_func_header_log( getFunctionCallerName(), blockchain + " " + coin + " " + crypto_net );
		pretty_log( "entropy_hex", entropy_hex );
		
		if ( account == undefined ) 		account       = 0;	
		if ( address_index == undefined ) 	address_index = 0;
		
		let word_count = EntropySize.GetWordCount( entropy_hex );
		let args       = { [WORD_COUNT]: word_count };
		
	    let mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex, args );		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "mnemonics", mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "mnemonics", mnemonics_items[1] );		
		}
		
		pretty_log( "blockchain",    blockchain );
		pretty_log( "account",       account );
		pretty_log( "address_index", address_index );
		
		let options = { [BLOCKCHAIN]:    blockchain, 
			            [ACCOUNT]:       account,
					    [ADDRESS_INDEX]: address_index, 
			            [UUID]:          salt_uuid };
		
		let new_wallet = HDWallet.InitializeWallet();
		
		new_wallet[WALLET_MODE] = HD_WALLET_TYPE;
		new_wallet[BLOCKCHAIN]  = blockchain;
		new_wallet[MNEMONICS]   = mnemonics;
		
		if (   blockchain == ETHEREUM     || blockchain == AVALANCHE 
		    || blockchain == BITCOIN      || blockchain == DOGECOIN || blockchain == LITECOIN 
            || blockchain == RIPPLE       || blockchain == TRON     
            || blockchain == BITCOIN_CASH 
			|| blockchain == DASH || blockchain == FIRO ) {				
				
			if ( blockchain	== AVALANCHE ) { 
				options[BLOCKCHAIN] = ETHEREUM
			}	
			let hdwallet_info = await Bip32Utils.MnemonicsToHDWalletInfo( mnemonics, options );	
            //console.log("   >> hdwallet_info:\n" + JSON.stringify(hdwallet_info));	

			new_wallet[ADDRESS]         = hdwallet_info[ADDRESS]; 
			pretty_log("wallet address", new_wallet[ADDRESS]);
			
			new_wallet[COIN]            = hdwallet_info[COIN];
			new_wallet[COIN_TYPE]       = hdwallet_info[COIN_TYPE];
			new_wallet[PRIVATE_KEY_HEX] = hdwallet_info[PRIVATE_KEY_HEX]; 
			new_wallet[DERIVATION_PATH] = hdwallet_info[DERIVATION_PATH];
			pretty_log("% derivation_path", new_wallet[DERIVATION_PATH]);
			new_wallet[WIF]             = hdwallet_info[WIF];
			pretty_log("WIF", new_wallet[WIF]);
            new_wallet[PRIV_KEY]        = hdwallet_info[PRIV_KEY]; 			
		}
		else if ( blockchain == CARDANO ) {	
			new_wallet = await CardanoHD_API.GetWallet
			                   ( entropy_hex, salt_uuid, blockchain, crypto_net, account, address_index );
		}		
		else if ( blockchain == SOLANA ) {	
			new_wallet = await SolanaHD_API.GetWallet
			                   ( entropy_hex, salt_uuid, blockchain, crypto_net, account, address_index );		
		}
		return new_wallet;
	} // HDWallet.GetWallet()
	
	static InitializeWallet() {
		let null_wallet = {}; 
		null_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
		null_wallet[CRYPTO_NET]      = "Null-NET";
		null_wallet[UUID]            = "Null-UUID";
		null_wallet[PRIVATE_KEY_HEX] = NULL_HEX;
		null_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
		null_wallet[ADDRESS]         = "Null-ADDRESS";
		null_wallet[MNEMONICS]       = "Null-MNEMONICS";
		return null_wallet;
	} // HDWallet.InitializeWallet()
} // HDWallet class

if (typeof exports === 'object') {
	exports.HDWallet = HDWallet
} // exports of 'hd_wallet.js'