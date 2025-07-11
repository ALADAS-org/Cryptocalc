// ====================================================================================
// ===============================   electron_main.js   ===============================
// ====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

// ===============================  ElectronMain class  ===============================
// NB: "Singleton" class
// * static GetInstance()
//          createBrowserWindow( url )
// *        getMainWindow()
// *        getMenuTemplate()
// *        createWindow()
//          updateWindowTitle()
//
// * async  doFileNew()
// *        doFileSave()
// * async  doFileOpen()
// * async  doFileRead( json_data )
//
// *        getNewFortuneCookie()
// *        toggleDebugPanel()
// *        getUserSelectedFile()
//
//          readOptionsFile()
// * async  loadOptions()
// * async  setDefaultOptions()
// * async  updateOptions( options_data )
// * async  saveOptions( options_data )
// * async  resetOptions()
//
// *        setCallbacks()
// ------------------------------------------------------
const MAIN_WINDOW_WIDTH  = 1040; // NB: 'width' is wider because of 'Cardano'
const MAIN_WINDOW_HEIGHT = 630; 

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

require('v8-compile-cache');

const fs               = require('fs');
const path             = require('path');
const { v4: uuidv4 }   = require('uuid');

const checkInternetConnected = require('check-internet-connected');

const PasswordGenerator = require('generate-password');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, _END_ 
	  }                = require('../util/color/color_console_codes.js');
	  
const { pretty_func_header_log,
        pretty_log }   = require('../util/log/log_utils.js');
		
const { Skribi }       = require('../util/log/skribi.js');		
	  
const { APP_VERSION, 
        PROGRAM, ELECTRON_LAUNCHER, EXE_LAUNCHER, 
		WITS_PATH, PATH, ARGS,
      }                = require('../const_keywords.js');

const { CMD_OPEN_WALLET,
        VIEW_TOGGLE_DEVTOOLS, TOOLS_OPTIONS,
        ToMain_RQ_QUIT_APP, 
		ToMain_RQ_LOG_2_MAIN, ToMain_RQ_LOG_2_MAIN_SYNC,
		
		ToMain_RQ_EXEC_CMD,
		
		ToMain_RQ_SET_WINDOW_TITLE, ToMain_RQ_TOGGLE_DEBUG_PANEL,
		
		ToMain_RQ_NEW_WALLET_INFO, ToMain_RQ_OPEN_WALLET_INFO, ToMain_RQ_SAVE_WALLET_INFO, 
		
		ToMain_RQ_OPEN_URL, ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER,
		ToMain_RQ_LOAD_IMG_FROM_FILE, ToMain_RQ_DRAW_RND_CRYPTO_LOGO,
		
		ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO, 
		
		ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO, 
		ToMain_RQ_GET_SIMPLE_WALLET,		
		
		ToMain_RQ_ENTROPY_TO_MNEMONICS, ToMain_RQ_ENTROPY_TO_CHECKSUM,
		ToMain_RQ_ENTROPY_SRC_TO_ENTROPY,	

		ToMain_RQ_MNEMONICS_AS_4LETTER, ToMain_RQ_MNEMONICS_AS_TWO_PARTS,
        ToMain_RQ_GET_UUID, 
		
		ToMain_RQ_GET_L10N_KEYPAIRS, ToMain_RQ_GET_L10N_MSG, 
		
		ToMain_RQ_SET_MENU_ITEM_STATE,
		
		ToMain_RQ_CHECK_MNEMONICS, 
		ToMain_RQ_MNEMONICS_TO_WORD_INDEXES, ToMain_RQ_GUESS_MNEMONICS_LANG,
		
		ToMain_RQ_SAVE_OPTIONS, ToMain_RQ_RESET_OPTIONS, ToMain_RQ_UPDATE_OPTIONS,
		ToMain_RQ_GET_FORTUNE_COOKIE,	

        ToMain_RQ_GENERATE_PASSWORD,		
		
		ToMain_RQ_GET_HD_WALLET,	
		
		FromMain_DID_FINISH_LOAD, FromMain_EXEC_CMD,
		
		FromMain_FILE_NEW, FromMain_FILE_OPEN, FromMain_FILE_SAVE, 
		FromMain_HELP_ABOUT,

		FromMain_TOOLS_OPTIONS_DIALOG, FromMain_UPDATE_OPTIONS, 
		FromMain_SEND_IMG_URL,
		FromMain_SET_FORTUNE_COOKIE, 
        FromMain_SET_VARIABLE,
		FromMain_INTERNET_CONNECTED		
	  }                                 = require('../const_events.js');
	  
const { ENTROPY_SOURCE_IMG_ID
      }                                 = require('../_renderer/const_renderer.js');

const { DEFAULT_OPTIONS
      }                                 = require('../crypto/const_default_options.js');
	  
const { getShortenedString }            = require('../util/values/string_utils.js');	  
const { FileUtils }                     = require('../util/system/file_utils.js');
const { Bip39Utils }                    = require('../crypto/bip39_utils.js');
const { getRandomInt  }                 = require('../crypto/hex_utils.js');
const { getFortuneCookie }              = require('../util/fortune/fortune.js');
const { L10nUtils }                     = require('../L10n/L10n_utils.js');

const { Bip32Utils }                    = require('../crypto/HDWallet/bip32_utils.js');
const { HDWallet }                      = require('../crypto/HDWallet/hd_wallet.js');
const { SimpleWallet }                  = require('../crypto/SimpleWallet/simple_wallet.js');

const { MainModel }                     = require('./main_model.js');

const DEFAULT_APP_CONFIG = {
	"ToFile": true
}; // DEFAULT_APP_CONFIG

const gotTheLock = app.requestSingleInstanceLock();

const error_handler = (err) => { 
	if (err) return Skribi.log("error: " + err);
	Skribi.log('saving file... '+ filename); 
}; // error_handler()

class ElectronMain {
	//static #key = {};
	static #key = Symbol();
	static #_Singleton = new ElectronMain( this.#key );
	static #_InstanceCount = 0;
	
