// =============================================================================================
// ==================================    cardano_hd_api.js    ==================================
// =============================================================================================
"use strict";

const { v4: uuidv4 }         = require('uuid');
const { Seed, WalletServer } = require('cardano-wallet-js');
const { Bip32PrivateKey }    = require('@stricahq/bip32ed25519');

const Bip39Mnemonic          = require('bitcore-mnemonic');
const bip39                  = require('bip39');
const { mnemonicToEntropy }  = require('bip39');
const { Base64 }             = require('js-base64');

const CardanoWasm            = require("@emurgo/cardano-serialization-lib-nodejs");

const cardano_crypto         = require('cardano-crypto.js');

const { algo, enc }          = require('crypto-js');
const EC                     = require('elliptic').ec;
const bs58check              = require('bs58check');

const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }     = require('../../util/color/color_console_codes.js');
		
const { getFunctionCallerName,
        pretty_func_header_log,
        pretty_log }       = require('../../util/log/log_utils.js');

const { NULL_HEX, NULL_BECH32, 
        NULL_NET, NULL_UUID, NULL_ADDRESS, NULL_SEEDPHRASE,		
        CRYPTO_NET,		
        XPRIV, PRIVATE_KEY_HEX,
		XPUB,  PUBLIC_KEY_HEX,	
		ADDRESS, ADDRESS_HEX,
		SEEDPHRASE }          = require('../const_wallet.js');

const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        MNEMONICS, WORD_COUNT,
		WALLET_MODE, HD_WALLET_TYPE,
		DERIVATION_PATH, UUID 
	  }                       = require('../../const_keywords.js'); 		
		
const { COIN, NULL_COIN,
        CARDANO, ADA_PURPOSE,		
		MAINNET, TESTNET,
		COIN_ABBREVIATIONS, COIN_TYPES
	  }                       = require('../const_blockchains.js');

const { stringify }           = require('../../util/values/string_utils.js');
const { hexToBytes, uint8ArrayToHex,        
        hexToUint8Array, hexWithoutPrefix,
        getRandomHexValue }   = require('../hex_utils.js');
		
const { Bip39Utils }          = require('../bip39_utils.js');
const { EntropySize }         = require('../entropy_size.js');

const harden = (num) => {
	return 0x80000000 + num;
}; // harden()

// https://github.com/StricaHQ/bip32ed25519
class CardanoHD_API {
    static GetWallet( entropy_hex, salt_uuid, blockchain, crypto_net, account, address_index ) {
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		
		blockchain = CARDANO;
		let coin   = COIN_ABBREVIATIONS[blockchain];
		
		pretty_func_header_log( getFunctionCallerName(), blockchain + " " + coin + " " + crypto_net );
		pretty_log( "entropy_hex", entropy_hex );
		
		if ( account == undefined ) 		account       = 0;	
		if ( address_index == undefined ) 	address_index = 0;
		
		let new_wallet = CardanoHD_API.InitializeWallet();		
		
	    let word_count = EntropySize.GetWordCount( entropy_hex );
		let args = { [WORD_COUNT]: word_count }; 
		let mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex, args );	
		let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
		pretty_log( "mnemonics", mnemonics_items[0] );
		if ( mnemonics_items[1].length > 0 ) {	
			pretty_log( "mnemonics", mnemonics_items[1] );		
		}

		//const rootKey = await Bip32PrivateKey.fromEntropy(seed_phrase);
		//const rootKey = CardanoWasm.Bip32PrivateKey.generate_ed25519_bip32();

