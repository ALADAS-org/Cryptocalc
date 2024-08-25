// ====================================================================================
// ===============================   electron_main.js   ===============================
// ====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

// ===============================  ElectronMain class  ===============================
// NB: "Singleton" class
// * static GetInstance()
//          createBrowserWindow( url )
// * async  updateOptions( options_data )
// *        getMainWindow()
// *        getMenuTemplate()
// *        createWindow()
// *        doFileSave()
// *        getNewFortuneCookie()
// *        toggleDebugPanel()
// *        getUserSelectedFile()
// * async  loadSupportedBlockchains()
// * async  loadOptions()
// * async  setDefaultOptions()
// * async  updateOptions( options_data )
// * async  saveOptions( options_data )
// * async  resetOptions()
// *        setCallbacks()
// * async  getAppVersion()
// ------------------------------------------------------
const MAIN_WINDOW_WIDTH  = 1040; // NB: 'width' is wider because of 'Cardano'
const MAIN_WINDOW_HEIGHT = 630; 

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

require('v8-compile-cache');

const { Konsola }      = require('../util/log/konsola.js');

const fs               = require('fs');
const firstline        = require('firstline');
const path             = require('path');
const sha256           = require('js-sha256');
const { v4: uuidv4 }   = require('uuid');
const bwipjs           = require('bwip-js');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, _END_ 
	  }                = require('../util/color/color_console_codes.js');
	  
const { getFunctionCallerName,
        pretty_func_header_log,
        pretty_log }   = require('../util/log/log_utils.js');
	  
const { APP_VERSION, 
        BLOCKCHAIN, NULL_BLOCKCHAIN, DEFAULT_BLOCKCHAIN,
        WALLET_MODE, HD_WALLET_TYPE, SIMPLE_WALLET_TYPE,
		WALLET_SAVE_PATH, MNEMONICS, WIF, ENTROPY_SIZE, 
		GUI_THEME  }   = require('../const_keywords.js');

const { VIEW_TOGGLE_DEVTOOLS, TOOLS_OPTIONS,
        REQUEST_QUIT_APP, REQUEST_LOG_2_MAIN, 
		REQUEST_TOGGLE_DEBUG_PANEL,
		REQUEST_OPEN_URL, REQUEST_SHOW_OUTPUT_FOLDER_IN_EXPLORER,
		REQUEST_LOAD_IMG_FROM_FILE, REQUEST_DRAW_RND_CRYPTO_LOGO,
		
		REQUEST_MNEMONICS_TO_ENTROPY_INFO, 
		
		REQUEST_MNEMONICS_TO_HD_WALLET_INFO, 
		REQUEST_GET_SIMPLE_WALLET,
		REQUEST_GET_SIMPLE_WALLET_FROM_MNEMONICS,
		
		REQUEST_ENTROPY_TO_MNEMONICS, REQUEST_ENTROPY_TO_CHECKSUM,
		REQUEST_ENTROPY_SRC_TO_ENTROPY,	REQUEST_ENTROPY_SRC_TO_PK,	

		REQUEST_MNEMONICS_AS_4LETTER,
        REQUEST_GET_UUID, 
		
		REQUEST_GET_L10N_KEYPAIRS, REQUEST_GET_L10N_MSG, 
		
		REQUEST_GET_SECP256K1,
		REQUEST_CHECK_MNEMONICS, 
		REQUEST_MNEMONICS_TO_WORD_INDEXES, REQUEST_GUESS_MNEMONICS_LANG,
		REQUEST_SAVE_WALLET_INFO, 
		REQUEST_SAVE_OPTIONS, REQUEST_RESET_OPTIONS, REQUEST_UPDATE_OPTIONS,
		REQUEST_IMPORT_RAW_DATA, REQUEST_GET_FORTUNE_COOKIE,		
		
		REQUEST_GET_HD_WALLET, 
		REQUEST_GET_HD_SOLANA_WALLET,
		
		FromMain_DID_FINISH_LOAD,
        FromMain_FILE_SAVE, FromMain_HELP_ABOUT,
		FromMain_TOOLS_OPTIONS_DIALOG, FromMain_UPDATE_OPTIONS, 
		FromMain_SEND_IMG_URL,
		FromMain_SET_FORTUNE_COOKIE, 
        FromMain_SET_RENDERER_VALUE, FromMain_SET_SEED_FIELD_VALUE,
        FromMain_SET_SUPPORTED_BLOCKCHAINS 		
	  }                                 = require('../const_events.js');
	  
const { ENTROPY_SOURCE_IMG_ID
      }                                 = require('../_renderer/const_renderer.js');
	  
const { NULL_COIN, 
		ETHEREUM, AVALANCHE,
		BITCOIN, DOGECOIN, LITECOIN,
		BINANCE, SOLANA, CARDANO, 
		RIPPLE, TRON, BITCOIN_CASH, EOS, FIRO,
		MAINNET, TESTNET,
		COIN_ABBREVIATIONS
      }                                 = require('../crypto/const_blockchains.js');
	  
