// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
"use strict";

// https://www.electronjs.org/docs/latest/tutorial/quick-start

const FIELD_IDS          = [ PK_HEX_ID, PK_B64_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const EDITABLE_FIELD_IDS = [ PK_HEX_ID ];

const trigger_event = (elt, eventType) => elt.dispatchEvent(new CustomEvent(eventType, {}));

const log2Main = (msg) => {
	window.ipcMain.log2Main(msg);
};
							  
class Renderer_GUI {
	static Required_Hex_digits = 64;
	static Required_B64_digits = 44;
	
	static Init() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.Init()" + _END_);

		window.ipcMain.receive("fromMain", 
			async (data) => { await Renderer_GUI.OnEvent(data); }
		); // window.ipcMain.receive() call
	} // Renderer_GUI.Init()
	
	static GetElement(elt_id) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { return elt; }
		return undefined;
	} // Renderer_GUI.GetElement()
	
	static SetField(elt_id, value_str) {
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
		
		Renderer_GUI.SetEventHandler(PK_HEX_ID,            'input', (evt) => { Renderer_GUI.OnInput(evt); });
		Renderer_GUI.SetEventHandler(PK_B64_ID,            'input', (evt) => { Renderer_GUI.OnInput(evt); });
		
		Renderer_GUI.SetEventHandler(PK_HEX_ID,            'focus', (evt) => { Renderer_GUI.OnFocus(evt); });
		Renderer_GUI.SetEventHandler(PK_B64_ID,            'focus', (evt) => { Renderer_GUI.OnFocus(evt); });
		Renderer_GUI.SetEventHandler(MNEMONICS_ID,         'focus', (evt) => { Renderer_GUI.OnFocus(evt); });
		Renderer_GUI.SetEventHandler(MNEMONICS_4LETTER_ID, 'focus', (evt) => { Renderer_GUI.OnFocus(evt); });
		
		
        Renderer_GUI.SetEventHandler(UPDATE_BTN_ID, 'click', Renderer_GUI.UpdateFields);
		
		Renderer_GUI.SetEventHandler(GENERATE_BTN_ID, 'click', 
		                             async (evt) => { Renderer_GUI.GenerateFields(); });
									 
		Renderer_GUI.SetEventHandler(CLEAR_BTN_ID, 'click', Renderer_GUI.ClearFields);
									 
        trigger_event(Renderer_GUI.GetElement(GENERATE_BTN_ID), 'click');
	} // Renderer_GUI.RegisterCallbacks()
	
	static UpdateFields() {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.UpdateFields()" + _END_);
		let pk_hex_elt = Renderer_GUI.GetElement(PK_HEX_ID); 
		if (pk_hex_elt.value.length == Renderer_GUI.Required_Hex_digits) {
			Renderer_GUI.GenerateFields(pk_hex_elt.value);
		}	
	} // Renderer_GUI.UpdateFields()
	
	static async GenerateFields(pk_hex_value) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.GenerateFields()" + _END_);
		
		if (pk_hex_value == undefined) {
			pk_hex_value = getRandomHexValue(32);
		}	
		Renderer_GUI.SetField(PK_HEX_ID, pk_hex_value);
		
		let pk_b64_value = hexToB64(pk_hex_value);
		Renderer_GUI.SetField(PK_B64_ID, pk_b64_value);

        let mnemonics = await window.ipcMain.HexToSeedPhrase(pk_hex_value);
		Renderer_GUI.SetField(MNEMONICS_ID, mnemonics);		
		
		let mnemonics_as_4letter = await window.ipcMain.SeedphraseAs4letter(mnemonics);
		Renderer_GUI.SetField(MNEMONICS_4LETTER_ID, mnemonics_as_4letter);		
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
	
	static OnInput(event) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.OnInput()" + _END_);		
		let elt = event.target || event.srcElement;
		//log2Main(">> elt: " + elt.id + " length: " + elt.value.length);
	
		if (elt.id == PK_HEX_ID) {
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
			}
		} 
	} // Renderer_GUI.OnInput()
	
	static OnFocus(event) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.OnFocus()" + _END_);
		let source_elt = event.target || event.srcElement;
		
		if (! EDITABLE_FIELD_IDS.includes(source_elt.id)) {
			return;
	    } 
		
		for (let i=0; i < FIELD_IDS.length; i++) { 
			let field_id = FIELD_IDS[i];
			let elt = Renderer_GUI.GetElement(field_id);
			
		    if (source_elt.id != field_id) {
			    elt.classList.remove(WITH_FOCUS_CSS_CLASS); 
			    elt.classList.add(WITHOUT_FOCUS_CSS_CLASS); 
			}
			else {  
				elt.classList.remove(WITHOUT_FOCUS_CSS_CLASS); 
				elt.classList.add(WITH_FOCUS_CSS_CLASS); 
			}
		} 
	} // Renderer_GUI.OnFocus()
	
	static OnEvent(data) {
		log2Main(">> " + _CYAN_ + "Renderer_GUI.OnEvent()" + _END_);

		let event_name = data[0];
				
		switch ( event_name ) {
			case DID_FINISH_LOAD:
				log2Main(">> " + _CYAN_ + "Renderer_GUI OnEvent: " + _YELLOW_ + DID_FINISH_LOAD + _END_);
				Renderer_GUI.RegisterCallbacks();	
				break;				
				
			case HELP_ABOUT:
			    log2Main(">> " + _CYAN_ + "Renderer_GUI OnEvent: " + _YELLOW_ + HELP_ABOUT + _END_);
				//let app_version = RendererSession.GetValue(SILVERQUOTE_VERSION);
				//let description_data =   
				//		  "<center><b>Silverquote " + app_version + "</b></center><br>" 
				//		+ "&nbsp;A collectible wallet generator";
				// https://izitoast.marcelodolza.com/
				//DialogManager.Clean();
				//iziToast.info({
				//	iconUrl:         './icons/ZCash_rev_icn.png',
				//	position:        'center',
				//	backgroundColor: '#FEF9E7',
				//	message:     description_data,
				//	maxWidth:    450, layout: 2,
				//	timeout:     false, progressBar: false
				//});
				break;	
				
			default:
				log2Main( ">> " + _CYAN_ + "Renderer_GUI OnEvent: "
						  + _YELLOW_ + "ACK[" + event_name + "]" + _END_ + "from main");
				//DialogManager.Clean();
				break;
		} // switch ( event_name )
	} // Renderer_GUI.OnEvent()
} // Renderer_GUI class

Renderer_GUI.Init();