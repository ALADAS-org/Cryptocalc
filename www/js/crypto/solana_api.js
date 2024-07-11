// =====================================================================================
// ====================================  solana.js  ====================================
// =====================================================================================
// Solana_API.js (Solana API wrapper)
// https://www.quicknode.com/guides/solana-development/getting-started/how-to-create-an-address-in-solana-using-javascript&
// https://docs.solana.com/developing/clients/javascript-api
"use strict";

// ========== Test import dans Guarda.com ==========
// ========== Test import dans Guarda.com

const bip39            = require('bip39');
const bs58             = require('bs58');
const solanaWeb3       = require('@solana/web3.js');
const { derivePath }   = require('ed25519-hd-key');
const { HDKey }        = require('ed25519-keygen/hdkey');
const { HDPrivateKey, 
        PrivateKey 
  	  }                = require('bitcore-lib');

// https://bitcoin.stackexchange.com/questions/113286/uncaught-typeerror-bip32-fromseed-is-not-a-function
//const bip32         = require('bip32'); => ERROR: "bip32.fromSeed in not a function"
const ecc              = require('tiny-secp256k1');
//const { BIP32Factory 
//      }                = require('bip32');
// You must wrap a tiny-secp256k1 compatible implementation
//const bip32            = BIP32Factory(ecc);
const bip32            = require('@scure/bip32');

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  }                             = require('../util/color/color_console_codes.js');
	  
const { NULL_COIN, 
        BLOCKCHAIN, NULL_BLOCKCHAIN,
        MAINNET, TESTNET,
        SOLANA,
		COIN_ABBREVIATIONS		
	  }                             = require('./const_blockchains.js');
	  
const { PRIVATE_KEY_HEX, 
        CRYPTO_NET, MNEMONICS,
		MASTER_SEED, ADDRESS,
		CHAINCODE, DERIVATION_PATH,
		MASTER_PK_HEX,
		ACCOUNT_XPRIV, ACCOUNT_XPUB,
		UUID, WIF
      }                             = require('./const_wallet.js');

const { hexWithPrefix, hexToBytes,
        hexToB64, uint8ArrayToHex } = require('./hex_utils.js');	
const { b58ToHex }                  = require('./base58_utils.js');		
const { Bip39Utils }                = require('./bip39_utils.js');

// -------------------------------------------------------------------------------------------------
// -----------------------------------------   SolanaAPI   -----------------------------------------
// -------------------------------------------------------------------------------------------------
// Create HD (multiple) Solana wallets.
// https://www.abiraja.com/blog/from-seed-phrase-to-solana-address
// https://stackoverflow.com/questions/72658589/how-do-i-create-an-hd-wallet-and-child-wallets-in-solana
class Solana_API { 
	static async GetWallet( mnemonics, options ) {
		console.log(">> " + _CYAN_ + "[Solana_API.GetWallet]");
		
		let salt_uuid  = options[UUID];		
		let	crypto_net = MAINNET;		

		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		console.log(  "   " + _YELLOW_ 
		            + "mnemonics:              " + _END_ + mnemonics_items[0]);
		if ( mnemonics_items[1].length > 0 ) {	
			console.log(  "   " + _YELLOW_ 
		                + "                        " + _END_ + mnemonics_items[1]);		
		}
		
		let solana_seed_64 = bip39.mnemonicToSeedSync( mnemonics );
		let solana_seed_32 = solana_seed_64.slice(0, 32);
		
		let keypair = solanaWeb3.Keypair.fromSeed( Uint8Array.from( solana_seed_32 ) );
		//console.log(  "   " + _YELLOW_ 
		//            + "keypair >> :    " + _END_ + JSON.stringify(keypair));

		let wallet = {};
		
		wallet[BLOCKCHAIN]          = SOLANA;
		wallet[CRYPTO_NET]          = crypto_net;		
		
		wallet[ADDRESS]             = keypair.publicKey.toString();		
		console.log(  "   " + _YELLOW_ 
		            + "wallet[ADDRESS] >> :    " + _END_ + wallet[ADDRESS]);
		
		wallet['private_key_bytes'] = keypair.secretKey;
		wallet['secret_key']        = bs58.encode( keypair.secretKey );
		
		console.log(  "   " + _YELLOW_ 
		            + "wallet[secret_key] >> : " + _END_ + wallet['secret_key']);
					
		//******
		// https://stackoverflow.com/questions/72658589/how-do-i-create-an-hd-wallet-and-child-wallets-in-solana
		let solana_path = "m/44'/501'/0'/0'";
		wallet[DERIVATION_PATH] = solana_path;
		
		// https://yihau.github.io/solana-web3-demo/tour/create-keypair.html
		const solana_seed = bip39.mnemonicToSeedSync( mnemonics, "" ); // (mnemonic, password)
		for (let i = 0; i < 1; i++) {
			const keypair = solanaWeb3.Keypair.fromSeed
							( derivePath( solana_path, solana_seed.toString("hex")).key );
			console.log(keypair.publicKey.toBase58());
		}
	
		// props
		//[hdkey1.depth, hdkey1.index, hdkey1.chainCode];
		//console.log(hdkey2.privateKey, hdkey2.publicKey);
		//console.log(hdkey3.derive("m/0/2147483647'/1'"));
		//**********************	
		
		let hd_wallet_info = await Solana_API.MnemonicsToHDWalletInfo( mnemonics );
		
		let secret_key_b58_to_hex   = b58ToHex(wallet.secret_key);
		wallet[PRIVATE_KEY_HEX]     = secret_key_b58_to_hex;
		console.log(  "   " + _YELLOW_ 
		            + "wallet[private_key] >>: " + _END_ + wallet[PRIVATE_KEY_HEX]);
		
		wallet[MNEMONICS]           = mnemonics;		
		
		wallet[UUID]                = salt_uuid;
	
		return wallet;
	} // static GetWallet()
	
