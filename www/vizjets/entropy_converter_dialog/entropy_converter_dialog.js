// =======================================================================================================================
// ====================================        entropy_converter_dialog.js         =======================================
// =======================================================================================================================
"use strict";

const ECONVERTER_DIALOG_LABEL_ID           = "econverter_dialog_label_id";

const ECONVERTER_ENTROPY_SIZE_VALUE_ID     = "econverter_entropy_size_value_id";
const ECONVERTER_ENTROPY_WORD_COUNT_ID     = "econverter_entropy_word_count_id";
const ECONVERTER_ENTROPY_SIZE_SELECT_ID    = "econverter_entropy_size_select_id";

const ECONVERTER_RAWTEXT_INPUT_ID          = "econverter_rawtext_input_id";
const ECONVERTER_RAWTEXT_COPY_BTN_ID       = "econverter_rawtext_copy_btn_id";

const ECONVERTER_HEXADECIMAL_INPUT_ID      = "econverter_hexadecimal_input_id";
const ECONVERTER_GENERATE_ENTROPY_BTN_ID   = "econverter_generate_random_entropy_btn_id";
const ECONVERTER_HEXADECIMAL_COPY_BTN_ID   = "econverter_hexadecimal_copy_btn_id";

const ECONVERTER_BASE64_INPUT_ID           = "econverter_base64_input_id";
const ECONVERTER_BASE64_COPY_BTN_ID        = "econverter_base64_copy_btn_id";

const ECONVERTER_BASE58_INPUT_ID           = "econverter_base58_input_id";
const ECONVERTER_BASE58_COPY_BTN_ID        = "econverter_base58_copy_btn_id";

const ECONVERTER_SECRET_PHRASE_INPUT_ID    = "econverter_secret_phrase_input_id";
const ECONVERTER_SECRET_PHRASE_COPY_BTN_ID = "econverter_secret_phrase_copy_btn_id";

const ECONVERTER_BINARY_INPUT_ID           = "econverter_binary_input_id";
const ECONVERTER_BINARY_COPY_BTN_ID        = "econverter_binary_copy_btn_id";

const ECONVERTER_LANG_SELECT_ID            = "econverter_lang_select_id";
const ECONVERTER_GRID_IMG_ID               = "econverter_grid_img_id";

const ECONVERTER_CLEAR_BTN_ID              = "econverter_clear_btn_id";
const ECONVERTER_QUIT_BTN_ID               = "econverter_quit_btn_id";

const BIP39_ALLOWED_BYTES_COUNT = [ 16,   20,  24,  28,  32 ]; 
const BIP39_ALLOWED_WORD_COUNT  = [ 12,   15,  18,  21,  24 ]; 
const BIP39_ALLOWED_BIT_SIZES   = [ 128, 160, 192, 224, 256 ]; 
 
const INPUT_FIELDS_IDS = [ ECONVERTER_RAWTEXT_INPUT_ID,       ECONVERTER_HEXADECIMAL_INPUT_ID, 
                           ECONVERTER_BASE64_INPUT_ID,        ECONVERTER_BASE58_INPUT_ID,
						   ECONVERTER_SECRET_PHRASE_INPUT_ID, ECONVERTER_BINARY_INPUT_ID  ];

