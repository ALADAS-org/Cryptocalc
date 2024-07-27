// ====================================================================================
// =================================   gui_utils.js   =================================
// ====================================================================================
"use strict";

// https://izitoast.marcelodolza.com/    
class GuiUtils {
	static ShowInfoDialog( msg ) {
		let options = {
			iconUrl:         './icons/Cryptocalc_Icon.png',
			position:        'center',
			backgroundColor: 'lightblue',
			message:         msg,
			maxWidth:        450, layout: 2,
			timeout:         false, progressBar: false
		};
		
		iziToast.info( options );
	} // GuiUtils.ShowInfoDialog()
} // GuiUtils class