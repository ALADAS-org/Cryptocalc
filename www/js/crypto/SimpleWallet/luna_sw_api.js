// ======================================================================================
// ================================    luna_sw_api.js    ================================
// ======================================================================================
"use strict";

const { MnemonicKey  } = require('@terra-money/feather.js');

const { _CYAN_, _END_ }      = require('../../util/color/color_console_codes.js');

const { pretty_func_header_log,
        pretty_log }                  = require('../../util/log/log_utils.js');

const { TERRA_LUNA,  
		COIN_ABBREVIATIONS } = require('../const_blockchains.js');
	  
const { NULL_HEX, NULL_NET, NULL_UUID,
        NULL_ADDRESS, CRYPTO_NET,
        PRIVATE_KEY, PUBLIC_KEY_HEX,        
		ADDRESS }              = require('../const_wallet.js'); 
		
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        UUID, MNEMONICS, WORD_COUNT } = require('../../const_keywords.js');	
		
const { Bip39Utils } = require('../bip39_utils.js');

class LUNA_API {
    static async GetWallet( entropy_hex, salt_uuid, crypto_net ) {
		pretty_log(">> LUNA_API.GetWallet ", crypto_net);
		
		let new_wallet_infos = LUNA_API.InitializeWallet();
		
		try {
			// Generate a new 24-word mnemonic			
			// let mnemonics_txt = "earn potato insane harsh misery effort thumb often pumpkin notice spawn click arch cargo middle know catalog display together choose share camera arrive person";
			let mnemonics_txt = Bip39Utils.EntropyToMnemonics( entropy_hex );
			
			const mk = new MnemonicKey({ mnemonics_txt });
			
			const wallet_address = mk.accAddress('terra');
			const private_key    = mk.privateKey.toString('hex'); 
			
			// const mnemonic_data = await mnemonicToWalletKey(mnemonics);				
			
			new_wallet_infos[BLOCKCHAIN]  = TERRA_LUNA;
			new_wallet_infos[CRYPTO_NET]  = crypto_net;
			new_wallet_infos[UUID]        = salt_uuid;
			
			//---------- private key ----------
			new_wallet_infos[PRIVATE_KEY] = private_key;
            pretty_log(">> LUNA Private Key:", new_wallet_infos[PRIVATE_KEY]);			
			//---------- private key
			
			//---------- mnemonics ----------
			new_wallet_infos[MNEMONICS] = mnemonics_txt;
			//---------- mnemonics
			
			//---------- public key ----------
			// new_wallet_infos[PUBLIC_KEY_HEX] = LUNA_wallet_data.publicKey;
			//---------- public key
				
			//----------Address ----------
			new_wallet_infos[ADDRESS] = wallet_address;
			pretty_log(">> LUNA Address:", new_wallet_infos[ADDRESS]);
			//---------- Address
	
			return new_wallet_infos;
			
		} catch (error) {
			console.error("*Error* generating LUNA address:", error);
			throw error;
		}
	} // LUNA_API.GetWallet()
	
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
	} // LUNA_API.InitializeWallet()
} // LUNA_API class

const test_LUNA_API = async () => {
	let mnemnics_txt = "earn potato insane harsh misery effort thumb often pumpkin notice spawn click arch cargo middle know catalog display together choose share camera arrive person";
	let entropy_hex = "e7eaca9ca2a91466535d8dc56b460d07b1aa3d58e4c5de1ad1ab83fc278e09e1";
	LUNA_API.GetWallet(entropy_hex);
} // test_LUNA_API()

// test_LUNA_API();

if (typeof exports === 'object') {
	exports.LUNA_API = LUNA_API
} // exports of 'luna_sw_api.js'
