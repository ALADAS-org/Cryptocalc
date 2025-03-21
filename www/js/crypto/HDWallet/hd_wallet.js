// ====================================================================================
// =================================   hd_wallet.js   =================================
// ====================================================================================
"use strict";

const bip39 = require('bip39');
const bs58check = require('bs58check');
const bs58 = require('bs58');

const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }  = require('../../util/color/color_console_codes.js');
		
const { pretty_func_header_log,
        pretty_log }       = require('../../util/log/log_utils.js');
		
const { COIN, COIN_TYPE,
	    ETHEREUM, BITCOIN, DOGECOIN, LITECOIN, 
		SOLANA, CARDANO, RIPPLE, 
		DASH, FIRO, ZCASH, TRON, 
		AVALANCHE, BITCOIN_CASH,   
		MAINNET,
		COIN_ABBREVIATIONS
      }                    = require('../const_blockchains.js');
	  
const { NULL_HEX, CRYPTO_NET, 
        ADDRESS, 
		PRIVATE_KEY, PUBLIC_KEY_HEX,
		PRIV_KEY
	  }                    = require('../const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        WALLET_MODE, HD_WALLET_TYPE,
        UUID, MNEMONICS, WIF,
        PASSWORD, ACCOUNT, ADDRESS_INDEX, DERIVATION_PATH
	  }                    = require('../../const_keywords.js');
	  
	  
const { hexWithoutPrefix,  
        uint8ArrayToHex 
	  }                    = require('../hex_utils.js');

const { Bip39Utils }       = require('../bip39_utils.js');
const { Bip32Utils }       = require('./bip32_utils.js');
const { CardanoHD_API }    = require('./cardano_hd_api.js');
const { SolanaHD_API }     = require('./solana_hd_api.js');

// https://runkit.com/gojomo/baddr2taddr
/**
 * Converts a Bitcoin "Pay To Public Key Hash" (P2PKH) public 
 * address to a ZCash t-address. (Such Bitcoin addresses always
 * start with a '1'. 
 * 
 * The same private key (aka "spending key") that generated 
 * the Bitcoin address can be used to control funds associated
 * with the ZCash t-address. (This requires a ZCash wallet system 
 * which allows that private key to be imported. For example, 
 * zcashd with its `importprivkey` function.)
 */
const btc_addr_to_t_zcash_addr = ( btc_addr_str ) => {
    if ( ! btc_addr_str[0] == '1' ) throw new Error("not a supported Bitcoin address");
	console.log("> btc_addr_to_t_zcash_addr:   btc_addr_str: " + btc_addr_str);
    //let btc_addr = bs58check.decode(btc_addr_str).slice(1);  // discard type byte
	let btc_addr = bs58.decode(btc_addr_str); // discard type byte
	console.log("> btc_addr_to_t_zcash_addr:   A btc_addr: JSON " + JSON.stringify(btc_addr));
	
	btc_addr = btc_addr.slice(1); // discard type byte
	console.log("> btc_addr_to_t_zcash_addr:   B btc_addr: JSON " + JSON.stringify(btc_addr));
	
	//btc_addr = btc_addr.slice(2); // discard 2 bytes
	//btc_addr = btc_addr.slice(2); // discard 2 bytes
	btc_addr = btc_addr.slice(2,22); // discard 2 bytes
	console.log("> btc_addr_to_t_zcash_addr:   C btc_addr: JSON " + JSON.stringify(btc_addr));
	
    let zcash_t_addr = new Uint8Array(22);
	console.log("> btc_addr_to_t_zcash_addr:   1  zcash_t_addr: " + JSON.stringify(zcash_t_addr));	
		
    //zcash_t_addr.set(btc_addr, 2);
	zcash_t_addr.set(btc_addr,2);
	console.log("> btc_addr_to_t_zcash_addr:   2  zcash_t_addr: " + JSON.stringify(zcash_t_addr));
    zcash_t_addr.set([0x1c,0xb8], 0);  // set zcash type bytes
	console.log("> btc_addr_to_t_zcash_addr:   3  zcash_t_addr: " + JSON.stringify(zcash_t_addr));
	
    return bs58.encode(Buffer.from(zcash_t_addr));
}; // btc_addr_to_t_zcash_addr (BTC to ZCASH address)
	
