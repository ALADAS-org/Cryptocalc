// =====================================================================================
// ================================   coinkey_api.js   =================================
// =====================================================================================
// Generates public wallet blockchain address
// Supported coins: Bitcoin, LiteCoin, DogeCoin

// ========== Test ajout sur Guarda.com (2024/01/18) ==========
// DogeCoin 
//  OK : clé privée en hexa SANS préfixe '0x'
// *KO*: seedphrase
// ------------------------------------------------------------
// Litecoin
//  OK: clé privée en hexa SANS préfixe '0x' 
// ========== Test ajout sur Guarda.com (2024/01/18)

const CoinKey          = require('coinkey');

// https://bitcoin.stackexchange.com/questions/113286/uncaught-typeerror-bip32-fromseed-is-not-a-function
const { BIP32Factory } = require('bip32');

// You must wrap a tiny-secp256k1 compatible implementation
const ecc              = require('tiny-secp256k1');
const bip32            = BIP32Factory(ecc);

const bip39            = require('bip39');
const bs58             = require('bs58');
const Mnemonic         = require('bitcore-mnemonic');
const bitcore          = require('bitcore-lib');
const bitcoin          = require('bitcoinjs-lib');
const HDKey            = require('hdkey');


const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  }                  = require('../util/color/color_console_codes.js');
	  
const { NULL_COIN, BLOCKCHAIN, NULL_BLOCKCHAIN,
        MAINNET, TESTNET,
        BITCOIN, ETHEREUM, DOGECOIN, LITECOIN,
        COIN_ABBREVIATIONS		
	  }                  = require('./const_blockchains.js');
	  
const { NULL_HEX, NULL_B64,
        ADDRESS, UUID_HEX, CRYPTO_NET, SEEDPHRASE,
		PRIVATE_KEY_HEX, PRIVATE_KEY_B64,
		PUBLIC_KEY_HEX, PUBLIC_KEY_B64
	  }                  = require('./const_wallet.js');	  
	  
const { stringify }      = require('../util/values/string_utils.js');
const { Seedphrase_API } = require('./seedphrase_api.js');

/*
http://cryptocoinjs.com/modules/currency/coininfo/
Crypto Coin	Public Address		Private Wallet Import Format	Script Hash
----------- --------------      ----------------------------    -----------
BTC			0x00				0x80							0x05
BTC-TEST	0x6F				0xEF							0xC4
LTC			0x30				0xB0							0x05 // new CoinKey(new Buffer(privateKey, 'hex'), {private: 0xB0, public: 0x30})
LTC-TEST	0x6F				0xEF							0xC4
DOGE		0x1E				0x9E							0x16
DOGE-TEST	0x71				0xF1							0xC4
*/

/*
1. A Bitcoin address is between 25 and 34 characters long.
2. The address always starts with a 1 (for P2PKH address format) or 3 (for P2SH address format).
3. An address can contain all alphanumeric characters, with the exceptions of 0(zero), O(Uppercase letter 'O'), I(Uppercase i)
and l(Lowercase L) to avoid visual ambiguity.
*/
/*
{ versions: 
	{ 	public: 48,
		private: 176,
		//scripthash: 5,
		//bip32: { public: 27108450, private: 27106558 } } 
	}
*/
// Check validity of Bitcoin address
// Check BTC testnet: https://live.blockcypher.com/btc-testnet/address/mtmsodedEFyyLBSHoKmv6GDcQv4ZvRQfzg/
// https://blockchair.com/
// https://thomas.vanhoutte.be/tools/validate-bitcoin-address.php?address=19aTjx2Ww5iiYbNrKZir2aU1GEBLdFDZ4V&submit=

// https://medium.com/asecuritysite-when-bob-met-alice/02-03-or-04-so-what-are-compressed-and-uncompressed-public-keys-6abcb57efeb6
// "Uncompressed public key starts with 04" (0x04...)

