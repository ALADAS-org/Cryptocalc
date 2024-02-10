// =====================================================================================
// ===============================   gui_controller.js   ===============================
// =====================================================================================
"use strict";

// https://www.electronjs.org/docs/latest/tutorial/quick-start

class GUI_Controller {
	static Init() {
		let msg = ">> " + _CYAN_ + "GUI_Controller.Init()" + _END_;
		window.ipcMain.log2Main(msg);
	} // GUI_Controller.Init()
} // GUI_Controller class

GUI_Controller.Init();