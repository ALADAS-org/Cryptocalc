// ========================================================================================================================
// ====================================               bip85_dialog.js               =======================================
// ========================================================================================================================
"use strict";

const BIP85_DIALOG_INPUT_ID                         = "bip85_dialog_input_id";

const BIP85_DIALOG_ENTROPY_ID                       = "bip85_dialog_entropy_input_id";
const BIP85_DIALOG_INDEX_ID                         = "bip85_dialog_index_id";
const BIP85_DIALOG_ENTROPY_SIZE_ID                  = "bip85_dialog_entropy_size_id";

//const BIP39_MAIN_WINDOW_PASSPHRASE_ID                = "bip32_passphrase_id";

//const PASSPHRASE_DIALOG_REGENERATE_PASSPHRASE_BTN_ID = "generate_passphrase_btn_id";
//const PASSPHRASE_DIALOG_CLEAR_PASSPHRASE_BTN_ID      = "clear_passphrase_btn_id";

const BIP85_DIALOG_APPLY_BTN_ID                     = "bip85_dialog_apply_btn_id";
const BIP85_DIALOG_CANCEL_BTN_ID                    = "bip85_dialog_cancel_btn_id";

const BIP85_MAX_INDEX_VALUE        = 2147483647;
const BIP85_MAX_INDEX_VALUE_DIGITS = 10;

const ENTER_KEYCODE     = 13;
const BACKSPACE_KEYCODE = 8;
const DELETE_KEYCODE    = 46;

