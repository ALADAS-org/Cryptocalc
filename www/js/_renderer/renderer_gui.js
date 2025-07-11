// =====================================================================================
// ================================   renderer_gui.js   ================================
// =====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start

// password in HD wallet:
// https://help.blockstream.com/hc/en-us/articles/8712301763737-What-is-a-BIP39-passphrase
"use strict";

// ===============================  RendererGUI class  ===============================
// NB: "Singleton" class
// * static GetInstance()
// ------------------------------------------------------
// * async  newWallet( json_data )
// * async  openWallet( json_data )
//
// * async  generateHDWalletAddress( blockchain, entropy )
// * async  generateSimpleWalletAddress( blockchain, entropy )
//
// * async  getSaltedEntropySource()
// * async  didFinishLoadInit()
// * async  localizeHtmlNodes()
// *        registerCallbacks()
// * async  propagateFields( entropy, wif )
//
//          updateFieldsVisibility()
// * async  updateOptionsFields( json_data )
// * async  updateFields()
// * async  updateWalletMode( wallet_mode )
// * async  updatePassword( password )
// * async  updateEntropySize( entropy_size )
// * async  updateEntropy( entropy )
// *        updateBlockchain( blockchain )
// *        updateWalletURL( blockchain, wallet_address )
// *        updateWIF( blockchain, wif )
// *        updatePrivateKey( blockchain, PRIV_KEY )
// * async  updateChecksum( entropy )
// * async  updateMnemonics( entropy )
// * async  updateLanguage( lang )
// * async  updateWordIndexes()
//
// * async  generateSalt()
// * async  generateRandomFields()
// * async  getWalletInfo()
// * 	    clearFields( field_ids )
//
// * async  onGUIEvent( data )
//
// *        GuiClearPassword()
// *        GuiGeneratePassword()
// *        GuiTogglePasswordVisibility()
// *        GuiSetPasswordApplyState()
//
// * async  fileSaveWallet()
// * async  fileOpenWallet()
//
//   	    showSaveWalletInfoDialog()
//
// * async  onGuiUpdateEntropySize( evt )
// * async  onGuiUpdateWordCount( evt )
// * async  onGuiUpdateLang( evt )
// * async  onGuiSwitchWalletMode( evt )
// * async  onGuiUpdateBlockchain( evt )
//          onEntropyKeydown( evt )
//          onEntropyKeypress( evt )
//          onEntropyPaste( evt )
// * async  onKeyDown( evt )
// * async  onInput( evt )
// *        onGuiFocus( evt )
//
//          setSaveCmdState();
//          setRefreshCmdState();
//
// *        setEventHandler( elt_id, event_name, handler_function )//
// *        openTabPage( pageName, elt, color )
// *        setFocus( elt_id )
// * async  importRawData()

