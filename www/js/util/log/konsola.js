// =======================================================================================
// =====================================  konsola.js  ====================================
// =======================================================================================
"use strict";

const { app } = require('electron');
const fs      = require('fs');	

// https://www.npmjs.com/package/electron-log
// https://stackoverflow.com/questions/41522769/electron-app-logging-to-file-in-production
const konsola_log = require('electron-log');
konsola_log.transports.file.level  = 'info';
konsola_log.transports.file.format = '{text}'; // '{h}:{i}:{s} {text}';
konsola_log.transports.file.resolvePath = () => app.getAppPath() + "/assets/log.txt";

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, _GREEN_, _END_ 
	  }                = require('../color/color_console_codes.js');

class Konsola {
	static Initialized = false;
	
	static Initialize( msg ) {
		if ( ! Konsola.Initialized ) {
			let log_path = app.getAppPath() + "/assets/log.txt";
			if ( fs.existsSync( log_path ) ) {
				fs.unlinkSync( log_path );
			}
			Konsola.Initialized = true;
		}
	} // Konsola.Initialize()
	
	static log( msg ) {
		console.log( msg );
		
		if ( ! Konsola.Initialized ) { 
			Konsola.Initialize();
		}
		
		//let filtered_msg = msg.replaceAll(_CYAN_,'')		
		//                      .replaceAll(_RED_,'')
		//					  .replaceAll(_PURPLE_,'')
		//					  .replaceAll(_YELLOW_,'')
		//					  .replaceAll(_GREEN_,'')
		//                      .replaceAll(_END_,'');
		//konsola_log.info( filtered_msg );
	} // Konsola.log()
} // Konsola class

if (typeof exports === 'object') {
	exports.Konsola = Konsola
} // 'konsola.js' exports