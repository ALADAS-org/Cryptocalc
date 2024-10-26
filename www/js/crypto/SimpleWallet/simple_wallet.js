// ====================================================================================
// ================================= simple_wallet.js =================================
// ====================================================================================
// Notes:
// In Guarda.com:
// * Test with 'Bitcoin':
//   - Private Key: 'ce9c8c7e620dea2d073c5a8fdc2470b643f2d75a4433aee39672ca8a4c63854c'
//     * Import Guarda =>  OK  : Guarda Address = '1mThQhdzhyCALGsQaEWYXScxhBgGCqKqC'    
//   - Mnemonics:   soldier tongue buzz series team bird brother mercy more thrive bring hold 
//                  dish hill harbor major puzzle bronze original never pill crack benefit page
//     * Import Guarda => "KO" : Guarda Address = '14aiBRavvQEyZ61xBWRTpLh9tNMzXme2pr'
//            ** Check with 'Ian ColemanBIP39':
//            => Indeed it is an 'HD wallet' address, the same than with m/44'/0'/0'/0/0
//
// * Test with 'Ethereum':
//   - Private Key: '3c82683aa7a8fe14e4af5f4c4c105dd1bbbbd67097126119fad90d99a4d9786e'
//     * Import Guarda =>  OK  : Guarda Address = '0xda6512a2F67c15700Fd7e235E4E72c203257e026'    
//   - Mnemonics:   develop battle attitude exercise morning apology naive typical era gauge blast pet
//                  roof twenty seat time genre sound rent brass olympic hole ticket smart
//     * Import Guarda => "KO" : Guarda Address = '0x3c281A7127Bc856a8cfB6AB0881BdC0ea6862c3B'
//            ** Check with 'Ian ColemanBIP39':
//            => Indeed it is an 'HD wallet' address, the same than with m/60'/0'/0'/0/0
//
// https://www.reddit.com/r/BitcoinBeginners/comments/hwt21q/private_keys_vs_mnemonic_phrase/
// * A private key will allow you to control one wallet, a private key controls one public address.
// * A mnemonic phrase will allow you to control multiple private keys, and by controlling multiple private keys 
//   those private keys each control a public address.
// * The pros of using a private key wallet, is to have cheaper fees since your BTC will only be in one wallet 
//   compared to a mnemonic phrase which may spread your BTC into multiple wallets. For example if you have a 
//   mnemonic phrase wallet which has private key which contains 1BTC and another private key that contains 2BTC 
//   and you want to send 2.5BTC you will have to pay for two transaction fees.
// * The pros of a mnemonic phrase wallet is privacy since you can receive BTC to multiple public addresses which
//   makes it harder to trace how much BTC you have received. However when you spend your BTC the privacy starts
//   to go away since you have multiple private keys sending money to an address which show that two or more of
//   your public addresses are owned by the same user on the blockchain.

"use strict";

const bip39    = require('bip39');
const elliptic = require('elliptic');

const CoinKey  = require('coinkey');

const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }  = require('../../util/color/color_console_codes.js');
		
const { pretty_func_header_log,
        pretty_log }       = require('../../util/log/log_utils.js');
		
const { COIN,
	    ETHEREUM, 
		BITCOIN, DOGECOIN, LITECOIN, 
		SOLANA,  
		AVALANCHE,
		COIN_ABBREVIATIONS,
		BLOCKCHAIN
      }                    = require('../const_blockchains.js');
	  
const { NULL_HEX, CRYPTO_NET, 
        ADDRESS, PRIVATE_KEY, 
		PUBLIC_KEY_HEX
	  }                    = require('../const_wallet.js');
	  
const { NULL_BLOCKCHAIN, 
        WALLET_MODE, 
        SIMPLE_WALLET_TYPE,
        UUID, MNEMONICS
	  }                    = require('../../const_keywords.js');
	  
	  
const { uint8ArrayToHex 
	  }                    = require('../hex_utils.js');
	
const { Bip39Utils }       = require('../bip39_utils.js');
	
