// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
"use strict";

// https://www.electronjs.org/docs/latest/tutorial/quick-start

class Renderer_GUI {
	static Init() {
		let msg = ">> " + _CYAN_ + "Renderer_GUI.Init()" + _END_;
		window.ipcMain.log2Main(msg);	

		window.ipcMain.receive("fromMain", 
			async (data) => { await Renderer_GUI.OnEvent(data); }
		); // window.ipcMain.receive() call
	} // Renderer_GUI.Init()
	
	static async RegisterCallbacks() {
		let msg = ">> " + _CYAN_ + "Renderer_GUI.RegisterCallbacks()" + _END_;
		window.ipcMain.log2Main(msg);
		
		//---------- CLEAR_BTN_ID event handler ----------
		let clear_btn_node = document.getElementById(CLEAR_BTN_ID);
		if (clear_btn_node != undefined) {
			clear_btn_node.addEventListener('click', Renderer_GUI.ClearFields);
		}
		//---------- CLEAR_BTN_ID event handler
		
		//---------- GENERATE_BTN_ID event handler ----------
		let generate_btn_node = document.getElementById(GENERATE_BTN_ID);
		if (generate_btn_node != undefined) {
			generate_btn_node.addEventListener('click', 
			                                   async() => { Renderer_GUI.GenerateFields(); } );
		}
		//---------- GENERATE_BTN_ID event handler
		
		await Renderer_GUI.GenerateFields();
	} // Renderer_GUI.RegisterCallbacks()
	
	static SetField(field_id, value_str) {
		let field_node = document.getElementById(field_id);
		if (field_node != undefined) { field_node.value = value_str; }
	} // Renderer_GUI.SetField()
	
	static ClearFields() {
		let msg = ">> " + _CYAN_ + "Renderer_GUI.ClearFields()" + _END_;
		window.ipcMain.log2Main(msg);
		
		Renderer_GUI.SetField(PK_HEX_ID, "");
		Renderer_GUI.SetField(PK_B64_ID, "");
	} // Renderer_GUI.ClearFields()
	
	static async GenerateFields() {
		let msg = ">> " + _CYAN_ + "Renderer_GUI.GenerateFields()" + _END_;
		window.ipcMain.log2Main(msg);
		
		let pk_hex = getRandomHexValue(32);
		Renderer_GUI.SetField(PK_HEX_ID, pk_hex);
		
		let pk_b64 = hexToB64(pk_hex);
		Renderer_GUI.SetField(PK_B64_ID, pk_b64);

        let mnemonics = await window.ipcMain.HexToSeedPhrase(pk_hex);
		Renderer_GUI.SetField(MNEMONICS_ID, mnemonics);		
	} // Renderer_GUI.GenerateFields()
	
	static async OnEvent(data) {
		let msg = "";
		msg = ">> " + _CYAN_ + "Renderer_GUI.OnEvent()" + _END_;
		window.ipcMain.log2Main(msg);

		let event_name = data[0];
		let log_msg = "";
				
		switch ( event_name ) {
			case DID_FINISH_LOAD:
				log_msg =  ">> " + _CYAN_ + "Renderer_GUI OnEvent: ++ " + _YELLOW_ + DID_FINISH_LOAD + _END_;
				window.ipcMain.log2Main(log_msg);
				await Renderer_GUI.RegisterCallbacks();	
				break;				
				
			case HELP_ABOUT:
				log_msg =  ">> " + _CYAN_ + "Renderer_GUI OnEvent: " + _YELLOW_ + HELP_ABOUT + _END_;
				window.ipcMain.log2Main(log_msg);		
				
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
				log_msg =  ">> " + _CYAN_ + "Renderer_GUI OnEvent: "
						 + _YELLOW_ + "ACK[" + event_name + "]" + _END_ + "from main";
				window.ipcMain.log2Main(log_msg);
				//DialogManager.Clean();
				break;
		} // switch ( event_name )
	} // Renderer_GUI.OnEvent()
} // Renderer_GUI class

Renderer_GUI.Init();