// =====================================================================================
// ================================   coinkey_api.js   =================================
// =====================================================================================
// Generates public wallet blockchain address
// Supported coins: Bitcoin, LiteCoin, DogeCoin

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

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, _END_ 
	  }                    = require('../../util/color/color_console_codes.js');
	  
const { NULL_COIN, 
        MAINNET, TESTNET,
        BITCOIN, DOGECOIN, LITECOIN,
        COIN_ABBREVIATIONS		
	  }                    = require('../const_blockchains.js');
	  
const { NULL_HEX,
        ADDRESS, CRYPTO_NET, PRIVATE_KEY_HEX, 
		PUBLIC_KEY_HEX 
	  }                    = require('../const_wallet.js');

const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        UUID, MNEMONICS, WIF
	  }                    = require('../../const_keywords.js');	  
	  
const { stringify }        = require('../../util/values/string_utils.js');
const { hexWithoutPrefix } = require('../hex_utils.js'); 
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
    static GetWallet( private_key, salt_uuid, blockchain, crypto_net ) {
		console.log(  ">> " + _CYAN_ + "CoinKey_API.GetWallet " + _END_ 
		            + " " + COIN_ABBREVIATIONS[blockchain] + " " + crypto_net);
		
		let new_wallet = {};
			
		if ( private_key == undefined ) {
			console.log(">> CoinKey_API.GetWallet  **ERROR** private_key: " + private_key);
			new_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
			new_wallet[CRYPTO_NET]      = "Null-NET";
			new_wallet[UUID]            = "Null-UUID";
			new_wallet[PRIVATE_KEY_HEX] = NULL_HEX;
			new_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
			new_wallet[ADDRESS]         = "Null-ADDRESS";
			new_wallet[MNEMONICS]       = "Null-MNEMONICS";
			return new_wallet;
		}
		
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
		
		if (    blockchain != BITCOIN  
		    &&  blockchain != LITECOIN  &&  blockchain != DOGECOIN) {
			blockchain = BITCOIN;
		}
		
		if  (       crypto_net == undefined 
				|| (crypto_net != MAINNET && crypto_net != TESTNET)
			) {
			crypto_net = MAINNET;
		}
		
		//----- Validité des adresses générées testées avec:
		// https://github.com/Swyftx/crypto-address-validator -----
		switch ( blockchain ) {
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
		let coinkey_wallet = new CoinKey( Buffer.from(private_key, 'hex'), versions);
		
        coinkey_wallet.compressed = true;
		
		// http://cryptocoinjs.com/modules/misc/bs58/
		public_key = bs58.encode(Buffer.from(coinkey_wallet.publicKey, 'hex'));
		
		//console.log("Public Key Base58\n" + b58_encoded); // => 16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS
	
		//var b58_decoded = bs58.decode(public_key_b58_encoded);
		//var b58_decoded_to_hex = new Buffer(b58_decoded).toString('hex');
		//console.log("Public Key Base58 to Hex\n" + b58_decoded_to_hex); // => 003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187
		
		//console.log("getBlockchainWallet wallet.privateKey:\n" + wallet.privateKey);
		
		new_wallet[BLOCKCHAIN] = blockchain;
		new_wallet[CRYPTO_NET] = crypto_net;
		
		//---------- UUID salt ----------
		new_wallet[UUID] = salt_uuid;
		//---------- UUID salt ----------
		
		//---------- WIF ----------
		new_wallet[WIF] = coinkey_wallet.privateWif;
		//---------- WIF
		
		//---------- private key ----------
		new_wallet[PRIVATE_KEY_HEX] = hexWithoutPrefix( coinkey_wallet.privateKey.toString('hex') );
		//---------- private key
		
		//---------- public key ----------
		//console.log("getBlockchainWallet wallet.publicKey:\n" + wallet.publicKey);
		new_wallet[PUBLIC_KEY_HEX] = hexWithoutPrefix( coinkey_wallet.publicKey.toString('hex') );
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
		
		return new_wallet;
	} // static GetWallet()	
} // CoinKey_API class

if (typeof exports === 'object') {
	exports.CoinKey_API = CoinKey_API
} // 'coinkey_api.js' exports