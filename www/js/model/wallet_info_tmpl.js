// ==============================================================================================================
// ========================================     wallet_info_tmpl.js     =========================================
// ==============================================================================================================
"use strict";

const { 
	NULL_KEY, NULL_KEYPAIR_VALUE,
	WALLET_MODE, BLOCKCHAIN, 
	MNEMONICS, SHORTENED_MNEMONICS,
	ENTROPY, ENTROPY_SIZE, WORD_INDEXES,
	BIP32_PASSPHRASE, BIP38_PASSPHRASE,
	DERIVATION_PATH, WIF,
	LANG
} = require('../const_keywords.js');

const { 
	ADDRESS, PRIVATE_KEY, BIP38_ENCRYPTED_PK
} = require('../crypto/const_wallet.js');
	  
const { 
	COIN, BLOCKCHAIN_EXPLORER
} = require('../crypto/const_blockchains.js');
	
/*	
v Wallet Mode             HD Wallet
v Blockchain              Bitcoin
v Coin                    BTC
v Entropy                 649cab0cde2bfeb2213b0f1f823e2e7fa97574d954ec3392a1511db8b0f00d0f
v Entropy Size            256 bits
v address                 1BPJR2AGW6yAg9VjFSaGZi7cig3NYh6EhN
v Blockchain Explorer     https://www.blockchain.com/explorer/addresses/btc/1BPJR2AGW6yAg9VjFSaGZi7cig3NYh6EhN
v WIF                     L1DSc5qZym2hL1wTxTVRYXb6BidoNykm6bjyYtJhzheC3H5MbgyY
v Private Key             77361ed2e3cdd863547b88845b96e916c21f2be50f43a88d73774472e1a7f8ed  
v Secret phrase           goose torch segment rough say flip lumber giggle buzz ball merit young nuclear risk grab outside crime never february derive mention job crouch vessel
v Shortened Secret phrase GoosTorcSegmRougSayFlipLumbGiggBuzzBallMeriYounNuclRiskGrabOutsCrimNeveFebrDeriMentJobCrouVess
v Word indexes            804, 1834, 1561, 1506, 1535, 712, 1063, 783, 252, 143, 1116, 2042, 1210, 1491, 810, 1260, 412, 1192, 674, 475, 1112, 960, 417, 1944
v Passphrase              ratatouille  
v Derivation Path         m/44'/0'/0'/0/0'  
v Lang                    EN
*/

const WALLET_INFO_TEMPLATE = [
	{ [WALLET_MODE]:         "" },	
	{ [BLOCKCHAIN]:          "" },
	{ [COIN]:                "" },
	
	{ [ENTROPY]:             "" },
	{ [ENTROPY_SIZE]:        "" },
	
	{ [ADDRESS]:             "" },
	{ [BLOCKCHAIN_EXPLORER]: "" },
	
	{ [PRIVATE_KEY]:         "" },
	{ [WIF]:                 "" },
	
	{ [BIP38_ENCRYPTED_PK]:  "" },
	{ [BIP38_PASSPHRASE]:    "" },
	
	{ [MNEMONICS]:           "" },
	{ [SHORTENED_MNEMONICS]: "" },
	{ [WORD_INDEXES]:        "" },
	
	{ [BIP32_PASSPHRASE]:    "" },
	{ [DERIVATION_PATH]:     "" },	

    { [LANG]:                "" }
]; // WALLET_INFO_TEMPLATE

class WalletInfoTemplate {
	static #Key = {};
	static #Singleton = new WalletInfoTemplate( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if( WalletInfoTemplate.#Singleton == undefined ) {
			WalletInfoTemplate.#Singleton = new WalletInfoTemplate();
			if (WalletInfoTemplate.#InstanceCount > 0) {
				throw new TypeError("'WalletInfoTemplate' constructor called more than once");
			}
			WalletInfoTemplate.#InstanceCount++;
        }
        return WalletInfoTemplate.#Singleton;
    } // WalletInfoTemplate 'This' getter 

    // ** Private constructor **
	constructor( key ) {
		if ( key !== WalletInfoTemplate.#Key ) {
			throw new TypeError("'WalletInfoTemplate' constructor is private");
		}	
        this.app_version = "XX";

		this.items = []; 
		this.clear();		
	} // ** Private constructor **
	
	clear() {
		this.items = [];
		for ( let i=0; i < WALLET_INFO_TEMPLATE.length; i++ ) {
			let current_line = WALLET_INFO_TEMPLATE[i];
			this.items.push( current_line );
		}
	} // clear()
	
	removeEmptyItems() {
		if ( this.items == undefined || this.items.length == 0) return;
		
		let non_empty_items = [];
		for ( let i=0; i < this.items.length; i++ ) {
			let current_item  = this.getItem(i);
			let current_value = this.getItemValue(i);
			if ( current_value != "" && current_value != '' ) {
				non_empty_items.push( current_item );
			}
		}
		this.items = non_empty_items;
	} // removeEmptyItems()
	
	getItems() {
		return this.items; 
	} // getItems()
	
	getItem( index ) {
		if ( this.items.length > 0  &&  index >= 0  &&  index < this.items.length ) {
			return this.items[index];
		}
		return {};
	} // getItem()
	
	setItemValue( index, item_value) {
		let item = this.getItem(index);
		let key  = this.getItemKey( index );
		if ( key != NULL_KEY ) {
			item[key] = item_value;
		}
	} // setItemValue()	
	
	getItem( index ) {
		if ( this.items.length > 0  &&  index >= 0  &&  index < this.items.length ) {
			return this.items[index];
		}
		return {};
	} // getItemValue()
	
	getItemKey( index ) {
		let key = NULL_KEY;
		let item = this.getItem(index);
		let keys = Object.keys( item );
		if ( keys.length > 0 ) {
			key = keys[0];
		}
		return key;
	}; // getItemKey()
	
	getItemValue( index ) {
		let value = NULL_KEYPAIR_VALUE;
		let item = this.getItem(index);
		let key = this.getItemKey( index )
		if ( key != NULL_KEY ) {
			value = item[key];
		}
		return value;
	}; // getItemValue()
	
	getIndexInTemplate( attribute_name ) {
		// console.log(">> WalletInfoTemplate.getIndexInTemplate( '" + attribute_name + "' )");
		
		for ( let i=0; i < WALLET_INFO_TEMPLATE.length; i++ ) {
			let current_line = WALLET_INFO_TEMPLATE[i];
			// console.log("   tmpl_lines[" + i + "]: " + JSON.stringify(current_line));
			let current_keys = Object.keys( current_line );
			if ( current_keys.length > 0 ) {				
				let current_key = current_keys[0];
				// console.log("   current_key[" + i + "]: " + current_key);
				if ( current_key == attribute_name ) {
					return i;
				}
			}
		}
		return -1;	
	} // getIndexInTemplate()	
} // WalletInfoTemplate class

if (typeof exports === 'object') {
	exports.WalletInfoTemplate = WalletInfoTemplate
} // exports of 'wallet_info_tmpl.js'