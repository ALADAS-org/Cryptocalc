// ====================================================================================
// ================================   entropy_size.js  ================================
// ====================================================================================
"use strict";

class EntropySize {
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
			default:	return 32;	break;
		} // entropy_size
	} // EntropySize.GetExpectedByteCount()
} // EntropySize class

if (typeof exports === 'object') {
	exports.EntropySize = EntropySize
} // exports of 'entropy_size.js'