class HDWallet {	
    static async GetWallet( entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index  ) {
		let coin = COIN_ABBREVIATIONS[blockchain];
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		
		pretty_func_header_log( "HDWallet.GetWallet", blockchain + " " + coin + " " + crypto_net );
		//pretty_log( "hdw.gw> entropy_hex", entropy_hex );
		
		if ( entropy_hex == undefined || entropy_hex == "" ) {
			throw new Error("HDWallet.GetWallet 'entropy_hex' NOT DEFINED");
		} 
		
		if ( account == undefined ) 		account       = 0;	
		if ( address_index == undefined ) 	address_index = 0;
		
	    let mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex );		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "hdw.gw> mnemonics", mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "", mnemonics_items[1] );		
		}
		
		//pretty_log( "hdw.gw> blockchain",    blockchain );
		//pretty_log( "hdw.gw> account",       account );
		//pretty_log( "hdw.gw> address_index", address_index );
		
		let options = { [BLOCKCHAIN]:    blockchain, 
		                [PASSWORD]:      password,
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
			|| blockchain == DASH || blockchain == FIRO || blockchain == ZCASH ) {				
				
			if ( blockchain	== AVALANCHE ) { 
				options[BLOCKCHAIN] = ETHEREUM
			}	
			
			let blockchain_was_ZCASH = false;
			if (blockchain == ZCASH) { 
				options[BLOCKCHAIN] = BITCOIN;
				blockchain_was_ZCASH = true;
			}	
			let hdwallet_info = await Bip32Utils.MnemonicsToHDWalletInfo( mnemonics, options );	
            //console.log("   >> hdwallet_info:\n" + JSON.stringify(hdwallet_info));	

            new_wallet[ADDRESS] = hdwallet_info[ADDRESS]; 
            if (blockchain_was_ZCASH) {
				new_wallet[ADDRESS] = btc_addr_to_t_zcash_addr(hdwallet_info[ADDRESS]);
			}				
			//pretty_log("hdw.gw> wallet address", new_wallet[ADDRESS]);	
			
			new_wallet[COIN]            = hdwallet_info[COIN];
			new_wallet[COIN_TYPE]       = hdwallet_info[COIN_TYPE];
			
			if ( hdwallet_info[PASSWORD] != undefined && hdwallet_info[PASSWORD] != "") { 
				new_wallet[PASSWORD] = hdwallet_info[PASSWORD];
			}				
			
			new_wallet[PRIVATE_KEY]     = hdwallet_info[PRIVATE_KEY]; 
			new_wallet[DERIVATION_PATH] = hdwallet_info[DERIVATION_PATH];
			//pretty_log("hdw.gw> derivation_path", new_wallet[DERIVATION_PATH]);
			
			new_wallet[WIF]             = hdwallet_info[WIF];
			pretty_log("hdw.gw> WIF", new_wallet[WIF]);
			
            new_wallet[PRIV_KEY]        = hdwallet_info[PRIV_KEY]; 			
		}
		else if ( blockchain == CARDANO ) {	
			new_wallet = await CardanoHD_API.GetWallet
			                   ( entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index );
		}		
		else if ( blockchain == SOLANA ) {	
			new_wallet = await SolanaHD_API.GetWallet
			                   ( entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index );		
		}
		return new_wallet;
	} // HDWallet.GetWallet()
	
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
	} // HDWallet.InitializeWallet()
} // HDWallet class

if (typeof exports === 'object') {
	exports.HDWallet = HDWallet
} // exports of 'hd_wallet.js'