class EntropyConverterDialog {
	static #Key           = Symbol();
	static #Singleton     = new EntropyConverterDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( EntropyConverterDialog.#Singleton == undefined ) {
			EntropyConverterDialog.#Singleton = new EntropyConverterDialog( this.#Key );
			if ( Bip38EncryptDecryptDialog.#Singleton > 0 ) {
				throw new TypeError("'EntropyConverterDialog' constructor called more than once");
			}
			EntropyConverterDialog.#InstanceCount++;
        }
        return EntropyConverterDialog.#Singleton;
    } // EntropyConverterDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new EntropyConverterDialog");
		if ( key !== EntropyConverterDialog.#Key ) {
			throw new TypeError("'EntropyConverterDialog' constructor is private");
		}	

	    this.event_handlers_attached = false;
	    this.displayed               = false;
		this.encrypt_mode            = true; 
		this.previous_lang           = 'EN';
		
		this.allow_cb = true;
	} // ** Private constructor **
	
	initialize() {
		// console.log(">> EntropyConverterDialog.initialize");
		
		$("#" + ENTROPY_CONVERTER_DIALOG_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 			true,
				resizable:      false,
				autoOpen: 		false, 
				dialogClass: 	'DialogBox',
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				
				width:   685, // 680
				
				open:   function( event, ui ) {	
							let this_obj = EntropyConverterDialog.This;						
							
							if ( ! this_obj.event_handlers_attached ) {		
							
								this_obj.addEventHandler
									( ECONVERTER_RAWTEXT_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_RAWTEXT_INPUT_ID); } );
		
								this_obj.addEventHandler
									( ECONVERTER_GENERATE_ENTROPY_BTN_ID, 'click', 
									  async () => { await EntropyConverterDialog.This.onGenerateEntropy(); } );							  
									  
								this_obj.addEventHandler
									( ECONVERTER_HEXADECIMAL_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_HEXADECIMAL_INPUT_ID); } );
									  
								this_obj.addEventHandler
									( ECONVERTER_BASE64_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_BASE64_INPUT_ID); } );
									  
								this_obj.addEventHandler
									( ECONVERTER_BASE58_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_BASE58_INPUT_ID); } );
									  
								this_obj.addEventHandler
									( ECONVERTER_SECRET_PHRASE_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_SECRET_PHRASE_INPUT_ID); } );
									  
								this_obj.addEventHandler
									( ECONVERTER_BINARY_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_BINARY_INPUT_ID); } );
									  
									  
								this_obj.addEventHandler
									( ECONVERTER_RAWTEXT_INPUT_ID, 'input', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeInputField( ECONVERTER_RAWTEXT_INPUT_ID ); } ); 	
									  
								this_obj.addEventHandler
									( ECONVERTER_HEXADECIMAL_INPUT_ID, 'input', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeInputField( ECONVERTER_HEXADECIMAL_INPUT_ID ); } ); 
									  
								this_obj.addEventHandler
									( ECONVERTER_BASE64_INPUT_ID, 'input', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeInputField( ECONVERTER_BASE64_INPUT_ID ); } ); 
									  
								this_obj.addEventHandler
									( ECONVERTER_BASE58_INPUT_ID, 'input', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeInputField( ECONVERTER_BASE58_INPUT_ID ); } ); 
									  
									  
								this_obj.addEventHandler
									( ECONVERTER_BINARY_INPUT_ID, 'input', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeInputField( ECONVERTER_BINARY_INPUT_ID ); } ); 
									  
									  
 							    this_obj.addEventHandler
									( ECONVERTER_SECRET_PHRASE_INPUT_ID, 'keypress', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onSecretPhraseKeypress( evt ); } );
									  
								this_obj.addEventHandler
									( ECONVERTER_SECRET_PHRASE_INPUT_ID, 'keydown', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onSecretPhraseKeydown( evt ); } );
									  
									  
								this_obj.addEventHandler
									( ECONVERTER_SECRET_PHRASE_INPUT_ID, 'change', 
									  async ( evt ) => { 
									    if ( this_obj.allow_cb ) {
											 await EntropyConverterDialog.This.onChangeInputField( ECONVERTER_SECRET_PHRASE_INPUT_ID ); 
										 } 
									  });	

								this_obj.addEventHandler
									( ECONVERTER_LANG_SELECT_ID, 'change', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeLang( ECONVERTER_LANG_SELECT_ID ); } );								
							  
								
								this_obj.addEventHandler
									( ECONVERTER_GRID_IMG_ID, 'mousemove',						  
									  async ( evt ) => { 
									    if ( this_obj.allow_cb ) {
											 await EntropyConverterDialog.This.onImgGridHover( evt ); 
										 } 
									  });
									  
								this_obj.addEventHandler
									( ECONVERTER_GRID_IMG_ID, 'click', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onImgGridClick( evt ); } );
								
								
								this_obj.addEventHandler
									( ECONVERTER_CLEAR_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onClearFields(); } );	
									  
								this_obj.addEventHandler
									( ECONVERTER_QUIT_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onQuit(); } );

								this_obj.event_handlers_attached = true;									  
							}
				            this_obj.clearFields();
                            this_obj.displayed = true;							
						}, // open()
						
				close:  function( event, ui ) {	
							let this_obj = EntropyConverterDialog.This;
							this_obj.displayed = false;								  
						} // close()
			} // -------------------- JQuery Dialog options		
		).parent().css('z-index', 900);
	} // initialize()
	
	showDialog() {
		trace2Main( pretty_func_header_format( "EntropyConverterDialog.showDialog" ) );
		
		let dialog_id  = ENTROPY_CONVERTER_DIALOG_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_elt != undefined ) {			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let dialog_obj = $("#" + dialog_id);			
			dialog_obj.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (EntropyConverterDialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	closeDialog() {
		let dialog_obj = $("#" + ENTROPY_CONVERTER_DIALOG_ID);
		this.clearFields();
		dialog_obj.dialog('close');
	} // closeDialog()
	
	ascii_to_hexa( in_str ) {
		// Initialize an empty array to store the hexadecimal values
		let hex_str = [];
		// Iterate through each character in the input string
		for (let i = 0; i < in_str.length; i++) {
			// Convert the ASCII value of the current character to its hexadecimal representation
			let hex = in_str.charCodeAt(i).toString(16).padStart(2, '0');
			// Push the hexadecimal value to the array
			hex_str.push(hex);
		}
		// Join the hexadecimal values in the array to form a single string
		return hex_str.join('');
	} // ascii_to_hexa()
	
	hexa_to_ascii( hex_value ) {
		let hex_str = hex_value.toString(); //force conversion
		console.log("   hex_str: " + hex_str);	
		var ascii_str = '';
		for (let i = 0; i < hex_str.length; i += 2) {
			let hex_byte  = hex_str.substr(i, 2);
			// console.log("   hex_byte(" + i + "): " + hex_byte);
			
			let char_code = parseInt( hex_byte, 16 );
			// console.log("   char_code(" + i + "): " + char_code);	
		    if ( char_code >= 32 ) {
				ascii_str += String.fromCharCode(char_code);
				// console.log("   ascii_str(" + i + "): " + ascii_str);
			}
		}
		return ascii_str;
	} // hexa_to_ascii()
	
	getEntropyBip39ByteCount( hex_str ) {
		// Initialize an empty array to store the hexadecimal values
        if ( ! isHexString( hex_str ) || hex_str.length % 2 != 0) return 0;
		let bytes_count = hex_str.length / 2;
		if ( BIP39_ALLOWED_BYTES_COUNT.indexOf( bytes_count ) != -1 ) {
			return bytes_count;
		}
	} // getEntropyBip39ByteCount()
	
	async propagateNewValue( source_elt_id ) {
		let hex_value           = '';
		
		let raw_value           = '';
		let base64_value        = '';
		let base58_value        = '';		
		let secret_phrase_value = '';
		let binary_value        = '';
		
		let entropy         = '';
		
		let mnemonics       = '';
		let lang            = '';
		
		let mnemonics_value = "";
		
		let data            = {}; 
		let entropy_info    = {};
		
		const getHexValue = async ( field_id ) => {
			let hex_value       = '';
			let mnemonics_value = '';
			let field_value = HtmlUtils.GetElementValue( field_id );
			
			if ( field_id == ECONVERTER_HEXADECIMAL_INPUT_ID ) {
				hex_value = HtmlUtils.GetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID );		
			}
			else if ( field_id == ECONVERTER_SECRET_PHRASE_INPUT_ID ) {
				mnemonics_value = HtmlUtils.GetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID );
		
		        mnemonics = mnemonics_value;
				lang      = HtmlUtils.GetElementValue( ECONVERTER_LANG_SELECT_ID );  	                            		
				data = { mnemonics, lang };
				// entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );		
                entropy_info = await window.ipcMain.MnemonicsToEntropyInfoCustom( data );							
				hex_value = entropy_info[ENTROPY_HEX];
			}
			else {
				let bases_data = {};  
				
				if ( field_id == ECONVERTER_RAWTEXT_INPUT_ID ) {
					bases_data[FROM_RAW_TEXT] = field_value;
				}
				else if ( field_id == ECONVERTER_BASE64_INPUT_ID ) {
					bases_data[FROM_BASE64] = field_value;
				}
				else if ( field_id == ECONVERTER_BASE58_INPUT_ID ) {
					bases_data[FROM_BASE58] = field_value;
				}
				else if ( field_id == ECONVERTER_BINARY_INPUT_ID ) {
					bases_data[FROM_BINARY] = field_value;
				}
			
				data = bases_data;
				hex_value = await window.ipcMain.ConvertFromBasesToHex( data );
			}
			
			return hex_value;
		}; // async getHexValue()
		
		let base_conversions = {};
        const BIP39_ALLOWED_BYTES_COUNT = [ 16, 20, 24, 28, 32 ];	

        let bit_size           = 0;
		let hex_value_bit_size = 0;	
        let word_count         = 0;
        let word_label         = '';
        let bit_label          = '';
		
		for ( let i=0; i < INPUT_FIELDS_IDS.length; i++ ) {
			let current_field_id = INPUT_FIELDS_IDS [ i ];
			
			raw_value           = '';
			base64_value        = '';
			base58_value        = '';
			base_conversions    = {};
			secret_phrase_value = '';
			binary_value        = '';
			bit_size            = 0;			
			hex_value_bit_size  = 0;
			word_count          = 0;
			word_label          = '';
			bit_label           = '';
			
			
			if ( source_elt_id != current_field_id ) continue;
				
			if ( current_field_id == ECONVERTER_HEXADECIMAL_INPUT_ID ) {
			    hex_value = HtmlUtils.GetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID ).trim();				
				bit_size = hex_value.length * 4;
				// console.log(" STEP 0 HEX: bit_size: " + bit_size);
			}	
			else if ( current_field_id == ECONVERTER_RAWTEXT_INPUT_ID ) {
			    raw_value = HtmlUtils.GetElementValue( ECONVERTER_RAWTEXT_INPUT_ID );
				bit_size = raw_value.length * 8;
				// console.log(" STEP 0 RAW: bit_size: " + bit_size);
                hex_value = await getHexValue( ECONVERTER_RAWTEXT_INPUT_ID );				
			}	
			else if ( current_field_id == ECONVERTER_BASE64_INPUT_ID ) {
			    base64_value = HtmlUtils.GetElementValue( ECONVERTER_BASE64_INPUT_ID ).trim();	
                // base64_value = base64_value.replaceAll('=',''); 				
                bit_size = base64_value.replaceAll('=','').length * 6;	
				// console.log(" STEP 0 BASE64: bit_size: " + bit_size);
				hex_value = await getHexValue( ECONVERTER_BASE64_INPUT_ID );
				hex_value_bit_size = hex_value.length * 4;	
                bit_size = hex_value_bit_size;	
			}
			else if ( current_field_id == ECONVERTER_BASE58_INPUT_ID ) {
			    base58_value = HtmlUtils.GetElementValue( ECONVERTER_BASE58_INPUT_ID ).trim();	
                // base64_value = base64_value.replaceAll('=',''); 				
                // bit_size = base58_value.length * 5.86;	
				// console.log(" STEP 0 BASE64: bit_size: " + bit_size);
				hex_value = await getHexValue( ECONVERTER_BASE58_INPUT_ID );
				hex_value_bit_size = hex_value.length * 4;	
                bit_size = hex_value_bit_size;
			}
			// else if ( current_field_id == ECONVERTER_BASE58_INPUT_ID ) {
			//     base58_value = HtmlUtils.GetElementValue( ECONVERTER_BASE58_INPUT_ID ).trim();	
            //     base58_value = base58_value.replaceAll('=',''); 				
            //     bit_size = base58_value.length * 5.86;	
			// 	// console.log(" STEP 0 BASE58: bit_size: " + bit_size);
			// 	hex_value = await getHexValue( ECONVERTER_BASE58_INPUT_ID );
			// 	hex_value_bit_size = hex_value.length * 4;	
            //    bit_size = hex_value_bit_size;				
			// }			
			else if ( current_field_id == ECONVERTER_SECRET_PHRASE_INPUT_ID ) {
			    secret_phrase_value = HtmlUtils.GetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID ).trim();
				if ( secret_phrase_value == '' ) {
					bit_size   = 0;
					word_count = 0;
				}
				else {
					// console.log(" STEP 0 SECRET_PHRASE: secret_phrase_value: " + secret_phrase_value);				
					let words = secret_phrase_value.trim().split(' ');
					word_count = words.length;
					// console.log(" STEP 0 SECRET_PHRASE: word_count: " + word_count);
					HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_WORD_COUNT_ID, word_count );
					bit_size = word_count * 11;	
					hex_value = await getHexValue( ECONVERTER_SECRET_PHRASE_INPUT_ID );
					hex_value_bit_size = hex_value.length * 4;
					bit_size = hex_value_bit_size;
					// console.log(" STEP 0 SECRET_PHRASE: bit_size: " + bit_size);
				}					
			}	
			else if ( current_field_id == ECONVERTER_BINARY_INPUT_ID ) {
			    binary_value = HtmlUtils.GetElementValue( ECONVERTER_BINARY_INPUT_ID ).trim();
				// console.log(" binary_value: " + binary_value + "   isBinaryString: " + isBinaryString(binary_value));				
                if ( isBinaryString(binary_value) ) {
					bit_size = binary_value.length;
				    // console.log(" STEP 1 BINARY: bit_size: " + bit_size);
				    if ( bit_size % 4 == 0 ) {
						hex_value = binaryToHex( binary_value );
						// console.log(" hex_value (4 binary digits): " + hex_value);
						hex_value_bit_size = hex_value.length * 4;
						bit_size = hex_value_bit_size; 

						// console.log(" STEP 1 BINARY: bit_size (hex digits): " + bit_size);
					}
                    // console.log(" STEP 0 BINARY: bit_size: " + bit_size);					
				}				
			}
			else {
				hex_value = await getHexValue( current_field_id );
			}	


            if ( bit_size == 0 ) {
				HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_VALUE_ID, '0' );
			}
            else if ( bit_size > 0 ) {
				// console.log(" STEP 2: bit_size: " + bit_size);
				bit_size = Number( bit_size );
				if ( ! Number.isInteger(bit_size) )	bit_size = bit_size.toFixed(2);
				// console.log(" STEP 2: bit_size 2 decimales: " + bit_size);
				HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_VALUE_ID, bit_size ); 	
			}
			
			if ( word_count == 0 ) {
				word_count = HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_WORD_COUNT_ID, '0' );
			}
            else if ( word_count > 0 ) {
				// console.log(" STEP 2: word_count: " + word_count);
				HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_WORD_COUNT_ID, word_count  ); 	
			}
			
			
			let bytes_count = hex_value.length / 2;					
					
		    if ( BIP39_ALLOWED_BYTES_COUNT.indexOf( bytes_count ) == -1 ) {
			   continue;
		    }
			
			if ( hex_value != '' ) {
				if ( current_field_id == ECONVERTER_BASE64_INPUT_ID ) {
					let current_base64_value = HtmlUtils.GetElementValue( ECONVERTER_BASE64_INPUT_ID );
					console.log("current_base64_value(" + current_base64_value.length + "): " + current_base64_value);
					
					let bip39_base64_value = hexToB64( hex_value );					
					console.log("bip39_base64_value(" + bip39_base64_value.length + "): " + bip39_base64_value);	

					let base64_value_without_padding = base64_value.replaceAll('=','');
					console.log("base64_value_without_padding(" + base64_value_without_padding.length + "): " + base64_value_without_padding);	
				}		
				
				if ( [ 128, 160, 192, 224, 256].indexOf(hex_value.length*4) != -1  ) {
					if ( current_field_id == ECONVERTER_BASE64_INPUT_ID ) {
						let current_base64_value = HtmlUtils.GetElementValue( ECONVERTER_BASE64_INPUT_ID );
						console.log("current_base64_value(" + current_base64_value.length + "): " + current_base64_value);						

						let bip39_base64_value = hexToB64( hex_value );
						console.log("bip39_base64_value(" + bip39_base64_value.length + "): " + bip39_base64_value);
						
						if ( current_base64_value.length > bip39_base64_value.length ) {
							base64_value = current_base64_value;
						}
						else {
							base64_value = bip39_base64_value;
						}
					}
					else {
						base64_value = hexToB64( hex_value );	
					}
					
					HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID, base64_value );
				}	
				
				lang = HtmlUtils.GetElementValue( ECONVERTER_LANG_SELECT_ID );
				this.previous_lang = lang; 
			
				entropy = hex_value;
				data    = { entropy, lang };
				mnemonics_value  = await window.ipcMain.EntropyToMnemonics( data );
				
				base_conversions = await window.ipcMain.ConvertFromHexToBases( hex_value );
			}			
			
			for ( let j=0; j < INPUT_FIELDS_IDS.length; j++ ) {
				let target_field_id = INPUT_FIELDS_IDS [ j ];
				
				if ( source_elt_id != target_field_id   &&  hex_value != '' ) {
					// console.log(">> target_field_id: " + target_field_id + "  hex_value(" + hex_value.length/2 + " bytes): " + hex_value);
					
					if ( target_field_id == ECONVERTER_RAWTEXT_INPUT_ID  &&  base_conversions[TO_RAW_TEXT] != undefined ) {
						HtmlUtils.SetElementValue( ECONVERTER_RAWTEXT_INPUT_ID, base_conversions[TO_RAW_TEXT] );
					}
					else if ( target_field_id == ECONVERTER_HEXADECIMAL_INPUT_ID  &&  hex_value != '' ) {
						HtmlUtils.SetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID, hex_value );
						if ( [ 128, 160, 192, 224, 256].indexOf(hex_value.length*4) != -1  ) {
							HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID, base64_value );	
						}							
					}
					else if ( target_field_id == ECONVERTER_BASE64_INPUT_ID  &&  base_conversions[TO_BASE64] != undefined ) {						
						if ( [ 128, 160, 192, 224, 256].indexOf(hex_value.length*4) != -1  ) {
							HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID, base64_value );	
						}	
						else {						
							HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID, base_conversions[TO_BASE64] );
						}	
					}
					else if ( target_field_id == ECONVERTER_BASE58_INPUT_ID  &&  base_conversions[TO_BASE58] != undefined ) {
						HtmlUtils.SetElementValue( ECONVERTER_BASE58_INPUT_ID, base_conversions[TO_BASE58] );
					}
					else if ( target_field_id == ECONVERTER_BINARY_INPUT_ID  &&  base_conversions[TO_BINARY] != undefined ) {
						let binary_value = base_conversions[TO_BINARY];
						// console.log(">> binary_value: " + binary_value);
						HtmlUtils.SetElementValue( ECONVERTER_BINARY_INPUT_ID, base_conversions[TO_BINARY] );
					}
					else if ( target_field_id == ECONVERTER_SECRET_PHRASE_INPUT_ID  &&  mnemonics_value != '' ) {
						HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, mnemonics_value );
						let words = mnemonics_value.trim().split(' ');
						HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_WORD_COUNT_ID, words.length );
					}
				}
			}	

			if ( [ 128, 160, 192, 224, 256].indexOf(hex_value.length*4) != -1  ) {	
				HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_SELECT_ID, (hex_value.length*4).toString() );			
			}			
		}
	} // async propagateNewValue()
	
	async onGenerateEntropy() {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onGenerateEntropy" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let entropy_size = HtmlUtils.GetElementValue( ECONVERTER_ENTROPY_SIZE_SELECT_ID );
		// console.log( " entropy_size: " + entropy_size + " bits");
		
		let random_entropy_hex = await window.ipcMain.GenerateEntropy( entropy_size );
		// console.log( "random_entropy_hex: " + random_entropy_hex + " " + random_entropy_hex.length*4 + " bits" );
		
		HtmlUtils.SetElementValue( ECONVERTER_LANG_SELECT_ID, 'EN' );
		
		HtmlUtils.SetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID, random_entropy_hex );
		await this.propagateNewValue( ECONVERTER_HEXADECIMAL_INPUT_ID );
	} // async onGenerateEntropy()
	
	async onChangeLang() {
		this.allow_cb = false;

		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onChangeLang" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let data = {};
		let current_lang = this.previous_lang;
		// console.log("> current_lang: " + this.previous_lang );
		
		let secret_phrase_value = HtmlUtils.GetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID ).trim();
        // console.log("> secret_phrase_value: '" + secret_phrase_value + "'" );	
		
		let translated_secret_phrase_value = '';
		
		let mnemonics    = '';
		let lang         = '';
		let word_index   = '';
		let word_indexes = [];

        let options      = {};		
		
		let current_mnemonics = secret_phrase_value.split(' '); 
		let new_mnemonics = '';
		
		let new_lang = HtmlUtils.GetElementValue( ECONVERTER_LANG_SELECT_ID );
		// console.log("> new_lang: " + new_lang );
		
		if ( current_mnemonics.length < 12 || [12,15,18,22,24].indexOf(current_mnemonics.length) == -1 ) { 
			// console.log("> Non Standard Word Count: " + current_mnemonics.length );	
			
			let translated_mnemonics = '';
			let current_mnemonic     = '';
			let new_mnemonic         = '';
			
			options = {};				

			// console.log("++++++++++++++++++++++++");
			// console.log("> secret_phrase_value: " + secret_phrase_value );	
			
			const normalizeBip39 = (str) =>{
				if (!str) return '';
				// Convertir TOUT en forme décomposée, puis supprimer les accents combinants
				return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
			}; // normalizeBip39()			
			
			for ( let i=0; i < current_mnemonics.length; i++ ) {
				console.log("--------------- " + i);
				current_mnemonic = current_mnemonics[ i ];
				// current_mnemonic = normalizeBip39( current_mnemonic );
				// console.log("current_mnemonic: <" + current_mnemonic + ">   current_lang: " + current_lang);
				
				if ( current_mnemonic == '' ) continue;
				
				if ( current_lang == WORDLIST_WORD_INDEXES ) {
					word_index = parseInt( current_mnemonic ).toString(); 
				}
				else {
					try  {
						// console.log("mnemonics BEFORE normalize: '" + current_mnemonic + "'");
						// mnemonics = normalizeBip39( current_mnemonic );
						mnemonics = current_mnemonic;
						//-------------
			
						// console.log("mnemonics AFTER normalize: '" + mnemonics + "'  LANG: " + LANG);
				        options   = { ['Lang']: current_lang };
						data = { mnemonics, options };
						word_index = await window.ipcMain.MnemonicToWordIndex( data );
					}
					catch ( err ) { 	
						throw new Error("**** Error **** in EntropyConverterDialog.onChangeLang Line 544"); 
					}
				}
				
				word_index = parseInt(word_index);	
				// console.log("word_index: " + word_index + " From: " + current_lang + "  To: " + new_lang);
                
				if ( new_lang == WORDLIST_WORD_INDEXES ) {	
					new_mnemonic = word_index.toString();
				}				
				else {
					lang = new_lang;
					data = { word_index, lang };					
					try  {
						new_mnemonic = await window.ipcMain.WordIndexToMnemonic( data );
					}
					catch ( err ) { 	
						throw new Error("**** Error **** in EntropyConverterDialog.onChangeLang Line 556"); 
					}	
				}					
				
				// console.log("new_mnemonic: " + new_mnemonic);
				new_mnemonic = new_mnemonic.normalize('NFC');
				console.log("[" + i + "," + current_lang + "] idx:" + word_index + ": <" +  current_mnemonic + "> to " + new_lang + ": <" + new_mnemonic + ">");	

				translated_secret_phrase_value += new_mnemonic + ' ';				
			}

			translated_secret_phrase_value = translated_secret_phrase_value.trim(' ');
			HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, translated_secret_phrase_value );
			
			this.previous_lang = new_lang;			
		}
		else { // Standard Word Count
		    // console.log("   Standard Word Count: " + current_mnemonics.length);
			if ( current_lang == WORDLIST_WORD_INDEXES ) {
				// console.log("   current_lang = WORDLIST_WORD_INDEXES");
				// console.log("> current_lang: "  + current_lang );
				// console.log("> new_lang: "      + new_lang );
				// console.log("> previous_lang: " + this.previous_lang );
				// console.log("  current_mnemonics: '" + current_mnemonics + "'");
				
				lang = 'EN';
				// console.log("   word indexes of mnemonics: '" + mnemonics + "'" );			
				let word_indexes = current_mnemonics; //..split(' ');	
				// console.log("   word indexes typeof " + typeof word_indexes );
				// console.log("   word indexes: " + JSON.stringify(word_indexes) );
				data = { word_indexes, lang };
				secret_phrase_value = await window.ipcMain.WordIndexesToMnemonics( data );
				// console.log("   word indexes to mnemonics: '" + mnemonics + "'" );
			}		
			
			console.log("   current mnemonics: " + secret_phrase_value);
			
			mnemonics = secret_phrase_value;
			lang      = current_lang;
			data = { mnemonics, lang };
			let entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );
			
			let entropy_value = entropy_info[ENTROPY_HEX];
			// console.log("   entropy_value: " + entropy_value);
			
			let entropy = '';				
					
			if ( new_lang == WORDLIST_WORD_INDEXES ) {			
				mnemonics = secret_phrase_value;		
				options = { [LANG]: this.previous_lang };				
				data = { mnemonics, options };
				let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
				new_mnemonics = word_indexes.join(' ');
			}
			else {					
				entropy = entropy_value;
				lang    = new_lang;
				data = { entropy, lang };
				new_mnemonics = await window.ipcMain.EntropyToMnemonics( data );
				console.log("   new_mnemonics(" + lang + "): " + new_mnemonics);
			}
			
			HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, new_mnemonics );
			
			this.previous_lang = new_lang;
		} // if (check if  Standard Word Count)

		this.allow_cb = true;		
	} // async onChangeLang()
	
	async onChangeInputField( source_elt_id ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onChangeInputField" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log("   source_elt_id: " + source_elt_id);		
		let field_value = HtmlUtils.GetElementValue( source_elt_id );
		// console.log("   Change field_value: " + field_value + "  length: " + field_value.length + "  bytes: " + field_value.length/2);
		
		for ( let i=0; i < INPUT_FIELDS_IDS.length; i++ ) {
			let current_field_id = INPUT_FIELDS_IDS[ i ];
			if ( current_field_id != source_elt_id ) {
				HtmlUtils.SetElementValue( current_field_id, '' );
			}
		}
		
		const convertInputValueToValidBaseValue = ( field_value, base_alphabet, max_length ) => {
            let valid_base_value = '';	
			// console.log("base_alphabet: " + base_alphabet);
            // console.log("max_length: "    + max_length);			
			if ( max_length === undefined ) max_length = -1;
			for ( let j=0; j < field_value.length; j++ ) {
				let c = field_value[ j ];
				if ( base_alphabet.indexOf( c ) != -1 )  {
					// console.log("max_length: "    + max_length);
                    if (  max_length > 0 ) {
						let accepted_base_length = parseInt( valid_base_value.length ) + 1;  
						// console.log("accepted_base_length: " + accepted_base_length );
						if ( accepted_base_length <= max_length ) {   
							valid_base_value += c;
						}
					}
				}
			}
			return valid_base_value;
		}; // convertInputValueToValidBaseValue()
		
		const BASE58_ALPHABET      = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
		const BASE64_ALPHABET      = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		const HEXADECIMAL_ALPHABET = "0123456789ABCDEFabcdef";
		const BINARY_ALPHABET      = "01";
		
		for ( let i=0; i < INPUT_FIELDS_IDS.length; i++ ) {
			let current_field_id = INPUT_FIELDS_IDS[ i ];	
            if ( current_field_id == source_elt_id ) {	
				if ( current_field_id == ECONVERTER_RAWTEXT_INPUT_ID) {
					let rawtext_value = HtmlUtils.GetElementValue( ECONVERTER_RAWTEXT_INPUT_ID );
					if ( rawtext_value.length > 32 ) {
						rawtext_value = rawtext_value.slice(0, 32);
					}
					HtmlUtils.SetElementValue( ECONVERTER_RAWTEXT_INPUT_ID, rawtext_value );
                }
			    else if ( current_field_id == ECONVERTER_HEXADECIMAL_INPUT_ID ) {
					field_value = HtmlUtils.GetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID );					
					field_value = convertInputValueToValidBaseValue( field_value, HEXADECIMAL_ALPHABET, 64 );
					HtmlUtils.SetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID, field_value );
                }
                else if ( current_field_id == ECONVERTER_BASE64_INPUT_ID ) {		
					field_value = HtmlUtils.GetElementValue( ECONVERTER_BASE64_INPUT_ID ).trim();				
					// field_value = convertInputValueToValidBaseValue( field_value, BASE64_ALPHABET, 43 );
					// field_value = convertInputValueToValidBaseValue( field_value, BASE64_ALPHABET, 60 );
					field_value = convertInputValueToValidBaseValue( field_value, BASE64_ALPHABET, 43);
				    HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID, field_value );					
                }
				else if ( current_field_id == ECONVERTER_BASE58_INPUT_ID ) {					
					let base58_value = convertInputValueToValidBaseValue( field_value, BASE58_ALPHABET, 43 );
				    HtmlUtils.SetElementValue( ECONVERTER_BASE58_INPUT_ID, base58_value );				
                }	
				else if ( current_field_id == ECONVERTER_BINARY_INPUT_ID ) {					
					let binary_value = convertInputValueToValidBaseValue( field_value, BINARY_ALPHABET, 256 );
				    HtmlUtils.SetElementValue( ECONVERTER_BINARY_INPUT_ID, binary_value );					
                }
				
				field_value = HtmlUtils.GetElementValue( current_field_id );
                if ( current_field_id != '' ) await this.propagateNewValue( current_field_id );
			}
		}
	} // async onChangeInputField()	
	
	async updateTranslatedMnemonics( entropy, output_lang ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.updateTranslatedMnemonics" + _END_;
		window.ipcMain.logToMain(log_msg);

        let lang = output_lang;
		let data = { entropy, lang };
		let mnemonics = await window.ipcMain.EntropyToMnemonics( data );
		
		let translated_secret_phrase = mnemonics; 
		if ( output_lang == 'JP' ) {
			translated_secret_phrase = translated_secret_phrase.replaceAll(' ', '\u3000');
		}
		
		// console.log("   translated_secret_phrase: " + translated_secret_phrase);		

		HtmlUtils.SetElementValue( ECONVERTER_DIALOG_TRANSLATED_ID, translated_secret_phrase );
    } // async updateTranslatedMnemonics()
	
	getWordIndexFromEvent( evt ) { 
		let evt_X = evt.offsetX;
		let evt_Y = evt.offsetY;
		
		let X = Math.round(evt_X / 2);
		let Y = Math.round(evt_Y / 2);
		
		let word_index = Y*46 + X;
		if ( word_index > 2047 ) word_index = 2047;
		return word_index;
	} // getWordIndexFromEvent()
	
	async getMnemonicFromEvent( evt ) {
        // console.log("EntropyConverterDialog.getMnemonicFromEvent");	
		
		let evt_X = evt.offsetX;
		let evt_Y = evt.offsetY;
		
		let X = Math.round(evt_X / 2);
		let Y = Math.round(evt_Y / 2);
		
		let word_index = Y*46 + X;
		
		if ( word_index < 0 )         word_index = 0;
		else if ( word_index > 2047 ) word_index = 2047;
		
		// console.log(" word_index: " + word_index);
		
		this.previous_lang = HtmlUtils.GetElementValue( ECONVERTER_LANG_SELECT_ID );
		
		let lang = this.previous_lang;
		// console.log("EntropyConverterDialog.getMnemonicFromEvent   lang: " + lang);
		
		let data = { word_index, lang };
		
		let mnemonic = '';
		if ( this.previous_lang == WORDLIST_WORD_INDEXES ) {
			mnemonic = word_index.toString();
		}	
		else {
			mnemonic = await window.ipcMain.WordIndexToMnemonic( data );
		}
		// console.log("EntropyConverterDialog.getMnemonicFromEvent   mnemonic: " + mnemonic);
		
		return mnemonic;
	} // async getMnemonicFromEvent()
	
	getSecretPhrase() {		
	    let secret_phrase = HtmlUtils.GetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID ).trim();
		// console.log(" secret_phrase: <" + secret_phrase + ">");
		return secret_phrase;
	} // getSecretPhrase()
	
	async onImgGridHover( evt ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onImgGridHover" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let mnemonic = await this.getMnemonicFromEvent( evt );
		// console.log(" mnemonic: " + mnemonic);
		
		let secret_phrase = this.getSecretPhrase();
		let words = secret_phrase.split(' ');
		if ( words.length < 24 ) {
			if ( words.length > 0 ) words[words.length-1] = mnemonic; 
			secret_phrase = words.join(' '); 
			HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, secret_phrase);
			await this.onChangeInputField( ECONVERTER_SECRET_PHRASE_INPUT_ID );
		}		
	} // async onImgGridHover()
	
	async onImgGridClick( evt ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onImgGridClick" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let mnemonic = await this.getMnemonicFromEvent( evt );
		// console.log(" mnemonic: " + mnemonic);		
		
        let secret_phrase = this.getSecretPhrase();
		let words = secret_phrase.split(' ');
		if ( words.length < 24 ) {
			secret_phrase += ' ' + mnemonic; 
			HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, secret_phrase);
			await this.onChangeInputField( ECONVERTER_SECRET_PHRASE_INPUT_ID );
		}
	} // async onImgGridClick()	
	
	
	async onSecretPhraseKeydown( evt ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onSecretPhraseKeydown" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log( "evt.charCode: " + evt.charCode );
		
		const deleteWordFromTextCursorPos = ( chaine, index ) => {
			// Règle 1 & 2: Vérifications préalables
			if ( index === 0 )               return chaine;
			if ( chaine[index - 1 ] === ' ') return chaine;
			
			// Trouver le début du mot à supprimer
			let debut = index - 1;
			while (debut > 0 && chaine[debut - 1] !== ' ') {
				debut--;
			}
			
			// Trouver la fin du mot à supprimer
			let fin = index - 1;
			while (fin < chaine.length - 1 && chaine[fin + 1] !== ' ') {
				fin++;
			}
			
			// Supprimer le mot
			return (chaine.slice(0, debut) + chaine.slice(fin + 1)).replace(/\s+/g, ' ').trim();
		} // deleteWordFromTextCursorPos()
		
		evt.preventDefault();
		
		if ( evt.keyCode == BACKSPACE_KEY_CODE || evt.keyCode == DEL_KEY_CODE ) {
			let text_cursor_pos = HtmlUtils.GetElement( ECONVERTER_SECRET_PHRASE_INPUT_ID ).selectionStart;
			console.log( "text_cursor_pos: " + text_cursor_pos );
			let current_secret_phrase = HtmlUtils.GetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID );
			// console.log( "BEFORE DEL Secret Phrase: '" + current_secret_phrase + "'");
			let new_secret_phrase = deleteWordFromTextCursorPos( current_secret_phrase, text_cursor_pos );
			// console.log( "AFTER DEL Secret Phrase: '" + new_secret_phrase + "'");
			if ( new_secret_phrase != current_secret_phrase ) {
				HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, new_secret_phrase );
				await this.onChangeInputField( ECONVERTER_SECRET_PHRASE_INPUT_ID );
			}
		}		
	} // async onSecretPhraseKeydown()
	
	async onSecretPhraseKeypress( evt ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onSecretPhraseKeypress" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log( "evt.charCode: " + evt.charCode );
		let new_char = String.fromCharCode(evt.charCode);
		trace2Main( pretty_format( "new_char: '" +  new_char + "'" ) );
		
		// Default desired behavior: no character input		
		evt.preventDefault();
	} // onSecretPhraseKeypress()
	
	onQuit() {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onQuit" + _END_;
		window.ipcMain.logToMain(log_msg);
		this.closeDialog();
	} // onQuit()
	
	isDisplayed() {
		return this.displayed;
	} // isDisplayed()	
	
	async onPasteText( evt ) {
	    evt.preventDefault();
        let paste_text = (evt.clipboardData || window.clipboardData).getData("text");

		let words = paste_text.split(' ');
		if ( ! ( words.length == 12 || words.length == 15 || words.length == 18 || words.length == 21 || words.length == 24 ) ) {
			let error_msg = "*Error*: Invalid mnemonics count: " + words.length;
			HtmlUtils.SetElementValue( ECONVERTER_DIALOG_ERROR_MSG_ID, error_msg );
			return;
		}
		
		// ----------Special case: 'Word Indexes' ----------
		let is_word_indexes_list = true;
		for ( let i=0; i< words.length; i++ ) {
			let current_word = words[i];
			if (! stringIsNumber( current_word ) ) {
				is_word_indexes_list = false;
				break;
			}
		}
		// ----------Special case: 'Word Indexes'
		
		let mnemonics  = "";
		let paste_lang = "";
		let data       = {};
		
		if ( is_word_indexes_list ) {
			paste_lang = WORDLIST_WORD_INDEXES;
		}
		else {	
			mnemonics = paste_text;
			data      = { mnemonics };	
			paste_lang = await window.ipcMain.GuessMnemonicsLang( data );
			
			// console.log("   paste_lang: " + paste_lang);
			if ( paste_lang == '' ) return;
		}
		
		HtmlUtils.SetElementValue( ECONVERTER_DIALOG_INPUT_ID,             paste_text );
		HtmlUtils.SetElementValue( ECONVERTER_DIALOG_INPUT_LANG_SELECT_ID, paste_lang );
	} // async onPasteText()
	
	onCopyField( elt_id ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onCopyField" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log("   elt_id: " + elt_id);		
		let copy_text = HtmlUtils.GetElementValue( elt_id );
		// console.log("   copy_text: " + copy_text);
		
		if ( copy_text == "") {
			return; 
		}
		
		if ( copy_text != "" ) {
			navigator.clipboard.writeText( copy_text );
		}
	} // onCopyField()
	
	onClearFields() {
		console.log(">> EntropyConverterDialog.onClearFields");
		this.clearFields();
	} // onClearFields()
	
	clearFields() {
		HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_VALUE_ID,   '0' ); 	
		HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_WORD_COUNT_ID,   '0' );
		
		HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_SELECT_ID, '128' ); 
		
		HtmlUtils.SetElementValue( ECONVERTER_LANG_SELECT_ID,          'EN' ); 
				
		HtmlUtils.SetElementValue( ECONVERTER_RAWTEXT_INPUT_ID,        '' );
		HtmlUtils.SetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID,    '' );
		HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID,         '' );
		HtmlUtils.SetElementValue( ECONVERTER_BASE58_INPUT_ID,         '' );
		HtmlUtils.SetElementValue( ECONVERTER_BINARY_INPUT_ID,         '' );
		HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID,  '' );
		HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_VALUE_ID,   '' );
	} // clearFields()
	
	addEventHandler( elt_id, evt_name, evt_handler ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.addEventListener( evt_name, evt_handler );
		}
	} // addEventHandler()
	
    removeEventHandler( elt_id, evt_name, evt_handler ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.removeEventListener( evt_name, evt_handler );
		}
	} // removeEventHandler()
	
	is_not_null( in_str ) {
		if (  in_str != undefined  && in_str != 'undefined'  &&  in_str != ""  &&  in_str != ''   ) {
			return true;			
		}
		return false;
	} // is_not_null()
} // EntropyConverterDialog class 	

EntropyConverterDialog.This.initialize();