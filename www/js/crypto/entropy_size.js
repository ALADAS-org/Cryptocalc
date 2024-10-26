// ====================================================================================
// ================================   entropy_size.js  ================================
// ====================================================================================
"use strict";

const { NULL_HEX, NULL_WORD_COUNT 
	  }                    = require('./const_wallet.js');
	  
const { isHexString, hexWithoutPrefix 
	  }                    = require('./hex_utils.js');

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
	
	static GetSHA256Substring( sha256_hex, word_count ) {
		let entropy_hex = hexWithoutPrefix( sha256_hex );
		switch ( word_count ) {
			case 12:	entropy_hex = sha256_hex.substring(0, 32); // [0..31]: first 32 chars of SHA256
						break;			
			case 15:	entropy_hex = sha256_hex.substring(0, 40); // [0..39]: first 40 chars of SHA256
						break;						
			case 18:	entropy_hex = sha256_hex.substring(0, 48); // [0..47]: first 48 chars of SHA256
						break;						
			case 21:	entropy_hex = sha256_hex.substring(0, 56); // [0..55]: first 56 chars of SHA256
						break;						
			case 24:	//.........................................// [0..63]: All chars of SHA256
						break;
		} // word_count
		
		return entropy_hex;
	} // EntropySize.GetSHA256Substring()
	
	static GetChecksumBitCount( word_count ) {
		if ( word_count == undefined ) {
			 word_count = 12;
		}
		let checksum_bit_count = 4; // default case is 12 words / 4 bits
		switch ( word_count ) {
			case 12:	checksum_bit_count = 4; break;						
			case 15:	checksum_bit_count = 5; break;						
			case 18:	checksum_bit_count = 6;	break;						
			case 21:	checksum_bit_count = 7;	break;						
			case 24:	checksum_bit_count = 8;	break;						
			default:	checksum_bit_count = 8;	break;
		}		
		return checksum_bit_count;
	} // EntropySize.GetChecksumBitCount()
	
	static GetExpectedWordCount( entropy_size ) {
		switch ( entropy_size ) { 
			case 128: 	return 12;	break;						
			case 160: 	return 15;	break;						
			case 192: 	return 18;	break;						
			case 224: 	return 21;	break;						
			case 256: 	return 24;	break;
			default:	return 24;	break;
		} // entropy_size
	} // EntropySize.GetExpectedWordCount()
	
	static GetExpectedByteCount( entropy_size ) {
		switch ( entropy_size ) { 
			case 128: 	return 16; break; // 32 hexadecimal digits
			case 160: 	return 20; break; // 40 hexadecimal digits	
			case 192: 	return 24; break; // 48 hexadecimal digits						
			case 224: 	return 28; break; // 56 hexadecimal digits					
			case 256: 	return 32; break; // 64 hexadecimal digits
			default:	return 32; break;
		} // entropy_size
	} // EntropySize.GetExpectedByteCount()
} // EntropySize class

if (typeof exports === 'object') {
	exports.EntropySize = EntropySize
} // exports of 'entropy_size.js'