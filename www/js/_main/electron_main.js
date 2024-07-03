// =====================================================================================
// ================================   electron_main.js   ===============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const MAIN_WINDOW_WIDTH  = 975;
const MAIN_WINDOW_HEIGHT = 630; 

const { app, Menu, BrowserWindow, ipcMain, 
        shell, remote, dialog } = require('electron');	
		// https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron

const fs             = require('fs');
const path           = require('path');
const sha256         = require('js-sha256');
const wif            = require('wif');
const { v4: uuidv4 } = require('uuid');

const bwipjs = require('bwip-js');

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, _END_ 
	  } = require('../util/color/color_console_codes.js');

const { VIEW_TOGGLE_DEVTOOLS, TOOLS_OPTIONS,
        REQUEST_LOG_2_MAIN, 
		REQUEST_TOGGLE_DEBUG_PANEL,
		REQUEST_OPEN_URL, REQUEST_LOAD_IMG_FROM_FILE, REQUEST_DROP_RND_CRYPTO_LOGO,
		
		REQUEST_MNEMONICS_TO_ENTROPY_INFO, 
		REQUEST_MNEMONICS_TO_HDWALLET_INFO,
		REQUEST_ENTROPY_TO_MNEMONICS, REQUEST_ENTROPY_TO_CHECKSUM,
		REQUEST_ENTROPY_SRC_TO_ENTROPY,	REQUEST_ENTROPY_SRC_TO_PK,	

		REQUEST_MNEMONICS_AS_4LETTER,
        REQUEST_GET_UUID, 
		
		REQUEST_GET_L10N_KEYPAIRS, REQUEST_GET_L10N_MSG, 
		
		REQUEST_GET_SECP256K1,
		REQUEST_CHECK_MNEMONICS, 
		REQUEST_MNEMONICS_TO_WORD_INDEXES, REQUEST_GUESS_MNEMONICS_LANG,
		REQUEST_SAVE_WALLET_INFO, REQUEST_IMPORT_RAW_DATA,
		REQUEST_GET_FORTUNE_COOKIE,		
		
		REQUEST_GET_HD_WALLET, 
		REQUEST_GET_SOLANA_WALLET,
		
		FromMain_DID_FINISH_LOAD,
        FromMain_FILE_SAVE, FromMain_HELP_ABOUT,
		FromMain_SEND_IMG_URL,
		FromMain_SET_FORTUNE_COOKIE, 
        FromMain_SET_RENDERER_VALUE, FromMain_SET_SEED_FIELD_VALUE 		
	  }                                 = require('../_renderer/const_events.js');
	  
const { ENTROPY_SOURCE_IMG_ID
      }                                 = require('../_renderer/const_renderer.js');
	  
const { NULL_COIN, 
		BITCOIN, ETHEREUM, 
		BINANCE, SOLANA, CARDANO, AVALANCHE, 
		DOGECOIN, LITECOIN,
		RIPPLE, TRON, BITCOIN_CASH, FIRO,
		MAINNET, TESTNET,
		BLOCKCHAIN, NULL_BLOCKCHAIN,
		COIN_ABBREVIATIONS
      }                                 = require('../crypto/const_blockchains.js');
	  
const { ADDRESS, WIF, PRIV_KEY, 
        PRIVATE_KEY_HEX, MNEMONICS   
      }                                 = require('../crypto/const_wallet.js');
	  
const { getDayTimestamp }               = require('../util/system/timestamp.js');
const { FileUtils }                     = require('../util/system/file_utils.js');
const { Bip39Utils }                    = require('../crypto/bip39_utils.js');
const { Bip32Utils }                    = require('../crypto/bip32_utils.js');
const { hexToBytes, hexWithoutPrefix, hexWithPrefix, hexToB64,
        isHexString, getRandomInt  }    = require('../crypto/hex_utils.js');
const { getFortuneCookie }              = require('../util/fortune/fortune.js');
const { L10nUtils }                     = require('../L10n/L10n_utils.js');

const { Solana_API }                    = require('../crypto/solana_api.js');
		
let g_DidFinishLoad_FiredCount = 0;

const createBrowserWindow = ( url ) => {
   const win = new BrowserWindow({
     height: 900,
     width:  1200
   });

   win.loadURL( url );
} // createBrowserWindow

