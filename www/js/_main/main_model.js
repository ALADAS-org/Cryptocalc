// =====================================================================================
// ===============================     main_model.js     ===============================
// =====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

// ===============================  MainModel class  ===============================
// NB: "Singleton" class
// * static GetInstance()
// * async  updateOptions( options_data )
// *        doFileSave()
// *        getNewFortuneCookie()
// *        getUserSelectedFile()
// * async  loadSupportedBlockchains()
// * async  loadOptions()
// * async  setDefaultOptions()
// * async  updateOptions( options_data )
// * async  saveOptions( options_data )
// * async  resetOptions()
// * async  getAppVersion()
// ------------------------------------------------------
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
const { Bip32Utils }                    = require('../crypto/HDWallet/bip32_utils.js');

const DEFAULT_OPTIONS = {
	[DEFAULT_BLOCKCHAIN]: { [HD_WALLET_TYPE]:     "Bitcoin", 
	                        [SIMPLE_WALLET_TYPE]: "Bitcoin" },
	[WALLET_MODE]:        HD_WALLET_TYPE,
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
		   
class MainModel {
	static #key = {};
	static #_Singleton = new MainModel( this.#key );
	static #_InstanceCount = 0;
	
	static GetInstance() {
		if( MainModel.#_Singleton == undefined ) {
			MainModel.#_Singleton = new ElectronMain();
			if (MainModel.#_Singleton > 0) {
				throw new TypeError("MainModel constructor called more than once.");
			}
			MainModel.#_Singleton++;
        }
        return MainModel.#_Singleton;
    } // MainModel.GetInstance() 

    // ** Private constructor **
	constructor( key ) {
		if ( key !== ElectronMain.#key ) {
			throw new TypeError("MainModel constructor is private.");
		}
		
		this.initialized               = false;
	    this.Options                   = {};
        this.SupportedBlockchains      = {};		
	} // ** Private constructor **
	
	initialize( electron_main ) {
		this.electron_main = electron_main;
	    this.initialized   = true;		
	} // initialize()
	
	//doFileSave() {
	//	Konsola.log(">> " + _CYAN_ + "MainModel.doFileSave" + _END_);		
	//	this.MainWindow.webContents.send( "fromMain", [ FromMain_FILE_SAVE ] );
	//} // doFileSave()
	
	// File/Import/Random Fortune Cookie
	//getNewFortuneCookie() {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	let fortune_cookie = getFortuneCookie();
	//	Konsola.log("   fortune_cookie: " + getShortenedString( fortune_cookie) );
	//	this.MainWindow.webContents
	//		.send( "fromMain", 
	//	           [ FromMain_SET_FORTUNE_COOKIE, fortune_cookie ] );
	//} // getNewFortuneCookie()
	
	//getUserSelectedFile() {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	const browserWindow = BrowserWindow.getFocusedWindow();
	//	let input_path = app.getAppPath() + "\\_assets\\texts";
	//	Konsola.log("   input_path: " + input_path);
	//	//                     Modal window
	//	dialog.showOpenDialog( browserWindow, {
	//		defaultPath: input_path,
	//		filters:     [ { name: 'text file', extensions: ['txt'] } ],
	//		properties:  ['openFile']
	//	}).then(result => {
	//		if (result.filePaths != '') {
	//			let in_file_name = path.basename( result.filePaths[0] );
	//			Konsola.log("   " + in_file_name);
	//			const raw_data_str = fs.readFileSync( input_path + '//' + in_file_name, { encoding: 'utf8', flag: 'r' });
	//			//Konsole.log("   " + raw_data_str);
	//			this.MainWindow.webContents.send
	//				( "fromMain", [ FromMain_SET_SEED_FIELD_VALUE, raw_data_str ] );
	//		}
	//	}).catch(err => {
	//		Konsola.log(err)
	//	});
	//} // getUserSelectedFile()
	
	//async loadSupportedBlockchains() {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	let supported_blockchains_path = app.getAppPath() 
	//	                                 + '/www/js/crypto/supported_blockchains.json';
	//	const supported_blockchains_str = fs.readFileSync( supported_blockchains_path );
	//	this.SupportedBlockchains = JSON.parse( supported_blockchains_str );
	//	
	//	await this.MainWindow.webContents
	//		.send('fromMain', [ FromMain_SET_SUPPORTED_BLOCKCHAINS, 
	//			                this.SupportedBlockchains 
	//			              ]
	//			 );		
	//} // async loadSupportedBlockchains()
	
	//async loadOptions() {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	let config_path = app.getAppPath() + '/www/config';
	//	//Konsola.log("config_path: " + config_path);
	//	
	//	let options_path = config_path + '/options.json';
	//	if ( ! fs.existsSync( options_path ) ) { 
	//		await this.setDefaultOptions();
	//	}
	//	
	//	const options_str = fs.readFileSync( options_path );
	//	//Konsola.log("   options_str: " + options_str);
	//	
	//	if ( options_str == "[]"  ||  options_str == "{}" ) { 
	//		await this.setDefaultOptions();			
	//	}
	//	else {		
	//		this.Options = JSON.parse( options_str );		
    //    }
	//	
	//	Konsola.log(" A this.Options: " + JSON.stringify( this.Options ));
	//	await this.MainWindow.webContents
	//		.send('fromMain', [ FromMain_UPDATE_OPTIONS, this.Options ]);
	//} // async loadOptions()
	
	//async setDefaultOptions() {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	this.Options = DEFAULT_OPTIONS;
	//	await this.saveOptions( this.Options );
	//} // async setDefaultOptions()
	
	//async updateOptions( options_data ) {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	this.Options = options_data;
	//	Konsola.log("   this.Options: " + JSON.stringify( this.Options ));
	//} // async updateOptions()
	
	//async saveOptions( options_data ) {
	//	pretty_func_header_log( getFunctionCallerName() );
	//	this.Options = options_data;
	//	let config_path  = app.getAppPath() + '/www/config';		
	//	let options_path = config_path + '/options.json';
	//	fs.writeFileSync( options_path, JSON.stringify( this.Options ) );
	//	
	//	Konsola.log(" B this.Options: " + JSON.stringify( this.Options ));
	//	await this.MainWindow.webContents
	//		      .send('fromMain', [ FromMain_UPDATE_OPTIONS, options_data ]);
	//} // async saveOptions()
	
	async resetOptions() {
		pretty_func_header_log( getFunctionCallerName() );
		let config_path  = app.getAppPath() + '/www/config';		
		let default_options_path = config_path + '/defaults/options.json';
		let default_options_str  = fs.readFileSync( default_options_path ).toString();
		Konsola.log("   default_options_str: " + default_options_str);
		this.Options = JSON.parse( default_options_str );
		await this.saveOptions( this.Options );
	} // async resetOptions()
		
	async getAppVersion() { 
		pretty_func_header_log( getFunctionCallerName() );
		let input_path = process.cwd();
		pretty_log("input_path: ", input_path);
		let readme_path = input_path + '\\README.md';
		if ( ! fs.existsSync( readme_path ) ) { 	
			readme_path = input_path + '\\resources\\app\\README.md';
		}
		pretty_log("readme_path: ", readme_path);
		
	    let readme_1stline = await firstline( readme_path );
	
		pretty_log("readme_str_1stline: ", readme_str_1stline);
		let app_version = readme_1stline.toLowerCase()
		                  .replaceAll('cryptocalc','')
		                  .replaceAll('#','').replaceAll(' ','')
						  .replaceAll('\n','').replaceAll('\r','');
		pretty_log("app_version: ", app_version);
		return app_version;
	} // getAppVersion()
} // MainModel class