// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

// ===============================  RendererGUI class  ===============================
// NB: "Singleton" class
// * static GetInstance()
// ------------------------------------------------------
// *        initWallet()
// * async  updateOptionsFields( json_data )
// * async  setSupportedBlockchains( supported_blockchains )
// * async  updateEntropySize( entropy_size )
// * async  updateWalletMode( wallet_mode )
// * async  onGUIEvent( data )
// * async  didFinishLoadInit()
// * async  localizeHtmlNodes()
// *        registerCallbacks()
// * async  updateFields()
// * async  getSaltedEntropySource()
// * async  propagateFields( entropy, wif )
// * async  updateEntropy( entropy )
// *        updateBlockchain( blockchain )
// * async  generateHDWalletAddress( blockchain, entropy )
// * async  generateSimpleWalletAddress( blockchain, entropy )
// *        updateWalletURL( blockchain, wallet_address )
// *        updateWIF( blockchain, wif )
// *        updatePrivateKey( blockchain, PRIV_KEY )
// * async  updateChecksum( entropy )
// * async  updateMnemonics( entropy )
// * async  updateWordIndexes()
// * async  generateSalt()
// * async  generateRandomFields()
// * async  getCryptoInfo()
// * 	    clearFields( field_ids )
// * async  onChangeEntropySize( evt )
// * async  onChangeWordCount( evt )
// * async  onChangeBip39Lang( evt )
// * async  onChangeWalletMode( evt )
// * async  onChangeBlockchain( evt )
// *        openTabPage( pageName, elt, color )
// * async  onKeyDown( evt )
// * async  onInput( evt )
// *        setFocus( elt_id )
// *        onFocus( evt )
// *        getLang() 
// * async  importRawData()
// *        setEventHandler( elt_id, event_name, handler_function )