const { ADDRESS, PRIV_KEY, 
        PRIVATE_KEY_HEX   
      }                                 = require('../crypto/const_wallet.js');

const { getShortenedString }            = require('../util/values/string_utils.js');	  
const { getDayTimestamp }               = require('../util/system/timestamp.js');
const { FileUtils }                     = require('../util/system/file_utils.js');
const { Bip39Utils }                    = require('../crypto/bip39_utils.js');
const { hexToBytes, hexToB64,
        hexWithoutPrefix, hexWithPrefix,
        isHexString, getRandomInt  }    = require('../crypto/hex_utils.js');
const { getFortuneCookie }              = require('../util/fortune/fortune.js');
const { L10nUtils }                     = require('../L10n/L10n_utils.js');

const { Bip32Utils }                    = require('../crypto/HDWallet/bip32_utils.js');
const { SolanaHD_API }                  = require('../crypto/HDWallet/solana_hd_api.js');

const { SimpleWallet }                  = require('../crypto/SimpleWallet/simple_wallet.js');
const { HDWallet }                      = require('../crypto/HDWallet/hd_wallet.js');

const DEFAULT_OPTIONS = {
	[DEFAULT_BLOCKCHAIN]: { [HD_WALLET_TYPE]:     "Bitcoin", 
	                        [SIMPLE_WALLET_TYPE]: "Bitcoin" },
	[WALLET_MODE]:        SIMPLE_WALLET_TYPE,
	[ENTROPY_SIZE]:       { [HD_WALLET_TYPE]:"128", [SIMPLE_WALLET_TYPE]: "256" },
	"Blockchains": { 
		[HD_WALLET_TYPE]:     [ "Bitcoin","Ethereum","Solana",
                                "Ripple","DogeCoin","Cardano","TRON",
					            "Avalanche","Bitcoin Cash",
								"LiteCoin","Firo" ], 
		[SIMPLE_WALLET_TYPE]: [ "Bitcoin","Ethereum","Solana",
                                "DogeCoin","Avalanche","LiteCoin"] 
	},
	[WALLET_SAVE_PATH]:"$CRYPTOCALC/_output",
	[GUI_THEME]:       "Default"
}; // DEFAULT_OPTIONS

const gotTheLock = app.requestSingleInstanceLock();

const error_handler = (err) => { 
	if (err) return Konsole.log("error: " + err);
	Konsola.log('saving file... '+ filename); 
}; // error_handler()

class ElectronMain {
	static #key = {};
	static #_Singleton = new ElectronMain( this.#key );
	static #_InstanceCount = 0;
	
	static GetInstance() {
		if( ElectronMain.#_Singleton == undefined ) {
			ElectronMain.#_Singleton = new ElectronMain();
			if (ElectronMain.#_Singleton > 0) {
				throw new TypeError("ElectronMain constructor called more than once.");
			}
			ElectronMain.#_Singleton++;
        }
        return ElectronMain.#_Singleton;
    } // ElectronMain.GetInstance() 

