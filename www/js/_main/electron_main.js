// =====================================================================================
// ================================   electron_main.js   ===============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

const fs             = require('fs');
const path           = require('path');
const sha256         = require('js-sha256');
const wif            = require('wif');
const { v4: uuidv4 } = require('uuid');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, 
        _END_ 
	  }                                 = require('../util/color/color_console_codes.js');
const { ElectronWindow }                = require('./electron_window.js');	  
const { VIEW_TOGGLE_DEVTOOLS, 
        REQUEST_LOG_2_MAIN, REQUEST_OPEN_URL,
        REQUEST_HEX_TO_SEEDPHRASE, REQUEST_SEEDPHRASE_TO_PK, REQUEST_SEEDPHRASE_AS_4LETTER,
        REQUEST_GET_SHA256, REQUEST_GET_UUID, REQUEST_GET_L10N_MSG,
		REQUEST_GET_SECP256K1, REQUEST_GET_WIF,
		REQUEST_CHECK_SEEDPHRASE, REQUEST_SEEDPHRASE_TO_WORD_INDICES,
		REQUEST_SAVE_PK_INFO, REQUEST_IMPORT_RAW_DATA,
		REQUEST_GET_FORTUNE_COOKIE,
		
		REQUEST_GET_ETHEREUM_WALLET, REQUEST_GET_COINKEY_WALLET, REQUEST_GET_HD_WALLET, 
		
		FromMain_DID_FINISH_LOAD,
        FromMain_FILE_SAVE, FromMain_HELP_ABOUT,
		FromMain_SET_FORTUNE_COOKIE, 
        FromMain_SET_RENDERER_VALUE, FromMain_SET_SEED_FIELD_VALUE 		
	  }                                 = require('../_renderer/const_events.js');
	  
const { NULL_COIN, 
		BITCOIN, ETHEREUM, 
		BINANCE, SOLANA, CARDANO, RIPPLE, AVALANCHE, DOGECOIN, LITECOIN,
		MAINNET, TESTNET,
		BLOCKCHAIN, NULL_BLOCKCHAIN,
		COIN_ABBREVIATIONS
}                                       = require('../crypto/const_blockchains.js');

const { getDayTimestamp }               = require('../util/system/timestamp.js');
const { Seedphrase_API }                = require('../crypto/seedphrase_api.js');
const { hexToBytes, hexWithoutPrefix }  = require('../crypto/hex_utils.js');
const { getSecp256k1PK }                = require('../crypto/crypto_utils.js');
const { getFortuneCookie }              = require('../util/fortune/fortune.js');
const { getL10nMsg }                    = require('../L10n/get_L10n_msg.js');

const { Ethereum_API }                  = require('../crypto/ethereum_api.js');
const { CoinKey_API }                   = require('../crypto/coinkey_api.js');
		
const MAIN_WINDOW_WIDTH  = 800;
const MAIN_WINDOW_HEIGHT = 600; 

let g_DidFinishLoad_FiredCount = 0;
		
const getRootPath = () => {
	return path.resolve(__dirname, '..');
} // getRootPath()

// https://github.com/electron/electron/issues/19775
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const ELECTRON_MAIN_MENU_TEMPLATE = [
	{ 	label: getL10nMsg("File"),
		submenu: [ {  label:  getL10nMsg("Save"), 
					  click() { ElectronMain.DoFileSave(); }
			       },
				   {  label: getL10nMsg("Import"), 
					  submenu: [ {  label: getL10nMsg("FromFile"), 
									click() { ElectronMain.SelectFile(); }
							     },
								 {  label: getL10nMsg("FortuneCookie"), 
									click() { ElectronMain.GetFortuneCookie(); }
							     },
				               ]
				   },
				   {  label: getL10nMsg("Quit"), 
					  click() { app.quit(); }
			       }
				 ]
	},
	{ 	label: getL10nMsg("View"),
		submenu: [ {  label: getL10nMsg("ToggleDebug"), type: 'checkbox',
				      click() {
					      console.log('>> ' + _CYAN_ + '[Electron] ' + _YELLOW_ + VIEW_TOGGLE_DEVTOOLS + _END_);	
						  ElectronMain.ToggleDebugPanel();  
				      }		 
			       }
		         ]
	},
	{   label: getL10nMsg("Help"), //"Help"
        submenu: [ {  label: getL10nMsg("About"), //'About...',
				      click() { 
					      ElectronWindow.GetWindow().webContents.send('fromMain', [ FromMain_HELP_ABOUT ]);
			          }
                   }
                 ]
    }
]; // menu_template

