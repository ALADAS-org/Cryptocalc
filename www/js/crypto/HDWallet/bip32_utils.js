// =====================================================================================
// =================================  bip32_utils.js  ==================================
// =====================================================================================
// References:
// ** https://iancoleman.io/bip39/
// ** https://learnmeabitcoin.com/technical/keys/hd-wallets/mnemonic-seed/
// ** https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786
// https://mdrza.medium.com/how-to-convert-mnemonic-12-word-to-private-key-address-wallet-bitcoin-and-ethereum-81aa9ca91a57
// https://bitcointalk.org/index.php?topic=5288888.0
// BIP32: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
// https://support.ledger.com/hc/fr-fr/articles/4415198323089-Comment-un-appareil-Ledger-g%C3%A9n%C3%A8re-une-phrase-de-r%C3%A9cup%C3%A9ration-de-24-mots&language-suggestion?docs=true
const sha256         = require('js-sha256');
const { sha512 }     = require('js-sha512');
const { Base64 }     = require('js-base64');
const bs58           = require('bs58');
const Bip39Mnemonic  = require('bitcore-mnemonic');
const { HDPrivateKey, PrivateKey } = require('bitcore-lib');
const bip39          = require('bip39');
const HdAddGen       = require('hdaddressgenerator');

// https://www.npmjs.com/package/hdkey
const HDKey          = require('hdkey');

const bchaddr        = require('bchaddrjs');

// **KO 'ES module..'** const hdAddress = require('hd-address');  
// **KO 'ES module..'** const HDWallet = require('hd-address-cli');

const { v4: uuidv4 } = require('uuid');

// https://bitcoin.stackexchange.com/questions/113286/uncaught-typeerror-bip32-fromseed-is-not-a-function
//const bip32         = require('bip32'); => ERROR: "bip32.fromSeed in not a function"
const ecc              = require('tiny-secp256k1')
const { BIP32Factory 
      }                = require('bip32');
// You must wrap a tiny-secp256k1 compatible implementation
const bip32            = BIP32Factory(ecc);

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, 
        _GREEN_, _RED_HIGH_, _BLUE_HIGH_,       
		_END_ }            = require('../../util/color/color_console_codes.js');
		
const { pretty_func_header_log, 
        pretty_log,  }     = require('../../util/log/log_utils.js');
		
const { MAINNET, TESTNET,
		
		COIN, NULL_COIN, COIN_ABBREVIATIONS, 
		COIN_TYPE, COIN_TYPES,				
		
	    BITCOIN,  ETHEREUM, 
		//BINANCE,
		CARDANO,  RIPPLE, ZCASH, 
		DOGECOIN, TRON, BITCOIN_CASH,
		LITECOIN, AVALANCHE, EOS, DASH, FIRO				
      }                    = require('../const_blockchains.js');
	  
const { NULL_HEX,
        ADDRESS, UUID, CRYPTO_NET, MASTER_SEED,
		MASTER_PK_HEX, CHAINCODE, ROOT_PK_HEX, 
		BIP32_ROOT_KEY,		
		PRIVATE_KEY, PUBLIC_KEY_HEX,
		PRIV_KEY, XPUB,
		ACCOUNT_XPRIV, ACCOUNT_XPUB		
	  }                    = require('../const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN, 
        WORD_COUNT, MNEMONICS,
        PASSWORD, ACCOUNT, ADDRESS_INDEX,
		DERIVATION_PATH, WIF
	  }                    = require('../../const_keywords.js');
		
const { hexToBinary, binaryToHex, 
        hexWithPrefix, hexWithoutPrefix, isHexString,
        uint8ArrayToHex, hexToUint8Array 
	  }                    = require('../hex_utils.js');
	  
const { isString }                    = require('../../util/values/string_utils.js');	  
	  
const { b58ToHex,
        isBase58String 
	  }                    = require('../base58_utils.js');

const { Bip39Utils  }      = require('../bip39_utils.js');


