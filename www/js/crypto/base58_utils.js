//==============================================================================================
//=====================================  base58_utils.js  ======================================
//==============================================================================================
// https://digitalbazaar.github.io/base58-spec/
"use strict";

const bs58         = require('bs58');
const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const hexToB58 = ( hex_str ) => {
	const  b58_str = bs58.encode( Buffer.from( hex_str, 'hex' ) );
	return b58_str;
}; // hexToB58()

const b58ToHex = ( b58_str ) => {
	//const address = '16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS'
	const bytes = bs58.decode( b58_str );
	// See uint8array-tools package for helpful hex encoding/decoding/compare tools
	return Buffer.from( bytes ).toString('hex');
	// => 003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187
}; // b58ToHex()

const isBase58String = ( in_str ) => {
	if ( in_str == undefined || in_str == null || in_str == "" ) {
		return false;
    }
	
	for ( let i=0; i < in_str.length; i++ ) { 
		if ( B58_ALPHABET.indexOf( in_str[i] ) == -1 ) {
			return false;
		}
	}
	return true;
}; // isBase58String()

if (typeof exports === 'object') {
	exports.B58_ALPHABET   = B58_ALPHABET
	exports.isBase58String = isBase58String
	exports.b58ToHex       = b58ToHex
	exports.hexToB58       = hexToB58	
} // exports of 'base58_utils.js'