	static GetInstance() {
		if( ElectronMain.#_Singleton == undefined ) {
			this.#_Singleton = new ElectronMain();
			if (this.#_InstanceCount > 0) {
				throw new TypeError("ElectronMain constructor called more than once.");
			}
			this.#_InstanceCount++;
        }
        return ElectronMain.#_Singleton;
    } // ElectronMain.GetInstance() 

    // ** Private constructor **
	constructor( key ) {
		if ( key !== ElectronMain.#key ) {
			throw new TypeError("ElectronMain constructor is private.");
		}
				
		this.cryptowallet_version        = "x.x.x";
		
		this.app_config                = DEFAULT_APP_CONFIG;

        this.cmd_line	               = {};
		this.cmd_line[PROGRAM]         = ELECTRON_LAUNCHER;
		this.cmd_line[PATH]            = ".";
		this.cmd_line[ARGS]            = "";
		
		this.DidFinishLoad_FiredCount  = 0;
		this.Show_DebugPanel           = false;
		
		this.MainWindow                = undefined;
	    this.Options                   = {};
        this.SupportedBlockchains      = {};		
	    this.FirstImageAsEntropySource = true;
	} // ** Private constructor **
	
	createBrowserWindow( url ) {
	   const win = new BrowserWindow(
	     { height: 900, width:  1200 } 
	   );

	   win.loadURL( url );
    } // createBrowserWindow

    getMainWindow() {
		return this.MainWindow;
	} // getMainWindow()
	
	isLaunchedFromExe() {
		if ( this.cmd_line[PROGRAM] == EXE_LAUNCHER )  return true;
		return false;
	} // isLaunchedFromExe()
	
	getCmdLineArgs() {
		let nb_args = process.argv.length;
		
		if ( nb_args > 0 ) {
			this.cmd_line[PROGRAM] = path.basename( process.argv[0] );
		};
		
		if ( nb_args > 1 ) {
			this.cmd_line[PATH]  = process.argv[1];
		};
		
		if ( nb_args > 2 ) {
			this.cmd_line[ARGS] = process.argv[2];
		};
		
		let msg =  "nb_args: "     + nb_args
		          + PROGRAM + ": " + this.cmd_line[PROGRAM]
				  + PATH + ": "    + this.cmd_line[PATH]
				  + ARGS + ": "    + this.cmd_line[ARGS]; 
		return msg;
	} // getCmdLineArgs()
	
	// https://github.com/electron/electron/issues/19775
	// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
	getMenuTemplate() {
		let ELECTRON_MAIN_MENU_TEMPLATE = [
			{ 	label: L10nUtils.GetLocalizedMsg("File"),
				submenu: [ {  label:  L10nUtils.GetLocalizedMsg("New"), 
							  async click() { await ElectronMain.GetInstance().doFileNew(); }
						   },
				           {  label:  L10nUtils.GetLocalizedMsg("Open"), 
							  async click() { await ElectronMain.GetInstance().doFileOpen(); }
						   },
				           {  label:  L10nUtils.GetLocalizedMsg("Save"), 
							  click() { ElectronMain.GetInstance().doFileSave(); },
							  id: "file_save_menu_item_id"
						   },
						   {  label:  L10nUtils.GetLocalizedMsg("SaveAs"), 
							  click() { ElectronMain.GetInstance().doFileSaveAs(); },
							  id: "file_save_as_menu_item_id"
						   },
						   {  label: L10nUtils.GetLocalizedMsg("Quit"), 
							  click() { app.quit(); }
						   }
						 ]
			},
			{ 	label: L10nUtils.GetLocalizedMsg("View"),
				submenu: [ {  label: L10nUtils.GetLocalizedMsg("ToggleDebug"), type: 'checkbox',
							  click() {
								  pretty_func_header_log( "[Electron]", VIEW_TOGGLE_DEVTOOLS );								  
								  ElectronMain.GetInstance().toggleDebugPanel(); }  
						   }						  
						 ]
			},
			{ 	label: L10nUtils.GetLocalizedMsg("Tools"),
				submenu: [ {  label: "Options...",
							  click() {
                                  pretty_func_header_log( "[Electron]", TOOLS_OPTIONS );								  
								  ElectronMain.GetInstance().getMainWindow()
								    .webContents.send
									( 'fromMain', 
									  [ FromMain_TOOLS_OPTIONS_DIALOG, 
									    ElectronMain.GetInstance().Options ] 
									);
							  }		 
						   }
						 ]
			},
			{   label: L10nUtils.GetLocalizedMsg("Help"), //"Help"
				submenu: [ { label: L10nUtils.GetLocalizedMsg("Resources"),
							 submenu: 							 
							 [
							   { label: "Setup guide and User's Manual",
								  click() { 
									 ElectronMain.GetInstance()
									     .createBrowserWindow("https://github.com/ALADAS-org/cryptowallet/blob/master/README.md");
								  }
							   },
							   { label: "Ian Coleman BIP39",
								  click() { 
									 // https://stackoverflow.com/questions/53390798/opening-new-window-electron
									 ElectronMain.GetInstance()
									     .createBrowserWindow("https://iancoleman.io/bip39/");
								  }
								},
								{ label: "Guarda",
								  click() { 
									 // https://stackoverflow.com/questions/53390798/opening-new-window-electron
									 ElectronMain.GetInstance()
									     .createBrowserWindow("https://guarda.com/");
								  }
								}						
							 ]
						   },
						   {  label: L10nUtils.GetLocalizedMsg("About"), //'About...',
							  click() { 
								  ElectronMain.GetInstance().getMainWindow()
								      .webContents.send('fromMain', [ FromMain_HELP_ABOUT ]);
							  }
						   }
						 ]
			}
		]; // menu_template
		
		return ELECTRON_MAIN_MENU_TEMPLATE;
	} // getMenuTemplate()
	
