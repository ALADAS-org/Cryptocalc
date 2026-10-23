// ====================================================================================
// ================================   entropy_size.js  ================================
// ====================================================================================
"use strict";

const { NULL_HEX, NULL_WORD_COUNT,
        BIP39_ENTROPY_BIT_SIZES,
        getBip39Size, getBip39WordCount
	  }                    = require('./const_wallet.js');
		  
const { isHexString, hexWithoutPrefix 
	  }                    = require('./hex_utils.js');

// Values returned for a word count / an entropy size which is not a BIP39 one (unchanged former defaults)
const DEFAULT_WORD_COUNT    = 24;
const DEFAULT_CHECKSUM_BITS = 8;
const DEFAULT_BYTE_COUNT    = 32;
const MAX_ENTROPY_BITS      = Math.max( ...BIP39_ENTROPY_BIT_SIZES ); // 256

class EntropySize {
	static GetBitCount( entropy_hex ) {
		if ( ! isHexString( entropy_hex ) ) return NULL_HEX;
		let bit_count = entropy_hex.length * 4; // 4 bits per hex digit
		return bit_count;
	} // EntropySize.GetBitCount()
	
	static GetWordCount( entropy_hex ) {
		let bit_count = EntropySize.GetBitCount( entropy_hex );
		if ( bit_count == NULL_HEX ) return NULL_WORD_COUNT;
		let word_count = EntropySize.GetExpectedWordCount( bit_count );
		return word_count;
	} // EntropySize.GetWordCount()
	
	// true if 'word_count' is a BIP39 word count whose entropy is shorter than 256 bits (12..21 words)
	static IsTruncatedSize( word_count ) {
		let bip39_size = getBip39Size( word_count );
		return ( bip39_size != undefined  &&  bip39_size.entropy_bits < MAX_ENTROPY_BITS );
	} // EntropySize.IsTruncatedSize()
	
	// 12..21 words: the first 'entropy bits' of 'hex_str' (taken AS IS, a '0x' prefix is NOT removed)
	// 24 words or unknown word count: 'hex_str' unchanged
	static TruncateToEntropySize( hex_str, word_count ) {
		if ( ! EntropySize.IsTruncatedSize( word_count ) ) return hex_str;
		return hex_str.substring( 0, getBip39Size( word_count ).entropy_bits / 4 ); // 4 bits per hex digit
	} // EntropySize.TruncateToEntropySize()
	
	// Returns the first 'entropy bits' of 'sha256_hex' for 'word_count' (BIP39 sizes: see 'BIP39_SIZES' in const_wallet.js)
	// NB: behavior kept as is on purpose (pure refactoring, no behavior change):
	//     - 12..21 words: substring of 'sha256_hex' AS IS (a '0x' prefix is NOT removed)
	//     - 24 words or unknown word count: 'sha256_hex' without its '0x' prefix
	static GetSHA256Substring( sha256_hex, word_count ) {
		if ( EntropySize.IsTruncatedSize( word_count ) ) {
			return EntropySize.TruncateToEntropySize( sha256_hex, word_count );
		}
		return hexWithoutPrefix( sha256_hex );
	} // EntropySize.GetSHA256Substring()
	
	static GetChecksumBitCount( word_count ) {
		if ( word_count == undefined ) {
			 word_count = 12;
		}
		let bip39_size = getBip39Size( word_count );
		return ( bip39_size != undefined ) ? bip39_size.checksum_bits : DEFAULT_CHECKSUM_BITS;
	} // EntropySize.GetChecksumBitCount()
	
	static GetExpectedWordCount( entropy_size ) {
		let word_count = getBip39WordCount( entropy_size );
		return ( word_count != undefined ) ? word_count : DEFAULT_WORD_COUNT;
	} // EntropySize.GetExpectedWordCount()
	
	static GetExpectedByteCount( entropy_size ) {
		let word_count = getBip39WordCount( entropy_size );
		return ( word_count != undefined ) ? entropy_size / 8 : DEFAULT_BYTE_COUNT;
	} // EntropySize.GetExpectedByteCount()
} // EntropySize class

if (typeof exports === 'object') {
	exports.EntropySize = EntropySize
} // exports of 'entropy_size.js'