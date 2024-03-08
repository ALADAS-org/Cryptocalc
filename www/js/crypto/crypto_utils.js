// ====================================================================================
// ================================   crypto_utils.js  ================================
// ====================================================================================
"use strict";

const sha256         = require('js-sha256');
const secp256k1      = require('secp256k1/elliptic');
const { hexToUint8Array, 
        hexWithoutPrefix 
	  }              = require('../crypto/hex_utils.js');

const getSecp256k1PK = (sha256_hex) => {
	let hash         = sha256.create();
	let private_key  = hexWithoutPrefix(sha256_hex);
	let hash_count   = 0;
	let pk_validated = false;
	
	// ---------- Test of 'out of EDCSA range' ----------
	//let out_of_range_value = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFCE6AF48A03BBFD25E8CD0364140';
	//let in_range_value =   '11cb6ce3be4fab6b9b428cab3493d381801a73396fd0dda6ee6019fdf28dbea4';
	//private_key = out_of_range_value;
	// ---------- Test of 'out of EDCSA range'
	
	let result = {};
	do {
		//console.log("  private_key= " + private_key);
        let Uint8_array = hexToUint8Array(private_key);	
        //console.log("  Uint8_array.length= " + Uint8_array.length);		
		pk_validated = secp256k1.privateKeyVerify(Uint8_array);	
		if (! pk_validated) {
			hash.update(private_key);
			private_key = hexWithoutPrefix(hash.hex());
		}
		hash_count++;
	} while (! pk_validated);

    result['private_key'] = private_key;
	result['hash_count']  = hash_count;
	return result;
}; // getSecp256k1PK()

if (typeof exports === 'object') {
	exports.getSecp256k1PK  = getSecp256k1PK
} // exports of 'crypto_utils.js'