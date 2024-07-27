//==================================================================================
//=============================   dialog_manager.js   ==============================
//==================================================================================
"use strict";

class DialogManager {
	static Clean(trigger_event) {
		//console.log('DialogManager.Clean ');
		iziToast.destroy();
		//DialogManager.CloseDialog(FILE_DIALOG_ID);
		//DialogManager.CloseDialog(SEEDPHRASE_TO_PK_DIALOG_ID);
		//DialogManager.CloseDialog(FONT_LIST_EDITOR_DIALOG_ID);	
	} // static Clean()
	
	static CloseDialog(dialog_id) {
		if ($("#" + dialog_id) != undefined) {
			$("#" + dialog_id).dialog('close');
		}
	} // static CloseDialog()	
} // DialogManager class

if (typeof exports === 'object') {
	exports.DialogManager = DialogManager
} 