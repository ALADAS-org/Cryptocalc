// =======================================================================================
// ==================================  const_wallet.js  ==================================
// =======================================================================================
"use strict";

const NULL_HEX        = "Null-HEX";
const NULL_B64        = "Null-B64";
const NULL_BECH32     = "Null-Bech32";
const NULL_UUID       = "Null-UUID";
const NULL_NET        = "Null-NET";
const NULL_ADDRESS    = "Null-ADDRESS";
const NULL_SEEDPHRASE = "Null-SEEDPHRASE";

const HD_WALLET       = 'hd_wallet';
const UUID_HEX        = 'uuid_hex';
const CRYPTO_NET      = 'crypto_net';

const MASTER_KEY_HEX  = 'master_key_hex';
const XPRIV           = 'xpriv';
const XPUB            = 'xpub';

const PRIVATE_KEY_HEX = 'private_key_hex';
const PRIVATE_KEY_B64 = 'private_key_b64';

const PUBLIC_KEY_HEX  = 'public_key_hex';
const PUBLIC_KEY_B64  = 'public_key_b64';

const ADDRESS         = 'address';
const ADDRESS_HEX     = 'address_hex';
const SEEDPHRASE      = 'seedphrase';

const BALANCE_URL     = 'balance_URL';

if (typeof exports === 'object') {
	exports.NULL_HEX        = NULL_HEX
	exports.NULL_B64        = NULL_B64
	exports.NULL_BECH32     = NULL_BECH32
	
	exports.NULL_UUID       = NULL_UUID
	exports.NULL_NET        = NULL_NET
	exports.NULL_ADDRESS    = NULL_ADDRESS
	exports.NULL_SEEDPHRASE = NULL_SEEDPHRASE
	
	exports.CRYPTO_NET      = CRYPTO_NET
	
	exports.HD_WALLET       = HD_WALLET	
	exports.MASTER_KEY_HEX  = MASTER_KEY_HEX
	exports.XPRIV           = XPRIV
	exports.XPUB            = XPUB
	
	exports.PRIVATE_KEY_HEX = PRIVATE_KEY_HEX
	exports.PRIVATE_KEY_B64 = PRIVATE_KEY_B64
	
	exports.PUBLIC_KEY_HEX  = PUBLIC_KEY_HEX
	exports.PUBLIC_KEY_B64  = PUBLIC_KEY_B64
	
	exports.UUID_HEX        = UUID_HEX
	
	exports.ADDRESS         = ADDRESS
	exports.SEEDPHRASE      = SEEDPHRASE
	exports.BALANCE_URL     = BALANCE_URL 
} // 'const_wallet.js' exports