// ======================================================================================
// ================================== options_file.js ===================================
// ======================================================================================
// Main process: read 'www/config/options.json', regenerate it when it is missing.
//
//   1. 'options.json' present (and not empty)  => read it
//   2. 'options.json' missing (or empty: "", "{}", "[]")
//      => copy 'defaults/options.json' to 'options.json'
//   3. 'defaults/options.json' missing as well (or invalid JSON)
//      => write 'options.json' from the built-in copy (DEFAULT_OPTIONS of const_default_options.js)
//
//   - 'options.json' with INVALID JSON is never overwritten (it may hold edits made by hand):
//     the built-in options are used in memory and 'error' explains why.
//   - If 'options.json' cannot be written (e.g. read-only installation folder) the options
//     are used in memory and 'error' explains why: no exception.
//   - The returned options are always a COPY: DEFAULT_OPTIONS is never modified.
//
// This module does not log anything (the caller does): it is pure and testable without Electron.
"use strict";

const fs   = require('fs');
const path = require('path');

const OPTIONS_FILENAME      = 'options.json';
const DEFAULTS_SUBDIR       = 'defaults';
const EMPTY_OPTIONS_TEXTS   = [ '', '{}', '[]' ];

const OPTIONS_SOURCE_FILE          = 'file';          // options.json read as is
const OPTIONS_SOURCE_DEFAULTS_FILE = 'defaults_file'; // from defaults/options.json
const OPTIONS_SOURCE_BUILTIN       = 'builtin';       // from DEFAULT_OPTIONS

const cloneOptions = ( options ) => JSON.parse( JSON.stringify( options ) );

const isEmptyOptionsText = ( text ) => EMPTY_OPTIONS_TEXTS.includes( text.trim() );

const getOptionsPaths = ( config_path ) => ( {
	options_path:  path.join( config_path, OPTIONS_FILENAME ),
	defaults_path: path.join( config_path, DEFAULTS_SUBDIR, OPTIONS_FILENAME )
} ); // getOptionsPaths()

// Returns { options, source, written, error }
//   source:  OPTIONS_SOURCE_FILE | OPTIONS_SOURCE_DEFAULTS_FILE | OPTIONS_SOURCE_BUILTIN
//   written: true if 'options.json' was (re)generated
//   error:   undefined, or a message to log
const readOrRegenerateOptions = ( config_path, builtin_defaults, fs_impl = fs ) => {
	const { options_path, defaults_path } = getOptionsPaths( config_path );

	// ---------- 1. 'options.json' present ----------
	if ( fs_impl.existsSync( options_path ) ) {
		const options_text = fs_impl.readFileSync( options_path, 'utf8' );
		if ( ! isEmptyOptionsText( options_text ) ) {
			try {
				return { options: JSON.parse( options_text ), source: OPTIONS_SOURCE_FILE, written: false };
			}
			catch ( err ) {
				// NB: not overwritten, it may hold edits made by hand
				return { options: cloneOptions( builtin_defaults ), source: OPTIONS_SOURCE_BUILTIN, written: false,
				         error: "Invalid JSON in '" + options_path + "' (file left unchanged, built-in options used): "
				                + err.message };
			}
		}
		// empty file: regenerated like a missing one
	}

	// ---------- 2. copy of 'defaults/options.json' ----------
	if ( fs_impl.existsSync( defaults_path ) ) {
		const defaults_text = fs_impl.readFileSync( defaults_path, 'utf8' );
		let defaults_options = undefined;
		try {
			defaults_options = JSON.parse( defaults_text );
		}
		catch ( err ) {
			defaults_options = undefined; // invalid: fall back to the built-in copy (step 3)
		}

		if ( defaults_options != undefined && ! isEmptyOptionsText( defaults_text ) ) {
			try {
				fs_impl.copyFileSync( defaults_path, options_path );
				return { options: defaults_options, source: OPTIONS_SOURCE_DEFAULTS_FILE, written: true };
			}
			catch ( err ) {
				return { options: defaults_options, source: OPTIONS_SOURCE_DEFAULTS_FILE, written: false,
				         error: "Unable to write '" + options_path + "' (options used in memory): " + err.message };
			}
		}
	}

	// ---------- 3. built-in copy (DEFAULT_OPTIONS) ----------
	const builtin_options = cloneOptions( builtin_defaults );
	try {
		fs_impl.writeFileSync( options_path, JSON.stringify( builtin_options, null, 2 ) + '\n' );
		return { options: builtin_options, source: OPTIONS_SOURCE_BUILTIN, written: true };
	}
	catch ( err ) {
		return { options: builtin_options, source: OPTIONS_SOURCE_BUILTIN, written: false,
		         error: "Unable to write '" + options_path + "' (options used in memory): " + err.message };
	}
}; // readOrRegenerateOptions()

if ( typeof exports === 'object' ) {
	exports.OPTIONS_FILENAME             = OPTIONS_FILENAME
	exports.OPTIONS_SOURCE_FILE          = OPTIONS_SOURCE_FILE
	exports.OPTIONS_SOURCE_DEFAULTS_FILE = OPTIONS_SOURCE_DEFAULTS_FILE
	exports.OPTIONS_SOURCE_BUILTIN       = OPTIONS_SOURCE_BUILTIN
	exports.cloneOptions                 = cloneOptions
	exports.getOptionsPaths              = getOptionsPaths
	exports.readOrRegenerateOptions      = readOrRegenerateOptions
} // exports of options_file.js
