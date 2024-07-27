// ====================================================================================
// ==================================   preload.js   ==================================
// ====================================================================================

// https://github.com/cdaein/p5js-electron-canvas-saver-boilerplate
const { contextBridge, ipcRenderer } = require('electron');

//console.log(">> ====== preload ======");

contextBridge.exposeInMainWorld(
	"ipcMain", {
		QuitApp:                   ()     => ipcRenderer.invoke("request:quit_app"),
		log2Main:                  (data) => ipcRenderer.send("request:log2main", data),
		
		ToggleDebugPanel:          (data) => ipcRenderer.send("request:toggle_debug_panel", data),
		SaveOptions:               (data) => ipcRenderer.invoke("request:save_options", data),
		ResetOptions:              (data) => ipcRenderer.invoke("request:reset_options", data),
		UpdateOptions:             (data) => ipcRenderer.invoke("request:update_options", data),
		
		EntropySourceToEntropy:    (data) => ipcRenderer.invoke("request:entropy_src_to_entropy", data),
		MnemonicsToEntropyInfo:    (data) => ipcRenderer.invoke("request:mnemonics_to_entropy_info", data),
		EntropyToMnemonics:        (data) => ipcRenderer.invoke("request:entropy_to_mnemonics", data),
		EntropyToChecksum:         (data) => ipcRenderer.invoke("request:entropy_to_checksum", data),
		//EntropySourceToPrivateKey: (data) => ipcRenderer.invoke("request:entropy_src_to_pk", data),
		MnemonicsToHDWalletInfo:   (data) => ipcRenderer.invoke("request:mnemonics_to_hdwallet_info", data),
		
		MnemonicsAs4letter:        (data) => ipcRenderer.invoke("request:mnemonics_as_4letter", data),		
		
		CheckMnemonics:            (data) => ipcRenderer.invoke("request:check_mnemonics", data),
		MnemonicsToWordIndexes:    (data) => ipcRenderer.invoke("request:mnemonics_to_word_indexes", data),
		GuessMnemonicsLang:        (data) => ipcRenderer.invoke("request:guess_mnemonics_lang", data),
		GetUUID:                   (data) => ipcRenderer.invoke("request:get_UUID", data),
		GetFortuneCookie:          (data) => ipcRenderer.invoke("request:get_FortuneCookie", data),
		
		GetL10nKeyPairs:           (data) => ipcRenderer.invoke("request:get_L10n_keypairs", data),
		GetLocalizedMsg:           (data) => ipcRenderer.invoke("request:get_L10n_Msg", data),

		GetSolanaWallet:           (data) => ipcRenderer.invoke("request:get_SOLANA_wallet", data),

		SaveWalletInfo:            (data) => ipcRenderer.send("request:save_wallet_info", data),
		ImportRawData:             (data) => ipcRenderer.send("request:import_raw_data", data),
		OpenURL:                   (data) => ipcRenderer.send("request:open_URL", data),		
		
        LoadImageFromFile:         (data) => ipcRenderer.invoke("request:load_image_from_file", data),		
	    DrawRandomCryptoLogo:      (data) => ipcRenderer.invoke("request:draw_rnd_crypto_logo", data),
		//send: (channel, data) => {
        //     // whitelist channels
        //    let validChannels = ['toMain'];
		//	console.log(">> ================= preload: send 1");
        //    if (validChannels.includes(channel)) {
		//		//console.log(">> preload: send 2");
        //        ipcRenderer.send(channel, data);
        //    }
        //},
		
        receive: (channel, func) => {
            let validChannels = ['fromMain'];
			//console.log(">> preload: receive 1");
            if (validChannels.includes(channel)) {
				//console.log(">> preload: send 2");
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
	} 
); // contextBridge.exposeInMainWorld