	//==================== createWindow() ====================
	// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
	createWindow() {
		pretty_func_header_log( "ElectronMain.createWindow" );

		// Hide 'Security Warning'
		process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
		
		this.MainWindow = new BrowserWindow(
			{ width:  MAIN_WINDOW_WIDTH, 
			  height: MAIN_WINDOW_HEIGHT,
			  icon:   path.join(__dirname, "../../icons/Cryptowallet_Icon.png"),
			  webPreferences: {
				contextIsolation: true, // NB: 'true' is default value but keep it there anyway
				preload:          path.join(__dirname, "./preload.js")
			  }
			}
		);
			
		const menu_bar = Menu.buildFromTemplate( this.getMenuTemplate() );
		Menu.setApplicationMenu( menu_bar );	
		
		// https://www.electronjs.org/docs/latest/api/web-contents#instance-events
		// https://stackoverflow.com/questions/42284627/electron-how-to-know-when-renderer-window-is-ready
		// Note: index.html loaded twice (first index.html redirect)
		// ==================== 'did-finish-load' event handler ====================
		this.MainWindow.webContents.on( 'did-finish-load', 
			async () => {
				Skribi.Initialize( this.app_config );
				//Skribi.log(">> " + _CYAN_ + "[*Electron*] " + _YELLOW_ + " did-finish-load --" + _END_);
				
				this.app_config = this.readAppConfig();
				// Skribi.log(">> " + _CYAN_ + "eMain.evtH('did-finish-load')> FiredCount: " + this.DidFinishLoad_FiredCount + _END_ );

				this.getCmdLineArgs();	
				// Skribi.log("  ** this.cmd_line: " + JSON.stringify(this.cmd_line) );
				Skribi.log(">> " + _CYAN_ + "eMain.evtH('" + _YELLOW_ + "'did-finish-load'"
								 + _CYAN_ + ")> this.cmd_line[PROGRAM]: " + _END_ + this.cmd_line[PROGRAM]);					
				
				//---------- Set 'Cryptowallet_version' in Renderer GUI ----------
				this.cryptowallet_version = MainModel.GetInstance().getAppVersion();	
				//Skribi.log(">> " + _CYAN_ + "eMain.evtH('" + _YELLOW_ + "'did-finish-load'"
				//                 + _CYAN_ + ")> cryptowallet_version: " + _END_ + this.cryptowallet_version);					
				this.updateWindowTitle();
				//---------- Set 'this.cryptowallet_version' in Renderer GUI
				
				
				this.MainWindow.webContents.send
					( "fromMain", [ FromMain_DID_FINISH_LOAD ] );
				
				this.MainWindow.webContents.send
					( "fromMain", [ FromMain_SET_VARIABLE, APP_VERSION, this.cryptowallet_version ] );
				
				// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
				// Open urls in the user's browser
				// nB: Triggered by 'RendererGUI.OnExploreWallet()'
				this.MainWindow.webContents.setWindowOpenHandler( (edata) => {
					shell.openExternal(edata.url);
					return { action: "deny" };
				} );
				
				
				this.setCallbacks();
				this.Options = await this.loadOptions();					
				
				// =================== Open file by association ===================
				let wits_path = this.cmd_line[PATH];
				
				if ( wits_path.endsWith(".wits") ) {
					Skribi.log(">> " + _CYAN_ + "eMain.evtH('" + _RED_ + "'did-finish-load'"
									 + _CYAN_ + ")> SET_VARIABLE(" + WITS_PATH + ") in Renderer" + _END_ + wits_path);		 
					// await this.openWits( wits_path ); 
					await this.MainWindow.webContents.send
						( "fromMain", [ FromMain_SET_VARIABLE, WITS_PATH, wits_path ] );
				}
				// =================== Open file by association					
				
				// Note: will require 'Main' to 'Open Wits' if:
				// - 'wits_path' in Renderer is not empty 
				// and 
				// - not 'first_time' in Renderer  
				await this.doFileNew();						

			} // 'did-finish-load' callback
		); // ==================== 'did-finish-load' event handler
		
		this.MainWindow.loadFile( './www/index.html' );
	} // createWindow()
	
	async openWits( wits_path ) {
		if ( wits_path == undefined ) { 
		     throw new Error("**ERROR** in Cryptowallet: '.wits' path is undefined");
		}
		
		Skribi.log(">> " + _CYAN_ + "eMain.evtH('" + _YELLOW_ + "'openWits'"
						 + _CYAN_ + ")> *TEST* Trying to Open '.wits': " + _END_ + wits_path);							 

		if ( wits_path.endsWith(".wits") ) {
			const json_data_str = fs.readFileSync( wits_path, { encoding: 'utf8', flag: 'r' });
			let wits_json_data = JSON.parse( json_data_str );
			
			this.Options = await this.loadOptions();
			
			await this.MainWindow.webContents.send
				  ( "fromMain", [ FromMain_EXEC_CMD, CMD_OPEN_WALLET, wits_json_data ] );	
		}
	} // openWits()
	
	updateWindowTitle( coin, wallet_mode ) {
		//pretty_func_header_log( "ElectronMain.updateWindowTitle" );	
		let window_title = 'Cryptowallet ' + this.cryptowallet_version;
		if ( wallet_mode != undefined  &&  wallet_mode != "" )   window_title += " - " + wallet_mode;
		if ( coin != undefined  &&  coin != "" ) 	             window_title += ": " + coin;
		
        this.MainWindow.setTitle( window_title );
	} // updateWindowTitle()
	
	async doFileNew() {
		Skribi.log( ">> " + _CYAN_ + "ElectronMain.doFileNew" + _END_ );	
        //this.Options = this.readOptionsFile();
        this.Options = await this.loadOptions();
        await this.MainWindow.webContents
		          .send( "fromMain", [ FromMain_FILE_NEW, this.Options ] );		
	} // doFileNew()
	
	doFileSave() {
		// pretty_func_header_log( "ElectronMain.doFileSave" );
        Skribi.log( ">> " + _CYAN_ + "ElectronMain.doFileSave" + _END_ );		
		this.MainWindow.webContents.send( "fromMain", [ FromMain_FILE_SAVE ] );
	} // doFileSave()
	
	doFileSaveAs() {
		// pretty_func_header_log( "ElectronMain.doFileSaveAs" );
        Skribi.log( ">> " + _CYAN_ + "ElectronMain.doFileSaveAs" + _END_ );		
		this.MainWindow.webContents.send( "fromMain", [ FromMain_FILE_SAVE ] );
	} // doFileSaveAs()
	
