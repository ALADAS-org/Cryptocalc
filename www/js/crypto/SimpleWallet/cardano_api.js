// ====================================================================================
// ================================== cardano_api.js ==================================
// ====================================================================================
"use strict";

const { v4: uuidv4 }         = require('uuid');
const { Seed, WalletServer } = require('cardano-wallet-js');
const { Bip32PrivateKey }    = require('@stricahq/bip32ed25519');

const Bip39Mnemonic          = require('bitcore-mnemonic');
const bip39                  = require('bip39');
const { mnemonicToEntropy }  = require('bip39');
const CardanoWasm            = require("@emurgo/cardano-serialization-lib-nodejs");

const cardano_crypto = require('cardano-crypto.js');

const { algo, enc }  = require('crypto-js');
const EC             = require('elliptic').ec;
const bs58check      = require('bs58check');

const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }     = require('../util/color/color_console_codes.js');

const { NULL_HEX, NULL_B64, NULL_BECH32, 
        NULL_NET, NULL_UUID, NULL_ADDRESS, NULL_SEEDPHRASE,
		
        UUID_HEX, CRYPTO_NET,
		
        XPRIV, PRIVATE_KEY_HEX, PRIVATE_KEY_B64,
		XPUB,  PUBLIC_KEY_HEX,  PUBLIC_KEY_B64, 
		
		ADDRESS, ADDRESS_HEX,
		SEEDPHRASE }          = require('./const_wallet.js'); 
		
const { NULL_COIN, BLOCKCHAIN, NULL_BLOCKCHAIN,
        CARDANO, MAINNET, TESTNET
	  }                       = require('./const_blockchains.js');

const { stringify }           = require('../util/values/string_utils.js');
const { hexToBytes, uint8ArrayToHex,        
        hexToUint8Array, hexWithoutPrefix,
        getRandomHexValue }   = require('./hex_utils.js');
const { Base64 }              = require("js-base64");
const { Seedphrase_API }      = require('./seedphrase_api.js');

const harden = (num) => {
	return 0x80000000 + num;
}; // harden()

// https://github.com/StricaHQ/bip32ed25519
class Cardano_API {
	static InitWallet() {
		let new_wallet = {};
		new_wallet[BLOCKCHAIN]        = NULL_BLOCKCHAIN;
		new_wallet[CRYPTO_NET]        = NULL_NET;
		new_wallet[UUID_HEX]          = NULL_UUID;		

		new_wallet[XPRIV]             = NULL_BECH32;
		new_wallet[PRIVATE_KEY_HEX]   = NULL_HEX;
		new_wallet[PRIVATE_KEY_B64]   = NULL_B64;
		
		new_wallet[XPUB]              = NULL_BECH32;
		new_wallet[PUBLIC_KEY_HEX]    = NULL_HEX;
		new_wallet[PUBLIC_KEY_B64]    = NULL_B64;
		
		new_wallet[ADDRESS]           = NULL_ADDRESS;
		new_wallet[SEEDPHRASE]        = NULL_SEEDPHRASE;
		return new_wallet;
	} // Cardano_API.InitWallet()
	
    static GetWallet(seed_SHA256_hex, salt_uuid, blockchain, crypto_net) {
		console.log(">> " + _CYAN_ + "Cardano_API.GetWallet " + _END_ + crypto_net);
		console.log("   seed_SHA256_hex: " + seed_SHA256_hex);
		
		let new_wallet = Cardano_API.InitWallet();			
		
		let seedphrase = Seedphrase_API.FromSHASeed(seed_SHA256_hex); // (mnemonic, password)
		console.log("seedphrase:\n   " + seedphrase);
		let entropy_hex = Seedphrase_API.ToPrivateKey(seedphrase);

		//const rootKey = await Bip32PrivateKey.fromEntropy(seed_phrase);
		//const rootKey = CardanoWasm.Bip32PrivateKey.generate_ed25519_bip32();

		// https://cardano.stackexchange.com/questions/8936/how-to-get-publickey-from-privatekey
		const account_rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
			Buffer.from(entropy_hex, 'hex'),
			Buffer.from(''),
		); // rootKey

		const account_rootKey_bech32 = account_rootKey.to_bech32();
		//console.log("extended private key:\n   " + account_rootKey_bech32);

		const account_rootKey_private_key_bytes = account_rootKey.to_raw_key().as_bytes();
		let   account_rootKey_hex = Buffer.from(account_rootKey_private_key_bytes).toString('hex');
		//console.log("account_rootKey_hex:\n" + account_rootKey_hex);

