// ==============================================================================================
// =====================================    log_utils.js    =====================================
// ==============================================================================================
"use strict";

// NB: use 'winston' library later

const DEFAULT_PAD_LENGTH = 29;

// https://blog.logrocket.com/using-console-colors-node-js/
// https://gist.github.com/JBlond/2fea43a3049b38287e5e9cefc87b2124
const ESC_CYAN   = '\x1b[0;96m';         // ANSI escape sequence
  
// https://stackoverflow.com/questions/32573654/is-there-a-way-to-create-an-orange-color-from-ansi-escape-characters
//                                R   G  B
// const ESC_ORANGE = '\x1b[38;2;255;165;0m'; // Orange OK

//                             R   G  B
const ESC_ORANGE = '\x1b[38;2;220;160;0m'; 

const ESC_END    = '\x1b[0m';

const getFunctionCallerName = () => {
  // gets the text between whitespace for second part of stacktrace
  return (new Error()).stack.match(/at (\S+)/g)[1].slice(3);
}; // getFunctionCallerName()

const pretty_func_header_format = ( func_name, value ) =>  {
	let pretty_str = ">> " + ESC_CYAN + func_name;
    if ( value != undefined ) { 
	   pretty_str += " " + ESC_ORANGE + value;
    }	
	pretty_str += ESC_END;
	return pretty_str;			
}; // pretty_func_header_format()

const pretty_func_header_log = ( func_name, value ) =>  {
	console.log( pretty_func_header_format( func_name, value ) );			
}; // pretty_func_header_log()

const pretty_format = ( label, value, pad_length ) =>  {
	if ( pad_length == undefined ) {
		pad_length = DEFAULT_PAD_LENGTH;
	}
	let pretty_str =   "   " + ESC_ORANGE 
	                + (label + ":").padEnd( pad_length,' ' ) + ESC_END + value;
	return pretty_str;				
}; // pretty_format()

const pretty_log = ( label, value, pad_length ) =>  {
	console.log( pretty_format( label, value, pad_length ) );
}; // pretty_log()

if (typeof exports === 'object') {
	exports.getFunctionCallerName     = getFunctionCallerName
	exports.pretty_func_header_format = pretty_func_header_format 
	exports.pretty_func_header_log    = pretty_func_header_log
	exports.pretty_format             = pretty_format
	exports.pretty_log                = pretty_log
} // 'log_utils.js' exports