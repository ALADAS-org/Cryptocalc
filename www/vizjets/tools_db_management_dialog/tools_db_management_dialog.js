// =====================================================================================================================
// ======================================   tools_db_management_dialog.js   ======================================
// =====================================================================================================================
"use strict";

const OUTPUT_PATH_ID              = 'db_output_path_id';
const SELECT_OUTPUT_FOLDER_BTN_ID = 'db_select_output_folder_btn_id';

const DATABASE_PATH_ID            = 'db_database_path_id';
const SELECT_DB_FOLDER_BTN_ID     = 'db_select_db_folder_btn_id';

const IMPORT_BTN_ID               = 'db_dialog_import_btn_id';
const QUIT_BTN_ID                 = 'db_dialog_quit_btn_id';
const RESET_BTN_ID                = 'db_dialog_reset_btn_id';

class ToolsDbManagementDialog {	
	static #Key           = Symbol();
	static #Singleton     = new ToolsDbManagementDialog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( ToolsDbManagementDialog.#Singleton == undefined ) {
			ToolsDbManagementDialog.#Singleton = new ToolsDbManagementDialog( this.#Key );
			if ( ToolsDbManagementDialog.#Singleton > 0 ) {
				throw new TypeError("'ToolsDbManagementDialog' constructor called more than once");
			}
			ToolsDbManagementDialog.#InstanceCount++;
        }
        return ToolsDbManagementDialog.#Singleton;
    } // ToolsDbManagementDialog 'This' getter
	
	// ** Private constructor **
	constructor( key ) {
		// console.log(">> **************** new ToolsDbManagementDialog");
		if ( key !== ToolsDbManagementDialog.#Key ) {
			throw new TypeError("'ToolsDbManagementDialog' constructor is private");
		}
		
		this.event_handlers_attached = false;
	
	    this.displayed               = false;
		this.encrypt_mode            = true;		
		this.app_path                = '';
		
		this.DEFAULT_OUTPUT_PATH     = '';
		this.ouput_path              = '';
		
		this.db_folder_path          = '';		
		this.default_db_folder_path  = '';
	} // ** Private constructor **
	
	initialize() {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.Initialize" ) );

		$("#" + TOOLS_DB_MANAGEMENT_DIALOG_ID).dialog
		(   { 	
		        modal:          true,
				autoOpen: 		false,
                resizable:      false,				
				dialogClass: 	'DialogBox', 
				
				// https://stackoverflow.com/questions/18992081/trigger-event-on-dialog-box-open
				// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
				width:   650,
				height:  180,
				
				open:   function( event, ui ) {
							let dialog_obj = ToolsDbManagementDialog.This;							
							// console.log(">>> **** JQUERY <OPEN> function" );							
							// console.log(">>> event_handlers_attached: " + dialog_obj.event_handlers_attached );							
							
							if ( ! dialog_obj.event_handlers_attached ) {
								dialog_obj.addEventHandler
									( SELECT_OUTPUT_FOLDER_BTN_ID, 'click', 
									  async ( evt ) => { await ToolsDbManagementDialog.This.onSelectFileOrDirectoryPath(SELECT_OUTPUT_FOLDER_BTN_ID); } );	
		
								dialog_obj.addEventHandler
									( SELECT_DB_FOLDER_BTN_ID, 'click', 
									  async ( evt ) => { await ToolsDbManagementDialog.This.onSelectFileOrDirectoryPath(SELECT_DB_FOLDER_BTN_ID); } );	

								dialog_obj.addEventHandler
									( IMPORT_BTN_ID, 'click', 
									  async ( evt ) => { await ToolsDbManagementDialog.This.onImportOutputFilesIndDB(); } );	
								
								dialog_obj.addEventHandler
									( RESET_BTN_ID, 'click', 
									  async ( evt ) => { await ToolsDbManagementDialog.This.onReset(); } );	
									  
								dialog_obj.addEventHandler
									( QUIT_BTN_ID, 'click', 
									  async ( evt ) => { await ToolsDbManagementDialog.This.onQuit(); } );

								dialog_obj.event_handlers_attached = true;	
							}		
						},
						
				close:  function( event, ui ) {
					        // console.log(">>> **** JQUERY <CLOSE> function" );							
				        }		
			} 
		);
	} // initialize()
	
	async showDialog( db_folder_path ) {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.showDialog" ) );
		
		trace2Main( pretty_format( "shwdlg> db_folder_path", db_folder_path ) );
		
		this.DEFAULT_OUTPUT_PATH = await window.ipcMain.GetAppPath() + '\\_output';
		console.log(">> DEFAULT_OUTPUT_PATH: '" + this.DEFAULT_OUTPUT_PATH + "'");
		
		if ( this.ouput_path == '' )             this.output_path            = this.DEFAULT_OUTPUT_PATH;
		
		if ( this.default_db_folder_path == '' ) this.default_db_folder_path = db_folder_path; //  + '\\Cryptocalc.db';		
		if ( this.db_folder_path == '' )         this.db_folder_path         = db_folder_path; //  + '\\Cryptocalc.db';

		let dialog_id   = TOOLS_DB_MANAGEMENT_DIALOG_ID;
		let dialog_node = document.getElementById( dialog_id );
		
		//console.log("    tools_options_dialog_node: " + tools_options_dialog_node);
		
		// https://stackoverflow.com/questions/394491/passing-data-to-a-jquery-ui-dialog/3458299#3458299
		if ( dialog_node != undefined ) {
			let dialog_obj = $("#" + dialog_id);
			dialog_obj.dialog('open');
			
			this.initializeFields();
		}
		else {
			console.log(  ">> " + _RED_HIGH_ + "*ERROR* NOT FOUND " + dialog_id
						+ " (ToolsDbManagementDialog.showDialog)" + _END_);
		}
	} // showDialog()
	
	initializeFields() {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.initializeFields" ) );
        // console.log(">> initializeFields TRYING TO SET '" + OUTPUT_PATH_ID + "'  to '" + this.output_path); 		
		HtmlUtils.SetElementValue( OUTPUT_PATH_ID,   this.output_path );		
		HtmlUtils.SetElementValue( DATABASE_PATH_ID, this.db_folder_path );
	} // initializeFields()
	
	resetFields() {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.resetFields" ) );
        // console.log(">> resetFields TRYING TO SET '" + OUTPUT_PATH_ID + "'  to '" + this.DEFAULT_OUTPUT_PATH); 		
		HtmlUtils.SetElementValue( OUTPUT_PATH_ID,   this.DEFAULT_OUTPUT_PATH );
		HtmlUtils.SetElementValue( DATABASE_PATH_ID, this.default_db_folder_path );
	} // resetFields()
	
	async onSelectFileOrDirectoryPath( btn_id ) {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.onSelectFileOrDirectoryPath" ) );
		// console.log(">> ====== ToolsDbManagementDialog.onSelectFileOrDirectoryPath ======");
		
		let default_path = '';
		let title        = '';
		let path_type    = '';
		// console.log(">> onSelectFileOrDirectoryPath btn_id: '" + btn_id + "'");
		
		let select_mode = SELECT_DIRECTORY_PATH_MODE;
		
		if ( btn_id == SELECT_OUTPUT_FOLDER_BTN_ID ) {
			default_path = this.output_path;
		    title        = 'Select Output path';
			path_type    = OUTPUT_DIR_PATH;
			select_mode  = SELECT_DIRECTORY_PATH_MODE;
		}
		else if ( btn_id == SELECT_DB_FOLDER_BTN_ID ) {
			default_path = this.db_folder_path;		    
			title        = 'Select Database path';
			select_mode  = SELECT_FILE_PATH_MODE;
		}
	
	    // console.log(">> ****** onSelectFileOrDirectoryPath   default_path: \n   '" + default_path + "'\n");
		// console.log(">> ****** onSelectFileOrDirectoryPath   path_type: '" + path_type + "'");
		
		// console.log(">> onSelectFolder ====----====----====----==== Calling window.ipcMain.SelectFileOrDirectoryPathDialog'");
		// console.log(">> BEFORE  ==== '" + window.ipcMain.SelectFileOrDirectoryPathDialog + "' ====");
		
		const data = { default_path, title, select_mode, path_type }; 
		let selected_path = await window.ipcMain.SelectFileOrDirectoryPathDialog( data );
		// console.log(">> AFTER   ==== '" + window.ipcMain.SelectFileOrDirectoryPathDialog + "' ====");
		
		// console.log(">> =-=-=-=-=-=-= onSelectFileOrDirectoryPath =-=-=-=-=-=  \n   selected_path: '" + selected_path + "'\n");
		if ( selected_path == '' ) return;
		
		// console.log(">> btn_id: '" + btn_id + "'");
				
		if ( btn_id == SELECT_OUTPUT_FOLDER_BTN_ID ) {
			if ( selected_path == INVALID_OUTPUT_DIR_PATH ) {
				console.log(">> selected_path OUTPUT_PATH IS KO resetting with '" + this.DEFAULT_OUTPUT_PATH + "'");
				this.ouput_path = this.DEFAULT_OUTPUT_PATH;
			}
			else {
				console.log(">> selected_path IS OK trying to update '" + selected_path + "'");
				this.output_path = selected_path;				
			}
			HtmlUtils.SetElementValue( OUTPUT_PATH_ID, this.output_path );
		}
		else if ( btn_id == SELECT_DB_FOLDER_BTN_ID ) {
			console.log(">> selected_path DATABASE_PATH IS OK trying to update with '" + this.db_folder_path + "'");
			this.db_folder_path = selected_path;
			HtmlUtils.SetElementValue( DATABASE_PATH_ID, this.db_folder_path );
		}
	} // onSelectFileOrDirectoryPath()
	
	async onImportOutputFilesIndDB() {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.onImportOutputFilesIndDB" ) );
		
		let output_dirs_path = this.output_path;
		console.log(">> IMPORTING Output files from '" + output_dirs_path + "'");
		
		let db_path = this.db_folder_path;

		let data    = { output_dirs_path, db_path };
		await window.ipcMain.ImportOutputFilesInDatabase( data );
	} // onImportOutputFilesIndDB

	onReset() {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.onReset" ) );
		this.resetFields();
	} // onReset()
	
	onQuit() {
		trace2Main( pretty_func_header_format( "ToolsDbManagementDialog.onQuit" ) );		
		let dialog_obj = $("#" + TOOLS_DB_MANAGEMENT_DIALOG_ID);
		dialog_obj.dialog('close');
	} // onQuit()
	
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
} // ToolsDbManagementDialog class 	

ToolsDbManagementDialog.This.initialize();