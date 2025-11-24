// =======================================================================================================================
// ====================================     secret_phrase_translator_dialog.js     =======================================
// =======================================================================================================================
"use strict";

const TRANSLATOR_DIALOG_LABEL_ID               = "translator_dialog_label_id";

const TRANSLATOR_DIALOG_INPUT_ID               = "translator_input_id";
const TRANSLATOR_DIALOG_COPY_INPUT_BTN_ID      = "translator_copy_input_btn_id";

const TRANSLATOR_DIALOG_INPUT_LANG_SELECT_ID   = "translator_input_lang_select_id";

const TRANSLATOR_DIALOG_OUTPUT_LANG_SELECT_ID  = "translator_output_lang_select_id";
const TRANSLATOR_DIALOG_WORD_COUNT_SELECT_ID   = "translator_word_count_select_id";

const TRANSLATOR_DIALOG_TRANSLATE_BTN_ID       = "translator_translate_btn_id";
const TRANSLATOR_DIALOG_ERROR_MSG_ID           = "translator_error_msg_id";

const TRANSLATOR_DIALOG_TRANSLATED_ID          = "translator_translated_id";
const TRANSLATOR_DIALOG_COPY_TRANSLATED_BTN_ID = "translator_copy_translated_btn_id";

const TRANSLATOR_DIALOG_CLEAR_BTN_ID           = "translator_dialog_clear_btn_id";
const TRANSLATOR_DIALOG_QUIT_BTN_ID            = "translator_dialog_quit_btn_id";

