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
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.Initialize" ) );
		
		ToolsOptionsDialog.Options = {};
		
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
							trace2Main( pretty_func_header_format( "ToolsOptionsDialog <close Event>" ) );
							
	                        ToolsOptionsDialog.RemoveCallback( TOD_WALLET_MODE_SELECT_ID, 
							    'change', ToolsOptionsDialog.OnChangeWalletMode );							  
							  
							ToolsOptionsDialog.RemoveCallback( TOD_RESTORE_BUTTON_ID, 
							    'click', ToolsOptionsDialog.OnReset );
								
				            ToolsOptionsDialog.RemoveCallback( TOD_SAVE_BUTTON_ID,    
							    'click', async () => { await ToolsOptionsDialog.OnSave() } );
							  
							ToolsOptionsDialog.RemoveCallback( TOD_RESTORE_BUTTON_ID, 
							    'click', ToolsOptionsDialog.OnReset );
							  
                            ToolsOptionsDialog.RemoveCallback( TOD_APPLY_BUTTON_ID,
							    'click', async () => { await ToolsOptionsDialog.OnApply() } );								
							
							ToolsOptionsDialog.RemoveCallback( TOD_CANCEL_BUTTON_ID,
 							    'click', ToolsOptionsDialog.OnClose );
				        }		
			} 
		);
	} // ToolsOptionsDialog.Initialize()
	
	static ShowDialog( options_data ) {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.ShowDialog" ) );
		
		//trace2Main( pretty_format( "shwdlg> options_data", JSON.stringify( options_data ) ) );

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
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.OnChangeWalletMode" ) );
		
		let wallet_mode = HtmlUtils.GetNodeValue( TOD_WALLET_MODE_SELECT_ID );
		trace2Main( pretty_format( "wallet_mode", wallet_mode ) );
		if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
			HtmlUtils.ShowNode( TOD_SW_ENTROPY_SIZE_ID );
			HtmlUtils.HideNode( TOD_ENTROPY_SIZE_SELECT_ID );
		}	
		else if ( wallet_mode == HD_WALLET_TYPE ) {
			HtmlUtils.ShowNode( TOD_ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideNode( TOD_SW_ENTROPY_SIZE_ID );
		}

        //trace2Main( pretty_format( "Options", JSON.stringify(ToolsOptionsDialog.Options) ) );
		HtmlUtils.InitializeNode
				( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID, 
			      ToolsOptionsDialog.Options['Blockchains'][wallet_mode],
				  ToolsOptionsDialog.Options['Blockchains'][wallet_mode] );

		HtmlUtils.SetNodeValue( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID, 
				                ToolsOptionsDialog.Options[DEFAULT_BLOCKCHAIN][wallet_mode]);			
	} // ToolsOptionsDialog.OnChangeWalletMode()
	
	static OnSave() {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.OnSave" ) );
		ToolsOptionsDialog.SaveFields();
	} // ToolsOptionsDialog.OnSave()
	
	static OnReset() {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.OnReset" ) );
		ToolsOptionsDialog.ResetFields();
	} // ToolsOptionsDialog.OnReset()
	
	static async OnApply() {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.OnApply" ) );
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
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.OnClose" ) );		
		ToolsOptionsDialog.Close();
	} // ToolsOptionsDialog.OnClose()
	
	static UpdateFields( options_data ) {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.UpdateFields" ) );
		
		ToolsOptionsDialog.Options= options_data;
		
		let wallet_mode = options_data[WALLET_MODE];
		
		HtmlUtils.InitializeNode
				( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID, 
			      ToolsOptionsDialog.Options['Blockchains'][wallet_mode],
				  ToolsOptionsDialog.Options['Blockchains'][wallet_mode] );

		let default_blockchain = ToolsOptionsDialog.Options[DEFAULT_BLOCKCHAIN][wallet_mode];
		trace2Main( pretty_format( "default_blockchain", default_blockchain ) );
		HtmlUtils.SetNodeValue( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID, default_blockchain );		

		trace2Main( pretty_format( "wallet_mode", wallet_mode ) );
		HtmlUtils.SetNodeValue( TOD_WALLET_MODE_SELECT_ID, wallet_mode );

        let entropy_size = 0;
        if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
			entropy_size = 256;
			HtmlUtils.ShowNode( TOD_SW_ENTROPY_SIZE_ID );
			HtmlUtils.HideNode( TOD_ENTROPY_SIZE_SELECT_ID );
		}
		else if ( wallet_mode == HD_WALLET_TYPE ){			
			entropy_size = options_data[ENTROPY_SIZE][HD_WALLET_TYPE];
			HtmlUtils.ShowNode( TOD_ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideNode( TOD_SW_ENTROPY_SIZE_ID );
	    }

		trace2Main( pretty_format( "entropy_size", entropy_size ) );		
        HtmlUtils.SetNodeValue( TOD_ENTROPY_SIZE_SELECT_ID, entropy_size );		
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
	} // async ToolsOptionsDialog.RequireConfirmationFromUser()
	
	static ReadFields() {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.ReadFields" ) );
		
		let default_blockchain = HtmlUtils.GetNodeValue( TOD_DEFAULT_BLOCKCHAIN_SELECT_ID );
		trace2Main( pretty_format( "default_blockchain", default_blockchain ) );

		let wallet_mode = HtmlUtils.GetNodeValue( TOD_WALLET_MODE_SELECT_ID );
		trace2Main( pretty_format( "wallet_mode", wallet_mode ) );

		let entropy_size = HtmlUtils.GetNodeValue( TOD_ENTROPY_SIZE_SELECT_ID );
		trace2Main( pretty_format( "entropy_size", entropy_size ) );

		ToolsOptionsDialog.Options[WALLET_MODE]                     = wallet_mode;
		ToolsOptionsDialog.Options[DEFAULT_BLOCKCHAIN][wallet_mode] = default_blockchain;
		
		if ( wallet_mode == SIMPLE_WALLET_TYPE ) entropy_size = 256;

        ToolsOptionsDialog.Options[ENTROPY_SIZE] = 
			{ [HD_WALLET_TYPE]:"128", [SIMPLE_WALLET_TYPE]:"256" };
		//trace2Main( pretty_format( "options_data", JSON.stringify(ToolsOptionsDialog.Options) ) );
		ToolsOptionsDialog.Options[ENTROPY_SIZE][wallet_mode] = entropy_size;
		
		return ToolsOptionsDialog.Options;		
	} // ToolsOptionsDialog.ReadFields()
	
	static async SaveFields() {
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.SaveFields" ) );		

        let options_data = ToolsOptionsDialog.ReadFields();		
		//trace2Main( pretty_format( "options_data", JSON.stringify(options_data) ) );
		
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
		trace2Main( pretty_func_header_format( "ToolsOptionsDialog.ResetFields" ) );
		
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