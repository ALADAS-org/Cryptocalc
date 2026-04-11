// =======================================================================================================================
// ====================================        entropy_converter_dialog.js         =======================================
// =======================================================================================================================
"use strict";

const ECONVERTER_DIALOG_LABEL_ID           = "econverter_dialog_label_id";

const ECONVERTER_ENTROPY_SIZE_VALUE_ID     = "entropy_size_value_id";

const ECONVERTER_RAWTEXT_INPUT_ID          = "rawtext_input_id";
const ECONVERTER_RAWTEXT_COPY_BTN_ID       = "rawtext_copy_btn_id";

const ECONVERTER_HEXADECIMAL_INPUT_ID      = "hex_input_id";
const ECONVERTER_HEXADECIMAL_COPY_BTN_ID   = "hexadecimal_copy_btn_id";

const ECONVERTER_BASE64_INPUT_ID           = "base64_input_id";
const ECONVERTER_BASE64_COPY_BTN_ID        = "base64_copy_btn_id";

const ECONVERTER_BASE58_INPUT_ID           = "base58_input_id";
const ECONVERTER_BASE58_COPY_BTN_ID        = "base58_copy_btn_id";

const ECONVERTER_SECRET_PHRASE_INPUT_ID    = "secret_phrase_input_id";
const ECONVERTER_SECRET_PHRASE_COPY_BTN_ID = "secret_phrase_copy_btn_id";

const ECONVERTER_BINARY_INPUT_ID           = "binary_input_id";
const ECONVERTER_BINARY_COPY_BTN_ID        = "binary_copy_btn_id";

const ECONVERTER_LANG_SELECT_ID            = "econverter_lang_select_id";

const ECONVERTER_CLEAR_BTN_ID              = "econverter_clear_btn_id";
const ECONVERTER_QUIT_BTN_ID               = "econverter_quit_btn_id";

const BIP39_ALLOWED_BYTES_COUNT = [ 16,   20,  24,  28,  32 ]; 
const BIP39_ALLOWED_WORD_COUNT  = [ 12,   15,  18,  21,  24 ]; 
const BIP39_ALLOWED_BIT_SIZES   = [ 128, 160, 192, 224, 256 ]; 

const INPUT_FIELDS_IDS = [ ECONVERTER_RAWTEXT_INPUT_ID, ECONVERTER_HEXADECIMAL_INPUT_ID, 
                           ECONVERTER_BASE64_INPUT_ID, ECONVERTER_BASE58_INPUT_ID,
						   ECONVERTER_SECRET_PHRASE_INPUT_ID, ECONVERTER_BINARY_INPUT_ID  ];

// Logo canvas constants
const LOGO_CANVAS_WIDTH = 92;
const LOGO_CANVAS_HEIGHT = 92;
const LOGO_COMBINE_FACTOR = 2048;

