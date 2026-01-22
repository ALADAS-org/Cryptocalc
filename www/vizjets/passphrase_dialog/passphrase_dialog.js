// ========================================================================================================================
// ====================================             passphrase_dialog.js            =======================================
// ========================================================================================================================
"use strict";

const PASSPHRASE_DIALOG_INPUT_ID                     = "passphrase_input_id";
const BIP39_MAIN_WINDOW_PASSPHRASE_ID                = "bip32_passphrase_id";

const PASSPHRASE_DIALOG_EYE_PASSPHRASE_BTN_ID        = "passphrase_eye_btn_id";
const PASSPHRASE_DIALOG_EYE_PASSPHRASE_IMG_ID        = "passphrase_eye_btn_img_id";

const PASSPHRASE_DIALOG_REGENERATE_PASSPHRASE_BTN_ID = "generate_passphrase_btn_id";
const PASSPHRASE_DIALOG_CLEAR_PASSPHRASE_BTN_ID      = "clear_passphrase_btn_id";

const PASSPHRASE_DIALOG_APPLY_BTN_ID                 = "passphrase_dialog_apply_btn_id";
const PASSPHRASE_DIALOG_CANCEL_BTN_ID                = "passphrase_dialog_cancel_btn_id";

class PassphraseDialog {
	static #Key           = Symbol();
	static #Singleton     = new PassphraseDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( PassphraseDialog.#Singleton == undefined ) {
			PassphraseDialog.#Singleton = new PassphraseDialog( this.#Key );
			if ( Bip38EncryptDecryptDialog.#Singleton > 0 ) {
				throw new TypeError("'PassphraseDialog' constructor called more than once");
			}
			PassphraseDialog.#InstanceCount++;
        }
        return PassphraseDialog.#Singleton;
    } // PassphraseDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new PassphraseDialog");
		if ( key !== PassphraseDialog.#Key ) {
			throw new TypeError("'PassphraseDialog' constructor is private");
		}	

	    this.event_handlers_attached = false;
	    this.displayed               = false;
		this.passphrase_visible      = false;
	} // ** Private constructor **
	
	initialize() {
		// console.log(">> PassphraseDialog.initialize");
		
		$("#" + PASSPHRASE_DIALOG_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 			true,
				resizable:      false,
				autoOpen: 		false, 
				dialogClass: 	'DialogBox',
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				
				width:   590, // 680
				height:  130,
				
				open:   function( event, ui ) {					
							let this_obj = PassphraseDialog.This;						
							
							if ( ! this_obj.event_handlers_attached ) {
								//this_obj.addEventHandler
								//	( PASSPHRASE_DIALOG_REGENERATE_PASSPHRASE_IMG_ID, 'click', 
								//	  async() => { await PassphraseDialog.This.onRegeneratePassphrase(); } );	  
								this_obj.addEventHandler
									( PASSPHRASE_DIALOG_EYE_PASSPHRASE_BTN_ID, 'click', 
									  () => { PassphraseDialog.This.onTogglePassphraseVisibility(); } );
									  
								this_obj.addEventHandler
									( PASSPHRASE_DIALOG_REGENERATE_PASSPHRASE_BTN_ID, 'click', 
									  async() => { await PassphraseDialog.This.onRegeneratePassphrase(); } );
									  
								this_obj.addEventHandler
									( PASSPHRASE_DIALOG_CLEAR_PASSPHRASE_BTN_ID, 'click', 
									  async() => { await PassphraseDialog.This.onClearPassphrase(); } );	
							
								this_obj.addEventHandler
									( PASSPHRASE_DIALOG_APPLY_BTN_ID, 'click', 
									  () => { PassphraseDialog.This.onApply(); } );	
									  
								this_obj.addEventHandler
									( PASSPHRASE_DIALOG_CANCEL_BTN_ID, 'click', 
									  () => { PassphraseDialog.This.onCancel(); } );

								this_obj.event_handlers_attached = true;									  
							}
							
							let passphrase_value = HtmlUtils.GetElementValue( BIP39_MAIN_WINDOW_PASSPHRASE_ID );
							HtmlUtils.SetElementValue( PASSPHRASE_DIALOG_INPUT_ID, passphrase_value );
							
                            this_obj.displayed = true;							
						}, // open()
						
				close:  function( event, ui ) {	
							let this_obj = PassphraseDialog.This;
							this_obj.displayed = false;								  
						} // close()
			} // -------------------- JQuery Dialog options		
		).parent().css('z-index', 900);
	} // initialize()
	
	showDialog( passphrase_type) {
		trace2Main( pretty_func_header_format( "PassphraseDialog.showDialog" ) );
		
		passphrase_type = ( passphrase_type != undefined ) ? passphrase_type : BIP39_PASSPHRASE_TYPE;
		
		let dialog_id  = PASSPHRASE_DIALOG_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_elt != undefined ) {			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let dialog_obj = $("#" + dialog_id);			
			dialog_obj.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (PassphraseDialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	closeDialog() {
		let dialog_obj = $("#" + PASSPHRASE_DIALOG_ID);
		this.clearFields();
		dialog_obj.dialog('close');
	} // closeDialog()
	
	onTogglePassphraseVisibility() {
		let log_msg = ">> " + _CYAN_ + "PassphraseDialog.onTogglePassphraseVisibility" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let eye_btn_img_elt = document.getElementById( PASSPHRASE_DIALOG_EYE_PASSPHRASE_IMG_ID )
		// console.log("> eye_btn_img_elt: " + eye_btn_img_elt);
		
		if ( this.passphrase_visible ) { 
			document.getElementById( PASSPHRASE_DIALOG_INPUT_ID ).type = 'password';	
			
			if (eye_btn_img_elt != undefined) {
				eye_btn_img_elt.src = 'icons/' + EYE_CLOSED_ICON;	
			}
		}
		else { 	
		    document.getElementById(PASSPHRASE_DIALOG_INPUT_ID).type = 'text';	

			if (eye_btn_img_elt != undefined) {
				eye_btn_img_elt.src = 'icons/' + EYE_OPEN_ICON;	
			}			
		}
		this.passphrase_visible = ! this.passphrase_visible;
	} // onTogglePassphraseVisibility()
	
	async onRegeneratePassphrase() {
		let log_msg = ">> " + _CYAN_ + "PassphraseDialog.onRegeneratePassphrase" + _END_;	
        window.ipcMain.logToMain(log_msg);		
		let data = {};
		let bip39_passphrase = await window.ipcMain.GeneratePassword( data );
		HtmlUtils.SetElementValue( PASSPHRASE_DIALOG_INPUT_ID, bip39_passphrase );
		
		this.updatePassphraseStrength();
	} // async onRegeneratePassphrase()
	
	async onClearPassphrase() {
		let log_msg = ">> " + _CYAN_ + "PassphraseDialog.onClearPassphrase" + _END_;
		window.ipcMain.logToMain(log_msg);
		this.clearFields();
	} // async onClearPassphrase()
	
	updatePassphraseStrength() {
		let log_msg = ">> " + _CYAN_ + "PassphraseDialog.updatePassphraseStrength" + _END_;
		window.ipcMain.logToMain(log_msg);
	} // updatePassphraseStrength()	
	
	async onApply() {
		let log_msg = ">> " + _CYAN_ + "PassphraseDialog.onApply" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let passphrase_value = HtmlUtils.GetElementValue( PASSPHRASE_DIALOG_INPUT_ID );
		HtmlUtils.SetElementValue( BIP39_MAIN_WINDOW_PASSPHRASE_ID, passphrase_value );
		
		await MainGUI.This.GuiApplyPassword();
		
		await MainGUI.This.updatePassphraseStrength( BIP39_MAIN_WINDOW_PASSPHRASE_ID );
		
		this.closeDialog();
	} // onApply()
	
	onCancel() {
		let log_msg = ">> " + _CYAN_ + "PassphraseDialog.onQuit" + _END_;
		window.ipcMain.logToMain(log_msg);
		this.closeDialog();
	} // onCancel()
	
	clearFields() {
		HtmlUtils.SetElementValue( PASSPHRASE_DIALOG_INPUT_ID, '');
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
} // PassphraseDialog class 	

PassphraseDialog.This.initialize();