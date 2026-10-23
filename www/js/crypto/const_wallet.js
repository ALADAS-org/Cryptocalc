// =======================================================================================
// ==================================  const_wallet.js  ==================================
// =======================================================================================
"use strict";

const NULL_VALUE         = "Null-VALUE";
const NULL_HEX           = "Null-HEX";
const NULL_BECH32        = "Null-Bech32";
const NULL_WORD_COUNT    = "Null-WORD_COUNT";
const NULL_UUID          = "Null-UUID";
const NULL_NET           = "Null-NET";
const NULL_ADDRESS       = "Null-ADDRESS";
const NULL_MNEMONICS     = "Null-MNEMONICS";

const ADDRESS            = 'Wallet Address';

const MASTER_SEED        = 'master_seed';
const HD_WALLET          = 'hd_wallet';
const CHECKSUM           = 'checksum';
const CRYPTO_NET         = 'crypto_net';

const ENTROPY_HEX        = 'entropy_hex';

const ROOT_PK_HEX        = 'root_pk_hex';
const MASTER_PK_HEX      = 'master_pk_hex';
const CHAINCODE          = 'chaincode';

const BIP32_ROOT_KEY     = 'BIP32_root_key';
const ROOT_KEY           = 'root_key';
const PRIV_KEY           = 'PRIV KEY';
const XPRIV              = 'xpriv';
const XPUB               = 'xpub';
const ACCOUNT_XPRIV      = 'account_xpriv';
const ACCOUNT_XPUB       = 'account_xpub';

const PRIVATE_KEY        = 'Private Key';

const BIP38_ENCRYPTED_PK = 'Bip38 Encrypted PK';

const PUBLIC_KEY_HEX     = 'public_key_hex';

const BALANCE_URL        = 'balance_URL';

// ================================  BIP39 sizes  ================================
// SINGLE SOURCE for the BIP39 sizes (Main process AND Renderer: this file is
// loaded with 'require' and with a <script> tag in index.html).
//   word count = (entropy bits + checksum bits) / 11
//   checksum bits = entropy bits / 32
const BIP39_SIZES = Object.freeze( {
	12: Object.freeze( { entropy_bits: 128, checksum_bits: 4 } ),
	15: Object.freeze( { entropy_bits: 160, checksum_bits: 5 } ),
	18: Object.freeze( { entropy_bits: 192, checksum_bits: 6 } ),
	21: Object.freeze( { entropy_bits: 224, checksum_bits: 7 } ),
	24: Object.freeze( { entropy_bits: 256, checksum_bits: 8 } )
} ); // BIP39_SIZES

const BIP39_WORD_COUNTS       = Object.freeze( [ 12, 15, 18, 21, 24 ] );
const BIP39_ENTROPY_BIT_SIZES = Object.freeze( BIP39_WORD_COUNTS.map( (word_count) => BIP39_SIZES[word_count].entropy_bits ) );

// Returns { entropy_bits, checksum_bits } for a BIP39 word count, else 'undefined'
// NB: the word count must be a NUMBER (strict match, like the former 'switch' statements: "12" is not 12)
const getBip39Size = ( word_count ) => {
	if ( typeof word_count !== 'number' || ! BIP39_WORD_COUNTS.includes( word_count ) ) return undefined;
	return BIP39_SIZES[word_count];
}; // getBip39Size()

// Returns the BIP39 word count of an entropy size in bits, else 'undefined' (strict match: "128" is not 128)
const getBip39WordCount = ( entropy_bits ) => {
	return BIP39_WORD_COUNTS.find( (word_count) => BIP39_SIZES[word_count].entropy_bits === entropy_bits );
}; // getBip39WordCount()
// ================================  BIP39 sizes

if (typeof exports === 'object') {
	exports.NULL_HEX           = NULL_HEX
	exports.NULL_WORD_COUNT    = NULL_WORD_COUNT
	exports.NULL_BECH32        = NULL_BECH32	
	exports.NULL_UUID          = NULL_UUID
	exports.NULL_NET           = NULL_NET
	exports.NULL_ADDRESS       = NULL_ADDRESS
	exports.NULL_MNEMONICS     = NULL_MNEMONICS
	
	exports.CRYPTO_NET         = CRYPTO_NET
	
	exports.ENTROPY_HEX        = ENTROPY_HEX
	
	exports.MASTER_SEED        = MASTER_SEED
	exports.HD_WALLET          = HD_WALLET	
	exports.ROOT_PK_HEX        = ROOT_PK_HEX
	exports.MASTER_PK_HEX      = MASTER_PK_HEX
	exports.CHAINCODE          = CHAINCODE
	
	exports.BIP32_ROOT_KEY     = BIP32_ROOT_KEY	
	exports.ROOT_KEY           = ROOT_KEY
	
	exports.XPUB               = XPUB
	exports.ACCOUNT_XPRIV      = ACCOUNT_XPRIV
	exports.ACCOUNT_XPUB       = ACCOUNT_XPUB
	
	exports.ADDRESS            = ADDRESS
	
	exports.CHECKSUM           = CHECKSUM
	
	exports.PRIVATE_KEY        = PRIVATE_KEY
	exports.BIP38_ENCRYPTED_PK = BIP38_ENCRYPTED_PK
	
	exports.PRIV_KEY           = PRIV_KEY
	
	exports.PUBLIC_KEY_HEX     = PUBLIC_KEY_HEX
	
	exports.BALANCE_URL        = BALANCE_URL

	exports.BIP39_SIZES             = BIP39_SIZES
	exports.BIP39_WORD_COUNTS       = BIP39_WORD_COUNTS
	exports.BIP39_ENTROPY_BIT_SIZES = BIP39_ENTROPY_BIT_SIZES
	exports.getBip39Size            = getBip39Size
	exports.getBip39WordCount       = getBip39WordCount
} // 'const_wallet.js' exports