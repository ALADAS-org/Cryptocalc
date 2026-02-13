// ==============================================================================================
// =====================================    log_utils.js    =====================================
// ==============================================================================================
"use strict";

// NB: use 'winston' library later

const DEFAULT_PAD_LENGTH = 42;

// ========== ANSI escape sequences ==========
// https://blog.logrocket.com/using-console-colors-node-js/
// https://gist.github.com/JBlond/2fea43a3049b38287e5e9cefc87b2124
const ESC_CYAN      = '\x1b[0;96m';
const ESC_YELLOW    = '\x1b[0;93m'; 
const ESC_RED       = '\x1b[1;31m';
  
// https://stackoverflow.com/questions/32573654/is-there-a-way-to-create-an-orange-color-from-ansi-escape-characters
const ESC_ORANGE    = '\x1b[38;2;220;160;0m'; // R:220 G:160 B:0
const ESC_END       = '\x1b[0m';

const PRODUCTION_LOG_MODE = 'ProductionLogMode';
const UNIT_TESTS_LOG_MODE = 'UnitTestsLogMode';
const LOG_MODES = [ PRODUCTION_LOG_MODE, UNIT_TESTS_LOG_MODE ];

class PrettyLog {
	static #Key           = Symbol();
	static #Singleton     = new PrettyLog( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if( PrettyLog.#Singleton == undefined ) {
			PrettyLog.#Singleton = new PrettyLog( this.#Key );
			if (PrettyLog.#Singleton > 0) {
				throw new TypeError("'PrettyLog' constructor called more than once");
			}
			PrettyLog.#InstanceCount++;
        }
        return PrettyLog.#Singleton;
    } // PrettyLog 'This' getter

    // ** Private constructor **
	constructor( key ) {
		if ( key !== PrettyLog.#Key ) {
			throw new TypeError("'PrettyLog' constructor is private");
		}
		
		this.log_mode = PRODUCTION_LOG_MODE;
	} // ** Private constructor **
	
	get logMode() {
		return this.log_mode;
	} // 'logMode' getter
	
	set logMode( new_log_mode ) {
		if ( LOG_MODES.includes(new_log_mode) ) {
			this.log_mode = new_log_mode;
		}
	} // 'logMode' setter
} // 'PrettyLog' class

const pretty_func_header_format = ( func_name, value ) =>  {
	let pretty_str = ">> " + ESC_CYAN + func_name;
    if ( value != undefined ) { 
	   pretty_str += " " + ESC_YELLOW + value;
    }	
	pretty_str += ESC_END;
	return pretty_str;			
}; // pretty_func_header_format()

const pretty_func_header_log = ( func_name, value ) =>  {	
	if ( PrettyLog.This.logMode == PRODUCTION_LOG_MODE ) {
		console.log( pretty_func_header_format( func_name, value ) );
	}	
}; // pretty_func_header_log()

const pretty_format = ( label, value ) =>  {
	if ( label == undefined )  label = "";	
	if ( value == undefined )  value = "";
	
	if ( label.length > 0 )  label += ":";
	let pretty_str = "   " + ESC_ORANGE + label.padEnd( DEFAULT_PAD_LENGTH,' ' ) + ESC_END + value;
	return pretty_str;				
}; // pretty_format()

const pretty_format_error = ( label, value ) =>  {
	if ( value == undefined ) value = "";
	let pretty_str = ESC_RED + label + ESC_END + value;
	return pretty_str;				
}; // pretty_format_error()

const pretty_log = ( label, value ) =>  {
	if ( PrettyLog.This.logMode == PRODUCTION_LOG_MODE ) {
		console.log( pretty_format( label, value ) );
	}
//	else {	
//	    console.log( "** NOT LOGGED **" + pretty_format( label, value ) );
//	}
}; // pretty_log()


function test_PrettyLog() {
	console.log( '-------- test_PrettyLog --------' );
	console.log("logMode: " + PrettyLog.This.logMode);
	pretty_log( "value", "Hello World");
	
	PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
	console.log("logMode: " + PrettyLog.This.logMode);
	pretty_log( "value", "Hello World");
	
	console.log( "----- END -----" );
}; // test_PrettyLog()

// test_PrettyLog();


if (typeof exports === 'object') {
	exports.PrettyLog                 = PrettyLog 
	exports.PRODUCTION_LOG_MODE       = PRODUCTION_LOG_MODE
	exports.UNIT_TESTS_LOG_MODE       = UNIT_TESTS_LOG_MODE
	
	exports.pretty_func_header_format = pretty_func_header_format 
	exports.pretty_func_header_log    = pretty_func_header_log
	exports.pretty_format             = pretty_format
	exports.pretty_format_error       = pretty_format_error
	exports.pretty_log                = pretty_log
} // 'log_utils.js' exports