		// hardened derivation
		// NB: purpose: 44 vs 1852
		// https://www.reddit.com/r/cardano/comments/gt2nbw/fun_fact_1815_in_adas_bip32_path/
		// "Also fun fact: ITN uses '1852' instead of '44' for the purpose since it introduces reward"
		// "accounts which aren't part of the bip44 spec (this means all legacy addresses are in the '44'"
		// "path and all new addresses are in the '1852' path). It was picked for the year Lovelace died"
		const account_key = account_rootKey
			.derive(harden(1852)) // purpose
			.derive(harden(1815)) // BIP44 coin_type for ADA
			.derive(harden(0));   // account #0

		const stake_key = account_key
		  .derive(2)    // ChainDerivation.CHIMERIC
		  .derive(0)
		  .to_public();
		  
		const xpub_key = account_key
			.derive(0)
			.derive(0)
			.to_public();
		const xpub_key_bech32 = xpub_key.to_bech32();
		//console.log("extended public key:\n   " + xpub_key_bech32);
		
		let network_id = CardanoWasm.NetworkInfo.mainnet().network_id();
		if (crypto_net == TESTNET) {
			network_id = CardanoWasm.NetworkInfo.testnet().network_id();
		}	
		
		const cardano_wallet_address = CardanoWasm.BaseAddress.new(
		   network_id,
		   CardanoWasm.StakeCredential.from_keyhash(xpub_key.to_raw_key().hash()),
		   CardanoWasm.StakeCredential.from_keyhash(stake_key.to_raw_key().hash())
		);
			
		const ADA_address = cardano_wallet_address.to_address().to_bech32();
		console.log(">> ADA_address\n   " + ADA_address);
		
		new_wallet[BLOCKCHAIN]        = CARDANO;
		new_wallet[CRYPTO_NET]        = crypto_net;
		new_wallet[UUID_HEX]          = salt_uuid;
		
		//---------- Extended Private key (xpriv) ----------
		let ADA_private_key           = account_rootKey_bech32;
		
		const xpriv_key_bytes         = account_rootKey.to_raw_key().as_bytes();
		let   xpriv_key_hex           = Buffer.from(xpriv_key_bytes).toString('hex');
		new_wallet[PRIVATE_KEY_HEX]   = ADA_private_key; //xpriv_key_hex;
		
		// NB: "XPRIV (B64) is maybe legitimate value" but breaks Inkscape templace when generating wallet PNGs
		//let pk_uint8_values         = hexToUint8Array(hexWithoutPrefix(xpriv_key_hex));
		//let xpriv_key_b64           = Base64.fromUint8Array(pk_uint8_values);
		//new_wallet[PRIVATE_KEY_B64] = xpriv_key_b64;
		let pk_uint8_values           = hexToUint8Array(hexWithoutPrefix(seed_SHA256_hex));
		let private_key_b64           = Base64.fromUint8Array(pk_uint8_values);
		new_wallet[PRIVATE_KEY_B64]   = private_key_b64;		
		//console.log(  ">> " + _CYAN_ + "ADA " + _END_ + "Private Key:\n   " + ADA_private_key);	
		//---------- Extended Private key (xpriv)		
		
        //---------- Extended Public key (xpub) ----------
		let ADA_public_key            = xpub_key_bech32;
		
		const xpub_key_bytes          = xpub_key.to_raw_key().as_bytes();
		let   xpub_key_hex            = Buffer.from(xpub_key_bytes).toString('hex');
		new_wallet[PUBLIC_KEY_HEX]    = xpub_key_hex;
		
		pk_uint8_values               = hexToUint8Array(hexWithoutPrefix(xpub_key_hex));
		let xpub_key_b64              = Base64.fromUint8Array(pk_uint8_values);
		new_wallet[PUBLIC_KEY_B64]    = xpub_key_b64;
		//---------- Extended Public key (xpub)		
			
		//---------- wallet and seedphrase ----------
		new_wallet[SEEDPHRASE]        = seedphrase;
		new_wallet[ADDRESS]           = ADA_address;
		
		const address_hex             = cardano_wallet_address.to_address().to_hex();
		new_wallet[ADDRESS_HEX]       = address_hex;
		//---------- wallet and seedphrase
		
		//console.log(">> Cardano_API.GetWallet()\n" + stringify(new_wallet));
		
		return new_wallet;
	} // Cardano_API.GetWallet()
} // Cardano_API class

const generateExtendedKeys = (seed_SHA256_hex) => {
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
	exports.Cardano_API = Cardano_API
} // exports of 'cardano_api.js'