class CoinKey_API {
    static GetWallet(private_key, salt_uuid, blockchain, crypto_net) {
		console.log(  ">> " + _CYAN_ + "CoinKey_API.GetWallet " + _END_ 
		            + " " + COIN_ABBREVIATIONS[blockchain] + " " + crypto_net);
		
		let new_wallet = {};
			
		if (private_key == undefined) {
			console.log(">> CoinKey_API.GetWallet  **ERROR** private_key: " + private_key);
			new_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
			new_wallet[CRYPTO_NET]      = "Null-NET";
			new_wallet[UUID_HEX]        = "Null-UUID";
			new_wallet[PRIVATE_KEY_HEX] = NULL_HEX;
			new_wallet[PRIVATE_KEY_B64] = NULL_B64;
			new_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
			new_wallet[ADDRESS]         = "Null-ADDRESS";
			new_wallet[SEEDPHRASE]      = "Null-SEEDPHRASE";
			return new_wallet;
		}
		
		const hex_to_B64 = (hex_str) => {
			if (hex_str.startsWith("0x")) hex_str = hex_str.substring(2);
			return btoa(hex_str.match(/\w{2}/g).map(function(a) {
				return String.fromCharCode(parseInt(a, 16));
			}).join(""));
		}; // hex_to_B64

		let versions = {};	
		
		//console.log(">> getBlockchainWallet  blockchain: " + blockchain + " crypto_net:" + crypto_net);
		//console.log(">> getBlockchainWallet  private_key: " + private_key);
		
		// https://github.com/Swyftx/crypto-address-validator
		if (blockchain == undefined) {
			blockchain  = BITCOIN;
			crypto_net  = MAINNET;
			
			//----- Testé avec Validator https://github.com/Swyftx/crypto-address-validator -----
			versions = { private: 0x80, public: 0x00 }; // OK BTC mainnet
		}
		
		if (blockchain != BITCOIN  &&  blockchain != LITECOIN  &&  blockchain != DOGECOIN) {
			blockchain = BITCOIN;
		}
		
		if  (       crypto_net == undefined 
				|| (crypto_net != MAINNET && crypto_net != TESTNET)
			) {
			crypto_net = MAINNET;
		}
		
		//----- Validité des adresses générées testées avec:
		// https://github.com/Swyftx/crypto-address-validator -----
		switch(blockchain) {
			case BITCOIN:		if (crypto_net == MAINNET)
									versions = { private: 0x80, public: 0x00 }; // OK BTC mainnet
								else if (crypto_net == TESTNET)
									versions = { private: 0xEF, public: 0x6F }; // OK BTC testnet
								break;				
								
			case LITECOIN:	    if (crypto_net == MAINNET)
									versions = { private: 0xB0, public: 0x30 }; // OK LTC mainnet
								else if (crypto_net == TESTNET)
									versions = { private: 0xEF, public: 0x6F }; // OK LTC testnet
								break;
			
			case DOGECOIN:	    if (crypto_net == MAINNET)
									versions = { private: 0x9E, public: 0x1E }; // OK DOGE mainnet
								else if (crypto_net == TESTNET)
									versions = { private: 0xF1, public: 0x71 }; // OK DOGE testnet
								break;	
						
			default: 			versions = { private: 0x80, public: 0x00 }; // OK BTC mainnet
								break;
		}
		
		//console.log(">> getBlockchainWallet  blockchain: " + blockchain + " crypto_net:" + crypto_net + "  versions: " + JSON.stringify(versions));	
		new_wallet = {};
		
		var public_key = "";		

		//========================= Bitcoin, LiteCoin, DogeCoin =========================
		// https://stackoverflow.com/questions/52165333/deprecationwarning-buffer-is-deprecated-due-to-security-and-usability-issues
		//let coinkey_wallet = new CoinKey(new Buffer(private_key, 'hex'), versions);
		let coinkey_wallet = new CoinKey(Buffer.from(private_key, 'hex'), versions);
		
		// http://cryptocoinjs.com/modules/misc/bs58/
		//public_key = bs58.encode(new Buffer(coinkey_wallet.publicKey, 'hex'));
		public_key = bs58.encode(Buffer.from(coinkey_wallet.publicKey, 'hex'));
		
		//console.log("Public Key Base58\n" + b58_encoded); // => 16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS
	
		//var b58_decoded = bs58.decode(public_key_b58_encoded);
		//var b58_decoded_to_hex = new Buffer(b58_decoded).toString('hex');
		//console.log("Public Key Base58 to Hex\n" + b58_decoded_to_hex); // => 003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187
		
		//console.log("getBlockchainWallet wallet.privateKey:\n" + wallet.privateKey);
		
		//---------- UUID salt ----------
		new_wallet[UUID_HEX] = salt_uuid;
		//---------- UUID salt ----------
		
		//---------- private key ----------
		new_wallet[PRIVATE_KEY_HEX] = coinkey_wallet.privateKey.toString('hex');
		new_wallet[PRIVATE_KEY_B64] = hex_to_B64(new_wallet[PRIVATE_KEY_HEX]);
		//console.log("getBlockchainWallet wallet private_key_hex:\n" + new_wallet['private_key_hex']);
		if (! new_wallet[PRIVATE_KEY_HEX].startsWith('0x')) {
			new_wallet[PRIVATE_KEY_HEX] = '0x' + new_wallet[PRIVATE_KEY_HEX];
		}
		//console.log("getBlockchainWallet wallet private_key_hex:\n" + new_wallet['private_key_hex']);
		//---------- private key
		
		//---------- public key ----------
		//console.log("getBlockchainWallet wallet.publicKey:\n" + wallet.publicKey);
		new_wallet[PUBLIC_KEY_HEX] = coinkey_wallet.publicKey.toString('hex');
		if (! new_wallet[PUBLIC_KEY_HEX].startsWith('0x')) {
			new_wallet[PUBLIC_KEY_HEX] = '0x' + new_wallet[PUBLIC_KEY_HEX];
		}
		
		new_wallet[PUBLIC_KEY_B64] = hex_to_B64(new_wallet[PUBLIC_KEY_HEX]);

		//console.log("getBlockchainWallet wallet public_key_hex:\n" + new_wallet['public_key_hex']);
		//---------- public key
		
		//---------- BTC/LTC/DOGE wallet address ----------
		//console.log(">> getBlockchainWallet ** BTC/LTC/DOGE address:\n" + wallet.publicAddress);
		new_wallet[ADDRESS] = coinkey_wallet.publicAddress;
		//console.log(">> getBlockchainWallet ** wallet address:\n" + new_wallet['address']);
		//---------- BTC/LTC/DOGE wallet address

		//console.log("SAVE BUT DO NOT SHARE THIS:", wallet.privateKey.toString('hex'));
		//console.log("Public Key Hex\n", wallet.publicKey.toString('hex'));
		//console.log("Address\n", wallet.publicAddress);

		new_wallet[BLOCKCHAIN] = blockchain;
		new_wallet[CRYPTO_NET] = crypto_net;
		
		return new_wallet;
	} // static GetWallet()
	
