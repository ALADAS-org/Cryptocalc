// ======================================================================================================================
// ========================================   bip38_encrypt_decrypt_dialog.js   =========================================
// ======================================================================================================================
"use strict";

const BIP38_DIALOG_PK_DATA_LABEL_ID          = "bip38_dialog_pk_data_label_id";
const BIP38_DIALOG_PK_DATA_ID                = "bip38_dialog_pk_data_id";
const BIP38_DIALOG_PK_DATA_COPY_BTN_ID       = "bip38_dialog_pk_data_copy_btn_id";

const BIP38_DIALOG_PASSPHRASE_LABEL_ID       = "bip38_dialog_passphrase_label_id";
const BIP38_DIALOG_PASSPHRASE_ID             = "bip38_dialog_passphrase_id";
const BIP38_DIALOG_PASSPHRASE_COPY_BTN_ID    = "bip38_dialog_passphrase_copy_btn_id";

const BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID   = "bip38_dialog_compute_progress_btn_id";
const BIP38_DIALOG_COMPUTE_PROGRESS_BAR_ID   = "bip38_dialog_compute_progress_bar_id";
const BIP38_DIALOG_COMPUTE_PROGRESS_VALUE_ID = "bip38_dialog_compute_progress_value_id";

const BIP38_DIALOG_ENCRYPT_DECRYPT_TOGGLE_ID = "bip38_dialog_encrypt_decrypt_toggle_id";

const BIP38_DIALOG_RESULT_LABEL_ID           = "bip38_dialog_result_label_id";
const BIP38_DIALOG_RESULT_ID                 = "bip38_dialog_result_id";
const BIP38_DIALOG_RESULT_COPY_BTN_ID        = "bip38_dialog_result_copy_btn_id";

const BIP38_DIALOG_CLEAR_BTN_ID              = "bip38_dialog_clear_btn_id";
const BIP38_DIALOG_QUIT_BTN_ID               = "bip38_dialog_quit_btn_id";

