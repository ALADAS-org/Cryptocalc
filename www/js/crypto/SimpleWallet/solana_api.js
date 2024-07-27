// Solana_API.js (Solana API wrapper)
// https://www.quicknode.com/guides/solana-development/getting-started/how-to-create-an-address-in-solana-using-javascript&
// https://docs.solana.com/developing/clients/javascript-api
"use strict";

// ========== Test ajout sur Guarda.com (2024/01/22) ==========
//  OK : avec mnemonics 24 mots en une seule ligne (KO si sur 2 lignes)
//  OK : avec 'Secret Key' en hexadécimal SANS préfixe '0x'
// *KO*: avec 'Secret Key' en hexadécimal AVEC préfixe '0x'
// *KO*: avec 'Secret Key' en Base64
// ========== Test ajout sur Guarda.com (2024/01/22)

const bip39      = require('bip39');
const bs58       = require('bs58');
const solanaWeb3 = require('@solana/web3.js');

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  } = require('../util/color/color_console_codes.js');
	  
const { NULL_COIN, BLOCKCHAIN, NULL_BLOCKCHAIN,
        MAINNET, TESTNET,
        SOLANA, 
	  }                      = require('./const_blockchains.js');

const { hexWithPrefix, hexToBytes,
        hexToB64, b58ToHex,
		uint8ArrayToHex	}    = require('./hex_utils.js');			
const { Seedphrase_API }     = require('./seedphrase_api.js');

//====================================================================
//==========================  SolanaAPI    ===========================
//==================================================================== 

// Create HD (multiple) Solana wallets
// https://stackoverflow.com/questions/72658589/how-do-i-create-an-hd-wallet-and-child-wallets-in-solana

class Solana_API { 
	static GetWallet(seed_sha256_hex, salt_uuid) {
		console.log(">> " + _CYAN_ + "[Solana_API.GetWallet]" + _END_ + " " + seed_sha256_hex);
		//const keypair = solanaWeb3.Keypair.generate();
		
		let seed_sha256_bytes = hexToBytes(seed_sha256_hex);
		let seedphrase = Seedphrase_API.FromSHASeed(seed_sha256_hex); // (mnemonic, password)
		//console.log(">> Solana_API: seedphrase\n" + seedphrase);	
		
		// https://texts.blog/2022/04/20/simplifying-ipc-in-electron/
		//console.log(">> SolanaAPI seed_sha256_bytes\n" + stringify(seed_sha256_bytes));
		//let solana_seed_64 = seed_sha256_bytes;
		
		//let secretKey_1 = Uint8Array.from(seed_sha256_bytes);
		let solana_seed_64 = bip39.mnemonicToSeedSync(seedphrase);
		let solana_seed_32 = solana_seed_64.slice(0, 32);
		
		//let solana_seed_32_hex = uint8ArrayToHex(solana_seed_32);
		//console.log(">> Solana_API: solana_seed_32_hex\n" + solana_seed_32_hex);
		//
		//let seedphrase_2 = Seedphrase_API.FromSHASeed(solana_seed_32_hex); // (mnemonic, password)
		//console.log(">> Solana_API: seedphrase 2\n" + seedphrase_2);
		
		//console.log(">> ================ SolanaAPI solana_seed: " + solana_seed_32);
		
		//const solana_seed = seed_sha256_bytes;
		//console.log(">> SolanaAPI solana_seed " + stringify(solana_seed_32));
		
		// https://stackoverflow.com/questions/69701543/how-do-i-load-my-solana-wallet-using-my-private-key-file
		// fromSeed() method requires 32 bytes
		//let keypair = solanaWeb3.Keypair.fromSeed(Uint8Array.from(seed_sha256_bytes));
		
		// NB: use "browserified" version of SolanaWeb3 imported via index.html because this is not a module 
		let keypair = solanaWeb3.Keypair.fromSeed(Uint8Array.from(solana_seed_32));
		//let keypair = solanaWeb3.Keypair.fromSeed(secretKey_1);
		
		//console.log("Secret Key:", keypair.secretKey);
		let wallet = {};
		
		wallet[BLOCKCHAIN]          = SOLANA;
		wallet['crypto_net']        = MAINNET;
		
		wallet['uuid_hex']          = salt_uuid;
		
		wallet['public_key']        = keypair.publicKey.toString();
		wallet['address']           = wallet['public_key'];
		console.log("wallet[address]: " + wallet['address']);
		
		wallet['private_key_bytes'] = keypair.secretKey;
		wallet['secret_key']        = bs58.encode(keypair.secretKey);
		
		let secret_key_b58_to_hex   = b58ToHex(wallet.secret_key);
		wallet['private_key_hex']   = secret_key_b58_to_hex;
		//console.log("wallet[private_key_hex]:\n" + wallet['private_key_hex']);
		
		// NB: ** BUG ** (génération ONG recto KO)
        //	   avec hexToB64(wallet.private_key_hex) car trop long (88 caractères en Base64)
		wallet['private_key_b64']   = hexToB64(seed_sha256_hex); // 44 caractères en Base64 
		
		wallet['seedphrase']        = seedphrase;
		
		wallet['seed_sha256_hex']   = seed_sha256_hex;
		
		wallet['public_key_b58']    = wallet['address'];
		
		let public_key_b58_to_hex   = b58ToHex(wallet.public_key);
		wallet['public_key_hex']    = public_key_b58_to_hex;
		wallet['public_key_b64']    = hexToB64(wallet.public_key_hex);
		
		//console.log("    wallet[address]: "      + wallet['address']);
		//console.log("    wallet['secret_key']: " + wallet['secret_key']);
		//console.log("    wallet['seedphrase']:\n" + seedphrase);
		
		//console.log(  "\n\n>> -------- SolanaAPI:"=
		//            + "\nwallet.public_key:\n " + wallet.public_key
		//			+ "\nwallet.seedphrase:\n"   + wallet.seedphrase
		//            + "\nwallet.secret_key:\n"  + wallet.secret_key
		//			+ "\nprivate_key_hex:\n"    + wallet.private_key_hex
		//			+ "\n\n");
		
		return wallet;
	} // static GetWallet()
} // Solana_API class
//=========== SolanaAPI_SSR ===========

if (typeof exports === 'object') {
	exports.Solana_API = Solana_API
}