/*
- Génération d'un hash SHA256 (24 mots) ou SHA-1 (128 bits, 12 mots)
- KO: Les 8 premiers bits du hash SHA256 sont ajoutés à la fin des 256 bits initiaux, ce qui donne 264 bits.
- OK: * cas 1: 24 mots / 264 bits / 8 bits de checksum:
               SHA256 du hash initial en string binaire           => "8 1st bits" ajoutés à la fin du hash initial => 264 bits
      * cas 2: 12 mots / 132 bits / 4 bits de checksum:
               SHA-1 (128 bits) du hash initial en string binaire => "4 1st bits" ajoutés à la fin du hash initial => 132 bits
- Les 264/132 bits sont divisés en 24/12 groupes de 11 bits.
- Chaque groupe de 11 bits est interprété comme un nombre compris entre 0 et 2047 (2^11), 
  qui sert d’index à la liste de mots BIP39, ce qui donne les 24/12 mots.
*/
// https://getcoinplate.com/bip39-seed-phrase-mnemonics-generator-offline-online-tool/

// ref.1: https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
// ref.2: https://www.blockplate.com/blogs/blockplate/how-a-seed-phrase-is-created

// ============================================================================================
// ====================================  Bip32Utils class  ====================================
// ============================================================================================
// static Methods: 
// * async MnemonicsToHDWalletInfo( mnemonics, options ) 

class Bip32Utils {
	// Check with: 
	// * https://bitcointalk.org/index.php?topic=5288888.0
	// * https://ethereum.stackexchange.com/questions/40821/difference-between-account-extended-private-key-and-bip32-extended-private-key
	// https://github.com/bitcoinjs/bip38/issues/63
	static async MnemonicsToHDWalletInfo( mnemonics, args ) {
		args = Bip39Utils.GetArgs( args );
		let blockchain    = args[BLOCKCHAIN];		
		let coin          = COIN_ABBREVIATIONS[blockchain];
		
		pretty_func_header_log( "Bip32Utils.MnemonicsToHDWalletInfo", coin );
		
		let coin_type = COIN_TYPES[blockchain];	
        if ( isString( coin_type ) )  coin_type = parseInt( coin_type );		
		pretty_log( "b32.mnk2wi> coin_type", coin_type );
		
		let password = "";
		if ( args[PASSWORD] != undefined && args[PASSWORD] != null && args[PASSWORD] != "" ) { 
			password = args[PASSWORD];
		}
		pretty_log( "b32.mnk2wi> password", password );
		
		let account = 0;
		if ( args[ACCOUNT] != undefined ) { 
			account = args[ACCOUNT];
			if ( isString( account ) )  account = parseInt( account );
		}
		// pretty_log( "b32.mnk2wi> account", account );
		
		let address_index = 0;
		if ( args[ADDRESS_INDEX] != undefined ) { 
			address_index = args[ADDRESS_INDEX];
			if ( isString( address_index ) )  address_index = parseInt( address_index );
			address_index += "'"; // NB: switch to systematic Hardened adresses
		}
		// pretty_log( "b32.mnk2wi> address_index", address_index );
		
		//console.log(   "   account_index: " + account_index + "   " 
		//             + "   address_index: " + address_index );
		//console.log("   address_index typeof: " + typeof address_index );
		
		let hdwallet_info = {};
		
		hdwallet_info[BLOCKCHAIN]   = blockchain;
		hdwallet_info[COIN]         = coin;
		hdwallet_info[COIN_TYPE]    = coin_type;		
		
		//console.log("   coin_type:                  " + coin_type);		
		//console.log("   " + _YELLOW_ + "blockchain:             " + _END_ + blockchain);
		
		if ( mnemonics == undefined ) {
			mnemonics = "much bottom such hurt hunt welcome cushion erosion pulse admit name deer";
		}

        hdwallet_info[MNEMONICS] = mnemonics;		
		
		//-------------------- Derivation Path --------------------	
        // https://getcoinplate.com/blog/derivation-paths-guide/#:~:text=A%20derivation%20path%20is%20simply,a%20particular%20branch%20(address).		
        // Start at the master key                                  (m)
        // Follow the BIP44 standard                                (44′)
        // Derive the key for Bitcoin                               (0′)
        // Access the first account                                 (0′)
        // Choose the external chain, used for public addresses     (0)
        // And finally, generate the first address in this sequence (0') NB: switch to systematic Hardened adresses
		//                                NB: ref. value is /0'/0/address_index
		
		// https://arshbot.medium.com/hd-wallets-explained-from-high-level-to-nuts-and-bolts-9a41545f5b0
		//let master_derivation_path = "m/44'/" + coin_type + "'" + "/0'/0/" + address_index;
		
		// NB: Now switch to systematic Hardened adresses
		let path_options = { [ACCOUNT]: account, [ADDRESS_INDEX]: address_index };
		
		let master_derivation_path = Bip32Utils.GetDerivationPath( coin_type, path_options );
		pretty_log( "b32.mnk2wi> master_derivation_path", master_derivation_path );
		hdwallet_info[DERIVATION_PATH] = master_derivation_path;
		//-------------------- Derivation Path --------------------
		
		//-------------------- Master Seed --------------------
		// https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786
		//                            ====Master Private Key====    =========Chaincode=========
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits)
		const master_seed = bip39.mnemonicToSeedSync( mnemonics, password );	
		