    // ** Private constructor **
	constructor( key ) {
		if ( key !== ElectronMain.#key ) {
			throw new TypeError("ElectronMain constructor is private.");
		}
		
		this.DidFinishLoad_FiredCount  = 0;
		this.Show_DebugPanel           = false;
		
		this.MainWindow                = null;
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
	
	// https://github.com/electron/electron/issues/19775
	// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
	getMenuTemplate() {
		let ELECTRON_MAIN_MENU_TEMPLATE = [
			{ 	label: L10nUtils.GetLocalizedMsg("File"),
				submenu: [ {  label:  L10nUtils.GetLocalizedMsg("Save"), 
							  click() { ElectronMain.GetInstance().doFileSave(); }
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
								  ElectronMain.GetInstance().toggleDebugPanel();  
							  }		 
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
							 submenu: [
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
		//Konsola.log(">> " + _CYAN_ + "ElectronMain.createWindow" + _END_);
		Konsola.log(">> " + _CYAN_ + "ElectronMain.createWindow" + _END_);

		// to Hide 'Security Warning'
		process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
		
		//Konsola.log(__dirname);
		this.MainWindow = new BrowserWindow(
			{ width:  MAIN_WINDOW_WIDTH, 
			  height: MAIN_WINDOW_HEIGHT,
			  icon:   path.join(__dirname, "../../icons/Cryptocalc_Icon.png"),
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
				//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load --" + _END_);
				
				// Note: must load twice (I suspect because of first 'index.html' redirect)
				this.DidFinishLoad_FiredCount++;
				
				if ( this.DidFinishLoad_FiredCount == 2 ) {
					Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load " + _END_ + "FiredCount==2");	
					
					//---------- Set 'Cryptocalc_version' in Renderer GUI ----------
					let Cryptocalc_version = process.env.npm_package_version;
					if (   Cryptocalc_version == undefined 
					    || Cryptocalc_version == "undefined")  {
						Cryptocalc_version = await this.getAppVersion();						
					}
					//Konsola.log("   Cryptocalc: " + Cryptocalc_version);				
					this.MainWindow.setTitle('Cryptocalc ' + Cryptocalc_version); 
					//---------- Set 'Cryptocalc_version' in Renderer GUI
					
					this.MainWindow.webContents.send
						( "fromMain", [ FromMain_DID_FINISH_LOAD ] );
					
					//Konsola.log("   Send : " + FromMain_SET_RENDERER_VALUE + " = " + Cryptocalc_version);
					this.MainWindow.webContents.send
						( "fromMain", [ FromMain_SET_RENDERER_VALUE, Cryptocalc_version ] );
					
					// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
					// Open urls in the user's browser
					// nB: Triggered by 'RendererGUI.OnExploreWallet()'
					this.MainWindow.webContents.setWindowOpenHandler( (edata) => {
						shell.openExternal(edata.url);
						return { action: "deny" };
					} );
					
					await this.loadOptions();
					await this.loadSupportedBlockchains();
					
					this.setCallbacks();
				}
			} // 'did-finish-load' callback
		); // ==================== 'did-finish-load' event handler
		
		this.MainWindow.loadFile( './index.html' );
	} // createWindow()
	
	doFileSave() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.doFileSave" + _END_);		
		this.MainWindow.webContents.send( "fromMain", [ FromMain_FILE_SAVE ] );
	} // doFileSave()
	
	// https://stackoverflow.com/questions/43991267/electron-open-file-directory-in-specific-application
	showFolderInExplorer( folder_path) {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.showFolderInExplorer" + _END_);	
		shell.openPath( folder_path );
    } // showFolderInExplorer()
	
	// File/Import/Random Fortune Cookie
	getNewFortuneCookie() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.getNewFortuneCookie" + _END_);
		let fortune_cookie = getFortuneCookie();
		Konsola.log("   fortune_cookie: " + getShortenedString( fortune_cookie) );
		this.MainWindow.webContents
			.send( "fromMain", 
		           [ FromMain_SET_FORTUNE_COOKIE, fortune_cookie ] );
	} // getNewFortuneCookie()
	
	toggleDebugPanel() {
		Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + "toggleDebugPanel" + _END_);
		this.Show_DebugPanel = ! this.Show_DebugPanel;
		
		if ( this.Show_DebugPanel )
			this.MainWindow.webContents.openDevTools();
		else
			this.MainWindow.webContents.closeDevTools();
	} // toggleDebugPanel()
	
	getUserSelectedFile() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.getUserSelectedFile" + _END_);
		const browserWindow = BrowserWindow.getFocusedWindow();
		let input_path = app.getAppPath() + "\\_assets\\texts";
		Konsola.log("   input_path: " + input_path);
		//                     Modal window
		dialog.showOpenDialog( browserWindow, {
			defaultPath: input_path,
			filters:     [ { name: 'text file', extensions: ['txt'] } ],
			properties:  ['openFile']
		}).then(result => {
			if (result.filePaths != '') {
				let in_file_name = path.basename( result.filePaths[0] );
				Konsola.log("   " + in_file_name);
				const raw_data_str = fs.readFileSync( input_path + '//' + in_file_name, { encoding: 'utf8', flag: 'r' });
				//Konsole.log("   " + raw_data_str);
				this.MainWindow.webContents.send
					( "fromMain", [ FromMain_SET_SEED_FIELD_VALUE, raw_data_str ] );
			}
		}).catch(err => {
			Konsola.log(err)
		});
	} // getUserSelectedFile()
	
	async loadSupportedBlockchains() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.loadSupportedBlockchains" + _END_);
		let supported_blockchains_path = app.getAppPath() 
		                                 + '/www/js/crypto/supported_blockchains.json';
		const supported_blockchains_str = fs.readFileSync( supported_blockchains_path );
		this.SupportedBlockchains = JSON.parse( supported_blockchains_str );
		
		await this.MainWindow.webContents
			.send('fromMain', [ FromMain_SET_SUPPORTED_BLOCKCHAINS, 
				                this.SupportedBlockchains 
				              ]
				 );		
	} // async loadSupportedBlockchains()
	
	async loadOptions() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.loadOptions" + _END_);
		let config_path = app.getAppPath() + '/www/config';
		//Konsola.log("config_path: " + config_path);
		
		let options_path = config_path + '/options.json';
		if ( ! fs.existsSync( options_path ) ) { 
			await this.setDefaultOptions();
		}
		
		const options_str = fs.readFileSync( options_path );
		//Konsola.log("   options_str: " + options_str);
		
		if ( options_str == "[]"  ||  options_str == "{}" ) { 
			await this.setDefaultOptions();			
		}
		else {		
			this.Options = JSON.parse( options_str );		
        }
		
