// ============================================================================================================
// ===============================              crypto_services.js              ===============================
// ============================================================================================================
"use strict";

const { v4: uuidv4 } = require('uuid');
const wif            = require('wif');

const { hexWithoutPrefix } = require('./hex_utils.js');

class CryptoServices {	
	static #Key = Symbol();
	static #Singleton = new CryptoServices( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( CryptoServices.#Singleton == undefined ) {
			CryptoServices.#Singleton = new PassphraseDialog( this.#Key );
			if ( CryptoServices.#Singleton > 0 ) {
				throw new TypeError("'CryptoServices' constructor called more than once");
			}
			CryptoServices.#InstanceCount++;
        }
        return CryptoServices.#Singleton;
    } // CryptoServices 'This' getter
	
    // ** Private constructor **
	constructor( key ) {
		if ( key !== CryptoServices.#Key ) {
			throw new TypeError("'CryptoServices' constructor is private");
		}
	} // ** Private constructor **

	getUUID() {
		let new_uuidv4 = uuidv4();
		return new_uuidv4;
	} // getUUID()
	
	pk2WIF( private_key_arg ) {
		console.log("> CryptoServices.pk2WIF  private_key_arg: " + private_key_arg);
		private_key_arg = hexWithoutPrefix( private_key_arg );
		let private_key_buf = Buffer.from( private_key_arg, 'hex' );			
		let wif_value = wif.encode( { version: 0x80, privateKey: private_key_buf, compressed: false } ); // for the testnet use: wif.encode(239, ...
		return wif_value;
	} // pk2WIF()
} // CryptoServices class

if (typeof exports === 'object') {
	exports.CryptoServices = CryptoServices	
} // exports of 'crypto_services.js'