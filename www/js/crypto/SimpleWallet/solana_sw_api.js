// solana_simple_wallet.js (Solana API wrapper)
// https://www.quicknode.com/guides/solana-development/getting-started/how-to-create-an-address-in-solana-using-javascript&
// https://docs.solana.com/developing/clients/javascript-api
"use strict";

// https://coin98.net/solana-wallet

// ========== Test ajout sur Guarda.com (2024/01/22) ==========
//  OK : avec mnemonics 24 mots en une seule ligne (KO si sur 2 lignes)
//  OK : avec 'Secret Key' en hexadécimal SANS préfixe '0x'
// *KO*: avec 'Secret Key' en hexadécimal AVEC préfixe '0x'
// *KO*: avec 'Secret Key' en Base64
// ========== Test ajout sur Guarda.com (2024/01/22)

const bip39      = require('bip39');
const bs58       = require('bs58');
const solanaWeb3 = require('@solana/web3.js');

const { _CYAN_, _END_ 
	  } = require('../../util/color/color_console_codes.js');
	  
const { pretty_log }         = require('../../util/log/log_utils.js');
	  
const { BLOCKCHAIN,
        MAINNET,
        SOLANA 
	  }                      = require('../const_blockchains.js');
	  
const { CRYPTO_NET, UUID, ADDRESS,
	    PRIVATE_KEY, PUBLIC_KEY_HEX 
	  }                      = require('../const_wallet.js');
	  
const { MNEMONICS, WIF 
	  }                      = require('../../const_keywords.js');

const { uint8ArrayToHex	}    = require('../hex_utils.js');
		
const { b58ToHex }           = require('../base58_utils.js');

const { Bip39Utils }         = require('../bip39_utils.js');
const { computeWIF }         = require('../crypto_utils.js');		

//===========================================================================================
//====================================    SolanaSW_API    =================================== 
//=========================================================================================== 
// Solana 'Simple Wallet' (also called 'Non deterministic', 'Standard' or 'Legacy') 
// * Supported Blockchains:
//   - Bitcoin, DogeCoin, LiteCoin, Ethereum, 
//     Solana, Avalanche, , 
//   - Not supported (in 'Simple Wallet'): Cardano, Ripple, TRON, Dash, (ZCASH: check)
//
// -------- ** Import Test 'Guarda.com' ** 2024/08/13 --------
// - 'Private Key':           ^OK^ => GaWbMj7YbXwDoQVAXbYYeAwb41tGCvaGZiWPrtTK75m8
//   * 27dad1b723b0ed00ee4ecb8b899394c9c1620f3dec468f1ce200112ad06455c0559261937ee4f440f80132aea7583de20299f9647f65fb979c1577f611890124
// - 'Seedphrase' (24 words): ^OK^ => GaWbMj7YbXwDoQVAXbYYeAwb41tGCvaGZiWPrtTK75m8
//   * object valley exile volcano offer stomach usual unveil motion gas liberty body 
//     illegal open hope snack over thunder economy valve artwork inspire direct december
// - 'WIF':                   *KO* => "Private key is Invalid!"
//   * With    '01' ('mainnet') at the end: L2KQbhb2QVeMgxpgmFAtARSooEWWJKw8n3h1Dr3UTkSUq6MrHz98
//   * Without '01' ('mainnet') at the end: 5K51F7FqYbmjX2PNnqPyJh3ZiYzYsuWr2zqFKg9HZDKXB68nQKg
// -------- ** Import Test 'Guarda.com' ** 2024/08/13 --------

class SolanaSW_API { 
	static GetWallet( entropy_hex, salt_uuid ) {
		console.log(">> " + _CYAN_ + "[SolanaHD_API.GetWallet]" + _END_ + " " + entropy_hex);
		
		let mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex ); // (mnemonic, password)
		pretty_log("entropy_hex", entropy_hex);
		
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "mnemonics(24)" , mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "", mnemonics_items[1] );		
		}	
		
		let seed_64_bytes     = bip39.mnemonicToSeedSync( mnemonics );
		let seed_64_bytes_hex = uint8ArrayToHex( seed_64_bytes );
		
		let seed_32_bytes     = seed_64_bytes.slice(0, 32);
		
		let seed_32_bytes_hex = uint8ArrayToHex( seed_32_bytes );
		pretty_log("seed_32_bytes_hex", seed_32_bytes_hex);
		//console.log("   >>> bytes length:             " + seed_32_bytes.length);

		//console.log(">> SolanaHD_API: solana_seed_32_hex\n" + solana_seed_32_hex);
		//
		//let seedphrase_2 = Seedphrase_API.FromSHASeed(solana_seed_32_hex); // (mnemonic, password)
		//console.log(">> SolanaHD_API: mnemonics 2\n" + seedphrase_2);
		
		// NB: use "browserified" version of SolanaWeb3 imported via index.html because this is not a module 
		let keypair = solanaWeb3.Keypair.fromSeed( Uint8Array.from( seed_32_bytes ) );
		//let keypair = solanaWeb3.Keypair.fromSeed(secretKey_1);
		
		//console.log("Secret Key:", keypair.secretKey);
		let wallet = {};
		
		wallet[BLOCKCHAIN]          = SOLANA;
		wallet[CRYPTO_NET]          = MAINNET;
		
		wallet[UUID]                = salt_uuid;
		
		let wallet_address          = keypair.publicKey.toString(); // NB: 'address' is the 'public key'
		wallet[ADDRESS]             = wallet_address;		
		wallet['public_key']        = wallet_address;
		
		pretty_log("keypair.publicKey (address)", keypair.publicKey.toString());		
		
		wallet['private_key_bytes'] = keypair.secretKey;
		
		let secret_key_b58          = bs58.encode( keypair.secretKey );
		let secret_key_b58_to_hex   = b58ToHex( secret_key_b58 );

		pretty_log("secret_key_b58_to_hex", secret_key_b58_to_hex);
		pretty_log("secret_key_b58", secret_key_b58);
		
		wallet[PRIVATE_KEY]     = secret_key_b58_to_hex;
		
		let wif = computeWIF( entropy_hex );	
		wallet[WIF] = wif;
        pretty_log("WIF", wallet[WIF]);		
			
		wallet[MNEMONICS]         = mnemonics;
		
		wallet['public_key_b58']  = wallet[ADDRESS];
		
		let public_key_b58_to_hex = b58ToHex( wallet.public_key );
		wallet[PUBLIC_KEY_HEX]    = public_key_b58_to_hex;
		
		return wallet;
	} // static GetWallet()
} // SolanaSW_API class

if (typeof exports === 'object') {
	exports.SolanaSW_API = SolanaSW_API
}