const gotTheLock       = app.requestSingleInstanceLock();
let   gShow_DebugPanel = false;

const error_handler = (err) => { 
	if (err) return console.log("error: " + err);
	console.log('saving file... '+ filename); 
}; // error_handler()

class ElectronMain {
	//==================== createWindow() ====================
	// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
	static CreateWindow() {
		console.log(">> " + _CYAN_ + "ElectronMain.CreateWindow" + _END_);

		// to Hide 'Security Warning'
		process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
		
		//console.log(__dirname);
		let main_window = new BrowserWindow({
			width:  MAIN_WINDOW_WIDTH, height: MAIN_WINDOW_HEIGHT,
			//icon:   path.join(__dirname, "../../icons/ZCash_rev_icn.png"),
			webPreferences: {
					contextIsolation: true, // NB: 'true' is default value but keep it there anyway
					preload:          path.join(__dirname, "./preload.js")
				}
		});
		ElectronWindow.SetWindow(main_window);
			
		const menu_bar = Menu.buildFromTemplate(ELECTRON_MAIN_MENU_TEMPLATE);
		Menu.setApplicationMenu(menu_bar);	
		
		//ipcMain_toggleDebugPanel();
		
		// https://www.electronjs.org/docs/latest/api/web-contents#instance-events
		// https://stackoverflow.com/questions/42284627/electron-how-to-know-when-renderer-window-is-ready
		// Note: index.html loaded twice (first index.html redirect)
		// ==================== 'did-finish-load' event handler ====================
		ElectronWindow.GetWindow().webContents.on('did-finish-load', 
			() => {
				//console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load --" + _END_);
				
				// Note: must load twice (I suspect because of first 'index.html' redirect)
				g_DidFinishLoad_FiredCount++;
				
				if (g_DidFinishLoad_FiredCount == 2) {
					console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load " + _END_ + "FiredCount==2");	
					
					//---------- Set 'Cryptocalc_version' in Renderer GUI ----------
					let Cryptocalc_version = process.env.npm_package_version;
					//console.log("   Cryptocalc: " + Cryptocalc_version);				
					ElectronWindow.GetWindow().setTitle('Cryptocalc ' + Cryptocalc_version); 
					//---------- Set 'Cryptocalc_version' in Renderer GUI
					
					ElectronWindow.GetWindow().webContents.send("fromMain", [ FromMain_DID_FINISH_LOAD ]);
					
					//console.log("   Send : " + FromMain_SET_RENDERER_VALUE + " = " + Cryptocalc_version);
					ElectronWindow.GetWindow().webContents.send("fromMain", [ FromMain_SET_RENDERER_VALUE, Cryptocalc_version ]);
					
					// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
					// Open urls in the user's browser
					// nB: Triggeted by 'Renderer_GUI.OnExploreWallet()'
					ElectronWindow.GetWindow().webContents.setWindowOpenHandler((edata) => {
						shell.openExternal(edata.url);
						return { action: "deny" };
					});
					
					ElectronMain.SetCallbacks();
				}
			} // 'did-finish-load' callback
		); // ==================== 'did-finish-load' event handler
		
		ElectronWindow.GetWindow().loadFile('./index.html');
	} // ElectronMain.CreateWindow()
	
	static DoFileSave() {
		console.log(">> " + _CYAN_ + "ElectronMain.DoFileSave" + _END_);		
		ElectronWindow.GetWindow().webContents.send("fromMain", [ FromMain_FILE_SAVE ]);
	} // ElectronMain.DoFileSave()
	
	// File/Import/Random Fortune CookieI
	static GetFortuneCookie() {
		console.log(">> " + _CYAN_ + "ElectronMain.GetFortuneCookie" + _END_);
		let fortune_cookie = getFortuneCookie();
		ElectronWindow.GetWindow().webContents.send("fromMain", [ FromMain_SET_FORTUNE_COOKIE, fortune_cookie ]);
	} // ElectronMain.GetFortuneCookie()
	
