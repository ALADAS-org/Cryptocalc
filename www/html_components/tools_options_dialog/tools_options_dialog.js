// =====================================================================================
// ============================   tools_options_dialog.js   ============================
// =====================================================================================
"use strict";

const TOD_DEFAULT_BLOCKCHAIN_SELECT_ID = "tod_default_blockchain_select_id";
const TOD_WALLET_MODE_SELECT_ID        = "tod_wallet_mode_select_id";
const TOD_ENTROPY_SIZE_SELECT_ID       = "tod_entropy_size_select_id";

const TOD_SAVE_BUTTON_ID               = "tod_save_button_id"; 
const TOD_RESTORE_BUTTON_ID            = "tod_restore_button_id";
const TOD_APPLY_BUTTON_ID              = "tod_apply_button_id";
const TOD_CANCEL_BUTTON_ID             = "tod_cancel_button_id";

class ToolsOptionsDialog {
	static Initialize() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.Initialize" + _END_;
		log2Main(log_msg);
		//console.log(log_msg);
		$("#" + TOOLS_OPTIONS_DIALOG_ID).dialog
		(   { 	
		        modal:          true,
				autoOpen: 		false,
                resizable:      false,				
				dialogClass: 	'DialogBox', 
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				width:  500,
				open:   function( event, ui ) {					
					        ToolsOptionsDialog.AddCallback
							  ( TOD_SAVE_BUTTON_ID, ToolsOptionsDialog.OnSave );
							  
							ToolsOptionsDialog.AddCallback
							  ( TOD_RESTORE_BUTTON_ID, ToolsOptionsDialog.OnReset );
							  
                            ToolsOptionsDialog.AddCallback
							  ( TOD_APPLY_BUTTON_ID, ToolsOptionsDialog.OnApply );							
							
							ToolsOptionsDialog.AddCallback
							  ( TOD_CANCEL_BUTTON_ID, ToolsOptionsDialog.OnClose );
						},
						
				close:  function( event, ui ) {
							let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog <close Event>" + _END_;
							log2Main(log_msg);
							
							ToolsOptionsDialog.RemoveCallback
							  ( TOD_SAVE_BUTTON_ID, ToolsOptionsDialog.OnSave );
							  
							ToolsOptionsDialog.RemoveCallback
							  ( TOD_RESTORE_BUTTON_ID, ToolsOptionsDialog.OnReset );
							
							ToolsOptionsDialog.RemoveCallback
							  ( TOD_APPLY_BUTTON_ID, ToolsOptionsDialog.OnApply );							
								
							ToolsOptionsDialog.RemoveCallback
							  ( TOD_CANCEL_BUTTON_ID, ToolsOptionsDialog.OnClose );
				        }		
			} 
		);
	} // ToolsOptionsDialog.Initialize()

	static AddCallback( elt_id, handler) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.addEventListener( 'click', handler );									
		}		
	} // ToolsOptionsDialog.AddCallback()
	
	static RemoveCallback( elt_id, handler) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.removeEventListener( 'click', handler );									
		}		
	} // ToolsOptionsDialog.RemoveCallback()
	
	static OnSave() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.OnSave" + _END_;
		log2Main(log_msg);
		ToolsOptionsDialog.SaveFields();
	} // ToolsOptionsDialog.OnSave()
	
	static OnReset() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.OnReset" + _END_;
		log2Main(log_msg);
		ToolsOptionsDialog.ResetFields();
	} // ToolsOptionsDialog.OnReset()
	
	static OnApply() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.OnApply" + _END_;
		log2Main(log_msg);
	} // ToolsOptionsDialog.OnApply()
	
	static Close() {
		let dialog_id = TOOLS_OPTIONS_DIALOG_ID;
		let tools_options_dialog = $("#" + dialog_id); // dialog();
		//DialogManager.Clean();
		tools_options_dialog.dialog('close');
	} // ToolsOptionsDialog.Close()
	
	static OnClose() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.OnClose" + _END_;
		log2Main(log_msg);
		
		ToolsOptionsDialog.Close();
	} // ToolsOptionsDialog.OnClose()
	
	static UpdateFields( json_data ) {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.UpdateFields" + _END_;
		log2Main(log_msg);
		
		let default_blockchain = json_data['Default Blockchain'];
		log2Main( "   default_blockchain: " + default_blockchain );
		HtmlUtils.SetField( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID, default_blockchain );		

		let wallet_mode = json_data['Wallet Mode'];
		log2Main( "   wallet_mode:        " + wallet_mode );
		HtmlUtils.SetField( TOD_WALLET_MODE_SELECT_ID, wallet_mode );

		let entropy_size = json_data['Entropy Size'];
		log2Main( "   entropy_size:       " + entropy_size );	
        HtmlUtils.SetField( TOD_ENTROPY_SIZE_SELECT_ID, entropy_size );		
	} // ToolsOptionsDialog.UpdateFields()
	
	static async RequireConfirmationFromUser( message, json_data, ok_handler ) {
			iziToast.question({			
			timeout:     false, progressBar: false, overlay: true, close: false,
			backgroundColor: 'lightblue',
			displayMode:     'once',
			id:              'question',
			zindex:          999,
			message:         message,
			position:        'center',
			buttons: [
				['<button>OK</button>', async (instance, toast) => {
					//log2Main( ">> " + _YELLOW_ + "<OK> pressed" + _END_ );
					// await window.ipcMain.SaveOptions( json_data );
					await ok_handler( json_data );
					instance.hide( { transitionOut: 'fadeOutUp'	}, toast, 'OK');
					ToolsOptionsDialog.Close();
				}, true], // true to focus
				['<button>Cancel</button>', function (instance, toast) {
					//log2Main( ">> " + _YELLOW_ + "<Cancel> pressed" + _END_);
					instance.hide( { transitionOut: 'fadeOutUp' }, toast, 'Cancel');
					ToolsOptionsDialog.Close();
				}]
			]
		});	
	} // ToolsOptionsDialog.RequireConfirmationFromUser()
	
	static async SaveFields() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.SaveFields" + _END_;
		log2Main(log_msg);
		
		let default_blockchain = HtmlUtils.GetField( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID );
		log2Main( "   default_blockchain: " + default_blockchain );

		let wallet_mode = HtmlUtils.GetField( TOD_WALLET_MODE_SELECT_ID );
		log2Main( "   wallet_mode:        " + wallet_mode );

		let entropy_size = HtmlUtils.GetField( TOD_ENTROPY_SIZE_SELECT_ID );
		log2Main( "   entropy_size:       " + entropy_size );

        let json_data = {};
		json_data['Default Blockchain'] = default_blockchain;
		json_data['Wallet Mode']        = wallet_mode;
		json_data['Entropy Size']       = entropy_size;
		
		log2Main("   json_data: " + JSON.stringify(json_data));
		
		let message =   
			  "<center><b>Save Options" + "</b></center><br>" 
			+ "&nbsp;" + "Confirm saving of default Options";
			
		ToolsOptionsDialog.RequireConfirmationFromUser(
		    message, json_data,
		    async (json_data) => 
			{ await window.ipcMain.SaveOptions( json_data ) } 
		);
	
	} // ToolsOptionsDialog.SaveFields()
	
	static async ResetFields() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.ResetFields" + _END_;
		log2Main(log_msg);
		
		let message =   
			  "<center><b>Reset Options" + "</b></center><br>" 
			+ "&nbsp;" + "Confirm reset of default Options";
			
		ToolsOptionsDialog.RequireConfirmationFromUser(
		    message, {},
		    async (json_data) => 
			{ await window.ipcMain.ResetOptions( json_data ) } 
		);
	} // ToolsOptionsDialog.ResetFields()
	
    static ShowDialog( json_data ) {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.ShowDialog" + _END_;
		log2Main(log_msg);
		
		log2Main("   " + JSON.stringify(json_data));

		let dialog_id = TOOLS_OPTIONS_DIALOG_ID; // "tools_options_dialog_id";
		let tools_options_dialog_node = document.getElementById( dialog_id );
		
		//console.log("    tools_options_dialog_node: " + tools_options_dialog_node);
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( tools_options_dialog_node != undefined ) {
			//console.log("    TRYING to open 'mnemonicsToPKDialog': ");
			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let tools_options_dialog = $("#" + dialog_id);
			//DialogManager.Clean();
			ToolsOptionsDialog.UpdateFields( json_data );
			tools_options_dialog.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (ToolsOptionsDialog.ShowDialog)" + _END_);
		}
	} // ToolsOptionsDialog.ShowDialog()
} // ToolsOptionsDialog class 	

ToolsOptionsDialog.Initialize();