	async doFileOpen( in_file_path ) {
		// pretty_func_header_log( "ElectronMain.doFileOpen" );
		Skribi.log( ">> " + _CYAN_ + "ElectronMain.doFileOpen" + _END_ );
		
		if ( in_file_path == undefined ) {		
			let input_path = app.getAppPath() + "\\_output";
			in_file_path = await this.selectFileWithDialogBox( input_path, "Wallet Informations", "wits" );
			pretty_log( "in_file_path", in_file_path );
			if ( in_file_path == "" ) return;
		}
		const json_data_str = fs.readFileSync( in_file_path, { encoding: 'utf8', flag: 'r' });
		//pretty_log( "json_data_str", json_data_str );
		let json_data = JSON.parse( json_data_str );
		await this.MainWindow.webContents
		          .send( "fromMain", [ FromMain_FILE_OPEN, json_data ] );	
	} // doFileOpen()
	
	async selectFileWithDialogBox( input_path, label, extension ) {
		pretty_func_header_log( "ElectronMain.selectFileWithDialogBox" );
		
		let in_file_path = "";
		//                     Modal window
		let result = await dialog.showOpenDialog( this.MainWindow, {
			defaultPath: input_path,
			filters:     [ { name: label, extensions: [extension] } ],
			properties:  ['openFile']
		});
		//.then( result => {
			//pretty_log( "result", JSON.stringify(result));
			if ( result.filePaths.length > 0 ) {
				//pretty_log( "filePaths", JSON.stringify(result.filePaths));
				in_file_path = result.filePaths[0];
				// pretty_log( "in_file_path", in_file_path);
			}
		//}).catch(err => {
		//	Skribi.log(err)
		//});
		
		// pretty_log( "in_file_path", in_file_path);
		return in_file_path;
	} // selectFileWithDialogBox()
	
	// https://stackoverflow.com/questions/43991267/electron-open-file-directory-in-specific-application
	showFolderInExplorer( folder_path) {
		pretty_func_header_log( "ElectronMain.showFolderInExplorer" );
		shell.openPath( folder_path );
    } // showFolderInExplorer()
	
	// File/Import/Random Fortune Cookie
	getNewFortuneCookie() {
		pretty_func_header_log( "ElectronMain.getNewFortuneCookie" );
		let fortune_cookie = getFortuneCookie();
		Skribi.log("   fortune_cookie: " + getShortenedString( fortune_cookie) );
		this.MainWindow.webContents
			.send( "fromMain", [ FromMain_SET_FORTUNE_COOKIE, fortune_cookie ] );
	} // getNewFortuneCookie()
	
	toggleDebugPanel() {
		pretty_func_header_log( "ElectronMain.toggleDebugPanel" );
		this.Show_DebugPanel = ! this.Show_DebugPanel;
		
		if ( this.Show_DebugPanel )
			this.MainWindow.webContents.openDevTools();
		else
			this.MainWindow.webContents.closeDevTools();
	} // toggleDebugPanel()
	
	readAppConfig() {
		pretty_func_header_log( "ElectronMain.readAppConfig" );
		
		let app_config = DEFAULT_APP_CONFIG;
		
		let config_path = app.getAppPath() + '/www/config';
		
		let app_config_path = config_path + '/app_config.json';
		if ( fs.existsSync( app_config_path ) ) {
			const app_config_str = fs.readFileSync( app_config_path );
			if ( app_config_str != "" &&  app_config_str != "[]" && app_config_str != "{}" ) { 
				app_config = JSON.parse( app_config_str );		
			}
		}
		
		return app_config;		
	} // readAppConfig()
	
	readOptionsFile() {
		pretty_func_header_log( "ElectronMain.readOptionsFile" );
		
		let current_options = DEFAULT_OPTIONS;
		
		let config_path = app.getAppPath() + '/www/config';
		//Skribi.log("config_path: " + config_path);
		
		let options_path = config_path + '/options.json';
		if ( fs.existsSync( options_path ) ) {
			const options_str = fs.readFileSync( options_path );
			//Skribi.log("   options_str: " + options_str);
			if ( options_str != "" &&  options_str != "[]" && options_str != "{}" ) { 
				current_options = JSON.parse( options_str );		
			}
		}
		
		return current_options;		
	} // readOptionsFile()

	async loadOptions() {
		pretty_func_header_log( "ElectronMain.loadOptions" );
		
		this.Options = this.readOptionsFile();
		
		//Skribi.log(" A this.Options: " + JSON.stringify( this.Options ));
		await this.MainWindow.webContents
			      .send('fromMain', [ FromMain_UPDATE_OPTIONS, this.Options ]);
        return this.Options; 				  
	} // async loadOptions()
	
	async setDefaultOptions() {
		pretty_func_header_log( "ElectronMain.setDefaultOptions" );
		
		this.Options = DEFAULT_OPTIONS;
		await this.saveOptions( this.Options );
	} // async setDefaultOptions()
	
	async updateOptions( options_data ) {
		pretty_func_header_log( "ElectronMain.updateOptions" );
		this.Options = options_data;
		Skribi.log("   this.Options: " + JSON.stringify( this.Options ));
	} // async updateOptions()
	
	async saveOptions( options_data ) {
		pretty_func_header_log( "ElectronMain.saveOptions" );
		
		this.Options = options_data;
		let config_path  = app.getAppPath() + '/www/config';		
		let options_path = config_path + '/options.json';
		fs.writeFileSync( options_path, JSON.stringify( this.Options ) );
		
		Skribi.log(" B this.Options: " + JSON.stringify( this.Options ));
		await this.MainWindow.webContents
			      .send('fromMain', [ FromMain_UPDATE_OPTIONS, options_data ]);
	} // async saveOptions()
	