class Bip38EncryptDecryptDialog {
	static #Key           = Symbol();
	static #Singleton     = new Bip38EncryptDecryptDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if( Bip38EncryptDecryptDialog.#Singleton == undefined ) {
			Bip38EncryptDecryptDialog.#Singleton = new Bip38EncryptDecryptDialog( this.#Key );
			if ( Bip38EncryptDecryptDialog.#Singleton > 0 ) {
				throw new TypeError("'Bip38EncryptDecryptDialog' constructor called more than once");
			}
			Bip38EncryptDecryptDialog.#InstanceCount++;
        }
        return Bip38EncryptDecryptDialog.#Singleton;
    } // Bip38EncryptDecryptDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new Bip38EncryptDecryptDialog");
		if ( key !== Bip38EncryptDecryptDialog.#Key ) {
			throw new TypeError("'Bip38EncryptDecryptDialog' constructor is private");
		}
	
	    this.displayed    = false;
		this.encrypt_mode = true; 
	} // ** Private constructor **
	
	initialize() {
		// console.log(">> Bip38EncryptDecryptDialog.initialize");
		
		$("#" + BIP38_ENCRYPT_DECRYPT_DIALOG_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 			true,
				resizable:      false,
				autoOpen: 		false, 
				dialogClass: 	'DialogBox',
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				
				width:   610, // 700,
				
				open:   function( event, ui ) {	
							let this_obj = Bip38EncryptDecryptDialog.This;
							
							this_obj.addEventHandler
								( BIP38_DIALOG_ENCRYPT_DECRYPT_TOGGLE_ID, 'click', 
								  () => { Bip38EncryptDecryptDialog.This.toggleEncryptDecrypt(); } );								
						
							this_obj.addEventHandler
								( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.compute(); } );		
								  								  
							this_obj.addEventHandler
								( BIP38_DIALOG_PK_DATA_COPY_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.onCopyField(BIP38_DIALOG_PK_DATA_ID); } );
								  
							this_obj.addEventHandler
								( BIP38_DIALOG_PASSPHRASE_COPY_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.onCopyField(BIP38_DIALOG_PASSPHRASE_ID); } );
								  
							this_obj.addEventHandler
								( BIP38_DIALOG_RESULT_COPY_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.onCopyField(BIP38_DIALOG_RESULT_ID); } );

							this_obj.addEventHandler
								( BIP38_DIALOG_CLEAR_BTN_ID, 'click', 
								  () => { Bip38EncryptDecryptDialog.This.onClearFields(); } );						  

							this_obj.addEventHandler
								( BIP38_DIALOG_QUIT_BTN_ID, 'click', 
								  () => { Bip38EncryptDecryptDialog.This.closeDialog(); } );

							this_obj.setFields4EncryptMode();
							
                            this_obj.displayed = true;							
						}, // open()
						
				close:  function( event, ui ) {	
							let this_obj = Bip38EncryptDecryptDialog.This;
							
							this_obj.removeEventHandler
								( BIP38_DIALOG_ENCRYPT_DECRYPT_TOGGLE_ID, 'click', 
								  () => { Bip38EncryptDecryptDialog.This.toggleEncryptDecrypt(); } );
							
							this_obj.removeEventHandler
								( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.compute(); } );
								  
							this_obj.removeEventHandler
								( BIP38_DIALOG_PK_DATA_COPY_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.onCopyField(); } );
								  
							this_obj.removeEventHandler
								( BIP38_DIALOG_PASSPHRASE_COPY_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.onCopyField(); } );
								  
							this_obj.removeEventHandler
								( BIP38_DIALOG_RESULT_COPY_BTN_ID, 'click', 
								  async () => { await Bip38EncryptDecryptDialog.This.onCopyField(); } );								  

							this_obj.removeEventHandler
								( BIP38_DIALOG_CLEAR_BTN_ID, 'click', 
								  () => { Bip38EncryptDecryptDialog.This.onClearFields(); } );						  

							this_obj.removeEventHandler
								( BIP38_DIALOG_QUIT_BTN_ID, 'click', 
								  () => { Bip38EncryptDecryptDialog.This.closeDialog(); } );

							this_obj.displayed = false;								  
						} // close()
			} // -------------------- JQuery Dialog options		
		).parent().css('z-index', 900);
	} // initialize()
	
	showDialog() {
		trace2Main( pretty_func_header_format( "Bip38EncryptDecryptDialog.showDialog" ) );
		
		let dialog_id  = BIP38_ENCRYPT_DECRYPT_DIALOG_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_elt != undefined ) {			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let dialog_obj = $("#" + dialog_id);			
			dialog_obj.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (Bip38EncryptDecryptDialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	closeDialog() {
		let dialog_obj = $("#" + BIP38_ENCRYPT_DECRYPT_DIALOG_ID);
		dialog_obj.dialog('close');
	} // closeDialog()
	
	isDisplayed() {
		return this.displayed;
	} // isDisplayed()	
	
	toggleEncryptDecrypt() {
		let log_msg = ">> " + _CYAN_ + "Bip38EncryptDecryptDialog.toggleEncryptDecrypt" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log("    BEFORE this.encrypt_mode: " + this.encrypt_mode);
		this.encrypt_mode = ! this.encrypt_mode;
		
		HtmlUtils.SetElementValue( BIP38_DIALOG_PK_DATA_ID,    '' );
		HtmlUtils.SetElementValue( BIP38_DIALOG_PASSPHRASE_ID, '' );
		HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_ID,     '' );
		
		if ( this.encrypt_mode ) {
			// --------------- 'Encrypt' mode ---------------			
			HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID,      'EncryptButton' );
			HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID,   'DecryptButton' );
			
			HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_VALUE_ID,    'EncryptColor' );
			HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_VALUE_ID, 'DecryptColor' );
			//
			HtmlUtils.SetElementValue( BIP38_DIALOG_PK_DATA_LABEL_ID,      'Private Key' );								
			HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_LABEL_ID,       'Bip38 Encrypted PK' );			
		}   // --------------- 'Encrypt' mode
		else {
			// --------------- 'Decrypt' mode ---------------			
			HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID,      'DecryptButton' );
			HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID,   'EncryptButton' );
			
			HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_VALUE_ID,    'DecryptColor' );
			HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_VALUE_ID, 'EncryptColor' );

			HtmlUtils.SetElementValue( BIP38_DIALOG_PK_DATA_LABEL_ID,      'Bip38 Encrypted PK' );
			HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_LABEL_ID,       'Private Key' );
		}   // --------------- 'Decrypt' mode
	} // toggleEncryptDecryptMode()
	
	async updateProgressbar( result_str ) {
		// let log_msg = ">> " + _CYAN_ + "Bip38EncryptDecryptDialog.updateProgressbar" + _END_;
		// window.ipcMain.logToMain(log_msg);
		
		let percent = parseFloat(result_str);
		await this.setButtonProgress( percent );
	} // async updateProgressbar()
	
	async setButtonProgress( percent) {
		const MAX_WIDTH = 130;
		
		const progress_bar_elt   = HtmlUtils.GetElement(BIP38_DIALOG_COMPUTE_PROGRESS_BAR_ID);
		const progress_value_elt = HtmlUtils.GetElement(BIP38_DIALOG_COMPUTE_PROGRESS_VALUE_ID);			

        let percent_int = Math.floor(percent);		

		if ( percent >= 0 && percent < 99 ) {
			HtmlUtils.ShowElement( BIP38_DIALOG_COMPUTE_PROGRESS_BAR_ID );
			HtmlUtils.HideElement( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID );			
		
			HtmlUtils.ShowElement( BIP38_DIALOG_COMPUTE_PROGRESS_BAR_ID );			
			HtmlUtils.HideElement( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID );			
			
			progress_bar_elt.setAttribute( 'data-label', percent_int + "% complete" );
			progress_value_elt.style.width = percent_int + '%';
		}
		else if ( percent >= 99 ) {
			HtmlUtils.ShowElement( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID  );		
			HtmlUtils.HideElement( BIP38_DIALOG_COMPUTE_PROGRESS_BAR_ID  );
			progress_value_elt.style.width = '100%';	
		}
	} // async setButtonProgress()
	
	ifComputeError( result_str ) {
		if ( result_str == ERROR_RETURN_VALUE ) {
			HtmlUtils.SetElementValue( BIP38_DIALOG_PK_DATA_ID,    '' );
			HtmlUtils.SetElementValue( BIP38_DIALOG_PASSPHRASE_ID, '' );
			HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_ID,     '' );
			return true;
		}
		return false;
	} // ifComputeError()
	
	async compute() {
		let log_msg = ">> " + _CYAN_ + "Bip38EncryptDecryptDialog.compute" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let pk_data    = HtmlUtils.GetElementValue( BIP38_DIALOG_PK_DATA_ID );
		// console.log("   pk_data: " + pk_data);
		
		let passphrase = HtmlUtils.GetElementValue( BIP38_DIALOG_PASSPHRASE_ID );
		// console.log("   passphrase: " + passphrase);
		
		HtmlUtils.SetElementValue( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'Computing...' );
		
		if ( this.encrypt_mode ) {
			// --------------- 'Encrypt' mode ---------------
			if ( this.is_not_null(pk_data)  &&  this.is_not_null(passphrase) ) {
				HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'EncryptButton' );
				
				let private_key = pk_data;	
				const data = { private_key, passphrase };				
				let bip38_encrypted_pk = await window.ipcMain.Bip38Encrypt( data );
				if ( ! this.ifComputeError( bip38_encrypted_pk ) ) {
					HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_ID, bip38_encrypted_pk );
				}
				HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'EncryptButton' );				
			}
		}   // --------------- 'Encrypt' mode
		else {
			// --------------- 'Decrypt' mode ---------------			
			if ( this.is_not_null(pk_data)  &&  this.is_not_null(passphrase) ) {
				HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'DecryptButton' );
				
				let bip38_encrypted_pk = pk_data;				
				const data = { bip38_encrypted_pk, passphrase };				
				let private_key = await window.ipcMain.Bip38Decrypt( data );
				if ( ! this.ifComputeError( private_key ) ) {
					HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_ID, private_key );
				}	
				HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'DecryptButton' );					
			}
		}   // --------------- 'Decrypt' mode		
	
		HtmlUtils.SetElementValue( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'Compute' );
	} // compute()	
	
	onCopyField( elt_id ) {
		let log_msg = ">> " + _CYAN_ + "Bip38EncryptDecryptDialog.onCopyField" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log("   elt_id: " + elt_id);
		
		let copy_text = HtmlUtils.GetElementValue( elt_id );
		// console.log("   copy_text: " + copy_text);
		
		if ( copy_text == "") {
			return; 
		}
		
		switch ( elt_id ) {
			case BIP38_DIALOG_PK_DATA_ID: 
				if ( this.encrypt_mode ) {
					GuiUtils.ShowQuestionDialog
						( "'Private Key' copied in Clipboard", { "CloseButtonLabel": "OK" } );
				}
				else {
					GuiUtils.ShowQuestionDialog
						( "'Bip38 Encrypted PK' copied in Clipboard", { "CloseButtonLabel": "OK" } );
				} 
				break;

			case BIP38_DIALOG_PASSPHRASE_ID: 
				GuiUtils.ShowQuestionDialog
					( "'Passphrase' copied in Clipboard", { "CloseButtonLabel": "OK" } );
				break;			
				
			case BIP38_DIALOG_RESULT_ID: 
				GuiUtils.ShowQuestionDialog
					( "'Result' copied in Clipboard", { "CloseButtonLabel": "OK" } );
				break;
		}
		
		if ( copy_text != "" ) {
			navigator.clipboard.writeText( copy_text );
		}
	} // onCopyField()
	
	setFields4EncryptMode() {
		// console.log(">> Bip38EncryptDecryptDialog.onClearFields");
		this.encrypt_mode = true; 
		
		HtmlUtils.SetElementValue( BIP38_DIALOG_PK_DATA_ID,    '' );
		HtmlUtils.SetElementValue( BIP38_DIALOG_PASSPHRASE_ID, '' );
		HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_ID,     '' );
		
		HtmlUtils.ShowElement( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID  );
		HtmlUtils.SetElementValue( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID, 'Compute' );
		
		HtmlUtils.AddClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID,        'EncryptButton' );
		HtmlUtils.RemoveClass( BIP38_DIALOG_COMPUTE_PROGRESS_BTN_ID,     'DecryptButton' );
		
		HtmlUtils.HideElement( BIP38_DIALOG_COMPUTE_PROGRESS_BAR_ID  );
		
		HtmlUtils.GetElement( BIP38_DIALOG_ENCRYPT_DECRYPT_TOGGLE_ID).checked = false;
	} // setFields4EncryptMode()
	
	onClearFields() {
		// console.log(">> Bip38EncryptDecryptDialog.onClearFields");
		HtmlUtils.SetElementValue( BIP38_DIALOG_PK_DATA_ID,    '' );
		HtmlUtils.SetElementValue( BIP38_DIALOG_PASSPHRASE_ID, '' );
		HtmlUtils.SetElementValue( BIP38_DIALOG_RESULT_ID,     '' );
		
		this.setFields4EncryptMode();
	} // onClearFields()
	
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
} // Bip38EncryptDecryptDialog class 	

Bip38EncryptDecryptDialog.This.initialize();