// =======================================================================================
// ==================================  const_wallet.js  ==================================
// =======================================================================================
"use strict";

const NULL_VALUE      = "Null-VALUE";
const NULL_HEX        = "Null-HEX";
const NULL_BECH32     = "Null-Bech32";
const NULL_WORD_COUNT = "Null-WORD_COUNT";
const NULL_UUID       = "Null-UUID";
const NULL_NET        = "Null-NET";
const NULL_ADDRESS    = "Null-ADDRESS";
const NULL_MNEMONICS  = "Null-MNEMONICS";

const ADDRESS         = 'address';

const MASTER_SEED     = 'master_seed';
const HD_WALLET       = 'hd_wallet';
const CHECKSUM        = 'checksum';
const CRYPTO_NET      = 'crypto_net';

const ENTROPY_HEX     = 'entropy_hex';

const ROOT_PK_HEX     = 'root_pk_hex';
const MASTER_PK_HEX   = 'master_pk_hex';
const CHAINCODE       = 'chaincode';

const BIP32_ROOT_KEY  = 'BIP32_root_key';
const ROOT_KEY        = 'root_key';
const PRIV_KEY        = 'PRIV KEY';
const XPRIV           = 'xpriv';
const XPUB            = 'xpub';
const ACCOUNT_XPRIV   = 'account_xpriv';
const ACCOUNT_XPUB    = 'account_xpub';

const PRIVATE_KEY     = 'Private Key';
const PUBLIC_KEY_HEX  = 'public_key_hex';

const BALANCE_URL     = 'balance_URL';

if (typeof exports === 'object') {
	exports.NULL_HEX        = NULL_HEX
	exports.NULL_WORD_COUNT = NULL_WORD_COUNT
	exports.NULL_BECH32     = NULL_BECH32	
	exports.NULL_UUID       = NULL_UUID
	exports.NULL_NET        = NULL_NET
	exports.NULL_ADDRESS    = NULL_ADDRESS
	exports.NULL_MNEMONICS  = NULL_MNEMONICS
	
	exports.CRYPTO_NET      = CRYPTO_NET
	
	exports.ENTROPY_HEX     = ENTROPY_HEX
	
	exports.MASTER_SEED     = MASTER_SEED
	exports.HD_WALLET       = HD_WALLET	
	exports.ROOT_PK_HEX     = ROOT_PK_HEX
	exports.MASTER_PK_HEX   = MASTER_PK_HEX
	exports.CHAINCODE       = CHAINCODE
	
	exports.BIP32_ROOT_KEY  = BIP32_ROOT_KEY
	exports.ROOT_KEY        = ROOT_KEY
	exports.PRIV_KEY        = PRIV_KEY
	exports.XPUB            = XPUB
	exports.ACCOUNT_XPRIV   = ACCOUNT_XPRIV
	exports.ACCOUNT_XPUB    = ACCOUNT_XPUB
	
	exports.CHECKSUM        = CHECKSUM
	
	exports.PRIVATE_KEY     = PRIVATE_KEY	
	exports.PUBLIC_KEY_HEX  = PUBLIC_KEY_HEX
	
	exports.ADDRESS         = ADDRESS
	
	exports.BALANCE_URL     = BALANCE_URL 
} // 'const_wallet.js' exports