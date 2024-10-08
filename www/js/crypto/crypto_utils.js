// ====================================================================================
// ================================   crypto_utils.js  ================================
// ====================================================================================
"use strict";

const bs58           = require('bs58');
const sha256         = require('js-sha256');
const secp256k1      = require('secp256k1/elliptic');

const { pretty_log } = require('../util/log/log_utils.js');
const { hexToUint8Array, 
        hexWithoutPrefix 
	  }              = require('./hex_utils.js');

const getSecp256k1PK = ( sha256_hex ) => {
	let hash         = sha256.create();
	let private_key  = hexWithoutPrefix( sha256_hex );
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

const computeWIF = ( entropy_hex ) => {
	// https://en.bitcoin.it/wiki/Wallet_import_format
	// https://learnmeabitcoin.com/technical/keys/private-key/wif/
	// ex: 0C28FCA386C7A227600B2FE50B7CAE11EC86D3BF1FBE471BE89827E19D72AA1D

    // https://stackoverflow.com/questions/31712808/how-to-force-javascript-to-deep-copy-a-string	
    let entropy_hex_copy = (' ' + entropy_hex).slice(1);
	
	let wif_step1 = entropy_hex_copy; // seed_32_bytes_hex; // entropy_hex 
	//pretty_log("wif_step1", wif_step1);
	
	let wif_step2 = "80" + wif_step1 + "01"; // + "01" at end for compressed key;
	//pretty_log("wif_step2", wif_step2);
	
	let wif_step3 = sha256( hexToUint8Array( wif_step2 ) ); // Note: don't hash directly hex string
	//pretty_log("wif_step3", wif_step3);
	
	let wif_step4 = sha256( hexToUint8Array( wif_step3 ) ); // Note: don't hash directly hex string
	//pretty_log("wif_step4", wif_step4);
	
	let wif_step5 = wif_step4.substring(0,8); // checksum
	//pretty_log("wif_step5 (checksum)", wif_step5);
	
	let wif_step6 = wif_step2 + wif_step5;
	//pretty_log("wif_step6", wif_step6);
	
	let wif_step7 = bs58.encode( hexToUint8Array( wif_step6 ) ); // bs58.encode( hexToUint8Array( wif_step6 ) );
	//pretty_log("wif_step7", wif_step7);
	
	return wif_step7;
}; // computeWIF()

if (typeof exports === 'object') {
	exports.getSecp256k1PK  = getSecp256k1PK
	exports.computeWIF  = computeWIF
} // exports of 'crypto_utils.js'