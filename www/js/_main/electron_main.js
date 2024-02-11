// =====================================================================================
// ================================   electron_main.js   ===============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

const path = require('path');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, 
        _END_ 
	  }                                 = require('../util/color/color_console_codes.js');
const { ElectronWindow }                = require('./electron_window.js');	  
const { DID_FINISH_LOAD, HELP_ABOUT,
        VIEW_TOGGLE_DEVTOOLS,
        REQUEST_HEX_TO_SEEDPHRASE,
        REQUEST_SEEDPHRASE_AS_4LETTER } = require('../_renderer/const_events.js');
const { Seedphrase_API }                = require('../crypto/seedphrase_api.js');
		
const MAIN_WINDOW_WIDTH  = 800;
const MAIN_WINDOW_HEIGHT = 400; 

let g_DidFinishLoad_FiredCount = 0;
		
const getRootPath = () => {
	return path.resolve(__dirname, '..');
} // getRootPath()

// https://github.com/electron/electron/issues/19775
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const ELECTRON_MAIN_MENU_TEMPLATE = [
	{ 	label: 'File',
		submenu: [ {  label: 'Quit', 
					  click() { app.quit(); }
			       }
				 ]
	},
	{ 	label: 'View',
		submenu: [ {  label: 'Toggle Debug Panel', type: 'checkbox',
				      click() {
					      console.log('>> ' + _CYAN_ + '[Electron] ' + _YELLOW_ + VIEW_TOGGLE_DEVTOOLS + _END_);	
						  ipcMain_toggleDebugPanel();  
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

//==================== createWindow() ====================
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const createWindow = () => {
	console.log(">> " + _CYAN_ + "[Electron]" + _END_ + " createWindow");

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
			
			// Note: must load twice (I suspect because of first index.html redirect)
			g_DidFinishLoad_FiredCount++;
			
			if (g_DidFinishLoad_FiredCount == 2) {
                console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load " + _END_ + "FiredCount==2");				
				//---------- Set 'Silverquote_version' in Renderer GUI ----------
				//let Silverquote_version = process.env.npm_package_version;
				//console.log('>> Silverquote_version: ' + Silverquote_version);				
				//ElectronWindow.GetWindow().setTitle('Silverquote ' + Silverquote_version); 
				//ipcMain_sendToBrowser_SilverquoteVersion(Silverquote_version);
				//---------- Set 'Silverquote_version' in Renderer GUI		
				ElectronWindow.GetWindow().webContents.send("fromMain", [ DID_FINISH_LOAD ]);
			}
		} // 'did-finish-load' callback
	); // on 'did-finish-load' event handler
	
	ElectronWindow.GetWindow().loadFile('./index.html');
}; // createWindow()
//==================== createWindow()

const ipcMain_toggleDebugPanel = () => {
	console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + "toggleDebugPanel" + _END_);
	gShow_DebugPanel = ! gShow_DebugPanel;
	
	if (gShow_DebugPanel) {
		ElectronWindow.GetWindow().webContents.openDevTools();
	}
	else {
		ElectronWindow.GetWindow().webContents.closeDevTools();
	}
	//ElectronWindow.GetWindow().webContents.send
	//	("fromMain", [ "View/ToggleDebugPanel", gShow_DebugPanel ]);
}; // ipcMain_toggleDebugPanel()

ipcMain.on("request:log2main", (event, data) => {
	console.log(data);
}); // "request:log2main" event handler

// ================== REQUEST_HEX_TO_SEEDPHRASE ==================
ipcMain.handle(REQUEST_HEX_TO_SEEDPHRASE, (event, data) => {
	console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_HEX_TO_SEEDPHRASE + _END_);
	//console.log(">> data: " + data); 
	let seedphrase = Seedphrase_API.FromSHASeed(data);
	//console.log(">> seedphrase: " + seedphrase); 
	return seedphrase;
}); // "request:hex_to_seedphrase" event handler

// ================== REQUEST_SEEDPHRASE_AS_4LETTER ==================
ipcMain.handle(REQUEST_SEEDPHRASE_AS_4LETTER, (event, data) => {
	console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SEEDPHRASE_AS_4LETTER + _END_);
	//console.log(">> data: " + data); 
	let seedphrase_as_4letter = Seedphrase_API.As4letter(data);
	//console.log(">> seedphrase: " + seedphrase); 
	return seedphrase_as_4letter;
}); // "request:seedphrase_as_4letter" event handler


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
		createWindow();
	})
}
// ========== Prevent Multiple instances of Electron main process