	async resetOptions() {
		pretty_func_header_log( "ElectronMain.resetOptions" );
		
		let config_path  = app.getAppPath() + '/www/config';		
		let default_options_path = config_path + '/defaults/options.json';
		let default_options_str  = fs.readFileSync( default_options_path ).toString();
		Skribi.log("   default_options_str: " + default_options_str);
		this.Options = JSON.parse( default_options_str );
		await this.saveOptions( this.Options );
	} // async resetOptions()
	
	setCallbacks() {
		Skribi.log(">> " + _CYAN_ + "ElectronMain.setCallbacks" + _END_);
		
		// ====================== ToMain_RQ_QUIT_APP ======================
		//Skribi.log(">> register: " + ToMain_RQ_QUIT_APP);
		// called like this by Renderer: await window.ipcMain.QuitApp(data)
		ipcMain.handle( ToMain_RQ_QUIT_APP, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_QUIT_APP );
			app.quit();
		}); // "ToMain:Request/quit_app" event handler

		// ====================== ToMain_RQ_EXEC_CMD ======================
		// called like this by Renderer: await window.ipcMain.ExecuteCommand(data)
		ipcMain.handle( ToMain_RQ_EXEC_CMD, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_EXEC_CMD );
			const { cmd_name, cmd_args } = data;
			Skribi.log( "eMain.evtH('ExecCmd')> cmd_name: " + cmd_name );
			Skribi.log( "eMain.evtH('ExecCmd')> cmd_args: " + cmd_args );
			
			if ( cmd_name == CMD_OPEN_WALLET ) {
				await ElectronMain.GetInstance().openWits( cmd_args );
			}
		}); // "ToMain:Request/ExecCmd" event handler		

		// ====================== ToMain_RQ_LOG_2_MAIN_SYNC ======================
		// called like this by Renderer: window.ipcMain.logToMain(data)
		ipcMain.on( ToMain_RQ_LOG_2_MAIN, (event, data) => {
			Skribi.log( data );
		}); // "ToMain:Request/log2main" event handler
		
		// ====================== ToMain_RQ_LOG_2_MAIN_SYNC ======================
		// called like this by Renderer: await window.ipcMain.logToMainSync(data)
		ipcMain.handle( ToMain_RQ_LOG_2_MAIN_SYNC, async (event, data) => {
			Skribi.log( data );
		}); // "ToMain:Request/log2main_sync" event handler
		
		// ====================== ToMain_RQ_SET_WINDOW_TITLE ======================
		// called like this by Renderer: window.ipcMain.SetWindowTitle(data)
		ipcMain.on( ToMain_RQ_SET_WINDOW_TITLE, (event, data) => {
			// pretty_func_header_log( "[Electron]", ToMain_RQ_SET_WINDOW_TITLE );
			const { coin, wallet_mode } = data;
			ElectronMain.GetInstance().updateWindowTitle( coin, wallet_mode );
		}); // "ToMain:Request/set_window_title" event handler
		
		// ========================== ToMain_RQ_TOGGLE_DEBUG_PANEL ==========================
		// called like this by Renderer: window.ipcMain.ToggleDebugPanel(data)
		ipcMain.on( ToMain_RQ_TOGGLE_DEBUG_PANEL, (event, data) => {
			ElectronMain.GetInstance().toggleDebugPanel();
		}); // "ToMain:Request/toggle_debug_panel" event handler
		
		// ==================== ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER ====================
		// called like this by Renderer: window.ipcMain.ShowOutputFolderInExplorer()
		ipcMain.on( ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER, (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER );
      	    let output_path = app.getAppPath() + "\\_output";
			this.showFolderInExplorer( output_path );
		}); // "ToMain:Request/show_output_folder_in_explorer" event handler										  
		
		// ====================== ToMain_RQ_OPEN_URL ======================
		// called like this by Renderer: window.ipcMain.OpenURL(url)
		ipcMain.on( ToMain_RQ_OPEN_URL, (event, url) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_OPEN_URL );
			Skribi.log("eMain.evtH('OpnURL')> " + url);
			
			// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
			this.MainWindow.location = url;
		}); // "ToMain:Request/open_URL" event handler
		
		// ====================== ToMain_RQ_NEW_WALLET_INFO ======================
		//Skribi.log(">> register: " + ToMain_RQ_NEW_WALLET_INFO);
		// called like this by Renderer: await window.ipcMain.NewWalletInfo( data )
		ipcMain.handle( ToMain_RQ_NEW_WALLET_INFO, async ( event, data ) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_NEW_WALLET_INFO );
			Skribi.log( "eMain.evtH('NewWinf')>" );
			await ElectronMain.GetInstance().doFileNew();			
		}); // "ToMain:Request/new_wallet_info" event handler
		
		// ====================== ToMain_RQ_OPEN_WALLET_INFO ======================
		// called like this by Renderer: await window.ipcMain.OpenWalletInfo( data )
		ipcMain.handle( ToMain_RQ_OPEN_WALLET_INFO, async ( event, data ) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_OPEN_WALLET_INFO );
			await ElectronMain.GetInstance().doFileOpen();			
		}); // "ToMain:Request/open_wallet_info" event handler
		
		// ====================== ToMain_RQ_SAVE_WALLET_INFO ======================
		//Skribi.log(">> register: " + ToMain_RQ_SAVE_WALLET_INFO);
		// called like this by Renderer: window.ipcMain.SaveWalletInfo( data )
		ipcMain.on( ToMain_RQ_SAVE_WALLET_INFO, ( event, crypto_info ) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_SAVE_WALLET_INFO );
			Skribi.log( "eMain.evtH('SaveWinf')>" );	
			MainModel.GetInstance().saveWalletInfo( crypto_info );
		}); // "ToMain:Request/save_wallet_info" event handler
		
		// ====================== ToMain_RQ_RESET_OPTIONS ======================
		// called like this by Renderer: await window.ipcMain.ResetOptions( data )
		ipcMain.handle( ToMain_RQ_RESET_OPTIONS, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_RESET_OPTIONS );	
            Skribi.log( "eMain.evtH('RstOpt')>" );			
			ElectronMain.GetInstance().resetOptions();
		}); // "ToMain:Request/reset_options" event handler
		
		// ====================== ToMain_RQ_UPDATE_OPTIONS ======================
		// called like this by Renderer: await window.ipcMain.UpdateOptions( options_data )
		ipcMain.handle( ToMain_RQ_UPDATE_OPTIONS, async (event, options_data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_UPDATE_OPTIONS );
			
			if ( options_data == undefined ) {
				Skribi.log(">> " + _RED_ + ToMain_RQ_QUIT_APP + _END_);
			    app.quit();
			}
			
			// Skribi.log( "eMain.evtH('UpOpt')> options_data: " + JSON.stringify(options_data));
			this.Options = options_data;
			Skribi.log( "eMain.evtH('UpOpt')> this.Options: " + JSON.stringify( this.Options ));
			await this.MainWindow.webContents
			          .send('fromMain', [ FromMain_UPDATE_OPTIONS, this.Options ]);
		}); // "ToMain:Request/update_options" event handler
		
		// ====================== ToMain_RQ_SAVE_OPTIONS ======================
		//Skribi.log(">> register: " + ToMain_RQ_SAVE_OPTIONS);
		// called like this by Renderer: await window.ipcMain.SaveOptions( options_data )
		ipcMain.handle( ToMain_RQ_SAVE_OPTIONS, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_SAVE_OPTIONS );
			
			let options_data = data;
			pretty_log( "eMain.evtH('SaveOpt')> options_data: " + JSON.stringify(options_data) ); 
			ElectronMain.GetInstance().saveOptions( options_data );
			
			pretty_log( "eMain.evtH('SaveOpt')> this.Options: " + JSON.stringify( this.Options ) );
			await this.MainWindow.webContents
			          .send( 'fromMain', [ FromMain_UPDATE_OPTIONS, options_data ] );
		}); // "ToMain:Request/save_options" event handler
		
		const loadImageFromFile = ( image_file_path ) => {			
			let img_data_asURL = fs.readFileSync( image_file_path, {encoding: 'base64'} );
			let image_file_path_items = image_file_path.split('.');
			
			let image_file_extension  = "png";
			let items_count = image_file_path_items.length;
			if (items_count > 1) {
				image_file_extension = image_file_path_items[items_count-1].toLowerCase();
			    if (image_file_extension == "jpg") {
					image_file_extension = "jpeg";
				}
			    else if (image_file_extension == "svg") {
					image_file_extension = "svg+xml";
				}				
			}	
			//Skribi.log("   image_file_extension: " + image_file_extension);
			//Skribi.log("   img_data_asURL:\n" + img_data_asURL);
			this.MainWindow.webContents
			            .send('fromMain', 
						      [ FromMain_SEND_IMG_URL, ENTROPY_SOURCE_IMG_ID, 
							    img_data_asURL, image_file_extension ]);
			return img_data_asURL;
		}; // loadImageFromFile
		
		// ====================== ToMain_RQ_LOAD_IMG_FROM_FILE ======================
		// called like this by Renderer: await window.ipcMain.LoadImageFromFile(data)
		ipcMain.handle( ToMain_RQ_LOAD_IMG_FROM_FILE, async (event, image_file_path) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_LOAD_IMG_FROM_FILE );
			let img_data_asURL = loadImageFromFile( image_file_path );
			return img_data_asURL;
		}); // "ToMain:Request/load_image_from_file" event handler

		// ====================== ToMain_RQ_DRAW_RND_CRYPTO_LOGO ======================
		//Skribi.log(">> register: " + ToMain_RQ_DRAW_RND_CRYPTO_LOGO);
		// called like this by Renderer: await window.ipcMain.DrawRandomCryptoLogo(data)
		ipcMain.handle( ToMain_RQ_DRAW_RND_CRYPTO_LOGO, (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_DRAW_RND_CRYPTO_LOGO );
			
			let app_path = app.getAppPath();
			//Skribi.log("   app_path: " + app_path);
			
			let crypto_logos_path = app_path + "/www/img/CryptoCurrency";
			
			let crypto_logos = FileUtils.GetFilesInFolder( crypto_logos_path );
			//Skribi.log("   crypto_logos.length: " + crypto_logos.length);
			
			let image_file_path = crypto_logos_path + "/";
			let crypto_logo_filename = "Zilver_64px.svg";
			if (! this.FirstImageAsEntropySource ) {
				let	random_index = getRandomInt( crypto_logos.length );
		        crypto_logo_filename = crypto_logos[random_index];			
			}
			this.FirstImageAsEntropySource = false;
			image_file_path += crypto_logo_filename;
			
			let img_data_asURL = loadImageFromFile( image_file_path );
            return img_data_asURL;			
		}); // "ToMain:Request/drop_rnd_crypto_logo" event handler
		
		
		// ================== ToMain_RQ_GENERATE_PASSWORD ==================
		// called like this by Renderer: await window.ipcMain.GeneratePassword( data )
		// https://www.npmjs.com/package/generate-password
		ipcMain.handle( ToMain_RQ_GENERATE_PASSWORD, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_GENERATE_PASSWORD );
			// const {} = data;
			let new_password = PasswordGenerator.generate({
				length:                    24,
				numbers:                   true,
				//symbols:                   true,
				uppercase:                 true,
				lowercase:                 true,
				excludeSimilarCharacters : true,
				strict:                    true
			});

			return new_password;
		}); // "ToMain:Request/GeneratePassword event handler
		
		// ================== ToMain_RQ_GET_HD_WALLET ==================
		// called like this by Renderer: await window.ipcMain.GetHDWallet( data )
		ipcMain.handle( ToMain_RQ_GET_HD_WALLET, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_GET_HD_WALLET );
			const { entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index } = data;
			// pretty_log( "eMain.evtH('getHDW')> blockchain", blockchain );
			// pretty_log( "account", account );
			// pretty_log( "address_index", address_index );
			// Skribi.log("   options: " + JSON.stringify(options));
			let wallet = await HDWallet.GetWallet
			                   ( entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index );
			return wallet;
		}); // "ToMain:Request/get_hd_wallet" event handler
		
		// ================== ToMain_RQ_GET_SIMPLE_WALLET ==================
		// called like this by Renderer: await window.ipcMain.GetSimpleWallet( data )
		ipcMain.handle( ToMain_RQ_GET_SIMPLE_WALLET, async ( event, data ) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_GET_SIMPLE_WALLET );
			const { private_key, salt_uuid, blockchain, crypto_net } = data;
			// pretty_log( "eMain.evtH('getSW')> private_key", private_key );
			// pretty_log( "eMain.evtH('getSW')> salt_uuid", salt_uuid );
			// pretty_log( "eMain.evtH('getSW')> blockchain", blockchain );
			// pretty_log( "eMain.evtH('getSW')> crypto_net", crypto_net );
			if ( private_key == undefined || private_key == "" ) {
				throw new Error("ElectronMain ToMain_RQ_GET_SIMPLE_WALLET handler: 'private_key' NOT DEFINED");
			} 
			// Skribi.log("   options: " + JSON.stringify(options));
			let wallet = await SimpleWallet
			                   .GetWallet( private_key, salt_uuid, 
							               blockchain, crypto_net );
			return wallet;
		}); // "ToMain:Request/get_simple_wallet" event handler	
		
		// ================== ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsToHDWalletInfo( data )
		ipcMain.handle( ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO );
			const { mnemonics, options } = data;
			// Skribi.log("   options: " + JSON.stringify(options));
			let hdwallet_info = await Bip32Utils.MnemonicsToHDWalletInfo( mnemonics, options );
			return hdwallet_info;
		}); // "ToMain:Request/mnemonics_to_hd_wallet_info" event handler	

		// ================== ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO ===================
		// called like this by Renderer: await window.ipcMain.MnemonicsToEntropyInfo( data )
		ipcMain.handle( ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO );
			const { mnemonics, lang } = data;
			// Skribi.log("   lang: " + lang);
			let entropy_info = Bip39Utils.MnemonicsToEntropyInfo( mnemonics, lang );
			return entropy_info;
		}); // "ToMain:Request/mnemonics_to_entropy_info" event handler

		// ================== ToMain_RQ_ENTROPY_TO_MNEMONICS ===================
		// called like this by Renderer: await window.ipcMain.EntropyToMnemonics( data )
		ipcMain.handle( ToMain_RQ_ENTROPY_TO_MNEMONICS, async (event, data) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_ENTROPY_TO_MNEMONICS + _END_);
			const { entropy, lang } = data;
			// Skribi.log("   data_hex: " + data_hex);
			// Skribi.log("   options: " + JSON.stringify(options));
			let mnemonics = Bip39Utils.EntropyToMnemonics( entropy, lang );
			// Skribi.log(">> mnemonics: " + mnemonics); 
			return mnemonics;
		}); // "ToMain:Request/entropy_to_mnemonics" event handler
		
		// ================== ToMain_RQ_ENTROPY_TO_CHECKSUM ===================
		// called like this by Renderer: await window.ipcMain.EntropyToChecksum( data )
		ipcMain.handle( ToMain_RQ_ENTROPY_TO_CHECKSUM, async (event, data) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_ENTROPY_TO_CHECKSUM + _END_);
			const { entropy, options } = data;
			let checksum = Bip39Utils.EntropyToChecksum( entropy, options );
			return checksum;
		}); // "ToMain:Request/entropy_to_checksum" event handler
		
		// ================== ToMain_RQ_ENTROPY_SRC_TO_ENTROPY ==================
		// called like this by Renderer: await window.ipcMain.EntropySourceToEntropy( data )
		ipcMain.handle( ToMain_RQ_ENTROPY_SRC_TO_ENTROPY, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_ENTROPY_SRC_TO_ENTROPY );
			const { salted_entropy_src_str, options } = data;
			let entropy = Bip39Utils.EntropySourceToEntropy( salted_entropy_src_str, options );
			return entropy;
		}); // "ToMain:Request/entropy_src_to_entropy" event handler	

		// ================== ToMain_RQ_MNEMONICS_AS_4LETTER ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsAs4letter( data )
		ipcMain.handle( ToMain_RQ_MNEMONICS_AS_4LETTER, async (event, mnemonics) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_MNEMONICS_AS_4LETTER + _END_);
			// Skribi.log(">> data: " + data); 
			let mnemonics_as_4letter = Bip39Utils.MnemonicsAs4letter( mnemonics );
			// Skribi.log(">> mnemonics: " + mnemonics); 
			return mnemonics_as_4letter;
		}); // "ToMain:Request/mnemonics_as_4letter" event handler
		
		// ================== ToMain_RQ_MNEMONICS_AS_TWO_PARTS ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsAsTwoParts( data )
		ipcMain.handle( ToMain_RQ_MNEMONICS_AS_TWO_PARTS, async (event, mnemonics) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_MNEMONICS_AS_TWO_PARTS + _END_);
			// Skribi.log(">> data: " + data); 
			let mnemonics_as_two_parts = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
			// Skribi.log(">> mnemonics: " + mnemonics); 
			return mnemonics_as_two_parts;
		}); // "ToMain:Request/mnemonics_as_two_parts" event handler

		// ================== ToMain_RQ_GET_SECP256K1 ==================
		// called like this by Renderer: await window.ipcMain.GetSecp256k1( entropy )
		//ipcMain.handle( ToMain_RQ_GET_SECP256K1, (event, entropy) => {
		//	Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_GET_SECP256K1 + _END_);
		//	let entropy_is_hex = isHexString( entropy );
		//	Skribi.log("   entropy_is_hex: " + entropy_is_hex);
		//	let entropy_bytes = entropy.length/2;
		//	Skribi.log("   entropy(" + entropy_bytes + "):    " + entropy);
		//	let result = getSecp256k1PK( entropy );
		//	return result;
		//}); // "ToMain:Request/get_Secp256k1" event handler
		
		// =================== ToMain_RQ_GET_FORTUNE_COOKIE ==================
		// called like this by Renderer: await window.ipcMain.GetFortuneCookie()
		ipcMain.handle( ToMain_RQ_GET_FORTUNE_COOKIE, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_GET_FORTUNE_COOKIE );
			let fortune_cookie = this.getNewFortuneCookie();
			return fortune_cookie;
		}); // "ToMain:Request/get_FortuneCookie"

		// =============== ToMain_RQ_MNEMONICS_TO_WORD_INDEXES ===============
		// called like this by Renderer: await window.ipcMain.MnemonicsToWordIndexes( data )
		ipcMain.handle( ToMain_RQ_MNEMONICS_TO_WORD_INDEXES, async (event, data) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_MNEMONICS_TO_WORD_INDEXES + _END_);
			const { mnemonics, options } = data;
			let word_indexes = Bip39Utils.GetWordIndexes( mnemonics, options );
						
			return word_indexes;
		}); // "ToMain:Request/mnemonics_to_word_indexes" event handler

		// =============== ToMain_RQ_GUESS_MNEMONICS_LANG ===============
		// called like this by Renderer: await window.ipcMain.GuessMnemonicsLang( data )
		ipcMain.handle( ToMain_RQ_GUESS_MNEMONICS_LANG, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_GUESS_MNEMONICS_LANG );
			const { mnemonics } = data;
			let lang = Bip39Utils.GuessMnemonicsLang( mnemonics );

			return lang;
		}); // "ToMain:Request/guess_mnemonics_lang" event handler		
		
		// =================== ToMain_RQ_CHECK_MNEMONICS ====================
		// called like this by Renderer: await window.ipcMain.CheckMnemonics(data)
		ipcMain.handle( ToMain_RQ_CHECK_MNEMONICS, async (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_CHECK_MNEMONICS );
			const { mnemonics, options } = data;
			let check_result = Bip39Utils.CheckMnemonics( mnemonics, options );
			return check_result;
		}); // "ToMain:Request/check_mnemonics" event handler

		// ====================== ToMain_RQ_GET_UUID =======================
		// called like this by Renderer: await window.ipcMain.GetUUID(data)
		ipcMain.handle( ToMain_RQ_GET_UUID, async (event, data) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_GET_UUID + _END_);
			let new_uuidv4 = uuidv4();
			return new_uuidv4;
		}); // "ToMain:Request/get_UUID" event handler
		
		// ==================== ToMain_RQ_GET_L10N_KEYPAIRS =====================
		// called like this by Renderer: await window.ipcMain.GetL10nKeyPairs()
		ipcMain.handle( ToMain_RQ_GET_L10N_KEYPAIRS, (event, data) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_GET_L10N_KEYPAIRS + _END_);
			let L10n_keypairs = L10nUtils.GetKeyPairs();
			return L10n_keypairs;
		}); // "ToMain:Request/get_L10n_keypairs" event handler	

		// ==================== ToMain_RQ_GET_L10N_MSG =====================
		// called like this by Renderer: await window.ipcMain.GetLocalizedMsg(msg_id)
		ipcMain.handle( ToMain_RQ_GET_L10N_MSG, (event, msg_id) => {
			// Skribi.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + ToMain_RQ_GET_L10N_MSG + _END_);
			let L10n_msg = L10nUtils.GetLocalizedMsg( msg_id );
			return L10n_msg;
		}); // "ToMain:Request/get_L10n_Msg" event handler	
		
		// https://chasingcode.dev/blog/electron-toggle-menu-item-dynamically/
		// called like this by Renderer: window.ipcMain.SetMenuItemState( data )
		ipcMain.on( ToMain_RQ_SET_MENU_ITEM_STATE, (event, data) => {
			pretty_func_header_log( "[Electron]", ToMain_RQ_SET_MENU_ITEM_STATE );
			const { menu_item_id, enabled } = data;
			// pretty_log( "eMain.evtH('setMenuItemState')> menu_item_id(state)", menu_item_id + "(" + enabled + ")" );
			let menu_elt = Menu.getApplicationMenu().getMenuItemById( menu_item_id );
			// pretty_log( "eMain.evtH('setMenuItemState')> menu_elt", menu_elt );
			menu_elt.enabled = enabled;
		}); // "ToMain:Request/set_menu_item_state" event handler	
	} // setCallbacks()
} // ElectronMain class


