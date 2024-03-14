// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
"use strict";

// https://www.electronjs.org/docs/latest/tutorial/quick-start

const HEXA_ALPHABET           = "0123456789abcdefABCDEF";
const ALLOWED_ALPHABETS       = { [PK_HEX_ID]: HEXA_ALPHABET };
const FIELD_IDS               = [ SEED_ID, SALT_ID, PK_HEX_ID, PK_B64_ID, SEEDPHRASE_ID, SEEDPHRASE_4LETTER_ID ];
const WATERFALL_IDS           = [ SEED_ID, SALT_ID, PK_B64_ID, SEEDPHRASE_ID, SEEDPHRASE_4LETTER_ID ];
const WATERFALL_FROM_SEED_IDS = [ PK_HEX_ID, PK_B64_ID, SEEDPHRASE_ID, SEEDPHRASE_4LETTER_ID ];
const EDITABLE_FIELD_IDS      = [ SEED_ID, PK_HEX_ID, SEEDPHRASE_ID ];

const trigger_event = (elt, eventType) => elt.dispatchEvent(new CustomEvent(eventType, {}));

class Renderer_GUI {
	static Required_Hex_digits = 64;
	static Required_B64_digits = 44;
	
	static Seedphrase_expected_wordcount = 24;
	
	static Init() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.Init()" + _END_);

