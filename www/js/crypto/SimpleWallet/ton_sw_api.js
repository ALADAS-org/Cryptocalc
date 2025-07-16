// =====================================================================================
// ================================    ton_sw_api.js    ================================
// =====================================================================================
"use strict";

const { mnemonicToWalletKey }                   = require('ton-crypto');
const { WalletContractV4, TonClient, internal } = require('@ton/ton');
const { beginCell }                             = require('@ton/core');

const { _CYAN_, _END_ }        = require('../../util/color/color_console_codes.js');
		
const { ETHEREUM, TON,  
		COIN_ABBREVIATIONS }   = require('../const_blockchains.js');
	  
const { NULL_HEX, NULL_NET, NULL_UUID,
        NULL_ADDRESS, CRYPTO_NET,
        PRIVATE_KEY, PUBLIC_KEY_HEX,        
		ADDRESS }              = require('../const_wallet.js'); 
		
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        UUID, MNEMONICS, WORD_COUNT } = require('../../const_keywords.js');	  
const { Bip39Utils }           = require('../bip39_utils.js');

class TON_API {
    static async GetWallet( entropy_hex, salt_uuid, crypto_net ) {
		console.log(">> " + _CYAN_ + "TON_API.GetWallet " + _END_ + crypto_net);
		
		try {
			// Generate a new 24-word mnemonic			
			// let mnemonics_txt = "earn potato insane harsh misery effort thumb often pumpkin notice spawn click arch cargo middle know catalog display together choose share camera arrive person";
			let mnemonics_txt = Bip39Utils.EntropyToMnemonics( entropy_hex );
			let mnemonics = mnemonics_txt.split(' ');
			
			const mnemonic_data = await mnemonicToWalletKey(mnemonics);		
			
			let new_wallet_infos = TON_API.InitializeWallet();
			
			// Create wallet contract (v4 is the most common)
			const wallet = WalletContractV4.create({
				workchain: 0, // Usually 0 for basic wallets
				publicKey: mnemonic_data.publicKey
			});
			
			// Get the address
			const TON_address = wallet.address.toString({
				urlSafe:    true,
				bounceable: false,
				testOnly:   false // Set to true for testnet
			}); // TON_address
			
			console.log("   TON Address:", TON_address);
			
			let TON_wallet_data = {
				mnemonic:   mnemonics_txt,
				publicKey:  mnemonic_data.publicKey.toString('hex'),
				privateKey: mnemonic_data.secretKey.toString('hex'),
				address:    TON_address
			}; // TON_wallet_data	
			
			new_wallet_infos[BLOCKCHAIN]  = TON;
			new_wallet_infos[CRYPTO_NET]  = crypto_net;
			new_wallet_infos[UUID]        = salt_uuid;
			
			//---------- private key ----------
			new_wallet_infos[PRIVATE_KEY] = TON_wallet_data.privateKey;
			console.log(  ">> " + _CYAN_ + "TON " + _END_ + "Private Key:\n   " + new_wallet_infos[PRIVATE_KEY]);	
			//---------- private key
			
			//---------- mnemonics ----------
			new_wallet_infos[MNEMONICS] = mnemonics_txt;
			//---------- mnemonics
			
			//---------- public key ----------
			new_wallet_infos[PUBLIC_KEY_HEX] = TON_wallet_data.publicKey;
			//---------- public key
				
			//----------Address ----------
			new_wallet_infos[ADDRESS] = TON_address;
			console.log(  ">> " + _CYAN_ + "TON " + _END_ + "Address:\n   " + new_wallet_infos[ADDRESS]);	
			//---------- Address
	
			return new_wallet_infos;
			
		} catch (error) {
			console.error("*Error* generating TON address:", error);
			throw error;
		}
	} // TON_API.GetWallet()
	
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
	} // TON_API.InitializeWallet()
} // TON_API class

if (typeof exports === 'object') {
	exports.TON_API = TON_API
} // exports of 'ton_sw_api.js'
