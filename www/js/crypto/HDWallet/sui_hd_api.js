// ======================================================================================
// ===================================  sui_hd_api.js  ==================================
// ======================================================================================
// Sui_HD_API.js
// NB: Validated on 'Suiet' (Sui wallet) Chrome extension 
"use strict";

// NB: Import Test OK in "Phantom Wallet" ( private key as Base58 string )

const bip39            = require('bip39');
const bs58             = require('bs58');

const { Ed25519Keypair }                       = require('@mysten/sui/keypairs/ed25519');
const { mnemonicToSeedSync, generateMnemonic } = require('bip39');
const { derivePath }                           = require('ed25519-hd-key');

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  }                             = require('../../util/color/color_console_codes.js');
	  
const { pretty_func_header_log,
        pretty_log }                = require('../../util/log/log_utils.js');
	  
const { COIN, COIN_TYPE, NULL_COIN,        
        MAINNET, TESTNET,
        SUI, COIN_ABBREVIATIONS	}   = require('../const_blockchains.js');
	  
const { NULL_HEX, 
        PRIVATE_KEY, PUBLIC_KEY_HEX,
        CRYPTO_NET, MASTER_SEED, ADDRESS,
		CHAINCODE, MASTER_PK_HEX,
		ACCOUNT_XPRIV, ACCOUNT_XPUB,
		UUID, WIF }                 = require('../const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        MNEMONICS, WORD_COUNT,
        DERIVATION_PATH }           = require('../../const_keywords.js');

const { hexWithPrefix, hexToBytes,
        hexToB64, uint8ArrayToHex } = require('../hex_utils.js');	
const { b58ToHex }                  = require('../base58_utils.js');		
const { Bip39Utils }                = require('../bip39_utils.js');
const { EntropySize }               = require('../entropy_size.js');

// -------------------------------------------------------------------------------------------------
// -----------------------------------------   Sui_HD_API   -----------------------------------------
// -------------------------------------------------------------------------------------------------
// Create HD (multiple) SUI wallets.

class Sui_HD_API { 
	static async GetWallet( entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index  ) {
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		
		let coin = COIN_ABBREVIATIONS[blockchain];
		
		pretty_func_header_log( "Sui_HD_API.GetWallet", blockchain + " " + coin + " " + crypto_net );
		pretty_log( "SuiHD.gW>> entropy_hex", entropy_hex );
		
		let new_sui_wallet = Sui_HD_API.InitializeWallet();
		
		new_sui_wallet[BLOCKCHAIN] = SUI;
		new_sui_wallet[CRYPTO_NET] = crypto_net;
		new_sui_wallet[UUID]       = salt_uuid;        
		
		if ( account == undefined ) 		account       = 0;	
		if ( address_index == undefined ) 	address_index = 0;

        // Step 1: Mnemonics
		let word_count = EntropySize.GetWordCount( entropy_hex );
		let mnemonics  = Bip39Utils.EntropyToMnemonics( entropy_hex );
		new_sui_wallet[MNEMONICS]  = mnemonics;
		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "SuiHD.gW> mnemonics(" + word_count + ")" , mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "SuiHD.gW>" + mnemonics_items[1] );			
		}		
		
		// Sui derivation path (BIP-44): m/44'/784'/0'/0'/0'
		pretty_log( "SuiHD.gW> account", account + "  type of " + typeof account ); 
		pretty_log( "SuiHD.gW> address_index", address_index + "  type of " + typeof address_index );
		const derivation_path  = "m/44'/784'/" + account + "'/0'/" + address_index + "'";
		new_sui_wallet[DERIVATION_PATH] = derivation_path;
		
		pretty_log( "SuiHD.gW> derivation_path", new_sui_wallet[DERIVATION_PATH] );

		// Step 2: Derive seed and private key
		const SUI_seed = mnemonicToSeedSync(mnemonics); // returns Buffer
		const { key } = derivePath( derivation_path, SUI_seed.toString('hex') ); // key = private key

		// Step 3: Create the Sui Ed25519 keypair from private key
		// const keypair     = Ed25519Keypair.fromSecretKey(Uint8Array.from(key));
		// const SUI_address = keypair.getPublicKey().toSuiAddress();

		// Output results
		// console.log('Public Key (Base64):', keypair.getPublicKey().toBase64());
		
		// Generate a keypair
		const keypair = Ed25519Keypair.generate( key );

		// Get the secret key (private key)
		const SUI_private_key = keypair.getSecretKey(); // Returns Uint8Array

		// Get the public key
		const publicKey = keypair.getPublicKey();

		// Get address
		const address = keypair.toSuiAddress();
		
		//const SUI_private_key = keypair.export().privateKey;
		// console.log('Private Key (Base64):', keypair.export().privateKey);
		console.log('Private Key (Base64):', SUI_private_key);
		
		new_sui_wallet[PRIVATE_KEY] = SUI_private_key;		
		// new_sui_wallet[ADDRESS]     = SUI_address;
		new_sui_wallet[ADDRESS]     = address;

		return new_sui_wallet;
	} // Sui_HD_API.GetWallet()
	
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
	} // Sui_HD_API.InitializeWallet()
} // Sui_HD_API class
//=========== Sui_HD_API ===========

if (typeof exports === 'object') {
	exports.Sui_HD_API = Sui_HD_API
} // exports of 'sui_hd_api.js'