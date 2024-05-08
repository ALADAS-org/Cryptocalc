// =====================================================================================
// ===================================  hash_api.js  ===================================
// =====================================================================================
"use strict";

// https://mdrza.medium.com/how-to-convert-mnemonic-12-word-to-private-key-address-wallet-bitcoin-and-ethereum-81aa9ca91a57

const perf        = require('execution-time')();
const scryptPbkdf = require('scrypt-pbkdf');
const CryptoJS    = require('crypto-js');

const { hexToUint8Array,
        hexWithoutPrefix 
	  }           = require('./hex_utils.js');

// https://cryptojs.gitbook.io/docs#pbkdf2
const Hash_API = class {
	//                       12 words 32 bytes   128/256
	static async With_PBKDF2(entropy, salt_hex, bit_count) {
		let key_size = 128 / 32;
		switch (bit_count) {
			case 128: 
			    key_size = 128 / 32;
				break;
			case 256: 
			    key_size = 256 / 32;
				break;
			case 512: 
			    key_size = 512 / 32;
				break;
		}
		console.log("key_size:    " + key_size);
		
		//let hash = CryptoJS.PBKDF2(seed_phrase_txt, salt_hex, 
		//                           { keySize: key_size });
								   
		//let salt = await scryptPbkdf.salt();   // returns an ArrayBuffer filled with 16 random bytes
		//let salt = Hash_API.GenerateSalt(32);
		salt_hex = hexWithoutPrefix(salt_hex);
		console.log("salt_hex:    " + salt_hex);
		console.log("salt bytes:  " + salt_hex.length/2);
	    const derived_key_length = 32;   // in bytes
		let salt_array_buffer = hexToUint8Array(salt_hex);
		const scryptParams = {
			N: 2048,
			r: 8,
			p: 2
		};
		console.log("salt_array_buffer:        " + JSON.stringify(salt_array_buffer));
	    let hash = await scryptPbkdf.scrypt(entropy, salt_array_buffer, derived_key_length, scryptParams);   // key is an ArrayBuffer
		return hash;
	} // Hash_API.With_PBKDF2()
	
	static With_MD5(seed_txt) {
		let hash = CryptoJS.MD5(seed_txt);
		return hash;
	} // Hash_API.With_MD5()
	
	static With_SHA1(seed_txt) {
		let hash = CryptoJS.SHA1(seed_txt);
		return hash;
	} // Hash_API.With_SHA1()
	
	static GenerateSalt(byte_count) {
        if (! (byte_count == 16 || byte_count == 32) ) {
			byte_count = 16;
		}		
		let salt = CryptoJS.lib.WordArray.random(byte_count);
		return salt;
	} // PBKDF2_API.GenerateSalt()	
	
	//var key128Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, {
	//  keySize: 128 / 32
	//});
	//var key256Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, {
	//  keySize: 256 / 32
	//});
	//var key512Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, {
	//  keySize: 512 / 32
	//});
	//var key512Bits1000Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, {
	//  keySize: 512 / 32,
	//  iterations: 1000
	//});
}; // Hash_API class

const test_GenerateSalt = () => {
	console.log(">> ---------- test_GenerateSalt ----------");
	let salt = Hash_API.GenerateSalt(32);
	console.log("salt bytes:  " + salt.toString().length/2);
	console.log("salt:        " + salt);
	console.log(">> ----------\n");
} // test_GenerateSalt()

const test_With_MD5 = () => {
	console.log(">> ---------- test_With_MD5 ----------");
	let hash = Hash_API.With_MD5();
	console.log("hash bytes:  " + hash.toString().length/2);
	console.log("hash:        " + hash);
	console.log(">> ----------\n");
} // test_With_MD5()

const test_With_SHA1 = () => {
	console.log(">> ---------- test_With_SHA1 ----------");
	let hash = Hash_API.With_SHA1();
	console.log("hash bytes:  " + hash.toString().length/2);
	console.log("hash:        " + hash);
	console.log(">> ----------\n");
} // test_With_SHA1()

const test_With_PBKDF2 = async () => {
	console.log(">> ---------- test_With_PBKDF2 ----------");
	
	let entropy = "hello world";
	console.log(">> ---------- with scrypt-pbkdf\n");
	perf.start();
	
	let salt = Hash_API.GenerateSalt(32);
	let salt_hex = salt.toString();
	let hash = await Hash_API.With_PBKDF2(entropy, salt_hex, 128);
	console.log("hash bytes:  " + hash.toString().length/2);
	console.log("hash:        " + hash.toString());
	console.log("hash:        " + JSON.stringify(hash));
	
	let results = perf.stop();
    console.log(results.time/1000 + " sec");  // in milliseconds
	console.log(">> ----------\n");
} // test_With_PBKDF2()

//test_GenerateSalt(32);
test_With_PBKDF2();
//test_With_MD5();
//test_With_SHA1();

if (typeof exports === 'object') {
	exports.Hash_API = Hash_API
} // exports of 'hex_utils.js'