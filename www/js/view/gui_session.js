// ================================================================================================================
// ==============================================   gui_session.js   ==============================================
// ================================================================================================================
"use strict";

const GuiSession = class {
	static GetValue(name_arg) {
		if (GuiSession.Values == undefined) {
			GuiSession.Values = {};
			return undefined;
		}
		return GuiSession.Values[name_arg];
	} // static GetValue()
	
	static SetValue(name_arg, value_arg) {
		if (GuiSession.Values == undefined) {
			GuiSession.Values = {};
		}
		GuiSession.Values[name_arg] = value_arg;
	} // static SetValue()
} // GuiSession class
//============================ GuiSession