class SecretPhraseTranslatorDialog {
	static #Key           = Symbol();
	static #Singleton     = new SecretPhraseTranslatorDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( SecretPhraseTranslatorDialog.#Singleton == undefined ) {
			SecretPhraseTranslatorDialog.#Singleton = new SecretPhraseTranslatorDialog( this.#Key );
			if ( Bip38EncryptDecryptDialog.#Singleton > 0 ) {
				throw new TypeError("'SecretPhraseTranslatorDialog' constructor called more than once");
			}
			SecretPhraseTranslatorDialog.#InstanceCount++;
        }
        return SecretPhraseTranslatorDialog.#Singleton;
    } // SecretPhraseTranslatorDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new SecretPhraseTranslatorDialog");
		if ( key !== SecretPhraseTranslatorDialog.#Key ) {
			throw new TypeError("'SecretPhraseTranslatorDialog' constructor is private");
		}
	
	    this.displayed    = false;
		this.encrypt_mode = true; 
	} // ** Private constructor **
	
	initialize() {
		// console.log(">> SecretPhraseTranslatorDialog.initialize");
		
		$("#" + SECRET_PHRASE_TRANSLATOR_DIALOG_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 			true,
				resizable:      false,
				autoOpen: 		false, 
				dialogClass: 	'DialogBox',
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				
				width:   670, // 680
				
				open:   function( event, ui ) {	
							let this_obj = SecretPhraseTranslatorDialog.This;
	
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_TRANSLATE_BTN_ID, 'click', 
								  async ( evt ) => { await SecretPhraseTranslatorDialog.This.onTranslateText( evt ); } );						
							
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_INPUT_ID, 'paste', 
								  async ( evt ) => { await SecretPhraseTranslatorDialog.This.onPasteText( evt ); } );
							
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_OUTPUT_LANG_SELECT_ID, 'change', 
								  async ( evt ) => { await SecretPhraseTranslatorDialog.This.onChangeOutputLang( evt ); } );		  
				
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_COPY_INPUT_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onCopyField(TRANSLATOR_DIALOG_INPUT_ID); } );	
								  
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_COPY_TRANSLATED_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onCopyField(TRANSLATOR_DIALOG_TRANSLATED_ID); } );	
							
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_CLEAR_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onClearFields(); } );	
								  
							this_obj.addEventHandler
								( TRANSLATOR_DIALOG_QUIT_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onQuit(); } );								  
				
				            this_obj.clearFields();
                            this_obj.displayed = true;							
						}, // open()
						
				close:  function( event, ui ) {	
							let this_obj = SecretPhraseTranslatorDialog.This;
							
							this_obj.removeEventHandler
								( TRANSLATOR_DIALOG_TRANSLATE_BTN_ID, 'click', 
								  async ( evt ) => { await SecretPhraseTranslatorDialog.This.onTranslateText( evt ); } );
							
							this_obj.removeEventHandler 
                                ( TRANSLATOR_DIALOG_INPUT_ID, 'paste',							
								  async (evt) => { if (this.cb_enabled) await SecretPhraseTranslatorDialog.This.onPasteText(evt); } );	
								  
							this_obj.removeEventHandler
								( TRANSLATOR_DIALOG_OUTPUT_LANG_SELECT_ID, 'change', 
								  async ( evt ) => { await SecretPhraseTranslatorDialog.This.onChangeOutputLang( evt ); } );
							
							this_obj.removeEventHandler
								( TRANSLATOR_DIALOG_COPY_INPUT_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onCopyField(TRANSLATOR_DIALOG_INPUT_ID); } );	
								  
							this_obj.removeEventHandler
								( TRANSLATOR_DIALOG_COPY_TRANSLATED_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onCopyField(TRANSLATOR_DIALOG_TRANSLATED_ID); } );
							
							this_obj.removeEventHandler
								( TRANSLATOR_DIALOG_CLEAR_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onClearFields(); } );	
								  
							this_obj.removeEventHandler
								( TRANSLATOR_DIALOG_QUIT_BTN_ID, 'click', 
								  () => { SecretPhraseTranslatorDialog.This.onQuit(); } );		

							this_obj.displayed = false;								  
						} // close()
			} // -------------------- JQuery Dialog options		
		).parent().css('z-index', 900);
	} // initialize()
	
	showDialog() {
		trace2Main( pretty_func_header_format( "SecretPhraseTranslatorDialog.showDialog" ) );
		
		let dialog_id  = SECRET_PHRASE_TRANSLATOR_DIALOG_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_elt != undefined ) {			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let dialog_obj = $("#" + dialog_id);			
			dialog_obj.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (SecretPhraseTranslatorDialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	closeDialog() {
		let dialog_obj = $("#" + SECRET_PHRASE_TRANSLATOR_DIALOG_ID);
		this.clearFields();
		dialog_obj.dialog('close');
	} // closeDialog()
	
	async onTranslateText( evt ) {  
		let log_msg = ">> " + _CYAN_ + "SecretPhraseTranslatorDialog.onTranslateText" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		let output_lang = HtmlUtils.GetElementValue( TRANSLATOR_DIALOG_OUTPUT_LANG_SELECT_ID );
		// console.log("   output_lang: " + output_lang);
		
		let input_mnemonics = HtmlUtils.GetElementValue( TRANSLATOR_DIALOG_INPUT_ID ); 
		input_mnemonics = input_mnemonics.trim();
		
		if ( input_mnemonics == '' ) {
			let error_msg = "*Error*: Empty Input";
			HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_ERROR_MSG_ID, error_msg );
			return;
		}
		
		// console.log("   input_mnemonics: " + input_mnemonics);
		let words = input_mnemonics.split(' ');
		if ( ! ( words.length == 12 || words.length == 15 || words.length == 18 || words.length == 21 || words.length == 24 ) ) {
			let error_msg = "*Error*: Invalid mnemonics count: " + words.length;
			HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_ERROR_MSG_ID, error_msg );
			return;
		}
		
		let lang                     = "";
		let input_lang               = "";
		let	mnemonics                = [];
		let data                     = {};
		let word_indexes             = [];
		let translated_secret_phrase = "";
		
		input_lang = HtmlUtils.GetElementValue( TRANSLATOR_DIALOG_INPUT_LANG_SELECT_ID );	

		if ( input_lang == output_lang ) {
			translated_secret_phrase = input_mnemonics;
			HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_TRANSLATED_ID, translated_secret_phrase );
			return;
		}		

		if ( input_lang == WORDLIST_WORD_INDEXES ) {
			lang         = output_lang;	
			word_indexes = words;				
			data = { word_indexes, lang };
			translated_secret_phrase = await window.ipcMain.WordIndexesToMnemonics( data );
			HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_TRANSLATED_ID, translated_secret_phrase );
		}	
		else if ( output_lang == WORDLIST_WORD_INDEXES ) {
            let options = { [LANG]: input_lang };			
			mnemonics = words.join(' ');				
			data = { mnemonics, options };
			let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
			let translated_secret_phrase = word_indexes.join(' ');
			HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_TRANSLATED_ID, translated_secret_phrase );
		}			
		else { 
			lang      = input_lang;
  	        mnemonics = input_mnemonics;			
	  		data = { mnemonics, lang };
			let entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );
			
			let entropy = entropy_info[ENTROPY_HEX];
			if ( entropy.indexOf('00undefined') != -1 ) {
				let error_msg = "*Error*: Unknown Wordlist";
				HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_ERROR_MSG_ID, error_msg );
				HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_INPUT_LANG_SELECT_ID,  'UNKNOWN' );			
				return;
			}
			// console.log("   entropy: " + JSON.stringify(entropy));
			
			await this.updateTranslatedMnemonics( entropy, output_lang ); 
		}
	} // async onTranslateText()
	
	async onChangeOutputLang( evt ) {
		let log_msg = ">> " + _CYAN_ + "SecretPhraseTranslatorDialog.onChangeOutputLang" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		await this.onTranslateText( evt );
	} // async onChangeOutputLang()
	
	async updateTranslatedMnemonics( entropy, output_lang ) {
		let log_msg = ">> " + _CYAN_ + "SecretPhraseTranslatorDialog.updateTranslatedMnemonics" + _END_;
		window.ipcMain.logToMain(log_msg);

        let lang = output_lang;
		let data = { entropy, lang };
		let mnemonics = await window.ipcMain.EntropyToMnemonics( data );
		
		let translated_secret_phrase = mnemonics; 
		if ( output_lang == 'JP' ) {
			translated_secret_phrase = translated_secret_phrase.replaceAll(' ', '\u3000');
		}
		
		// console.log("   translated_secret_phrase: " + translated_secret_phrase);		

		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_TRANSLATED_ID, translated_secret_phrase );
    } // async updateTranslatedMnemonics()
	
	onQuit() {
		let log_msg = ">> " + _CYAN_ + "SecretPhraseTranslatorDialog.onQuit" + _END_;
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
			HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_ERROR_MSG_ID, error_msg );
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
		
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_INPUT_ID,             paste_text );
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_INPUT_LANG_SELECT_ID, paste_lang );
	} // async onPasteText()
	
	onCopyField( elt_id ) {
		let log_msg = ">> " + _CYAN_ + "SecretPhraseTranslatorDialog.onCopyField" + _END_;
		window.ipcMain.logToMain(log_msg);
		
		// console.log("   elt_id: " + elt_id);		
		let copy_text = HtmlUtils.GetElementValue( elt_id );
		// console.log("   copy_text: " + copy_text);
		
		if ( copy_text == "") {
			return; 
		}
		
		// switch ( elt_id ) {
		// 	case BIP38_DIALOG_PK_DATA_ID: 
		// 		break;
		// }
		
		if ( copy_text != "" ) {
			navigator.clipboard.writeText( copy_text );
		}
	} // onCopyField()
	
	onClearFields() {
		// console.log(">> SecretPhraseTranslatorDialog.onClearFields");
		this.clearFields();
	} // onClearFields()
	
	clearFields() {
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_INPUT_ID,      '' );
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_TRANSLATED_ID, '' );
		
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_INPUT_LANG_SELECT_ID,  'EN' );
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_OUTPUT_LANG_SELECT_ID, 'EN' );
		
		HtmlUtils.SetElementValue( TRANSLATOR_DIALOG_ERROR_MSG_ID, '' );
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
} // SecretPhraseTranslatorDialog class 	

SecretPhraseTranslatorDialog.This.initialize();