		Konsola.log(" A this.Options: " + JSON.stringify( this.Options ));
		await this.MainWindow.webContents
			.send('fromMain', [ FromMain_UPDATE_OPTIONS, this.Options ]);
		
		
	} // async loadOptions()
	
	async setDefaultOptions() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.resetOptions" + _END_);
		this.Options = DEFAULT_OPTIONS;
		await this.saveOptions( this.Options );
	} // async setDefaultOptions()
	
	async updateOptions( options_data ) {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.updateOptions" + _END_);
		this.Options = options_data;
		Konsola.log("   this.Options: " + JSON.stringify( this.Options ));
	} // async updateOptions()
	
	async saveOptions( options_data ) {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.saveOptions" + _END_);
		this.Options = options_data;
		let config_path  = app.getAppPath() + '/www/config';		
		let options_path = config_path + '/options.json';
		fs.writeFileSync( options_path, JSON.stringify( this.Options ) );
		
		Konsola.log(" B this.Options: " + JSON.stringify( this.Options ));
		await this.MainWindow.webContents
			      .send('fromMain', [ FromMain_UPDATE_OPTIONS, options_data ]);
	} // async saveOptions()
	
	async resetOptions() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.resetOptions" + _END_);
		let config_path  = app.getAppPath() + '/www/config';		
		let default_options_path = config_path + '/defaults/options.json';
		let default_options_str  = fs.readFileSync( default_options_path ).toString();
		Konsola.log("   default_options_str: " + default_options_str);
		this.Options = JSON.parse( default_options_str );
		await this.saveOptions( this.Options );
	} // async resetOptions()
	
	setCallbacks() {
		Konsola.log(">> " + _CYAN_ + "ElectronMain.setCallbacks" + _END_);
		
		// ====================== REQUEST_QUIT_APP ======================
		// called like this by Renderer: window.ipcMain.QuitApp(data)
		ipcMain.handle( REQUEST_QUIT_APP, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_QUIT_APP );
			app.quit();
		}); // "request:quit_app" event handler
		

		// ====================== REQUEST_LOG_2_MAIN ======================
		// called like this by Renderer: window.ipcMain.log2Main(data)
		ipcMain.on( REQUEST_LOG_2_MAIN, (event, data) => {
			Konsola.log(data);
		}); // "request:log2main" event handler
		
		// ====================== REQUEST_TOGGLE_DEBUG_PANEL ======================
		// called like this by Renderer: window.ipcMain.ToggleDebugPanel(data)
		ipcMain.on( REQUEST_TOGGLE_DEBUG_PANEL, (event, data) => {
			this.toggleDebugPanel();
		}); // "request:toggle_debug_panel" event handler
		
		// ==================== REQUEST_SHOW_OUTPUT_FOLDER_IN_EXPLORER ====================
		// called like this by Renderer: window.ipcMain.ShowOutputFolderInExplorer()
		ipcMain.on( REQUEST_SHOW_OUTPUT_FOLDER_IN_EXPLORER, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_SHOW_OUTPUT_FOLDER_IN_EXPLORER );
      	    let output_path = app.getAppPath() + "\\_output";
			this.showFolderInExplorer( output_path );
		}); // "request:show_output_folder_in_explorer" event handler										  
		
		// ====================== REQUEST_OPEN_URL ======================
		// called like this by Renderer: window.ipcMain.OpenURL(url)
		ipcMain.on( REQUEST_OPEN_URL, (event, url) => {
			pretty_func_header_log( "[Electron]", REQUEST_OPEN_URL );
			Konsola.log("   URL: " + url);
			
			// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
			this.MainWindow.location = url;
		}); // "request:open_URL" event handler
		
		// https://github.com/metafloor/bwip-js/blob/master/README.md
		const createQRCode = ( path, filename, qrcode_text, qrcode_type, filetype ) => {
			 // pretty_func_header_log( "[Electron] createQRCode", filename );
			 if ( filetype == undefined ) {
				filetype = "png";
			 }
			 
			 let options = {};
			 options["text"]            = qrcode_text;
			 options["bcid"]            = qrcode_type;	
			 options["backgroundcolor"] = "FFFFFF";
			 options["showborder"]      = true;
			 options["borderwidth"]     = 1;
			 options["bordercolor"]     = "FFFFFF";
			 
			 const writePNGfile = ( err, png_data ) => {
				if ( err ) { // `err` may be a string or Error object
				     Konsola.log("error " + err);
				} 
				else {
				  fs.writeFileSync( path + "/" + filename, png_data, "binary", 
					 (err) => { if ( ! err ) 
								  Konsola.log(`${filename} created successfully!`);
							  }
				  );
				}
			 }; // writePNGfile
			 
			 let qrcode_text_bit_count = 256;
			 if ( qrcode_type == "rectangularmicroqrcode" ) {				
				let version = "R15x77";
                if ( isHexString(qrcode_text) )  {
					qrcode_text_bit_count = (qrcode_text.length / 2) * 8;			
					if (qrcode_text_bit_count <= 192) { 			
						version = "R15x59";
					}
                }				
				options["version"] = version;
				options["eclevel"] = "M";
			 }	
			
			 if ( filetype == "png" ) {			
				if (qrcode_type == "qrcode") {	
				    options["scale"]  = 1;				
					options["width"]  = 250;
					options["height"] = 250;
				}	
				else if (qrcode_type == "rectangularmicroqrcode") {	
				    options["scale"] = 5;
				}	
				bwipjs.toBuffer( options, writePNGfile );
			 }
			 else if ( filetype == "svg" ) {
				//Konsola.log("qrcode_text: '" + qrcode_text + "'");
				options["scale"] = 1;
	
				let svg_data = bwipjs.toSVG( options );
				fs.writeFileSync( path + "/" + filename, svg_data, "binary", 
					 (err) => { if ( ! err ) 
								  Konsola.log(`${filename} created successfully!`);
							  }
				);
			 }
        }; // createQRCode
		
		// ====================== REQUEST_SAVE_WALLET_INFO ======================
		// called like this by Renderer: window.ipcMain.SaveWalletInfo(data)
		ipcMain.on( REQUEST_SAVE_WALLET_INFO, (event, crypto_info) => {
			pretty_func_header_log( "[Electron]", REQUEST_SAVE_WALLET_INFO );
			
			let timestamp   = getDayTimestamp();
			let output_path = app.getAppPath() + "/_output/" + timestamp;
			
			let blockchain = crypto_info[BLOCKCHAIN];
			pretty_log( "blockchain", crypto_info[BLOCKCHAIN] );
			
			let coin = COIN_ABBREVIATIONS[blockchain];
			pretty_log( "coin", coin );
			output_path = output_path + "_" + coin;
			//Konsola.log("   " + output_path);
			
			if (! fs.existsSync(output_path)) {
				fs.mkdirSync(output_path, { recursive: true });
			}		
			
			let wallet_info_str = "";
			let wallet_keys = Object.keys(crypto_info);
			
            let private_key = "";
            let pk_key      = "";
            let wif         = ""; 
            let entropy     = crypto_info["Entropy"];
			
			for ( let i=0; i < wallet_keys.length; i++ ) {
				let current_key = wallet_keys[i];
				// pretty_log( "current_key", current_key );
				
				if (   current_key == PRIV_KEY 
				    || current_key == PRIVATE_KEY_HEX || current_key == "Private Key" ) {
					
                    pk_key = current_key;
                    //Konsola.log("wallet_keys[" + i + "]: " + current_key);					
                    private_key = crypto_info[pk_key];	
                    //Konsola.log("private_key: " + private_key);					
				}				
				else {
					//Konsola.log("wallet_keys[" + i + "]: " + current_key);
				}
				
				if ( current_key == WIF ) {					
                    wif = crypto_info[current_key];					
				}				
				
				let end_of_line = '\n';
				if ( i == wallet_keys.length ) {
					end_of_line = '';
                }					
				wallet_info_str += current_key.padEnd(22,' ') + crypto_info[current_key] + end_of_line;
			}
			
			fs.writeFileSync( output_path + "/wallet_info.txt", wallet_info_str, error_handler );
		
		    createQRCode( output_path, "Address.png", crypto_info['address'], 'qrcode' );			
			
			pretty_log( "private_key", private_key );
			if ( private_key != "" ) {
				createQRCode( output_path, "PrivateKey.png", private_key, 'qrcode' );
            }
			
			if ( wif != "" ) {
				createQRCode( output_path, "WIF.png", wif, 'qrcode' );
            }
			createQRCode( output_path, "Seedphrase.png",        crypto_info['Seedphrase'], 'qrcode' );
			createQRCode( output_path, "Entropy_rMQR.png",      entropy, 'rectangularmicroqrcode', 'png' );
			createQRCode( output_path, "Entropy_Ultracode.png", entropy, 'ultracode', 'png' );
			
			//-------- SVG output --------
			FileUtils.CreateSubfolder( output_path, "svg" );
				createQRCode( output_path + "/svg", "Address.svg",      crypto_info['address'], 'qrcode', 'svg' );
				if ( private_key != "" ) {
					createQRCode( output_path, "PrivateKey.png",          private_key, 'qrcode' );				
					createQRCode( output_path + "/svg", "PrivateKey.svg", private_key, 'qrcode', 'svg' );
				}
				createQRCode( output_path + "/svg", "Entropy_rMQR.svg", entropy, 'rectangularmicroqrcode', 'svg' );
				createQRCode( output_path + "/svg", "Entropy_Ultracode.svg", entropy, "ultracode", 'svg' );
			    if ( wif != "" ) {
				    createQRCode( output_path + "/svg", "WIF.svg", wif, 'qrcode', 'svg' );
                }			
				createQRCode( output_path + "/svg", "Seedphrase.svg", crypto_info['Seedphrase'], 'qrcode', 'svg' );
		    //-------- SVG output
		}); // "request:save_wallet_info" event handler
		
		// ====================== REQUEST_RESET_OPTIONS ======================
		// called like this by Renderer: window.ipcMain.ResetOptions( data )
		ipcMain.handle( REQUEST_RESET_OPTIONS, async (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_RESET_OPTIONS );				
			ElectronMain.GetInstance().resetOptions();
		}); // "request:reset_options" event handler
		
		// ====================== REQUEST_UPDATE_OPTIONS ======================
		// called like this by Renderer: await window.ipcMain.UpdateOptions( options_data )
		ipcMain.handle( REQUEST_UPDATE_OPTIONS, (event, options_data) => {
			pretty_func_header_log( "[Electron]", REQUEST_UPDATE_OPTIONS );
			
			if ( options_data == undefined ) {
				Konsola.log(">> " + _RED_ + REQUEST_QUIT_APP + _END_);
			    app.quit();
			}
			
			Konsola.log("   options_data: " + JSON.stringify(options_data));
			this.Options = options_data;
			Konsola.log(" C this.Options: " + JSON.stringify( this.Options ));
			this.MainWindow.webContents
			            .send('fromMain', [ FromMain_UPDATE_OPTIONS, this.Options ]);
		}); // "request:update_options" event handler
		
		// ====================== REQUEST_SAVE_OPTIONS ======================
		// called like this by Renderer: await window.ipcMain.SaveOptions( options_data )
		ipcMain.handle( REQUEST_SAVE_OPTIONS, async (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_SAVE_OPTIONS );
			
			let options_data = data;
			Konsola.log(" D  options_data: " + JSON.stringify(options_data)); 
			ElectronMain.GetInstance().saveOptions( options_data );
			
			Konsola.log(" D this.Options: " + JSON.stringify( this.Options ));
			await this.MainWindow.webContents
			          .send('fromMain', [ FromMain_UPDATE_OPTIONS, options_data ]);
		}); // "request:save_options" event handler
			
		// ====================== REQUEST_IMPORT_RAW_DATA ======================
		// called like this by Renderer: window.ipcMain.ImportRawData(data)
		ipcMain.on( REQUEST_IMPORT_RAW_DATA, ( event, crypto_info ) => {
			this.getUserSelectedFile();
        }); // "request:import_raw_data" event handler
		
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
			//Konsola.log("   image_file_extension: " + image_file_extension);
			//Konsola.log("   img_data_asURL:\n" + img_data_asURL);
			this.MainWindow.webContents
			            .send('fromMain', 
						      [ FromMain_SEND_IMG_URL, ENTROPY_SOURCE_IMG_ID, 
							    img_data_asURL, image_file_extension ]);
			return img_data_asURL;
		}; // loadImageFromFile
		
		// ====================== REQUEST_LOAD_IMG_FROM_FILE ======================
		// called like this by Renderer: window.ipcMain.LoadImageFromFile(data)
		ipcMain.handle( REQUEST_LOAD_IMG_FROM_FILE, (event, image_file_path) => {
			pretty_func_header_log( "[Electron]", REQUEST_LOAD_IMG_FROM_FILE );
			let img_data_asURL = loadImageFromFile( image_file_path );
			return img_data_asURL;
		}); // "request:load_image_from_file" event handler

		// ====================== REQUEST_DRAW_RND_CRYPTO_LOGO ======================
		// called like this by Renderer: window.ipcMain.DrawRandomCryptoLogo(data)
		ipcMain.handle( REQUEST_DRAW_RND_CRYPTO_LOGO, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_DRAW_RND_CRYPTO_LOGO );
			
			let app_path = app.getAppPath();
			//Konsola.log("   app_path: " + app_path);
			
			let crypto_logos_path = app_path + "/www/img/CryptoCurrency";
			
			let crypto_logos = FileUtils.GetFilesInFolder( crypto_logos_path );
			//Konsola.log("   crypto_logos.length: " + crypto_logos.length);
			
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
		}); // "request:drop_rnd_crypto_logo" event handler
		
		// ========== REQUEST_GET_SIMPLE_WALLET_FROM_MNEMONICS ==========
		// called like this by Renderer: await window.ipcMain.GetSimpleWalletFromMnemonics( data )
		//ipcMain.handle( REQUEST_GET_SIMPLE_WALLET_FROM_MNEMONICS, async (event, data) => {
		//	Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_SIMPLE_WALLET + _END_);
		//	const { mnemonics, salt_uuid, blockchain, crypto_net } = data;
		//	Konsola.log("   mnemonics: " + mnemonics);
		//	let wallet = await SimpleWallet
		//	                   .GetWalletFromMnemonics
		//					   ( mnemonics, salt_uuid, 
		//					     blockchain, crypto_net );
		//	return wallet;
		//}); // "request:get_simple_wallet_from_mnemonics" event handler
		
		// ================== REQUEST_GET_HD_WALLET ==================
		// called like this by Renderer: await window.ipcMain.GetHDWallet( data )
		ipcMain.handle( REQUEST_GET_HD_WALLET, async (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_GET_HD_WALLET );
			const { entropy_hex, salt_uuid, blockchain, crypto_net, account, address_index } = data;
			//Konsola.log("   options: " + JSON.stringify(options));
			let wallet = await HDWallet.GetWallet( entropy_hex, salt_uuid, 
							                       blockchain, crypto_net, account, address_index );
			return wallet;
		}); // "request:get_hd_wallet" event handler
		
		// ================== REQUEST_GET_SIMPLE_WALLET ==================
		// called like this by Renderer: await window.ipcMain.GetSimpleWallet( data )
		ipcMain.handle( REQUEST_GET_SIMPLE_WALLET, async (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_GET_SIMPLE_WALLET );
			const { private_key, salt_uuid, blockchain, crypto_net } = data;
			//Konsola.log("   options: " + JSON.stringify(options));
			let wallet = await SimpleWallet
			                   .GetWallet( private_key, salt_uuid, 
							               blockchain, crypto_net );
			return wallet;
		}); // "request:get_simple_wallet" event handler	
		
		// ================== REQUEST_MNEMONICS_TO_HD_WALLET_INFO ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsToHDWalletInfo( data )
		ipcMain.handle( REQUEST_MNEMONICS_TO_HD_WALLET_INFO, async (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_MNEMONICS_TO_HD_WALLET_INFO );
			const { mnemonics, options } = data;
			//Konsola.log("   options: " + JSON.stringify(options));
			let hdwallet_info = await Bip32Utils.MnemonicsToHDWalletInfo( mnemonics, options );
			return hdwallet_info;
		}); // "request:mnemonics_to_hd_wallet_info" event handler	

		// ================== REQUEST_MNEMONICS_TO_ENTROPY_INFO ===================
		// called like this by Renderer: await window.ipcMain.MnemonicsToEntropyInfo( data )
		ipcMain.handle( REQUEST_MNEMONICS_TO_ENTROPY_INFO, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_MNEMONICS_TO_ENTROPY_INFO );
			const { mnemonics, lang } = data;
			//Konsola.log("   lang: " + lang);
			let entropy_info = Bip39Utils.MnemonicsToEntropyInfo( mnemonics, lang );
			return entropy_info;
		}); // "request:mnemonics_to_entropy_info" event handler

		// ================== REQUEST_ENTROPY_TO_MNEMONICS ===================
		// called like this by Renderer: await window.ipcMain.EntropyToMnemonics( data )
		ipcMain.handle( REQUEST_ENTROPY_TO_MNEMONICS, (event, data) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_ENTROPY_TO_MNEMONICS + _END_);
			const { entropy, options } = data;
			//Konsola.log("   data_hex: " + data_hex);
			//Konsola.log("   options: " + JSON.stringify(options));
			let mnemonics = Bip39Utils.EntropyToMnemonics( entropy, options );
			//Konsola.log(">> mnemonics: " + mnemonics); 
			return mnemonics;
		}); // "request:entropy_to_mnemonics" event handler
		
		// ================== REQUEST_ENTROPY_TO_CHECKSUM ===================
		// called like this by Renderer: await window.ipcMain.EntropyToChecksum( data )
		ipcMain.handle( REQUEST_ENTROPY_TO_CHECKSUM, (event, data) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_ENTROPY_TO_CHECKSUM + _END_);
			const { entropy, options } = data;
			let checksum = Bip39Utils.EntropyToChecksum( entropy, options );
			return checksum;
		}); // "request:entropy_to_checksum" event handler
		
		// ================== REQUEST_ENTROPY_SRC_TO_ENTROPY ==================
		// called like this by Renderer: await window.ipcMain.EntropySourceToEntropy( data )
		ipcMain.handle( REQUEST_ENTROPY_SRC_TO_ENTROPY, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_ENTROPY_SRC_TO_ENTROPY );
			const { entropy_src_str, options } = data;
			let entropy = Bip39Utils.EntropySourceToEntropy( entropy_src_str, options );
			return entropy;
		}); // "request:entropy_src_to_entropy" event handler	

		// ================== REQUEST_MNEMONICS_AS_4LETTER ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsAs4letter( data )
		ipcMain.handle( REQUEST_MNEMONICS_AS_4LETTER, (event, mnemonics) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_MNEMONICS_AS_4LETTER + _END_);
			//Konsola.log(">> data: " + data); 
			let mnemonics_as_4letter = Bip39Utils.MnemonicsAs4letter( mnemonics );
			//Konsola.log(">> mnemonics: " + mnemonics); 
			return mnemonics_as_4letter;
		}); // "request:mnemonics_as_4letter" event handler

		// ================== REQUEST_GET_SECP256K1 ==================
		// called like this by Renderer: await window.ipcMain.GetSecp256k1( entropy )
		//ipcMain.handle( REQUEST_GET_SECP256K1, (event, entropy) => {
		//	Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_SECP256K1 + _END_);
		//	let entropy_is_hex = isHexString( entropy );
		//	Konsola.log("   entropy_is_hex: " + entropy_is_hex);
		//	let entropy_bytes = entropy.length/2;
		//	Konsola.log("   entropy(" + entropy_bytes + "):    " + entropy);
		//	let result = getSecp256k1PK( entropy );
		//	return result;
		//}); // "request:get_Secp256k1" event handler
		
		// =================== REQUEST_GET_FORTUNE_COOKIE ==================
		// called like this by Renderer: await window.ipcMain.GetFortuneCookie()
		ipcMain.handle( REQUEST_GET_FORTUNE_COOKIE, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_GET_FORTUNE_COOKIE );
			let fortune_cookie = this.getNewFortuneCookie();
			return fortune_cookie;
		}); // "request:get_FortuneCookie"

		// =============== REQUEST_MNEMONICS_TO_WORD_INDEXES ===============
		// called like this by Renderer: await window.ipcMain.MnemonicsToWordIndexes( data )
		ipcMain.handle( REQUEST_MNEMONICS_TO_WORD_INDEXES, (event, data) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_MNEMONICS_TO_WORD_INDEXES + _END_);
			const { mnemonics, options } = data;
			let word_indexes = Bip39Utils.GetWordIndexes( mnemonics, options );
						
			return word_indexes;
		}); // "request:mnemonics_to_word_indexes" event handler

		// =============== REQUEST_GUESS_MNEMONICS_LANG ===============
		// called like this by Renderer: await window.ipcMain.GuessMnemonicsLang( data )
		ipcMain.handle( REQUEST_GUESS_MNEMONICS_LANG, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_GUESS_MNEMONICS_LANG );
			const { mnemonics } = data;
			let lang = Bip39Utils.GuessMnemonicsLang( mnemonics );

			return lang;
		}); // "request:lang" event handler		
		
		// =================== REQUEST_CHECK_MNEMONICS ====================
		// called like this by Renderer: await window.ipcMain.CheckSeedPhrase(data)
		ipcMain.handle( REQUEST_CHECK_MNEMONICS, (event, data) => {
			pretty_func_header_log( "[Electron]", REQUEST_CHECK_MNEMONICS );
			const { mnemonics, options } = data;
			let check_result = Bip39Utils.CheckMnemonics( mnemonics, options );
			return check_result;
		}); // "request:check_mnemonics" event handler

		// ====================== REQUEST_GET_UUID =======================
		// called like this by Renderer: await window.ipcMain.GetUUID(data)
		ipcMain.handle( REQUEST_GET_UUID, (event, data) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_UUID + _END_);
			let new_uuidv4 = uuidv4();
			return new_uuidv4;
		}); // "request:get_UUID" event handler
		
		// ==================== REQUEST_GET_L10N_KEYPAIRS =====================
		// called like this by Renderer: await window.ipcMain.GetL10nKeyPairs()
		ipcMain.handle( REQUEST_GET_L10N_KEYPAIRS, (event, data) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_L10N_KEYPAIRS + _END_);
			let L10n_keypairs = L10nUtils.GetKeyPairs();
			return L10n_keypairs;
		}); // "request:get_L10n_keypairs" event handler	

		// ==================== REQUEST_GET_L10N_MSG =====================
		// called like this by Renderer: await window.ipcMain.GetLocalizedMsg(msg_id)
		ipcMain.handle( REQUEST_GET_L10N_MSG, (event, msg_id) => {
			//Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_L10N_MSG + _END_);
			let L10n_msg = L10nUtils.GetLocalizedMsg( msg_id );
			return L10n_msg;
		}); // "request:get_L10n_Msg" event handler	
		
	} // setCallbacks()
	
	async getAppVersion() { 
	    Konsola.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + "getAppVersion" + _END_);
		let input_path = process.cwd();
		Konsola.log("   input_path: " + input_path);
		let readme_path = input_path + '\\README.md';
		if ( ! fs.existsSync( readme_path ) ) { 	
			readme_path = input_path + '\\resources\\app\\README.md';
		}
		Konsola.log("   > readme_path: " + readme_path);
		
	    let readme_1stline = await firstline( readme_path );
	
		Konsola.log("   readme_str_1stline: " + readme_1stline);
		let app_version = readme_1stline.toLowerCase()
		                  .replaceAll('cryptocalc','')
		                  .replaceAll('#','').replaceAll(' ','')
						  .replaceAll('\n','').replaceAll('\r','');
		Konsola.log("   app_version: '" + app_version + "'");
		return app_version;
	} // getAppVersion()
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
		
		Konsola.log("   >> process.argv: " + JSON.stringify(process.argv));
		
		if ( main_window != null ) {
			if ( main_window ) {
				 main_window.restore(); 
			}
			main_window.focus()
		}
	}); // Manage case of second instance
	
	ipcMain.on('get-file-data', (event, data) => {
		Konsola.log("   >> 'get-file-data': " + JSON.stringify(process.argv));
	}); // 'get-file-data'
	
	// Create Electron main window, load the rest of the app, etc...
	app.whenReady().then(() => {
		if (   process.platform.startsWith('win') 
			&& process.argv.length >= 2 ) {
			const in_file_path = process.argv[1];
			Konsola.log("   process.argv: " + JSON.stringify(process.argv));
			Konsola.log("   in_file_path: " + in_file_path);
		}
		ElectronMain.GetInstance().createWindow();
	});
}
// ========== Prevent Multiple instances of Electron main process// =====================================================================================
