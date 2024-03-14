// ======================================================================================
// =================================  hd_wallet_api.js  =================================
// ======================================================================================

// -------- 2024/03/01: Test import avec Dash/DASH dans Guarda.com --------
//  OK : avec Private Key

// -------- 2024/02/28: Test import avec TRON/TRX dans Guarda.com --------
//  OK : avec Private Key (Hex)

// -------- 2024/02/27: Test import avec Ripple/XRP dans Guarda.com --------
//  OK : avec Private Key (Hex)
//  OK : avec Seedphrase

// NB: ne pas oublier impact dans 'wallet_info.js'
//     bloc "if (wallet_info[BLOCKCHAIN]..." lignes 126..129  

const HdAddGen   = require('hdaddressgenerator');
const { Base64 } = require('js-base64');

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  } = require('../util/color/color_console_codes.js');
	  
const { NULL_COIN, 
	    BITCOIN, ETHEREUM, 
		//BINANCE,
		CARDANO, RIPPLE, 
		DOGECOIN, TRON, 
		LITECOIN, DASH,
		//AVALANCHE,
		MAINNET, TESTNET,
		BLOCKCHAIN, NULL_BLOCKCHAIN,
		COIN_ABBREVIATIONS
      }                    = require('./const_blockchains.js');
	  
const { NULL_HEX, NULL_B64, NULL_BECH32, 
		NULL_NET, NULL_UUID, NULL_ADDRESS, NULL_SEEDPHRASE,
		UUID_HEX, CRYPTO_NET,		
        MASTER_KEY_HEX,
		XPRIV, PRIVATE_KEY_HEX, PRIVATE_KEY_B64,
		XPUB,  PUBLIC_KEY_HEX,  PUBLIC_KEY_B64, 

		ADDRESS, ADDRESS_HEX,
		SEEDPHRASE }       = require('./const_wallet.js'); 
	  
const { stringify }        = require('../util/values/string_utils.js');
const { hexToB64, hexToBinary, hexToUint8Array,
        hexWithPrefix, hexWithoutPrefix 
	  }                    = require('./hex_utils.js');
const { Seedphrase_API }   = require('./seedphrase_api.js');

class HD_Wallet_API {
	static InitWallet() {
		let new_wallet = {};
		new_wallet[BLOCKCHAIN]        = NULL_BLOCKCHAIN;
		new_wallet[CRYPTO_NET]        = NULL_NET;
		new_wallet[UUID_HEX]          = NULL_UUID;
		new_wallet[MASTER_KEY_HEX]    = NULL_HEX;
		new_wallet[PRIVATE_KEY_HEX]   = NULL_HEX;
		new_wallet[PRIVATE_KEY_B64]   = NULL_B64;
		new_wallet[PUBLIC_KEY_HEX]    = NULL_HEX;
		new_wallet[ADDRESS]           = NULL_ADDRESS;
		new_wallet[SEEDPHRASE]        = NULL_SEEDPHRASE;
		return new_wallet;
	} // HD_Wallet_API.InitWallet
	
