// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
"use strict";

// https://www.electronjs.org/docs/latest/tutorial/quick-start

const ALLOWED_ALPHABETS       = { [ENTROPY_ID]: HEX_ALPHABET };
const FIELD_IDS               = [ ENTROPY_SRC_FORTUNES_ID, SALT_ID, ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const WATERFALL_IDS           = [ ENTROPY_SRC_FORTUNES_ID, SALT_ID, ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const WATERFALL_FROM_SEED_IDS = [ ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const EDITABLE_FIELD_IDS      = [ ENTROPY_SRC_FORTUNES_ID, ENTROPY_ID, MNEMONICS_ID ];

const ON_GUI_EVENT_LOG_PREFIX = ">> " + _CYAN_ + "RendererGUI.onGUIEvent: ";

const trigger_event = ( elt, event_type ) => elt.dispatchEvent( new CustomEvent( event_type, {} ) );

const getChecksumBitCount = ( word_count ) => {
	if ( word_count == undefined ) {
		 word_count = 12;
	}
	let checksum_bit_count = 4; // default case is 12 words / 4 bits
	switch ( word_count ) {
		case 12:	checksum_bit_count = 4;
					break;
					
		case 15:	checksum_bit_count = 5;
					break;
					
		case 18:	checksum_bit_count = 6;
					break;
					
		case 21:	checksum_bit_count = 7;
					break;
					
		case 24:	checksum_bit_count = 8;
					break;
					
		default:	checksum_bit_count = 4;
					break;
	}		
	return checksum_bit_count;
}; // getChecksumBitCount()	

// ============================================================================================
// ===================================  RendererGUI class  ===================================
// ============================================================================================
// static
// * GetInstance( entropy_hex, options )
// ------------------------------------------------------
// *       initWallet()
// * async onGUIEvent( data )
// * async didFinishLoadInit()
// * async localizeHtmlNodes()
// *       registerCallbacks()
// * async updateFields()
// * async getSaltedEntropySource()
// * async propagateFields( entropy, wif )
// * async updateEntropy( entropy )
// *       updateBlockchain( blockchain )
// * async generateWalletAddress( blockchain, entropy )
// *       updateWalletURL( blockchain, wallet_address )
// *       updateWIF( blockchain, wif )
// *       updateXPRIV( blockchain, xpriv )
// * async updateChecksum( entropy )
// * async updateMnemonics( entropy )
// * async updateWordIndexes()
// * async generateSalt()
// * async generateRandomFields()
// * async getCryptoInfo()
// * 	   clearFields( field_ids )
// * async onChangeEntropySize( evt )
// * async onChangeWordCount( evt )
// * async updateEntropySize( entropy_bit_count )
// * async onChangeBip39Lang( evt )
// * async onChangeBlockchain( evt )
// *       openTabPage( pageName, elt, color )
// * async onKeyDown( evt )
// * async onInput( evt )
// *       setFocus( elt_id )
// *       onFocus( evt )
// *       getLang() 
// * async importRawData()
// *       getElement( elt_id )
// *       getField( elt_id )
// *       setField( elt_id, value_str )
// *       setEventHandler( elt_id, event_name, handler_function )
//
class RendererGUI {	
	static #key = {};
	static #_Singleton = new RendererGUI(this.#key);
	
	static GetInstance() {
		if( RendererGUI.#_Singleton == undefined ){
			RendererGUI.#_Singleton = new RendererGUI();
        }
        return RendererGUI.#_Singleton;
    } // RendererGUI.GetInstance() 

	constructor( key ) {
		if (key !== RendererGUI.#key) {
			throw new TypeError("RendererGUI is not constructable.");
		}
		
		this.initWallet();
		
		this.expected_entropy_bytes  = 16;
		this.expected_entropy_digits = 32;
		this.expected_word_count     = 12;
		
		this.bip32_account_index = 0;
		this.bip32_address_index = 0;
		
		this.entropy_source_is_user_input = false;
		
		log2Main(">> " + _CYAN_ + "RendererGUI.constructor()" + _END_);

		window.ipcMain.receive("fromMain", 
			async (data) => { await this.onGUIEvent(data); }
		); // window.ipcMain.receive() call
	} // constructor();
	
	initWallet() {
		this.wallet = {};
		this.wallet[BLOCKCHAIN] = ETHEREUM;
	} // initWallet();
	
	async onGUIEvent( data ) {
		//log2Main(">> " + _CYAN_ + "RendererGUI.OnGUIEvent()" + _END_);

		let event_name = data[0];
				
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
				break;
				
			case FromMain_SEND_IMG_URL:
				log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SEND_IMG_URL + _END_ );			
				let img_elt_id   = data[1];
				log2Main("   img_elt_id: " + img_elt_id);
				
				let img_file_extension = data[3];
				log2Main("   img_file_extension: " + img_file_extension);
				
				let img_data_URL = 
					"data:image/" + img_file_extension + ";base64, " + data[2]
				                   .replaceAll('\r', '').replaceAll('\n', '');
				log2Main("   img_data_URL:\n" + img_data_URL.substring(0,80));
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
                log2Main("   salt: " + salt);				
				
				// https://www.30secondsofcode.org/js/s/hash-sha-256/
				let entropy_data = await hashValue( img_data_URL + salt);
				//log2Main("   1 entropy_data: " + entropy_data);				
				//log2Main("   1 entropy_data length: " + entropy_data.length);
				
				let expected_entropy_digits = this.expected_entropy_bytes * 2;
				if (expected_entropy_digits < 64) {
					entropy_data = entropy_data.substring(0,expected_entropy_digits);
				}	
				log2Main("   entropy_data: " + entropy_data);
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
				this.updateFields();				
				break;
			
            // File/Import/Random Fortune Cookie			
            case FromMain_SET_FORTUNE_COOKIE:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SET_FORTUNE_COOKIE + _END_ );
				let fortune_cookie = data[1];
				HtmlUtils.SetField( ENTROPY_ID, fortune_cookie );	
				this.updateFields();
				break;
				
			case FromMain_SHOW_ERROR_DIALOG:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SHOW_ERROR_DIALOG + _END_ );
				break;
				
			case FromMain_HELP_ABOUT:
			    log2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_HELP_ABOUT + _END_ );
				let crypto_calc_version = RendererSession.GetValue(CRYPTO_CALC_VERSION);
				let i18n_msg = await window.ipcMain.GetLocalizedMsg("HelpAboutMsg");
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
		this.setEventHandler( ENTROPY_SOURCE_SELECTOR_ID, 'click', 
							  async (evt) => { await this.onSwitchEntropySource(); } );
		
		this.setEventHandler( ENTROPY_COPY_BTN_ID,   'click',    (evt) => { this.onCopyButton(ENTROPY_COPY_BTN_ID); } );
		
		this.setEventHandler( ENTROPY_SIZE_SELECT_ID,'change',   async (evt) => { await this.onChangeEntropySize(evt); } );
        this.setEventHandler( WORD_COUNT_SELECT_ID,  'change',   async (evt) => { await this.onChangeWordCount(evt); } );
		this.setEventHandler( LANG_SELECT_ID,        'change',   async (evt) => { await this.onChangeBip39Lang(evt); } );		
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
		
		let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID ); 
		
		this.showRefreshButton( false );

        if ( this.entropy_source_is_user_input ) {
			await this.propagateFields( entropy );
		}
		else {		
			let entropy_src_elt = HtmlUtils.GetElement( ENTROPY_SRC_FORTUNES_ID ); 
			
			//log2Main("   expected_entropy_bytes:  " + this.expected_entropy_bytes);
			//log2Main("   expected_entropy_digits: " + this.expected_entropy_digits);
			log2Main("   expected_word_count:     " + this.expected_word_count);
			
			let entropy_src_str = await this.getSaltedEntropySource();
			log2Main("   entropy_src_str: " + getShortEntropySourceStr(entropy_src_str));
			
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
		    this.updateEntropySourceIsUserInput( true );			
		}
		else {
			this.updateEntropySourceIsUserInput( false );	
			await this.generateSalt();	
		}	
		await this.updateEntropy( entropy ); 	
	    await this.updateMnemonics( entropy );		
	} // propagateFields()
	
	async getSaltedEntropySource() {
		log2Main(">> " + _CYAN_ + "RendererGUI.getSaltedEntropySource()" + _END_);
		
		let entropy_src_elt = HtmlUtils.GetElement( ENTROPY_SRC_FORTUNES_ID ); 
		
		let new_uuid = await window.ipcMain.GetUUID();
		let salt_elt = HtmlUtils.GetElement( SALT_ID );
		salt_elt.textContent = new_uuid;
		
		let salted_entropy_src = entropy_src_elt.value;
		
		// NB; Dont use "salt checkbox"
		//let use_salt_elt = HtmlUtils.GetElement( USE_SALT_ID) ;
		//let use_salt = use_salt_elt.checked;
		let use_salt = true;
		//log2Main("   use_salt: " + use_salt);
		
		if ( use_salt ) {
			let salt           =  salt_elt.textContent;				
			salted_entropy_src += salt;
			//log2Main("   seed is SALTED " + salt);
		}
		else {
			//log2Main("   seed is NOT SALTED");
		}
                                                        
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

		let wallet = await this.generateWalletAddress( blockchain, entropy_hex );
    } // updateEntropy()
	
	async updateBlockchain( blockchain ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateBlockchain() " + _END_ + blockchain);
		this.wallet[BLOCKCHAIN] = blockchain;
		
		let entropy_hex = HtmlUtils.GetField( ENTROPY_ID );
		let mnemonics   = HtmlUtils.GetField( MNEMONICS_ID );
		let wallet = await this.generateWalletAddress( blockchain, entropy_hex );
		
		this.bip32_account_index = 0;
		this.bip32_address_index = 0;
		
		let coin_abbreviation = COIN_ABBREVIATIONS[blockchain];
		log2Main("   coin: " + coin_abbreviation);
		HtmlUtils.SetField( WALLET_COIN_ID, coin_abbreviation );
		
		let wallet_address = wallet[ADDRESS];		
	    log2Main("   wallet_address: " + wallet_address);

        this.updateWalletURL( blockchain, wallet_address );
	} // updateBlockchain()
	
	async generateWalletAddress( blockchain, entropy ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.generateWalletAddress() " + _END_ + blockchain);		
		
		log2Main("   " + _YELLOW_ + "entropy:               " + _END_ + entropy);
		
		let entropy_src = HtmlUtils.GetField( ENTROPY_SRC_FORTUNES_ID );	
		log2Main("   entropy_src:  " + getShortEntropySourceStr(entropy_src));
		
		let new_wallet     	= {};
		let options        	= {};
        let hd_private_key 	= undefined;	
		let data           	= undefined;
		
		let mnemonics      	= HtmlUtils.GetField( MNEMONICS_ID );
		log2Main("   mnemonics:\n" + mnemonics);
		
		let wif            	    = "";
		let xpriv               = "";
		let salt_uuid    	    = HtmlUtils.GetField( SALT_ID );
        let new_derivation_path = "";		
		
		if (   blockchain == ETHEREUM
		    || blockchain == BITCOIN 
			|| blockchain == DOGECOIN || blockchain == LITECOIN
			|| blockchain == RIPPLE   || blockchain == TRON || blockchain == BITCOIN_CASH
			|| blockchain == FIRO ) {

			options = { "blockchain": blockchain, 
			            [ACCOUNT_INDEX]: this.bip32_account_index,
						[ADDRESS_INDEX]: this.bip32_address_index, 
			            "uuid": HtmlUtils.GetField( SALT_ID ) };						
			data = { mnemonics, options };
			new_wallet = await window.ipcMain.MnemonicsToHDWalletInfo( data );
			
			//if ( blockchain == BITCOIN ) {
			//	xpriv = ( new_wallet[BIP32_ROOT_KEY] != undefined ) ? new_wallet[BIP32_ROOT_KEY] : "";
			//}
			if ( blockchain == BITCOIN ) {				
				xpriv = ( new_wallet[WIF] != undefined ) ? new_wallet[WIF] : "";
				wif   = "";
			}
			else if (    blockchain == DOGECOIN || blockchain == LITECOIN
                      || blockchain == FIRO	|| blockchain == BITCOIN_CASH ) {				
				xpriv = ( new_wallet[XPRIV] != undefined ) ? new_wallet[XPRIV] : "";
				wif   = "";
			}  	
			else if (   blockchain == RIPPLE 
			         || blockchain == TRON ) {				
				xpriv = new_wallet[PRIVATE_KEY_HEX];
				wif   = "";
			}   			
		}
		else if ( blockchain == SOLANA ) {			
			options = { "blockchain": SOLANA, "uuid": salt_uuid };
		    data = { mnemonics, options };
			new_wallet = await window.ipcMain.GetSolanaWallet( data );
		}
		
		this.updateWIF( blockchain, wif );
		this.updateXPRIV( blockchain, xpriv );
		
		//---------- Update 'Derivation Path' in "Wallet" Tab ----------
		new_derivation_path = new_wallet[DERIVATION_PATH];
		log2Main(  "   " + _YELLOW_ 
		         + "new_derivation_path:    " + _END_ + new_derivation_path);
				 
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
	} // generateWalletAddress()
	
	updateWalletURL( blockchain, wallet_address ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateWalletURL() " + _END_);
		log2Main("   " + _YELLOW_ + "blockchain:             " + _END_ + blockchain);
		log2Main("   " + _YELLOW_ + "wallet_address:         " + _END_ + wallet_address);
		
		let explorer_URL = MAINNET_EXPLORER_URLs[blockchain] + wallet_address;
		log2Main("   " + _YELLOW_ + "explorer_URL:           " + _END_ + explorer_URL);
		
		let wallet_URL_elt =  HtmlUtils.GetElement( WALLET_URL_LINK_ID );
		//log2Main("   wallet_URL_elt: " + wallet_URL_elt);
		if (wallet_URL_elt != undefined) {
			wallet_URL_elt.href = explorer_URL;
		}
	} // updateWalletURL()
	
	updateWIF( blockchain, wif ) {
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
		
	updateXPRIV( blockchain, xpriv ) {
		if (      (   blockchain == BITCOIN 
		           || blockchain == DOGECOIN || blockchain == LITECOIN
		           || blockchain == ETHEREUM 
				   || blockchain == RIPPLE || blockchain == FIRO)
  		      &&  xpriv != undefined && xpriv != "") {
			HtmlUtils.SetField( XPRIV_ID, xpriv );
			HtmlUtils.ShowElement( XPRIV_FIELD_LINE_ID );			
	
			if (   blockchain == BITCOIN 
			    || blockchain == DOGECOIN || blockchain == LITECOIN ) {
				HtmlUtils.SetField( XPRIV_LABEL_ID, "WIF");
			}
			else if ( blockchain == RIPPLE || blockchain == TRON ) {
				HtmlUtils.SetField( XPRIV_LABEL_ID, "Private Key");
				HtmlUtils.HideElement( XPRIV_FIELD_LINE_ID );
			
			}
			else if ( blockchain == FIRO ) {
				HtmlUtils.SetField( XPRIV_LABEL_ID, "Private Key (B58)");
				HtmlUtils.HideElement( WIF_FIELD_LINE_ID );
			}			
		}
		else {
			HtmlUtils.SetField( XPRIV_ID, "" );
			HtmlUtils.HideElement( XPRIV_FIELD_LINE_ID );
		}
	} // updateXPRIV()
	
	async updateChecksum( entropy ) {
		const options = { "word_count": this.expected_word_count }; 
		const data = { entropy, options }; 
		let checksum = await window.ipcMain.EntropyToChecksum( data );
		log2Main(  ">> " + _CYAN_ 
		         + "RendererGUI.updateChecksum() " + _YELLOW_ + checksum +_END_);		
		HtmlUtils.SetField( CHECKSUM_ID, checksum );
	} // updateChecksum()
	
	async updateMnemonics( entropy ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.updateMnemonics() " + _END_);
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
		log2Main(">> " + _CYAN_ + "RendererGUI.updateWordIndexes() " + _END_);
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
	
	async generateSalt(force_generation) {
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

		this.updateEntropySourceIsUserInput( false );
		
		let entropy_source = HtmlUtils.GetField( ENTROPY_SOURCE_SELECTOR_ID );
		log2Main("   entropy_source: " + entropy_source);
		
		if ( entropy_source == "Fortunes") {
			let fortune_cookie = await window.ipcMain.GetFortuneCookie();
			HtmlUtils.SetField( ENTROPY_SRC_FORTUNES_ID, fortune_cookie );
		}
		else if ( entropy_source == "Image") {
			// Draw image in "www/img/CryptoCurrency" folder
			await window.ipcMain.DropRandomCryptoLogo();
		}
		await this.updateFields();
		
		this.setFocus( ENTROPY_ID );
	} // generateRandomFields()
	
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
		if (elt.id == ENTROPY_SIZE_SELECT_ID) {
			let entropy_bit_count = parseInt( elt.value );
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeEntropySize() " + _END_ + entropy_bit_count);
			await this.updateEntropySize( entropy_bit_count );
	    }	
	} // onChangeEntropySize()	
	
	async onChangeWordCount( evt ) {		
		let elt = evt.target || evt.srcElement;
		
		if (elt.id == WORD_COUNT_SELECT_ID) {
			let word_count = parseInt( elt.value );
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeWordCount() " + _END_ + word_count);
			let entropy_bit_count = ( word_count * 11 ) - getChecksumBitCount( word_count );
			await this.updateEntropySize( entropy_bit_count );
	    }	
	} // onChangeWordCount()
	
	async updateEntropySize( entropy_bit_count ) {		
		log2Main(">> " + _CYAN_ + "RendererGUI.updateEntropySize() " + _END_ + entropy_bit_count);
		this.expected_entropy_bytes  = 16;
		this.expected_entropy_digits = 32;
		this.expected_word_count     = 12;
		switch ( entropy_bit_count ) { 
			case 128: 	this.expected_entropy_bytes = 16;
						this.expected_word_count    = 12;
						break;
						
			case 160: 	this.expected_entropy_bytes = 20;
						this.expected_word_count    = 15;
						break;
						
			case 192: 	this.expected_entropy_bytes = 24;
						this.expected_word_count    = 18;
						break;
						
			case 224: 	this.expected_entropy_bytes = 28;
						this.expected_word_count    = 21;
						break;
						
			case 256: 	this.expected_entropy_bytes = 32;
						this.expected_word_count    = 24;
						break;
		} // entropy_bit_count
		
		this.expected_entropy_digits = this.expected_entropy_bytes * 2;
		
		let entropy_elt = HtmlUtils.GetElement( ENTROPY_ID );
		entropy_elt.setAttribute("minlength", this.expected_entropy_digits);
		entropy_elt.setAttribute("maxlength", this.expected_entropy_digits);
			
		HtmlUtils.SetField( ENTROPY_SIZE_SELECT_ID, entropy_bit_count );
		HtmlUtils.SetField( WORD_COUNT_SELECT_ID,   this.expected_word_count );
		
		await this.updateFields();
	} // updateEntropySize()
	
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
	} // onChangeBip39Lang()

	async onChangeBlockchain( evt ) {
		let elt = evt.target || evt.srcElement;		
		if (elt.id == WALLET_BLOCKCHAIN_ID) {
			let blockchain = elt.value;
			log2Main(">> " + _CYAN_ + "RendererGUI.onChangeBlockchain() " + _END_ + blockchain);
			await this.updateBlockchain( blockchain );
	    }
	} // onChangeBlockchain()
	
	async onSaveWalletInfo( evt ) {
		log2Main( ">> " + _CYAN_ + "RendererGUI.onSaveWalletInfo() " + _END_ );
		let crypto_info = await this.getCryptoInfo();
        window.ipcMain.SaveWalletInfo( crypto_info );		
	} // onSaveWalletInfo()
	
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
		/*
		if ( elt.id == ENTROPY_ID ) {
			HtmlUtils.SetField( ENTROPY_ID, "" );
		}
		else if ( elt.id == ENTROPY_ID && elt.value.length > 0 ) {
			this.clearFields(WATERFALL_FROM_SEED_IDS);
			
			let new_uuid = await window.ipcMain.GetUUID();
			let salt_elt = HtmlUtils.GetElement(SALT_ID);
		    salt_elt.textContent = new_uuid;
			
			let sb_msg_elt = HtmlUtils.GetElement(SB_MSG_ID);
			sb_msg_elt.textContent = UPDATE_MSG;
		}*/
		
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
		
		this.updateEntropySourceIsUserInput( true );
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
			this.updateEntropySourceIsUserInput( true );
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
				this.updateEntropySourceIsUserInput( true );
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
		log2Main("  this.expected_word_count: " + this.expected_word_count);		
		
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
			this.updateEntropySourceIsUserInput( true );
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
	
	async onSwitchEntropySource() {
		log2Main(">> " + _CYAN_ + "RendererGUI.onSwitchEntropySource() " + _END_);
		let entropy_source = HtmlUtils.GetField( ENTROPY_SOURCE_SELECTOR_ID );
		log2Main("   entropy_source: " +  entropy_source);
		this.setEntropySource( entropy_source );
    } // onSwitchEntropySource()
	
	async setEntropySource( entropy_source ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.setEntropySource() " + _END_);
		log2Main("   entropy_source: " +  entropy_source);
		if ( entropy_source == "Fortunes") {
			HtmlUtils.ShowElement( ENTROPY_SRC_FORTUNES_ID );
			HtmlUtils.HideElement( ENTROPY_SRC_IMG_CONTAINER_ID );
		}
		else if ( entropy_source == "Image") {
			HtmlUtils.ShowElement( ENTROPY_SRC_IMG_CONTAINER_ID );
			HtmlUtils.HideElement( ENTROPY_SRC_FORTUNES_ID );
		}
		
        await this.generateRandomFields();		
    } // setEntropySource()
	
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
		
		this.updateEntropySourceIsUserInput( true );
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
	
	updateEntropySourceIsUserInput( is_user_input ) {
		this.entropy_source_is_user_input = is_user_input;
		this.updateStatusbarInfo( is_user_input );
		if ( is_user_input ) {
			HtmlUtils.HideElement("entropy_src_row");
			HtmlUtils.HideElement("salt_row");	
			HtmlUtils.HideElement("entropy_bits_select_id");
			HtmlUtils.HideElement("word_count_select_id");
			
			HtmlUtils.SetField(CHECKSUM_ID,          "");
            HtmlUtils.SetField(MNEMONICS_ID,         "");	
            HtmlUtils.SetField(MNEMONICS_4LETTER_ID, "");
			HtmlUtils.SetField(WORD_INDEXES_ID,      "");			
		}
		else {
			HtmlUtils.ShowElement("entropy_src_row");
			HtmlUtils.ShowElement("salt_row");		
            HtmlUtils.ShowElement("entropy_bits_select_id");
			HtmlUtils.ShowElement("word_count_select_id");
		}
	} // updateEntropySourceIsUserInput()
	
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
		crypto_info['Address'] = wallet_address;
		
		let wallet_URL_elt =  HtmlUtils.GetElement( WALLET_URL_LINK_ID );
		if (wallet_URL_elt != undefined) {
			crypto_info['Blockchain Explorer'] = wallet_URL_elt.href;
		}
		
		log2Main("blockchain " + blockchain );
		
		if (   blockchain == BITCOIN 
		    || blockchain == DOGECOIN || blockchain == LITECOIN
		    || blockchain == ETHEREUM
			|| blockchain == RIPPLE       || blockchain == TRON  
			|| blockchain == BITCOIN_CASH || blockchain == FIRO) {
				
			let WIF_value = HtmlUtils.GetField( WIF_ID ); 
			if ( WIF_value != "" ) {
				crypto_info[WIF] = WIF_value;
			}

			let xpriv = HtmlUtils.GetField( XPRIV_ID );
			if ( xpriv != "" ) {
				crypto_info[XPRIV] = xpriv;
			}

            let xpriv_value = "";
			
			if (blockchain == ETHEREUM ) {
				xpriv_value = crypto_info[XPRIV];
				delete crypto_info[XPRIV];
				crypto_info["Private Key"] = HtmlUtils.GetField( WALLET_PK_HEX_ID ); 
			}
            else if (blockchain == RIPPLE ) {
				xpriv_value = crypto_info[XPRIV];
				delete crypto_info[XPRIV];
				crypto_info["Private Key"] = xpriv_value; 
			}
			else if ( blockchain == TRON ) {
				//log2Main("blockchain is TRON " + HtmlUtils.GetField( WALLET_PK_HEX_ID ) );
				crypto_info["Private Key"] = HtmlUtils.GetField( WALLET_PK_HEX_ID ); 
			}
			else if ( blockchain == BITCOIN_CASH ) {
				//log2Main("blockchain is TRON " + HtmlUtils.GetField( WALLET_PK_HEX_ID ) );
				crypto_info["Private Key"] = HtmlUtils.GetField( WALLET_PK_HEX_ID ); 
			}
            else if (blockchain == FIRO) {
				xpriv_value = crypto_info[XPRIV];
				delete crypto_info[XPRIV];
				crypto_info["Private Key (B58)"] = xpriv_value; 
			}			
		}
		
		let mnemonics_elt = HtmlUtils.GetElement( MNEMONICS_ID ); 
		let mnemonics = mnemonics_elt.value;
		crypto_info[MNEMONICS] = mnemonics;		
		
		let shortened_mnemonics_elt = HtmlUtils.GetElement( MNEMONICS_4LETTER_ID ); 
		let shortened_mnemonics = shortened_mnemonics_elt.value;
		crypto_info['Shortened Mnemonics'] = shortened_mnemonics;
		
		let lang = this.getLang();
		let options = { "lang": lang };
		let data = { mnemonics, options };
		let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
		let word_indexes_str = JSON.stringify( word_indexes )
		                       .replaceAll( '"', '' ).replaceAll( ',', ', ' )
							   .replaceAll( '[', '' ).replaceAll( ']', '' )
		crypto_info['Word indexes'] = word_indexes_str;
		
		//log2Main(">> " + _CYAN_ + "RendererGUI.getCryptoInfo() " + _END_);
		
		crypto_info["Derivation Path"] =  "m/44'/" + COIN_TYPES[blockchain] + "'/"
		                                 + HtmlUtils.GetField( ACCOUNT_ID ) + "'/0/"
										 + HtmlUtils.GetField( ADDRESS_INDEX_ID );
		
		let entropy_value = HtmlUtils.GetField( ENTROPY_ID ); 
		crypto_info["Entropy"] = entropy_value;
		
		crypto_info['lang'] = lang;
		
		return crypto_info;
	} // getCryptoInfo()
	
	// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
	openTabPage( pageName, elt, color ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.openTabPage " + _END_ + elt.id );
		
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
	onDropImage( evt ) {
		log2Main(">> " + _CYAN_ + "RendererGUI.onDropImage()" + _END_);		
		evt.preventDefault();
		evt.stopPropagation();

		let file_path = [];
		for (const f of evt.dataTransfer.files) {
			// Using the path attribute to get absolute file path
			// console.log('File Path of dragged files: ', f.path)
			file_path.push(f.path); // assemble array for main.js
		}
		let img_file_path = file_path[0]
		log2Main("   " + img_file_path);
		window.ipcMain.LoadImageFromFile( img_file_path );
	} // RendererGUI.onDropImage()
	
	setEventHandler( elt_id, event_name, handler_function ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // setEventHandler()
} // RendererGUI class

RendererGUI.GetInstance(); 