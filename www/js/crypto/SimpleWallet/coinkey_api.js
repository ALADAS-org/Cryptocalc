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
	  
const { pretty_func_header_log,
        pretty_log }   = require('../../util/log/log_utils.js');
	  
const { NULL_COIN, 
        MAINNET, TESTNET,
        BITCOIN, DOGECOIN, LITECOIN,
        COIN_ABBREVIATIONS		
	  }                    = require('../const_blockchains.js');
	  
const { NULL_HEX,
        ADDRESS, CRYPTO_NET, PRIVATE_KEY, 
		PUBLIC_KEY_HEX 
	  }                    = require('../const_wallet.js');

const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        UUID, MNEMONICS, WIF
	  }                    = require('../../const_keywords.js');	  
	  
const { stringify }        = require('../../util/values/string_utils.js');
const { hexWithoutPrefix,
        hexToUint8Array }  = require('../hex_utils.js'); 
		
const { computeWIF }       = require('../crypto_utils.js');
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
		pretty_func_header_log( "CoinKey_API.GetWallet ", COIN_ABBREVIATIONS[blockchain] + " " + crypto_net );
		
		let new_wallet = {};
		
		let null_wallet = {};
			null_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
			null_wallet[CRYPTO_NET]      = "Null-NET";
			null_wallet[UUID]            = "Null-UUID";
			null_wallet[PRIVATE_KEY] = NULL_HEX;
			null_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
			null_wallet[ADDRESS]         = "Null-ADDRESS";
			null_wallet[MNEMONICS]       = "Null-MNEMONICS";
	
		if ( private_key == undefined ) {
			pretty_log(">> CoinKey_API.GetWallet  **ERROR: UNDEFINED PK**: ", private_key);
			return null_wallet;
		}
		
		// Note: 'Simple Walllet' mode => 'private_key' must be 32 bytes / 64 hex digits
		if ( private_key.length != 64 ) {
			pretty_log( ">> CoinKey_API.GetWallet  **ERROR: INVALID PK SIZE**: ", 
			            private_key + "(" + private_key.length + ")" );
			return null_wallet;
		}
		
		let versions = {};	
		
		//console.log(">> getBlockchainWallet  blockchain: " + blockchain + " crypto_net:" + crypto_net);
		//console.log(">> getBlockchainWallet  private_key: " + private_key);
		
		// https://github.com/Swyftx/crypto-address-validator
		if ( blockchain == undefined ) {
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
		
		new_wallet[BLOCKCHAIN] = blockchain;		
		pretty_log( "coinK.getW> BLOCKCHAIN", blockchain );
		
		new_wallet[CRYPTO_NET] = crypto_net;
		new_wallet[UUID]       = salt_uuid;
		
		new_wallet[PRIVATE_KEY] = private_key;
		pretty_log( "coinK.getW> private_key(" + private_key.length + ")", private_key );
		
		var public_key = "";

		//========================= Bitcoin, LiteCoin, DogeCoin =========================
		// https://stackoverflow.com/questions/52165333/deprecationwarning-buffer-is-deprecated-due-to-security-and-usability-issues
		
		var coinkey_wallet = {};
		
		//---------- ADDRESS / WIF ----------	
		//if ( blockchain == BITCOIN ) {
        //pretty_log( "coinK.getW> BITCOIN" );
		//	var wif = computeWIF( private_key );
			
		//	pretty_log( "coinK.getW> wif 1", wif );
			
		//	var address = new bitcore.PrivateKey( wif ).toAddress();
		//	new_wallet[ADDRESS] = address;
		//	pretty_log( "coinK.getW> ADDRESS 1", new_wallet[ADDRESS]);
			
		//	new_wallet[WIF] = wif;
		//}
		//else {
			coinkey_wallet = new CoinKey( Buffer.from(private_key, 'hex'), versions);

            // pretty_log( "coinK.getW> coinkey_wallet", JSON.stringify(coinkey_wallet) );	
			
			coinkey_wallet.compressed = true;			
			
			// http://cryptocoinjs.com/modules/misc/bs58/
		    // public_key = bs58.encode(Buffer.from(coinkey_wallet.publicKey, 'hex'));
			
			new_wallet[WIF] = coinkey_wallet.privateWif;
			// pretty_log( "coinK.getW> WIF 2", new_wallet[WIF] );
			
			new_wallet[ADDRESS] = coinkey_wallet.publicAddress;
		//}

		//---------- public key ----------
		// new_wallet[PUBLIC_KEY_HEX] = hexWithoutPrefix( coinkey_wallet.publicKey.toString('hex') );
		//---------- public key
		
		//---------- BTC/LTC/DOGE wallet address ----------		
		// pretty_log( "coinK.getW> ADDRESS 2", new_wallet[ADDRESS]);
		//---------- BTC/LTC/DOGE wallet address

		return new_wallet;
	} // static GetWallet()	
} // CoinKey_API class

if (typeof exports === 'object') {
	exports.CoinKey_API = CoinKey_API
} // 'coinkey_api.js' exports