class EntropyConverterDialog {
	static #Key           = Symbol();
	static #Singleton     = new EntropyConverterDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( EntropyConverterDialog.#Singleton == undefined ) {
			EntropyConverterDialog.#Singleton = new EntropyConverterDialog( this.#Key );
			if ( EntropyConverterDialog.#InstanceCount > 0 ) {
				throw new TypeError("'EntropyConverterDialog' constructor called more than once");
			}
			EntropyConverterDialog.#InstanceCount++;
        }
        return EntropyConverterDialog.#Singleton;
    } // EntropyConverterDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		if ( key !== EntropyConverterDialog.#Key ) {
			throw new TypeError("'EntropyConverterDialog' constructor is private");
		}	

	    this.event_handlers_attached = false;
	    this.displayed               = false;
		this.encrypt_mode            = true; 
		this.previous_lang           = 'EN';
		this.p5_sketch_initialized   = false;
	} // ** Private constructor **
	
	initialize() {
		// console.log(">> EntropyConverterDialog.initialize");
		
		$("#" + ENTROPY_CONVERTER_DIALOG_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 			true,
				resizable:      false,
				autoOpen: 		false, 
				dialogClass: 	'DialogBox',
				
				width:   670,
				
				open:   function( event, ui ) {	
							let this_obj = EntropyConverterDialog.This;						
							
							if ( ! this_obj.event_handlers_attached ) {								
							
								this_obj.addEventHandler
									( ECONVERTER_RAWTEXT_COPY_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onCopyField(ECONVERTER_RAWTEXT_INPUT_ID); } );									  
									  
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
									( ECONVERTER_LANG_SELECT_ID, 'change', 
									  async ( evt ) => 
									  { await EntropyConverterDialog.This.onChangeLang( ECONVERTER_LANG_SELECT_ID ); } );
									  
								this_obj.addEventHandler
									( ECONVERTER_CLEAR_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onClearFields(); } );	
									  
								this_obj.addEventHandler
									( ECONVERTER_QUIT_BTN_ID, 'click', 
									  () => { EntropyConverterDialog.This.onQuit(); } );

								this_obj.event_handlers_attached = true;									  
							}
							
							// Setup the p5 logo canvas if not already done
							if ( ! this_obj.p5_sketch_initialized ) {
								this_obj.setupLogoCanvas();
								this_obj.p5_sketch_initialized = true;
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
	
	// p5.js sketch for logo canvas
	setupLogoCanvas() {
		const container = document.getElementById('logo_canvas_container');
		if (!container) return;
		
		container.innerHTML = '';
		
		// Create canvas element for p5
		const canvasElement = document.createElement('div');
		canvasElement.id = 'p5_logo_holder';
		container.appendChild(canvasElement);
		
		const self = this;
		
		// p5 sketch
		const sketch = (p) => {
			let logoImg = null;
			
			p.preload = () => {
				// Use relative path from the HTML file location
				logoImg = p.loadImage('../icons/Cryptocalc_Logo_92px.png');
			};
			
			p.setup = () => {
				const canvas = p.createCanvas(92, 92);
				canvas.parent('p5_logo_holder');
				canvas.style('cursor', 'pointer');
				canvas.style('border', '1px solid #ccc');
				canvas.style('border-radius', '4px');
				
				canvas.mouseClicked(() => {
					const xVal = Math.floor(p.mouseX / 2);
					const yVal = Math.floor(p.mouseY / 2);
					let combined = (xVal * 46) + yVal;
					// Ensure within 0-2048
					combined = Math.min(combined, 2047);
					
					// Log to console only
					console.log("Logo click - Coordinates: x=" + xVal + ", y=" + yVal + " → Seed value: " + combined);
					
					self.applyLogoSeedToEntropy(combined);
				});
				
				canvas.mouseMoved(() => {
					const xVal = Math.floor(p.mouseX / 2);
					const yVal = Math.floor(p.mouseY / 2);
					let combined = (xVal * 46) + yVal;
					combined = Math.min(combined, 2047);
					
					// Log to console only on hover
					console.log("Logo hover - Coordinates: x=" + xVal + ", y=" + yVal + " → Seed value: " + combined);
				});
			};
			
			p.draw = () => {
				if (logoImg) {
					p.image(logoImg, 0, 0, 92, 92);
				} else {
					p.background(240);
					p.fill(100);
					p.textAlign(p.CENTER, p.CENTER);
					p.text('Logo', 46, 46);
				}
			};
		};
		
		new p5(sketch);
	} // setupLogoCanvas()
	
	applyLogoSeedToEntropy(seedValue) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.applyLogoSeedToEntropy" + _END_;
		if (window.ipcMain && window.ipcMain.logToMain) {
			window.ipcMain.logToMain(log_msg);
		}
		console.log("   Applying seed value: " + seedValue);
		
		// Generate entropy bytes based on seed (16 bytes = 128 bits = 12 words)
		const targetBytes = 16;
		
		// Use the seed to generate deterministic entropy
		const entropyBytes = new Uint8Array(targetBytes);
		let seed = seedValue;
		for (let i = 0; i < targetBytes; i++) {
			seed = (seed * 1103515245 + 12345) & 0x7fffffff;
			entropyBytes[i] = seed % 256;
		}
		
		// Convert to hex
		let hexValue = '';
		for (let i = 0; i < entropyBytes.length; i++) {
			hexValue += entropyBytes[i].toString(16).padStart(2, '0');
		}
		
		console.log("   Generated entropy (hex): " + hexValue);
		console.log("   Entropy size: " + (hexValue.length * 4) + " bits");
		
		// Update the hexadecimal field
		HtmlUtils.SetElementValue(ECONVERTER_HEXADECIMAL_INPUT_ID, hexValue);
		
		// Trigger the change to propagate to all fields
		this.onChangeInputField(ECONVERTER_HEXADECIMAL_INPUT_ID);
	} // applyLogoSeedToEntropy()
	
	showDialog() {
		trace2Main( pretty_func_header_format( "EntropyConverterDialog.showDialog" ) );
		
		let dialog_id  = ENTROPY_CONVERTER_DIALOG_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		if ( dialog_elt != undefined ) {			
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
		let hex_str = [];
		for (let i = 0; i < in_str.length; i++) {
			let hex = in_str.charCodeAt(i).toString(16).padStart(2, '0');
			hex_str.push(hex);
		}
		return hex_str.join('');
	} // ascii_to_hexa()
	
	hexa_to_ascii( hex_value ) {
		let hex_str = hex_value.toString();
		console.log("   hex_str: " + hex_str);	
		var ascii_str = '';
		for (let i = 0; i < hex_str.length; i += 2) {
			let hex_byte  = hex_str.substr(i, 2);
			console.log("   hex_byte(" + i + "): " + hex_byte);
			
			let char_code = parseInt( hex_byte, 16 );
			console.log("   char_code(" + i + "): " + char_code);	
		    if ( char_code >= 32 ) {
				ascii_str += String.fromCharCode(char_code);
				console.log("   ascii_str(" + i + "): " + ascii_str);
			}
		}
		return ascii_str;
	} // hexa_to_ascii()
	
	getEntropyBip39ByteCount( hex_str ) {
        if ( ! isHexString( hex_str ) || hex_str.length % 2 != 0) return 0;
		let bytes_count = hex_str.length / 2;
		if ( BIP39_ALLOWED_BYTES_COUNT.indexOf( bytes_count ) != -1 ) {
			return bytes_count;
		}
	} // getEntropyBip39ByteCount()
	
	async propagateNewValue( source_elt_id ) {
		let hex_value    = '';
		let base64_value = '';
		let raw_value    = '';
		
		let entropy         = '';
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
				let mnemonics_items = mnemonics_value.split();
				if ( BIP39_ALLOWED_WORD_COUNT.indexOf( mnemonics_items.length ) != -1 ) {
					let lang      = HtmlUtils.GetElementValue( ECONVERTER_LANG_SELECT_ID );
  	                let mnemonics = mnemonics_value;			
	  		        data = { mnemonics, lang };
			        entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );
					
					hex_value = entropy_info[ENTROPY_HEX];
				}
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

        let bit_size = 0;		
		
		for ( let i=0; i < INPUT_FIELDS_IDS.length; i++ ) {
			let source_field_id = INPUT_FIELDS_IDS [ i ];
			
			raw_value        = '';
			base64_value     = '';
			base_conversions = {};
			
			let bit_size = 0;
			
			if ( source_field_id == ECONVERTER_HEXADECIMAL_INPUT_ID ) {
			    hex_value = HtmlUtils.GetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID );				
				bit_size = hex_value.length * 4;
			}	
			else if ( source_field_id == ECONVERTER_RAWTEXT_INPUT_ID ) {
			    raw_value = HtmlUtils.GetElementValue( ECONVERTER_RAWTEXT_INPUT_ID );
				bit_size = raw_value.length * 8;
                hex_value = await getHexValue( ECONVERTER_RAWTEXT_INPUT_ID );				
			}	
			else if ( source_field_id == ECONVERTER_BASE64_INPUT_ID ) {
			    base64_value = HtmlUtils.GetElementValue( ECONVERTER_BASE64_INPUT_ID );	
                base64_value = base64_value.replaceAll('=',''); 				
                bit_size = base64_value.length * 6;	
				hex_value = await getHexValue( ECONVERTER_BASE64_INPUT_ID );
				let hex_value_bit_size = hex_value.length * 4;
				if ( BIP39_ALLOWED_BIT_SIZES.indexOf( hex_value_bit_size ) != -1 ) {
					bit_size = hex_value_bit_size;
                }					
			}	
			else {
				hex_value = await getHexValue( source_field_id );
			}	

            if ( bit_size > 0 ) {
				console.log(" bit_size: " + bit_size);
				HtmlUtils.SetElementValue( ECONVERTER_ENTROPY_SIZE_VALUE_ID, bit_size ); 	
			}
			
			let bytes_count = hex_value.length / 2;					
					
		    if ( BIP39_ALLOWED_BYTES_COUNT.indexOf( bytes_count ) == -1 ) {
			   continue;
		    }
			
			if ( hex_value != '' ) {
				base64_value = hexToB64( hex_value );
			
				entropy = hex_value;
				data    = { entropy, lang };
				mnemonics_value  = await window.ipcMain.EntropyToMnemonics( data );
				
				base_conversions = await window.ipcMain.ConvertFromHexToBases( hex_value );
			}			
			
			for ( let j=0; j < INPUT_FIELDS_IDS.length; j++ ) {
				let target_field_id = INPUT_FIELDS_IDS [ j ];
				if ( source_field_id != target_field_id   &&  hex_value != '' ) {
					if ( target_field_id == ECONVERTER_RAWTEXT_INPUT_ID  &&  base_conversions[TO_RAW_TEXT] != undefined ) {
						HtmlUtils.SetElementValue( ECONVERTER_RAWTEXT_INPUT_ID, base_conversions[TO_RAW_TEXT] );
					}
					else if ( target_field_id == ECONVERTER_HEXADECIMAL_INPUT_ID  &&  hex_value != '' ) {
						HtmlUtils.SetElementValue( ECONVERTER_HEXADECIMAL_INPUT_ID, hex_value );
					}
					else if ( target_field_id == ECONVERTER_BASE64_INPUT_ID  &&  base_conversions[TO_BASE64] != undefined ) {
						HtmlUtils.SetElementValue( ECONVERTER_BASE64_INPUT_ID, base_conversions[TO_BASE64] );
					}
					else if ( target_field_id == ECONVERTER_BASE58_INPUT_ID  &&  base_conversions[TO_BASE58] != undefined ) {
						HtmlUtils.SetElementValue( ECONVERTER_BASE58_INPUT_ID, base_conversions[TO_BASE58] );
					}
					else if ( target_field_id == ECONVERTER_BINARY_INPUT_ID  &&  base_conversions[TO_BINARY] != undefined ) {
						HtmlUtils.SetElementValue( ECONVERTER_BINARY_INPUT_ID, base_conversions[TO_BINARY] );
					}
					else if ( target_field_id == ECONVERTER_SECRET_PHRASE_INPUT_ID  &&  mnemonics_value != '' ) {
						HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, mnemonics_value );
					}
				}
			}			
		}
	} // async propagateNewValue()
	
	async onChangeLang() {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onChangeLang" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let data = {};
		let lang = this.previous_lang;
		
		let mnemonics = HtmlUtils.GetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID );	
		
		if ( lang == WORDLIST_WORD_INDEXES ) {
			lang = 'EN';
			let word_indexes = mnemonics.split(' ');	
			data = { word_indexes, lang };
			mnemonics = await window.ipcMain.WordIndexesToMnemonics( data );
		}		
  	    
        console.log("   current mnemonics(" + lang + "): " + mnemonics);
		
	  	data = { mnemonics, lang };
		let entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );
		
		let entropy_value = entropy_info[ENTROPY_HEX];
		console.log("   entropy_value: " + entropy_value);
		
		let entropy = entropy_value;
		let new_lang = HtmlUtils.GetElementValue( ECONVERTER_LANG_SELECT_ID );
		
		let new_mnemonics = '';
		
		if ( new_lang == WORDLIST_WORD_INDEXES ) {
		    let options = { [LANG]: this.previous_lang };			
			data = { mnemonics, options };
			let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
			new_mnemonics = word_indexes.join(' ');
		}
		else {	
		    lang = new_lang;
			data = { entropy, lang };
			new_mnemonics  = await window.ipcMain.EntropyToMnemonics( data );
			console.log("   new_mnemonics(" + lang + "): " + new_mnemonics);
		}
		
		HtmlUtils.SetElementValue( ECONVERTER_SECRET_PHRASE_INPUT_ID, new_mnemonics );
		
		this.previous_lang = new_lang;
	} // async onChangeLang()
	
	async onChangeInputField( source_elt_id ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onChangeInputField" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let field_value = HtmlUtils.GetElementValue( source_elt_id );
		
		for ( let i=0; i < INPUT_FIELDS_IDS.length; i++ ) {
			let current_field_id = INPUT_FIELDS_IDS[ i ];
			if ( current_field_id != source_elt_id ) {
				HtmlUtils.SetElementValue( current_field_id, '' );
			}
		}
		
		for ( let i=0; i < INPUT_FIELDS_IDS.length; i++ ) {
			let current_field_id = INPUT_FIELDS_IDS[ i ];			
			await this.propagateNewValue( current_field_id );
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

		HtmlUtils.SetElementValue( ECONVERTER_DIALOG_TRANSLATED_ID, translated_secret_phrase );
    } // async updateTranslatedMnemonics()
	
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
		
		let is_word_indexes_list = true;
		for ( let i=0; i< words.length; i++ ) {
			let current_word = words[i];
			if (! stringIsNumber( current_word ) ) {
				is_word_indexes_list = false;
				break;
			}
		}
		
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
			
			if ( paste_lang == '' ) return;
		}
		
		HtmlUtils.SetElementValue( ECONVERTER_DIALOG_INPUT_ID,             paste_text );
		HtmlUtils.SetElementValue( ECONVERTER_DIALOG_INPUT_LANG_SELECT_ID, paste_lang );
	} // async onPasteText()
	
	onCopyField( elt_id ) {
		let log_msg = ">> " + _CYAN_ + "EntropyConverterDialog.onCopyField" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		console.log("   elt_id: " + elt_id);		
		let copy_text = HtmlUtils.GetElementValue( elt_id );
		console.log("   copy_text: " + copy_text);
		
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