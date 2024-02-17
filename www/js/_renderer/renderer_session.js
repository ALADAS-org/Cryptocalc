//==================================================================================
//============================   renderer_session.js   =============================
//==================================================================================
"use strict";

const RendererSession = class {
	static GetValue(name_arg) {
		if (RendererSession.Values == undefined) {
			RendererSession.Values = {};
			return undefined;
		}
		return RendererSession.Values[name_arg];
	} // static GetValue()
	
	static SetValue(name_arg, value_arg) {
		if (RendererSession.Values == undefined) {
			RendererSession.Values = {};
		}
		RendererSession.Values[name_arg] = value_arg;
	} // static SetValue()
} // RendererSession class
//============================ RendererSession