const ALLOWED_ALPHABETS       = { [ENTROPY_ID]: HEX_ALPHABET };
const FIELD_IDS               = [ ENTROPY_SRC_FORTUNES_ID, SALT_ID, ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const WATERFALL_IDS           = [ ENTROPY_SRC_FORTUNES_ID, SALT_ID, ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const WATERFALL_FROM_SEED_IDS = [ ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const EDITABLE_FIELD_IDS      = [ ENTROPY_SRC_FORTUNES_ID, ENTROPY_ID, MNEMONICS_ID ];

const ON_GUI_EVENT_LOG_PREFIX = ">> " + _CYAN_ + "RendererGUI.onGUIEvent: ";

const trigger_event = ( elt, event_type ) => elt.dispatchEvent( new CustomEvent( event_type, {} ) );

class RendererGUI {	
	static #key = {};
	static #_Singleton = new RendererGUI(this.#key);
	
	static GetInstance() {
		if( RendererGUI.#_Singleton == undefined ){
			RendererGUI.#_Singleton = new RendererGUI();
        }
        return RendererGUI.#_Singleton;
    } // RendererGUI.GetInstance() 

    // ** Private constructor **
	constructor( key ) {
		if (key !== RendererGUI.#key) {
			throw new TypeError("RendererGUI constructor is private.");
		}
		
		this.initWallet();
		
		this.Options                      = {};
		this.SupportedBlockchains         = {};
		
		this.entropy_source_type          = IMAGE_ENTROPY_SRC_TYPE;
		
		this.expected_entropy_bytes       = 16;
		this.expected_entropy_digits      = 32;
		this.expected_word_count          = 12;
		
		this.bip32_account_index          = 0;
		this.bip32_address_index          = 0;
		
		this.entropy_source_is_user_input = false;
		
		this.img_data_asURL               = "";
		
		log2Main(">> " + _CYAN_ + "RendererGUI.constructor()" + _END_);

		window.ipcMain.receive("fromMain", 
			async (data) => { await this.onGUIEvent(data); }
		); // window.ipcMain.receive() call
	} // ** Private constructor **
	
	initWallet() {
		this.wallet = {};
		this.wallet[BLOCKCHAIN] = ETHEREUM;
	} // initWallet();
	
	async updateOptionsFields( options_data ) {
		let log_msg = ">> " + _CYAN_ + "RendererGUI.updateOptionsFields" + _END_;
		log2Main(log_msg);
		if ( options_data == undefined ) {
			log2Main("   " + _RED_ + "**ERROR** options_data: " + options_data + _END_);
			await window.ipcMain.QuitApp();
		}
		
		log2Main("   *!!* options_data: " + JSON.stringify(options_data));		
		
		let default_blockchain = options_data[DEFAULT_BLOCKCHAIN];
		//log2Main( "   default_blockchain: " + default_blockchain );
		HtmlUtils.SetField( WALLET_BLOCKCHAIN_ID, default_blockchain );		
		HtmlUtils.SetField( WALLET_COIN_ID, COIN_ABBREVIATIONS[default_blockchain] );

		let wallet_mode = options_data[WALLET_MODE];
		log2Main( "   wallet_mode: " + wallet_mode );
		await this.updateWalletMode( wallet_mode );

		let entropy_size = options_data[ENTROPY_SIZE][wallet_mode];
		log2Main( "   entropy_size: " + entropy_size );
        await this.updateEntropySize( entropy_size );		
	} // async updateOptionsFields()
	
	async setSupportedBlockchains( supported_blockchains ) {
		let log_msg = ">> " + _CYAN_ + "RendererGUI.setSupportedBlockchains" + _END_;
		log2Main(log_msg);		
		
		await this.updateWalletMode();
	} // setSupportedBlockchains()
	
	async onChangeWalletMode( evt ) {		
		let elt = evt.target || evt.srcElement;		
		if (elt.id == WALLET_MODE_SELECT_ID) {
			let wallet_mode = elt.value;
			log2Main(">> " + _RED_ + "RendererGUI.onChangeWalletMode() " + _END_ + wallet_mode);
			log2Main("   ++ 0 wallet_mode: " + wallet_mode);
			log2Main("   ++ 1 this.Options: " + this.Options);
			await this.updateWalletMode( wallet_mode );
			log2Main("   ++ 2 this.Options: " + this.Options);			

            await window.ipcMain.UpdateOptions( this.Options );				  
	    }
	} // onChangeWalletMode()	
	
	async updateWalletMode( wallet_mode ) {
		let log_msg = ">> " + _GREEN_ + "RendererGUI.updateWalletMode" + _END_;
		log2Main(log_msg);
		log2Main("   1 this.Options: " + JSON.stringify(this.Options) );
		log2Main("   1 wallet_mode: " + wallet_mode );
		
		if ( wallet_mode != undefined ) {			
			this.Options[WALLET_MODE] = wallet_mode;
		}
		else {
			wallet_mode = this.Options[WALLET_MODE];
		}		

	    if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
			HtmlUtils.SetField( WALLET_MODE_SELECT_ID, SIMPLE_WALLET_TYPE );
			HtmlUtils.ShowElement( SW_ENTROPY_SIZE_ID );
			HtmlUtils.ShowElement( SW_WORD_COUNT_ID );
			HtmlUtils.HideElement( ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideElement( WORD_COUNT_SELECT_ID );
			HtmlUtils.HideElement( DERIVATION_PATH_ROW );
 
            this.Options[ENTROPY_SIZE][SIMPLE_WALLET_TYPE] = 256;	
		}
		else if ( wallet_mode == HD_WALLET_TYPE ) {
			HtmlUtils.SetField( WALLET_MODE_SELECT_ID, HD_WALLET_TYPE );
			HtmlUtils.ShowElement( ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.ShowElement( DERIVATION_PATH_ROW );
			HtmlUtils.HideElement( SW_ENTROPY_SIZE_ID);
			HtmlUtils.HideElement( SW_WORD_COUNT_ID );			
		}
				
		//await ipcMain.UpdateOptions( this.Options ); 
	} // async updateWalletMode()
	
	async updateEntropySize( entropy_size ) {		
		log2Main(">> " + _YELLOW_ + "RendererGUI.updateEntropySize() " + _END_ + entropy_size);
		this.expected_entropy_bytes  = 16;
		this.expected_entropy_digits = 32;
		this.expected_word_count     = 12;
		
		if ( isString( entropy_size ) ) {
			entropy_size = parseInt( entropy_size );
		}
		
		log2Main("   ++ entropy_size: " + entropy_size);
		
		this.expected_entropy_bytes  = EntropySize.GetExpectedByteCount( entropy_size );
		this.expected_word_count     = EntropySize.GetExpectedWordCount( entropy_size );
		this.expected_entropy_digits = this.expected_entropy_bytes * 2;
		
		let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID );
		entropy_elt.setAttribute("minlength", this.expected_entropy_digits);
		entropy_elt.setAttribute("maxlength", this.expected_entropy_digits);
		
		//log2Main("   this.expected_word_count: " + this.expected_word_count);
			
		HtmlUtils.SetField( ENTROPY_SIZE_SELECT_ID, entropy_size );
		HtmlUtils.SetField( WORD_COUNT_SELECT_ID,   this.expected_word_count );
		
		await this.updateFields();
		
		let wallet_mode = this.Options[WALLET_MODE];
		
		log2Main("   0 %% this.Options:   " + JSON.stringify(this.Options));
		log2Main("   1 %% entropy_size:   " + entropy_size);
		
		this.Options[ENTROPY_SIZE][wallet_mode] = entropy_size;
		log2Main("   2 %% ENTROPY_SIZE:   " + this.Options[ENTROPY_SIZE][wallet_mode]);		
        
		log2Main("   3 %% Default Blockchain: " + this.Options[DEFAULT_BLOCKCHAIN]);		
		
		//HtmlUtils.SetField( WALLET_BLOCKCHAIN_ID, default_blockchain );
        log2Main("   4 %% this.Options: " + JSON.stringify(this.Options));	

        // ** recursive **		
		//await window.ipcMain.UpdateOptions( this.Options );
	} // async updateEntropySize()
	
	//**********************************************************************************
	//*****************************   onGUIEvent( data )   *****************************
	//**********************************************************************************
	async onGUIEvent( data ) {
		//log2Main(">> " + _CYAN_ + "RendererGUI.OnGUIEvent()" + _END_);

		let event_name       = data[0];		
		let description_data = "";
				
		switch ( event_name ) {
			case FromMain_DID_FINISH_LOAD:
				log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_DID_FINISH_LOAD + _END_ );
				await this.didFinishLoadInit();	
				break;	

            case FromMain_SET_RENDERER_VALUE:
                log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SET_RENDERER_VALUE + _END_ );	
				let cryptocalc_version = data[1];
				//log2Main("   cryptocalc_version: " + cryptocalc_version);
                RendererSession.SetValue( CRYPTO_CALC_VERSION, cryptocalc_version );				
				break;
	
			case FromMain_FILE_SAVE:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_FILE_SAVE + _END_ );	
				let crypto_info = await this.getCryptoInfo();
                window.ipcMain.SaveWalletInfo( crypto_info );
				this.showSaveWalletInfoDialog();				
				break;
				
			case FromMain_UPDATE_OPTIONS:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_UPDATE_OPTIONS + _END_ );	
				this.Options = data[1];	
                log2Main("   >> this.Options: " + JSON.stringify(this.Options));
                await this.updateOptionsFields( this.Options );				
				break;				
				
			case FromMain_SET_SUPPORTED_BLOCKCHAINS:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SET_SUPPORTED_BLOCKCHAINS + _END_ );	
				this.SupportedBlockchains = data[1];	
                //log2Main("   this.SupportedBlockchains: " + JSON.stringify(this.SupportedBlockchains));
                await this.setSupportedBlockchains( this.SupportedBlockchains );				
				break;
				
			case FromMain_SEND_IMG_URL:
				log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SEND_IMG_URL + _END_ );			
				let img_elt_id   = data[1];
				// log2Main("   img_elt_id:             " + img_elt_id);
				
				let img_file_extension = data[3];
				// log2Main("   img_file_extension:     " + img_file_extension);
				
				let URL_prefix = "data:image/" + img_file_extension + ";base64, ";
				let img_data_URL = URL_prefix+ data[2]
				                   .replaceAll('\r', '').replaceAll('\n', '');
				log2Main("   img_data_URL: " + img_data_URL.substring(0,80));
				let img_elt = HtmlUtils.GetElement( img_elt_id );
				//log2Main("   img_elt: " + img_elt);
				//log2Main("   img_elt.id: " + img_elt.id);
				img_elt.src = img_data_URL;
				
				const hashValue = val =>
				  crypto.subtle
					.digest('SHA-256', new TextEncoder('utf-8').encode(val))
					.then(h => {
					  let hexes = [],
						view = new DataView(h);
					  for (let i = 0; i < view.byteLength; i += 4)
						hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
					  return hexes.join('');
				}); // hashValue()                

                let salt = await this.generateSalt( true );	
                log2Main("   salt:                   " + salt);				
				
				// https://www.30secondsofcode.org/js/s/hash-sha-256/
				let entropy_data = await hashValue( img_data_URL + salt);
				//log2Main("   1 entropy_data: " + entropy_data);				
				//log2Main("   1 entropy_data length: " + entropy_data.length);
				
				let expected_entropy_digits = this.expected_entropy_bytes * 2;
				if (expected_entropy_digits < 64) {
					entropy_data = entropy_data.substring(0,expected_entropy_digits);
				}	
				log2Main("   entropy_data:           " + entropy_data);
				//log2Main("   2 entropy_data length: " + entropy_data.length);
				this.entropy_source_is_user_input = false; // forces Salt/uuid update
				this.updateEntropy( entropy_data );	
				break;
			
            // File/Import/From file...			
			case FromMain_SET_SEED_FIELD_VALUE:
                log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SET_SEED_FIELD_VALUE + _END_ );	
				let raw_data_str = data[1];
				//log2Main("   FromMain_SET_SEED_FIELD_VALUE:\n" + raw_data_str);
                HtmlUtils.SetField( ENTROPY_ID, raw_data_str );	
				await this.updateFields();				
				break;
			
            // File/Import/Random Fortune Cookie			
            case FromMain_SET_FORTUNE_COOKIE:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SET_FORTUNE_COOKIE + _END_ );
				let fortune_cookie = data[1];
				log2Main("   fortune_cookie: " + getShortenedString( fortune_cookie ));
				// HtmlUtils.SetField( ENTROPY_ID, fortune_cookie );	
				HtmlUtils.SetField( ENTROPY_SRC_FORTUNES_ID, fortune_cookie );				
				await this.updateFields();
				break;
				
			case FromMain_SHOW_ERROR_DIALOG:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SHOW_ERROR_DIALOG + _END_ );
				break;
				
			case FromMain_TOOLS_OPTIONS_DIALOG:
				log2Main( ON_GUI_EVENT_LOG_PREFIX + _RED_ + FromMain_TOOLS_OPTIONS_DIALOG + _END_ );
				let options_data = data[1];
				log2Main("   $$ options_data: " + JSON.stringify(options_data)); 
				ToolsOptionsDialog.ShowDialog( options_data );
				break;
				
			case FromMain_HELP_ABOUT:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_HELP_ABOUT + _END_ );
				let crypto_calc_version = RendererSession.GetValue(CRYPTO_CALC_VERSION);
				let i18n_msg = await window.ipcMain.GetLocalizedMsg("HelpAboutMsg");
				description_data =   
						  "<center><b>Cryptocalc " + crypto_calc_version + "</b></center><br>" 
						+ "&nbsp;" + i18n_msg;
			    //log2Main("   " + FromMain_HELP_ABOUT + " " + description_data);

				// https://izitoast.marcelodolza.com/
				DialogManager.Clean();
				GuiUtils.ShowInfoDialog( description_data );
				//iziToast.info({
				////	iconUrl:         './icons/ZCash_rev_icn.png',
				//	position:        'center',
				//	backgroundColor: 'lightblue',
				//	message:         description_data,
				//	maxWidth:        450, layout: 2,
				//	timeout:         false, progressBar: false
				//});
				break;	
				
			default:
				log2Main(   ON_GUI_EVENT_LOG_PREFIX
						  + _YELLOW_ + "ACK[" + event_name + "]" + _END_ + "from main");
				//DialogManager.Clean();
				break;
		} // switch ( event_name )
	} // onGUIEvent()
	
	async didFinishLoadInit() {
		log2Main(">> " + _CYAN_ + "RendererGUI.didFinishLoadInit()" + _END_);
		
		this.registerCallbacks();
		await this.localizeHtmlNodes();
		
		// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
		// Get the element with id="seed_tab_link_id" and click on it
		let seed_tab_link_elt = document.getElementById(SEED_TAB_LINK_ID);
		seed_tab_link_elt.click();
		
		if ( HtmlUtils.HasClass( SEED_TAB_LINK_ID,     "ThreeBordersTabLink" ) ) {
			HtmlUtils.AddClass( SEED_TAB_LINK_ID,      "ThreeBordersTabLink" );
		}
		if ( ! HtmlUtils.HasClass( WALLET_TAB_LINK_ID, "FourBordersTabLink" ) ) {
			HtmlUtils.RemoveClass( WALLET_TAB_LINK_ID, "FourBordersTabLink");
		}
	} // didFinishLoadInit()
	
	async localizeHtmlNodes() {
		 log2Main(">> " + _CYAN_ + "RendererGUI.localizeHtmlNodes()" + _END_);
		 let L10n_key      = "";
		 let L10n_msg      = "";
		 let L10N_KEYPAIRS = await window.ipcMain.GetL10nKeyPairs();
		 let L10N_KEYS     = Object.keys( L10N_KEYPAIRS );
		 for (let i=0; i < L10N_KEYS.length; i++) {
			 //log2Main("---------->>");			 
			 L10n_key = L10N_KEYS[i];
			 L10n_msg = await window.ipcMain.GetLocalizedMsg( L10n_key );
			 //log2Main("   L10n_key: " + L10n_key + "   L10n_msg: " + L10n_msg);
			 HtmlUtils.SetField( L10n_key, L10n_msg );
		 }
	} // localizeHtmlNodes()
	
	registerCallbacks() {
		log2Main(">> " + _CYAN_ + "RendererGUI.RegisterCallbacks()" + _END_);
		
		// -------------------- Toolbar icon buttons -------------------- 
		this.setEventHandler( SAVE_ICON_ID,            'click', async (evt) => { await this.onSaveWalletInfo();     } );
		this.setEventHandler( REGENERATE_ICON_ID,      'click', async (evt) => { await this.generateRandomFields(); } );
		this.setEventHandler( TOGGLE_DEVTOOLS_ICON_ID, 'click', (evt) => { this.onToggleDebug(evt);} );		
		// -------------------- Toolbar icon buttons	
		
		this.setEventHandler( ENTROPY_SRC_FORTUNES_ID, 'focus', (evt) => { this.onFocus(evt); } );
        //this.setEventHandler( entropy_src_fortunes_id,      'keydown', async (evt) => { await this.onKeyDown(evt); }   );	
		
		this.setEventHandler( ENTROPY_ID,            'keypress', (evt) => { this.onEntropyKeypress(evt); } );
		this.setEventHandler( ENTROPY_ID,            'keydown',  (evt) => { this.onEntropyKeydown(evt); } );
        this.setEventHandler( ENTROPY_ID,            'paste',    async (evt) => { await this.onEntropyPaste(evt); } );		
		this.setEventHandler( ENTROPY_ID,            'focus',    (evt) => { this.onFocus(evt); } );
			
		// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop	
		this.setEventHandler( ENTROPY_SOURCE_IMG_ID, 'drop', 
		                      (evt) => {  this.onDropImage(evt); } );
							  
		this.setEventHandler( ENTROPY_SOURCE_IMG_ID, 'dragover', 
		                      (evt) => {  evt.preventDefault(); evt.stopPropagation(); } );
		this.setEventHandler( ENTROPY_SRC_TYPE_SELECTOR_ID, 'change', 
							  async (evt) => { await this.onSwitchEntropySourceType(); } );
		
		this.setEventHandler( ENTROPY_COPY_BTN_ID,   'click',    (evt) => { this.onCopyButton(ENTROPY_COPY_BTN_ID); } );
		
		this.setEventHandler( ENTROPY_SIZE_SELECT_ID,'change',   async (evt) => { await this.onChangeEntropySize(evt); } );
        this.setEventHandler( WORD_COUNT_SELECT_ID,  'change',   async (evt) => { await this.onChangeWordCount(evt); } );
		this.setEventHandler( LANG_SELECT_ID,        'change',   async (evt) => { await this.onChangeBip39Lang(evt); } );		
		
		this.setEventHandler( WALLET_MODE_SELECT_ID, 'change',   async (evt) => { await this.onChangeWalletMode(evt); } );
		this.setEventHandler( WALLET_BLOCKCHAIN_ID,  'change',   async (evt) => { await this.onChangeBlockchain(evt); } );
		this.setEventHandler( MNEMONICS_COPY_BTN_ID, 'click',    (evt) => { this.onCopyButton(MNEMONICS_COPY_BTN_ID); } );
		
		this.setEventHandler( MNEMONICS_ID,          'paste',    async (evt) => { await this.onMnemonicsPaste(evt); } );
		this.setEventHandler( MNEMONICS_4LETTER_ID,  'focus',    (evt) => { this.onFocus(evt); } );
		
		this.setEventHandler( WORD_INDEXES_BASE_ID,  'change',   async (evt) => { await this.updateWordIndexes(); } );			
				
		this.setEventHandler( RANDOM_BTN_ID,         'click',    async (evt) => { await this.generateRandomFields(); } );				
		this.setEventHandler( REFRESH_BTN_ID,        'click',    async (evt) => { await this.onRefreshButton(); } );
		
		this.setEventHandler( ACCOUNT_ID,            'keypress', async (evt) => { await this.onBIP32FieldKeypress(evt); } );
		this.setEventHandler( ADDRESS_INDEX_ID,      'keypress', async (evt) => { await this.onBIP32FieldKeypress(evt); } );
									 
        trigger_event( HtmlUtils.GetElement( RANDOM_BTN_ID ), 'click' );
	} // registerCallbacks()
	
	async updateFields( entropy ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateFields()" + _END_);
		
		//log2Main("   this.entropy_source_type: " + this.entropy_source_type);
		
		let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID ); 
		
		this.showRefreshButton( false );

        if ( this.entropy_source_is_user_input ) {
			await this.propagateFields( entropy );
		}
		else {	
            //log2Main("   " + _YELLOW_ + "Entropy is NOT User input" + _END_);		
			let entropy_src_elt = HtmlUtils.GetElement( ENTROPY_SRC_FORTUNES_ID ); 
			
			//log2Main("   expected_entropy_bytes:  " + this.expected_entropy_bytes);
			//log2Main("   expected_entropy_digits: " + this.expected_entropy_digits);
			//log2Main("   expected_word_count:    " + this.expected_word_count);
			
			let entropy_src_str = await this.getSaltedEntropySource();
			log2Main("   Salted Entropy:         " + getShortenedString( entropy_src_str ));
			
			if ( entropy_src_str.length > 0 ) {
				const options = { "lang": "EN", "word_count": this.expected_word_count };
				const data    = { entropy_src_str, options };
				
				entropy = await window.ipcMain.EntropySourceToEntropy( data );
				
				log2Main("   entropy: " + _YELLOW_ + entropy + _END_);			

				HtmlUtils.SetField( ENTROPY_ID, entropy );
				await this.propagateFields( entropy );
				//await this.propagateFields(entropy_elt.value, wif);
			}                                                          
			else if ( entropy_elt.value.length == expected_entropy_hex_digits ) {
				await this.propagateFields( entropy_value );
			}
		}
		let sb_msg_elt = HtmlUtils.GetElement( SB_MSG_ID );
		sb_msg_elt.textContent = "";		
	} // updateFields()
	
	async propagateFields( entropy ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.propagateFields()" + _END_);
		
		if ( entropy == undefined ) {
			log2Main("   entropy UNDEFINED >> Generate Random Entropy");
			entropy = getRandomHexValue( this.entropy_expected_bytes );
		}	
		
		if ( this.entropy_source_is_user_input ) { 
		    this.setEntropySourceIsUserInput( true );			
		}
		else {
			this.setEntropySourceIsUserInput( false );	
			await this.generateSalt();	
		}	
		await this.updateEntropy( entropy ); 	
	    await this.updateMnemonics( entropy );		
	} // propagateFields()
	
	async getSaltedEntropySource() {
		let entropy_source = HtmlUtils.GetField( ENTROPY_SRC_TYPE_SELECTOR_ID );
		log2Main(  ">> " + _CYAN_ + "RendererGUI.getSaltedEntropySource()" 
		         + "  " + _YELLOW_ + entropy_source + _END_ );		 
		
		let new_uuid = await window.ipcMain.GetUUID();
		let salt_elt = HtmlUtils.GetElement( SALT_ID );
		salt_elt.textContent = new_uuid;		
		
		let entropy_src_value = "";
		if ( entropy_source == FORTUNES_ENTROPY_SRC_TYPE ) {
			entropy_src_value = HtmlUtils.GetField( ENTROPY_SRC_FORTUNES_ID );
		}	
		else if (entropy_source == IMAGE_ENTROPY_SRC_TYPE) {
		    entropy_src_value = this.img_data_asURL;
		}
		
		log2Main("   entropy_src_value:      " + getShortenedString( entropy_src_value ));
		
		let salt               = salt_elt.textContent;				
		let salted_entropy_src = salt + entropy_src_value;
                                                        
		return salted_entropy_src;	
	} // getSaltedEntropySource()
	
	async updateEntropy( entropy_hex ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateEntropy() " + _END_);
		log2Main("   entropy_hex: " + entropy_hex);
		HtmlUtils.SetField( ENTROPY_ID, entropy_hex );
		
		this.setEntropyValueValidity( true ); 
		
		let blockchain = HtmlUtils.GetField( WALLET_BLOCKCHAIN_ID );	

        await this.updateMnemonics( entropy_hex ); 
		await this.updateChecksum( entropy_hex );

		let wallet = await this.generateHDWalletAddress( blockchain, entropy_hex );
    } // updateEntropy()
	
	async updateBlockchain( blockchain ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateBlockchain() " + _END_ + blockchain);
		this.wallet[BLOCKCHAIN] = blockchain;
		
		let entropy_hex = HtmlUtils.GetField( ENTROPY_ID );
		let mnemonics   = HtmlUtils.GetField( MNEMONICS_ID );
		let wallet = await this.generateHDWalletAddress( blockchain, entropy_hex );
		
		this.bip32_account_index = 0;
		this.bip32_address_index = 0;
		
		let coin_abbreviation = COIN_ABBREVIATIONS[blockchain];
		log2Main("   coin: " + coin_abbreviation);
		HtmlUtils.SetField( WALLET_COIN_ID, coin_abbreviation );
		
		let wallet_address = wallet[ADDRESS];		
	    log2Main("   wallet_address: " + wallet_address);

        this.updateWalletURL( blockchain, wallet_address );
	} // updateBlockchain()
	
	async generateHDWalletAddress( blockchain, entropy ) {
		log2Main(  ">> " + _CYAN_ + "RendererGUI.generateHDWalletAddress() " 
		         + _YELLOW_ + blockchain + " " + this.entropy_source_type + _END_);		
		log2Main("   " + _YELLOW_ + "entropy:                " + _END_ + entropy);
		
		let entropy_src_type = HtmlUtils.GetField( ENTROPY_SRC_TYPE_SELECTOR_ID );
		this.entropy_source_type = entropy_src_type;
		
		let entropy_src = "XX";
			
		if ( this.entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE ) {        	
			entropy_src = HtmlUtils.GetField( ENTROPY_SRC_FORTUNES_ID );
		}
		else if ( this.entropy_source_type == IMAGE_ENTROPY_SRC_TYPE ) {        	
			entropy_src = this.img_data_asURL;
		}
		
		log2Main("   entropy_src:            " + getShortenedString( entropy_src ));
		
		let new_wallet     = {};
		let options        = {};
        let hd_private_key = undefined;	
		let data           = undefined;
		
		let mnemonics      = HtmlUtils.GetField( MNEMONICS_ID );
		let words          = mnemonics.split(' ');		
		let separator      = '\n';		

        let mnemonics_as_2parts = asTwoParts( mnemonics, 15 );
        log2Main("   mnemonics:              " + mnemonics_as_2parts[0]);		
        if ( mnemonics_as_2parts.length > 1 ) { 
			log2Main("                           " + mnemonics_as_2parts[1]);			
		}
		
		let wif            	    = "";
		let PRIV_KEY            = "";
		let salt_uuid    	    = HtmlUtils.GetField( SALT_ID );
        let new_derivation_path = "";		
		
		if (   blockchain == ETHEREUM
		    || blockchain == BITCOIN 
			|| blockchain == DOGECOIN || blockchain == LITECOIN
			|| blockchain == RIPPLE   || blockchain == TRON 
			|| blockchain == BITCOIN_CASH
			|| blockchain == FIRO ) {

			options = { "blockchain": blockchain, 
			            [ACCOUNT_INDEX]: this.bip32_account_index,
						[ADDRESS_INDEX]: this.bip32_address_index, 
			            "uuid": HtmlUtils.GetField( SALT_ID ) };						
			data = { mnemonics, options };
			new_wallet = await window.ipcMain.MnemonicsToHDWalletInfo( data );
			
			//if ( blockchain == BITCOIN ) {
			//	PRIV_KEY = ( new_wallet[BIP32_ROOT_KEY] != undefined ) ? new_wallet[BIP32_ROOT_KEY] : "";
			//}
			if ( blockchain == BITCOIN ) {				
				PRIV_KEY = ( new_wallet[WIF] != undefined ) ? new_wallet[WIF] : "";
				wif = "";
			}
			else if (    blockchain == DOGECOIN || blockchain == LITECOIN
                      || blockchain == FIRO	|| blockchain == BITCOIN_CASH ) {				
				PRIV_KEY = ( new_wallet[PRIV_KEY] != undefined ) ? new_wallet[PRIV_KEY] : "";
				wif   = "";
			}  	
			else if (   blockchain == RIPPLE 
			         || blockchain == TRON ) {				
				PRIV_KEY = new_wallet[PRIVATE_KEY_HEX];
				wif   = "";
			}   			
		}
		else if ( blockchain == SOLANA ) {			
			options = { "blockchain": SOLANA, "uuid": salt_uuid };
		    data = { mnemonics, options };
			new_wallet = await window.ipcMain.GetSolanaWallet( data );
		}
		
		this.updateWIF( blockchain, wif );
		this.updatePrivateKey( blockchain, PRIV_KEY );
		
		//---------- Update 'Derivation Path' in "Wallet" Tab ----------
		//log2Main(  "   " + _YELLOW_ 
		//         + "new_wallet keys: " + _END_ + JSON.stringify(Object.keys(new_wallet)));
		new_derivation_path = new_wallet[DERIVATION_PATH];
		//log2Main(  "   " + _YELLOW_ 
		//         + "new_wallet:\n" + _END_ + JSON.stringify(new_wallet));
				 
		let derivation_path_nodes = new_derivation_path.split("/");
        HtmlUtils.SetField( COIN_TYPE_ID,     derivation_path_nodes[2] + "/" );

		let account_id_value = derivation_path_nodes[3].replace("'","");
        HtmlUtils.SetField( ACCOUNT_ID,       account_id_value);
		
		if ( blockchain == SOLANA )  
		    HtmlUtils.SetField( ADDRESS_INDEX_ID, "0" );
		else
			HtmlUtils.SetField( ADDRESS_INDEX_ID, derivation_path_nodes[5] );
		
		//HtmlUtils.SetField( DERIVATION_PATH_ID, new_derivation_path );
		//---------- Update 'Derivation Path' in "Wallet" Tab

		//---------- Update 'Address' in "Wallet" Tab ----------
        let new_wallet_address = new_wallet[ADDRESS];
		log2Main(  "   " + _YELLOW_ 
		         + "new_wallet_address:     " + _END_ + new_wallet_address);		
        this.wallet[ADDRESS] = new_wallet_address;				
		HtmlUtils.SetField( ADDRESS_ID, new_wallet_address );
		//---------- Update 'Address' in "Wallet" Tab
		
		//---------- Update 'Private Key' in "Wallet" Tab ----------
		hd_private_key = new_wallet[PRIVATE_KEY_HEX];
		log2Main(  "   " + _YELLOW_
		         + "hd_private_key:         " + _END_ + hd_private_key);
		HtmlUtils.SetField( WALLET_PK_HEX_ID,  hd_private_key );
		//---------- Update 'Private Key' in "Wallet" Tab
		
		this.updateWalletURL( blockchain, new_wallet_address );
		
		return new_wallet;
	} // generateHDWalletAddress()
	
	updateWalletURL( blockchain, wallet_address ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateWalletURL() " + _YELLOW_ + blockchain + _END_);
		// log2Main("   " + _YELLOW_ + "blockchain:             " + _END_ + blockchain);
		// log2Main("   " + _YELLOW_ + "wallet_address:         " + _END_ + wallet_address);
		
		let explorer_URL = MAINNET_EXPLORER_URLs[blockchain] + wallet_address;
		// log2Main("   " + _YELLOW_ + "explorer_URL:           " + _END_ + explorer_URL);
		
		let wallet_URL_elt =  HtmlUtils.GetElement( WALLET_URL_LINK_ID );
		//log2Main("   wallet_URL_elt: " + wallet_URL_elt);
		if (wallet_URL_elt != undefined) {
			wallet_URL_elt.href = explorer_URL;
		}
	} // updateWalletURL()
	
	updateWIF( blockchain, wif ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateWIF() " + _END_ + "   wif: " + wif );
		if (      (   blockchain == BITCOIN 
		           || blockchain == DOGECOIN || blockchain == LITECOIN
		           || blockchain == SOLANA)
  		      &&  wif != undefined && wif != "") {
			HtmlUtils.SetField( WIF_ID, wif );
			HtmlUtils.ShowElement( WIF_FIELD_LINE_ID );
		}
		else {
			HtmlUtils.SetField( WIF_ID, "" );
			HtmlUtils.HideElement( WIF_FIELD_LINE_ID );
		}
	} // updateWIF()
		
	updatePrivateKey( blockchain, PRIV_KEY ) {
		if (      (   blockchain == BITCOIN 
		           || blockchain == DOGECOIN || blockchain == LITECOIN
		           || blockchain == ETHEREUM 
				   || blockchain == RIPPLE || blockchain == FIRO)
  		      &&  PRIV_KEY != undefined && PRIV_KEY != "") {
				  
			HtmlUtils.SetField( PRIV_KEY_ID, PRIV_KEY );
			HtmlUtils.ShowElement( PRIV_KEY_FIELD_LINE_ID );			
	
			if (   blockchain == BITCOIN 
			    || blockchain == DOGECOIN || blockchain == LITECOIN ) {
				HtmlUtils.SetField( PRIV_KEY_LABEL_ID, "WIF");
			}
			else if ( blockchain == RIPPLE || blockchain == TRON ) {
				HtmlUtils.SetField( PRIV_KEY_LABEL_ID, "Private Key");
				HtmlUtils.HideElement( PRIV_KEY_FIELD_LINE_ID );
			
			}
			else if ( blockchain == FIRO ) {
				HtmlUtils.SetField( PRIV_KEY_LABEL_ID, "Private Key (B58)");
				HtmlUtils.HideElement( WIF_FIELD_LINE_ID );
			}			
		}
		else {
			HtmlUtils.SetField( PRIV_KEY_ID, "" );
			HtmlUtils.HideElement( PRIV_KEY_FIELD_LINE_ID );
		}
	} // updatePrivateKey()
	
	async updateChecksum( entropy ) {
		const options = { "word_count": this.expected_word_count }; 
		const data = { entropy, options }; 
		let checksum = await window.ipcMain.EntropyToChecksum( data );
		//log2Main(  ">> " + _CYAN_ 
		//         + "RendererGUI.updateChecksum() " + _YELLOW_ + checksum +_END_);		
		HtmlUtils.SetField( CHECKSUM_ID, checksum );
	} // updateChecksum()
	
	async updateMnemonics( entropy ) {
		//log2Main(">> " + _CYAN_ + "RendererGUI.updateMnemonics() " + _END_);
		let lang       = HtmlUtils.GetElement( LANG_SELECT_ID ).value; 
		let blockchain = HtmlUtils.GetField( WALLET_BLOCKCHAIN_ID );
        let options = { "lang": lang, "word_count": this.expected_word_count, "blockchain": blockchain }; 		
		let data = { entropy, options };
		let mnemonics = await window.ipcMain.EntropyToMnemonics( data );
		HtmlUtils.SetField( MNEMONICS_ID, mnemonics );		
		
		let seedphrase_as_4letter = await window.ipcMain.MnemonicsAs4letter( mnemonics );
		HtmlUtils.SetField( MNEMONICS_4LETTER_ID, seedphrase_as_4letter );

		await this.updateWordIndexes();		
    } // updateMnemonics()
	
	async updateWordIndexes() {
		//log2Main(">> " + _CYAN_ + "RendererGUI.updateWordIndexes() " + _END_);
		let mnemonics = HtmlUtils.GetField( MNEMONICS_ID ); 
		let lang      = HtmlUtils.GetElement( LANG_SELECT_ID ).value; 
		
		let word_index_base = HtmlUtils.GetField( WORD_INDEXES_BASE_ID);
		let options = { "lang": lang, "word_index_base": word_index_base }; 		
		let data = { mnemonics, options };
		let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
		let word_indexes_str = "";
		word_indexes_str = word_indexes.join(' ');
		//log2Main("   word_indexes_str: " + word_indexes_str);
		HtmlUtils.SetField( WORD_INDEXES_ID, word_indexes_str) ;
    } // updateWordIndexes()
	
	async generateSalt( force_generation ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.generateSalt() " + _END_);
		let entropy_src_elt = HtmlUtils.GetElement( ENTROPY_SRC_FORTUNES_ID );
		let new_uuid = "";
		if ( entropy_src_elt.value != "" || force_generation == true) {
			new_uuid = await window.ipcMain.GetUUID();
			//HtmlUtils.SetField(SALT_ID, new_uuid);
			let salt_elt = HtmlUtils.GetElement( SALT_ID );
			salt_elt.textContent = new_uuid;
        }
		return new_uuid;
    } // generateSalt()
	
	async generateRandomFields() {
		log2Main(">> " + _CYAN_ + "RendererGUI.generateRandomFields() " + _END_);		
		await this.getNewEntropySource();
	} // generateRandomFields()
	
	async getNewEntropySource() {
		log2Main(">> " + _CYAN_ + "RendererGUI.getNewEntropySource() " + _END_);

		this.setEntropySourceIsUserInput( false );
		
		let entropy_source_type = HtmlUtils.GetField( ENTROPY_SRC_TYPE_SELECTOR_ID );
		log2Main("   entropy_source_type:    " + entropy_source_type);
		
		if ( entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE ) {
			let fortune_cookie = await window.ipcMain.GetFortuneCookie();
			HtmlUtils.SetField( ENTROPY_SRC_FORTUNES_ID, fortune_cookie );
			log2Main(">> getNewEntropySource fortune_cookie: " + fortune_cookie);
		}
		else if ( entropy_source_type == IMAGE_ENTROPY_SRC_TYPE ) {
			// Draw image in "www/img/CryptoCurrency" folder
			this.img_data_asURL = await window.ipcMain.DrawRandomCryptoLogo();
		}
		await this.updateFields();
		
		this.setFocus( ENTROPY_ID );
	} // getNewEntropySource()
	
	clearFields( field_ids ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.clearFields() " + _END_);
		for (let i=0; i < field_ids.length; i++) { 
			let field_id = field_ids[i];
			
			let elt = HtmlUtils.GetElement(field_id);
			
			if (field_id == SALT_ID)
				elt.textContent = "";
			else	
		        elt.value = ""; 
			
			elt.classList.remove( WITH_FOCUS_CSS_CLASS ); 
			elt.classList.add( WITHOUT_FOCUS_CSS_CLASS ); 
		}
	} // clearFields()
	
	async onChangeEntropySize( evt ) {		
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == ENTROPY_SIZE_SELECT_ID ) {
			let entropy_size = parseInt( elt.value );
			log2Main(">> " + _GREEN_ + "RendererGUI.onChangeEntropySize() " + _END_ + entropy_size);
			log2Main("   entropy_size: " + entropy_size);
			await this.updateEntropySize( entropy_size );
	    }	
	} // onChangeEntropySize()	
	
	async onChangeWordCount( evt ) {		
		let elt = evt.target || evt.srcElement;
		
		if (elt.id == WORD_COUNT_SELECT_ID) {
			let word_count = parseInt( elt.value );
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeWordCount() " + _END_ + word_count);
			let entropy_size = 
			    ( word_count * 11 ) - EntropySize.GetChecksumBitCount( word_count );
			await this.updateEntropySize( entropy_size );
	    }	
	} // async onChangeWordCount()
	
	async onSwitchEntropySourceType() {
		log2Main(">> " + _CYAN_ + "RendererGUI.onSwitchEntropySource() " + _END_);
		this.entropy_source_type = HtmlUtils.GetField( ENTROPY_SRC_TYPE_SELECTOR_ID );
		log2Main("   entropy_source_type: " +  this.entropy_source_type);
		
		if ( this.entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE) {
			HtmlUtils.ShowElement( ENTROPY_SRC_FORTUNES_ID );
			HtmlUtils.HideElement( ENTROPY_SRC_IMG_CONTAINER_ID );
		}
		else if ( this.entropy_source_type == IMAGE_ENTROPY_SRC_TYPE) {
			HtmlUtils.ShowElement( ENTROPY_SRC_IMG_CONTAINER_ID );
			HtmlUtils.HideElement( ENTROPY_SRC_FORTUNES_ID );
		}
		
        await this.getNewEntropySource();		
    } // async onSwitchEntropySourceType()
	
	async onChangeBip39Lang( evt ) {
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == LANG_SELECT_ID ) {
			let lang_value = elt.value;
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeBip39Lang() " + _END_ + lang_value);
			let entropy = HtmlUtils.GetField( ENTROPY_ID );
            await this.updateMnemonics( entropy );
	    }
		else {
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeBip39Lang() " + _END_);	
		}
	} // async onChangeBip39Lang()

	async onChangeBlockchain( evt ) {
		let elt = evt.target || evt.srcElement;		
		if (elt.id == WALLET_BLOCKCHAIN_ID) {
			let blockchain = elt.value;
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeBlockchain() " + _END_ + blockchain);
			await this.updateBlockchain( blockchain );
	    }
	} // async onChangeBlockchain()
	
	async onSaveWalletInfo( evt ) {
		log2Main( ">> " + _CYAN_ + "RendererGUI.onSaveWalletInfo() " + _END_ );
		let crypto_info = await this.getCryptoInfo();
        window.ipcMain.SaveWalletInfo( crypto_info );
		this.showSaveWalletInfoDialog();		
	} // async onSaveWalletInfo()
	
	showSaveWalletInfoDialog() {
		log2Main( ">> " + _CYAN_ + "RendererGUI.showSaveWalletInfoDialog() " + _END_ );
        DialogManager.Clean();
		let description_data = "<center>Wallet Informations saved</center>";
		GuiUtils.ShowInfoDialog( description_data );		
	} // showSaveWalletInfoDialog()
	
	onToggleDebug( evt ) {
		log2Main( ">> " + _CYAN_ + "RendererGUI.onToggleDebug() " + _END_ );
        window.ipcMain.ToggleDebugPanel();		
	} // onToggleDebug()
	
	async onKeyDown( evt ) {
		log2Main(  ">> " + _CYAN_ + "RendererGUI.onKeyDown() " + _END_ 
		         + "'" + evt.key+ "' keycode: " + evt.keyCode);		
		//log2Main(">> elt: " + elt.id + " length: " + elt.value.length);
		
		let elt = evt.target || evt.srcElement;
		
		if ( elt.id == ENTROPY_ID ) {
			let clipboard_text = await navigator.clipboard.readText();
			log2Main("   clipboard_text: " + clipboard_text);
		
			//log2Main("   elt: " + elt.id);
			//log2Main("   " + ALLOWED_ALPHABETS[elt.id]);
			if ( evt.key == 'Delete' ) return true;
			
			evt.preventDefault();
			
			let allowed_alphabet     = ALLOWED_ALPHABETS[elt.id];
			let entropy_value        = HtmlUtils.GetField( ENTROPY_ID );
			let expected_digit_count = this.expected_entropy_bytes * 2;
			
			log2Main("   >> entropy_value: " + entropy_value );
			log2Main("   >> expected_digit_count: " + expected_digit_count );
			
			//log2Main("   evt.key: '" + evt.key + "'");
			if (    allowed_alphabet != undefined 
				 || allowed_alphabet.indexOf(evt.key) == -1 
				 || entropy_value.length > expected_digit_count ) { 
				log2Main("   >> " + evt.key + " INVALID INPUT");
				
				return false;
			}
		}
		
		return true;
	} // onKeyDown()
	
	// Entropy 'keypress' event handler
	async onEntropyKeypress( evt ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onEntropyKeypress()" + _END_);
		//log2Main("  evt.keyCode:  " + evt.keyCode);
		log2Main("  evt.charCode: " + evt.charCode);
		
		let entropy  = HtmlUtils.GetField( ENTROPY_ID );
		
		//========== Filter non hexadecimal characters ==========
		let is_hex_digit =    ( evt.charCode >= 48 && evt.charCode <= 57 )  // 0..9
		                   || ( evt.charCode >= 97 && evt.charCode <= 102 ) // a..f
						   || ( evt.charCode >= 65 && evt.charCode <= 70 ); // A..F
		log2Main("  is_hex_digit: " + is_hex_digit);
        if (! is_hex_digit || entropy.length + 1 > this.expected_entropy_digits) {
			evt.preventDefault();	
			return false;
        }	
		//========== Filter non hexadecimal characters
		
		const insertCharAtIndex = (in_str, in_char, index) => {
			if (index > 0) {
				return   in_str.substring(0, index) 
				       + in_char 
					   + in_str.substring(index, in_str.length);
			}

			return in_char + in_str;
		}; // insertCharAtIndex()
		
		evt.preventDefault();
		
		let text_cursor_pos = HtmlUtils.GetElement( ENTROPY_ID ).selectionStart;
		
		let new_char = String.fromCharCode(evt.charCode);
		log2Main( "   new_char: " + new_char);
		
		let new_entropy = insertCharAtIndex( entropy, new_char, text_cursor_pos );		
		
		log2Main( "   entropy(" + entropy.length + "):      " + entropy);
		log2Main( "   new_entropy(" + new_entropy.length + "):  " + new_entropy);
		log2Main( "   expected_digits:  " + this.expected_entropy_digits);
        log2Main( "   text_cursor_pos:  " + text_cursor_pos);	
		
		HtmlUtils.SetField( ENTROPY_ID, new_entropy );
		
		text_cursor_pos += 1;
		let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID );
		entropy_elt.selectionStart = text_cursor_pos;
		entropy_elt.selectionEnd   = text_cursor_pos;
		
		this.setEntropySourceIsUserInput( true );
		this.updateStatusbarInfo( true );		

		if ( new_entropy.length == this.expected_entropy_digits ) {
			log2Main( "   new_entropy(" + new_entropy.length + "):  " + new_entropy); 

            HtmlUtils.SetField( ENTROPY_ID, new_entropy );			
			
			await this.updateFields( new_entropy );
		}	
		
        return true;		
	} // onEntropyKeypress()
	
	// Entropy 'keydown' event handler
	onEntropyKeydown( evt ) {				
		log2Main(">> " + _CYAN_ + "RendererGUI.onEntropyKeydown() " + _END_);
		log2Main("  evt.keyCode:  " + evt.keyCode);
		
		const BACKSPACE_KEY_CODE = 8;
		const DEL_KEY_CODE       = 46;
		if (evt.keyCode == BACKSPACE_KEY_CODE || evt.keyCode == DEL_KEY_CODE) {
			this.setEntropySourceIsUserInput( true );
			this.updateStatusbarInfo( true );
			this.setEntropyValueValidity( false );
		}
    } // onEntropyKeydown()    
	
	// Entropy 'paste' event handler
	async onEntropyPaste( evt ) {				
	    let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID );
		log2Main(">> " + _CYAN_ + "RendererGUI.onEntropyPaste() " + _END_);
        
		evt.preventDefault();
		
        let paste_data = (evt.clipboardData || evt.clipboardData).getData("text");
		let paste_length = paste_data.length;
		
		log2Main("   paste_data(" + paste_length + "): " + paste_data);		
		
		let current_entropy = HtmlUtils.GetField(ENTROPY_ID);
		log2Main("   current_entropy(" + current_entropy.length + "): " + current_entropy);	
		
		let new_entropy     = "";
		
        let expected_digits = this.expected_entropy_digits;
		
		if ( isHexString( paste_data ) ) {
			if ( paste_length == expected_digits ) {
				log2Main(  "   *OK 1* to paste_data (full " 
				         + expected_digits + " digits): " + paste_data);
                new_entropy	= paste_data;				
			}
			else 
				if (   current_entropy.length < expected_digits
			        && (current_entropy.length + paste_length) <= expected_digits ) {				
				
				log2Main(  "   *OK 2* to paste_data (" 
				         + paste_length + " digits): " + paste_data);
						 
				let text_cursor_pos = entropy_elt.selectionStart;
				
				const insertSubstringAtIndex = (in_str, in_substr, index) => {
					if ( index > 0 ) {
						return   in_str.substring(0, index) 
							   + in_substr 
							   + in_str.substring(index, in_str.length);
					}

					return in_substr + in_str;
				}; // insertSubstringAtIndex()
				
				new_entropy = insertSubstringAtIndex
				              ( current_entropy, paste_data, text_cursor_pos );
				log2Main("   new_entropy (pasted): " + new_entropy);
				HtmlUtils.SetField( ENTROPY_ID, new_entropy );
			}	

            if ( new_entropy.length == this.expected_entropy_digits ) {			
				this.setEntropySourceIsUserInput( true );
				this.updateStatusbarInfo( true );
				HtmlUtils.SetField( ENTROPY_ID, new_entropy );	
					
				await this.updateFields( new_entropy );	
			}	
		} 
	} // onEntropyPaste()
	
	async onMnemonicsPaste( evt ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onMnemonicsPaste() " + _END_);
		evt.preventDefault();
		
        let paste_data = (evt.clipboardData || evt.clipboardData).getData("text");
		let paste_words = paste_data.split(' ');
		
		log2Main("  paste_data(w: " + paste_words.length + "): " + paste_data);
		//log2Main("  this.expected_word_count: " + this.expected_word_count);		
		
		let current_mnemonics = HtmlUtils.GetField( MNEMONICS_ID );
		let current_words = current_mnemonics.split(' ');
		log2Main("   current_mnemonics(w: " + current_words.length + "): " + current_mnemonics);

        let paste_lang ="";
		
		if ( paste_words.length != this.expected_word_count ) {	
			log2Main(  "   *KO*: paste_words:" + paste_words.length
			         + "  !=  expected_words:" + this.expected_word_count);
			await this.displayMessageInStatusbar( INVALID_WORD_COUNT_MSGID );
			return;
		}		
		
		if ( paste_words.length == this.expected_word_count ) {
			log2Main(  "   OK: paste_words:" + paste_words.length
			         + "  ==  expected_words:" + this.expected_word_count);
			
			// HtmlUtils.SetField( MNEMONICS_ID, paste_data );
			
			// 1. Must check if 'Mnemonics' is in current 'lang' chosen by user
			let current_lang = HtmlUtils.GetField( LANG_SELECT_ID ); 
			log2Main("  current_lang: " + current_lang);
			
			let mnemonics = paste_data;
			let data = { mnemonics };	
			let paste_lang = await window.ipcMain.GuessMnemonicsLang( data );
			log2Main("  paste_lang: " + paste_lang);

			if ( paste_lang	!= current_lang ) { 
				log2Main(  "  *KO* paste_lang:" + paste_lang 
				         + " !=  current_lang:" + current_lang);
				await this.displayMessageInStatusbar( NOT_SAME_LANG_MSGID );
				return;
			}
			
			log2Main(  "   OK: paste_lang:" + paste_lang 
				         + " ==  current_lang:" + current_lang);
			
			// 2. Compute 'Entropy' from 'Mnemonics'
			let lang = current_lang;
			mnemonics = paste_data;
            data = { mnemonics, lang };			
			let entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );
			let new_entropy = entropy_info[ENTROPY_HEX];
			log2Main("  new_entropy: " + new_entropy);
			
			// 3. Update 'Mnemonics' from 'Entropy'
			this.setEntropySourceIsUserInput( true );
			this.updateStatusbarInfo( true );
			HtmlUtils.SetField( ENTROPY_ID, new_entropy );	
					
			await this.updateFields( new_entropy );	
		}
	} // onMnemonicsPaste()
	
	onCopyButton( evt_src_elt_id ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onCopyButton() " + _END_);
		//log2Main("   evt_src_elt_id: " + evt_src_elt_id );
		let copy_text = "";
		switch ( evt_src_elt_id ) {
			case ENTROPY_COPY_BTN_ID: 
				copy_text = HtmlUtils.GetField( ENTROPY_ID );
				break;
				
			case MNEMONICS_COPY_BTN_ID: 
				copy_text = HtmlUtils.GetField( MNEMONICS_ID );
				break;
		}
		
		if ( copy_text != "" ) {
			log2Main("   copy_text: " + copy_text);
			navigator.clipboard.writeText( copy_text );
		}
	} // onCopyButton()
	
	// BIP32Field 'keypress' event handler
	async onBIP32FieldKeypress( evt ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onBIP32FieldKeypress() " + _END_);
		//log2Main("  evt.keyCode:  " + evt.keyCode);
		//log2Main("  evt.target:  " + evt.target.id);
		
		const ENTER_KEYCODE = 13;
		let field_value = "";
		
		//========== If 'ENTER' or 'Return' key pressed ==========
        if ( evt.charCode == ENTER_KEYCODE ) {
			log2Main("   'ENTER' or 'Return' key pressed");
			let is_valid_field_value = false;
			
			let account_index = HtmlUtils.GetField( ACCOUNT_ID );
			if ( account_index == "" ) {
				HtmlUtils.SetField( ACCOUNT_ID, "0" );
			}
			
			let address_index = HtmlUtils.GetField( ADDRESS_INDEX_ID );
			if ( address_index == "" ) {
				HtmlUtils.SetField( ADDRESS_INDEX_ID, "0" );
			}
			
			field_value = HtmlUtils.GetField( evt.target.id ); // evt.target; 			
			if ( field_value == "" ) {
				field_value = "0";
			}
			log2Main("  field_value(" + evt.target.id + "):  " + field_value);
			
			if ( field_value.length >= 1 && field_value.length <= 4 ) { 
				is_valid_field_value = true;
			}

			if ( is_valid_field_value ) {
				await this.updateWalletAddress();
			}
			
			return;
        } 			
		//========== If 'ENTER' or 'Return' key pressed
		
		
		//========== Filter non decimal characters ==========
		let is_decimal_digit = ( evt.charCode >= 48 && evt.charCode <= 57 );  // 0..9
		log2Main("  is_decimal_digit (" + evt.charCode + "): " + is_decimal_digit);
		//log2Main("  field_value: '" + field_value + "'");
		//log2Main("  check 1: " + field_value.length + 1 > 4);
		//log2Main("  check 2: " + (field_value.length + 1) > 4);
        if (   ! is_decimal_digit 
		    || field_value.length + 1 > 4) {
			evt.preventDefault();
			//log2Main("   EXIT here");
			return false;
        }
		//========== Filter non decimal characters
		
		//log2Main("   continue");
		this.showRefreshButton( true );
		//log2Main("   AFTER continue");
	} // onBIP32FieldKeypress()	

	async onRefreshButton() {
		log2Main(">> " + _CYAN_ + "RendererGUI.onRefreshButton() " + _END_);
		await this.updateWalletAddress();
    } // onRefreshButton()
	
	async updateWalletAddress() {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateWalletAddress() " + _END_);				
							
		let entropy = HtmlUtils.GetField( ENTROPY_ID );
		log2Main( "   entropy:  " + entropy);	
		
		this.bip32_account_index = 
				parseInt( HtmlUtils.GetField( ACCOUNT_ID ) );
		log2Main( "   bip32_account_index:  " + this.bip32_account_index);
		
		this.bip32_address_index = 
				parseInt( HtmlUtils.GetField( ADDRESS_INDEX_ID ) );
		log2Main( "   bip32_address_index:  " + this.bip32_address_index);
		
		this.setEntropySourceIsUserInput( true );
		this.updateStatusbarInfo( true );
		
		await this.updateFields( entropy );	
    } // updateWalletAddress()
	
    showRefreshButton( show_refresh ) {
		//log2Main(">> " + _CYAN_ + "RendererGUI.showRefreshButton() " + _END_);
		if ( show_refresh ) { // show "Regenerate" AND "Refresh" buttons 
		    //log2Main("   Show REFRESH");
			HtmlUtils.ShowElement( RIGHT_BTNBAR_ITEM_ID );
		}
		else { // show only "Regenerate" button centered 
		    //log2Main("   HIDE REFRESH");
			HtmlUtils.HideElement( RIGHT_BTNBAR_ITEM_ID );
		}
	} // showRefreshButton()
	
	setEntropySourceIsUserInput( is_user_input ) {
		this.entropy_source_is_user_input = is_user_input;
		this.updateStatusbarInfo( is_user_input );
		if ( is_user_input ) {
			HtmlUtils.HideElement( ENTROPY_SRC_ROW );
			HtmlUtils.HideElement("salt_row");	
			HtmlUtils.HideElement( ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideElement( WORD_COUNT_SELECT_ID );
			
			HtmlUtils.SetField( CHECKSUM_ID,          "" );
            HtmlUtils.SetField( MNEMONICS_ID,         "" );	
            HtmlUtils.SetField( MNEMONICS_4LETTER_ID, "" );
			HtmlUtils.SetField( WORD_INDEXES_ID,      "" );			
		}
		else {
			HtmlUtils.ShowElement( ENTROPY_SRC_ROW );
			HtmlUtils.ShowElement("salt_row");	
			
            if ( this.Options[WALLET_MODE] == HD_WALLET_TYPE ) {			
				HtmlUtils.ShowElement( ENTROPY_SIZE_SELECT_ID );
				HtmlUtils.ShowElement( WORD_COUNT_SELECT_ID );
			}			
		}
	} // setEntropySourceIsUserInput()
	
	async displayMessageInStatusbar( msg_id ) {
		if (msg_id != undefined) {
			let	msg = await window.ipcMain.GetLocalizedMsg(msg_id);
			HtmlUtils.SetField( "SB_item_message_id", msg );
		}	
	} // displayMessageInStatusbar()
	
	updateStatusbarInfo( is_displayed ) {
		let entropy = HtmlUtils.GetField( ENTROPY_ID );
		if ( is_displayed ) {		
			let msg =   "*Warning* Entropy source is User Input"
					  + "  |  Entropy value length: " + entropy.length
				 	  + "  expected digits: " + this.expected_entropy_digits;		
			HtmlUtils.SetField( "SB_item_message_id", msg );
		}
		else {
			HtmlUtils.SetField( "SB_item_message_id", "" );   
		}
	} // updateStatusbarInfo
	
	setEntropyValueValidity( is_valid ) {
		let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID );
		
		if ( is_valid ) {
			entropy_elt.classList.remove( INVALID_VALUE_CSS_CLASS ); 
			entropy_elt.classList.add( VALID_VALUE_CSS_CLASS ); 
		} 
		else {
			entropy_elt.classList.remove( VALID_VALUE_CSS_CLASS ); 
			entropy_elt.classList.add( INVALID_VALUE_CSS_CLASS ); 
		}
	} // setEntropyValueValidity()
	
	setFocus( elt_id ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.setFocus() " + _YELLOW_ + elt_id + _END_);		
		let target_elt = HtmlUtils.GetElement( elt_id );
		for (let i=0; i < FIELD_IDS.length; i++) { 
			let field_id = FIELD_IDS[i];
			let elt = HtmlUtils.GetElement(field_id);
			
		    if ( target_elt.id == field_id ) {
				elt.classList.remove( WITHOUT_FOCUS_CSS_CLASS ); 
				elt.classList.add( WITH_FOCUS_CSS_CLASS ); 			    
			}
			else {  
				elt.classList.remove( WITH_FOCUS_CSS_CLASS ); 
			    elt.classList.add( WITHOUT_FOCUS_CSS_CLASS ); 
			}
		} 
	} // setFocus()
	
	onFocus( evt ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onFocus()" + _END_);
		let source_elt = evt.target || evt.srcElement;
		
		if (! EDITABLE_FIELD_IDS.includes( source_elt.id )) {
			return;
	    } 
		
		this.setFocus( source_elt.id );
	} // onFocus()
	
	async getCryptoInfo() {
		log2Main(">> " + _CYAN_ + "RendererGUI.getCryptoInfo() " + _END_);
		
		let crypto_info = {};
		
		let blockchain = HtmlUtils.GetField( WALLET_BLOCKCHAIN_ID ); 
		crypto_info[BLOCKCHAIN] = blockchain;
		
		let coin = HtmlUtils.GetField( WALLET_COIN_ID ).replaceAll('\n','').replaceAll('\t',''); 
		crypto_info['coin'] = coin;
		
		let wallet_address = HtmlUtils.GetField( ADDRESS_ID );
        // log2Main("wallet_address " + wallet_address );		
		crypto_info['address'] = wallet_address;
		
		let wallet_URL_elt =  HtmlUtils.GetElement( WALLET_URL_LINK_ID );
		if (wallet_URL_elt != undefined) {
			crypto_info['Blockchain Explorer'] = wallet_URL_elt.href;
		}
		
		// log2Main("blockchain " + blockchain );
		
		if (   blockchain == BITCOIN 
		    || blockchain == DOGECOIN || blockchain == LITECOIN
		    || blockchain == ETHEREUM || blockchain == SOLANA
			|| blockchain == RIPPLE       || blockchain == TRON  
			|| blockchain == BITCOIN_CASH || blockchain == FIRO) {
				
			let PRIV_KEY_value = HtmlUtils.GetField( PRIV_KEY_ID );
			// log2Main("PRIV_KEY_value " + PRIV_KEY_value );
			
			let WIF_value = HtmlUtils.GetField( WIF_ID ); 
			// log2Main("WIF_value " + WIF_value );
			if ( WIF_value != "" ) {
				crypto_info[WIF] = WIF_value;
			}

			let PRIV_KEY = HtmlUtils.GetField( PRIV_KEY_ID );
			if ( PRIV_KEY != "" ) {
				crypto_info[PRIV_KEY] = PRIV_KEY;
			}
	
			if (blockchain == BITCOIN ) {
				crypto_info["Private Key"] = HtmlUtils.GetField( WALLET_PK_HEX_ID );
                delete crypto_info[PRIV_KEY];				
				crypto_info["WIF"]         = HtmlUtils.GetField( PRIV_KEY_ID ); 
			}
			else if (    blockchain == ETHEREUM 
			          || blockchain == DOGECOIN || blockchain == LITECOIN
					  || blockchain == SOLANA ) {
				delete crypto_info[PRIV_KEY];
				crypto_info["Private Key"] = HtmlUtils.GetField( WALLET_PK_HEX_ID ); 
			}	
            else if (blockchain == RIPPLE ) {
				PRIV_KEY_value = crypto_info[PRIV_KEY];
				delete crypto_info[PRIV_KEY];
				crypto_info["Private Key"] = PRIV_KEY_value; 
			}
			else if (    blockchain == TRON 
			          || blockchain == BITCOIN_CASH || blockchain == FIRO) {
				//log2Main("blockchain is TRON " + HtmlUtils.GetField( WALLET_PK_HEX_ID ) );
				crypto_info["Private Key"] = HtmlUtils.GetField( WALLET_PK_HEX_ID ); 
			}            		
		}
		
		let mnemonics_elt = HtmlUtils.GetElement( MNEMONICS_ID ); 
		let mnemonics = mnemonics_elt.value;
		//crypto_info[MNEMONICS] = mnemonics;	
		crypto_info['Seedphrase'] = mnemonics;	
		
		let shortened_mnemonics_elt = HtmlUtils.GetElement( MNEMONICS_4LETTER_ID ); 
		let shortened_mnemonics = shortened_mnemonics_elt.value;
		crypto_info['Shortened Seedphrase'] = shortened_mnemonics;
		
		let lang = this.getLang();
		let options = { "lang": lang };
		let data = { mnemonics, options };
		let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
		let word_indexes_str = JSON.stringify( word_indexes )
		                       .replaceAll( '"', '' ).replaceAll( ',', ', ' )
							   .replaceAll( '[', '' ).replaceAll( ']', '' )
		crypto_info['Word indexes'] = word_indexes_str;
		
		//log2Main(">> " + _CYAN_ + "RendererGUI.getCryptoInfo() " + _END_);
		
		crypto_info[DERIVATION_PATH] =  "m/44'/" + COIN_TYPES[blockchain] + "'/"
		                              + HtmlUtils.GetField( ACCOUNT_ID ) + "'/0/"
									  + HtmlUtils.GetField( ADDRESS_INDEX_ID );
		
		let entropy_value = HtmlUtils.GetField( ENTROPY_ID ); 
		crypto_info['Entropy'] = entropy_value;
		
		let entropy_size = (entropy_value.length / 2) * 8;
		crypto_info[ENTROPY_SIZE] = entropy_size + " bits";
		
		crypto_info['lang'] = lang;
		
		return crypto_info;
	} // getCryptoInfo()
	
	// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
	openTabPage( pageName, elt, color ) {
		// log2Main(">> " + _CYAN_ + "RendererGUI.openTabPage " + _END_ + elt.id );
		
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
		document.getElementById( pageName ).style.display = "block";

		// Add the specific color to the button used to open the tab content
		elt.style.backgroundColor = color;
		
		if ( HtmlUtils.HasClass( elt.id,   "FourBordersTabLink" ) ) {
			HtmlUtils.RemoveClass( elt.id, "FourBordersTabLink" );
		}
		if ( ! HtmlUtils.HasClass( elt.id, "ThreeBordersTabLink" ) ) {
			HtmlUtils.AddClass( elt.id,    "ThreeBordersTabLink" );
		}
			
		let other_tab_link_id = (elt.id == SEED_TAB_LINK_ID) ? 
								 WALLET_TAB_LINK_ID : SEED_TAB_LINK_ID;
		//log2Main("   current_tab_link_id: " + elt.id);
		//log2Main("   other_tab_link_id:   " + other_tab_link_id);
		
		if ( HtmlUtils.HasClass( other_tab_link_id,   "ThreeBordersTabLink" ) ) {
			HtmlUtils.RemoveClass( other_tab_link_id, "ThreeBordersTabLink" );
		}
		if ( ! HtmlUtils.HasClass( other_tab_link_id, "FourBordersTabLink" ) ) {
			HtmlUtils.AddClass( other_tab_link_id,    "FourBordersTabLink" );
		}		
	} // openTabPage()
	
	getLang() {
		log2Main(">> " + _CYAN_ + "RendererGUI.getLang()" + _END_);
		let lang = "EN";
		let elt  = HtmlUtils.GetElement( LANG_SELECT_ID );
		if ( elt != undefined ) {
			lang = elt.value;			
	    }
		log2Main("   lang: " + lang);
		return lang;
	} // getLang()
	
	async importRawData() {
		log2Main(">> " + _CYAN_ + "RendererGUI.importRawData()" + _END_);
		window.ipcMain.ImportRawData();
	} // RendererGUI.importRawData()
	
	// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
	// https://www.geeksforgeeks.org/how-to-drag-and-drop-images-using-html5/	
	async onDropImage( evt ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onDropImage()" + _END_);		
		evt.preventDefault();
		evt.stopPropagation();

		let file_path = [];
		for (const f of evt.dataTransfer.files) {
			// Using the path attribute to get absolute file path
			//console.log('File Path of dragged files: ', f.path)
			file_path.push(f.path); // assemble array for main.js
		}
		let img_file_path = file_path[0];
		log2Main("   " + img_file_path);
		let img_data_asURL = await window.ipcMain.LoadImageFromFile( img_file_path );
		this.img_data_asURL = img_data_asURL; 
	} // RendererGUI.onDropImage()
	
	setEventHandler( elt_id, event_name, handler_function ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // setEventHandler()
} // RendererGUI class

RendererGUI.GetInstance(); 