	static ToggleDebugPanel() {
		console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + "ToggleDebugPanel" + _END_);
		gShow_DebugPanel = ! gShow_DebugPanel;
		
		if (gShow_DebugPanel) {
			ElectronWindow.GetWindow().webContents.openDevTools();
		}
		else {
			ElectronWindow.GetWindow().webContents.closeDevTools();
		}
		//ElectronWindow.GetWindow().webContents.send
		//	("fromMain", [ "View/ToggleDebugPanel", gShow_DebugPanel ]);
	} // ElectronMain.ToggleDebugPanel()
	
	static SelectFile() {
		console.log(">> " + _CYAN_ + "ElectronMain.SelectFile" + _END_);
		const browserWindow = BrowserWindow.getFocusedWindow();
		let input_path = app.getAppPath() + "\\_assets\\texts";
		console.log("   input_path: " + input_path);
		//                     Modal window
		dialog.showOpenDialog( browserWindow, {
			defaultPath: input_path,
			filters:     [ { name: 'text file', extensions: ['txt'] } ],
			properties:  ['openFile']
		}).then(result => {
			if (result.filePaths != '') {
				let in_file_name = path.basename(result.filePaths[0]);
				console.log("   " + in_file_name);
				const raw_data_str = fs.readFileSync(input_path + '//' + in_file_name, { encoding: 'utf8', flag: 'r' });
				//console.log("   " + raw_data_str);
				ElectronWindow.GetWindow().webContents.send
					("fromMain", [ FromMain_SET_SEED_FIELD_VALUE, raw_data_str ]);
			}
		}).catch(err => {
			console.log(err)
		});
	} // ElectronMain.SelectFile()
	
	static SetCallbacks() {
		console.log(">> " + _CYAN_ + "ElectronMain.SetCallbacks" + _END_);

		// ====================== REQUEST_LOG_2_MAIN ======================
		// called like this by Renderer: window.ipcMain.log2Main(data)
		ipcMain.on(REQUEST_LOG_2_MAIN, (event, data) => {
			console.log(data);
		}); // "request:log2main" event handler
		
		// ====================== REQUEST_OPEN_URL ======================
		// called like this by Renderer: window.ipcMain.OpenURL(url)
		ipcMain.on(REQUEST_OPEN_URL, (event, url) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_OPEN_URL + _END_);
			console.log("   URL: " + url);
			
			// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
			ElectronWindow.GetWindow().location = url;
			
			
			//const browser_window = new BrowserWindow();
			//browser_window.webContents.setWindowOpenHandler(({ url }) => {
			//	// config.fileProtocol is my custom file protocol
			//	if (url.startsWith(config.fileProtocol)) {
			//		return { action: 'allow' };
			//	}
			//	// open url in a browser and prevent default
			//	shell.openExternal(url);
			//	return { action: 'deny' };
			//});
		}); // "request:open_URL" event handler

		// ====================== REQUEST_SAVE_PK_INFO ======================
		// called like this by Renderer: window.ipcMain.SavePrivateKeyInfo(data)
		ipcMain.on(REQUEST_SAVE_PK_INFO, (event, crypto_info) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SAVE_PK_INFO + _END_);
			let timestamp = getDayTimestamp();
			let output_path = app.getAppPath() + "/_output/" + timestamp;
			
			let coin = COIN_ABBREVIATIONS[crypto_info[BLOCKCHAIN]];
			output_path = output_path + "_" + coin;
			console.log("   " + output_path);
			
			if (! fs.existsSync(output_path)) {
				fs.mkdirSync(output_path, { recursive: true });
			}		
			
			//console.log(JSON.stringify(crypto_info));

			fs.writeFileSync( output_path + "/pk_info.json", JSON.stringify(crypto_info), error_handler );
			
			let pk_info_str = "";
			let pk_keys = Object.keys(crypto_info); 
			for (let i=0; i < pk_keys.length; i++) {
				let current_key = pk_keys[i];
				pk_info_str += current_key.padEnd(22,' ') + crypto_info[current_key] + "\n";
			}
			fs.writeFileSync( output_path + "/private_key_info.txt", pk_info_str, error_handler );
		}); // "request:save_pk_info" event handler
		
		
		// ====================== REQUEST_IMPORT_RAW_DATA ======================
		// called like this by Renderer: window.ipcMain.ImportRawData(data)
		ipcMain.on(REQUEST_IMPORT_RAW_DATA, (event, crypto_info) => {
			ElectronMain.SelectFile();
        }); // "request:import_raw_data" event handler


		// ================== REQUEST_SEEDPHRASE_TO_PK ===================
		// called like this by Renderer: await window.ipcMain.SeedPhraseToPrivateKey(data)
		ipcMain.handle(REQUEST_SEEDPHRASE_TO_PK, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SEEDPHRASE_TO_PK + _END_);
			const { seedphrase, lang } = data;
			let private_key_hex = Seedphrase_API.ToPrivateKey(seedphrase, lang);
			return private_key_hex;
		}); // "request:seedphrase_to_pk" event handler

		// ================== REQUEST_HEX_TO_SEEDPHRASE ===================
		// called like this by Renderer: await window.ipcMain.HexToSeedPhrase(data)
		ipcMain.handle(REQUEST_HEX_TO_SEEDPHRASE, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_HEX_TO_SEEDPHRASE + _END_);
			const { pk_hex_value, lang } = data;
			//console.log("   data_hex: " + data_hex);
			//console.log("   lang: " + lang);
			let seedphrase = Seedphrase_API.FromSHASeed(pk_hex_value, lang);
			//console.log(">> seedphrase: " + seedphrase); 
			return seedphrase;
		}); // "request:hex_to_seedphrase" event handler

		// ================== REQUEST_SEEDPHRASE_AS_4LETTER ==================
		// called like this by Renderer: await window.ipcMain.SeedphraseAs4letter(data)
		ipcMain.handle(REQUEST_SEEDPHRASE_AS_4LETTER, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SEEDPHRASE_AS_4LETTER + _END_);
			//console.log(">> data: " + data); 
			let seedphrase_as_4letter = Seedphrase_API.As4letter(data);
			//console.log(">> seedphrase: " + seedphrase); 
			return seedphrase_as_4letter;
		}); // "request:seedphrase_as_4letter" event handler

		// ================== REQUEST_GET_SHA256 ==================
		// called like this by Renderer: await window.ipcMain.GetSHA256(data)
		ipcMain.handle(REQUEST_GET_SHA256, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_SHA256 + _END_);
			let hash = sha256.create();
			hash.update(data);
			return hash.hex();
		}); // "request:get_SHA256" event handler		
		
		// ================== REQUEST_GET_SECP256K1 ==================
		// called like this by Renderer: await window.ipcMain.GetSecp256k1(sha256_hex)
		ipcMain.handle(REQUEST_GET_SECP256K1, (event, sha256_hex) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_SECP256K1 + _END_);
			let result = getSecp256k1PK(sha256_hex);
			return result;
		}); // "request:get_Secp256k1" event handler		
		
		// ================== REQUEST_GET_WIF ==================
		// called like this by Renderer: await window.ipcMain.GetWIF(sha256_hex)
		ipcMain.handle(REQUEST_GET_WIF, (event, sha256_hex) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_WIF + _END_);
			var private_key = Buffer.from(hexWithoutPrefix(sha256_hex), 'hex');
            var key = wif.encode(128, private_key, true); // for the testnet use: wif.encode(239, ...
			return key;
		}); // "request:get_WIF" event handler
		
		// ================== REQUEST_GET_UUID ==================
		// called like this by Renderer: await window.ipcMain.GetUUID(data)
		ipcMain.handle(REQUEST_GET_UUID, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_UUID + _END_);
			let new_uuidv4 = uuidv4();
			return new_uuidv4;
		}); // "request:get_UUID" event handler
		
		// ================== REQUEST_GET_L10N_MSG ==================
		// called like this by Renderer: await window.ipcMain.GetL10nMsg(msg_id)
		ipcMain.handle(REQUEST_GET_L10N_MSG, (event, msg_id) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_L10N_MSG + _END_);
			let L10n_msg = getL10nMsg(msg_id);
			return L10n_msg;
		}); // "request:get_L10n_Msg" event handler
		
		
		// ================== REQUEST_GET_FORTUNE_COOKIE ==================
		// called like this by Renderer: await window.ipcMain.GetFortuneCookie()
		ipcMain.handle(REQUEST_GET_FORTUNE_COOKIE, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_FORTUNE_COOKIE + _END_);
			let fortune_cookie = getFortuneCookie();
			return fortune_cookie;
		}); // "request:get_FortuneCookie"

		// ================== REQUEST_SEEDPHRASE_TO_WORD_INDICES ==================
		// called like this by Renderer: await window.ipcMain.SeedPhraseToWordIndices(data)
		ipcMain.handle(REQUEST_SEEDPHRASE_TO_WORD_INDICES, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SEEDPHRASE_TO_WORD_INDICES + _END_);
			const { seedphrase, lang } = data;
			let word_indices = Seedphrase_API.GetWordIndices(seedphrase, lang);
			return word_indices;
		}); // "request:seedphrase_to_word_indices" event handler

		// ================== REQUEST_CHECK_SEEDPHRASE ==================
		// called like this by Renderer: await window.ipcMain.CheckSeedPhrase(data)
		ipcMain.handle(REQUEST_CHECK_SEEDPHRASE, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_CHECK_SEEDPHRASE + _END_);
			const { seedphrase, lang, wordcount } = data;
			let check_result = Seedphrase_API.CheckSeedphrase(seedphrase, lang, wordcount);
			return check_result;
		}); // "request:check_seedphrase" event handler
		
		
		// ================== REQUEST_GET_ETHEREUM_WALLET ==================
		// called like this by Renderer: await window.ipcMain.GetEthereumWallet(data)
		ipcMain.handle(REQUEST_GET_ETHEREUM_WALLET, (event, in_data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_ETHEREUM_WALLET + _END_);
			const { private_key, salt_uuid, blockchain } = in_data;
			let wallet = Ethereum_API.GetWallet(private_key, salt_uuid, blockchain, MAINNET);
			return wallet;
		}); // "request:get_ETH_wallet" event handler
		
		// ========== REQUEST_GET_COINKEY_WALLET ==========
		// called like this by Renderer: await window.ipcMain.GetCoinKeyWallet(data)
		ipcMain.handle(REQUEST_GET_COINKEY_WALLET, (event, in_data) => {
			console.log(  '>> ' + _CYAN_ + '[Electron] ipcMain.handle: ' 
						+ _YELLOW_ + REQUEST_GET_COINKEY_WALLET + _END_);
			const { private_key, salt_uuid, blockchain } = in_data;
			let wallet = CoinKey_API.GetWallet(private_key, salt_uuid, blockchain, MAINNET);
			return wallet;
		}); // "request:get_coinkey_wallet" event handler (invoke/handle)
		
		// ================== REQUEST_GET_HD_WALLET ==================
		// called like this by Renderer: await window.ipcMain.GetHDWallet(data)
		ipcMain.handle(REQUEST_GET_HD_WALLET, (event, in_data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_HD_WALLET + _END_);
			const { private_key, salt_uuid, blockchain } = in_data;
			let wallet = Ethereum_API.GetWallet(private_key, salt_uuid, blockchain, MAINNET);
			return wallet;
		}); // "request:get_HD_wallet" event handler
		
	} // ElectronMain.SetCallbacks()
} // ElectronMain class

// ========== Prevent Multiple instances of Electron main process ==========
// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron
if (! gotTheLock) {
	app.quit();
} 
else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
	// Someone tried to run a second instance, we should focus our window.
	if (ElectronWindow.GetWindow() != null) {
			if (ElectronWindow.GetWindow()) {
				ElectronWindow.GetWindow().restore(); 
			}
			ElectronWindow.GetWindow().focus()
		}
	}) // Manage case of second instance

	// Create Electron main window, load the rest of the app, etc...
	app.whenReady().then(() => {
		ElectronMain.CreateWindow();
	})
}
// ========== Prevent Multiple instances of Electron main process