// ==============================================================================================================
// ===========================================     wallet_info.js     ===========================================
// ==============================================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

console.log(">> ======================== LANG: '" + LANG + "'");

class WalletInfo {
	static GUI_NODE_IDs = { 
							[LANG]: 					"lang_select_id",     
 							[WALLET_MODE]: 				"wallet_mode_select_id",               
							[BLOCKCHAIN]: 				"wallet_blockchain_id", 
							[COIN]: 					"wallet_coin_id", 
							[COIN_TYPE]: 				"coin_type_id",					
							[ENTROPY]: 					"entropy_id",							
							[ENTROPY_SIZE]: 			"entropy_bits_select_id", 
							[EXPECTED_ENTROPY_DIGITS]: 	"",							
							[WORD_COUNT]: 				"word_count_select_id",			
							[MNEMONICS]: 				"mnemonics_id",
							[CHECKSUM]: 				"checksum_id",					
							[BIP32_PASSPHRASE]:			"password_id",						
							[BIP38_PASSPHRASE]: 		"bip38_passphrase_id",							
							[WORD_INDEXES]: 			"word_indexes_id",
 							[ADDRESS]: 					"address_id", 							
							[PRIVATE_KEY]: 				"private_key_id",							
							[WIF]: 						"wif_id",							
							[ACCOUNT]: 					"account_id", 							
							[ADDRESS_INDEX]: 			"address_index_id"							
		                  };
	
	constructor( renderer_gui ) {
		this.renderer_gui = renderer_gui;
        this.options      = {};		
		this.attributes   = {};
	} // ** constructor **
	
	reset() {
		// trace2Main( pretty_func_header_format( "WalletInfo.reset" ) );
		
		this.attributes[CMD]  = CMD_NONE; 
		
		this.attributes[LANG] = ( this.options[LANG] != undefined ) ? this.options[LANG]:"EN";
		trace2Main( pretty_format( "W.reset> Lang", this.attributes[LANG] ) );
		
		//trace2Main( pretty_format( "W.reset> attributes[LANG]", this.attributes[LANG] ) );
		
		let wallet_mode = ( this.options[WALLET_MODE] != undefined ) ? this.options[WALLET_MODE]:SIMPLE_WALLET_TYPE;
		this.attributes[WALLET_MODE] = wallet_mode;
		
		this.attributes[BIP32_PASSPHRASE] = ""; 
		
		if (    this.options[DEFAULT_BLOCKCHAIN] != undefined 
		     && this.options[DEFAULT_BLOCKCHAIN][wallet_mode] == undefined ) {
             this.attributes[BLOCKCHAIN] = this.options[DEFAULT_BLOCKCHAIN][wallet_mode];
        }			 
		else {
			 this.attributes[BLOCKCHAIN] = BITCOIN;
		}
	} // reset()

	setOptions( options ) {
		//trace2Main( pretty_func_header_format( "WalletInfo.setOptions" ) );
		this.options = options;
	} // setOptions()	

	getOptions( options ) {
		//trace2Main( pretty_func_header_format( "WalletInfo.setOptions" ) );
		return this.options = options;
	} // getOptions()

	hasAttribute( attr_name ) {
		//trace2Main( pretty_func_header_format( "WalletInfo.hasAttribute", attr_name ) );
		return this.attributes[attr_name] != undefined;
	} // hasAttribute()	
		
	getAttribute( attr_name ) {
		//trace2Main( pretty_func_header_format( "WalletInfo.getAttribute", attr_name ) );
		if ( this.attributes[attr_name] != undefined ) {
			return this.attributes[attr_name];
		}
	} // getAttribute()
	
	setAttribute( attr_name, value ) {
		// trace2Main( pretty_func_header_format( "WalletInfo.setAttribute", attr_name + " = " + value) );
		this.attributes[attr_name] = value;
		
		if ( WalletInfo.GUI_NODE_IDs[attr_name] != undefined && WalletInfo.GUI_NODE_IDs[attr_name] != "" ) {
			if ( attr_name == "coin_type" ) { 
				value = value.toString() + "'"; 
			}
			else if (attr_name == MNEMONICS && this.attributes[LANG] == "JP") {
				// value = value.replaceAll(' ','*');				
				value = value.replaceAll(' ','\u3000');
			}	
			
			let display_value = value;
			
			if (attr_name == "address_index") {
				// NB: switch to systematic Hardened adresses : Don't display as "'" is already displayed in static
				// console.log(">> display_value: '" + display_value + "' typeof " + typeof display_value);
				if (typeof display_value == 'string' && display_value.endsWith("'")) {
					// console.log(">> INCORRECT display_value: <" + display_value + ">"); 
					display_value = display_value.replaceAll("'", "");
					// console.log(">> NOW display_value: <" + display_value + ">");
					display_value = parseInt(display_value);
				}
			}
			HtmlUtils.SetElementValue( WalletInfo.GUI_NODE_IDs[attr_name], display_value );
		}
	} // setAttribute()
} // Wallet class