// https://github.com/electron/electron/issues/19775
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const ELECTRON_MAIN_MENU_TEMPLATE = [
	{ 	label: L10nUtils.GetLocalizedMsg("File"),
		submenu: [ {  label:  L10nUtils.GetLocalizedMsg("Save"), 
					  click() { ElectronMain.DoFileSave(); }
			       },
				   {  label: L10nUtils.GetLocalizedMsg("Quit"), 
					  click() { app.quit(); }
			       }
				 ]
	},
	{ 	label: L10nUtils.GetLocalizedMsg("View"),
		submenu: [ {  label: L10nUtils.GetLocalizedMsg("ToggleDebug"), type: 'checkbox',
				      click() {
					      console.log('>> ' + _CYAN_ + '[Electron] ' + _YELLOW_ + VIEW_TOGGLE_DEVTOOLS + _END_);	
						  ElectronMain.ToggleDebugPanel();  
				      }		 
			       }
		         ]
	},
	{ 	label: L10nUtils.GetLocalizedMsg("Tools"),
		submenu: [ {  label: "Options...",
				      click() {
					      console.log('>> ' + _CYAN_ + '[Electron] ' + _YELLOW_ + TOOLS_OPTIONS + _END_);	
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
							 createBrowserWindow("https://iancoleman.io/bip39/");
						  }
						},
						{ label: "Guarda",
						  click() { 
							 // https://stackoverflow.com/questions/53390798/opening-new-window-electron
							 createBrowserWindow("https://guarda.com/");
						  }
						}						
				     ]
				   },
		           {  label: L10nUtils.GetLocalizedMsg("About"), //'About...',
				      click() { 
					      ElectronMain.MainWindow.webContents.send('fromMain', [ FromMain_HELP_ABOUT ]);
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
	static MainWindow = null;
	static Defaults   = {};
	
	static FirstImageAsEntropySource = true;
	
	//==================== CreateWindow() ====================
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
		ElectronMain.MainWindow = main_window;
			
		const menu_bar = Menu.buildFromTemplate(ELECTRON_MAIN_MENU_TEMPLATE);
		Menu.setApplicationMenu(menu_bar);	
		
		//ipcMain_toggleDebugPanel();
		
		// https://www.electronjs.org/docs/latest/api/web-contents#instance-events
		// https://stackoverflow.com/questions/42284627/electron-how-to-know-when-renderer-window-is-ready
		// Note: index.html loaded twice (first index.html redirect)
		// ==================== 'did-finish-load' event handler ====================
		ElectronMain.MainWindow.webContents.on('did-finish-load', 
			() => {
				//console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load --" + _END_);
				
				// Note: must load twice (I suspect because of first 'index.html' redirect)
				g_DidFinishLoad_FiredCount++;
				
				if (g_DidFinishLoad_FiredCount == 2) {
					console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + " did-finish-load " + _END_ + "FiredCount==2");	
					
					//---------- Set 'Cryptocalc_version' in Renderer GUI ----------
					let Cryptocalc_version = process.env.npm_package_version;
					//console.log("   Cryptocalc: " + Cryptocalc_version);				
					ElectronMain.MainWindow.setTitle('Cryptocalc ' + Cryptocalc_version); 
					//---------- Set 'Cryptocalc_version' in Renderer GUI
					
					ElectronMain.MainWindow.webContents.send("fromMain", [ FromMain_DID_FINISH_LOAD ]);
					
					//console.log("   Send : " + FromMain_SET_RENDERER_VALUE + " = " + Cryptocalc_version);
					ElectronMain.MainWindow.webContents.send("fromMain", [ FromMain_SET_RENDERER_VALUE, Cryptocalc_version ]);
					
					// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
					// Open urls in the user's browser
					// nB: Triggered by 'RendererGUI.OnExploreWallet()'
					ElectronMain.MainWindow.webContents.setWindowOpenHandler((edata) => {
						shell.openExternal(edata.url);
						return { action: "deny" };
					});
					
					ElectronMain.ReadDefaults();
					
					ElectronMain.SetCallbacks();
				}
			} // 'did-finish-load' callback
		); // ==================== 'did-finish-load' event handler
		
		ElectronMain.MainWindow.loadFile('./index.html');
	} // ElectronMain.CreateWindow()
	
	static DoFileSave() {
		console.log(">> " + _CYAN_ + "ElectronMain.DoFileSave" + _END_);		
		ElectronMain.MainWindow.webContents.send("fromMain", [ FromMain_FILE_SAVE ]);
	} // ElectronMain.DoFileSave()
	
	// File/Import/Random Fortune CookieI
	static GetFortuneCookie() {
		console.log(">> " + _CYAN_ + "ElectronMain.GetFortuneCookie" + _END_);
		let fortune_cookie = getFortuneCookie();
		ElectronMain.MainWindow.webContents.send("fromMain", [ FromMain_SET_FORTUNE_COOKIE, fortune_cookie ]);
	} // ElectronMain.GetFortuneCookie()
	
	static ToggleDebugPanel() {
		console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + "ToggleDebugPanel" + _END_);
		gShow_DebugPanel = ! gShow_DebugPanel;
		
		if ( gShow_DebugPanel ) {
			ElectronMain.MainWindow.webContents.openDevTools();
		}
		else {
			ElectronMain.MainWindow.webContents.closeDevTools();
		}
		// ElectronMain.MainWindow.webContents.send
		//	 ("fromMain", [ "View/ToggleDebugPanel", gShow_DebugPanel ]);
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
				ElectronMain.MainWindow.webContents.send
					("fromMain", [ FromMain_SET_SEED_FIELD_VALUE, raw_data_str ]);
			}
		}).catch(err => {
			console.log(err)
		});
	} // ElectronMain.SelectFile()
	
	static ReadDefaults() {
		console.log(">> " + _CYAN_ + "ElectronMain.ReadDefaults" + _END_);
		let config_path = app.getAppPath() + '/www/config';
		console.log("config_path: " + config_path);
		const defaults_str = fs.readFileSync(config_path + '/defaults.json');
		ElectronMain.Defaults = JSON.parse(defaults_str);
		console.log("ElectronMain.Defaults: " + JSON.stringify(ElectronMain.Defaults));
	} // ElectronMain.ReadDefaults()
	
	static SetCallbacks() {
		console.log(">> " + _CYAN_ + "ElectronMain.SetCallbacks" + _END_);

		// ====================== REQUEST_LOG_2_MAIN ======================
		// called like this by Renderer: window.ipcMain.log2Main(data)
		ipcMain.on( REQUEST_LOG_2_MAIN, (event, data) => {
			console.log(data);
		}); // "request:log2main" event handler
		
		// ====================== REQUEST_TOGGLE_DEBUG_PANEL ======================
		// called like this by Renderer: window.ipcMain.ToggleDebugPanel(data)
		ipcMain.on( REQUEST_TOGGLE_DEBUG_PANEL, (event, data) => {
			ElectronMain.ToggleDebugPanel();
		}); // "request:toggle_debug_panel" event handler
		
		// ====================== REQUEST_OPEN_URL ======================
		// called like this by Renderer: window.ipcMain.OpenURL(url)
		ipcMain.on( REQUEST_OPEN_URL, (event, url) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_OPEN_URL + _END_);
			console.log("   URL: " + url);
			
			// https://stackoverflow.com/questions/31749625/make-a-link-from-electron-open-in-browser
			ElectronMain.MainWindow.location = url;
		}); // "request:open_URL" event handler
		
		// https://github.com/metafloor/bwip-js/blob/master/README.md
		const createQRCode = ( path, filename, qrcode_text, qrcode_type, filetype ) => {
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
				     console.log("error " + err);
				} 
				else {
				  fs.writeFileSync( path + "/" + filename, png_data, "binary", 
					 (err) => { if ( ! err ) 
								  console.log(`${filename} created successfully!`);
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
				// console.log("qrcode_text: '" + qrcode_text + "'");
				options["scale"] = 1;
	
				let svg_data = bwipjs.toSVG( options );
				fs.writeFileSync( path + "/" + filename, svg_data, "binary", 
					 (err) => { if ( ! err ) 
								  console.log(`${filename} created successfully!`);
							  }
				);
			 }
        }; // createQRCode
		
		// ====================== REQUEST_SAVE_WALLET_INFO ======================
		// called like this by Renderer: window.ipcMain.SaveWalletInfo(data)
		ipcMain.on( REQUEST_SAVE_WALLET_INFO, (event, crypto_info) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_SAVE_WALLET_INFO + _END_);
			let timestamp = getDayTimestamp();
			let output_path = app.getAppPath() + "/_output/" + timestamp;
			
			let coin = COIN_ABBREVIATIONS[crypto_info[BLOCKCHAIN]];
			output_path = output_path + "_" + coin;
			//console.log("   " + output_path);
			
			if (! fs.existsSync(output_path)) {
				fs.mkdirSync(output_path, { recursive: true });
			}		
			
			let wallet_info_str = "";
			let wallet_keys = Object.keys(crypto_info);
			
            let private_key = "";
            let pk_key      = "";
            let wif         = ""; 
            let entropy     = crypto_info["Entropy"];
			
			for (let i=0; i < wallet_keys.length; i++) {
				let current_key = wallet_keys[i];
				
				if (   current_key == PRIV_KEY 
				    || current_key == PRIVATE_KEY_HEX || current_key == "Private Key") {
					
                    pk_key = current_key;
                    //console.log("wallet_keys[" + i + "]: " + current_key);					
                    private_key = crypto_info[pk_key];	
                    //console.log("private_key: " + private_key);					
				}				
				else {
					//console.log("wallet_keys[" + i + "]: " + current_key);
				}
				
				if ( current_key == WIF ) {					
                    wif = crypto_info[current_key];					
				}				
				
				wallet_info_str += current_key.padEnd(22,' ') + crypto_info[current_key] + "\n";
			}
			
			fs.writeFileSync( output_path + "/wallet_info.txt", wallet_info_str, error_handler );
		
		    createQRCode( output_path, "Address.png", crypto_info['address'], 'qrcode' );			
			
			if ( pk_key != "" ) {
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
				createQRCode( output_path + "/svg", "PrivateKey.svg",   private_key, 'qrcode', 'svg' );
				createQRCode( output_path + "/svg", "Entropy_rMQR.svg", entropy, 'rectangularmicroqrcode', 'svg' );
				createQRCode( output_path + "/svg", "Entropy_Ultracode.svg", entropy, "ultracode", 'svg' );
			    if ( wif != "" ) {
				    createQRCode( output_path + "/svg", "WIF.svg", wif, 'qrcode', 'svg' );
                }			
				createQRCode( output_path + "/svg", "Seedphrase.svg", crypto_info['Seedphrase'], 'qrcode', 'svg' );
		    //-------- SVG output
		}); // "request:save_wallet_info" event handler
				
		// ====================== REQUEST_IMPORT_RAW_DATA ======================
		// called like this by Renderer: window.ipcMain.ImportRawData(data)
		ipcMain.on( REQUEST_IMPORT_RAW_DATA, ( event, crypto_info ) => {
			ElectronMain.SelectFile();
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
			//console.log("   image_file_extension: " + image_file_extension);
			//console.log("   img_data_asURL:\n" + img_data_asURL);
			ElectronMain.MainWindow.webContents
			            .send('fromMain', 
						      [ FromMain_SEND_IMG_URL, ENTROPY_SOURCE_IMG_ID, 
							    img_data_asURL, image_file_extension ]);
			return img_data_asURL;
		}; // loadImageFromFile
		
		// ====================== REQUEST_LOAD_IMG_FROM_FILE ======================
		// called like this by Renderer: window.ipcMain.LoadImageFromFile(data)
		ipcMain.handle( REQUEST_LOAD_IMG_FROM_FILE, (event, image_file_path) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_LOAD_IMG_FROM_FILE + _END_);
			let img_data_asURL = loadImageFromFile( image_file_path );
			return img_data_asURL;
		}); // "request:load_image_from_file" event handler

		// ====================== REQUEST_DROP_RND_CRYPTO_LOGO ======================
		// called like this by Renderer: window.ipcMain.DropRandomCryptoLogo(data)
		ipcMain.handle( REQUEST_DROP_RND_CRYPTO_LOGO, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_DROP_RND_CRYPTO_LOGO + _END_);
			
			let app_path = app.getAppPath();
			console.log("   app_path: " + app_path);
			
			let crypto_logos_path = app_path + "/www/img/CryptoCurrency";
			
			let crypto_logos = FileUtils.GetFilesInFolder(crypto_logos_path);
			//console.log("   crypto_logos.length: " + crypto_logos.length);
			
			let image_file_path = crypto_logos_path + "/";
			let crypto_logo_filename = "Zilver_64px.svg";
			if (! ElectronMain.FirstImageAsEntropySource ) {
				let	random_index = getRandomInt( crypto_logos.length );
		        crypto_logo_filename = crypto_logos[random_index];			
			}
			ElectronMain.FirstImageAsEntropySource = false;
			image_file_path += crypto_logo_filename;
			
			let img_data_asURL = loadImageFromFile( image_file_path );
            return img_data_asURL;			
		}); // "request:drop_rnd_crypto_logo" event handler
		
		// ================== REQUEST_MNEMONICS_TO_HDWALLET_INFO ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsToHDWalletInfo( data )
		ipcMain.handle( REQUEST_MNEMONICS_TO_HDWALLET_INFO, async (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_MNEMONICS_TO_HDWALLET_INFO + _END_);
			const { mnemonics, options } = data;
			//console.log("   options: " + JSON.stringify(options));
			let hdwallet_info = await Bip32Utils.MnemonicsToHDWalletInfo( mnemonics, options );
			return hdwallet_info;
		}); // "request:mnemonics_to_hdwallet_info" event handler	

		// ================== REQUEST_MNEMONICS_TO_ENTROPY_INFO ===================
		// called like this by Renderer: await window.ipcMain.MnemonicsToEntropyInfo( data )
		ipcMain.handle( REQUEST_MNEMONICS_TO_ENTROPY_INFO, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_MNEMONICS_TO_ENTROPY_INFO + _END_);
			const { mnemonics, lang } = data;
			//console.log("   lang: " + lang);
			let entropy_info = Bip39Utils.MnemonicsToEntropyInfo( mnemonics, lang );
			return entropy_info;
		}); // "request:mnemonics_to_entropy_info" event handler

		// ================== REQUEST_ENTROPY_TO_MNEMONICS ===================
		// called like this by Renderer: await window.ipcMain.EntropyToMnemonics( data )
		ipcMain.handle( REQUEST_ENTROPY_TO_MNEMONICS, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_ENTROPY_TO_MNEMONICS + _END_);
			const { entropy, options } = data;
			//console.log("   data_hex: " + data_hex);
			//console.log("   options: " + JSON.stringify(options));
			let seedphrase = Bip39Utils.EntropyToMnemonics( entropy, options );
			//console.log(">> seedphrase: " + seedphrase); 
			return seedphrase;
		}); // "request:entropy_to_mnemonics" event handler
		
		// ================== REQUEST_ENTROPY_TO_CHECKSUM ===================
		// called like this by Renderer: await window.ipcMain.EntropyToChecksum( data )
		ipcMain.handle( REQUEST_ENTROPY_TO_CHECKSUM, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_ENTROPY_TO_CHECKSUM + _END_);
			const { entropy, options } = data;
			let checksum = Bip39Utils.EntropyToChecksum( entropy, options );
			return checksum;
		}); // "request:entropy_to_checksum" event handler
		
		// ================== REQUEST_ENTROPY_SRC_TO_ENTROPY ==================
		// called like this by Renderer: await window.ipcMain.EntropySourceToEntropy( data )
		ipcMain.handle( REQUEST_ENTROPY_SRC_TO_ENTROPY, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_ENTROPY_SRC_TO_ENTROPY + _END_);
			const { entropy_src_str, options } = data;
			let entropy = Bip39Utils.EntropySourceToEntropy( entropy_src_str, options );
			return entropy;
		}); // "request:entropy_src_to_entropy" event handler	

		// ================== REQUEST_MNEMONICS_AS_4LETTER ==================
		// called like this by Renderer: await window.ipcMain.MnemonicsAs4letter( data )
		ipcMain.handle( REQUEST_MNEMONICS_AS_4LETTER, (event, mnemonics) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_MNEMONICS_AS_4LETTER + _END_);
			//console.log(">> data: " + data); 
			let mnemonics_as_4letter = Bip39Utils.MnemonicsAs4letter( mnemonics );
			//console.log(">> mnemonics: " + mnemonics); 
			return mnemonics_as_4letter;
		}); // "request:mnemonics_as_4letter" event handler

		// ================== REQUEST_GET_SECP256K1 ==================
		// called like this by Renderer: await window.ipcMain.GetSecp256k1( entropy )
		//ipcMain.handle( REQUEST_GET_SECP256K1, (event, entropy) => {
		//	console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_SECP256K1 + _END_);
		//	let entropy_is_hex = isHexString( entropy );
		//	console.log("   entropy_is_hex: " + entropy_is_hex);
		//	let entropy_bytes = entropy.length/2;
		//	console.log("   entropy(" + entropy_bytes + "):    " + entropy);
		//	let result = getSecp256k1PK( entropy );
		//	return result;
		//}); // "request:get_Secp256k1" event handler
		
		// =================== REQUEST_GET_FORTUNE_COOKIE ==================
		// called like this by Renderer: await window.ipcMain.GetFortuneCookie()
		ipcMain.handle( REQUEST_GET_FORTUNE_COOKIE, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_FORTUNE_COOKIE + _END_);
			let fortune_cookie = getFortuneCookie();
			return fortune_cookie;
		}); // "request:get_FortuneCookie"

		// =============== REQUEST_MNEMONICS_TO_WORD_INDEXES ===============
		// called like this by Renderer: await window.ipcMain.MnemonicsToWordIndexes( data )
		ipcMain.handle( REQUEST_MNEMONICS_TO_WORD_INDEXES, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_MNEMONICS_TO_WORD_INDEXES + _END_);
			const { mnemonics, options } = data;
			let word_indexes = Bip39Utils.GetWordIndexes( mnemonics, options );
						
			return word_indexes;
		}); // "request:mnemonics_to_word_indexes" event handler

		// =============== REQUEST_GUESS_MNEMONICS_LANG ===============
		// called like this by Renderer: await window.ipcMain.GuessMnemonicsLang( data )
		ipcMain.handle( REQUEST_GUESS_MNEMONICS_LANG, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GUESS_MNEMONICS_LANG + _END_);
			const { mnemonics } = data;
			let lang = Bip39Utils.GuessMnemonicsLang( mnemonics );

			return lang;
		}); // "request:lang" event handler		
		
		// ================== REQUEST_GET_SOLANA_WALLET ===================
		// called like this by Renderer: await window.ipcMain.GetSolanaWallet( data )
		ipcMain.handle( REQUEST_GET_SOLANA_WALLET, async (event, data) => {
			console.log(  '>> ' + _CYAN_ + '[Electron] ipcMain.handle: ' 
						+ _YELLOW_ + REQUEST_GET_SOLANA_WALLET + _END_);
			const { mnemonics, options } = data;
			let wallet = await Solana_API.GetWallet( mnemonics, options );
			return wallet;
		}); // "request:get_SOLANA_wallet" event handler (invoke/handle)
		
		// =================== REQUEST_CHECK_MNEMONICS ====================
		// called like this by Renderer: await window.ipcMain.CheckSeedPhrase(data)
		ipcMain.handle( REQUEST_CHECK_MNEMONICS, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_CHECK_MNEMONICS + _END_);
			const { mnemonics, options } = data;
			let check_result = Bip39Utils.CheckMnemonics( mnemonics, options );
			return check_result;
		}); // "request:check_mnemonics" event handler

		// ====================== REQUEST_GET_UUID =======================
		// called like this by Renderer: await window.ipcMain.GetUUID(data)
		ipcMain.handle( REQUEST_GET_UUID, (event, data) => {
			console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_UUID + _END_);
			let new_uuidv4 = uuidv4();
			return new_uuidv4;
		}); // "request:get_UUID" event handler
		
		// ==================== REQUEST_GET_L10N_KEYPAIRS =====================
		// called like this by Renderer: await window.ipcMain.GetL10nKeyPairs()
		ipcMain.handle( REQUEST_GET_L10N_KEYPAIRS, (event, data) => {
			//console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_L10N_KEYPAIRS + _END_);
			let L10n_keypairs = L10nUtils.GetKeyPairs();
			return L10n_keypairs;
		}); // "request:get_L10n_keypairs" event handler	

		// ==================== REQUEST_GET_L10N_MSG =====================
		// called like this by Renderer: await window.ipcMain.GetLocalizedMsg(msg_id)
		ipcMain.handle( REQUEST_GET_L10N_MSG, (event, msg_id) => {
			//console.log(">> " + _CYAN_ + "[Electron] " + _YELLOW_ + REQUEST_GET_L10N_MSG + _END_);
			let L10n_msg = L10nUtils.GetLocalizedMsg( msg_id );
			return L10n_msg;
		}); // "request:get_L10n_Msg" event handler	
		
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
	if (ElectronMain.MainWindow != null) {
			if (ElectronMain.MainWindow) {
				ElectronMain.MainWindow.restore(); 
			}
			ElectronMain.MainWindow.focus()
		}
	}) // Manage case of second instance

	// Create Electron main window, load the rest of the app, etc...
	app.whenReady().then(() => {
		ElectronMain.CreateWindow();
	})
}
// ========== Prevent Multiple instances of Electron main process// =====================================================================================
