// ========================================================================================
// =====================================   skribi.js   ====================================
// ========================================================================================
// Main process logger: CONSOLE ONLY.
// NB: Cryptocalc never writes a log file ('log.txt'): log messages may contain
//     sensitive information (Entropy, Secret phrase, Private Key, WIF...).
//     The former 'electron-log' file transport and 'www/config/app_config.json' ("ToFile") were removed.
"use strict";

const { _CYAN_, _END_ } = require('../color/color_console_codes.js');

class Skribi {
	static Initialized = false;

	// Kept for compatibility with existing callers: there is nothing to configure anymore
	static Initialize() {
		console.log( ">> " + _CYAN_ + "Skribi.Initialize" + _END_);
		Skribi.Initialized = true;
	} // Skribi.Initialize()

	static log( msg ) {
		if ( ! Skribi.Initialized ) {
			Skribi.Initialize();
		}

		console.log( msg );
	} // Skribi.log()
} // Skribi class

if (typeof exports === 'object') {
	exports.Skribi = Skribi
} // 'skribi.js' exports
