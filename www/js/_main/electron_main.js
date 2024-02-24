// =====================================================================================
// ================================   electron_main.js   ===============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

const fs       = require('fs');
const path     = require('path');
const sha256   = require('js-sha256');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, 
        _END_ 
	  }                                 = require('../util/color/color_console_codes.js');
const { ElectronWindow }                = require('./electron_window.js');	  
const { DID_FINISH_LOAD, HELP_ABOUT, VIEW_TOGGLE_DEVTOOLS,
       SET_RENDERER_VALUE, SET_INPUT_FIELD_VALUE, 
        REQUEST_HEX_TO_SEEDPHRASE, REQUEST_SEEDPHRASE_TO_PK, REQUEST_SEEDPHRASE_AS_4LETTER,
        REQUEST_GET_SHA256, 
		REQUEST_CHECK_SEEDPHRASE, REQUEST_SEEDPHRASE_TO_WORD_INDICES,
        REQUEST_FILE_SAVE, REQUEST_SAVE_PK_INFO, REQUEST_IMPORT_RAW_DATA		
	  }                                 = require('../_renderer/const_events.js');
const { getDayTimestamp }               = require('../util/system/timestamp.js');
const { Seedphrase_API }                = require('../crypto/seedphrase_api.js');
		
const MAIN_WINDOW_WIDTH  = 800;
const MAIN_WINDOW_HEIGHT = 500; 

let g_DidFinishLoad_FiredCount = 0;
		
const getRootPath = () => {
	return path.resolve(__dirname, '..');
} // getRootPath()

// https://github.com/electron/electron/issues/19775
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const ELECTRON_MAIN_MENU_TEMPLATE = [
	{ 	label: 'File',
		submenu: [ {  label: 'Save', 
					  click() { ElectronMain.DoFileSave(); }
			       },
				   {  label: 'Import', 
					  click() { ElectronMain.SelectFile(); }
			       },
				   {  label: 'Quit', 
					  click() { app.quit(); }
			       }
				 ]
	},
	{ 	label: 'View',
		submenu: [ {  label: 'Toggle Debug Panel', type: 'checkbox',
				      click() {
					      console.log('>> ' + _CYAN_ + '[Electron] ' + _YELLOW_ + VIEW_TOGGLE_DEVTOOLS + _END_);	
						  ElectronMain.ToggleDebugPanel();  
				      }		 
			       }
		         ]
	},
	{   role: 'help',
        submenu: [ {  label: 'About...',
				      click() { 
					      ElectronWindow.GetWindow().webContents.send('fromMain', [ HELP_ABOUT ]);
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
					
					ElectronWindow.GetWindow().webContents.send("fromMain", [ DID_FINISH_LOAD ]);
					
					//console.log("   Send : " + SET_RENDERER_VALUE + " = " + Cryptocalc_version);
					ElectronWindow.GetWindow().webContents.send("fromMain", [ SET_RENDERER_VALUE, Cryptocalc_version ]);
					
					ElectronMain.SetCallbacks();
				}
			} // 'did-finish-load' callback
		); // on 'did-finish-load' event handler
		
		ElectronWindow.GetWindow().loadFile('./index.html');
	} // ElectronMain.CreateWindow()
	
	static DoFileSave() {
		console.log(">> " + _CYAN_ + "ElectronMain.DoFileSave" + _END_);
		ElectronWindow.GetWindow().webContents.send("fromMain", [ REQUEST_FILE_SAVE ]);
	} // ElectronMain.DoFileSave()
	
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
					("fromMain", [ SET_INPUT_FIELD_VALUE, raw_data_str ]);
			}
		}).catch(err => {
			console.log(err)
		});
	} // ElectronMain.SelectFile()
	
	static SetCallbacks() {
		console.log(">> " + _CYAN_ + "ElectronMain.SetCallbacks" + _END_);

		// ====================== REQUEST_LOG_2_MAIN ======================
		// called like this by Renderer: window.ipcMain.log2Main(data)
		ipcMain.on("request:log2main", (event, data) => {
			console.log(data);
		}); // "request:log2main" event handler

		// ====================== REQUEST_SAVE_PK_INFO ======================
		// called like this by Renderer: window.ipcMain.SavePrivateKeyInfo(data)
		ipcMain.on(REQUEST_SAVE_PK_INFO, (event, crypto_info) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SAVE_PK_INFO + _END_);
			let timestamp = getDayTimestamp();
			let output_path = app.getAppPath() + "/_output/" + timestamp;
			
			if (! fs.existsSync(output_path)) {
				fs.mkdirSync(output_path, { recursive: true });
			}
			
			//console.log(timestamp);
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
			const { data_hex, lang } = data;
			//console.log("   data_hex: " + data_hex);
			//console.log("   lang: " + lang);
			let seedphrase = Seedphrase_API.FromSHASeed(data_hex, lang);
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
			//let sha_256_hex = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
			//return sha_256_hex;
		}); // "request:get_SHA256" event handler

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