// ========== Prevent Multiple instances of Electron main process ==========
// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron
if ( ! gotTheLock ) {
	app.quit();
} 
else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		let main_window = ElectronMain.GetInstance().getMainWindow();
		
		// Skribi.log("   >> 1. process.argv: " + JSON.stringify(process.argv));
		
		if ( main_window != null ) {
			if ( main_window ) {
				 main_window.restore(); 
			}
			main_window.focus()
		}
	}); // Manage case of second instance
	
	//ipcMain.on( 'get-file-data', (event, data) => {
	//	Skribi.log("   >> 'get-file-data': $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    //    this.getCmdLineArgs();			
	//} ); // 'get-file-data'
	
	// Create Electron main window, load the rest of the app, etc...
	app.whenReady().then( async () => {
		if (   process.platform.startsWith('win') 
			&& process.argv.length >= 2 ) {
			const in_file_path = process.argv[1];
			// Skribi.log( "   2. process.argv: "     + JSON.stringify(process.argv) );
			// Skribi.log( "   >>> in_file_path: " + in_file_path );
		}
		ElectronMain.GetInstance().createWindow();
		
		const TIME_OUT = 1250;
		let test_internet_connection_count = 0;
		let internet_connected = true;
		
		const check_internet_connection_fn = async () => {
			// https://stackoverflow.com/questions/44663864/correct-try-catch-syntax-using-async-await			
			internet_connected = true;
			await checkInternetConnected().catch( error => {
				  internet_connected = false;
            });
						              
			// console.log("> test_internet_connection_count: " + test_internet_connection_count++ + "  internet_connected = " + internet_connected);
						
			ElectronMain.GetInstance().getMainWindow().webContents.send
						( "fromMain", [ FromMain_INTERNET_CONNECTED, internet_connected ] );
						
			setTimeout( check_internet_connection_fn, TIME_OUT );
		}; // check_internet_connection_fn()

		await check_internet_connection_fn();
	});
}
// ========== Prevent Multiple instances of Electron main process
// =====================================================================================
