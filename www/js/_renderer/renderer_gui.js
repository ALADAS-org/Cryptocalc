// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
"use strict";

// https://www.electronjs.org/docs/latest/tutorial/quick-start

const HEXA_ALPHABET      = "0123456789abcdefABCDEF";
const ALLOWED_ALPHABETS  = { [PK_HEX_ID]: HEXA_ALPHABET };
const FIELD_IDS          = [ SEED_ID, PK_HEX_ID, PK_B64_ID, SEEDPHRASE_ID, SEEDPHRASE_4LETTER_ID ];
const EDITABLE_FIELD_IDS = [ SEED_ID, PK_HEX_ID, SEEDPHRASE_ID ];

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
	
	static GetElement(elt_id) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { return elt; }
		return undefined;
	} // Renderer_GUI.GetElement()
	
	static GetField(elt_id) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.GetField() " + _END_ + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { return elt.value; }
		return undefined;
	} // Renderer_GUI.GetField()
	
	static SetField(elt_id, value_str) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.SetField() " + _END_ + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { elt.value = value_str; }
	} // Renderer_GUI.SetField()
	
	static SetEventHandler(elt_id, event_name, handler_function) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // Renderer_GUI.SetEventHandler()
	
	static RegisterCallbacks() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.RegisterCallbacks()" + _END_);
		
		Renderer_GUI.SetEventHandler(PK_HEX_ID,             'input',   async (evt) => { await Renderer_GUI.OnInput(evt); }     );
															
		Renderer_GUI.SetEventHandler(PK_B64_ID,             'input',   async (evt) => { await Renderer_GUI.OnInput(evt); }     );
		
		Renderer_GUI.SetEventHandler(SEED_ID,               'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );	
		
		Renderer_GUI.SetEventHandler(PK_HEX_ID,             'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );
		Renderer_GUI.SetEventHandler(PK_HEX_ID,             'keydown', async (evt) => { await Renderer_GUI.OnKeyDown(evt); }   );
					
		Renderer_GUI.SetEventHandler(PK_B64_ID,             'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );
		
		Renderer_GUI.SetEventHandler(SEEDPHRASE_ID,         'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }                 );											   
		Renderer_GUI.SetEventHandler(SEEDPHRASE_ID,         'input',   async (evt) => { await Renderer_GUI.OnInput(evt); }     );
		Renderer_GUI.SetEventHandler(SEEDPHRASE_ID,         'keydown', async (evt) => { await Renderer_GUI.OnKeyDown(evt); }   );
		
		Renderer_GUI.SetEventHandler(LANG_SELECT_ID,        'change',  (evt) => { Renderer_GUI.OnChangeLanguage(evt); }        );
		
		Renderer_GUI.SetEventHandler(SEEDPHRASE_4LETTER_ID, 'focus',   (evt) => { Renderer_GUI.OnFocus(evt); }           );
		
		Renderer_GUI.SetEventHandler(FILE_IMPORT_BTN_ID,    'click',   (evt) => { Renderer_GUI.ImportRawData(); }        );		
		
        Renderer_GUI.SetEventHandler(UPDATE_BTN_ID,         'click',   async (evt) => { await Renderer_GUI.UpdateFields(); }   );		
		Renderer_GUI.SetEventHandler(GENERATE_BTN_ID,       'click',   async (evt) => { await Renderer_GUI.GenerateFields(); } );									 
		Renderer_GUI.SetEventHandler(CLEAR_BTN_ID,          'click',   Renderer_GUI.ClearFields);
									 
        trigger_event(Renderer_GUI.GetElement(GENERATE_BTN_ID), 'click');
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
			
			let sha_256_value_hex = await window.ipcMain.GetSHA256(seed_value);
			//log2Main("   sha_256_value_hex: " + sha_256_value_hex);
			
			//log2Main("   sha_256_value_hex:\n   " + sha_256_value_hex);
			pk_hex_elt.value = sha_256_value_hex;
			await Renderer_GUI.PropagateFields(pk_hex_elt.value);
		}
		else if (pk_hex_elt.value.length == Renderer_GUI.Required_Hex_digits) {
			await Renderer_GUI.GenerateFields(pk_hex_elt.value);
		}	
	} // Renderer_GUI.UpdateFields()

	static async PropagateFields(pk_hex_value) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.PropagateFields()" + _END_);
				
		if (pk_hex_value == undefined) {
			log2Main("   pk_hex_value UNDEFINED >> Generate Random PK");
			pk_hex_value = getRandomHexValue(32);
		}	
		Renderer_GUI.SetField(PK_HEX_ID, pk_hex_value);
		
		let pk_b64_value = hexToB64(pk_hex_value);
		Renderer_GUI.SetField(PK_B64_ID, pk_b64_value);
		
		let new_uuid = await window.ipcMain.GetUUID();
		//Renderer_GUI.SetField(SALT_ID, new_uuid);
		let salt_elt = Renderer_GUI.GetElement(SALT_ID);
		salt_elt.textContent = new_uuid;

		let data_hex = pk_hex_value;
		let lang = Renderer_GUI.GetElement(LANG_SELECT_ID).value;  
		let data = { data_hex, lang };
        let seedphrase = await window.ipcMain.HexToSeedPhrase(data);
		Renderer_GUI.SetField(SEEDPHRASE_ID, seedphrase);		
		
		let seedphrase_as_4letter = await window.ipcMain.SeedphraseAs4letter(seedphrase);
		Renderer_GUI.SetField(SEEDPHRASE_4LETTER_ID, seedphrase_as_4letter);		
	} // Renderer_GUI.PropagateFields()
	
	static async GenerateFields(pk_hex_value) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.GenerateFields()" + _END_);
		
		Renderer_GUI.SetField(SEED_ID, "");
				
		await Renderer_GUI.PropagateFields(pk_hex_value);
		
		Renderer_GUI.SetFocus(PK_HEX_ID);
	} // Renderer_GUI.GenerateFields()
	
	static ClearFields() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.ClearFields()" + _END_);
		for (let i=0; i < FIELD_IDS.length; i++) { 
			let field_id = FIELD_IDS[i];
			
			let elt = Renderer_GUI.GetElement(field_id);
		    elt.value = ""; 
			
			elt.classList.remove(WITH_FOCUS_CSS_CLASS); 
			elt.classList.add(WITHOUT_FOCUS_CSS_CLASS); 
		}
	} // Renderer_GUI.ClearFields()
	
	static OnChangeLanguage(evt) {
		let elt = evt.target || evt.srcElement;
		
		if (elt.id == LANG_SELECT_ID) {
			let lang_value = elt.value;
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnChangeLanguage() " + _END_ + lang_value);
			Renderer_GUI.UpdateFields();
	    }
		else {
			log2Main(">> " + _CYAN_ + "Renderer_GUI.OnChangeLanguage() " + _END_);	
		}
	} // Renderer_GUI.OnChangeLanguage()
	
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
				Renderer_GUI.SetField(SEED_ID, "");
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
	
	static async OnGUIEvent(data) {
		//log2Main(">> " + _CYAN_ + "Renderer_GUI.OnGUIEvent()" + _END_);

		let event_name = data[0];
				
		switch ( event_name ) {
			case DID_FINISH_LOAD:
				log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + DID_FINISH_LOAD + _END_);
				Renderer_GUI.RegisterCallbacks();	
				break;	

            case SET_RENDERER_VALUE:
                log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + SET_RENDERER_VALUE + _END_);	
				let cryptocalc_version = data[1];
				//log2Main("   cryptocalc_version: " + cryptocalc_version);
                RendererSession.SetValue(CRYPTO_CALC_VERSION, cryptocalc_version);				
				break;
				
			case SET_INPUT_FIELD_VALUE:
                log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + SET_INPUT_FIELD_VALUE + _END_);	
				let raw_data_str = data[1];
				//log2Main("   SET_INPUT_FIELD_VALUE:\n" + raw_data_str);
                Renderer_GUI.SetField(SEED_ID, raw_data_str);	
				Renderer_GUI.UpdateFields();				
				break;
				
			case REQUEST_FILE_SAVE:
			    log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + REQUEST_FILE_SAVE + _END_);	
				let crypto_info = await Renderer_GUI.GetCryptoInfo();
                window.ipcMain.SavePrivateKeyInfo(crypto_info);				
				break;
				
			case HELP_ABOUT:
			    log2Main(">> " + _CYAN_ + "Renderer_GUI OnGUIEvent: " + _YELLOW_ + HELP_ABOUT + _END_);
				let crypto_calc_version = RendererSession.GetValue(CRYPTO_CALC_VERSION);
				let description_data =   
						  "<center><b>Cryptocalc " + crypto_calc_version + "</b></center><br>" 
						+ "&nbsp;A crypto assets calculator";
			    //log2Main("   " + HELP_ABOUT + " " + description_data);

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
} // Renderer_GUI class

Renderer_GUI.Init();