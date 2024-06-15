// ====================================================================================
// =================================   trace_utils.js   =================================
// ====================================================================================
"use strict";

const getShortEntropySourceStr = ( entropy_src_str ) => {
		const MAX_SHORTENED_LENGTH = 90;
		let max_length = MAX_SHORTENED_LENGTH;
		if (entropy_src_str.length < MAX_SHORTENED_LENGTH) { 
			max_length = entropy_src_str.length;			
        }
		
		let shortened_entropy = entropy_src_str.substring(0, max_length).replace('\n', ' ');	
		if (entropy_src_str.length > max_length) { 
			shortened_entropy += "...";			
        }
		
		return shortened_entropy;
} // getShortEntropySourceStr

if (typeof exports === 'object') {
	exports.getShortEntropySourceStr = getShortEntropySourceStr	
} // exports of 'trace_utils.js'