	static async MnemonicsToHDWalletInfo( mnemonics ) {
		let blockchain    = SOLANA;
		let coin          = COIN_ABBREVIATIONS[blockchain];
		let coin_type     = 501;
		let address_index = 0;
		
		let hdwallet_info = {};
		hdwallet_info[BLOCKCHAIN]     = SOLANA;
		hdwallet_info["coin"]         = coin;
		hdwallet_info["coin_type"]    = coin_type;		
		
		//console.log("   coin_type:                  " + coin_type);
		console.log(">> " + _CYAN_ + "Solana_API.MnemonicsToHDWalletInfo " + _YELLOW_ + coin + _END_);
		
		console.log("   " + _YELLOW_ + "blockchain:             " + _END_ + blockchain);
		
        hdwallet_info["mnemonics"] = mnemonics;		
		
		//-------------------- Derivation Path --------------------	
        // https://getcoinplate.com/blog/derivation-paths-guide/#:~:text=A%20derivation%20path%20is%20simply,a%20particular%20branch%20(address).		
        // Start at the master key                                  (m)
        // Follow the BIP44 standard                                (44′)
        // Derive the key for Bitcoin                               (0′)
        // Access the first account                                 (0′)
        // Choose the external chain, used for public addresses     (0)
        // And finally, generate the first address in this sequence (0)
		//                                NB: ref. value is /0'/0/address_index
		
		// https://arshbot.medium.com/hd-wallets-explained-from-high-level-to-nuts-and-bolts-9a41545f5b0
		//let master_derivation_path = "m/44'/" + coin_type + "'" + "/0'/0/" + address_index;
		let master_derivation_path = "m/44'/" + coin_type + "'" + "/0'/0/" + address_index;
		console.log("   " + _YELLOW_ + "master_derivation_path: " + _END_ + master_derivation_path);
		hdwallet_info[DERIVATION_PATH] = master_derivation_path;
		//-------------------- Derivation Path --------------------
		
		//-------------------- Master Seed --------------------
		// https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786
		//                            ====Master Private Key====    =========Chaincode=========
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits)
		const master_seed = bip39.mnemonicToSeedSync( mnemonics, "" );	
		
		let master_seed_hex   = uint8ArrayToHex( master_seed );
	    let master_seed_bytes = master_seed_hex.length / 2;
	    console.log(    "   " + _YELLOW_
		              + Bip39Utils.LabelWithSize("master seed", master_seed_bytes) 
	                  + "        " + _END_ + master_seed_hex);	
		hdwallet_info[MASTER_SEED] = master_seed_hex;
        //-------------------- Master Seed	

		//********* https://www.npmjs.com/package/ed25519-keygen
		let hdkey1 = HDKey.fromMasterSeed( master_seed );		
		let ed25519_master_pk = uint8ArrayToHex( hdkey1["privateKey"] );		
		let ed25519_chaincode = uint8ArrayToHex( hdkey1["chainCode"] );		
		//*********

        //-------------------- Master Private Key --------------------
		//                            ====Master Private Key====
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits) 
		let master_pk_key_hex = uint8ArrayToHex( master_seed ).substring( 0, 64 ); // LeftSide: 256 first bits 
	    let master_pk_bytes   = master_pk_key_hex.length / 2;
	    //console.log(  "   " + _YELLOW_
		//            + Bip39Utils.LabelWithSize("master_private_key", master_pk_bytes) 
	    //            + " " + _END_ + master_pk_key_hex);
		hdwallet_info[MASTER_PK_HEX] = master_pk_key_hex;
		//-------------------- Master Private Key
		
		//------------------------ Chaincode ------------------------
		//                                                          =========Chaincode=========
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits) 				
		let chaincode = uint8ArrayToHex( master_seed ).substring( 64 );
	    let chaincode_bytes = chaincode.length / 2;
	    console.log(    "   " + _YELLOW_
		              + Bip39Utils.LabelWithSize("chaincode", chaincode_bytes) 
	                  + "          " + _END_ + chaincode);
		hdwallet_info[CHAINCODE] = chaincode;
        //------------------------ Chaincode
		
		//----------------------- Master Node -----------------------
		// const master_node = bip32.fromSeed( master_seed );
		const master_node = HDKey.fromMasterSeed( master_seed );
		//----------------------- Master Node
					  
		//-------------------- First Private Key --------------------
		//let key = master_node.derivePath( master_derivation_path );
		// https://github.com/paulmillr/scure-bip32
		// https://www.npmjs.com/package/ed25519-keygen
		let hdkey2 = master_node.derive( master_derivation_path, true );
		
		//let private_key_hex = uint8ArrayToHex( key["__D"] );
		let private_key_hex = uint8ArrayToHex( hdkey2["privateKey"] );
		console.log(   "   " + _YELLOW_ 
		             + "private_key_hex:        " + _END_ + private_key_hex);
		hdwallet_info[PRIVATE_KEY_HEX] = private_key_hex;					  
		//-------------------- First Private Key		
			
		//----------------------- Extended Private key -----------------------
		//----------------------- Extended Private key
				 
		//--------------------------- WIF ---------------------------
		//--------------------------- WIF	

		return hdwallet_info;
	} // Solana_API.MnemonicsToHDWalletInfo()
} // Solana_API class
//=========== Solana_API ===========

if (typeof exports === 'object') {
	exports.Solana_API = Solana_API
} // exports of 'solana_api.js'