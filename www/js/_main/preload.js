// ====================================================================================
// ==================================   preload.js   ==================================
// ====================================================================================

// https://github.com/cdaein/p5js-electron-canvas-saver-boilerplate
const { contextBridge, ipcRenderer } = require('electron');

//console.log(">> ====== preload ======");

const functionName = ( fun ) => {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}; // functionName()

contextBridge.exposeInMainWorld(
	"ipcMain", {
		QuitApp:                     ()     => ipcRenderer.invoke("ToMain:Request/quit_app"),
		
		logToMain:                   (data) => ipcRenderer.send("ToMain:Request/log2main", data),
		logToMainSync:               (data) => ipcRenderer.invoke("ToMain:Request/log2main_sync", data),
		
		ExecuteCommand:              (data) => ipcRenderer.invoke("ToMain:Request/ExecCmd", data),
		
		SetWindowTitle:              (data) => ipcRenderer.send("ToMain:Request/set_window_title", data),		
		ToggleDebugPanel:            (data) => ipcRenderer.send("ToMain:Request/toggle_debug_panel", data),
		
		NewWalletInfo:               (data) => ipcRenderer.invoke("ToMain:Request/new_wallet_info", data),
		OpenWalletInfo:              (data) => ipcRenderer.invoke("ToMain:Request/open_wallet_info", data),
		SaveWalletInfo:              (data) => ipcRenderer.send("ToMain:Request/save_wallet_info", data),
		
		SaveOptions:                 (data) => ipcRenderer.invoke("ToMain:Request/save_options", data),
		ResetOptions:                (data) => ipcRenderer.invoke("ToMain:Request/reset_options", data),
		UpdateOptions:               (data) => ipcRenderer.invoke("ToMain:Request/update_options", data),
		
		EntropySourceToEntropy:      (data) => ipcRenderer.invoke("ToMain:Request/entropy_src_to_entropy", data),
		MnemonicsToEntropyInfo:      (data) => ipcRenderer.invoke("ToMain:Request/mnemonics_to_entropy_info", data),
		EntropyToMnemonics:          (data) => ipcRenderer.invoke("ToMain:Request/entropy_to_mnemonics", data),
		EntropyToChecksum:           (data) => ipcRenderer.invoke("ToMain:Request/entropy_to_checksum", data),
		MnemonicsToHDWalletInfo:     (data) => ipcRenderer.invoke("ToMain:Request/mnemonics_to_hd_wallet_info", data),
		MnemonicsAsTwoParts:         (data) => ipcRenderer.invoke("ToMain:Request/mnemonics_as_two_parts", data),
		
		GeneratePassword:            (data) => ipcRenderer.invoke("ToMain:Request/GeneratePassword", data),
		
		GetSimpleWallet:             (data) => ipcRenderer.invoke("ToMain:Request/get_simple_wallet", data),
		GetHDWallet:                 (data) => ipcRenderer.invoke("ToMain:Request/get_hd_wallet", data),
		
		MnemonicsAs4letter:          (data) => ipcRenderer.invoke("ToMain:Request/mnemonics_as_4letter", data),		
		
		CheckMnemonics:              (data) => ipcRenderer.invoke("ToMain:Request/check_mnemonics", data),
		MnemonicsToWordIndexes:      (data) => ipcRenderer.invoke("ToMain:Request/mnemonics_to_word_indexes", data),
		GuessMnemonicsLang:          (data) => ipcRenderer.invoke("ToMain:Request/guess_mnemonics_lang", data),
		GetUUID:                     (data) => ipcRenderer.invoke("ToMain:Request/get_UUID", data),
		GetFortuneCookie:            (data) => ipcRenderer.invoke("ToMain:Request/get_FortuneCookie", data),
		
		GetL10nKeyPairs:             (data) => ipcRenderer.invoke("ToMain:Request/get_L10n_keypairs", data),
		GetLocalizedMsg:             (data) => ipcRenderer.invoke("ToMain:Request/get_L10n_Msg", data),
		
		SetMenuItemState:            (data) => ipcRenderer.send("ToMain:Request/set_menu_item_state", data),

		OpenURL:                     (data) => ipcRenderer.send("ToMain:Request/open_URL", data),
        ShowOutputFolderInExplorer:  (data) => ipcRenderer.send("ToMain:Request/show_output_folder_in_explorer", data),		
		
        LoadImageFromFile:           (data) => ipcRenderer.invoke("ToMain:Request/load_image_from_file", data),		
	    DrawRandomCryptoLogo:        (data) => ipcRenderer.invoke("ToMain:Request/draw_rnd_crypto_logo", data),
		//send: (channel, data) => {
        //     // whitelist channels
        //    let validChannels = ['toMain'];
		//	console.log(">> ================= preload: send 1");
        //    if (validChannels.includes(channel)) {
		//		//console.log(">> preload: send 2");
        //        ipcRenderer.send(channel, data);
        //    }
        //},
		
        receive: ( channel, func ) => {
            let validChannels = ['fromMain'];
			// console.log(">> preload: receive 1 channel: '" + channel + "'  func: " + functionName( func ) );
            if ( validChannels.includes( channel ) ) {
				//console.log(">> preload: send 2");
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on( channel, (event, ...args) => { 
				    let event_name = args[0][0]; 
				    // console.log( "<" + event_name + "> from 'main' to 'renderer'" ); 
					// if ( event_name != "FromMain:SendImageURL" ) {
					//	 console.log( "args: " + JSON.stringify(args) ); 
					// }
					func(...args);
				} );
            }
        }
	} 
); // contextBridge.exposeInMainWorld
