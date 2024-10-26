// =====================================================================================
// =================================     wallet.js     =================================
// =====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

class Wallet {
	static GUI_NODE_IDs = { "lang": "lang_select_id",
                            "Wallet Mode": "wallet_mode_select_id",
	                        "blockchain": "wallet_blockchain_id", 
							"coin": "wallet_coin_id", "coin_type": "coin_type_id",
							"Entropy": "entropy_id", 
							"Entropy Size": "entropy_bits_select_id", "expected_entropy_digits": "",
							"word_count": "word_count_select_id",
							"mnemonics": "mnemonics_id",
							"checksum": "checksum_id",
							"Word indexes": "word_indexes_id",
		                    "address": "address_id", 
							"Private Key": "private_key_id",
							"WIF": "wif_id",
							"account": "account_id", 
							"address_index": "address_index_id"		
		                  };
	
	constructor( renderer_gui ) {
		this.renderer_gui = renderer_gui;
        this.options      = {};		
		this.attributes   = {};
	} // ** constructor **
	
	reset() {
		// trace2Main( pretty_func_header_format( "Wallet.reset" ) );
		
		this.attributes[CMD]       = CMD_NONE; 
		
		this.attributes[LANG] = ( this.options[LANG] != undefined ) ? this.options[LANG]:"EN";
		//trace2Main( pretty_format( "W.reset> lang", this.attributes[LANG] ) );
		//trace2Main( pretty_format( "W.reset> attributes[LANG]", this.attributes[LANG] ) );
		
		let wallet_mode = ( this.options[WALLET_MODE] != undefined ) ? this.options[WALLET_MODE]:SIMPLE_WALLET_TYPE;
		this.attributes[WALLET_MODE] = wallet_mode;
		
		if (    this.options[DEFAULT_BLOCKCHAIN] != undefined 
		     && this.options[DEFAULT_BLOCKCHAIN][wallet_mode] == undefined ) {
             this.attributes[BLOCKCHAIN] = this.options[DEFAULT_BLOCKCHAIN][wallet_mode];
        }			 
		else {
			 this.attributes[BLOCKCHAIN] = BITCOIN;
		}
	} // reset()

	setOptions( options ) {
		//trace2Main( pretty_func_header_format( "Wallet.setOptions" ) );
		this.options = options;
	} // setOptions()	

	getOptions( options ) {
		//trace2Main( pretty_func_header_format( "Wallet.setOptions" ) );
		return this.options = options;
	} // getOptions()

	hasAttribute( attr_name ) {
		//trace2Main( pretty_func_header_format( "Wallet.hasAttribute", attr_name ) );
		return this.attributes[attr_name] != undefined;
	} // hasAttribute()	
		
	getAttribute( attr_name ) {
		//trace2Main( pretty_func_header_format( "Wallet.getAttribute", attr_name ) );
		if ( this.attributes[attr_name] != undefined ) {
			return this.attributes[attr_name];
		}
	} // getAttribute()
	
	setAttribute( attr_name, value ) {
		trace2Main( pretty_func_header_format( "Wallet.setAttribute", attr_name + " = " + value) );
		this.attributes[attr_name] = value;
		if ( Wallet.GUI_NODE_IDs[attr_name] != undefined && Wallet.GUI_NODE_IDs[attr_name] != "" ) {
			if ( attr_name == "coin_type" ) { value = value.toString() + "'"; }
			HtmlUtils.SetNodeValue( Wallet.GUI_NODE_IDs[attr_name], value );
		}
	} // setAttribute()
} // Wallet class