// ======================================================================================================================
// ===========================================   bip38_progressbar_dialog.js   ==========================================
// ======================================================================================================================
"use strict";

const BIP38_DIALOG_PROGRESS_BAR_ID   = "bip38_dialog_progress_bar_id";
const BIP38_DIALOG_PROGRESS_VALUE_ID = "bip38_dialog_progress_value_id";

class Bip38ProgressbarDialog {
	static #Key           = Symbol();
	static #Singleton     = new Bip38ProgressbarDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if( Bip38ProgressbarDialog.#Singleton == undefined ) {
			Bip38ProgressbarDialog.#Singleton = new Bip38ProgressbarDialog( this.#Key );
			if ( Bip38ProgressbarDialog.#Singleton > 0 ) {
				throw new TypeError("'Bip38ProgressbarDialog' constructor called more than once");
			}
			Bip38ProgressbarDialog.#InstanceCount++;
        }
        return Bip38ProgressbarDialog.#Singleton;
    } // Bip38ProgressbarDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new Bip38ProgressbarDialog");
		if ( key !== Bip38ProgressbarDialog.#Key ) {
			throw new TypeError("'Bip38ProgressbarDialog' constructor is private");
		}	
		this.displayed = false;
	} // ** Private constructor **
	
	initialize() {
		// console.log(">> Bip38ProgressbarDialog.initialize");
		
		$("#" + BIP38_PROGRESS_BAR_DIALOG_ID).dialog
		(   { // -------------------- JQuery Dialog options --------------------
				modal: 		 true,
				resizable:   false,
				autoOpen: 	 false, 
				dialogClass: 'PB_DialogBox',
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				
				width:  400,
				height: 95,
				
				open:   function( event, ui ) { }, // open()						
				close:  function( event, ui ) { }  // close()
			} // -------------------- JQuery Dialog options		
		).parent().css('z-index', 900);
	} // initialize()
	
	showDialog() {
		trace2Main( pretty_func_header_format( "Bip38ProgressbarDialog.showDialog" ) );
		
		let dialog_id  = BIP38_PROGRESS_BAR_DIALOG_ID;
		let dialog_elt = document.getElementById( dialog_id );		
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_elt != undefined ) {			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let dialog_obj = $("#" + dialog_id);
            this.displayed = true;			
			dialog_obj.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (Bip38ProgressbarDialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	closeDialog() {
		let dialog_obj = $("#" + BIP38_PROGRESS_BAR_DIALOG_ID);
		this.displayed = false; 
		dialog_obj.dialog('close');
	} // closeDialog()	
	
	isDisplayed() {
		return this.displayed;
	} // isDisplayed()	
	
	async updateProgressbar( result_str ) {
		// let log_msg = ">> " + _CYAN_ + "Bip38ProgressbarDialog.updateProgressbar  " + result_str + "%" + _END_;
		// window.ipcMain.logToMain(log_msg);
		
		let percent = parseFloat(result_str);
		await this.setProgressBarValue( percent );
	} // async updateProgressbar()
	
	async setProgressBarValue( percent ) {
		// let log_msg = ">> " + _CYAN_ + "Bip38ProgressbarDialog.setProgressBarValue  " + percent + "%" + _END_;
		// window.ipcMain.logToMain(log_msg);
		
		const progress_bar_elt   = HtmlUtils.GetElement(BIP38_DIALOG_PROGRESS_BAR_ID);
		const progress_value_elt = HtmlUtils.GetElement(BIP38_DIALOG_PROGRESS_VALUE_ID);			

        let percent_int = Math.floor(percent);		

		if ( percent >= 0 && percent < 99 ) {		
			progress_bar_elt.setAttribute( 'data-label', percent_int + "% complete" );
			progress_value_elt.style.width = percent_int + '%';
		}
		else if ( percent >= 99 ) {
			this.closeDialog();
		}
	} // async setProgressBarValue()
} // Bip38ProgressbarDialog class 	

Bip38ProgressbarDialog.This.initialize();