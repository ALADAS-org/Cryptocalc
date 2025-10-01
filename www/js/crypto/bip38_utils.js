// ========================================================================================================
// ===========================================  bip38_utils.js  ===========================================
// ========================================================================================================
// References:
// Reference text:
//     https://github.com/bitcoin/bips/blob/master/bip-0038.mediawiki
//
// Bip38 implementation 
//     http://cryptocoinjs.com/modules/currency/bip38/
//
// * Bip 38 "Methid 1": "Non-EC" or "Non-Electrum-Compatible" Method
// This is Method 1 from the BIP38 specification, and it's commonly abbreviated as: 
// - "Non-EC" (Non-Electrum Compatible) "Basic" BIP38 encryption
// - "Standard" BIP38 (though this can be ambiguous)
// - "No compression" or "Compressed: false" method
//
// -Key Characteristics of Method 1 (Non-EC):
// - OK: No address prefix in the encrypted result
// - OK: Simpler implementation
// - OK: Widely supported across libraries
// - KO: Not compatible with Electrum wallet
// - KO: No compression flag support

// NB: How to Identify Method 1 (Non-EC) Output:
//     - Starts with 6P (not 6Pf or 6Pn)
//     - No EC prefix (6Pf or 6Pn) in the encrypted string
//     - 56 characters long (excluding the '6P' prefix)
// ====================================  Bip38Utils class  ====================================
"use strict"

const { dialog } = require('electron');	
		
const Bip38 = require('bip38');
const wif   = require('wif');

const { ERROR_RETURN_VALUE } = require('../const_keywords.js');

const { hexWithoutPrefix } = require('./hex_utils.js');	

class Bip38Utils {
	static #Key = Symbol();
	static #Singleton = new Bip38Utils( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if( Bip38Utils.#Singleton == undefined ) {
			this.#Singleton = new Bip38Utils( this.#Key );
			if ( this.#InstanceCount > 0 ) {
				throw new TypeError("'Bip38Utils' constructor called more than once");
			}
			this.#InstanceCount++;
        }
        return Bip38Utils.#Singleton;
    } // Bip38Utils 'This' getter

    // ** Private constructor **
	constructor( key ) {
		// console.log(">> new 'Bip38Utils'");
		if ( key !== Bip38Utils.#Key ) {
			throw new TypeError("'Bip38Utils' constructor is private");
		}
		
		// Bip38.version = { private: 0x80, public: 0x0 };
	
	    //                     N: impact on time needed to encrypt   		
		// Bip38.scryptParams = { N: 8192, r: 8, p: 8 };
	} // ** Private constructor **	
	
	encrypt( private_key, passphrase, window ) {
		// console.log(">> Bip38Utils.encrypt\n   private_key: " + private_key + "   passphrase: " + passphrase);
		if (    private_key == undefined || private_key == '' 
		     || passphrase  == undefined || passphrase  == '') {
			return "";
		}
		
		let encrypted_PK = ERROR_RETURN_VALUE;
		
		try {
			private_key = hexWithoutPrefix( private_key );
			let private_key_buf = Buffer.from( private_key, 'hex' );
			
			let WIF_str = wif.encode( { version: 0x80, privateKey: private_key_buf, compressed: false } ); // for the testnet use: wif.encode(239, ...
			// console.log("   WIF_str:             " + WIF_str);
			
			let decoded = wif.decode( WIF_str );
		
			encrypted_PK = Bip38.encrypt( decoded.privateKey, decoded.compressed, passphrase );
		}
		catch (e) {
			let options = {
				message: e.toString(), 
				type:    "error",
			}
			dialog.showMessageBoxSync( window, options );
			return ERROR_RETURN_VALUE;
		}
		
		return encrypted_PK;
	} // encrypt()
	
	decrypt( encrypted_pk, passphrase, window ) {
		console.log(">> Bip38Utils.decrypt" );
		
		if (    encrypted_pk == undefined || passphrase == undefined 
		     || encrypted_pk == ''        || passphrase == '') {
			return "";
		}
		
		let decrypted_PK = ERROR_RETURN_VALUE;
		
		try {
			let Wif_buf = Bip38.decrypt( encrypted_pk, passphrase );
			// console.log("   Wif_buf:       " + JSON.stringify( Wif_buf ) );
			
			decrypted_PK = Wif_buf.privateKey.toString('hex');
		}
		catch (e) {
			let options = {
				message: e.toString(), 
				type:    "error",
			}
			dialog.showMessageBoxSync( window, options );
			return ERROR_RETURN_VALUE;
		}
		
		return decrypted_PK;
	} // decrypt()
} // Bip38Utils class

function test_Bip38Utils() {
	console.log(">> ========== test_Bip38Utils ==========");
	let TEST_PRIVATE_KEY = '5f62891bb6f10fb522f5473e05b8bdf025cd7231fd34d9798c06dd8752fb9272';
	let TEST_PASSPHRASE  = "TestingOneTwoThree";
	
	console.log("   TEST_PRIVATE_KEY:   " + TEST_PRIVATE_KEY);
	
	let encrypted_PK = Bip38Utils.This.encrypt( TEST_PRIVATE_KEY, TEST_PASSPHRASE );
	console.log("   encrypted_PK(" + (encrypted_PK.length - "6P".length) + ") :  " + encrypted_PK);
	
	let decrypted_PK = Bip38Utils.This.decrypt( encrypted_PK, TEST_PASSPHRASE );
	console.log("   decrypted_PK:  " + decrypted_PK);
} // test_Bip38Utils()

// test_Bip38Utils();

if (typeof exports === 'object') {
	exports.Bip38Utils = Bip38Utils	
} // exports of 'bip38_utils.js'