// =====================================================================================
// ============================   tools_options_dialog.js   ============================
// =====================================================================================
"use strict";

const TOD_DEFAULT_BLOCKCHAIN_SELECT_ID = "tod_default_blockchain_select_id";
const TOD_WALLET_MODE_SELECT_ID        = "tod_wallet_mode_select_id";
const TOD_ENTROPY_SIZE_SELECT_ID       = "tod_entropy_size_select_id";
const TOD_SW_ENTROPY_SIZE_ID           = "tod_sw_entropy_size_id";

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
	                        ToolsOptionsDialog.AddCallback( TOD_WALLET_MODE_SELECT_ID, 
							    'change', ToolsOptionsDialog.OnChangeWalletMode );
							  
					        ToolsOptionsDialog.AddCallback( TOD_SAVE_BUTTON_ID,    
							    'click', 
								async () => { await ToolsOptionsDialog.OnSave() } );
							  
							ToolsOptionsDialog.AddCallback( TOD_RESTORE_BUTTON_ID, 
							    'click', ToolsOptionsDialog.OnReset );
							  
                            ToolsOptionsDialog.AddCallback( TOD_APPLY_BUTTON_ID,
							    'click', 
								async () => { await ToolsOptionsDialog.OnApply() } );							
							
							ToolsOptionsDialog.AddCallback( TOD_CANCEL_BUTTON_ID,
 							    'click', ToolsOptionsDialog.OnClose );
						},
						
				close:  function( event, ui ) {
							let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog <close Event>" + _END_;
							log2Main(log_msg);
							
	                        ToolsOptionsDialog.RemoveCallback( TOD_WALLET_MODE_SELECT_ID, 
							    'change', ToolsOptionsDialog.OnChangeWalletMode );							  
							  
							ToolsOptionsDialog.RemoveCallback( TOD_RESTORE_BUTTON_ID, 
							    'click', ToolsOptionsDialog.OnReset );
								
				            ToolsOptionsDialog.RemoveCallback( TOD_SAVE_BUTTON_ID,    
							    'click', 
								async () => { await ToolsOptionsDialog.OnSave() } );
							  
							ToolsOptionsDialog.RemoveCallback( TOD_RESTORE_BUTTON_ID, 
							    'click', ToolsOptionsDialog.OnReset );
							  
                            ToolsOptionsDialog.RemoveCallback( TOD_APPLY_BUTTON_ID,
							    'click', 
								async () => { await ToolsOptionsDialog.OnApply() } );								
							
							ToolsOptionsDialog.RemoveCallback( TOD_CANCEL_BUTTON_ID,
 							    'click', ToolsOptionsDialog.OnClose );
				        }		
			} 
		);
	} // ToolsOptionsDialog.Initialize()
	
	static ShowDialog( options_data ) {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.ShowDialog" + _END_;
		log2Main(log_msg);
		
		log2Main("   µµ options_data:\n   " + JSON.stringify( options_data ));

		let dialog_id = TOOLS_OPTIONS_DIALOG_ID; // "tools_options_dialog_id";
		let tools_options_dialog_node = document.getElementById( dialog_id );
		
		//console.log("    tools_options_dialog_node: " + tools_options_dialog_node);
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( tools_options_dialog_node != undefined ) {
			//console.log("    TRYING to open 'mnemonicsToPKDialog': ");
			
			// https://stackoverflow.com/questions/13520139/jquery-ui-dialog-cannot-call-methods-on-dialog-prior-to-initialization
			let tools_options_dialog = $("#" + dialog_id);
			//DialogManager.Clean();
			ToolsOptionsDialog.UpdateFields( options_data );
			tools_options_dialog.dialog('open');
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (ToolsOptionsDialog.ShowDialog)" + _END_);
		}
	} // ToolsOptionsDialog.ShowDialog()

	static OnChangeWalletMode() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.OnChangeWalletMode" + _END_;
		log2Main(log_msg);
		let wallet_mode = HtmlUtils.GetField( TOD_WALLET_MODE_SELECT_ID );
		log2Main( "   wallet_mode:        " + wallet_mode );
		if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
			HtmlUtils.ShowElement( TOD_SW_ENTROPY_SIZE_ID );
			HtmlUtils.HideElement( TOD_ENTROPY_SIZE_SELECT_ID );
		}	
		else if ( wallet_mode == HD_WALLET_TYPE ) {
			HtmlUtils.ShowElement( TOD_ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideElement( TOD_SW_ENTROPY_SIZE_ID );
		}		
	} // ToolsOptionsDialog.OnChangeWalletMode()
	
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
	
	static async OnApply() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.OnApply" + _END_;
		log2Main(log_msg);
		let options_data = ToolsOptionsDialog.ReadFields();	
		await window.ipcMain.UpdateOptions( options_data )
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
	
	static UpdateFields( options_data ) {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.UpdateFields" + _END_;
		log2Main(log_msg);
		
		let default_blockchain = options_data[DEFAULT_BLOCKCHAIN];
		log2Main( "   default_blockchain: " + default_blockchain );
		HtmlUtils.SetField( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID, default_blockchain );		

		let wallet_mode = options_data[WALLET_MODE];
		log2Main( "   wallet_mode:        " + wallet_mode );
		HtmlUtils.SetField( TOD_WALLET_MODE_SELECT_ID, wallet_mode );

        let entropy_size = 0;
        if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
			entropy_size = 256;
			HtmlUtils.ShowElement( TOD_SW_ENTROPY_SIZE_ID );
			HtmlUtils.HideElement( TOD_ENTROPY_SIZE_SELECT_ID );
		}
		else if ( wallet_mode == HD_WALLET_TYPE ){			
			entropy_size = options_data[ENTROPY_SIZE][HD_WALLET_TYPE];
			HtmlUtils.ShowElement( TOD_ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideElement( TOD_SW_ENTROPY_SIZE_ID );
	    }
		
		log2Main( "   entropy_size:       " + entropy_size );	
        HtmlUtils.SetField( TOD_ENTROPY_SIZE_SELECT_ID, entropy_size );		
	} // ToolsOptionsDialog.UpdateFields()
	
	static async RequireConfirmationFromUser( message, json_data, ok_handler ) {
		iziToast.question({			
			timeout: false, progressBar: false, overlay: true, close: false,
			backgroundColor: 'lightblue',
			displayMode:     'once',
			id:              'question',
			zindex:          999,
			message:         message,
			position:        'center',
			buttons: [
				[ '<button>OK</button>', 
				  async (instance, toast) => {
					 await ok_handler( json_data );
					 instance.hide( { transitionOut: 'fadeOutUp'	}, toast, 'OK');
					 ToolsOptionsDialog.Close();
				  },
				  true // true to focus
				], 
				[ '<button>Cancel</button>', 
				  (instance, toast) => {
					 instance.hide( { transitionOut: 'fadeOutUp' }, toast, 'Cancel');
					 ToolsOptionsDialog.Close();
				  }
				]
			]
		});	
	} // ToolsOptionsDialog.RequireConfirmationFromUser()
	
	static ReadFields() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.ReadFields" + _END_;
		log2Main(log_msg);
		
		let default_blockchain = HtmlUtils.GetField( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID );
		log2Main( "   default_blockchain: " + default_blockchain );

		let wallet_mode = HtmlUtils.GetField( TOD_WALLET_MODE_SELECT_ID );
		log2Main( "   wallet_mode:        " + wallet_mode );

		let entropy_size = HtmlUtils.GetField( TOD_ENTROPY_SIZE_SELECT_ID );
		log2Main( "   entropy_size:       " + entropy_size );

        let options_data = {};
		options_data[DEFAULT_BLOCKCHAIN] = default_blockchain;
		options_data[WALLET_MODE]        = wallet_mode;
		if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
			entropy_size = 256;
		}

        options_data[ENTROPY_SIZE] = { [HD_WALLET_TYPE]:"128", [SIMPLE_WALLET_TYPE]:"256" };
		log2Main( "   options_data:       " + JSON.stringify(options_data) );
		options_data[ENTROPY_SIZE][wallet_mode] = entropy_size;
		
		return options_data;		
	} // ToolsOptionsDialog.ReadFields()
	
	static async SaveFields() {
		let log_msg = ">> " + _CYAN_ + "ToolsOptionsDialog.SaveFields" + _END_;
		log2Main(log_msg);		

        let options_data = ToolsOptionsDialog.ReadFields();		
		log2Main("   && options_data: " + JSON.stringify(options_data));
		
		let message =   
			  "<center><b>Save Options" + "</b></center><br>" 
			+ "&nbsp;" + "Confirm saving of default Options";
			
		ToolsOptionsDialog.RequireConfirmationFromUser(
		    message, options_data,
		    async (options_data) => 
			{ await window.ipcMain.SaveOptions( options_data ) } 
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
		    async (options_data) => 
			{ await window.ipcMain.ResetOptions( options_data ) } 
		);
	} // ToolsOptionsDialog.ResetFields()
	
		static AddCallback( elt_id, event_name, handler) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.addEventListener( event_name, handler );									
		}		
	} // ToolsOptionsDialog.AddCallback()
	
	static RemoveCallback( elt_id, event_name, handler) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
			elt.removeEventListener( event_name, handler );									
		}		
	} // ToolsOptionsDialog.RemoveCallback()
} // ToolsOptionsDialog class 	

ToolsOptionsDialog.Initialize();