const ALLOWED_ALPHABETS       = { [ENTROPY_ID]: HEX_ALPHABET };
const FIELD_IDS               = [ ENTROPY_SRC_FORTUNES_ID, SALT_ID, ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const WATERFALL_IDS           = [ ENTROPY_SRC_FORTUNES_ID, SALT_ID, ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const WATERFALL_FROM_SEED_IDS = [ ENTROPY_ID, MNEMONICS_ID, MNEMONICS_4LETTER_ID ];
const EDITABLE_FIELD_IDS      = [ ENTROPY_SRC_FORTUNES_ID, ENTROPY_ID, MNEMONICS_ID ];

const ON_GUI_EVENT_LOG_PREFIX = ">> " + _CYAN_ + "RendererGUI.onGUIEvent: ";

const trigger_event = ( elt, event_type ) => elt.dispatchEvent( new CustomEvent( event_type, {} ) );

const getChecksumBitCount = ( word_count ) => {
		if ( word_count == undefined ) word_count = 12;
		let checksum_bit_count = 4; // default case is 12 words / 4 bits
		switch ( word_count ) {
			case 12: checksum_bit_count = 4; break;						
			case 15: checksum_bit_count = 5; break;						
			case 18: checksum_bit_count = 6; break;						
			case 21: checksum_bit_count = 7; break;						
			case 24: checksum_bit_count = 8; break;						
			default: checksum_bit_count = 8; break;
		}		
		return checksum_bit_count;
}; // getChecksumBitCount()

const getWordCount = ( entropy_size ) => {
	switch ( entropy_size ) { 
		case 128: 	return 12;	break;						
		case 160: 	return 15;	break;						
		case 192: 	return 18;	break;						
		case 224: 	return 21;	break;						
		case 256: 	return 24;	break;
		default:	return 24;	break;
	} // entropy_size
}; // getWordCount()

// ==============================  RendererGUI class   ==============================
class RendererGUI {	
	//static #key = {};
	static #key = Symbol();
	static #_Singleton = new RendererGUI( this.#key );
	
	static GetInstance() {
		if ( RendererGUI.#_Singleton == undefined ) {
			RendererGUI.#_Singleton = new RendererGUI();
        }
        return RendererGUI.#_Singleton;
    } // RendererGUI.GetInstance() 
	
    // ** Private constructor **
	constructor( key ) {
		if ( key !== RendererGUI.#key ) {
			throw new TypeError("RendererGUI constructor is private.");
		}
		
		this.wallet_info = new Wallet( this );
		this.wallet_info.setAttribute( WORD_COUNT, 24 );
				
		this.first_time                   = true; 
		
		this.password_visible             = false;
		this.wits_path                    = "";
		
        this.new_cmd_count                = 0;
        this.cb_enabled                   = true;		
		this.Options                      = {};	
		this.entropy_source_type          = IMAGE_ENTROPY_SRC_TYPE;		
		this.expected_entropy_bytes       = 32;
		this.entropy_source_is_user_input = false;		
		this.img_data_asURL               = "";
		
		trace2Main( pretty_func_header_format( "RendererGUI.constructor" ) );
		
		window.ipcMain.receive( "fromMain", async (data) => { await this.onGUIEvent(data); } ); 
	} // ** Private constructor **
	
	async newWallet( options_json_data ) {
		trace2Main( "===== rGUI.newW> ===============================================================" );
		trace2Main( pretty_func_header_format( "RendererGUI.newWallet" ) );
		
		trace2Main( pretty_format( "RendererGUI.newWallet" ) );
		
		this.new_cmd_count++;
		
		this.cb_enabled = false;
		
		this.setSaveCmdState( true );
		
		this.wallet_info.setOptions( options_json_data );
		
		// trace2Main( pretty_format( "rGUI.newW> first_time ", this.first_time ) );
		// trace2Main( pretty_format( "rGUI.newW> wits_path",   this.wits_path ) );
		
        this.wallet_info.reset(); 
		
        this.wallet_info.setAttribute( CMD, CMD_NEW_WALLET );		
		
		this.setEntropySourceIsUserInput( false );
		
		this.entropy_source_type = IMAGE_ENTROPY_SRC_TYPE;

        this.setRefreshCmdState( false );
		
		await this.drawEntropySource(); 
        //----------------------------------------------------------		

		//---------- Wallet Mode ----------
		let wallet_mode = options_json_data[WALLET_MODE];			
		await this.updateWalletMode( wallet_mode );	
		trace2Main( pretty_format( "rGUI.newW> wallet_mode", wallet_mode ) );	
        //---------- Wallet Mode		
				
		// ---------- Blockchain ----------
		trace2Main( pretty_format( "rGUI.newW> b4 blockchain" ) );
		let blockchain = options_json_data[DEFAULT_BLOCKCHAIN][wallet_mode];		
		await this.updateBlockchain( blockchain );
		trace2Main( pretty_format( "rGUI.newW> blockchain", blockchain ) );
		// ---------- Blockchain
		
		// ---------- Coin ----------
		let coin = COIN_ABBREVIATIONS[blockchain];		
		HtmlUtils.SetNodeValue( WALLET_COIN_ID, coin );	
		// trace2Main( pretty_format( "rGUI.newW> coin", coin ) );
		// ---------- Coin
		
		// ---------- Coin Type ----------
		let coin_type = COIN_TYPES[blockchain];		
		this.wallet_info.setAttribute( COIN_TYPE, coin_type ); 
		// trace2Main( pretty_format( "rGUI.newW> coin_type", coin_type ) );
		// ---------- Coin Type

		// ---------- Entropy Size ----------
		let entropy_size = options_json_data[ENTROPY_SIZE][wallet_mode];
		this.wallet_info.setAttribute( ENTROPY_SIZE, entropy_size ); 
		await this.updateEntropySize( entropy_size );
        trace2Main( pretty_format( "rGUI.newW> entropy_size", entropy_size ) );		
		// ---------- Entropy Size
		
		// ---------- Entropy ----------
		// let	entropy_1 = HtmlUtils.GetNodeValue( ENTROPY_ID );
		// trace2Main( pretty_format( "rGUI.newW> entropy 1", entropy_1 ) );
		
		let	entropy = await this.generateEntropyFromEntropySource();
        this.wallet_info.setAttribute( ENTROPY, entropy ); 		
        trace2Main( pretty_format( "rGUI.newW> entropy", entropy ) );	

		await this.updateChecksum( entropy );		
		// ---------- Entropy 
		
		if ( wallet_mode == HD_WALLET_TYPE ) {
			this.wallet_info.setAttribute( ACCOUNT,  0 );		
			// trace2Main( pretty_format( "rGUI.newW> account", 0 ) );						
			
            this.wallet_info.setAttribute( ADDRESS_INDEX,  0 );           		
			// trace2Main( pretty_format( "rGUI.newW> address_index", 0 ) );				
		} // HD_WALLET_TYPE	
		
		//---------- lang ----------
		let lang = options_json_data[LANG];			
		await this.updateLanguage( lang );	
		// trace2Main( pretty_format( "rGUI.newW> lang", lang ) );	
        //---------- lang
		
		// ---------- Update Window Title ----------
		// trace2Main( pretty_format( "rGUI.newW> coin", coin ) );
		let data = { coin, wallet_mode };
		window.ipcMain.SetWindowTitle( data );
		// ---------- Update Window Title	
	
		// --------------------------------		
        await this.updateFields( entropy );	       	
        // --------------------------------
		
		this.wallet_info.setAttribute( CMD, CMD_NONE );		
		// trace2Main( pretty_func_header_format( "<END> RendererGUI.newWallet" ) );
		
		this.updateFieldsVisibility();
		
		this.cb_enabled = true;  
		
		// trace2Main( pretty_format( "<END> RendererGUI.newWallet first_time", this.first_time) );
		// trace2Main( pretty_format( "<END> RendererGUI.newWallet wits_path", "'" + this.wits_path + "'") );
		
		//---------- Note: Request "Min" to 'Open WITS' with 'wits_path' ----------
		if ( this.wits_path != "" && this.first_time ) {
			trace2Main( pretty_format( "<END> RendererGUI.newWallet Ask 'Main' to'Open WITS' ", this.wits_path) );
			let cmd_name = CMD_OPEN_WALLET;
			let cmd_args = this.wits_path;
			data = { cmd_name, cmd_args };			
			await window.ipcMain.ExecuteCommand( data ); 
			
			this.wits_path  = "";
			this.first_time = false;
		}	
	} // async newWallet()
	
	async openWallet( json_data ) {
		trace2Main( "===== rGUI.openW> ===============================================================" );
		trace2Main( pretty_func_header_format( "RendererGUI.openWallet" ) );
		trace2Main( JSON.stringify(json_data) );

        this.cb_enabled = false;
		
        this.setEntropySourceIsUserInput( true );
		
		this.setSaveCmdState( false );
		
		this.wallet_info.reset();
        this.wallet_info.setAttribute( CMD, CMD_OPEN_WALLET );
		
		// ---------- Entropy ----------
		let entropy = json_data[ENTROPY];
		this.wallet_info.setAttribute( ENTROPY, entropy );
		trace2Main( pretty_format( "rGUI.openW> entropy", entropy ) );
		// ---------- Entropy		
		
		// ---------- Entropy Size ----------
		let entropy_size = json_data[ENTROPY_SIZE];		
		if ( isString( entropy_size ) )  entropy_size = parseInt( entropy_size );
		this.wallet_info.setAttribute( ENTROPY_SIZE, entropy_size );
        await this.updateEntropySize( entropy_size );		
		trace2Main( pretty_format( "rGUI.openW> entropy_size", entropy_size ) );		
		// ---------- Entropy Size	
		
		// ---------- Wallet Mode ----------
		let wallet_mode = json_data[WALLET_MODE];		
		this.wallet_info.setAttribute( WALLET_MODE, wallet_mode );
		trace2Main( pretty_format( "rGUI.openW> wallet_mode", wallet_mode ) );
		await this.updateWalletMode( wallet_mode );	
		// ---------- Wallet Mode
		
		// ---------- Blockchain ----------
		// Note: order is important: 'blockchain' must be updated after 'wallet_mode'
		let blockchain = json_data[BLOCKCHAIN];
		this.wallet_info.setAttribute( BLOCKCHAIN, blockchain ); 
        await this.updateBlockchain( blockchain );	
		trace2Main( pretty_format( "rGUI.openW> blockchain", blockchain ) );
		// ---------- Blockchain
		
		//---------- lang ----------
		let lang = json_data[LANG];			
		await this.updateLanguage( lang );	
		trace2Main( pretty_format( "rGUI.openW> lang", lang ) );	
        //---------- lang	
		
		// ---------- Coin ----------
		let coin = COIN_ABBREVIATIONS[blockchain];		
		this.wallet_info.setAttribute( COIN, coin ); 
		// trace2Main( pretty_format( "rGUI.openW> coin", coin ) );
		// ---------- Coin
		
		// ---------- Coin Type ----------
		let coin_type = COIN_TYPES[blockchain];		
		this.wallet_info.setAttribute( COIN_TYPE, coin_type ); 
		trace2Main( pretty_format( "rGUI.openW> coin(coin_type)" , coin + "(" + coin_type + ")" ) );
		// ---------- Coin Type		

		// ---------- Word Count ----------
		let word_count = getWordCount( entropy_size );
		this.wallet_info.setAttribute( WORD_COUNT, word_count );
        // ---------- Word Count
		
		// ---------- Checksum ----------
		// Note: requires 'word_count' updated in 'wallet_info'
		await this.updateChecksum( entropy );
        // ---------- Checksum		

		if ( wallet_mode == HD_WALLET_TYPE ) {				
			// ---------- Password ----------
			if ( json_data[PASSWORD] != undefined ) {
				let password = json_data[PASSWORD];
				this.wallet_info.setAttribute( PASSWORD, password );
				trace2Main( pretty_format( "rGUI.openW> password", password ) );	
			}	
			// ---------- Password

		    let account = json_data[ACCOUNT]; 
			this.wallet_info.setAttribute( ACCOUNT, account );
			// trace2Main( pretty_format( "rGUI.openW> account", account ) );						
			
			let address_index = json_data[ADDRESS_INDEX];
            this.wallet_info.setAttribute( ADDRESS_INDEX, address_index );
			// trace2Main( pretty_format( "rGUI.openW> address_index", address_index ) );
		} // HD_WALLET_TYPE	
		
		// ---------- Mnemonics ----------
		let mnemonics = json_data[MNEMONICS];
		this.wallet_info.setAttribute( MNEMONICS, mnemonics );
		trace2Main( pretty_format( "rGUI.openW> mnemonics", mnemonics ) );		
		// ---------- Mnemonics
		
		// ---------- Address ----------
		let address = json_data[ADDRESS];
		this.wallet_info.setAttribute( ADDRESS, address );
		trace2Main( pretty_format( "rGUI.openW> address", address ) );
        // ---------- Address
		
		//---------- Update 'Address Hardened Suffix ("" or "'") in "Wallet" Tab ----------
		if ( blockchain == SOLANA )  HtmlUtils.SetNodeValue( ADDRESS_HARDENED_SUFFIX_ID, "'" );				
		else                         HtmlUtils.SetNodeValue( ADDRESS_HARDENED_SUFFIX_ID, "" );				
		//---------- Update 'Address' in "Wallet" Tab

		// ---------- Word_Indexes ----------
		let word_indexes = json_data[WORD_INDEXES];
		this.wallet_info.setAttribute( WORD_INDEXES, word_indexes );
		trace2Main( pretty_format( "rGUI.openW> word_indexes", word_indexes ) );
        // ---------- Word_Indexes		
		
		// ---------- WIF ----------
		let wif = json_data[WIF];
		this.wallet_info.setAttribute( WIF, wif );
		trace2Main( pretty_format( "rGUI.openW> wif", wif ) );
        // ---------- WIF	
		
		// ---------- Private Key ----------
		let private_key = json_data[PRIVATE_KEY];
		this.wallet_info.setAttribute( PRIVATE_KEY, private_key );
		trace2Main( pretty_format( "rGUI.openW> private key", private_key ) );
        // ---------- Private Key	

		// ---------- Update Window Title ----------
		let data = { coin, wallet_mode };
		window.ipcMain.SetWindowTitle( data );
		// ---------- Update Window Title
		
		this.wallet_info.setAttribute( CMD, CMD_NONE );
		this.updateFieldsVisibility();

		this.cb_enabled = true;
		
		// trace2Main( pretty_func_header_format( "<END> RendererGUI.openWallet" ) );
	} // async openWallet()
		
	async generateSimpleWalletAddress( blockchain, entropy_hex ) {
        trace2Main( pretty_func_header_format( "RendererGUI.generateSimpleWalletAddress", 
		                                       blockchain + " " + this.entropy_source_type ) );					 
		
        this.cb_enabled = false;
		
		let entropy_src_type = HtmlUtils.GetNodeValue( ENTROPY_SRC_TYPE_SELECTOR_ID );
		this.entropy_source_type = entropy_src_type;
		
		let entropy_src = "XX";
			
		if ( this.entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE ) {        	
			entropy_src = HtmlUtils.GetNodeValue( ENTROPY_SRC_FORTUNES_ID );
		}
		else if ( this.entropy_source_type == IMAGE_ENTROPY_SRC_TYPE ) {        	
			entropy_src = this.img_data_asURL;
		}
		
		// trace2Main( pretty_format( "rGUI.genSW> entropy_src", getShortenedString( entropy_src ) ) );
		
		let new_wallet = {};				
		let salt_uuid  = HtmlUtils.GetNodeValue(SALT_ID);
		let wif        = "";
		
		let private_key = entropy_hex;
		// trace2Main( pretty_format("rGUI.genSW> MAINNET", MAINNET) );
        trace2Main( pretty_format("rGUI.genSW> private_key", private_key) );		

		if ( private_key == undefined || private_key == "" ) {
			 throw new Error("RendererGUI.generateSimpleWalletAddress 'private_key' NOT DEFINED");
		}
		
		if (   blockchain == ETHEREUM || blockchain == AVALANCHE
		    || blockchain == BITCOIN  || blockchain == DOGECOIN || blockchain == LITECOIN
			|| blockchain == SOLANA ) { 
			
			let crypto_net = MAINNET;
			let data = { private_key, salt_uuid, blockchain, crypto_net }; // NB: take care of field names and order
			new_wallet = await window.ipcMain.GetSimpleWallet( data );
			
			private_key = new_wallet[PRIVATE_KEY];
			wif         = new_wallet[WIF];
			trace2Main( pretty_format("rGUI.genSW> new_wallet[WIF]", new_wallet[WIF]) );
			
			//---------- Update 'Private Key' in 'Wallet' Tab ----------
			this.updatePrivateKey( blockchain, private_key );
			this.wallet_info.setAttribute(PRIVATE_KEY, private_key);
			// HtmlUtils.SetNodeValue( PRIVATE_KEY_ID, private_key );
			//---------- Update 'Private Key' in 'Wallet' Tab	
		
			let wallet_address = new_wallet[ADDRESS];
			
			//---------- Update 'Address' in 'Wallet' Tab ----------
			trace2Main( pretty_format( "rGUI.genSW> wallet_address", wallet_address) );		
			this.wallet_info.setAttribute( ADDRESS, wallet_address );
			//---------- Update 'Address' in 'Wallet' Tab

			//---------- Update 'WIF' in 'Wallet' Tab ----------
            trace2Main( pretty_format( "rGUI.genSW> WIF", wif ) );				
			this.wallet_info.setAttribute( WIF, wif );
			//---------- Update 'WIF' in 'Wallet' Tab			
	
	        // ** Note **: 'mnemonics' is used for 'Simple Wallet' / Solana			
			if ( blockchain == SOLANA ) {
				let mnemonics = HtmlUtils.GetNodeValue( MNEMONICS_ID );
				
				if (this.wallet_info.getAttribute('lang') == "JP") {
					let mnemonic_jp = mnemonics.replaceAll(' ', '\u3000');
					//let mnemonic_jp = mnemonics.replaceAll(' ', '*');
					HtmlUtils.SetNodeValue( SW_MNEMONICS_ID, mnemonic_jp );
				}
				else {
					HtmlUtils.SetNodeValue( SW_MNEMONICS_ID, mnemonics );
				}				
			}
			
			this.updateWalletURL( blockchain, wallet_address );
		}
		
		this.updateFieldsVisibility();
		
		this.cb_enabled = true;
		
		return new_wallet;
	} // async generateSimpleWalletAddress()
	
	async generateHDWalletAddress( blockchain, entropy_hex ) {
        trace2Main( pretty_func_header_format( "RendererGUI.generateHDWalletAddress", blockchain + " " + this.entropy_source_type ) );				 
		trace2Main( pretty_format("rGUI.genHDW> entropy_hex", entropy_hex ) );
		
		this.cb_enabled = false;
		
		let entropy_src_type = HtmlUtils.GetNodeValue( ENTROPY_SRC_TYPE_SELECTOR_ID );
		this.entropy_source_type = entropy_src_type;
		
		let entropy_src = "XX";
			
		if ( this.entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE ) {        	
			entropy_src = HtmlUtils.GetNodeValue( ENTROPY_SRC_FORTUNES_ID );
		}
		else if ( this.entropy_source_type == IMAGE_ENTROPY_SRC_TYPE ) {        	
			entropy_src = this.img_data_asURL;
		}
		
		trace2Main( pretty_format( "rGUI.genHDW> entropy_src", getShortenedString( entropy_src ) ) );
		
		let new_wallet     = {};
		let options        = {};
        let hd_private_key = undefined;	
		let data           = undefined;
		
		let mnemonics      = HtmlUtils.GetNodeValue( MNEMONICS_ID );
		let words          = mnemonics.split(' ');
        let word_count     = words.length;			
		let separator      = '\n';		

        let mnemonics_as_2parts = asTwoParts( mnemonics, 15 );
        trace2Main( pretty_format( "rGUI.genHDW> mnemonics(" + word_count + ")", mnemonics_as_2parts[0] ) );		
        if ( mnemonics_as_2parts.length > 1 ) { 
			trace2Main( pretty_format("", mnemonics_as_2parts[1] ) );				
		}
		
		let wif             = "";
		let PRIV_KEY        = "";
		let salt_uuid    	= HtmlUtils.GetNodeValue( SALT_ID );
        let derivation_path = "";	
        let crypto_net	    = MAINNET;
		let password        = "";
		let account         = "0";
		let address_index   = "0";
		let wallet_mode     = this.wallet_info.getAttribute(WALLET_MODE);

        this.wallet_info.setAttribute( BLOCKCHAIN, blockchain );		
		
		if (   blockchain == ETHEREUM || blockchain == AVALANCHE
		    || blockchain == BITCOIN  || blockchain == DOGECOIN || blockchain == LITECOIN
			|| blockchain == CARDANO  || blockchain == SOLANA   
			|| blockchain == RIPPLE   || blockchain == TRON 
			|| blockchain == BITCOIN_CASH 
			|| blockchain == DASH || blockchain == FIRO || blockchain == ZCASH) {
				
			// trace2Main( pretty_format( "rGUI.genHDW> entropy_source_is_user_input", this.entropy_source_is_user_input ) );

			let salt_uuid = HtmlUtils.GetNodeValue( SALT_ID );
			
			// ---------- get 'Password' ----------
			password = this.wallet_info.getAttribute(PASSWORD);
			trace2Main( pretty_format( "rGUI.genHDW> password", "'" + password + "'") );
			// ---------- get 'Password'
			
			// ---------- get 'Account' ----------
			if ( wallet_mode == HD_WALLET_TYPE )
				account = this.wallet_info.getAttribute(ACCOUNT);
			else if ( wallet_mode == SWORD_WALLET_TYPE )
			    account = Math.floor( Math.random() * (ACCOUNT_MAX + 1) );
			// trace2Main( pretty_format( "rGUI.genHDW> account", account ) );
			// ---------- get 'Account'

			// ---------- get 'Address Index' ----------
			if ( wallet_mode == HD_WALLET_TYPE )
				address_index = this.wallet_info.getAttribute(ADDRESS_INDEX);
			else if ( wallet_mode == SWORD_WALLET_TYPE )
				address_index = Math.floor( Math.random() * (ADDRESS_INDEX_MAX + 1) );
			// trace2Main( pretty_format( "rGUI.genHDW> address_index", address_index ) );
			// ---------- get 'Address Index'			
			
			// ========== Wallet Generation ==========  
			const data = { entropy_hex, salt_uuid, blockchain, crypto_net, password, account, address_index };
			// trace2Main( pretty_format( "rGUI.genHDW> data", JSON.stringify(data) ) );
			new_wallet = await window.ipcMain.GetHDWallet( data );
			// ========== Wallet Generation
			
			wif      = "";
			PRIV_KEY = "";
			
			if ( blockchain == CARDANO ) {
				HtmlUtils.ShowNode( TR_SW_MNEMONICS_ID );
				HtmlUtils.SetNodeValue( PK_LABEL_ID, 'XPRIV' );
				HtmlUtils.RemoveClass( ADDRESS_ID, 'NormalAddressField' );
                HtmlUtils.AddClass( ADDRESS_ID,    'LongAddressField' );					
			}
			else {
				HtmlUtils.SetNodeValue( PK_LABEL_ID, 'Private Key' );
				HtmlUtils.AddClass( ADDRESS_ID,    'NormalAddressField' );
                HtmlUtils.RemoveClass( ADDRESS_ID, 'LongAddressField' );					
			}			

			if (    blockchain == BITCOIN || blockchain == LITECOIN || blockchain == DOGECOIN
			     || blockchain == BITCOIN_CASH
                 || blockchain == DASH || blockchain == FIRO || blockchain == ZCASH ) {
                wif = ( new_wallet[WIF] != undefined ) ? new_wallet[WIF] : "";
                trace2Main( pretty_format( "rGUI.genHDW> WIF", wif ) );				
			}
			else if ( blockchain == TRON ) {				
				PRIV_KEY = new_wallet[PRIVATE_KEY];
			} 
			else if ( blockchain == RIPPLE ) {	
				wif = ( new_wallet[WIF] != undefined ) ? new_wallet[WIF] : "";			
				PRIV_KEY = new_wallet[PRIVATE_KEY];
			}   			
		}
		
		this.updateWIF( blockchain, wif );
		
		// ==================== Update 'Derivation Path' in "Wallet" Tab ====================
		derivation_path = new_wallet[DERIVATION_PATH];
		trace2Main( pretty_format( "rGUI.genHDW> derivation_path", derivation_path ) );

		let coin_type = COIN_TYPES[blockchain];
		if ( wallet_mode == HD_WALLET_TYPE ) {
			if ( derivation_path == undefined ) {
				GuiUtils.ShowQuestionDialog( "'derivation_path' is UNDEFINED", 
											{"CloseButtonLabel": "OK", "BackgroundColor": "#FFCCCB" } );
			}
			else {
				let derivation_path_nodes = derivation_path.split('/');
				trace2Main( pretty_format( "rGUI.genHDW> Get account/address_index from *Derivation Path*", "" ) );
				coin_type = derivation_path_nodes[2];
				//trace2Main( pretty_format( "rGUI.genHDW> coin_type", coin_type ) );
				
				account = derivation_path_nodes[3].replace("'",'');
				//trace2Main( pretty_format( "rGUI.genHDW> account", account ) );
				
				address_index = derivation_path_nodes[5];
				//trace2Main( pretty_format( "rGUI.genHDW> address_index", address_index ) );
			}
		} // if 'wallet_mode' is HD_WALLET_TYPE

		HtmlUtils.SetNodeValue( COIN_TYPE_ID,     coin_type + '/' );
		
		this.wallet_info.setAttribute( ACCOUNT,        account );
		this.wallet_info.setAttribute( ADDRESS_INDEX,  address_index );	
		
		//---------- Update 'Purpose' in "Wallet" Tab ----------
		if ( blockchain == CARDANO ) HtmlUtils.SetNodeValue( PURPOSE_ID, ADA_PURPOSE + "'/");				
		else                         HtmlUtils.SetNodeValue( PURPOSE_ID, "44'/" );					
		//---------- Update 'Purpose' in "Wallet" Tab
		
		//---------- Update 'Change' in "Wallet" Tab ----------
		// NB: switch to systematic Hardened adresses
		// if ( blockchain == SOLANA )  HtmlUtils.SetNodeValue( CHANGE_ID, "0'/" );				
		// else                         HtmlUtils.SetNodeValue( CHANGE_ID, "0/" );				
		//---------- Update 'Change' in "Wallet" Tab
		
		//---------- Update 'Address' in "Wallet" Tab ----------
        let wallet_address = new_wallet[ADDRESS];
		this.wallet_info.setAttribute( ADDRESS, wallet_address );
		trace2Main( pretty_format( "rGUI.genHDW> new_wallet_address", wallet_address ) );        				
		//---------- Update 'Address' in "Wallet" Tab
		
		//---------- Update 'Address Hardened Suffix ("" or "'") in "Wallet" Tab ----------
		// NB: switch to systematic Hardened adresses
		// if ( blockchain == SOLANA )  HtmlUtils.SetNodeValue( ADDRESS_HARDENED_SUFFIX_ID, "'" );				
		// else                         HtmlUtils.SetNodeValue( ADDRESS_HARDENED_SUFFIX_ID, "" );				
		//---------- Update 'Address' in "Wallet" Tab
		
		//==================== Update 'Derivation Path' in "Wallet" Tab
		
		
		//---------- Update 'Private Key' in "Wallet" Tab ----------
		hd_private_key = new_wallet[PRIVATE_KEY];
		trace2Main( pretty_format( "rGUI.genHDW> hd_private_key", hd_private_key ) );
		this.wallet_info.setAttribute(PRIVATE_KEY, hd_private_key);
		// HtmlUtils.SetNodeValue( PRIVATE_KEY_ID, hd_private_key );
		//---------- Update 'Private Key' in "Wallet" Tab
		
		this.updateWalletURL( blockchain, wallet_address );
		
		this.updateFieldsVisibility();
		
		this.cb_enabled = true;
		
		// trace2Main( "rGUI.genHDW> ------ END OF RendererGUI.generateHDWalletAddress ------" );
		return new_wallet;
	} // async generateHDWalletAddress()
	
	async didFinishLoadInit() {
		trace2Main( pretty_func_header_format( "RendererGUI.didFinishLoadInit" ) );
		
		this.registerCallbacks();
		this.setSaveCmdState( true );
		
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
	} // async didFinishLoadInit()
	
	async localizeHtmlNodes() {
		 trace2Main( pretty_func_header_format( "RendererGUI.localizeHtmlNodes" ) );
		 
		 this.cb_enabled = false;
		 
		 let L10n_key      = "";
		 let L10n_msg      = "";
		 let L10N_KEYPAIRS = await window.ipcMain.GetL10nKeyPairs();
		 let L10N_KEYS     = Object.keys( L10N_KEYPAIRS );
		 for ( let i=0; i < L10N_KEYS.length; i++ ) {
			 //trace2Main("---------->>");			 
			 L10n_key = L10N_KEYS[i];
			 L10n_msg = await window.ipcMain.GetLocalizedMsg( L10n_key );
			 //trace2Main("   L10n_key: " + L10n_key + "   L10n_msg: " + L10n_msg);
			 HtmlUtils.SetNodeValue( L10n_key, L10n_msg );
		 }
		 
		 this.cb_enabled = true;
	} // async localizeHtmlNodes()
	
	registerCallbacks() {
		trace2Main( pretty_func_header_format( "RendererGUI.registerCallbacks" ) );
		
		// -------------------- Toolbar icon buttons -------------------- 
		this.setEventHandler( FILE_NEW_ICON_ID, 'click', 
			async (evt) => { 
			    trace2Main( pretty_format( "rGUI.evtHandler> " + FILE_NEW_ICON_ID ) );
				if ( this.cb_enabled )  { 
					await this.onFileNewWallet();  
				}
			} );
			
		this.setEventHandler( FILE_OPEN_ICON_ID, 'click', 
		    async (evt) => { 
			    trace2Main( pretty_format( "rGUI.evtHandler> " + FILE_OPEN_ICON_ID ) );
				if ( this.cb_enabled ) { 
					await this.fileOpenWallet(); 
				}
			} );
			
		this.setEventHandler( SAVE_ICON_ID,            'click',
 		    async (evt) => { if (this.cb_enabled) await this.fileSaveWallet(); } );
			
		this.setEventHandler( REGENERATE_ICON_ID,      'click', 
		    async (evt) => { if (this.cb_enabled) await this.generateRandomFields(); } );
			
		this.setEventHandler( TOGGLE_DEVTOOLS_ICON_ID, 'click', 
		    (evt) => { if (this.cb_enabled) this.onToggleDebug(evt); } );		
		// -------------------- Toolbar icon buttons	
		
		this.setEventHandler( ENTROPY_SRC_FORTUNES_ID, 'focus', 
		    (evt) => { if (this.cb_enabled) this.onGuiFocus(evt); } );
        //this.setEventHandler( entropy_src_fortunes_id,      'keydown', async (evt) => { await this.onKeyDown(evt); }   );	
		
		this.setEventHandler( ENTROPY_ID,            'keypress', 
			(evt) => { if (this.cb_enabled) this.onEntropyKeypress(evt); } );
		this.setEventHandler( ENTROPY_ID,            'keydown',  
		    (evt) => { if (this.cb_enabled) this.onEntropyKeydown(evt); } );
        this.setEventHandler( ENTROPY_ID,            'paste',    
		    async (evt) => { if (this.cb_enabled) await this.onEntropyPaste(evt); } );		
		this.setEventHandler( ENTROPY_ID,            'focus',    
		    (evt) => { if (this.cb_enabled) this.onGuiFocus(evt); } );
			
		// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop	
		this.setEventHandler( ENTROPY_SOURCE_IMG_ID, 'drop', 
		    (evt) => { if (this.cb_enabled) this.onDropImage(evt); } );
							  
		this.setEventHandler( ENTROPY_SOURCE_IMG_ID, 'dragover', 
		    (evt) => { if (this.cb_enabled) evt.preventDefault(); evt.stopPropagation();  } );

		this.setEventHandler( ENTROPY_SRC_TYPE_SELECTOR_ID, 'change', 
			async (evt) => { if (this.cb_enabled) await this.onGuiSwitchEntropySourceType(); } );
		
		this.setEventHandler( ENTROPY_COPY_BTN_ID,      'click',    
		    (evt) => { if (this.cb_enabled) this.onCopyButton(ENTROPY_COPY_BTN_ID); } );
			
		this.setEventHandler( ENTROPY_SIZE_SELECT_ID,   'change',   
		    async (evt) => { if (this.cb_enabled) await this.onGuiUpdateEntropySize(evt); } );
        this.setEventHandler( WORD_COUNT_SELECT_ID,     'change',   
		    async (evt) => { if (this.cb_enabled) await this.onGuiUpdateWordCount(evt); } );
		this.setEventHandler( LANG_SELECT_ID,           'change',   
		    async (evt) => { if (this.cb_enabled) await this.onGuiUpdateLang(evt); } );	

		// -------------------- Password --------------------
		this.setEventHandler( PASSWORD_ID, 'keyup',   
		    (evt) => { this.onGuiChangePassword(); } );

		this.setEventHandler( APPLY_PASSWORD_BTN_ID, 'click',   
		    async (evt) => { if (this.cb_enabled) await this.GuiApplyPassword(); } );
	
		this.setEventHandler( GENERATE_PASSWORD_BTN_ID, 'click',   
		    async (evt) => { if (this.cb_enabled) await this.GuiGeneratePassword(); } );
			
		this.setEventHandler( CLEAR_PASSWORD_BTN_ID, 'click',   
		    async (evt) => { if (this.cb_enabled) await this.GuiClearPassword(); } );

		this.setEventHandler( EYE_BTN_ID, 'click',   
		    (evt) => { if (this.cb_enabled) this.GuiTogglePasswordVisibility(); } );
		// -------------------- Password			
		
		this.setEventHandler( WALLET_MODE_SELECT_ID,    'change',   
		    async (evt) => { if (this.cb_enabled) await this.onGuiSwitchWalletMode(evt); } );
			
		this.setEventHandler( WALLET_BLOCKCHAIN_ID,     'change',   
		    async (evt) => { if (this.cb_enabled) await this.onGuiUpdateBlockchain(evt); } );
			
		this.setEventHandler( PK_COPY_BTN_ID, 'click',    
		    (evt) => { if (this.cb_enabled) this.onCopyButton(PK_COPY_BTN_ID); } );
		
		this.setEventHandler( MNEMONICS_ID,             'paste',    
		    async (evt) => { if (this.cb_enabled) await this.onMnemonicsPaste(evt); } );
		this.setEventHandler( MNEMONICS_4LETTER_ID,     'focus',    
		    (evt) => { if (this.cb_enabled) this.onGuiFocus(evt); } );
		this.setEventHandler( MNEMONICS_COPY_BTN_ID,    'click',    
		    (evt) => { if (this.cb_enabled) this.onCopyButton(MNEMONICS_COPY_BTN_ID); } );
		this.setEventHandler( SW_MNEMONICS_COPY_BTN_ID, 'click',    
		    (evt) => { if (this.cb_enabled) this.onCopyButton(SW_MNEMONICS_COPY_BTN_ID); } );
		
		this.setEventHandler( SW_WIF_COPY_BTN_ID,       'click',    
		    (evt) => { if (this.cb_enabled) this.onCopyButton(SW_WIF_COPY_BTN_ID); } );
		
		//this.setEventHandler( WORD_INDEXES_BASE_ID,     'change',   async (evt) => { await this.updateWordIndexes(); } );			
				
		this.setEventHandler( RANDOM_BTN_ID,            'click',    
		    async (evt) => { if (this.cb_enabled) await this.generateRandomFields(); } );				
		this.setEventHandler( REFRESH_BTN_ID,           'click',    
		    async (evt) => { if (this.cb_enabled) await this.onRefreshButton(); } );
		
		this.setEventHandler( ACCOUNT_ID,               'keypress', 
		    async (evt) => { if (this.cb_enabled) await this.onBIP32FieldKeypress(evt); } );
		this.setEventHandler( ADDRESS_INDEX_ID,         'keypress', 
		    async (evt) => { if (this.cb_enabled) await this.onBIP32FieldKeypress(evt); } );
									 
        //trigger_event( HtmlUtils.GetNode( RANDOM_BTN_ID ), 'click' );
	} // registerCallbacks()
	
	async propagateFields( entropy ) {
		trace2Main( pretty_func_header_format( "RendererGUI.propagateFields", entropy ) );

        this.cb_enabled	= false; 	
		
		if ( entropy == undefined ) {			
			entropy = getRandomHexValue( this.entropy_expected_bytes );
			trace2Main( pretty_format( "entropy UNDEFINED >> Generate Random Entropy", entropy ) );
		}	
		
		trace2Main( pretty_format( "rGUI.propF> CMD", this.wallet_info.getAttribute(CMD) ) );
		if ( this.wallet_info.getAttribute(CMD) == CMD_OPEN_WALLET || this.entropy_source_is_user_input ) { 
		    this.setEntropySourceIsUserInput( true );			
		}
		else {
			this.setEntropySourceIsUserInput( false );	
			await this.generateSalt();	
		}
		
		if ( this.wallet_info.getAttribute(CMD) != CMD_OPEN_WALLET ) { 
			await this.updateEntropy( entropy ); 	
			await this.updateMnemonics( entropy );
        }
		
		// trace2Main( pretty_func_header_format( "<END> RendererGUI.propagateFields", entropy ) );
		
        this.cb_enabled	= true;		
	} // async propagateFields()
	
	
	// ============================================================================================
	// ====================================      Updates      =====================================
	// ============================================================================================
	// Note: Wallet manahgers: Guarda, Yoroi, Phantom Wallet
	updateFieldsVisibility() {
		// ============== SIMPLE WALLET ==============
		//                            PK    WIF   MNK
		// SPEC OK                   ----------------- 
		//  *   *   BTC, DOGE, LTC :  X      X     X
		//  *   *   ETH            :  X      -     X 
		//  *   *   AVA            :  X      -     X
		//  *   *   SOL            :  X      X     X
		//
		// ================ HD WALLET ================
		//                            PK    WIF   MNK
		// SPEC OK                   ----------------- 
		//  *   *   BTC, DOGE, LTC :  -      X     -
		//  *   *   ETH            :  X      -     -
		//  *   *   AVA            :  X      -     -
		//  *   *   SOL            :  X      -     -  NB: validated with "Phantom Wallet"
		//  *   *   ADA            :  -      -     X  NB: validated with "Guarda" and "Yoroi"
		//                                                24 words 'account' and 'address_index' hard-coded to 0                                           
		//  *   *   XRP            :  -      X     -
		//  *   *   TRON           :  -      X     -
		//  *   *   BITCOIN CASH   :  -      X     - 
		//  *   *   DASH           :  -      X     - 
		//  *   *   FIRO           :  -      X     -  
		
		// trace2Main( pretty_func_header_format( "RendererGUI.updateFieldsVisibility" ) );
		HtmlUtils.HideNode( TR_SW_MNEMONICS_ID );
		
		let wallet_mode = this.wallet_info.getAttribute(WALLET_MODE);
		let blockchain  = this.wallet_info.getAttribute(BLOCKCHAIN);
		
		HtmlUtils.HideNode( TR_PRIV_KEY_ID );
		HtmlUtils.HideNode( TR_1ST_PK_ID );		
		
		if ( wallet_mode == SIMPLE_WALLET_TYPE ) {			
			HtmlUtils.ShowNode( SW_ENTROPY_SIZE_ID );
			
			HtmlUtils.ShowNode( WORD_COUNT_SELECT_ID );
			HtmlUtils.ShowNode( SW_WORD_COUNT_ID );

			HtmlUtils.ShowNode( TR_SW_MNEMONICS_ID );
			
			HtmlUtils.HideNode( PASSWORD_ROW_ID );
			
			HtmlUtils.HideNode( ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideNode( WORD_COUNT_SELECT_ID );
			HtmlUtils.HideNode( DERIVATION_PATH_ROW );
			
			// HtmlUtils.ShowNode( TR_PRIV_KEY_ID );
		    HtmlUtils.ShowNode( TR_1ST_PK_ID );	
		}
		else if ( wallet_mode == HD_WALLET_TYPE  || wallet_mode == SWORD_WALLET_TYPE ) {
            HtmlUtils.ShowNode( PASSWORD_ROW_ID );
			
			HtmlUtils.ShowNode( ENTROPY_SIZE_SELECT_ID );

			if ( wallet_mode == HD_WALLET_TYPE )
				HtmlUtils.ShowNode( DERIVATION_PATH_ROW );
			else if ( wallet_mode == SWORD_WALLET_TYPE ) {
				HtmlUtils.HideNode( PASSWORD_ROW_ID );
				HtmlUtils.HideNode( DERIVATION_PATH_ROW );
			}
			HtmlUtils.ShowNode( TR_WIF_ID );
			
			HtmlUtils.HideNode( TR_SW_MNEMONICS_ID );
			
			HtmlUtils.HideNode( SW_ENTROPY_SIZE_ID);
			
			HtmlUtils.HideNode( WORD_COUNT_SELECT_ID );
			HtmlUtils.HideNode( SW_WORD_COUNT_ID );  

			if ( blockchain == TRON ) {
				HtmlUtils.HideNode( TR_PRIV_KEY_ID );			
			}
			
			if ( blockchain == CARDANO ) {				
				HtmlUtils.HideNode(ACCOUNT_ID);
				HtmlUtils.HideNode(ACCOUNT_SUFFIX_ID);
				HtmlUtils.HideNode(ADDRESS_INDEX_ID);				
				
				HtmlUtils.ShowNode(ACCOUNT_READONLY_ID);
				HtmlUtils.ShowNode(ADDRESS_INDEX_READONLY_ID);
				
				HtmlUtils.ShowNode( TR_SW_MNEMONICS_ID );
			}
			else {
				HtmlUtils.ShowNode(ACCOUNT_ID);
				HtmlUtils.ShowNode(ACCOUNT_SUFFIX_ID);
				HtmlUtils.ShowNode(ADDRESS_INDEX_ID);
				
				HtmlUtils.HideNode(ACCOUNT_READONLY_ID);
				HtmlUtils.HideNode(ADDRESS_INDEX_READONLY_ID);			
			}
			// HtmlUtils.HideNode( TR_1ST_PK_ID );	
            HtmlUtils.HideNode( TR_PRIV_KEY_ID );

			if ( blockchain == RIPPLE ) {
				HtmlUtils.ShowNode( TR_1ST_PK_ID );			
		    }

            if (   blockchain == ETHEREUM || blockchain == AVALANCHE
                || blockchain == SOLANA	) { 
				HtmlUtils.ShowNode( TR_1ST_PK_ID );
				// HtmlUtils.ShowNode( TR_PRIV_KEY_ID );
			}			
		}	

		// ------------------- WIF --------------------
		let wif = this.wallet_info.getAttribute(WIF);
		if (   ( wallet_mode == HD_WALLET_TYPE ||  wallet_mode == SWORD_WALLET_TYPE )
			&& blockchain == SOLANA) {  
			HtmlUtils.HideNode( TR_WIF_ID );
		}
		else { 
			if (    wif != undefined  &&  wif != "" 
				&& blockchain != ETHEREUM  &&  blockchain != AVALANCHE ) {
				HtmlUtils.ShowNode( TR_WIF_ID );
			}	
			else {
				HtmlUtils.HideNode( TR_WIF_ID );
			}
		}
		// ------------------- WIF
		
		
		// ------------------- Entropy Source -------------------
		if ( this.entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE) {
			HtmlUtils.ShowNode( ENTROPY_SRC_FORTUNES_ID );
			HtmlUtils.HideNode( ENTROPY_SRC_IMG_CONTAINER_ID );
		}
		else if ( this.entropy_source_type == IMAGE_ENTROPY_SRC_TYPE) {
			HtmlUtils.ShowNode( ENTROPY_SRC_IMG_CONTAINER_ID );
			HtmlUtils.HideNode( ENTROPY_SRC_FORTUNES_ID );
		}
		// ------------------- Entropy Source
		
		let is_user_input = this.entropy_source_is_user_input;
		//this.updateStatusbarInfo( is_user_input );
		if ( is_user_input ) {
			HtmlUtils.HideNode( ENTROPY_SRC_ROW );
			HtmlUtils.HideNode( TR_SALT_ID );	
			HtmlUtils.HideNode( ENTROPY_SIZE_SELECT_ID );
			HtmlUtils.HideNode( WORD_COUNT_SELECT_ID );	
		}
		else {
			HtmlUtils.ShowNode( ENTROPY_SRC_ROW );
			HtmlUtils.ShowNode( TR_SALT_ID );	
			
			// trace2Main( pretty_format( "rGUI.upFieldVisib> is_user_input", is_user_input ) );
            if ( this.wallet_info.getAttribute(WALLET_MODE) == HD_WALLET_TYPE ) {				
				HtmlUtils.ShowNode( ENTROPY_SIZE_SELECT_ID );
				HtmlUtils.ShowNode( WORD_COUNT_SELECT_ID );
			}			
		}
	} // updateFieldsVisibility()
	
	async updateFields( entropy ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateFields", entropy ) );
		
		this.cb_enabled	= false; 
		
		//trace2Main("   this.entropy_source_type: " + this.entropy_source_type);
		//trace2Main( pretty_format( "rGUI.updFields> entropy", entropy ) );
		
		trace2Main( pretty_format( "rGUI.upFields> wallet[ENTROPY]", this.wallet_info.getAttribute(ENTROPY) ) );
		if ( entropy == undefined ) { 
			entropy = this.wallet_info.getAttribute(ENTROPY);
			this.wallet_info.setAttribute(ENTROPY, entropy); // to update GUI 
		}
		// trace2Main( pretty_format( "rGUI.upFields> entropy", entropy ) );
		
		//let entropy_elt = HtmlUtils.GetNode( ENTROPY_ID ); 
		
		this.setRefreshCmdState( false );
		
		// trace2Main( pretty_format( "entropy_source_is_user_input", this.entropy_source_is_user_input ) );
		trace2Main( pretty_format( "rGUI.upFields> CMD", this.wallet_info.getAttribute(CMD))  );	
		
        if (  this.wallet_info.getAttribute(CMD) == CMD_OPEN_WALLET || this.entropy_source_is_user_input ) {
			trace2Main( pretty_format( "rGUI.upFields> entropy_source *IS* user_input", "")  );	
			await this.propagateFields( entropy );
		}
		else {	
            trace2Main( pretty_format( "rGUI.upFields> entropy_source *IS NOT* user_input", "")  );			
			//trace2Main("   expected_entropy_bytes:  " + this.expected_entropy_bytes);
			
			let salted_entropy_src_str = await this.getSaltedEntropySource();
			//trace2Main( pretty_format( "Salted Entropy", getShortenedString( salted_entropy_src_str ) ) );			
			
			if ( salted_entropy_src_str.length > 0 ) {
				const options = { [LANG]: "EN", [WORD_COUNT]: this.wallet_info.getAttribute(WORD_COUNT) };
				const data    = { salted_entropy_src_str, options };
				
				entropy = await window.ipcMain.EntropySourceToEntropy( data );
				
				trace2Main( pretty_format( "rGUI.upFields> entropy", entropy ) );

                this.wallet_info.setAttribute( ENTROPY, entropy );
				await this.propagateFields( entropy );
				//await this.propagateFields(entropy_elt.value, wif);
			}                                                          
			//else if ( entropy_elt.value.length == expected_entropy_hex_digits ) {
			//	await this.propagateFields( entropy_value );
			//}
		}
		
		HtmlUtils.SetNodeValue( SB_MSG_ID, "" );
		trace2Main( pretty_func_header_format( "<END> RendererGUI.updateFields", entropy ) );

		this.cb_enabled	= true; 		
	} // updateFields()
	
	async updateWalletMode( wallet_mode ) {
		trace2Main( pretty_func_header_format("RendererGUI.updateWalletMode") );
		
		this.cb_enabled	= false; 
		
		if ( wallet_mode != undefined ) {			
			this.Options[WALLET_MODE] = wallet_mode;
		}
		else {
			wallet_mode = this.Options[WALLET_MODE];
		}
        trace2Main( pretty_format( "rGUI.upWmode> wallet_mode", wallet_mode) );		
        
        let blockchain = HtmlUtils.GetNodeValue( WALLET_BLOCKCHAIN_ID ); 

		if ( wallet_mode == SIMPLE_WALLET_TYPE ) { 
			this.Options[ENTROPY_SIZE][SIMPLE_WALLET_TYPE] = 256;		
		}
		
		HtmlUtils.InitializeNode( WALLET_BLOCKCHAIN_ID, 
			                      this.Options['Blockchains'][wallet_mode],
				                  this.Options['Blockchains'][wallet_mode] );
								  
		let default_blockchain = this.Options[DEFAULT_BLOCKCHAIN][wallet_mode];
		trace2Main( pretty_format( "rGUI.upWmode> default_blockchain", default_blockchain ) );

        this.wallet_info.setAttribute( WALLET_MODE, wallet_mode );
        this.wallet_info.setAttribute( BLOCKCHAIN,  default_blockchain ); 

        this.updateFieldsVisibility(); 		
		// HtmlUtils.SetNodeValue( WALLET_BLOCKCHAIN_ID, default_blockchain);	

		// ---------- Update Window Title ----------
		let coin = COIN_ABBREVIATIONS[default_blockchain];
		let data = { coin, wallet_mode };
		window.ipcMain.SetWindowTitle( data );
		// ---------- Update Window Title	
		
		this.updateFieldsVisibility();

		this.cb_enabled	= true; 
        // trace2Main( pretty_func_header_format( "<END> RendererGUI.updateWalletMode" ) );		
	} // async updateWalletMode()

	async updateBlockchain( blockchain ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateBlockchain", blockchain ) );
		
		if ( blockchain == undefined ) {
			blockchain = this.wallet_info.getAttribute( BLOCKCHAIN );
		}
		
		let entropy_hex = this.wallet_info.getAttribute( ENTROPY );
		let wallet_mode = this.wallet_info.getAttribute( WALLET_MODE );
		
		trace2Main( pretty_format( "rGUI.upBlkCHN> wallet_mode", wallet_mode ) );
		trace2Main( pretty_format( "rGUI.upBlkCHN> CMD", this.wallet_info.getAttribute(CMD) ) );
		
		let wallet = {};
		if ( this.wallet_info.getAttribute( CMD ) != CMD_OPEN_WALLET ) {
			if ( wallet_mode == SIMPLE_WALLET_TYPE )  {
				wallet = await this.generateSimpleWalletAddress( blockchain, entropy_hex );
			}
			else if ( wallet_mode == HD_WALLET_TYPE || wallet_mode == SWORD_WALLET_TYPE ) {
				wallet = await this.generateHDWalletAddress( blockchain, entropy_hex );
			}
		}
		
		this.wallet_info.setAttribute( ACCOUNT,       0 );
		this.wallet_info.setAttribute( ADDRESS_INDEX, 0 );
		
		this.wallet_info.setAttribute( WIF, wallet[WIF] );
		trace2Main( pretty_format( "rGUI.upBlkCHN> WIF", wallet[WIF] ) );
		
		// ---------- Update Window Title ----------
		let coin = COIN_ABBREVIATIONS[blockchain];
		let data = { coin, wallet_mode };
		window.ipcMain.SetWindowTitle( data );
		// ---------- Update Window Title
		
		trace2Main( pretty_format( "rGUI.upBlkCHN> coin", coin ) );
		HtmlUtils.SetNodeValue( WALLET_COIN_ID, coin );
		
		let wallet_address =  this.wallet_info.getAttribute( ADDRESS );		
		trace2Main( pretty_format( "rGUI.upBlkCHN> wallet_address", wallet_address ) );

        this.updateWalletURL( blockchain, wallet_address );
		
		this.updateFieldsVisibility();
	} // updateBlockchain()	
	
	async updateOptionsFields( options_data ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateOptionsFields" ) );
		
		this.cb_enabled	= false; 
		
		if ( options_data == undefined ) {
			trace2Main("   " + _RED_ + "**ERROR** options_data: " + options_data + _END_);
			await window.ipcMain.QuitApp();
		}
		
		//trace2Main("   *!!* options_data: " + JSON.stringify(options_data));

        this.wallet_info.setOptions( options_data );		
		
		let wallet_mode = options_data[WALLET_MODE];
		trace2Main( pretty_format( "rGUI.upOpt> wallet_mode", wallet_mode ) );
		
		let default_blockchain = options_data[DEFAULT_BLOCKCHAIN][wallet_mode];
		trace2Main( pretty_format( "rGUI.upOpt> default_blockchain", default_blockchain ) );
		HtmlUtils.SetNodeValue( WALLET_BLOCKCHAIN_ID, default_blockchain );	
		
		HtmlUtils.SetNodeValue( WALLET_COIN_ID, COIN_ABBREVIATIONS[default_blockchain] );

		await this.updateWalletMode( wallet_mode );

		let entropy_size = options_data[ENTROPY_SIZE][wallet_mode];
		trace2Main( pretty_format( "rGUI.upOpt> entropy_size", entropy_size ) );
        await this.updateEntropySize( entropy_size );	
		
        this.cb_enabled	= true; 		
	} // async updateOptionsFields()
	
	async updateWalletAddress() {
        trace2Main( pretty_func_header_format( "RendererGUI.updateWalletAddress" ) );		
							
		let entropy = HtmlUtils.GetNodeValue( ENTROPY_ID );
		trace2Main( pretty_format( "rGUI.upWadr> entropy", entropy ) );	
		
		let password = HtmlUtils.GetNodeValue( PASSWORD_ID ); 
		this.wallet_info.setAttribute( PASSWORD, password );
		
		let account = parseInt( HtmlUtils.GetNodeValue( ACCOUNT_ID ) );
		this.wallet_info.setAttribute( ACCOUNT, account );
		// trace2Main( pretty_format( "rGUI.uWadr> account", account ) );
		
		let address_index = parseInt( HtmlUtils.GetNodeValue( ADDRESS_INDEX_ID ) );
		this.wallet_info.setAttribute( ADDRESS_INDEX, address_index );
		trace2Main( pretty_format( "rGUI.uWadr> address_index", address_index) );
		
		this.setEntropySourceIsUserInput( true );
		// this.updateStatusbarInfo( true );
		
		await this.updateFields( entropy );	
    } // updateWalletAddress()
	
	updateStatusbarInfo( is_displayed ) {
		trace2Main( pretty_format( "RendererGUI.updateStatusbarInfo" ) );
		let entropy = this.wallet_info.getAttribute(ENTROPY);
		if ( is_displayed ) {		
			let msg =   "*Warning* Entropy source is User Input"
					  + "  |  Entropy value length: " + entropy.length
				 	  + "  expected digits: " + this.wallet_info.getAttribute(EXPECTED_ENTROPY_DIGITS);		
			HtmlUtils.SetNodeValue( "SB_item_message_id", msg );
		}
		else {
			HtmlUtils.SetNodeValue( "SB_item_message_id", "" );   
		}
	} // updateStatusbarInfo	
	
	async updatePassword( password ) {
		trace2Main( "===== rGUI.upPW ===============================================================" );
		trace2Main( pretty_func_header_format( "RendererGUI.updatePassword", password ) );
		await this.updateEntropy( this.wallet_info.getAttribute( ENTROPY ) ); 
	}  // async updatePassword()
	
	async updateEntropy( entropy_hex ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateEntropy", entropy_hex ) );		
		
		// this.cb_enabled = false;
		
		this.wallet_info.setAttribute( ENTROPY, entropy_hex );
		
		this.setEntropyValueValidity( true ); 
		
		let blockchain = this.wallet_info.getAttribute(BLOCKCHAIN);
        trace2Main( pretty_format( "rGUI.upE> blockchain: ", blockchain ) );		

        await this.updateMnemonics( entropy_hex ); 
		await this.updateChecksum( entropy_hex );
		
		let wallet_mode = this.wallet_info.getAttribute( WALLET_MODE );

		let wallet = {};
		trace2Main( pretty_format( "rGUI.upE> entropy_hex", entropy_hex ) );
		trace2Main( pretty_format( "rGUI.upE> wallet_mode", wallet_mode ) );
		trace2Main( pretty_format( "rGUI.upE> wallet_info[CMD]", this.wallet_info.getAttribute(CMD) ) );
		
		if ( this.wallet_info.getAttribute( CMD ) != CMD_OPEN_WALLET ) {
			if ( wallet_mode == SIMPLE_WALLET_TYPE ) {
				wallet = await this.generateSimpleWalletAddress( blockchain, entropy_hex );
			}
			else if ( wallet_mode == HD_WALLET_TYPE || wallet_mode == SWORD_WALLET_TYPE ) {
				wallet = await this.generateHDWalletAddress( blockchain, entropy_hex );
			}
		}		

		// trace2Main( pretty_func_header_format( "<END> RendererGUI.updateEntropy", entropy_hex ) );
	} // updateEntropy()
	
	async updateEntropySize( entropy_size ) {		
		trace2Main( pretty_func_header_format( "RendererGUI.updateEntropySize", entropy_size + " bits") );
		
		this.cb_enabled = false;
		
		if ( isString( entropy_size ) ) {
			entropy_size = parseInt( entropy_size );
		}
		
		let word_count = getWordCount( entropy_size );
		this.wallet_info.setAttribute( WORD_COUNT, word_count );
			
		this.expected_entropy_bytes  = entropy_size / 8;
		// trace2Main( pretty_format("rGUI.upEsz> expected_entropy_bytes", this.expected_entropy_bytes ) );
		
		let expected_entropy_digits = this.expected_entropy_bytes * 2; 
		// trace2Main( pretty_format("rGUI.upEsz> expected_entropy_digits", expected_entropy_digits ) );
		this.wallet_info.setAttribute( EXPECTED_ENTROPY_DIGITS, expected_entropy_digits );
		
		this.wallet_info.setAttribute( ENTROPY_SIZE, entropy_size );
		
		trace2Main( pretty_format("rGUI.upEsz> entropy_size", entropy_size ) );
		// trace2Main( pretty_format("rGUI.uEsz> isNumber(entropy_size)", valueIsNumber( entropy_size) ) );
		
		if ( ! valueIsNumber( entropy_size) ) {
			trace2Main( pretty_format("rGUI.uEsz> 'entropy_size' is UNDEFINED" ) );
			GuiUtils.ShowQuestionDialog( "'entropy_size' is UNDEFINED", 
					                     {"CloseButtonLabel": "OK", "BackgroundColor": "#FFCCCB" } );
		    return;								 
		}			
		
		let entropy_elt = HtmlUtils.GetNode( ENTROPY_ID );
		trace2Main( pretty_format( "rGUI.upEsz> entropy_elt", entropy_elt.id ) );
		entropy_elt.setAttribute( "minlength", this.wallet_info.getAttribute( EXPECTED_ENTROPY_DIGITS ) );
		entropy_elt.setAttribute( "maxlength", this.wallet_info.getAttribute( EXPECTED_ENTROPY_DIGITS ) );
		
		await this.updateFields();
		
		let wallet_mode = this.Options[WALLET_MODE];
		
		this.Options[ENTROPY_SIZE][wallet_mode] = entropy_size;
		
		this.cb_enabled = true; 
	} // async updateEntropySize()
	
	updateWalletURL( blockchain, wallet_address ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateWalletURL" ) );
		
		let explorer_URL = MAINNET_EXPLORER_URLs[blockchain] + wallet_address;
		// trace2Main("   " + _YELLOW_ + "explorer_URL:           " + _END_ + explorer_URL);
		
		let wallet_URL_elt = HtmlUtils.GetNode( WALLET_URL_LINK_ID );
		//trace2Main("   wallet_URL_elt: " + wallet_URL_elt);
		if ( wallet_URL_elt != undefined ) {
			wallet_URL_elt.href = explorer_URL;
		}
	} // updateWalletURL()
	
	updateWIF( blockchain, wif ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateWIF", "WIF:" + wif ) );
		
		if (wif != "") this.wallet_info.setAttribute(WIF, wif);   
		this.updateFieldsVisibility();
	} // updateWIF()
		
	updatePrivateKey( blockchain, PRIV_KEY ) {
		if (      (   blockchain == BITCOIN 
		           || blockchain == DOGECOIN || blockchain == LITECOIN
		           || blockchain == ETHEREUM || blockchain == AVALANCHE 
				   || blockchain == RIPPLE   || blockchain == BITCOIN_CASH 
				   || blockchain == DASH     || blockchain == FIRO || blockchain == ZCASH  )
  		      &&  PRIV_KEY != undefined && PRIV_KEY != "") {
			
			if (   blockchain == BITCOIN 
			    || blockchain == DOGECOIN || blockchain == LITECOIN ) {
				HtmlUtils.SetNodeValue( PRIV_KEY_LABEL_ID, "*WIF*");
			}
			else if ( blockchain == RIPPLE || blockchain == TRON ) {
				HtmlUtils.SetNodeValue( PRIV_KEY_LABEL_ID, "*Private Key*");	
			}
			else if ( blockchain == FIRO ) {
				HtmlUtils.SetNodeValue( PRIV_KEY_LABEL_ID, "*Private Key (B58)*");
			}
		}
		else {
			HtmlUtils.SetNodeValue( PRIV_KEY_ID, "XX" );
		}
		
		this.updateFieldsVisibility();
	} // updatePrivateKey()
	
	async updateChecksum( entropy ) {
		// this.cb_enabled = false;
		
		const options = { [WORD_COUNT]: this.wallet_info.getAttribute(WORD_COUNT) }; 
		const data = { entropy, options }; 
		let checksum = await window.ipcMain.EntropyToChecksum( data );
		trace2Main(  pretty_func_header_format( "RendererGUI.updateChecksum", checksum ) );
		this.wallet_info.setAttribute( CHECKSUM, checksum );
	} // updateChecksum()
	
	async updateMnemonics( entropy ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateMnemonics" ) );
		
		// this.cb_enabled = false;
		
		let lang = this.wallet_info.getAttribute( LANG ); 
		
		let data = { entropy, lang };
		let mnemonics = await window.ipcMain.EntropyToMnemonics( data );
		
        this.wallet_info.setAttribute( MNEMONICS, mnemonics );	

		if (this.wallet_info.getAttribute('lang') == "JP") {
			let mnemonics_jp = mnemonics.replaceAll(' ', '\u3000');
			// let mnemonics_jp = mnemonics.replaceAll(' ', '*');
			HtmlUtils.SetNodeValue( SW_MNEMONICS_ID, mnemonics_jp );
		}
		else {		
			HtmlUtils.SetNodeValue( SW_MNEMONICS_ID, mnemonics );		
		}
		let mnemonics_as_4letter = await window.ipcMain.MnemonicsAs4letter( mnemonics );
		HtmlUtils.SetNodeValue( MNEMONICS_4LETTER_ID, mnemonics_as_4letter );

		await this.updateWordIndexes();		
    } // async updateMnemonics()
	
	async updateLanguage( lang ) {
		trace2Main( pretty_func_header_format( "RendererGUI.updateLanguage", "lang: '" + lang + "'" ) );
		
		// this.cb_enabled = false;
		
		this.wallet_info.setAttribute( LANG, lang );
		
		// let entropy = HtmlUtils.GetNodeValue( ENTROPY_ID );
		// trace2Main( pretty_format( "rGUI.upLang> entropy(gui)", entropy ) );
		
		let entropy = this.wallet_info.getAttribute(ENTROPY);
		// trace2Main( pretty_format( "rGUI.upLang> entropy(wallet)", entropy ) );
		
        await this.updateMnemonics( entropy );
	} // async updateLanguage()
	
	async updateWordIndexes() {
		// trace2Main( pretty_func_header_format( "RendererGUI.updateWordIndexes" ) );
		
		// this.cb_enabled = false;
		
		let mnemonics = this.wallet_info.getAttribute( MNEMONICS );
        let mnemonics_items = await window.ipcMain.MnemonicsAsTwoParts( mnemonics );		
		trace2Main( pretty_format( "rGUI.upWidx> mnemonics", mnemonics_items[0] ) );
		if ( mnemonics_items[1].length > 0 ) {	
            trace2Main( pretty_format( "", mnemonics_items[1] ) );			
		}
		
		let lang = this.wallet_info.getAttribute(LANG);
		// trace2Main( pretty_format( "rGUI.upWidx> lang", lang ) );	

        let word_indexes_str = await this.mnemonicsToWordIndexes( mnemonics, lang );		
		HtmlUtils.SetNodeValue( WORD_INDEXES_ID, word_indexes_str ) ;
    } // updateWordIndexes()
	// =======================================================
	// ====================================      Updates      
	// =======================================================
	
	async getSaltedEntropySource() {
		let entropy_source = HtmlUtils.GetNodeValue( ENTROPY_SRC_TYPE_SELECTOR_ID );
		trace2Main( pretty_func_header_format( "RendererGUI.getSaltedEntropySource",  entropy_source ) );	 
		
		let new_uuid = await window.ipcMain.GetUUID();
		let salt_elt = HtmlUtils.GetNode( SALT_ID );
		salt_elt.textContent = new_uuid;		
		
		let entropy_src_value = "";
		if ( entropy_source == FORTUNES_ENTROPY_SRC_TYPE ) {
			entropy_src_value = HtmlUtils.GetNodeValue( ENTROPY_SRC_FORTUNES_ID );
		}	
		else if ( entropy_source == IMAGE_ENTROPY_SRC_TYPE ) {
		    entropy_src_value = this.img_data_asURL;
		}
		
		trace2Main( pretty_format( "rGUI.saltE> entropy_src_value", getShortenedString( entropy_src_value ) ) );
		
		let salt               = salt_elt.textContent;				
		let salted_entropy_src = salt + entropy_src_value;
                                                        
		return salted_entropy_src;	
	} // getSaltedEntropySource()
	
	async generateSalt( force_generation ) {
		trace2Main( pretty_func_header_format( "RendererGUI.generateSalt" ) );
		let entropy_src_elt = HtmlUtils.GetNode( ENTROPY_SRC_FORTUNES_ID );
		let new_uuid = "";
		if ( entropy_src_elt.value != "" || force_generation == true ) {
			new_uuid = await window.ipcMain.GetUUID();
			//HtmlUtils.SetNodeValue(SALT_ID, new_uuid);
			//let salt_elt = HtmlUtils.GetNode( SALT_ID );
			//salt_elt.textContent = new_uuid;
			HtmlUtils.SetNodeValue(SALT_ID, new_uuid);
        }
		return new_uuid;
    } // async generateSalt()
	
	async generateRandomFields() {
		trace2Main( pretty_func_header_format( "RendererGUI.generateRandomFields" ) );	
		await this.drawEntropySource();
	} // generateRandomFields()
	
	async drawEntropySource() {
		trace2Main( pretty_func_header_format( "RendererGUI.drawEntropySource" ) );

		this.setEntropySourceIsUserInput( false );
		
		let entropy_source_type = HtmlUtils.GetNodeValue( ENTROPY_SRC_TYPE_SELECTOR_ID );
		trace2Main( pretty_format( "entropy_source_type", entropy_source_type ) );
		
		if ( entropy_source_type == FORTUNES_ENTROPY_SRC_TYPE ) {
			let fortune_cookie = await window.ipcMain.GetFortuneCookie();
			HtmlUtils.SetNodeValue( ENTROPY_SRC_FORTUNES_ID, fortune_cookie );
			trace2Main(">> drawEntropySource fortune_cookie: " + fortune_cookie);
		}
		else if ( entropy_source_type == IMAGE_ENTROPY_SRC_TYPE ) {
			// Draw image in "www/img/CryptoCurrency" folder
			this.img_data_asURL = await window.ipcMain.DrawRandomCryptoLogo();
		}
		
		await this.updateFields();
		
		//this.setFocus( ENTROPY_ID );
	} // drawEntropySource()
	
	clearFields( field_ids ) {
		trace2Main( pretty_func_header_format( "RendererGUI.clearFields" ) );
		for ( let i=0; i < field_ids.length; i++ ) { 
			let field_id = field_ids[i];
			
			HtmlUtils.SetNode( field_id, NULL_VALUE );
			
			elt.classList.remove( WITH_FOCUS_CSS_CLASS ); 
			elt.classList.add( WITHOUT_FOCUS_CSS_CLASS ); 
		}
	} // clearFields()
	
	// =============================================================================================
	// ====================================   Event Handlers   =====================================
	// =============================================================================================
	async onGUIEvent( data ) {
		let event_name = data[0];	
		//trace2Main( pretty_func_header_format( "RendererGUI.onGUIEvent", event_name ) );
	
		let description_data = "";
		let json_data        = {};
		let wits_json_data   = {};
		let cmd_name         = "";
				
		switch ( event_name ) {
			case FromMain_DID_FINISH_LOAD:
				trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_DID_FINISH_LOAD + _END_ );
				await this.didFinishLoadInit();	
				break;					

			case FromMain_UPDATE_OPTIONS:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_UPDATE_OPTIONS + _END_ );	
				this.Options = data[1];	
                //trace2Main("   >> this.Options: " + JSON.stringify(this.Options));
				
                await this.updateOptionsFields( this.Options );	
				if ( this.new_cmd_count == 0 ) {
					await this.newWallet( this.Options );
				}				
				break;

            case FromMain_SET_VARIABLE: 
                trace2Main( ON_GUI_EVENT_LOG_PREFIX + _RED_ + FromMain_SET_VARIABLE + _END_ );	
                trace2Main( pretty_format("rGUI.onGUI>  data.length", data.length) );
                trace2Main( pretty_format("rGUI.onGUI>  data", JSON.stringify(data)) );				
                let variable_name  = ( data.length > 1 ) ? data[1] : "";				
				let variable_value = ( data.length > 2 ) ? data[2] : "";
				
				trace2Main(pretty_format("rGUI.onGUI>  SET VARIABLE(" + variable_name + ")", variable_value));
				trace2Main( pretty_format("variable_name", variable_name));				
				
				switch ( variable_name ) {
					case APP_VERSION: 
					    trace2Main( pretty_format( "rGUI.onGUI>  cryptowallet_version", variable_value) );
						RendererSession.SetValue( CRYPTOWALLET_VERSION, variable_value );
						break;
						
					case WITS_PATH: 
					    trace2Main( pretty_format( "rGUI.onGUI>  wits_path", variable_value) );
						this.wits_path = variable_value;
						break;
				}            				
				break;
				
			// Note: File/New: ElectronMain.GetInstance().doFileNew() => ElectronMain.GetInstance().loadOptions()
			case FromMain_FILE_NEW:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_FILE_NEW + _END_ );
                json_data = data[1];
				//trace2Main( pretty_format( "rGUI.FILE_NEW> json_data", JSON.stringify(json_data) ) );
                await this.newWallet( json_data );				
				break;
				
			case FromMain_EXEC_CMD:
				trace2Main( ON_GUI_EVENT_LOG_PREFIX + _RED_ + FromMain_EXEC_CMD + _END_ );
				if ( data.length > 0 )  cmd_name       = data[1];
				if ( data.length > 1 )  wits_json_data = data[2];
				trace2Main( "   >> cmd: " +  cmd_name );
				trace2Main( "   >> wits_json_data: " +  JSON.stringify(wits_json_data) );
				if ( cmd_name == CMD_OPEN_WALLET ) {
					await this.openWallet( wits_json_data );		
				}				 
				break;				
				
			case FromMain_FILE_OPEN:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _GREEN_ + FromMain_FILE_OPEN + _END_ );
                json_data = data[1];
				//trace2Main( pretty_format( "rGUI.FILE_OPEN> json_data", JSON.stringify(json_data) ) );
                await this.openWallet( json_data );				
				break;
	
			case FromMain_FILE_SAVE:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_FILE_SAVE + _END_ );	
				let crypto_info = await this.getWalletInfo();
                window.ipcMain.SaveWalletInfo( crypto_info );
				this.showSaveWalletInfoDialog();				
				break;				
				
			case FromMain_SEND_IMG_URL:
				trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SEND_IMG_URL + _END_ );			
				let img_elt_id = data[1];
				// trace2Main("   img_elt_id:             " + img_elt_id);
				
				let img_file_extension = data[3];
				// trace2Main("   img_file_extension:     " + img_file_extension);
				
				let URL_prefix = "data:image/" + img_file_extension + ";base64, ";
				let img_data_URL = URL_prefix+ data[2]
				                   .replaceAll('\r', '').replaceAll('\n', '');
				trace2Main( pretty_format( "img_data_URL", img_data_URL.substring(0,80) ) ); 
				
				let img_elt = HtmlUtils.GetNode( img_elt_id );
				trace2Main("   img_elt: " + img_elt);
				//trace2Main("   img_elt.id: " + img_elt.id);
				img_elt.src = img_data_URL;
				
				const hashValue = val =>
					crypto.subtle
						.digest('SHA-256', new TextEncoder('utf-8').encode(val))
						.then(h => {
						    let hexes = [], view = new DataView(h);
						    for ( let i = 0; i < view.byteLength; i += 4 )
							   hexes.push( ('00000000' + view.getUint32(i).toString(16)).slice(-8) );
						    return hexes.join('');
				}); // hashValue()                

                let salt = await this.generateSalt( true );	
                trace2Main( pretty_format( "salt", salt ) ); 				
				
				// https://www.30secondsofcode.org/js/s/hash-sha-256/
				let entropy_data = await hashValue( img_data_URL + salt );
				//trace2Main("   1 entropy_data: " + entropy_data);				
				//trace2Main("   1 entropy_data length: " + entropy_data.length);
				
				this.wallet_info.setAttribute( EXPECTED_ENTROPY_DIGITS, this.expected_entropy_bytes * 2 );
				if ( this.wallet_info.getAttribute( EXPECTED_ENTROPY_DIGITS ) < 64 ) {
					entropy_data = entropy_data.substring( 0, this.wallet_info.getAttribute(EXPECTED_ENTROPY_DIGITS) );
				}	
				trace2Main( pretty_format( "rGUI.onGUI(" + FromMain_SEND_IMG_URL + ")> entropy_data", entropy_data ) );
				//trace2Main("   2 entropy_data length: " + entropy_data.length);
				this.entropy_source_is_user_input = false; // forces Salt/uuid update
				this.updateEntropy( entropy_data );	
				break;
			
            // File/Import/Random Fortune Cookie			
            case FromMain_SET_FORTUNE_COOKIE:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SET_FORTUNE_COOKIE + _END_ );
				let fortune_cookie = data[1];
				trace2Main( pretty_format( "fortune_cookie", getShortenedString( fortune_cookie ) ) );
				// HtmlUtils.SetNodeValue( ENTROPY_ID, fortune_cookie );	
				HtmlUtils.SetNodeValue( ENTROPY_SRC_FORTUNES_ID, fortune_cookie );				
				await this.updateFields();
				break;
				
			case FromMain_SHOW_MSG_DIALOG:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SHOW_MSG_DIALOG + _END_ );
				let msg = data[1];
				GuiUtils.ShowInfoDialog( msg );
				break;
				
			case FromMain_SHOW_ERROR_DIALOG:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_SHOW_ERROR_DIALOG + _END_ );
				break;
				
			case FromMain_TOOLS_OPTIONS_DIALOG:
				trace2Main( ON_GUI_EVENT_LOG_PREFIX + _RED_ + FromMain_TOOLS_OPTIONS_DIALOG + _END_ );
				let options_data = data[1];
				trace2Main( pretty_format( "$$ options_data", JSON.stringify(options_data) ) ); 
				ToolsOptionsDialog.ShowDialog( options_data );
				break;
				
			case FromMain_HELP_ABOUT:
			    trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_HELP_ABOUT + _END_ );
				let cryptowallet_version = RendererSession.GetValue( CRYPTOWALLET_VERSION );
				let i18n_msg = await window.ipcMain.GetLocalizedMsg("HelpAboutMsg");
				description_data =   "<center><b>Cryptowallet " + cryptowallet_version + "</b></center><br>" 
						           + "&nbsp;" + i18n_msg;
			    //trace2Main("   " + FromMain_HELP_ABOUT + " " + description_data);

				// https://izitoast.marcelodolza.com/
				DialogManager.Clean();
				GuiUtils.ShowInfoDialog( description_data );
				break;	
				
			case FromMain_INTERNET_CONNECTED:
			    // trace2Main( ON_GUI_EVENT_LOG_PREFIX + _YELLOW_ + FromMain_INTERNET_CONNECTED + _END_ );
				let internet_connected = data[1];
				// trace2Main( pretty_format( "Internet connected", internet_connected ) );
				
				let internet_connection_elt = HtmlUtils.GetNode(INTERNET_CONNECTION_ICON_ID);
				if ( internet_connected ) {
					internet_connection_elt.src = "icons/Aniket_Suvarna_Bx_Wifi_24_ON_Red.png";
				}
				else {
					internet_connection_elt.src = "icons/Aniket_Suvarna_Bx_Wifi_24_OFF_Green.png";
				}
			    break;
				
			default:
				trace2Main(  ON_GUI_EVENT_LOG_PREFIX
						   + _YELLOW_ + "ACK[" + event_name + "]" + _END_ + "from main");
				//DialogManager.Clean();
				break;
		} // switch ( event_name )
	} // onGUIEvent()

	onGuiChangePassword( evt ) {
		let password = HtmlUtils.GetNodeValue( PASSWORD_ID );
		// trace2Main( pretty_func_header_format( "RendererGUI.onGuiChangePassword", "'" + password + "'" ) );
		this.wallet_info.setAttribute( PASSWORD, password );

		if ( password == "") {
			this.GuiSetPasswordApplyState( false );	
		}
		else {
			this.GuiSetPasswordApplyState( true );	
		}	
	} // onGuiChangePassword()
	
	async GuiApplyPassword( evt ) {
		let password = HtmlUtils.GetNodeValue( PASSWORD_ID );
		trace2Main( pretty_func_header_format( "RendererGUI.GuiApplyPassword", password ) );
		this.wallet_info.setAttribute( PASSWORD, password );
		await this.updatePassword( password );

		this.GuiSetPasswordApplyState( false );
	} // async GuiApplyPassword()

	// https://www.npmjs.com/package/generate-password
	async GuiGeneratePassword( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.GuiGeneratePassword" ) );
		let data = {};
		let new_password = await window.ipcMain.GeneratePassword( data );
		this.wallet_info.setAttribute( PASSWORD, new_password);

		this.GuiSetPasswordApplyState( true );
	} // async GuiGeneratePassword()	
		
	GuiClearPassword( update_wallet ) {
		trace2Main( pretty_func_header_format( "RendererGUI.GuiClearPassword" ) );
		this.wallet_info.setAttribute( PASSWORD, '');

		this.GuiSetPasswordApplyState( false );	
	} // GuiClearPassword()

	GuiSetPasswordApplyState( visible ) {
		if ( visible ) {
			HtmlUtils.ShowNode(APPLY_PASSWORD_BTN_ID);
			HtmlUtils.ShowNode(APPLY_BTN_SEPARATOR_ID);
			HtmlUtils.AddClass(PASSWORD_ID, PASSWORD_WITH_APPLY_CSS_CLASS);
			HtmlUtils.RemoveClass(PASSWORD_ID, PASSWORD_WITHOUT_APPLY_CSS_CLASS);
			this.setSaveCmdState( false );
		}
		else {
			HtmlUtils.HideNode(APPLY_PASSWORD_BTN_ID);
			HtmlUtils.HideNode(APPLY_BTN_SEPARATOR_ID);
			HtmlUtils.AddClass(PASSWORD_ID, PASSWORD_WITHOUT_APPLY_CSS_CLASS);
			HtmlUtils.RemoveClass(PASSWORD_ID, PASSWORD_WITH_APPLY_CSS_CLASS);
			this.setSaveCmdState( true );
		}
	} // GuiSetPasswordApplyState()

	GuiTogglePasswordVisibility() {
		trace2Main( pretty_func_header_format( "RendererGUI.GuiTogglePasswordVisibility" ) );	
		let eye_btn_img_elt = document.getElementById(EYE_BTN_IMG_ID )
		console.log("> eye_btn_img_elt: " + eye_btn_img_elt);
		
		if ( this.password_visible ) { 
			document.getElementById(PASSWORD_ID).type = 'password';	
			
			if (eye_btn_img_elt != undefined) {
				eye_btn_img_elt.src = 'icons/' + EYE_CLOSED_ICON;	
			}
		}
		else { 	
		    document.getElementById(PASSWORD_ID).type = 'text';	

			if (eye_btn_img_elt != undefined) {
				eye_btn_img_elt.src = 'icons/' + EYE_OPEN_ICON;	
			}			
		}
		this.password_visible = ! this.password_visible;
	} // GuiTogglePasswordVisibility()
	
	async onFileNewWallet( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onFileNewWallet" ) );
        await window.ipcMain.NewWalletInfo();
	} // async onFileNewWallet()
	
	async fileOpenWallet() {
		trace2Main( pretty_func_header_format( "RendererGUI.fileOpenWallet" ) );
        let json_data = await window.ipcMain.OpenWalletInfo();
	} // async fileOpenWallet()
	
	async fileSaveWallet() {
		trace2Main( pretty_func_header_format( "RendererGUI.fileSaveWallet" ) );
		let crypto_info = await this.getWalletInfo();
        window.ipcMain.SaveWalletInfo( crypto_info );
		this.showSaveWalletInfoDialog();		
	} // async fileSaveWallet()
	
	showSaveWalletInfoDialog() {
		trace2Main( pretty_func_header_format( "RendererGUI.showSaveWalletInfoDialog" ) );
        DialogManager.Clean();
		let description_data = "<center>Wallet Informations saved</center>";
		
		const feature_button_handler = () => {
			window.ipcMain.ShowOutputFolderInExplorer();
		};
		GuiUtils.ShowQuestionDialog( description_data, 
		                             { "CloseButtonLabel":   "Close",
									   "FeatureButtonlabel": "Show", 
									   "feature handler": feature_button_handler } );
	} // showSaveWalletInfoDialog()
	
	async onGuiSwitchWalletMode( evt ) {		
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == WALLET_MODE_SELECT_ID ) {			
			this.cb_enabled = false;
			
			let wallet_mode = elt.value;
			trace2Main( pretty_func_header_format( "RendererGUI.onGuiSwitchWalletMode", wallet_mode ) );
			//trace2Main("   ++ 1 this.Options: " + this.Options);
			await this.updateWalletMode( wallet_mode );
			//trace2Main("   ++ 2 this.Options: " + this.Options);			

            await window.ipcMain.UpdateOptions( this.Options );	

			HtmlUtils.InitializeNode
				( WALLET_BLOCKCHAIN_ID, 
			      this.Options['Blockchains'][wallet_mode],
				  this.Options['Blockchains'][wallet_mode] );
				  
			let default_blockchain = this.Options[DEFAULT_BLOCKCHAIN][wallet_mode];
			trace2Main( pretty_format( "rGUI.onGuiSwWmod> default_blockchain: '" + default_blockchain + "'" ) );

            this.wallet_info.setAttribute( BLOCKCHAIN, default_blockchain );			
			// HtmlUtils.SetNodeValue( WALLET_BLOCKCHAIN_ID, default_blockchain);	
			
			this.cb_enabled = true;
	    }		
	} // async onGuiSwitchWalletMode()
	
	async onGuiUpdateBlockchain( evt ) {
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == WALLET_BLOCKCHAIN_ID ) {
			let blockchain = elt.value;
			trace2Main( pretty_func_header_format( "RendererGUI.onGuiUpdateBlockchain", blockchain ) );
			//trace2Main( pretty_format( "rGUI.onGUIUpBlkCH> ", blockchain ) );
			
			//trace2Main( pretty_format( "rGUI.onGUIUpBlkCH> BEFORE wallet(wallet_mode)", this.wallet_info.getAttribute( WALLET_MODE ) ) );
			//trace2Main( pretty_format( "rGUI.onGUIUpBlkCH> BEFORE 1 wallet(blockchain)", this.wallet_info.getAttribute( BLOCKCHAIN ) ) );
			this.wallet_info.setAttribute( BLOCKCHAIN,    blockchain );
			this.wallet_info.setAttribute( ACCOUNT,       "0" );
			this.wallet_info.setAttribute( ADDRESS_INDEX, "0" );
			//trace2Main( pretty_format( "rGUI.onGUIUpBlkCH> BEFORE 2 wallet(blockchain)", this.wallet_info.getAttribute( BLOCKCHAIN ) ) );
			
			await this.updateBlockchain( blockchain );
			
			this.setSaveCmdState( true );
			//trace2Main( pretty_format( "rGUI.onGUIUpBlkCH> AFTER wallet(wallet_mode)", this.wallet_info.getAttribute( WALLET_MODE ) ) );
			//trace2Main( pretty_format( "rGUI.onGUIUpBlkCH> AFTER wallet(blockchain)",  this.wallet_info.getAttribute( BLOCKCHAIN ) ) );
	    }
	} // async onGuiUpdateBlockchain()
	
	async onGuiUpdateEntropySize( evt ) {		
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == ENTROPY_SIZE_SELECT_ID ) {
			let entropy_size = parseInt( elt.value );
			trace2Main( pretty_func_header_format( "RendererGUI.onGuiUpdateEntropySize", entropy_size ) );
			trace2Main( pretty_format( "entropy_size", entropy_size ) );
			await this.updateEntropySize( entropy_size );
	    }	
	} // onGuiUpdateEntropySize()	
	
	async onGuiUpdateWordCount( evt ) {		
		let elt = evt.target || evt.srcElement;
		
		if ( elt.id == WORD_COUNT_SELECT_ID ) {
			let word_count = parseInt( elt.value );
			trace2Main( pretty_func_header_format( "RendererGUI.onGuiUpdateWordCount", "word_count: " + word_count ) );
			let entropy_size = ( word_count * 11 ) - getChecksumBitCount( word_count );
			await this.updateEntropySize( entropy_size );
	    }	
	} // async onGuiUpdateWordCount()
	
	async onGuiSwitchEntropySourceType() {
		trace2Main( "\n\n==========================================================" );
		trace2Main( pretty_func_header_format( "RendererGUI.onGuiSwitchEntropySourceType" ) );
		this.entropy_source_type = HtmlUtils.GetNodeValue( ENTROPY_SRC_TYPE_SELECTOR_ID );
		trace2Main( pretty_format( "entropy_source_type", this.entropy_source_type ) );
		
        await this.drawEntropySource();		
		
		this.updateFieldsVisibility();
    } // async onGuiSwitchEntropySourceType()
	
	async onGuiUpdateLang( evt ) {
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == LANG_SELECT_ID ) {
			let lang_value = elt.value;
			trace2Main( pretty_func_header_format( "RendererGUI.onGuiUpdateLang", lang_value ) );
			let entropy = HtmlUtils.GetNodeValue( ENTROPY_ID );
            await this.updateLanguage( lang_value );
	    }
		else {
			trace2Main( pretty_func_header_format( "RendererGUI.onGuiUpdateLang" ) );	
		}
	} // async onGuiUpdateLang()
	
	onToggleDebug( evt ) {
		//trace2Main( pretty_func_header_format( "RendererGUI.onToggleDebug" ) );
        window.ipcMain.ToggleDebugPanel();		
	} // onToggleDebug()
	
	async onKeyDown( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onKeyDown", "'" + evt.key + "' keycode: " + evt.keyCode ) );
		
		let elt = evt.target || evt.srcElement;		
		if ( elt.id == ENTROPY_ID ) {
			let clipboard_text = await navigator.clipboard.readText();
			trace2Main( pretty_format( "clipboard_text", clipboard_text ) );

			if ( evt.key == 'Delete' ) return true;
			
			evt.preventDefault();
			
			let allowed_alphabet     = ALLOWED_ALPHABETS[elt.id];
			let entropy_value        = HtmlUtils.GetNodeValue( ENTROPY_ID );
			let expected_digit_count = this.expected_entropy_bytes * 2;
			
			trace2Main( pretty_format( "entropy_value",        entropy_value ) );
			trace2Main( pretty_format( "expected_digit_count", expected_digit_count ) );
			
			//trace2Main("   evt.key: '" + evt.key + "'");
			if (    allowed_alphabet != undefined 
				 || allowed_alphabet.indexOf(evt.key) == -1 
				 || entropy_value.length > expected_digit_count ) {
					 
				trace2Main( pretty_format( "INVALID ", evt.key ) );				
				return false;
			}
		}
		
		return true;
	} // onKeyDown()
	
	// Entropy 'keypress' event handler
	async onEntropyKeypress( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onEntropyKeypress" ) );
		trace2Main( pretty_format( "evt.charCode", evt.charCode ) );
		
		let entropy  = HtmlUtils.GetNodeValue( ENTROPY_ID );
		
		//========== Filter non hexadecimal characters ==========
		let is_hex_digit =    ( evt.charCode >= 48 && evt.charCode <= 57 )  // 0..9
		                   || ( evt.charCode >= 97 && evt.charCode <= 102 ) // a..f
						   || ( evt.charCode >= 65 && evt.charCode <= 70 ); // A..F
		trace2Main( pretty_format( "is_hex_digit", is_hex_digit ) );
        if (! is_hex_digit || entropy.length + 1 > this.wallet_info.getAttribute(EXPECTED_ENTROPY_DIGITS) ) {
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
		
		let text_cursor_pos = HtmlUtils.GetNode( ENTROPY_ID ).selectionStart;
		
		let new_char = String.fromCharCode(evt.charCode);
		trace2Main( pretty_format( "new_char", new_char ) );
		
		let new_entropy = insertCharAtIndex( entropy, new_char, text_cursor_pos );		
		
		trace2Main( pretty_format( "entropy(" + entropy.length + ")",         entropy ) );
		trace2Main( pretty_format( "new_entropy(" + new_entropy.length + ")", new_entropy ) );
		trace2Main( pretty_format( "expected_digits" + this.wllet.getAttribute(EXPECTED_ENTROPY_DIGITS) ) );
        trace2Main( pretty_format( "text_cursor_pos", text_cursor_pos ) );	
		
		HtmlUtils.SetNodeValue( ENTROPY_ID, new_entropy );
		
		text_cursor_pos += 1;
		let entropy_elt = HtmlUtils.GetNode( ENTROPY_ID );
		entropy_elt.selectionStart = text_cursor_pos;
		entropy_elt.selectionEnd   = text_cursor_pos;
		
		this.setEntropySourceIsUserInput( true );
		//this.updateStatusbarInfo( true );		

		if ( new_entropy.length == this.wallet_info.getATtribute(EXPECTED_ENTROPY_DIGITS) ) {
			trace2Main( "   new_entropy(" + new_entropy.length + "):  " + new_entropy); 

            HtmlUtils.SetNodeValue( ENTROPY_ID, new_entropy );			
			
			await this.updateFields( new_entropy );
		}	
		
        return true;		
	} // async onEntropyKeypress()
	
	// Entropy 'keydown' event handler
	onEntropyKeydown( evt ) {				
		//trace2Main( pretty_func_header_format( "RendererGUI.onEntropyKeydown" ) );
		//trace2Main( pretty_format( "evt.keyCode", evt.keyCode ) );		

		if ( evt.keyCode == BACKSPACE_KEY_CODE || evt.keyCode == DEL_KEY_CODE ) {
			this.setEntropySourceIsUserInput( true );
			//this.updateStatusbarInfo( true );
			this.setEntropyValueValidity( false );
		}
    } // onEntropyKeydown()    
	
	// Entropy 'paste' event handler
	async onEntropyPaste( evt ) {				
	    let entropy_elt = HtmlUtils.GetNode( ENTROPY_ID );
		trace2Main( pretty_func_header_format( "RendererGUI.onEntropyPaste" ) );
        
		evt.preventDefault();
		
        let paste_data = (evt.clipboardData || evt.clipboardData).getData("text");
		let paste_length = paste_data.length;
		
		trace2Main("   paste_data(" + paste_length + "): " + paste_data);		
		
		let current_entropy = HtmlUtils.GetNodeValue(ENTROPY_ID);
		trace2Main("   current_entropy(" + current_entropy.length + "): " + current_entropy);	
		
		let new_entropy     = "";		
        let expected_digits = this.wallet_info.getAttribute(EXPECTED_ENTROPY_DIGITS);
		
		if ( isHexString( paste_data ) ) {
			if ( paste_length == expected_digits ) {
				trace2Main(  "   *OK 1* to paste_data (full " 
				         + expected_digits + " digits): " + paste_data);
                new_entropy	= paste_data;				
			}
			else 
				if (   current_entropy.length < expected_digits
			        && (current_entropy.length + paste_length) <= expected_digits ) {				
				
				trace2Main(  "   *OK 2* to paste_data (" 
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
				trace2Main("   new_entropy (pasted): " + new_entropy);
				HtmlUtils.SetNodeValue( ENTROPY_ID, new_entropy );
			}	

            if ( new_entropy.length == this.wallet_info.getAttribute(EXPECTED_ENTROPY_DIGITS) ) {			
				this.setEntropySourceIsUserInput( true );
				//this.updateStatusbarInfo( true );
				HtmlUtils.SetNodeValue( ENTROPY_ID, new_entropy );	
					
				await this.updateFields( new_entropy );	
			}	
		} 
	} // onEntropyPaste()
	
	async onMnemonicsPaste( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onMnemonicsPaste" ) );
		evt.preventDefault();
		
        let paste_data = (evt.clipboardData || evt.clipboardData).getData("text");
		let paste_words = paste_data.split(' ');
		
		trace2Main("  paste_data(w: " + paste_words.length + "): " + paste_data);
		
		let current_mnemonics = HtmlUtils.GetNodeValue( MNEMONICS_ID );
		let current_words = current_mnemonics.split(' ');
		trace2Main("   current_mnemonics(w: " + current_words.length + "): " + current_mnemonics);

        let paste_lang ="";
		
		if ( paste_words.length != this.wallet_info.getAttribute(WORD_COUNT) ) {	
			trace2Main(  "   *KO*: paste_words:" + paste_words.length
			         + "  !=  expected_words:" + this.wallet_info.getAttribute(WORD_COUNT) );
			await this.displayMessageInStatusbar( INVALID_WORD_COUNT_MSGID );
			return;
		}		
		
		if ( paste_words.length == this.wallet_info.getAttribute(WORD_COUNT) ) {
			trace2Main(  "   OK: paste_words:" + paste_words.length
			         + "  ==  expected_words:" + this.wallet_info.getAttribute(WORD_COUNT) );
			
			// HtmlUtils.SetNodeValue( MNEMONICS_ID, paste_data );
			
			// 1. Must check if 'Mnemonics' is in current 'lang' chosen by user
			let current_lang = HtmlUtils.GetNodeValue( LANG_SELECT_ID ); 
			trace2Main("  current_lang: " + current_lang);
			
			let mnemonics = paste_data;
			let data = { mnemonics };	
			let paste_lang = await window.ipcMain.GuessMnemonicsLang( data );
			trace2Main("  paste_lang: " + paste_lang);

			if ( paste_lang	!= current_lang ) { 
				trace2Main(  "  *KO* paste_lang:" + paste_lang 
				         + " !=  current_lang:" + current_lang);
				await this.displayMessageInStatusbar( NOT_SAME_LANG_MSGID );
				return;
			}
			
			trace2Main(  "   OK: paste_lang:" + paste_lang 
				         + " ==  current_lang:" + current_lang);
			
			// 2. Compute 'Entropy' from 'Mnemonics'
			let lang = current_lang;
			mnemonics = paste_data;
            data = { mnemonics, lang };			
			let entropy_info = await window.ipcMain.MnemonicsToEntropyInfo( data );
			let new_entropy = entropy_info[ENTROPY_HEX];
			trace2Main("  new_entropy: " + new_entropy);
			
			// 3. Update 'Mnemonics' from 'Entropy'
			this.setEntropySourceIsUserInput( true );
			//this.updateStatusbarInfo( true );
			HtmlUtils.SetNodeValue( ENTROPY_ID, new_entropy );	
					
			await this.updateFields( new_entropy );	
		}
	} // onMnemonicsPaste()
	
	onCopyButton( evt_src_elt_id ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onCopyButton" ) );
		//trace2Main("   evt_src_elt_id: " + evt_src_elt_id );
		let copy_text = "";
		switch ( evt_src_elt_id ) {
			case ENTROPY_COPY_BTN_ID: 
				copy_text = HtmlUtils.GetNodeValue( ENTROPY_ID );
				GuiUtils.ShowQuestionDialog
					( "Entropy copied in Clipboard", 
					  {"CloseButtonLabel": "OK" } );
				break;

			case PK_COPY_BTN_ID: 
				copy_text = HtmlUtils.GetNodeValue( PRIVATE_KEY_ID );
				GuiUtils.ShowQuestionDialog
					( "Private Key copied in Clipboard", { "CloseButtonLabel": "OK" } );
				break;			
				
			case MNEMONICS_COPY_BTN_ID: 
			case SW_MNEMONICS_COPY_BTN_ID:
				copy_text = HtmlUtils.GetNodeValue( MNEMONICS_ID );
				GuiUtils.ShowQuestionDialog
					( "Seedphrase copied in Clipboard", { "CloseButtonLabel": "OK" } );
				break;
				
			case SW_WIF_COPY_BTN_ID:
				copy_text = HtmlUtils.GetNodeValue( WIF_ID );
				GuiUtils.ShowQuestionDialog
					( "WIF copied in Clipboard",  	   { "CloseButtonLabel": "OK" } );
				break;
		}
		
		if ( copy_text != "" ) {
			trace2Main("   copy_text: " + copy_text);
			navigator.clipboard.writeText( copy_text );
		}
	} // onCopyButton()
	
	// BIP32Field 'keypress' event handler
	async onBIP32FieldKeypress( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onBIP32FieldKeypress" ) );
		//trace2Main("  evt.keyCode:  " + evt.keyCode);
		//trace2Main("  evt.target:  " + evt.target.id);
		
		const ENTER_KEYCODE = 13;
		let field_value = "";
		
		//========== If 'ENTER' or 'Return' key pressed ==========
        if ( evt.charCode == ENTER_KEYCODE ) {
			trace2Main("   'ENTER' or 'Return' key pressed");
			let is_valid_field_value = false;
			
			let account_index = HtmlUtils.GetNodeValue( ACCOUNT_ID );
			if ( account_index == "" ) {
				HtmlUtils.SetNodeValue( ACCOUNT_ID, "0" );
			}
			
			let address_index = HtmlUtils.GetNodeValue( ADDRESS_INDEX_ID );
			if ( address_index == "" ) {
				HtmlUtils.SetNodeValue( ADDRESS_INDEX_ID, "0" );
			}
			
			field_value = HtmlUtils.GetNodeValue( evt.target.id ); // evt.target; 			
			if ( field_value == "" ) {
				field_value = "0";
			}
			trace2Main("  field_value(" + evt.target.id + "):  " + field_value);
			
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
		trace2Main("  is_decimal_digit (" + evt.charCode + "): " + is_decimal_digit);
		//trace2Main("  field_value: '" + field_value + "'");
		//trace2Main("  check 1: " + field_value.length + 1 > 4);
		//trace2Main("  check 2: " + (field_value.length + 1) > 4);
        if (   ! is_decimal_digit 
		    || field_value.length + 1 > 4) {
			evt.preventDefault();
			//trace2Main("   EXIT here");
			return false;
        }
		//========== Filter non decimal characters
		
		//trace2Main("   continue");
		this.setRefreshCmdState( true );
		//trace2Main("   AFTER continue");
	} // onBIP32FieldKeypress()	

	async onRefreshButton() {
		trace2Main( pretty_func_header_format( "RendererGUI.onRefreshButton" ) );
		await this.updateWalletAddress();
    } // onRefreshButton()
	
	onGuiFocus( evt ) {
		trace2Main( pretty_func_header_format( "RendererGUI.onGuiFocus" ) );
		let source_elt = evt.target || evt.srcElement;
		
		if (! EDITABLE_FIELD_IDS.includes( source_elt.id )) {
			return;
	    } 
		
		this.setFocus( source_elt.id );
	} // onGuiFocus()
	// =========================================================
	// ====================================   Event Handlers   
	// =========================================================

	setSaveCmdState( enabled ) {
		// trace2Main( pretty_func_header_format( "RendererGUI.setSaveCmdState", enabled  ) );
		
		if ( enabled ) {
			HtmlUtils.ShowNode( FILE_SAVE_ICON_ID );
			HtmlUtils.HideNode( FILE_SAVE_ICON_DISABLED_ID );
			enabled = true;			
		}
		else {
			HtmlUtils.HideNode( FILE_SAVE_ICON_ID );
			HtmlUtils.ShowNode( FILE_SAVE_ICON_DISABLED_ID );
			enabled = false;			
		}
		
		// Note: enabling 'Save' disables 'Save As.." and vice-versa 
		let menu_item_id = FILE_SAVE_MENU_ITEM_ID;
		let data = { menu_item_id, enabled };
		window.ipcMain.SetMenuItemState( data );
        // trace2Main( pretty_format( "rGUI.setSaveCmdState> ", FILE_SAVE_MENU_ITEM_ID + ":" + enabled  ) );		
		
		menu_item_id = FILE_SAVE_AS_MENU_ITEM_ID;
		enabled = ! enabled ;
		data = { menu_item_id, enabled };
		window.ipcMain.SetMenuItemState( data );
		// trace2Main( pretty_format( "rGUI.setSaveCmdState> ", FILE_SAVE_AS_MENU_ITEM_ID + ":" + enabled  ) );
		
		// trace2Main( pretty_func_header_format( "<END> RendererGUI.setSaveCmdState" ) );
	} // setSaveCmdState()	
	
    setRefreshCmdState( enable ) {
		//trace2Main(">> " + _CYAN_ + "RendererGUI.showRefreshButton() " + _END_);
		if ( enable ) { // show "Regenerate" AND "Refresh" buttons 
		    //trace2Main("   Show REFRESH");
			HtmlUtils.ShowNode( RIGHT_BTNBAR_ITEM_ID );
		}
		else { // show only "Regenerate" button centered 
		    //trace2Main("   HIDE REFRESH");
			HtmlUtils.HideNode( RIGHT_BTNBAR_ITEM_ID );
		}
	} // setRefreshCmdState()
	
	setEntropySourceIsUserInput( is_user_input ) {
		// trace2Main( pretty_func_header_format( "RendererGUI.setEntropySourceIsUserInput", is_user_input ) );
		
		this.entropy_source_is_user_input = is_user_input;
		//this.updateStatusbarInfo( is_user_input );
		if ( is_user_input ) {			
			HtmlUtils.SetNodeValue( CHECKSUM_ID,          "" );
            HtmlUtils.SetNodeValue( MNEMONICS_ID,         "" );	
			HtmlUtils.SetNodeValue( SW_MNEMONICS_ID,      "" );	
            HtmlUtils.SetNodeValue( MNEMONICS_4LETTER_ID, "" );
			HtmlUtils.SetNodeValue( WORD_INDEXES_ID,      "" );			
		}
		// trace2Main( pretty_func_header_format( "<END> RendererGUI.setEntropySourceIsUserInput" ) );
		
		this.updateFieldsVisibility();
	} // setEntropySourceIsUserInput()
	
	async displayMessageInStatusbar( msg_id ) {
		if ( msg_id != undefined ) {
			let	msg = await window.ipcMain.GetLocalizedMsg(msg_id);
			HtmlUtils.SetNodeValue( "SB_item_message_id", msg );
		}	
	} // displayMessageInStatusbar()
	
	setEntropyValueValidity( is_valid ) {
		let entropy_elt = HtmlUtils.GetNode( ENTROPY_ID );
		
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
		trace2Main( pretty_func_header_format( "RendererGUI.setFocus" ) );
		
		let target_elt = HtmlUtils.GetNode( elt_id );
		for (let i=0; i < FIELD_IDS.length; i++) { 
			let field_id = FIELD_IDS[i];
			let elt = HtmlUtils.GetNode(field_id);
			
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
	
	// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
	// https://www.geeksforgeeks.org/how-to-drag-and-drop-images-using-html5/	
	async onDropImage( evt ) {
		trace2Main(">> " + _CYAN_ + "RendererGUI.onDropImage()" + _END_);		
		evt.preventDefault();
		evt.stopPropagation();

		let file_path = [];
		for (const f of evt.dataTransfer.files) {
			// Using the path attribute to get absolute file path
			//console.log('File Path of dragged files: ', f.path)
			file_path.push(f.path); // assemble array for main.js
		}
		let img_file_path = file_path[0];
		trace2Main("   " + img_file_path);
		let img_data_asURL = await window.ipcMain.LoadImageFromFile( img_file_path );
		this.img_data_asURL = img_data_asURL; 
	} // onDropImage()
	// ============================== Event Handlers	
	
	async getWalletInfo() {
		trace2Main( pretty_func_header_format( "RendererGUI.getWalletInfo" ) );
		
		let crypto_info = {};
		
		let wallet_mode = HtmlUtils.GetNodeValue( WALLET_MODE_SELECT_ID ); 
		crypto_info[WALLET_MODE] = wallet_mode;
		
		let blockchain = HtmlUtils.GetNodeValue( WALLET_BLOCKCHAIN_ID ); 
		crypto_info[BLOCKCHAIN] = blockchain;
		
		let coin_id = HtmlUtils.GetNodeValue( WALLET_COIN_ID );
		trace2Main( pretty_format( "coin_id", coin_id ) );
		let coin = HtmlUtils.GetNodeValue( WALLET_COIN_ID ).replaceAll('\n','').replaceAll('\t',''); 
		trace2Main( pretty_format( "coin", coin ) );
		crypto_info[COIN] = coin;
		
		let wallet_address = HtmlUtils.GetNodeValue( ADDRESS_ID );
        // trace2Main("wallet_address " + wallet_address );		
		crypto_info['address'] = wallet_address;
		
		let wallet_URL_elt =  HtmlUtils.GetNode( WALLET_URL_LINK_ID );
		if (wallet_URL_elt != undefined) {
			crypto_info['Blockchain Explorer'] = wallet_URL_elt.href;
		}
		
		trace2Main( pretty_format( "rGUI.getWinf> blockchain", blockchain ) );
		
		if ( this.isBlockchainSupported( blockchain ) ) {
			let WIF_value = HtmlUtils.GetNodeValue( WIF_ID ); 
			// trace2Main("WIF_value " + WIF_value );
			if ( WIF_value != "" ) {
				crypto_info[WIF] = WIF_value;
			}

			if ( blockchain == BITCOIN || blockchain == DOGECOIN || blockchain == LITECOIN ) {
				crypto_info[PRIVATE_KEY] = HtmlUtils.GetNodeValue( PRIVATE_KEY_ID );		
				crypto_info[WIF] = WIF_value; 
			}
			else if (    blockchain == ETHEREUM || blockchain == AVALANCHE			          
					  || blockchain == SOLANA ) {
				crypto_info[PRIVATE_KEY] = HtmlUtils.GetNodeValue( PRIVATE_KEY_ID ); 
				trace2Main( pretty_format( "rGUI.getWinf> crypto_info[PRIVATE_KEY]", crypto_info[PRIVATE_KEY] ) );
			}	
            else if ( blockchain == RIPPLE ) {
				let PRIV_KEY_value = crypto_info[PRIV_KEY];
				delete crypto_info[PRIV_KEY];
				// crypto_info[PRIVATE_KEY] = PRIV_KEY_value;
				crypto_info[PRIVATE_KEY] = HtmlUtils.GetNodeValue( PRIVATE_KEY_ID );  
			}
			else if (    blockchain == TRON 
			          || blockchain == BITCOIN_CASH 
					  || blockchain == DASH || blockchain == FIRO || blockchain == ZCASH ) {
				crypto_info[PRIVATE_KEY] = HtmlUtils.GetNodeValue( PRIVATE_KEY_ID ); 
			}            		
		}
		
		let mnemonics_elt = HtmlUtils.GetNode( MNEMONICS_ID ); 
		let mnemonics = mnemonics_elt.value;
		
		crypto_info[MNEMONICS] = mnemonics;	
		//crypto_info['Seedphrase'] = mnemonics;	
		
		let shortened_mnemonics_elt = HtmlUtils.GetNode( MNEMONICS_4LETTER_ID ); 
		let shortened_mnemonics = shortened_mnemonics_elt.value;
		crypto_info['Shortened Seedphrase'] = shortened_mnemonics;
		
		let lang = this.wallet_info.getAttribute(LANG);
		let options = { [LANG]: lang };
		let data = { mnemonics, options };
		let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
		let word_indexes_str = JSON.stringify( word_indexes )
		                       .replaceAll( '"', '' ).replaceAll( ',', ', ' )
							   .replaceAll( '[', '' ).replaceAll( ']', '' )
		crypto_info['Word indexes'] = word_indexes_str;
		
		//trace2Main(">> " + _CYAN_ + "RendererGUI.getWalletInfo() " + _END_);
		
		if ( wallet_mode == HD_WALLET_TYPE ) {	
		    let password = this.wallet_info.getAttribute( PASSWORD );
			if (password != undefined && password != null && password != "") {
				crypto_info[PASSWORD] = password;
			}
			let account       = HtmlUtils.GetNodeValue( ACCOUNT_ID );			
			let change_chain  = ( blockchain == SOLANA ) ? "0'" : "0";			
			let address_index = HtmlUtils.GetNodeValue( ADDRESS_INDEX_ID );
			
			crypto_info[DERIVATION_PATH] =  "m/44'/" + COIN_TYPES[blockchain] + "'"
										  + "/" + account + "'/" + change_chain
										  + "/" + address_index;
			if ( blockchain == SOLANA  &&  ! crypto_info[DERIVATION_PATH].endsWith("'") ){
				crypto_info[DERIVATION_PATH] += "'";				
            }			
		}
		
		let entropy_value = HtmlUtils.GetNodeValue( ENTROPY_ID ); 
		crypto_info[ENTROPY] = entropy_value;
		
		let entropy_size = entropy_value.length * 4; // 4 bits per hex digit
		crypto_info[ENTROPY_SIZE] = entropy_size;
		
		crypto_info[LANG] = lang;
		
		return crypto_info;
	} // getWalletInfo()
	
	// https://www.w3schools.com/howto/howto_js_full_page_tabs.asp
	openTabPage( pageName, elt, color ) {
		trace2Main( pretty_func_header_format( "RendererGUI.openTabPage", pageName + " elt:" + elt.id ) );
				
		// Hide all elements with class="tabcontent" by default */
		let i, tabcontent, tablinks;
		tabcontent = document.getElementsByClassName("tabcontent");
		for ( i = 0; i < tabcontent.length; i++ ) {
			tabcontent[i].style.display = "none";
		}

		// Remove the background color of all tablinks/buttons
		tablinks = document.getElementsByClassName("tablink");
		for ( i = 0; i < tablinks.length; i++ ) {
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
		//trace2Main("   current_tab_link_id: " + elt.id);
		//trace2Main("   other_tab_link_id:   " + other_tab_link_id);
		
		if ( HtmlUtils.HasClass( other_tab_link_id,   "ThreeBordersTabLink" ) ) {
			HtmlUtils.RemoveClass( other_tab_link_id, "ThreeBordersTabLink" );
		}
		if ( ! HtmlUtils.HasClass( other_tab_link_id, "FourBordersTabLink" ) ) {
			HtmlUtils.AddClass( other_tab_link_id,    "FourBordersTabLink" );
		}		
	} // openTabPage()
	
	async generateEntropyFromEntropySource() {
		trace2Main( pretty_func_header_format( "RendererGUI.generateEntropyFromEntropySource" ) );
		let salted_entropy_src_str = await this.getSaltedEntropySource();
		//  ( pretty_format( "rGUI.genEsrc2E> Salted Entropy", getShortenedString( salted_entropy_src_str ) ) );
		
		let lang = this.wallet_info.getAttribute( LANG );
		// trace2Main( pretty_format( "rGUI.genEsrc2E> lang", lang ) );
		
		// trace2Main( pretty_format( "rGUI.genEsrc2E> word_count", this.wallet_info.getAttribute(WORD_COUNT) ) );
		const options = { [LANG]: lang, [WORD_COUNT]: this.wallet_info.getAttribute(WORD_COUNT) };
		let data = { salted_entropy_src_str, options };				
		let	entropy = await window.ipcMain.EntropySourceToEntropy( data );	
        trace2Main( pretty_format( "rGUI.genEsrc2E> entropy", entropy ) );
		
        return entropy;		
	} // generateEntropyFromEntropySource()
	
	async mnemonicsToWordIndexes( mnemonics, lang ) {
		//trace2Main( pretty_func_header_format( "RendererGUI.mnemonicsToWordIndexes" ) );		
		let word_index_base = HtmlUtils.GetNodeValue( WORD_INDEXES_BASE_ID);
		let options = { [LANG]: lang, "word_index_base": word_index_base }; 		
		let data = { mnemonics, options };
		let word_indexes = await window.ipcMain.MnemonicsToWordIndexes( data );
		let word_indexes_str = word_indexes.join(' ');
		//trace2Main("   word_indexes_str: " + word_indexes_str);
		return word_indexes_str;
    } // async mnemonicsToWordIndexes()
	
	isBlockchainSupported( blockchain ) {
		if (   blockchain == ETHEREUM || blockchain == AVALANCHE 
		    || blockchain == BITCOIN  || blockchain == DOGECOIN || blockchain == LITECOIN 
		    || blockchain == CARDANO  || blockchain == SOLANA
		    || blockchain == RIPPLE   || blockchain == TRON     || blockchain == BITCOIN_CASH 
		    || blockchain == DASH     || blockchain == FIRO || blockchain == ZCASH ) {
			return true;	
		} 
		return false;
	} // isBlockchainSupported()
	
	setEventHandler( elt_id, event_name, handler_function ) {
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // setEventHandler()	
} // RendererGUI class
// ==============================  RendererGUI class 

RendererGUI.GetInstance();