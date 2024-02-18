// ====================================================================================
// ==================================   preload.js   ==================================
// ====================================================================================

// https://github.com/cdaein/p5js-electron-canvas-saver-boilerplate
const { contextBridge, ipcRenderer } = require('electron');

//console.log(">> ====== preload ======");

contextBridge.exposeInMainWorld(
	"ipcMain", {
		log2Main:              (data) => ipcRenderer.send("request:log2main", data),
		
		HexToSeedPhrase:       (data) => ipcRenderer.invoke("request:hex_to_seedphrase", data),
		SeedphraseAs4letter:   (data) => ipcRenderer.invoke("request:seedphrase_as_4letter", data),
		GetSHA256:             (data) => ipcRenderer.invoke("request:get_SHA256", data),
		
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