		// https://cardano.stackexchange.com/questions/8936/how-to-get-publickey-from-privatekey
		const account_rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
			Buffer.from( entropy_hex, 'hex' ),
			Buffer.from( '' ),
		); // rootKey

		const account_rootKey_bech32 = account_rootKey.to_bech32();
		//console.log("extended private key:\n   " + account_rootKey_bech32);

		const account_rootKey_private_key_bytes = account_rootKey.to_raw_key().as_bytes();
		let   account_rootKey_hex = Buffer.from( account_rootKey_private_key_bytes ).toString('hex');
		//console.log("account_rootKey_hex:\n" + account_rootKey_hex);

		// -------- hardened derivation --------
		// NB: purpose: '44' vs '1852' ('ADA_PURPOSE')
		// https://www.reddit.com/r/cardano/comments/gt2nbw/fun_fact_1815_in_adas_bip32_path/
		// "Also fun fact: ITN uses '1852' instead of '44' for the purpose since it introduces reward"
		// "accounts which aren't part of the bip44 spec (this means all legacy addresses are in the '44'"
		// "path and all new addresses are in the '1852' path). It was picked for the year Lovelace died"
	
		let coin_type = COIN_TYPES[CARDANO];
		
		const account_key = account_rootKey
			.derive( harden( ADA_PURPOSE ) ) // purpose
			.derive( harden( coin_type ) )   // BIP44 coin_type for ADA
			.derive( harden( account ) );    // account #0
		
        // https://github.com/Emurgo/cardano-serialization-lib/blob/master/doc/getting-started/generating-keys.md	
        // NB: "stake" or "spending" key ?		
		const stake_key = account_key
		  .derive( 2 )               // ChainDerivation.CHIMERIC
		  .derive( address_index )
		  .to_public();
		
		let change_chain = "0";	     // External chain	
		const utxo_pub_key = account_key
			.derive( change_chain )             
			.derive( address_index )
			.to_public();
		const utxo_pub_key_bech32 = utxo_pub_key.to_bech32();
		//console.log("extended public key:\n   " + xpub_key_bech32);
		
		let network_id = CardanoWasm.NetworkInfo.mainnet().network_id();
		if ( crypto_net == TESTNET ) {
			network_id = CardanoWasm.NetworkInfo.testnet().network_id();
		}	
		
		const cardano_wallet_address = CardanoWasm.BaseAddress.new(
		   network_id,
		   CardanoWasm.StakeCredential.from_keyhash( utxo_pub_key.to_raw_key().hash() ),
		   CardanoWasm.StakeCredential.from_keyhash( stake_key.to_raw_key().hash() )
		);
			
		const wallet_address = cardano_wallet_address.to_address().to_bech32();
		pretty_log( "address", wallet_address );
		
		new_wallet[BLOCKCHAIN]      = CARDANO;
		new_wallet[COIN]            = coin;
		new_wallet[WALLET_MODE]     = HD_WALLET_TYPE;
		new_wallet[CRYPTO_NET]      = crypto_net;
		new_wallet[UUID]            = salt_uuid;
		new_wallet[ADDRESS]         = wallet_address;
		new_wallet[MNEMONICS]       = mnemonics;
		
		let purpose = ADA_PURPOSE;
		
		pretty_log( "purpose",      purpose );
		pretty_log( "coin",         coin );
		pretty_log( "coin_type",    coin_type );	
		pretty_log( "change_chain", change_chain );		

		new_wallet[DERIVATION_PATH] =  "m/" + purpose + "'/" + coin_type 
		                             + "'/" + account + "'/" + change_chain + "/" + address_index;
		pretty_log( DERIVATION_PATH, new_wallet[DERIVATION_PATH] );
		
		//---------- Extended Private key (xpriv) ----------
		let xpriv_key                 = account_rootKey_bech32;		
		const xpriv_key_bytes         = account_rootKey.to_raw_key().as_bytes();
		let   xpriv_key_hex           = Buffer.from( xpriv_key_bytes ).toString('hex');
		new_wallet[PRIVATE_KEY_HEX]   = xpriv_key;
		pretty_log( "xpriv_key", xpriv_key );
		//---------- Extended Private key (xpriv)		
		
        //---------- Extended Public key (xpub) ----------
		let ADA_public_key            = utxo_pub_key_bech32;
		
		const xpub_key_bytes          = utxo_pub_key.to_raw_key().as_bytes();
		let   xpub_key_hex            = Buffer.from( xpub_key_bytes ).toString('hex');
		new_wallet[PUBLIC_KEY_HEX]    = xpub_key_hex;
		//---------- Extended Public key (xpub)		
		
		//console.log(">> Cardano_API.GetWallet()\n" + stringify(new_wallet));
		
		return new_wallet;
	} // CardanoHD_API.GetWallet()
	
	static InitializeWallet() {
		let null_wallet = {}; 
		null_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
		null_wallet[CRYPTO_NET]      = "Null-NET";
		null_wallet[UUID]            = "Null-UUID";
		null_wallet[PRIVATE_KEY_HEX] = NULL_HEX;
		null_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
		null_wallet[ADDRESS]         = "Null-ADDRESS";
		null_wallet[MNEMONICS]       = "Null-MNEMONICS";
		return null_wallet;
	} // CardanoHD_API.InitializeWallet()
} // CardanoHD_API class