	// https://stackoverflow.com/questions/77295029/generate-a-bitcoin-core-private-key-from-a-seed-phrase
	static GenerateHDWallet() {
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
		const seedphrase  =   
		         'category recall smile reduce song ritual hour wing cement main friend brass '
		       + 'damp once scene morning evolve snack donkey steak hip skull soup color';

		// Convert the mnemonic to a seed
		const master_seed     = bip39.mnemonicToSeedSync(seedphrase);
		const master_seed_hex = Seedphrase_API.ToPrivateKey(seedphrase);

		// Create an HD wallet key from the seed
		const hdKey   = HDKey.fromMasterSeed(Buffer.from(master_seed));

        // BIP44: builds upon the original BIP 32 scheme to include a purpose1
		// Define the BIP44 path for Bitcoin (m/44'/0'/0'/0/0)
		
		// NB: Guarda accepte seedphrase, XPRIV, WIF
		// XPRIV: An extended private key, or xprv, is a private key which can be used to 
		//        derive child private keys as part of a Hierarchical Deterministic (HD) wallet
		const node = bip32.fromSeed(master_seed);
		let xpriv  = node.toBase58();
		
		// Test Guarda.com BTC
		// master_seed:        24366f32da0cf3751b97dd2530c9738d93733530247f4e39a104ea86bf95b3f9
		// wallet:             1FKA5rix6WZV1rBTbkw7wFgm7Kvh9Jo2u1
		// OK avec XPRIV:      xprv9s21ZrQH143K3teeCkSNAYtDU3do6dniH2aCqN1iELqUuEiRixwUd15uVgfZaFmckVDUpFGurUF5weWRRKRRfjoykoE5uaewxaX8Q5p2Y7B
		// OK avec WIF:        L4rqwomxVuMmUaBWgMrLt63U3mRV1qTY4NGVykU9n1GHbzDK8jRd
		// OK avec Mnemonic:   category recall smile reduce song ritual hour wing cement main friend brass 
		//                     damp once scene morning evolve snack donkey steak hip skull soup color
		// OK avec PK dérivée: e3f6fe32c83a2bfc0a51f0ff46dc77c3526551e332c2b733d83a8f7d0162de9d
		// https://river.com/learn/terms/b/bip-44-derivation-paths-for-p2pkh/
		// https://learnmeabitcoin.com/technical/derivation-paths
		//               m / purpose' / coin_type' / account' / change / index
		//               m / 44'      / 0'         / 0'       / 0      / 0
		// coin_types: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
		// ETH, BTC, LTC, DOGE, SOL, ADA, XRP, DASH, FIL (FileCoin), ZIL (Zilliqa)
		//for (let i = 0; i < 10; i++) {
        //const path = `m/44'/501'/${i}'/0'`;
		const path    = "m/44'/0'/0'/0/0";

		// Derive a child key from the HD key using the defined path
		const child   = hdKey.derive(path);

		// Create a CoinKey from the derived child private key and specify the Bitcoin network
		const coinKey = new CoinKey(child.privateKey, bitcoin.networks.bitcoin);

		// Prepare an object with address, path, private key, and Wallet Import Format (WIF) key
		const info = {
			address:     coinKey.publicAddress,              // Bitcoin public address
			path,                                            // BIP44 path
			master_seed: master_seed_hex,                    // master_seed
			privateKey:  coinKey.privateKey.toString("hex"), // Private key in hexadecimal
			WIF:         coinKey.privateWif,                 // Wallet Import Format (WIF) private key
			XPRIV:       xpriv
		};
		
		console.log("info\n", stringify(info));
	} // static GenerateWalletXPriv()
} // CoinKey_API class

// CoinKey_API.GenerateHDWallet();
 
if (typeof exports === 'object') {
	exports.CoinKey_API = CoinKey_API
} // 'coinkey_api.js' exports