    static async GetWallet(seed_SHA256_hex, salt_uuid, blockchain, crypto_net) {
		if (seed_SHA256_hex == undefined) {
			seed_SHA256_hex = '0x24366f32da0cf3751b97dd2530c9738d93733530247f4e39a104ea86bf95b3f9';
		}
		
		if (blockchain == undefined) {
			blockchain = BITCOIN;
		}
		
		if (crypto_net == undefined) {
			crypto_net = MAINNET;
		}
		
		let coin = COIN_ABBREVIATIONS[blockchain];
		
		console.log(  ">> " + _CYAN_ + "HD_Wallet_API.GetWallet " + _END_ + blockchain + " " + coin + " " + crypto_net);
					
		let new_wallet = HD_Wallet_API.InitWallet();
		
		if (seed_SHA256_hex == undefined) {
			console.log(">> HD_Wallet_API.GetWallet  **ERROR** master_seed_hex: " + seed_SHA256_hex);
			return new_wallet;
		}
		
		seed_SHA256_hex     = hexWithoutPrefix(seed_SHA256_hex);
		
		let master_seed_b64 = hexToB64(seed_SHA256_hex);
		
        //console.log(">> GetWallet: master_seed bytes:              "  + seed_SHA256_hex.length/2);		
		let master_seed_binary = hexToBinary(seed_SHA256_hex);
		
		//console.log("   1 seed_SHA256_hex:\n  " + seed_SHA256_hex);

		let seedphrase = Seedphrase_API.FromSHASeed(hexWithPrefix(seed_SHA256_hex));
		//console.log("   seedphrase:\n  " + seedphrase);		
		// Wallet address :   17KdVMnbsUcv4VUnWHHDhL3QNDGD6By6EE
		// Public Key(Hex):   0x025d4e7c53bb5f05fbc35f002d96b87b713f1a363808a1a653a25a539b316aaa52
		// Private Key (Hex): 0x24366f32da0cf3751b97dd2530c9738d93733530247f4e39a104ea86bf95b3f9
		//                      24366f32da0cf3751b97dd2530c9738d93733530247f4e39a104ea86bf95b3f96d
        // Seed phrase:       category recall smile reduce song ritual hour wing cement main friend brass
		//                    damp once scene morning evolve snack donkey steak hip skull soup color
		
		// Replace 'your 12-word mnemonic here' with your actual 12-word mnemonic.
		// const mnemonic =
		// "replace swamp motion employ inch amused ritual clown liberty remove orbit budget";
		// wallet: 17KdVMnbsUcv4VUnWHHDhL3QNDGD6By6EE
		//const seedphrase  =   
		//         'category recall smile reduce song ritual hour wing cement main friend brass '
		//       + 'damp once scene morning evolve snack donkey steak hip skull soup color';
	
		let bip44 = HdAddGen.withMnemonic(seedphrase, false, coin);
	    let wallets = await bip44.generate(1);
		
		new_wallet[BLOCKCHAIN]        = blockchain;
		new_wallet[CRYPTO_NET]        = crypto_net;
		new_wallet[UUID_HEX]          = salt_uuid;
		new_wallet[MASTER_KEY_HEX]    = seed_SHA256_hex;
		new_wallet[PRIVATE_KEY_HEX]   = wallets[0].privKey;
		
		let pk_uint8_values           = hexToUint8Array(hexWithoutPrefix(seed_SHA256_hex));
		let private_key_b64           = Base64.fromUint8Array(pk_uint8_values);
		new_wallet[PRIVATE_KEY_B64]   = private_key_b64;
		
		new_wallet[PUBLIC_KEY_HEX]    = wallets[0].pubKey;
		
		new_wallet[ADDRESS]           = wallets[0].address;
		new_wallet[SEEDPHRASE]        = seedphrase;
		
		return new_wallet;
	} // HD_Wallet_API.GetWallet()
} // test_GenerateHDWallet class

const test_GenerateHDWallet = async () => {
	//                    '0x24366f32da0cf3751b97dd2530c9738d93733530247f4e39a104ea86bf95b3f9';
	let master_seed_hex = '0x222232da0cf3751b97d33d2530c9738d93733530247f4e39a104ea86bf95b3f9';
	let new_wallet = await HD_Wallet_API.GetWallet(master_seed_hex, RIPPLE, MAINNET);
	
	console.log("   address:\n   "       + new_wallet['address']);
	console.log("   xpriv:\n   "         + new_wallet['private_key_hex']);
	console.log("   xpub:\n   "          + new_wallet['public_key_hex']);
	console.log("   seedphrase:\n   "    + new_wallet['seedphrase']);
} // test_GenerateHDWallet()

const test_2 = async () => {
	let master_seed_hex = '0x24366f32da0cf3751b97dd2530c9738d93733530247f4e39a104ea86bf95b3f9';
	//let master_seed_hex = '0xd28095831f41f92e01baa7a3beb7c3c71c73074b33ca65a73faa5299445dc6c7';
	let seedphrase = Seedphrase_API.FromSHASeed(master_seed_hex);
	//const seedphrase = "brand improve symbol strike say focus ginger imitate ginger appear wheel brand swear relief zero"
	// OR you can use the HdAddGen.getMnemonic() function to generate a mnemonic and seed. 


	// The easiest way to initiate a class is by using an initiation function.  
	let bip44 = HdAddGen.withMnemonic(seedphrase, false, "DASH");

	// Generates 10 addresses from index 0
	let wallets = await bip44.generate(1);
	
	for (let i=0; i < wallets.length; i+=1) {
		let wallet = wallets[i];
		console.log("   address: " + wallet.address);
		console.log("   privKey: " + wallet.privKey);
		console.log("   pubKey:  " + wallet.pubKey);
		console.log("   seedphrase:\n   " + seedphrase);
	}
} // test_2()

//test_GenerateHDWallet();
//test_2();
 
if (typeof exports === 'object') {
	exports.HD_Wallet_API = HD_Wallet_API
} // exports of 'hd_wallet_api.js'