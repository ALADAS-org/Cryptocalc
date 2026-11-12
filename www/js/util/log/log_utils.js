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
		
		// 'HashedSecretsInConsoleLog' option: true until the options are loaded (safe default)
		this.hashed_secrets = true;
		
		// Main process only: random HMAC key of the session (never logged, never saved)
		this.secret_key     = undefined;
	} // ** Private constructor **
	
	get logMode() {
		return this.log_mode;
	} // 'logMode' getter
	
	set logMode( new_log_mode ) {
		if ( LOG_MODES.includes(new_log_mode) ) {
			this.log_mode = new_log_mode;
		}
	} // 'logMode' setter
	
	get hashedSecrets() {
		return this.hashed_secrets;
	} // 'hashedSecrets' getter
	
	// Only an explicit 'false' shows the secrets in clear text (debug)
	set hashedSecrets( flag ) {
		this.hashed_secrets = ( flag !== false );
	} // 'hashedSecrets' setter
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


// ======================================================================================
// ============================ Secrets in the console log ==============================
// ======================================================================================
// Every trace of a secret (Entropy, Secret phrase, Private Key, WIF, passphrases, salt...)
// goes through 'redactSecret()' (or 'hideSecret()' for single keystrokes):
//
//   'HashedSecretsInConsoleLog' true (default):
//      redactSecret( value ) => "<secret #3f9a1c07 (64)>"
//                                HMAC-SHA256( session key, value ) truncated to 8 hex digits,
//                                and the length of the value. The key is drawn at random when
//                                the Main process starts: the same value gives the same
//                                fingerprint during the session (to check that the right value
//                                goes through the workflow) but fingerprints can't be reversed
//                                with a dictionary nor compared between 2 sessions.
//      hideSecret( value )   => "<secret hidden (1)>"
//                                no fingerprint: for single keystrokes, where equal fingerprints
//                                would show which characters are repeated.
//   'HashedSecretsInConsoleLog' false (debug only): the value in clear text.
//
//   undefined, null and '' are returned as is ("UNDEFINED" remains readable).
//
// Renderer: 'log_utils.js' is loaded by a <script> tag (no Node 'crypto', no session key).
//   'redactSecret()' / 'hideSecret()' return a MARKER around the value, and the message is sent to
//   the Main process by 'trace2Main()'. The Main process replaces the markers with
//   'resolveSecretMarkers()' (one key for both processes: fingerprints can be compared).
//   NB: in the Renderer, a redacted value must be traced with 'trace2Main()', never 'console.log()'.
const SECRET_MARK_BEGIN       = '\u0002';
const SECRET_MARK_END         = '\u0003';
const SECRET_KIND_FINGERPRINT = 'S';
const SECRET_KIND_HIDDEN      = 'H';
const SECRET_MARKER_REGEX     = /\u0002([SH]):([^\u0003]*)\u0003/g;

const SECRET_FINGERPRINT_HEX_LENGTH = 8;
const SECRET_KEY_BYTE_COUNT         = 32;

// Main process (Node 'require', no 'window') or Renderer (<script> tag)
const isMainProcessLog = () => ( typeof window === 'undefined' && typeof require === 'function' );

const isEmptySecret = ( value ) => ( value === undefined || value === null || value === '' );

const secretToText = ( value ) => ( typeof value === 'string' ) ? value : JSON.stringify( value );

const setHashedSecretsInConsoleLog = ( flag ) => {
	PrettyLog.This.hashedSecrets = flag;
}; // setHashedSecretsInConsoleLog()

// Main process only. NB: used by unit tests to get reproducible fingerprints
const setSecretFingerprintKey = ( key ) => {
	PrettyLog.This.secret_key = key;
}; // setSecretFingerprintKey()

const getSecretFingerprintKey = () => {
	if ( PrettyLog.This.secret_key == undefined ) {
		PrettyLog.This.secret_key = require('crypto').randomBytes( SECRET_KEY_BYTE_COUNT );
	}
	return PrettyLog.This.secret_key;
}; // getSecretFingerprintKey()

// Main process only
const getSecretFingerprint = ( text ) => {
	return require('crypto').createHmac( 'sha256', getSecretFingerprintKey() )
	                        .update( text, 'utf8' ).digest( 'hex' )
	                        .substring( 0, SECRET_FINGERPRINT_HEX_LENGTH );
}; // getSecretFingerprint()

// Main process only: text which replaces a secret in the console log
const formatSecret = ( kind, value ) => {
	if ( ! PrettyLog.This.hashedSecrets ) {
		return value; // 'HashedSecretsInConsoleLog' false: clear text (debug)
	}
	const text = secretToText( value );
	if ( kind == SECRET_KIND_HIDDEN ) {
		return "<secret hidden (" + text.length + ")>";
	}
	return "<secret #" + getSecretFingerprint( text ) + " (" + text.length + ")>";
}; // formatSecret()

const markOrFormatSecret = ( kind, value ) => {
	if ( isEmptySecret( value ) ) {
		return value;
	}
	if ( isMainProcessLog() ) {
		return formatSecret( kind, value );
	}
	// Renderer: resolved by the Main process (see 'resolveSecretMarkers()')
	return SECRET_MARK_BEGIN + kind + ':' + encodeURIComponent( secretToText( value ) ) + SECRET_MARK_END;
}; // markOrFormatSecret()

const redactSecret = ( value ) => markOrFormatSecret( SECRET_KIND_FINGERPRINT, value );

const hideSecret   = ( value ) => markOrFormatSecret( SECRET_KIND_HIDDEN, value );

// Main process: replaces the markers of a message sent by the Renderer ('trace2Main()')
const resolveSecretMarkers = ( msg ) => {
	if ( typeof msg !== 'string' ) {
		return msg;
	}
	return msg.replace( SECRET_MARKER_REGEX, ( match, kind, encoded_value ) => {
		let value = undefined;
		try {
			value = decodeURIComponent( encoded_value );
		}
		catch ( err ) {
			return "<secret hidden>"; // malformed marker: never shown
		}
		return formatSecret( kind, value );
	});
}; // resolveSecretMarkers()


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
	
	exports.SECRET_FINGERPRINT_HEX_LENGTH = SECRET_FINGERPRINT_HEX_LENGTH
	exports.setHashedSecretsInConsoleLog  = setHashedSecretsInConsoleLog
	exports.setSecretFingerprintKey       = setSecretFingerprintKey
	exports.redactSecret                  = redactSecret
	exports.hideSecret                    = hideSecret
	exports.resolveSecretMarkers          = resolveSecretMarkers
} // 'log_utils.js' exports