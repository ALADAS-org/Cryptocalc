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

const pretty_func_header_format = ( func_name, value ) =>  {
	let pretty_str = ">> " + ESC_CYAN + func_name;
    if ( value != undefined ) { 
	   pretty_str += " " + ESC_YELLOW + value;
    }	
	pretty_str += ESC_END;
	return pretty_str;			
}; // pretty_func_header_format()

const pretty_func_header_log = ( func_name, value ) =>  {
	console.log( pretty_func_header_format( func_name, value ) );			
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
	console.log( pretty_format( label, value ) );
}; // pretty_log()

if (typeof exports === 'object') {
	exports.pretty_func_header_format = pretty_func_header_format 
	exports.pretty_func_header_log    = pretty_func_header_log
	exports.pretty_format             = pretty_format
	exports.pretty_format_error       = pretty_format_error
	exports.pretty_log                = pretty_log
} // 'log_utils.js' exports