		let master_seed_hex   = uint8ArrayToHex( master_seed );
	    let master_seed_bytes = master_seed_hex.length / 2;
	    //console.log(    "   " + _YELLOW_
		//              + Bip39Utils.LabelWithSize("master seed", master_seed_bytes) 
	    //              + "        " + _END_ + master_seed_hex);	
		hdwallet_info[MASTER_SEED] = master_seed_hex;
        //-------------------- Master Seed		
		
		//********
		//********-------------------- Test HDKey --------------------
		// https://www.npmjs.com/package/hdkey
		const hdkey = HDKey.fromMasterSeed( Buffer.from( master_seed_hex, 'hex' ) );

		const childkey = hdkey.derive( master_derivation_path );		
 
        //-------------------- Master Private Key --------------------
		//                            ====Master Private Key====
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits) 
		let master_pk_key_hex = uint8ArrayToHex( master_seed ).substring( 0, 64 ); // LeftSide: 256 first bits  
	    let master_pk_bytes   = master_pk_key_hex.length / 2;
	    //console.log(  "   " + _YELLOW_
		//            + Bip39Utils.LabelWithSize("master_private_key", master_pk_bytes) 
	    //            + " " + _END_ + master_pk_key_hex);
		hdwallet_info[MASTER_PK_HEX] = master_pk_key_hex;
		
		let master_pk_to_mnemonics = Bip39Utils.EntropyToMnemonics( master_pk_key_hex );
		//console.log(   "   " + _YELLOW_ 
		//             + "master_pk_to_mnemonics:  " + _END_ + master_pk_to_mnemonics);
		//-------------------- Master Private Key
		
		//------------------------ Chaincode ------------------------
		//                                                          =========Chaincode=========
		// seed (64 bytes/512 bits) = LeftSide(32 bytes/256 bits) + RightSide(32 bytes/256 bits) 				
		let chaincode = uint8ArrayToHex( master_seed ).substring( 64 );
	    let chaincode_bytes = chaincode.length / 2;
	    //console.log(    "   " + _YELLOW_
		//              + Bip39Utils.LabelWithSize("chaincode", chaincode_bytes) 
	    //              + "          " + _END_ + chaincode);
		hdwallet_info[CHAINCODE] = chaincode;
        //------------------------ Chaincode
		
		//----------------------- Master Node -----------------------
		const master_node = bip32.fromSeed( master_seed );
		//----------------------- Master Node
					  
		//-------------------- BIP32 root key -------------------	
		let BIP32_root_key = master_node.toBase58();
		//console.log(  "   " + _YELLOW_
		//            + "BIP32 root key:         " + _END_ + BIP32_root_key);
		hdwallet_info[BIP32_ROOT_KEY] = BIP32_root_key;
		//-------------------- BIP32 root key
		
		//-------------------- First Private Key --------------------
		let child_key   = master_node.derivePath( master_derivation_path );
		let private_key = uint8ArrayToHex( child_key["__D"] );
		pretty_log( "b32.mnk2wi> private key", private_key );
		hdwallet_info[PRIVATE_KEY] = private_key;
		hdwallet_info[PRIV_KEY]    = private_key;
		//-------------------- First Private Key

		
		//*** BIP44 *********************************************************
		//************************ First Private Key ************************
		//*******************************************************************
		// https://www.npmjs.com/package/hdaddressgenerator
		//let bip44 = HdAddGen.withMnemonic( mnemonics, false, coin );
		let passphrase = false;
		if ( password != "" ) {
			passphrase = password;
		    hdwallet_info[PASSWORD] = password;
		}	
		let bip44 = HdAddGen.withMnemonic
					( mnemonics,  passphrase, coin,    false,   44,  account );
        //                        passphrase          hardened  bip  account        
		//*** BIP44 *********************************************************

		// Generates 'expected_address_count' addresse from index 'address_index'
		let expected_address_count = 1;
		let addresses = await bip44.generate( expected_address_count, address_index );
		
		hdwallet_info[ADDRESS] = addresses[0].address;
		
		if ( blockchain == BITCOIN_CASH ) {
			hdwallet_info[ADDRESS] = bchaddr.toCashAddress( hdwallet_info[ADDRESS] );
		}
		
		let child_private_key = hexWithoutPrefix( addresses[0]["privKey"] );
					 
		//if ( blockchain == BITCOIN_CASH ) {
		//	hdwallet_info[PRIV_KEY] = child_private_key;
		//}
		if ( ! isHexString( child_private_key ) ) { 
			if ( isBase58String( child_private_key ) ) {
				hdwallet_info[PRIV_KEY] = child_private_key;
				child_private_key = b58ToHex( child_private_key );
			}				
		}
		
        pretty_log( "b32.mnk2wi> child_private_key", child_private_key );		
		
		let child_pk_to_mnemonics = Bip39Utils.EntropyToMnemonics( child_private_key );
		
		//-ok-------------------- Extended Private key -----------------------
		let account_derivation_path = "m/44'/" + coin_type + "'/" + account + "'";
		pretty_log( "b32.mnk2wi> account_derivation_path", account_derivation_path );	
		let ACCOUNT_XPRIV = master_node.derivePath( account_derivation_path ).toBase58();
		//console.log(   "   " + _YELLOW_ 
		//             + "Account PRIV_KEY:          " + _END_ + ACCOUNT_XPRIV);
		hdwallet_info[ACCOUNT_XPRIV] = ACCOUNT_XPRIV;
		//----------------------- Extended Private key
		
		//----------------------- Extended Public key ------------------------
		// https://github.com/elastos/Elastos.SDK.Keypair.Javascript/blob/master/src/Api.js	
		const getMasterPublicKey = ( seed, coinType, account ) => {
			const prvKey = HDPrivateKey.fromSeed( seed );
			const parent = new HDPrivateKey( prvKey.xprivkey );
			
			const multiWallet = parent
				.deriveChild( 44, true )
				.deriveChild( coinType, true )
				.deriveChild( account,  true );

			return multiWallet.xpubkey;
		}; // getMasterPublicKey()
		
		//console.log(  "   " + _YELLOW_
		//            + "account_index type: " + _END_ + typeof account_index);
		
		pretty_log( "b32.mnk2wi> coin_type", coin_type );
		// pretty_log( "b32.mnk2wi> account", account );
		let account_xpub = getMasterPublicKey( master_seed, coin_type, account );
		//console.log(  "   " + _YELLOW_
		//            + "Account XPUB:           " + _END_ + account_xpub);
		hdwallet_info[ACCOUNT_XPUB] = account_xpub;
		//----------------------- Extended Public key
					 
		//--------------------------- WIF ---------------------------
		let wif = bs58.encode( Buffer.from( child_private_key, 'hex' ) );
		pretty_log( "b32.mnk2wi>> WIF", wif );
		hdwallet_info[WIF] = wif;
		//--------------------------- WIF	

		return hdwallet_info;
	} // Bip32Utils.MnemonicsToHDWalletInfo()
	
	// https://www.ledger.com/blog/understanding-crypto-addresses-and-derivation-paths
	static GetDerivationPath( coin_type, path_options ) {
		let account       = "0"; 
		let address_index = "0";
		
		if ( path_options != undefined ) {
			account       = ( path_options[ACCOUNT] != undefined ) ?       path_options[ACCOUNT].toString() :       "0";								
			address_index =	( path_options[ADDRESS_INDEX] != undefined ) ? path_options[ADDRESS_INDEX].toString() : "0";
		} 
		
		let derivation_path =   "m/44'/" 
		                      + coin_type + "'/" 
							  + account + "'/0/"
							  + address_index;
		return derivation_path;
	} // Bip32Utils.GetDerivationPath()
} // Bip32Utils class

const test_Bip32Utils = async () => {
}; // test_EntropyToMnemonics

// test_Bip32Utils();

if (typeof exports === 'object') {
	exports.Bip32Utils = Bip32Utils	
} // exports of 'bip32_utils.js'