// ========================================================================================
// =====================================   skribi.js   ====================================
// ========================================================================================
"use strict";

const { app } = require('electron');
const fs      = require('fs');	

// https://www.npmjs.com/package/electron-log
// https://stackoverflow.com/questions/41522769/electron-app-logging-to-file-in-production
const electron_log = require('electron-log');

electron_log.transports.console.level = false;  // disable console output

electron_log.transports.file.level  = 'info';
electron_log.transports.file.format = '{text}'; // '{h}:{i}:{s} {text}';

// electron_log.transports.ipc.level = true;
// electron_log.transports.ipc.url   = "127.0.0.1:1234";

const { _CYAN_, _RED_, _PURPLE_, _YELLOW_, 
        _ORANGE_, _GREEN_, _END_ 
	  }                = require('../color/color_console_codes.js');

class Skribi {
	static Initialized = false;
	static AppConfig   = {};
	static ToFile      = false;
	
	static Initialize( app_config ) {
		console.log( ">> " + _CYAN_ + "Skribi.Initialize" + _END_);
		
		if ( app_config != undefined ) {
			console.log( "   app_config: " + JSON.stringify(app_config) );
		}
		
		if (       app_config != undefined 
			    && app_config['ToFile'] != undefined && app_config['ToFile'] == true ) {
					
				Skribi.ToFile = true;
				
				let log_path = app.getAppPath() + "/log.txt";
				// console.log( "   log_path: " + JSON.stringify(app_config) );
				electron_log.transports.file.resolvePathFn = () => log_path;
				
				if ( fs.existsSync( log_path ) ) fs.unlinkSync( log_path );	
		}
			
		Skribi.Initialized = true;
	} // Skribi.Initialize()
	
	static log( msg ) {		
		if ( ! Skribi.Initialized ) { 
			Skribi.Initialize();
		}
		
		console.log( msg );
		
		if ( Skribi.ToFile ) {
			let filtered_msg = "** EMPTY_MSG **";
			if ( msg != undefined ) {
				filtered_msg = msg.replaceAll(_CYAN_,'').replaceAll(_RED_,'')
								  .replaceAll(_PURPLE_,'').replaceAll(_GREEN_,'')
								  .replaceAll(_YELLOW_,'').replaceAll(_ORANGE_,'')							  
								  .replaceAll(_END_,'');
			}
			electron_log.info( filtered_msg );		
		}
	} // Skribi.log()
} // Skribi class

if (typeof exports === 'object') {
	exports.Skribi = Skribi
} // 'skribi.js' exports