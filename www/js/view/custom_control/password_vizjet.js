// ==============================================================================================================================
// =================================================     password_vizjet.js     =================================================
// ==============================================================================================================================
"use strict";

class PasswordVizjet {
	constructor( name ) {
		this.name = name;
		this.visible = false;		
		this.input_field_id = this.name + '.input_field';
	} // ** constructor **
	
	build() {
	} // build()
	
	onKey( evt ) {
		let bip32_passphrase = HtmlUtils.GetElementValue( this.input_field_id );
		// trace2Main( pretty_func_header_format( "PasswordVizjet.onGuiChangePassword", "'" + bip32_passphrase + "'" ) );
		this.wallet_info.setAttribute( BIP32_PASSPHRASE, bip32_passphrase );

		if ( bip32_passphrase == "" ) {
			this.GuiSetPasswordApplyState( false );	
		}
		else {
			this.GuiSetPasswordApplyState( true );	
		}	
	} // onKey()
	
	async applyPassword( evt ) {
		let bip32_passphrase = HtmlUtils.GetElementValue( BIP32_PASSPHRASE_ID );
		trace2Main( pretty_func_header_format( "PasswordVizjet.GuiApplyPassword", bip32_passphrase ) );
		this.wallet_info.setAttribute( BIP32_PASSPHRASE, bip32_passphrase );
		await this.updatePassword( bip32_passphrase );

		this.GuiSetPasswordApplyState( false );
	} // async applyPassword()

	// https://www.npmjs.com/package/generate-password
	async generatePassword( evt ) {
		trace2Main( pretty_func_header_format( "PasswordVizjet.generatePassword" ) );
		let data = {};
		let bip32_passphrase = await window.ipcMain.GeneratePassword( data );
		
		this.wallet_info.setAttribute( BIP32_PASSPHRASE, bip32_passphrase);

		this.setPasswordApplyState( true );
	} // async generatePassword()	
	
	setPasswordApplyState( visible ) {
		if ( visible ) {
			HtmlUtils.ShowElement( APPLY_PASSWORD_BTN_ID );
			HtmlUtils.ShowElement( APPLY_BTN_SEPARATOR_ID );
			HtmlUtils.AddClass( BIP32_PASSPHRASE_ID, PASSWORD_WITH_APPLY_CSS_CLASS );
			HtmlUtils.RemoveClass(BIP32_PASSPHRASE_ID, PASSWORD_WITHOUT_APPLY_CSS_CLASS );
			// this.setSaveCmdState( false );
		}
		else {
			HtmlUtils.HideElement( APPLY_PASSWORD_BTN_ID );
			HtmlUtils.HideElement( APPLY_BTN_SEPARATOR_ID );
			HtmlUtils.AddClass( BIP32_PASSPHRASE_ID, PASSWORD_WITHOUT_APPLY_CSS_CLASS );
			HtmlUtils.RemoveClass( BIP32_PASSPHRASE_ID, PASSWORD_WITH_APPLY_CSS_CLASS );
			// this.setSaveCmdState( true );
		}
	} // setPasswordApplyState()
	
	getNode( id ) {
		let DOM_elt = HtmlUtils.GetElement( id );
		return DOM_elt;
	} // getNode()
	
	clear( update_wallet ) {
		trace2Main( pretty_func_header_format( "PasswordVizjet.clear" ) );
		this.wallet_info.setAttribute( BIP38_PASSPHRASE, '');

		this.GuiSetPasswordApplyState( false );	
	} // clear()
	
	ToggleVisibility() {
		trace2Main( pretty_func_header_format( "PasswordVizjet.ToggleVisibility" ) );	
		let eye_btn_img_elt = document.getElementById( EYE_BTN_IMG_ID );
		console.log("> eye_btn_img_elt: " + eye_btn_img_elt);
		
		if ( this.visible ) { 
			this.getNode(BIP32_PASSPHRASE_ID).type = 'password';	
			
			if (eye_btn_img_elt != undefined) {
				eye_btn_img_elt.src = 'icons/' + EYE_CLOSED_ICON;	
			}
		}
		else { 	
		    this.getNode( BIP32_PASSPHRASE_ID ).type = 'text';	

			if (eye_btn_img_elt != undefined) {
				eye_btn_img_elt.src = 'icons/' + EYE_OPEN_ICON;	
			}			
		}
		this.visible = ! this.visible;
	} // ToggleVisibility()
} // PasswordVizjet class