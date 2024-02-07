// =====================================================================================
// ================================   electron_main.js   ===============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	

const path = require('path');
		
const MAIN_WINDOW_WIDTH  = 800;
const MAIN_WINDOW_HEIGHT = 400; 
		
const getRootPath = () => {
	return path.resolve(__dirname, '..');
} // getRootPath()

// https://github.com/electron/electron/issues/19775
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const ELECTRON_MAIN_MENU_TEMPLATE = [
	{ 	label: 'File',
		submenu: [
			{ 	label: 'Quit', 
				click() { app.quit(); }
			},
		]
	}	
]; // menu_template

//==================== createWindow() ====================
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const createWindow = () => {
	console.log(">> [Electron] createWindow");

	// to Hide 'Security Warning'
	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
	
	//console.log(__dirname);
	let main_window = new BrowserWindow({
		width:  MAIN_WINDOW_WIDTH, height: MAIN_WINDOW_HEIGHT,
		//icon:   path.join(__dirname, "../../icons/ZCash_rev_icn.png"),
		webPreferences: {
				contextIsolation: true, // NB: 'true' is default value but keep it there anyway
				preload:          path.join(__dirname, "./preload.js"),
			}
		});
		
	const menu_bar = Menu.buildFromTemplate(ELECTRON_MAIN_MENU_TEMPLATE);
	Menu.setApplicationMenu(menu_bar);
	
	main_window.loadFile('./index.html');
}; // createWindow()
//==================== createWindow()

// Create Electron main window, load the rest of the app, etc...
app.whenReady().then(() => {
	createWindow();
});