// =====================================================================================
// ============================   tools_options_dialog.js   ============================
// =====================================================================================
"use strict";

class ToolsOptionsDialog {
	static Initialize() {
		$("#" + TOOLS_OPTIONS_DIALOG_ID).dialog
		(   { 	
				autoOpen: 		false, 
				dialogClass: 	'DialogBox', 
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				width:  440,
				open:   function( event, ui ) {
							//========== Add evt handler to "Convert" button ==========
							let convert_button_elt = document.getElementById(CONVERT_MNEMONICS_BUTTON_ID);
							if (convert_button_elt != undefined) {
								convert_button_elt.addEventListener
									('click', ToolsOptionsDialog.ConvertMnemonics);
								//console.log(">> mnemonicsToPKDialog.open event listener ADDED");			
							}
							//========== Add evt handler to "Convert" button
						},
						
				close:  function( event, ui ) {
						//========== Remove evt handler from "Convert" button ==========
						let convert_button_elt = document.getElementById(CONVERT_MNEMONICS_BUTTON_ID);
						if (convert_button_elt != undefined) {
							convert_button_elt.removeEventListener
								('click', ToolsOptionsDialog.ConvertMnemonics);
							//console.log(">> mnemonicsToPKDialog.open event listener REMOVED");		
						}
						//========== Remove evt handler from "Convert" button
				}		
			} 
		);
	} // static Initialize()
	
	static ConvertMnemonics() {
		//console.log('>> ' + _RED_ + 'ToolsOptionsDialog.ConvertMnemonics' + _END_);
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.ConvertMnemonics" + _END_;
		window.ipcMain.log2Main(log_msg);
		
		let mnemonics_in_id_node = document.getElementById('mnemonics_in_id');
		if (mnemonics_in_id_node != undefined) {
			let mnemonics = mnemonics_in_id_node.value;
			//console.log(  '>> ' + _RED_ + '[browser_gui] ConvertMnemonics ' + _END_
			//            + 'mnemonics: \n' + mnemonics);
						
			let private_key = SeedPhrase.GetPrivateKeyFromMnemonics(mnemonics);
			
			//console.log(  '>> ' + _RED_ + '[renderer_gui] convertMmnemonics ' + _END_
			//            + 'private_key: \n' + private_key);
						
			let private_key_out_id_node = document.getElementById('private_key_out_id');
			if (private_key_out_id_node != undefined) {
				private_key_out_id_node.value = hexToB64(private_key);
			} // private_key_out_id_node != undefined
		} // mnemonics_in_id_node != undefined
	} // static ConvertMnemonics()
	
    static MnemonicsToPrivateKey() {
		//console.log(">> " + _CYAN_ + "MnemonicsToPrivateKeyDialog.MnemonicsToPrivateKey" + _END_);
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.MnemonicsToPrivateKey" + _END_;
		window.ipcMain.log2Main(log_msg);

		let dialog_id = TOOLS_OPTIONS_DIALOG_ID; //"tools_options_dialog_id";
		let tools_options_dialog_node = document.getElementById( dialog_id );
		
		//console.log("    tools_options_dialog_node: " + tools_options_dialog_node);
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if (tools_options_dialog_node != undefined) {
			//console.log("    TRYING to open 'mnemonicsToPKDialog': ");
			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let tools_options_dialog = $("#" + dialog_id); // dialog();
			DialogManager.Clean();
			mnemonics_to_pk_dialog
				.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (ToolsOptionsDialog.MnemonicsToPrivateKey)" + _END_);
		}
	} // static MnemonicsToPrivateKey()
} // ToolsOptionsDialog class 	

ToolsOptionsDialog.Initialize();