const { CoinKey_API }      = require('./coinkey_api.js'); 
const { Ethereum_API }     = require('./ethereum_api.js'); 
const { SolanaSW_API }     = require('./solana_sw_api.js');

class SimpleWallet {	
    static async GetWallet( private_key, salt_uuid, blockchain, crypto_net ) {
		let coin = COIN_ABBREVIATIONS[blockchain];
		if ( crypto_net == undefined )  crypto_net = "mainnet";

		pretty_func_header_log( "SimpleWallet.GetWallet", blockchain + " " + coin + " " + crypto_net );
		pretty_log( "sw.gw> private_key", private_key );
		
		if ( private_key == undefined || private_key == "" ) {
			throw new Error("SimpleWallet.GetWallet 'private_key' NOT DEFINED");
		} 
		
	    let mnemonics = Bip39Utils.EntropyToMnemonics( private_key );		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "sw.gw> mnemonics(24)", mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "", mnemonics_items[1] );		
		}
		
		let new_wallet = SimpleWallet.InitializeWallet();
		
		new_wallet[WALLET_MODE] = SIMPLE_WALLET_TYPE;
		new_wallet[MNEMONICS]   = mnemonics;

		if (   blockchain == BITCOIN || blockchain == DOGECOIN || blockchain == LITECOIN) {		
		    // await CoinKey_API.GetWallet
			new_wallet = CoinKey_API.GetWallet 
			             ( private_key, salt_uuid, blockchain, crypto_net );			
		}
		else if ( blockchain == ETHEREUM || blockchain == AVALANCHE ) {		
			new_wallet = await Ethereum_API.GetWallet
			             ( private_key, salt_uuid, blockchain, crypto_net );
			if ( blockchain	== AVALANCHE ) { 
				new_wallet[BLOCKCHAIN] = AVALANCHE;
				new_wallet[COIN]       = coin;
			}	
		}
		else if ( blockchain == SOLANA ) {		
			new_wallet = SolanaSW_API.GetWallet( private_key, salt_uuid );
		}

		return new_wallet;
	} // SimpleWallet.GetWallet()
	
	// https://stackoverflow.com/questions/77158846/how-can-i-derive-a-key-pair-from-mnemonic-phrase-successfully-in-nodejs
	static GenerateKeyPairFromMnemonic( mnemonics ) {
	  console.log(  ">> " + _CYAN_ + "SimpleWallet.GenerateKeyPairFromMnemonic " + _END_ 
		            + mnemonics );
					
	  // Derive a seed from the mnemonic phrase
	  const seed = bip39.mnemonicToSeedSync( mnemonics );
	  
	  let seed_hex = uint8ArrayToHex( seed );
	  //console.log("   seed_hex: " + seed_hex);

	  // Create an elliptic curve key pair
	  const ec         = new elliptic.ec('secp256k1');
	  let slice_32     = seed.slice(0, 32);
	  let slice_32_hex = uint8ArrayToHex( slice_32 );
	  //console.log("   slice_32_hex: " + slice_32_hex);
	  const keyPair = ec.genKeyPair({
		entropy: seed.slice(0, 32) // Take the first 32 bytes of the seed for entropy
	  });

	  return {
		privateKey: keyPair.getPrivate('hex'),
		publicKey:  keyPair.getPublic('hex')
	  };
	} // GenerateKeyPairFromMnemonic()
	
	static InitializeWallet() {
		let null_wallet = {}; 
		null_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
		null_wallet[CRYPTO_NET]      = "Null-NET";
		null_wallet[UUID]            = "Null-UUID";
		null_wallet[PRIVATE_KEY] = NULL_HEX;
		null_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
		null_wallet[ADDRESS]         = "Null-ADDRESS";
		null_wallet[MNEMONICS]       = "Null-MNEMONICS";
		return null_wallet;
	} // SimpleWallet.InitializeWallet()
} // SimpleWallet class

if (typeof exports === 'object') {
	exports.SimpleWallet = SimpleWallet
} // exports of 'simple_wallet.js'