class Bip85Dialog {
	static #Key           = Symbol();
	static #Singleton     = new Bip85Dialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( Bip85Dialog.#Singleton == undefined ) {
			Bip85Dialog.#Singleton = new Bip85Dialog( this.#Key );
			if ( Bip38EncryptDecryptDialog.#Singleton > 0 ) {
				throw new TypeError("'Bip85Dialog' constructor called more than once");
			}
			Bip85Dialog.#InstanceCount++;
        }
        return Bip85Dialog.#Singleton;
    } // Bip85Dialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new Bip85Dialog");
		if ( key !== Bip85Dialog.#Key ) {
			throw new TypeError("'Bip85Dialog' constructor is private");
		}	

	    this.event_handlers_attached = false;
	    this.displayed               = false;
	} // ** Private constructor **
	
	initialize() {
		console.log(">> Bip85Dialog.initialize ====================");
		
		$("#" + BIP85_DIALOG_INPUT_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 			true,
				resizable:      false,
				autoOpen: 		false, 
				dialogClass: 	'DialogBox',
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				
				width:   500, // 680
				height:  155,
				
				open:   function( event, ui ) {	
							// console.log(">> Bip85Dialog.open");	
							
							let this_obj = Bip85Dialog.This;						
							
							if ( ! this_obj.event_handlers_attached ) {	
								this_obj.addEventHandler
									( BIP85_DIALOG_INDEX_ID, 'paste', 
									  async (evt) => { await Bip85Dialog.This.onBIP32FieldPaste(evt); } );

								this_obj.addEventHandler
									( BIP85_DIALOG_INDEX_ID, 'keyup', 
									  async (evt) => { await Bip85Dialog.This.onBIP85FieldKeyup(evt); } );

								this_obj.addEventHandler
									( BIP85_DIALOG_INDEX_ID, 'keydown', 
									  async (evt) => { await Bip85Dialog.This.onBIP85FieldKeydown(evt); } );	

								this_obj.addEventHandler
									( BIP85_DIALOG_INDEX_ID, 'keypress', 
									  async (evt) => { await Bip85Dialog.This.onBIP85FieldKeypress(evt); } );										  
									  
								this_obj.addEventHandler
									( BIP85_DIALOG_APPLY_BTN_ID, 'click', 
									  async () => { await Bip85Dialog.This.onApply(); } );	
									  
								this_obj.addEventHandler
									( BIP85_DIALOG_CANCEL_BTN_ID, 'click', 
									  () => { Bip85Dialog.This.onCancel(); } );

								this_obj.event_handlers_attached = true;									  
							}
							
							// let passphrase_value = HtmlUtils.GetElementValue( BIP39_MAIN_WINDOW_PASSPHRASE_ID );
							// HtmlUtils.SetElementValue( PASSPHRASE_DIALOG_INPUT_ID, passphrase_value );
							
                            this_obj.displayed = true;							
						}, // open()
						
				close:  function( event, ui ) {	
							let this_obj = Bip85Dialog.This;
							this_obj.displayed = false;								  
						} // close()
			} // -------------------- JQuery Dialog options		
		).parent().css('z-index', 900);
	} // initialize()
	
	showDialog( args ) {
		trace2Main( pretty_func_header_format( "Bip85Dialog.showDialog" ) );
		
		let dialog_id  = BIP85_DIALOG_INPUT_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_elt != undefined ) {			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			
			// console.log( "Bip85Dialog.showDialog  ADDRESS_INDEX: "  +  args[ ADDRESS_INDEX ] );
			// console.log( "Bip85Dialog.showDialog  ENTROPY_SIZE: "   +  args[ ENTROPY_SIZE ] );
			
			HtmlUtils.SetElementValue( BIP85_DIALOG_INDEX_ID,        args[ ADDRESS_INDEX ] );
			HtmlUtils.SetElementValue( BIP85_DIALOG_ENTROPY_SIZE_ID, args[ ENTROPY_SIZE ] );				
						  
			let dialog_obj = $("#" + dialog_id);			
			dialog_obj.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (Bip85Dialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	closeDialog() {
		let dialog_obj = $("#" + BIP85_DIALOG_INPUT_ID);
		this.clearFields();
		dialog_obj.dialog('close');
	} // closeDialog()
	
	getSelectedText( element ) {
		// Récupérer les positions de début et fin
		const start = element.selectionStart;
		const end   = element.selectionEnd;
		
		// Vérifier si une sélection existe
		if (start !== null && end !== null && start !== end) {
			// Extraire le texte sélectionné
			const selectedText = element.value.substring(start, end);
			return {
				text: selectedText,
				start: start,
				end: end,
				length: end - start,
				hasSelection: true
			};
		}
		
		return {
			text: null,
			start: start,
			end: end,
			length: 0,
			hasSelection: false
		};
	} // getSelectedText()
	
	// <paste> event handler for BIP85 "Index Field" 
	async onBIP85FieldPaste( evt, elt_id) {
		trace2Main( pretty_func_header_format( "Bip85Dialog.onBIP85FieldPaste" ) );
		let elt = document.getElementById( elt_id );
		
		await this.checkPremium();
		
		if ( elt != undefined ) { 
		    evt.preventDefault();
		
			let initial_bip32_field_value_str = HtmlUtils.GetElementValue( elt_id );
			
			let paste_data = (evt.clipboardData || evt.clipboardData).getData("text");
			// trace2Main( "  onBIP32FieldPaste (paste_data): '" + paste_data + "'  typeof: " + typeof paste_data);
			
			let bip32_field_value_str = this.checkBip32FieldValue( paste_data );
			// trace2Main( "  onBIP32FieldPaste (bip32_field_value_str): '" + bip32_field_value_str + "'" );
			
			let bip32_field_value = parseInt( bip32_field_value_str );
			
			if (    bip32_field_value_str.length < 1
				 || bip32_field_value_str.length > BIP85_MAX_INDEX_VALUE_DIGITS
				 || bip32_field_value < 0
				 || bip32_field_value > BIP85_MAX_INDEX_VALUE ) { 
				 bip32_field_value_str = "0";
			}
		}
	} // onBIP85FieldPaste()
	
	// <keydown> event handler for BIP85 "Index Field"
	async onBIP85FieldKeydown( evt ) {
		let field_value_str = "";
		
		// trace2Main("   =============== onBIP85FieldKeydown  evt.keyCode: " + evt.keyCode);
		
		// trace2Main("  onBIP85FieldKeydown Before  previous_account_value:        " + this.previous_account_value);
		// trace2Main("  onBIP85FieldKeydown Before  previous_address_index_value:  " + this.previous_address_index_value);
		
		if ( evt.keyCode == BACKSPACE_KEYCODE || evt.keyCode == DELETE_KEYCODE ) {
			// trace2Main("  onBIP32FieldKeydown  DELETE/BACKSPACE KeyCode:  " + evt.keyCode);
			field_value_str = HtmlUtils.GetElementValue( evt.target.id );
			// trace2Main("  field_value_str('" + evt.target.id + "'):  " + field_value_str);
			
			if ( field_value_str == "" ) {
				HtmlUtils.SetElementValue( evt.target.id, "0" );
				field_value_str = "0";
			}
			
			if ( evt.target.id == ACCOUNT_ID ) {
				this.previous_account_value = field_value_str;
			}
            else if ( evt.target.id == ADDRESS_INDEX_ID ) {	
				this.previous_address_index_value = field_value_str;			
			}
			
			// trace2Main("  onBIP32FieldKeydown After  previous_account_value:        " + this.previous_account_value);
			// trace2Main("  onBIP32FieldKeydown After  previous_address_index_value:  " + this.previous_address_index_value);
			
			return true;
		}	
	} // onBIP85FieldKeydown()
	
	// <keyup> event handler for BIP85 "Index Field"
	async onBIP85FieldKeyup( evt ) {		
		let field_value_str = "";
		
		// trace2Main("   =============== onBIP85FieldKeyup  evt.keyCode: " + evt.keyCode);
		
		// trace2Main("  previous_account_value:        " + this.previous_account_value);
		// trace2Main("  previous_address_index_value:  " + this.previous_address_index_value);
		
		if ( evt.keyCode == BACKSPACE_KEYCODE || evt.keyCode == DELETE_KEYCODE ) {			
			return true;
		}	
	} // onBIP85FieldKeyup()
	
	// <keypress> event handler for BIP85 "Index Field"
	async onBIP85FieldKeypress( evt ) {
		trace2Main( pretty_func_header_format( "Bip85Dialog.onBIP85FieldKeypress" ) );
		
		// trace2Main("  evt.keyCode:  " + evt.keyCode);
		//  trace2Main("  evt.target:  " + evt.target.id);		
		
		let field_value_str = "";
		
		let is_valid_field_value        = false;
		let is_valid_future_field_value = false;
		
		// trace2Main("   =============== onBIP32FieldKeypress evt.keyCode: " + evt.keyCode);
		
		//========== If 'ENTER' or 'Return' key pressed ==========
        if ( evt.charCode == ENTER_KEYCODE ) {
			trace2Main("   'ENTER' or 'Return' key pressed");
			
			let bip85_index = HtmlUtils.GetElementValue( BIP85_DIALOG_INDEX_ID );			
			
			if (    field_value_str.length >= 1  
			    &&  field_value_str.length <= BIP85_MAX_INDEX_VALUE 
				&&  field_value            <= BIP85_MAX_INDEX_VALUE_DIGITS ) { 
				is_valid_field_value = true;
			}
			
			// trace2Main("  is_valid_field_value:  " + is_valid_field_value);			
			return;
			//========== If 'ENTER' or 'Return' key pressed
        } 
		
		// trace2Main(" Filter non decimal characters");
		
		//========== Filter non decimal characters ==========
		let is_decimal_digit = ( evt.charCode >= 48 && evt.charCode <= 57 );  // 0..9
		trace2Main(" is_decimal_digit 1: " + is_decimal_digit);
		
		let cursor_position = evt.target.selectionStart;
		
		// Note: prevent from "inserting '0's at start"
		field_value_str = HtmlUtils.GetElementValue( evt.target.id );
		trace2Main(" field_value_str 1: '" + field_value_str + "'");
		
		let selected_result = this.getSelectedText( HtmlUtils.GetElement( BIP85_DIALOG_INDEX_ID ) );
		trace2Main(" selected_result.text: '" + selected_result.text + "'");
		
		if ( evt.charCode == 48 && field_value_str == "" ) {
			is_decimal_digit = true; // '0' allowed as first digit ony if previous value is empty
		}	
		else if ( cursor_position == 0 && evt.charCode == 48 ) {
			if ( selected_result.text != null && selected_result.text.length == 0 ) { 
				is_decimal_digit = false;
			}
		}
		
		trace2Main(" is_decimal_digit 2: " + is_decimal_digit);
		
		// trace2Main("  is_decimal_digit (" + evt.charCode + "): " + is_decimal_digit);
		if ( ! is_decimal_digit ) { 
			evt.preventDefault();
			return false;
		}
		
		field_value_str = HtmlUtils.GetElementValue( evt.target.id );
		trace2Main(" field_value_str 1: '" + field_value_str + "'");
		
		trace2Main(" selected_result: '" + JSON.stringify(selected_result) + "'");
		
		if ( selected_result.text != null && selected_result.text.length > 0 ) {
			field_value_str = '';
		}
		
		trace2Main(" field_value_str 1.1: '" + field_value_str + "'");
		
		let insert_decimal_character = String.fromCharCode(evt.charCode);
		trace2Main(" insert_decimal_character: '" + insert_decimal_character + "'");
		
		// if ( field_value_str == "" && is_decimal_digit ) {
		// 	field_value_str = String.fromCharCode(evt.charCode)
		// }
		// else if ( field_value_str.startsWith("0") ) {
		// 	 field_value_str = field_value_str.replace(/^0+/, '');
		// }
		// trace2Main(" field_value_str 2: '" + field_value_str + "'");

		let field_value_int = -1; 

		trace2Main(" current field_value_str 0: '" + field_value_str + "'");
		
		if ( is_decimal_digit ) { 
		    trace2Main(" is_decimal_digit: '" + String.fromCharCode(evt.charCode) + "'");	
			trace2Main(" field_value_str length: " + field_value_str.length);	
			
			if ( field_value_str.length == 0 ) { 
				field_value_str = insert_decimal_character;
			}
		    else if ( field_value_str.length > 0 ) {
				if ( ! field_value_str.startsWith("0") ) {
					field_value_str = field_value_str + insert_decimal_character;
				}
				else if ( field_value_str.length == 1 ) {
					field_value_str = insert_decimal_character;
				}
				
				trace2Main(" field_value_str 1a: '" + field_value_str + "'");	
				
				if ( field_value_str.startsWith("0") ) {
					field_value_str = field_value_str.replace(/^0+/, '');
				}
				trace2Main(" field_value_str 1b: '" + field_value_str + "'");	
		    }
		
			trace2Main(" field_value_str 2: '" + field_value_str + "'");
			
			try {
				field_value_int = parseInt( field_value_str );
			}
			catch ( error ) {
				field_value_int = -1;
			}
			
			trace2Main(" field_value_int: " + field_value_int);
		
			// trace2Main("  future_field_value_str(" + future_field_value_str.length+ "): '" + future_field_value_str + "'" );
			// trace2Main("  future_field_value_int: '" + future_field_value_int + "'" ); 			
		}
		
		is_valid_field_value = false;
		
		if (     field_value_str.length > 0  
			 &&  field_value_str        <= BIP85_MAX_INDEX_VALUE  
             &&  field_value_str.length <= BIP85_MAX_INDEX_VALUE_DIGITS			 
			 &&  field_value_int >= 0 ) { 
				
				is_valid_field_value = true;
		}
		
		trace2Main(" is_decimal_digit:     " + is_decimal_digit);
		trace2Main(" is_valid_field_value: " + is_valid_field_value);
		
        if ( ! is_decimal_digit || ! is_valid_field_value ) {
			// trace2Main(" ! is_decimal_digit || ! is_valid_future_field_value");
			evt.preventDefault();			
			return false;
        }		
		else if ( is_decimal_digit && is_valid_field_value ) {
			trace2Main(" field_value_int: '" + field_value_int.toString() + "'");
			
			let new_field_value_str = field_value_int.toString();
			
			HtmlUtils.SetElementValue( BIP85_DIALOG_INDEX_ID, new_field_value_str );
			//$('#BIP85_DIALOG_INDEX_ID').prop("value", new_field_value_str);
			
			evt.preventDefault();			
			return false;
		}
		//========== Filter non decimal characters
		
		// trace2Main("  onBIP32FieldKeypress  previous_account_value:        " + this.previous_account_value);
		// trace2Main("  onBIP32FieldKeypress  previous_address_index_value:  " + this.previous_address_index_value);
	} // onBIP85FieldKeypress()
	
	async onApply() {
		let log_msg = ">> " + _CYAN_ + "Bip85Dialog.onApply" + _END_;	
        window.ipcMain.logToMain(log_msg);
		
		let entropy            = HtmlUtils.GetElementValue( ENTROPY_ID );
		
		let bip85_index        = parseInt(HtmlUtils.GetElementValue( BIP85_DIALOG_INDEX_ID ));
		let bip85_entropy_size = parseInt(HtmlUtils.GetElementValue( BIP85_DIALOG_ENTROPY_SIZE_ID ));
		const data = { entropy, bip85_index, bip85_entropy_size };
		
		log_msg = ">> " + _CYAN_ + "Bip85Dialog.onApply  data: " + JSON.stringify(data) + _END_;
		window.ipcMain.logToMain(log_msg); 
			
		let bip85_result = await window.ipcMain.Bip85DeriveBip39( data );
		
		await MainGUI.This.onApplyBip85Params( bip85_result );
		
		this.closeDialog();
	} // onApply()
	
	onCancel() {
		let log_msg = ">> " + _CYAN_ + "Bip85Dialog.onCancel" + _END_;
		window.ipcMain.logToMain(log_msg);
		this.closeDialog();
	} // onCancel()
	
	clearFields() {
		// HtmlUtils.SetElementValue( PASSPHRASE_DIALOG_INPUT_ID, '');
	} // clearFields()
	
	isDisplayed() {
		return this.displayed;
	} // isDisplayed()	
	
	addEventHandler( elt_id, evt_name, evt_handler ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.addEventListener( evt_name, evt_handler );
		}
	} // addEventHandler()
	
	is_not_null( in_str ) {
		if (  in_str != undefined  && in_str != 'undefined'  &&  in_str != ""  &&  in_str != ''   ) {
			return true;			
		}
		return false;
	} // is_not_null()
} // Bip85Dialog class 	

Bip85Dialog.This.initialize();