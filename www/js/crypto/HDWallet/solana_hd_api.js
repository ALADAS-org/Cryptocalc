// =====================================================================================
// =================================  solana_hd_api.js  ================================
// =====================================================================================
// SolanaHD_API.js (Solana API wrapper)
// https://www.quicknode.com/guides/solana-development/getting-started/how-to-create-an-address-in-solana-using-javascript&
// https://docs.solana.com/developing/clients/javascript-api
"use strict";

// NB: Import Test OK in "Phantom Wallet" ( private key as Base58 string )

const bip39            = require('bip39');
const bs58             = require('bs58');
const solanaWeb3       = require('@solana/web3.js');

const { Keypair }      = require('@solana/web3.js');

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
	  }                             = require('../../util/color/color_console_codes.js');
	  
const { pretty_func_header_log,
        pretty_log }                = require('../../util/log/log_utils.js');
	  
const { COIN, COIN_TYPE, NULL_COIN,        
        MAINNET, TESTNET,
        SOLANA,
		COIN_ABBREVIATIONS		
	  }                             = require('../const_blockchains.js');
	  
const { NULL_HEX, 
        PRIVATE_KEY, PUBLIC_KEY_HEX,
        CRYPTO_NET, 
		MASTER_SEED, ADDRESS,
		CHAINCODE,
		MASTER_PK_HEX,
		ACCOUNT_XPRIV, ACCOUNT_XPUB,
		UUID, WIF
      }                             = require('../const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        MNEMONICS, WORD_COUNT,
        DERIVATION_PATH }           = require('../../const_keywords.js');


const { hexWithPrefix, hexToBytes,
        hexToB64, uint8ArrayToHex } = require('../hex_utils.js');	
const { b58ToHex }                  = require('../base58_utils.js');		
const { Bip39Utils }                = require('../bip39_utils.js');
const { EntropySize }               = require('../entropy_size.js');

// -------------------------------------------------------------------------------------------------
// -----------------------------------------   SolanaAPI   -----------------------------------------
// -------------------------------------------------------------------------------------------------
// Create HD (multiple) Solana wallets.

// https://nick.af/articles/derive-solana-addresses