		window.ipcMain.receive("fromMain", 
			async (data) => { await Renderer_GUI.OnGUIEvent(data); }
		); // window.ipcMain.receive() call
	} // Renderer_GUI.Init()
	
	static async OnGUIEvent(data) {
		//log2Main(">> " + _CYAN_ + "Renderer_GUI.OnGUIEvent()" + _END_);

		let event_name = data[0];
				
		switch ( event_name ) {
			case FromMain_DID_FINISH_LOAD:
				log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + FromMain_DID_FINISH_LOAD + _END_);
				await Renderer_GUI.DidFinishLoadInit();	
				break;	

            case FromMain_SET_RENDERER_VALUE:
                log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + FromMain_SET_RENDERER_VALUE + _END_);	
				let cryptocalc_version = data[1];
				//log2Main("   cryptocalc_version: " + cryptocalc_version);
                RendererSession.SetValue(CRYPTO_CALC_VERSION, cryptocalc_version);				
				break;
	
			case FromMain_FILE_SAVE:
			    log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + FromMain_FILE_SAVE + _END_);	
				let crypto_info = await Renderer_GUI.GetCryptoInfo();
                window.ipcMain.SavePrivateKeyInfo(crypto_info);				
				break;
			
            // File/Import/From file...			
			case FromMain_SET_SEED_FIELD_VALUE:
                log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + FromMain_SET_SEED_FIELD_VALUE + _END_);	
				let raw_data_str = data[1];
				//log2Main("   FromMain_SET_SEED_FIELD_VALUE:\n" + raw_data_str);
                Renderer_GUI.SetField(SEED_ID, raw_data_str);	
				Renderer_GUI.UpdateFields();				
				break;
			
            // File/Import/Random Fortune Cookie			
            case FromMain_SET_FORTUNE_COOKIE:
			    log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + FromMain_SET_FORTUNE_COOKIE + _END_);
				let fortune_cookie = data[1];
				Renderer_GUI.SetField(SEED_ID, fortune_cookie);	
				Renderer_GUI.UpdateFields();
				break;
				
			case FromMain_HELP_ABOUT:
			    log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + FromMain_HELP_ABOUT + _END_);
				let crypto_calc_version = RendererSession.GetValue(CRYPTO_CALC_VERSION);
				let i18n_msg = await window.ipcMain.GetL10nMsg("HelpAboutMsg");
				let description_data =   
						  "<center><b>Cryptocalc " + crypto_calc_version + "</b></center><br>" 
						+ "&nbsp;" + i18n_msg;
			    //log2Main("   " + FromMain_HELP_ABOUT + " " + description_data);

				// https://izitoast.marcelodolza.com/
				DialogManager.Clean();
				iziToast.info({
				//	iconUrl:         './icons/ZCash_rev_icn.png',
					position:        'center',
					backgroundColor: 'lightblue',
					message:         description_data,
					maxWidth:        450, layout: 2,
					timeout:         false, progressBar: false
				});
				break;	
				
			default:
				log2Main( ">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: "
						  + _YELLOW_ + "ACK[" + event_name + "]" + _END_ + "from main");
				//DialogManager.Clean();
				break;
		} // switch ( event_name )
	} // Renderer_GUI.OnGUIEvent()
	
	static async DidFinishLoadInit() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.OnceLoadedInit()" + _END_);
		
		Renderer_GUI.RegisterCallbacks();
		await Renderer_GUI.LocalizeHtmlNodes();
		
		// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
		// Get the element with id="private_key_tab_link_id" and click on it
		let pk_tab_link_elt = document.getElementById("pk_tab_link_id");
		pk_tab_link_elt.click();
		
		if (Renderer_GUI.EltHasClass("pk_tab_link_id",        "ThreeBordersTabLink")) {
			Renderer_GUI.EltAddClass("pk_tab_link_id",        "ThreeBordersTabLink");
		}
		if (! Renderer_GUI.EltHasClass("wallet_tab_link_id",  "FourBordersTabLink")) {
			Renderer_GUI.EltRemoveClass("wallet_tab_link_id", "FourBordersTabLink");
		}
	} // Renderer_GUI.DidFinishLoadInit()
	
	static async LocalizeHtmlNodes() {
		 log2Main(">> " + _CYAN_ + "Renderer_GUI.LocalizeHtmlNodes()" + _END_);
		 let msg_id   = "";
		 let L10n_msg = "";
		 let elt      = undefined;
		 for (let i=0; i < HTML_NODE_IDS.length; i++) {
			 //log2Main("---------->>");
			 msg_id   = HTML_NODE_IDS[i];
			 //log2Main("   msg_id[" + i + "] = " + msg_id);
			 L10n_msg = await window.ipcMain.GetL10nMsg(msg_id);
			 //log2Main("   L10n_msg[" + msg_id + "] = " + L10n_msg);
			 elt = Renderer_GUI.GetElement(msg_id);
			 //log2Main("   elt.nodeName : '" + elt.nodeName + "'");
			 //log2Main("   elt: " + elt);
			 if (elt.nodeName == "TD" || elt.nodeName == "SPAN") {
				//log2Main("   change: textContent " + L10n_msg);
				elt.textContent = L10n_msg;
			 }
			 else {
				elt.value = L10n_msg;
			 }	
			 //log2Main("<<---");
		 }
	} // Renderer_GUI.LocalizeHtmlNodes()
	
	static RegisterCallbacks() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.RegisterCallbacks()" + _END_);
		
		Renderer_GUI.SetEventHandler(PK_HEX_ID,               'input',   async (evt) => { await Renderer_GUI.OnInput(evt); }     );
															
		Renderer_GUI.SetEventHandler(PK_B64_ID,               'input',   async (evt) => { await Renderer_GUI.OnInput(evt); }     );
		
		Renderer_GUI.SetEventHandler(SEED_ID,                 'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );
        Renderer_GUI.SetEventHandler(SEED_ID,                 'keydown', async (evt) => { await Renderer_GUI.OnKeyDown(evt); }   );		
		
		Renderer_GUI.SetEventHandler(PK_HEX_ID,               'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );
		Renderer_GUI.SetEventHandler(PK_HEX_ID,               'keydown', async (evt) => { await Renderer_GUI.OnKeyDown(evt); }   );
					
		Renderer_GUI.SetEventHandler(PK_B64_ID,               'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );
		
		Renderer_GUI.SetEventHandler(SEEDPHRASE_ID,           'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );											   
		Renderer_GUI.SetEventHandler(SEEDPHRASE_ID,           'input',   async (evt) => { await Renderer_GUI.OnInput(evt); }     );
		Renderer_GUI.SetEventHandler(SEEDPHRASE_ID,           'keydown', async (evt) => { await Renderer_GUI.OnKeyDown(evt); }   );
		
		Renderer_GUI.SetEventHandler(LANG_SELECT_ID,          'change',  (evt) => { Renderer_GUI.OnChangeBip39Language(evt); }   );		
		
		Renderer_GUI.SetEventHandler(WALLET_BLOCKCHAIN_ID,    'change',  async (evt) => { await Renderer_GUI.OnChangeBlockchain(evt); } );
		
		Renderer_GUI.SetEventHandler(SEEDPHRASE_4LETTER_ID,   'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }           );
		
		Renderer_GUI.SetEventHandler(FILE_IMPORT_BTN_ID,      'click',   (evt) => { Renderer_GUI.ImportRawData(); }        );		
		
        Renderer_GUI.SetEventHandler(UPDATE_BTN_ID,           'click',   async (evt) => { await Renderer_GUI.UpdateFields(); }   );		
		Renderer_GUI.SetEventHandler(RANDOM_BTN_ID,           'click',   async (evt) => { await Renderer_GUI.GenerateRandomFields(); } );									 
		Renderer_GUI.SetEventHandler(CLEAR_BTN_ID,            'click',   (evt) => { Renderer_GUI.ClearFields(FIELD_IDS); } );
		
		//Renderer_GUI.SetEventHandler(WALLET_EXPLORE_BTN_ID,   'click',   (evt) => { Renderer_GUI.OnExploreWallet(); } );
									 
        trigger_event(Renderer_GUI.GetElement(RANDOM_BTN_ID), 'click');
	} // Renderer_GUI.RegisterCallbacks()
	
	static async UpdateFields() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateFields()" + _END_);
		
		let pk_hex_elt = Renderer_GUI.GetElement(PK_HEX_ID); 
		
		let seed_elt = Renderer_GUI.GetElement(SEED_ID); 
		//log2Main("   raw_data_elt: " + raw_data_elt);
		//log2Main("   raw_data_elt value:\n   " + raw_data_elt.value);
		
		if (seed_elt.value.length > 0) {
			//log2Main("   raw_data_elt NOT EMPTY");
			let new_uuid = await window.ipcMain.GetUUID();
		    //Renderer_GUI.SetField(SALT_ID, new_uuid);
			let salt_elt = Renderer_GUI.GetElement(SALT_ID);
		    salt_elt.textContent = new_uuid;
			
			let seed_value = seed_elt.value;
			
			let use_salt_elt = Renderer_GUI.GetElement(USE_SALT_ID);
			let use_salt = use_salt_elt.checked;
			//log2Main("   use_salt: " + use_salt);
			
		    if (use_salt) {
				//log2Main("   salt_uuid: " + salt_uuid);
                let salt   = salt_elt.textContent;				
				seed_value = seed_value + salt;
				//log2Main("   seed is SALTED " + salt);
			}
			else {
				//log2Main("   seed is NOT SALTED");
			}
			
			//log2Main("   seed: " + seed_value);
			
			let private_key = await window.ipcMain.GetSHA256(seed_value);
			let secp256k1_result = await window.ipcMain.GetSecp256k1(private_key);
			private_key = secp256k1_result['private_key'];
			
			let hash_count = secp256k1_result['hash_count'];
			let i18n_msg = await window.ipcMain.GetL10nMsg(PK_LABEL_ID);
			let pk_label_text = (hash_count > 1) ? i18n_msg + "#":i18n_msg;
			let pk_label_elt = Renderer_GUI.GetElement(PK_LABEL_ID);
		    pk_label_elt.textContent = pk_label_text;
			
			let wif = await window.ipcMain.GetWIF(private_key);
			log2Main("   private_key: " + private_key);
			log2Main("   wif:         " + wif);
			
			//log2Main("   sha_256_value_hex:\n   " + sha_256_value_hex);
			pk_hex_elt.value = private_key;
			await Renderer_GUI.PropagateFields(pk_hex_elt.value, wif);
		}
		else if (pk_hex_elt.value.length == Renderer_GUI.Required_Hex_digits) {
			await Renderer_GUI.PropagateFields(pk_hex_elt.value, wif);
		}

		let sb_msg_elt = Renderer_GUI.GetElement(SB_MSG_ID);
		sb_msg_elt.textContent = "";		
	} // Renderer_GUI.UpdateFields()
	
	static async GenerateRandomFields(pk_hex_value) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.GenerateRandomFields() " + _END_);
		
		let fortune_cookie = await window.ipcMain.GetFortuneCookie();
		Renderer_GUI.SetField(SEED_ID, fortune_cookie);
		
		await Renderer_GUI.UpdateFields();
		
		Renderer_GUI.SetFocus(PK_HEX_ID);
	} // Renderer_GUI.GenerateRandomFields()
	
	static async PropagateFields(pk_hex_value, wif) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.PropagateFields()" + _END_);
				
		if (pk_hex_value == undefined) {
			log2Main("   pk_hex_value UNDEFINED >> Generate Random PK");
			pk_hex_value = getRandomHexValue(32);
		}	
		
		let salt_uuid = await Renderer_GUI.UpdateSaltUUID();		
		await Renderer_GUI.UpdatePrivateKey(pk_hex_value, salt_uuid, wif); 	
	    await Renderer_GUI.UpdateSeedphrase(pk_hex_value);		
	} // Renderer_GUI.PropagateFields()
	
	static async UpdateBlockchain(blockchain) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateBlockchain() " + _END_ + blockchain);
		let private_key = Renderer_GUI.GetField(PK_HEX_ID);
		let salt_elt    = Renderer_GUI.GetElement(SALT_ID);
		let salt_uuid   =	salt_elt.textContent;
		let wallet = await Renderer_GUI.UpdateWalletAddress(blockchain, private_key, salt_uuid);
		
		let wif = "";
		// NB: WIF Doesn't work with Guarda.com / Import LiteCoin 
		if (blockchain == BITCOIN || blockchain == DOGECOIN || blockchain == LITECOIN) {
			wif = await window.ipcMain.GetWIF(private_key);
		} 
		Renderer_GUI.UpdateWIF(blockchain, wif);
		
		let coin_abbreviation = COIN_ABBREVIATIONS[blockchain];
		log2Main("   coin: " + coin_abbreviation);
		Renderer_GUI.SetField(WALLET_COIN_ID, coin_abbreviation);
		
		let wallet_address = wallet[ADDRESS];		
	    log2Main("   wallet_address: " + wallet_address);

        Renderer_GUI.UpdateWalletURL(blockchain, wallet_address);
	} // Renderer_GUI.UpdateBlockchain()
	
	static async UpdateWalletAddress(blockchain, private_key, salt_uuid) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateWalletAddress() " + _END_ + blockchain);
		
		let wallet = {};
		const data = { private_key, salt_uuid, blockchain };
		if (blockchain == ETHEREUM) {
			wallet = await window.ipcMain.GetEthereumWallet(data);
		}
		else if (blockchain == BITCOIN || blockchain == DOGECOIN || blockchain == LITECOIN) {
			wallet = await window.ipcMain.GetCoinKeyWallet(data);
		}

        let wallet_address = wallet[ADDRESS];		
		log2Main("   wallet address: " + wallet_address);
		
		Renderer_GUI.SetField(WALLET_ID,        wallet_address);
		Renderer_GUI.SetField(WALLET_PK_HEX_ID, private_key);
		
		Renderer_GUI.UpdateWalletURL(blockchain, wallet_address);
		
		return wallet;
	} // Renderer_GUI.UpdateWalletAddress()
	
	static UpdateWalletURL(blockchain, wallet_address) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateWalletURL() " + _END_);
		log2Main("   blockchain:     " + blockchain);
		log2Main("   wallet_address: " + wallet_address);
		
		let explorer_URL = MAINNET_EXPLORER_URLs[blockchain] + wallet_address;
		log2Main("   explorer_URL: " + explorer_URL);
		
		let wallet_URL_elt =  Renderer_GUI.GetElement(WALLET_URL_LINK_ID);
		//log2Main("   wallet_URL_elt: " + wallet_URL_elt);
		if (wallet_URL_elt != undefined) {
			wallet_URL_elt.href = explorer_URL;
		}
	} // Renderer_GUI.UpdateWalletURL()
	
	static UpdateWIF(blockchain, wif) {
		if (      (blockchain == BITCOIN || blockchain == DOGECOIN || blockchain == LITECOIN)
  		      &&  wif != undefined &&  wif != "") {
			Renderer_GUI.SetField(WIF_ID, wif);
		}
		else {
			Renderer_GUI.SetField(WIF_ID, "");
		}
	} // Renderer_GUI.UpdateWIF()
	
	static async UpdatePrivateKey(private_key, salt_uuid, wif) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdatePrivateKey() " + _END_);
		Renderer_GUI.SetField(PK_HEX_ID, private_key);
		
		let pk_b64_value = hexToB64(private_key);
		Renderer_GUI.SetField(PK_B64_ID, pk_b64_value);
		
		let blockchain = Renderer_GUI.GetField(WALLET_BLOCKCHAIN_ID);		
		let wallet = await Renderer_GUI.UpdateWalletAddress(blockchain, private_key, salt_uuid);
		
		Renderer_GUI.UpdateWIF(blockchain, wif);
    } // Renderer_GUI.UpdatePrivateKey()
	
	static async UpdateSeedphrase(pk_hex_value) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateSeedphrase() " + _END_);
		let lang = Renderer_GUI.GetElement(LANG_SELECT_ID).value;  
		let data = { pk_hex_value, lang };
        let seedphrase = await window.ipcMain.HexToSeedPhrase(data);
		Renderer_GUI.SetField(SEEDPHRASE_ID, seedphrase);		
		
		Renderer_GUI.SetField(WALLET_SEEDPHRASE_ID, seedphrase);
		
		let seedphrase_as_4letter = await window.ipcMain.SeedphraseAs4letter(seedphrase);
		Renderer_GUI.SetField(SEEDPHRASE_4LETTER_ID, seedphrase_as_4letter);	
    } // Renderer_GUI.UpdateSeedphrase()
	
	static async UpdateSaltUUID(pk_hex_value) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateSaltUUID() " + _END_);
		let seed_elt = Renderer_GUI.GetElement(SEED_ID);
		let new_uuid = "";
		if (seed_elt.value != "") {
			new_uuid = await window.ipcMain.GetUUID();
			//Renderer_GUI.SetField(SALT_ID, new_uuid);
			let salt_elt = Renderer_GUI.GetElement(SALT_ID);
			salt_elt.textContent = new_uuid;
        }
		return new_uuid;
    } // Renderer_GUI.UpdateSaltUUID()
	
	//static OnExploreWallet() {
	//	log2Main(">> " + _CYAN_ + "Renderer_GUI.OnExploreWallet() " + _END_);
	//	
	//	let blockchain = Renderer_GUI.GetField(WALLET_BLOCKCHAIN_ID);
	//	log2Main("   blockchain: " + blockchain);

	//	let wallet_address = Renderer_GUI.GetField(WALLET_ID);		
	//	log2Main("   wallet_address: " + wallet_address);
		
	//	let explorer_URL = MAINNET_EXPLORER_URLs[blockchain] + wallet_address;
	//	log2Main("   explorer_URL: " + explorer_URL);
		
	//	//window.ipcMain.OpenURL(explorer_URL);
	//} // Renderer_GUI.OnExploreWallet()
	
	static ClearFields(field_ids) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.ClearFields() " + _END_);
		for (let i=0; i < field_ids.length; i++) { 
			let field_id = field_ids[i];
			
			let elt = Renderer_GUI.GetElement(field_id);
			
			if (field_id == SALT_ID)
				elt.textContent = "";
			else	
		        elt.value = ""; 
			
			elt.classList.remove(WITH_FOCUS_CSS_CLASS); 
			elt.classList.add(WITHOUT_FOCUS_CSS_CLASS); 
		}
	} // Renderer_GUI.ClearFields()
	
	// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
	static OpenTabPage(pageName, elt, color) {
		log2Main(">>" + _CYAN_ + "Renderer_GUI.OpenTabPage " + elt.id + _END_);
		
		// Hide all elements with class="tabcontent" by default */
		let i, tabcontent, tablinks;
		tabcontent = document.getElementsByClassName("tabcontent");
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = "none";
		}

		// Remove the background color of all tablinks/buttons
		tablinks = document.getElementsByClassName("tablink");
		for (i = 0; i < tablinks.length; i++) {
			tablinks[i].style.backgroundColor = "";
		}

		// Show the specific tab content
		document.getElementById(pageName).style.display = "block";

		// Add the specific color to the button used to open the tab content
		elt.style.backgroundColor = color;
		
		if (Renderer_GUI.EltHasClass(elt.id,    "FourBordersTabLink")) {
			Renderer_GUI.EltRemoveClass(elt.id, "FourBordersTabLink");
		}
		if (! Renderer_GUI.EltHasClass(elt.id, "ThreeBordersTabLink")) {
			Renderer_GUI.EltAddClass(elt.id,   "ThreeBordersTabLink");
		}
			
		let other_tab_link_id = (elt.id == "pk_tab_link_id") ? "wallet_tab_link_id" : "pk_tab_link_id";
		//log2Main("   current_tab_link_id: " + elt.id);
		//log2Main("   other_tab_link_id:   " + other_tab_link_id);
		
		if (Renderer_GUI.EltHasClass(other_tab_link_id,    "ThreeBordersTabLink")) {
			Renderer_GUI.EltRemoveClass(other_tab_link_id, "ThreeBordersTabLink");
		}
		if (! Renderer_GUI.EltHasClass(other_tab_link_id, "FourBordersTabLink")) {
			Renderer_GUI.EltAddClass(other_tab_link_id,   "FourBordersTabLink");
		}
	} // Renderer_GUI.OpenTabPage()
	
	static OnChangeBip39Language(evt) {
		let elt = evt.target || evt.srcElement;		
		if (elt.id == LANG_SELECT_ID) {
			let lang_value = elt.value;
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnChangeBip39Language() " + _END_ + lang_value);
			Renderer_GUI.UpdateFields();
	    }
		else {
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnChangeBip39Language() " + _END_);	
		}
	} // Renderer_GUI.OnChangeBip39Language()

	static async OnChangeBlockchain(evt) {
		let elt = evt.target || evt.srcElement;		
		if (elt.id == WALLET_BLOCKCHAIN_ID) {
			let blockchain = elt.value;
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnChangeBlockchain() " + _END_ + blockchain);
			await Renderer_GUI.UpdateBlockchain(blockchain);
	    }
		else {
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnChangeBlockchain() " + _END_);	
		}
	} // Renderer_GUI.OnChangeBlockchain()
	
	static async OnKeyDown(evt) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.OnKeyDown() " + _END_ + "'" + evt.key+ "' keycode: " + evt.keyCode);		
		//log2Main(">> elt: " + elt.id + " length: " + elt.value.length);
		let elt = evt.target || evt.srcElement;
		
		let clipboard_text = await navigator.clipboard.readText();
		//log2Main("   clipboard_text: " + clipboard_text);
	
		//log2Main("   elt: " + elt.id);
		//log2Main("   " + ALLOWED_ALPHABETS[elt.id]);
		if (evt.key == 'Delete') return true;
		
		let allowed_alphabet = ALLOWED_ALPHABETS[elt.id];
		//log2Main("   evt.key: '" + evt.key + "'");
		if (allowed_alphabet!= undefined && allowed_alphabet.indexOf(evt.key) == -1) { 
		    //log2Main("   " + evt.key + " INVALID INPUT");
			evt.preventDefault();
			return false;
	    }
		
		if (elt.id == PK_HEX_ID) {
			Renderer_GUI.SetField(SEED_ID, "");
		}
		else if (elt.id == SEED_ID && elt.value.length > 0) {
			Renderer_GUI.ClearFields(WATERFALL_FROM_SEED_IDS);
			
			let new_uuid = await window.ipcMain.GetUUID();
			let salt_elt = Renderer_GUI.GetElement(SALT_ID);
		    salt_elt.textContent = new_uuid;
			
			let sb_msg_elt = Renderer_GUI.GetElement(SB_MSG_ID);
			sb_msg_elt.textContent = UPDATE_MSG;
		}
		
		return true;
	} // Renderer_GUI.OnKeyDown()
	
	static async OnInput(evt) {		
	    let elt = evt.target || evt.srcElement;
	    log2Main(">> " + _CYAN_ + "Renderer_GUI.OnInput() " + _END_ + elt.id );
        
		//log2Main(">> elt: " + elt.id + " length: " + elt.value.length);
		//log2Main("   evt.data: " + evt.data);
		
		if (elt.id == PK_HEX_ID) {
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnInput() " + _END_ + elt.id );
			if (elt.value.length != Renderer_GUI.Required_Hex_digits) {
				//log2Main(  ">> elt: " + elt.id + " length: " + elt.value.length 
				//         + " has " + _RED_ + "INVALID LENGTH (" + Renderer_GUI.Required_Hex_digits + ")" + _END_);
				elt.classList.remove(VALID_VALUE_CSS_CLASS); 
				elt.classList.add(INVALID_VALUE_CSS_CLASS); 
			}
			else {
                //log2Main(  ">> elt: " + elt.id + " length: " + elt.value.length 
				//         + " has " + _GREEN_ + "VALID LENGTH (" + Renderer_GUI.Required_Hex_digits + ")" + _END_);
				elt.classList.remove(INVALID_VALUE_CSS_CLASS); 
				elt.classList.add(VALID_VALUE_CSS_CLASS); 
				//Renderer_GUI.SetField(SEED_ID, "");
				Renderer_GUI.ClearFields(WATERFALL_IDS);
				
				let sb_msg_elt = Renderer_GUI.GetElement(SB_MSG_ID);
			    sb_msg_elt.textContent = UPDATE_MSG;
			}
		} 
		else if (elt.id == SEEDPHRASE_ID) {
			//log2Main("   will check: " + elt.id);
			let seedphrase = elt.value.replace(/  +/g, ' ');
			//log2Main("   seedphrase:\n" + seedphrase);
			elt.value = seedphrase;
			let lang       = Renderer_GUI.GetLang();
			let wordcount  = Renderer_GUI.Seedphrase_expected_wordcount;
			let data = { seedphrase, lang, wordcount };
            let check_seedphrase = await window.ipcMain.CheckSeedphrase(data);
			//log2Main("   check_seedphrase: " + check_seedphrase);
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnInput() " + _END_ + check_seedphrase );
			if (check_seedphrase) {
				elt.classList.remove(INVALID_VALUE_CSS_CLASS); 
				elt.classList.add(VALID_VALUE_CSS_CLASS); 
				
				let lang = Renderer_GUI.GetLang();
				let data = { seedphrase, lang };
				let pk_hex = await window.ipcMain.SeedPhraseToPrivateKey(data);
				log2Main("   pk_hex: " + pk_hex );
				Renderer_GUI.SetField(PK_HEX_ID, pk_hex);
				Renderer_GUI.SetField(SEED_ID, "");
				Renderer_GUI.UpdateFields();
			}
			else {
				elt.classList.remove(VALID_VALUE_CSS_CLASS); 
				elt.classList.add(INVALID_VALUE_CSS_CLASS); 
			}
		}	
	} // Renderer_GUI.OnInput()
	
	static SetFocus(elt_id) { 
		let target_elt = Renderer_GUI.GetElement(elt_id);
		for (let i=0; i < FIELD_IDS.length; i++) { 
			let field_id = FIELD_IDS[i];
			let elt = Renderer_GUI.GetElement(field_id);
			
		    if (target_elt.id == field_id) {
				elt.classList.remove(WITHOUT_FOCUS_CSS_CLASS); 
				elt.classList.add(WITH_FOCUS_CSS_CLASS); 			    
			}
			else {  
				elt.classList.remove(WITH_FOCUS_CSS_CLASS); 
			    elt.classList.add(WITHOUT_FOCUS_CSS_CLASS); 
			}
		} 
	} // Renderer_GUI.SetFocus()
	
	static OnFocus(evt) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.OnFocus()" + _END_);
		let source_elt = evt.target || evt.srcElement;
		
		if (! EDITABLE_FIELD_IDS.includes(source_elt.id)) {
			return;
	    } 
		
		Renderer_GUI.SetFocus(source_elt.id);
	} // Renderer_GUI.OnFocus()
	
	// https://stackoverflow.com/questions/2155737/remove-css-class-from-element-with-javascript-no-jquery
	static EltHasClass(elt_id, className) {
		//log2Main(">> EltHasClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return false;
		}		
		//log2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			return elt.classList.contains(className);
		} else {
			return (-1 < elt.className.indexOf(className));
		}
		return false;
	} // Renderer_GUI.EltHasClass()
	
	static EltAddClass(elt_id, className) {
		//log2Main(">> EltAddClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return;
		}
		//log2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			elt.classList.add(className);
		} else if (! Renderer_GUI.EltHasClass(elt, className)) {
			let classes = elt.className.split(" ");
			classes.push(className);
			elt.className = classes.join(" ");
		}
		return elt;
	} // Renderer_GUI.EltAddClass()
	
	static EltRemoveClass(elt_id, className) {
		//log2Main(">> EltRemoveClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return;
		}
		//log2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			elt.classList.remove(className);
		} else {
			let classes = elt.className.split(" ");
			classes.splice(classes.indexOf(className), 1);
			elt.className = classes.join(" ");
		}
		return elt;
	} // Renderer_GUI.EltRemoveClass()
	
	static GetLang() {
		let lang = "EN";
		let elt = Renderer_GUI.GetElement(LANG_SELECT_ID);
		if (elt != undefined) {
			lang = elt.value;			
	    }
		return lang;
	} // Renderer_GUI.GetLang()
	
	static async GetCryptoInfo() {
		let crypto_info = {};
		
		let pk_hex_elt = Renderer_GUI.GetElement(PK_HEX_ID); 
		let pk_hex_value = pk_hex_elt.value;
		crypto_info['Private Key (Hex)'] = pk_hex_value;
		
		let pk_b64_elt = Renderer_GUI.GetElement(PK_B64_ID); 
		let pk_b64_value = pk_b64_elt.value;
		crypto_info['Private Key (B64)'] = pk_b64_value;
		
		let seedphrase_elt = Renderer_GUI.GetElement(SEEDPHRASE_ID); 
		let seedphrase = seedphrase_elt.value;
		crypto_info['Seedphrase'] = seedphrase;
		
		let shortened_seedphrase_elt = Renderer_GUI.GetElement(SEEDPHRASE_4LETTER_ID); 
		let shortened_seedphrase = shortened_seedphrase_elt.value;
		crypto_info['Shortened Seedphrase'] = shortened_seedphrase;
		
		let lang = Renderer_GUI.GetLang();
		let data = { seedphrase, lang };
		let word_indices = await window.ipcMain.SeedPhraseToWordIndices(data);
		crypto_info['Word indices'] = JSON.stringify(word_indices);
		
		crypto_info['language'] = lang;
		
		return crypto_info;
	} // Renderer_GUI.GetCryptoInfo()
		
	static async ImportRawData() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.ImportRawData()" + _END_);
		window.ipcMain.ImportRawData();
	} // Renderer_GUI.ImportRawData()
	
		static GetElement(elt_id) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { return elt; }
		return undefined;
	} // Renderer_GUI.GetElement()
	
	static GetField(elt_id) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.GetField() " + _END_ + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { 
			if (elt.nodeName == "TD" || elt.nodeName == "SPAN") {
				return elt.textContent;
			}
			else {
				return elt.value;
			}	
		}
		return undefined;
	} // Renderer_GUI.GetField()
	
	static SetField(elt_id, value_str) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.SetField() " + _END_ + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { 
			if (elt.nodeName == "TD" || elt.nodeName == "SPAN") {
				elt.textContent = value_str;
			}
			else {
				elt.value = value_str;
			}	
		}
	} // Renderer_GUI.SetField()
	
	static SetEventHandler(elt_id, event_name, handler_function) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // Renderer_GUI.SetEventHandler()
} // Renderer_GUI class

Renderer_GUI.Init();