const generateExtendedKeys = ( seed_SHA256_hex ) => {
	console.log(">> generateExtendedKeys");
	
	if (seed_SHA256_hex == undefined) {
		seed_SHA256_hex = "dce7a3bfbf3215194d2e3b2c00515677f3cc1ca83a5faf583e1facd14979a9b1";
	}
	
	const ec = new EC('secp256k1');

	const TEST_VECTOR_1_SEED        = "000102030405060708090a0b0c0d0e0f";
	const MASTER_KEY_DERIVATION_KEY = seed_SHA256_hex;
	
	const mainnetVersionPriv   = "0488ADE4";
	const mainnetVersionPub    = "0488B21E";
	
	const childDepth        = "00";       // master node
	const parentFingerPrint = "00000000"; // Calculated from http://bip32.org/ - First 32 bits of the public key identifier i.e. HASH160(publicKey)
	const childNb           = "00000000";

	const key    = Buffer.from(MASTER_KEY_DERIVATION_KEY).toString("hex");
	const hasher = algo.HMAC.create(algo.SHA512, enc.Hex.parse(key));
	hasher.update(enc.Hex.parse(TEST_VECTOR_1_SEED));
	const res = hasher.finalize().toString();


	const left_256Bits  = res.substring(0, 64);
	const right_256Bits = res.substring(64, 128);
	const keypair       = ec.keyFromPrivate(Buffer.from(left_256Bits, "hex"));
	const master_pub    = keypair.getPublic("hex");
	const compressedMasterPub = `${(Buffer.from(master_pub, "hex")[64] % 2 === 0) ? "02" : "03"}${master_pub.substring(2, 66)}`;

	const xPrivKey = `${mainnetVersionPriv}${childDepth}${parentFingerPrint}${childNb}${right_256Bits}00${left_256Bits}`;
	const xPubKey  = `${mainnetVersionPub}${childDepth}${parentFingerPrint}${childNb}${right_256Bits}${compressedMasterPub}`;
	
	const xpriv = bs58check.encode(Buffer.from(xPrivKey, "hex"));
	const xpub  = bs58check.encode(Buffer.from(xPubKey,  "hex"));
	
	//console.log(`Extended Private Key: ${xpriv}`);
	//console.log("Extended Private Key:\n" + xpriv);
	//console.log(`Extended Public Key: ${xpub}`);
	
	const extended_keys = {};
	extended_keys['xpriv'] = xpriv;
	extended_keys['xpub']  = xpub;
	
	return extended_keys;
}; // generateExtendedKeys

const test_cardano_api = () => {
	let seed_SHA256_hex = getRandomHexValue(32);
	let salt_uuid       = uuidv4();
	Cardano_API.GetWallet(seed_SHA256_hex, salt_uuid, CARDANO, MAINNET)
}; // test_cardano_api

//test_cardano_api();

if (typeof exports === 'object') {
	exports.CardanoHD_API = CardanoHD_API
} // exports of 'cardano_hd_api.js'