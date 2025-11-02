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
// * Bip 38 "Method 1": "Non-EC" or "Non-Electrum-Compatible" Method
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
//
// Difficulty: 
// The BIP38 standard suggests N = 16384, r = 8, and p = 8. However, this may yield unacceptable performance on a mobile phone. 
// If you alter these parameters, it wouldn't be wise to suggest to your users that your import/export encrypted keys are BIP38 
// compatible. If you do, you may want to alert them of your parameter changes.
// example:
// bip38.scryptParams = {N: 8192, r: 8, p: 8};
// ====================================  Bip38Utils class  ====================================
"use strict"

const { dialog } = require('electron');	
		
const Bip38 = require('bip38');
const wif   = require('wif');

const { ERROR_RETURN_VALUE } = require('../const_keywords.js');

const { hexWithoutPrefix } = require('./hex_utils.js');

const { FromMain_BIP38_PROGRESS_TICK } = require('../const_events.js');

const progress_cb = async ( status ) => {
	// console.log( ">> Bip38Utils.progress_cb" );
	// console.log( status.percent ); // will print the percent every time current increases by 1000
	
	// console.log( "   <progress_cb> this.main_window: " + this.main_window );
	
	let main_window = Bip38Utils.This.getMainWindow();
	
	await main_window.webContents.send
		 ( "fromMain", [ FromMain_BIP38_PROGRESS_TICK, status.percent ] );
}; // progress_cb()

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
		
		this.main_window = undefined;
		
		// Bip38.version = { private: 0x80, public: 0x0 };	
		
		// this.encryptDifficulty = 8192; // 16384 - 32768 - 65536 - 131072 - 262144 - 524288
		this.encryptDifficulty = 16384; // 16384; // 16384: recommended default difficulty
		
		//                     N: impact on time needed to encrypt (8192: correct default for smartphones)
		this.scryptParams  = { N: this.encryptDifficulty, r: 8, p: 8 };	
		Bip38.scryptParams = this.scryptParams;
	} // ** Private constructor **	
	
	async encrypt( private_key, passphrase, window ) {
		// console.log(">> Bip38Utils.encrypt\n   private_key: " + private_key + "   passphrase: " + passphrase);
		if (    private_key == undefined || private_key == '' 
		     || passphrase  == undefined || passphrase  == '') {
			return "";
		}
		
		this.main_window = window;
		
		// console.log("   <encrypt> this.main_window: " + this.main_window + "  " + typeof this.main_window );
		
		let encrypted_PK = ERROR_RETURN_VALUE;
		
		try {	
			private_key = hexWithoutPrefix( private_key );
			let private_key_buf = Buffer.from( private_key, 'hex' );
			
			let WIF_str = wif.encode( { version: 0x80, privateKey: private_key_buf, compressed: false } ); // for the testnet use: wif.encode(239, ...
			// console.log("   WIF_str:             " + WIF_str);
			
			let decoded = wif.decode( WIF_str );
		
			// encrypt(buffer, compressed, passphrase[, progressCallback, scryptParams])
			encrypted_PK = Bip38.encrypt( decoded.privateKey, decoded.compressed, passphrase, 
			                               async (status) => { await progress_cb(status); }, this.scryptParams );
		}
		catch (e) {
			let options = {
				message: "<encrypt> *ERROR*" + e.toString(), 
				type:    "error",
			}
			
			console.log("   window: " + window + "  " + typeof window );
			
			dialog.showMessageBoxSync( window, options );
			return ERROR_RETURN_VALUE;
		}
		
		return encrypted_PK;
	} // async encrypt()
	
	async decrypt( encrypted_pk, passphrase, main_window ) {
		console.log(">> Bip38Utils.decrypt" );
		
		this.main_window = main_window;
				
		// console.log("   <decrypt> this.main_window: " + this.main_window + "  " + typeof this.main_window );
		
		if (    encrypted_pk == undefined || passphrase == undefined 
		     || encrypted_pk == ''        || passphrase == '') {
			return "";
		}
		
		let decrypted_PK = ERROR_RETURN_VALUE;
		
		try {
			// decrypt(encryptedKey, passphrase[, progressCallback, scryptParams])
			let Wif_buf = Bip38.decrypt( encrypted_pk, passphrase, 
						                 async (status) => { await progress_cb(status); }, this.scryptParams );
			// console.log("   Wif_buf:       " + JSON.stringify( Wif_buf ) );
			
			decrypted_PK = Wif_buf.privateKey.toString('hex');
		}
		catch (e) {
			let options = {
				message: e.toString(), 
				type:    "error",
			}
			
			console.log("   main_window: " + main_window + "  " + typeof main_window );	

			dialog.showMessageBoxSync( this.main_window, options );
			return ERROR_RETURN_VALUE;
		}
		
		return decrypted_PK;
	} // async decrypt()
	
	getMainWindow() {
		return this.main_window;
	} // getMainWindow()
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

if ( typeof exports === 'object' ) {
	exports.Bip38Utils = Bip38Utils	
} // exports of 'bip38_utils.js'