// https://www.abiraja.com/blog/from-seed-phrase-to-solana-address
// https://stackoverflow.com/questions/72658589/how-do-i-create-an-hd-wallet-and-child-wallets-in-solana
class SolanaHD_API { 
	static async GetWallet( entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index  ) {
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		
		blockchain = SOLANA;
		let coin   = COIN_ABBREVIATIONS[blockchain];
		
		pretty_func_header_log( "SolanaHD_API.GetWallet", blockchain + " " + coin + " " + crypto_net );
		pretty_log( "SolHD.gW>> entropy_hex", entropy_hex );
		
		if ( account == undefined ) 		account       = 0;	
		if ( address_index == undefined ) 	address_index = 0;

		let word_count = EntropySize.GetWordCount( entropy_hex );
		let mnemonics  = Bip39Utils.EntropyToMnemonics( entropy_hex );
		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "SolHD.gW> mnemonics(" + word_count + ")" , mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "SolHD.gW>" + mnemonics_items[1] );			
		}
		
		let new_wallet = SolanaHD_API.InitializeWallet();
		
		new_wallet[BLOCKCHAIN] = SOLANA;
		new_wallet[CRYPTO_NET] = crypto_net;
		new_wallet[UUID]       = salt_uuid;
        new_wallet[MNEMONICS]  = mnemonics;

        // let hd_wallet_info = await SolanaHD_API.MnemonicsToHDWalletInfo( mnemonics, account, address_index );
		// pretty_log( "SolHD.gW>> hd_wallet_info", JSON.stringify(hd_wallet_info) );		
					
		// https://stackoverflow.com/questions/72658589/how-do-i-create-an-hd-wallet-and-child-wallets-in-solana
		// https://yihau.github.io/solana-web3-demo/tour/create-keypair.html
		const solana_seed = bip39.mnemonicToSeedSync( mnemonics, password ); // (mnemonic, password)
                                                                              
		// NB: 'derivation_path' must be "hardened", even the 'address_index' (eg: "m/44'/501'/0'/0'/0')
		let derivation_path = "m/44'/501'/" + account + "'/0'/" + address_index;		
		if ( ! derivation_path.endsWith("'") )  derivation_path += "'";
		
		pretty_log( "SolHD.gW> derivation_path", derivation_path );
		new_wallet[DERIVATION_PATH] = derivation_path;		
		
		let keypair = solanaWeb3.Keypair.fromSeed
					  ( derivePath( derivation_path, solana_seed.toString("hex")).key );
		new_wallet[ADDRESS] = keypair.publicKey.toBase58();	
		pretty_log( "SolHD.gW>> address", new_wallet[ADDRESS]);
		
		let pk_b58 = bs58.encode( keypair.secretKey );
		new_wallet[PRIVATE_KEY] = pk_b58;
		pretty_log( "SolHD.gW>> private_key", new_wallet[PRIVATE_KEY] );

		return new_wallet;
	} // SolanaHD_API.GetWallet()
	
	static async MnemonicsToHDWalletInfo( mnemonics, account, address_index ) {
		let blockchain    = SOLANA;
		let coin          = COIN_ABBREVIATIONS[blockchain];
		let coin_type     = 501;
		
		let new_wallet = SolanaHD_API.InitializeWallet();
		new_wallet[BLOCKCHAIN]     = SOLANA;
		new_wallet[COIN]           = coin;
		new_wallet[COIN_TYPE]      = coin_type;		
		
		//console.log("   coin_type:                  " + coin_type);
		console.log(">> " + _CYAN_ + "SolanaHD_API.MnemonicsToHDWalletInfo " + _YELLOW_ + coin + _END_);
		
		pretty_log( "blockchain", blockchain );
		
        new_wallet[MNEMONICS] = mnemonics;		
		
		//-------------------- Derivation Path --------------------	
        // https://getcoinplate.com/blog/derivation-paths-guide/#:~:text=A%20derivation%20path%20is%20simply,a%20particular%20branch%20(address).		
        // Start at the master key                                  (m)
        // Follow the BIP44 standard                                (44′)
        // Derive the key for Bitcoin                               (0′)
        // Access the first account                                 (account′)
        // Choose the external chain, used for public addresses     (0)
        // And finally, generate the first address in this sequence (0)
		//                                NB: ref. value is /0'/0/address_index
		
		// https://arshbot.medium.com/hd-wallets-explained-from-high-level-to-nuts-and-bolts-9a41545f5b0
		// let master_derivation_path = "m/44'/" + coin_type + "'" + "/0'/0/" + address_index;
		let derivation_path = "m/44'/" + coin_type + "'" + "/" + account + "'/0/" + address_index;
		pretty_log( "master_derivation_path", derivation_path );	
		pretty_log( "+ derivation_path", derivation_path );
		new_wallet[DERIVATION_PATH] = derivation_path;
		//-------------------- Derivation Path --------------------
		
		//-------------------- Master Seed --------------------
		// https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786
		//                            ====Master Private Key====    =========Chaincode=========
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits)
		const master_seed = bip39.mnemonicToSeedSync( mnemonics, "" );	
		
		let master_seed_hex   = uint8ArrayToHex( master_seed );
	    let master_seed_bytes = master_seed_hex.length / 2;
		pretty_log( "master seed", master_seed_hex );
		new_wallet[MASTER_SEED] = master_seed_hex;
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
		new_wallet[MASTER_PK_HEX] = master_pk_key_hex;
		//-------------------- Master Private Key
		
		//------------------------ Chaincode ------------------------
		//                                                          =========Chaincode=========
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits) 				
		let chaincode = uint8ArrayToHex( master_seed ).substring( 64 );
	    let chaincode_bytes = chaincode.length / 2;
	    console.log(    "   " + _YELLOW_
		              + Bip39Utils.LabelWithSize("chaincode", chaincode_bytes) 
	                  + "          " + _END_ + chaincode);
		new_wallet[CHAINCODE] = chaincode;
        //------------------------ Chaincode
		
		//----------------------- Master Node -----------------------
		// const master_node = bip32.fromSeed( master_seed );
		const master_node = HDKey.fromMasterSeed( master_seed );
		//----------------------- Master Node
					  
		//-------------------- First Private Key --------------------
		//let key = master_node.derivePath( master_derivation_path );
		// https://github.com/paulmillr/scure-bip32
		// https://www.npmjs.com/package/ed25519-keygen
		let hdkey2 = master_node.derive( derivation_path, true );
		
		//let private_key_hex = uint8ArrayToHex( key["__D"] );
		let private_key_hex = uint8ArrayToHex( hdkey2["privateKey"] );
        pretty_log( "private_key_hex", private_key_hex );		
		
		new_wallet[PRIVATE_KEY] = private_key_hex;					  
		//-------------------- First Private Key

		return new_wallet;
	} // SolanaHD_API.MnemonicsToHDWalletInfo()
	
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
	} // SolanaHD_API.InitializeWallet()
} // SolanaHD_API class
//=========== SolanaHD_API ===========

if (typeof exports === 'object') {
	exports.SolanaHD_API = SolanaHD_API
} // exports of 'solana_api.js'