// =====================================================================================
// ===============================   electron_window.js   ==============================
// =====================================================================================

// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

const ElectronWindow = class {
	static GetWindow() {
		return ElectronWindow.window;
	} // GetWindow()
	
	static SetWindow(window_arg) {
		ElectronWindow.window = window_arg;
	} // SetWindow()
}; // ElectronWindow class
ElectronWindow.window = null;

if (typeof exports === 'object') {
	exports.ElectronWindow = ElectronWindow
}