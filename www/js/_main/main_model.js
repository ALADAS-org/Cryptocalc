// =====================================================================================
// ===============================     main_model.js     ===============================
// =====================================================================================
// https://www.electronjs.org/docs/latest/tutorial/quick-start
"use strict";

// ===============================  MainModel class  ===============================
// NB: "Singleton" class
// * static GetInstance()
//   createQRCode( path, filename, qrcode_text, qrcode_type, filetype )
//   saveWalletInfo( crypto_info ) 
//   saveWalletInfoAsJson( output_path, crypto_info, timestamp )
// * async  getAppVersion()
// ------------------------------------------------------
const { app } = require('electron');	

const fs               = require('fs');
const bwipjs           = require('bwip-js');

const { Skribi }          = require('../util/log/skribi.js'); 

const { pretty_func_header_log,
        pretty_log }      = require('../util/log/log_utils.js');
const { EXE_LAUNCHER, LANG, WALLET_MODE,
        BLOCKCHAIN, ENTROPY, ENTROPY_SIZE, 
        MNEMONICS, WIF,
		PASSWORD, DERIVATION_PATH, ACCOUNT, ADDRESS_INDEX, 
		HD_WALLET_TYPE, SWORD_WALLET_TYPE, 
	  }                   = require('../const_keywords.js');
const { COIN, COIN_ABBREVIATIONS
      }                   = require('../crypto/const_blockchains.js');
const { ADDRESS, 
        PRIV_KEY, PRIVATE_KEY   
      }                   = require('../crypto/const_wallet.js');
const { getDayTimestamp } = require('../util/system/timestamp.js');	
const { isString }        = require('../util/values/string_utils.js');
const { FileUtils }       = require('../util/system/file_utils.js');	
const { isHexString, 
	  }                   = require('../crypto/hex_utils.js');
	  
const error_handler = (err) => { 
	if ( err ) return Konsole.log( "error: " + err );
	Skribi.log('saving file... '+ filename); 
}; // error_handler()
		
class MainModel {
	static #key = {};
	static #_Singleton = new MainModel( this.#key );
	static #_InstanceCount = 0;
	
	static GetInstance() {
		if( MainModel.#_Singleton == undefined ) {
			MainModel.#_Singleton = new MainModel();
			if (MainModel.#_Singleton > 0) {
				throw new TypeError("MainModel constructor called more than once.");
			}
			MainModel.#_Singleton++;
        }
        return MainModel.#_Singleton;
    } // MainModel.GetInstance() 

    // ** Private constructor **
	constructor( key ) {
		if ( key !== MainModel.#key ) {
			throw new TypeError("MainModel constructor is private.");
		}	
        this.app_version = "XX";		
	} // ** Private constructor **
	
	// https://github.com/metafloor/bwip-js/blob/master/README.md
	createQRCode( path, filename, qrcode_text, qrcode_type, filetype ) {
		// pretty_func_header_log( "MainModel.createQRCode", filename );
		// pretty_log( "qrcode_text", "'" + qrcode_text + "'" );
		
		if ( filetype == undefined ) {
			filetype = "png";
		}

		let options = {};
			options["text"]            = qrcode_text;
			options["bcid"]            = qrcode_type;	
			options["backgroundcolor"] = "FFFFFF";
			options["showborder"]      = true;
			options["borderwidth"]     = 1;
			options["bordercolor"]     = "FFFFFF";

		const writePNGfile = ( err, png_data ) => {
			if ( err ) { // `err` may be a string or Error object
				 Skribi.log( "error " + err );
			} 
			else {
			  fs.writeFileSync( path + "/" + filename, png_data, "binary", 
				 (err) => { if ( ! err ) 
							  Skribi.log(`${filename} created successfully!`);
						  }
			  );
			}
		}; // writePNGfile

		let qrcode_text_bit_count = 256;
		if ( qrcode_type == "rectangularmicroqrcode" ) {				
			let version = "R15x77";
			if ( isHexString( qrcode_text ) )  {
				qrcode_text_bit_count = qrcode_text.length * 4;			
				if ( qrcode_text_bit_count <= 192 ) { 			
					version = "R15x59";
				}
			}				
			options["version"] = version;
			options["eclevel"] = "M";
		}	

		if ( filetype == "png" ) {			
			if ( qrcode_type == "qrcode" ) {	
				options["scale"]  = 1;				
				options["width"]  = 250;
				options["height"] = 250;
			}	
			else if ( qrcode_type == "rectangularmicroqrcode" ) {	
				options["scale"] = 5;
			}	
			bwipjs.toBuffer( options, writePNGfile );
		}
		else if ( filetype == "svg" ) {
			//Skribi.log("qrcode_text: '" + qrcode_text + "'");
			options["scale"] = 1;

			let svg_data = bwipjs.toSVG( options );
			fs.writeFileSync( path + "/" + filename, svg_data, "binary", 
				 (err) => { if ( ! err ) 
							  Skribi.log(`${filename} created successfully!`);
						  }
			);
		}
    } // createQRCode()
	
	saveWalletInfo( crypto_info ) {
		pretty_func_header_log( "MainModel.saveWalletInfo" );
		
		let timestamp   = getDayTimestamp();
		let output_path = app.getAppPath() + "/_output/" + timestamp;
		
		let blockchain = crypto_info[BLOCKCHAIN];
		pretty_log( BLOCKCHAIN, crypto_info[BLOCKCHAIN] );
		
		let coin = COIN_ABBREVIATIONS[blockchain];
		pretty_log( COIN, coin );
		
		//--- 4 Daniel
		let lang = crypto_info[LANG];
		//--- Daniel Private
		
		//output_path = output_path + "_" + coin;
		output_path = output_path + "_" + coin + "_" + lang;
		//--- 4 Daniel
		
		if ( ! fs.existsSync( output_path ) ) {
			fs.mkdirSync( output_path, { recursive: true } );
		}
		
		let wallet_keys = Object.keys( crypto_info );		
		let private_key = "";
		let pk_key      = "";
		let wif         = ""; 
		let entropy     = crypto_info["Entropy"];
		
		let wallet_info_str = "";
		// ---------- fill 'wallet_info_str' ----------
		for ( let i=0; i < wallet_keys.length; i++ ) {
			let current_key = wallet_keys[i];
			// pretty_log( "current_key", current_key );
			
			if (   current_key == PRIV_KEY 
				|| current_key == PRIVATE_KEY || current_key == PRIVATE_KEY ) {
				
				pk_key = current_key;
				//Skribi.log("wallet_keys[" + i + "]: " + current_key);					
				private_key = crypto_info[pk_key];	
				//Skribi.log("private_key: " + private_key);					
			}				
			else {
				// Skribi.log("wallet_keys[" + i + "]: " + current_key);
			}
			
			if ( current_key == WIF ) {					
				wif = crypto_info[current_key];					
			} 

            let current_value = crypto_info[current_key];
			if ( current_key == ENTROPY_SIZE ) {					
				current_value += " bits";					
			}
			else if ( current_key == DERIVATION_PATH ) {					
				if (! current_value.endsWith("'")) { 
					current_value += "'"; // NB: switch to systematic Hardened adresses	
				}				
			}			

			// *BUG* in crypto_info: current_key == crypto_info[current_key] 
			if (    current_key != crypto_info[current_key]  
			    &&  current_value != undefined  &&  current_value != 'undefined' ) 	{ 				
				wallet_info_str += current_key.padEnd(22,' ') + current_value + '\n';
			}	
		}
		// ---------- fill 'wallet_info_str'
		
		// 
		pretty_log( "MMdlSaveWinf> wallet_info_str", wallet_info_str );		
		
		wallet_info_str = wallet_info_str.substring( 0, wallet_info_str.length - 1 );
		
		fs.writeFileSync( output_path + "/wallet_info.txt", wallet_info_str, error_handler );
	
		this.createQRCode( output_path, "Address.png", crypto_info['address'], 'qrcode' );		
		
		// pretty_log( "MMdlSqvWinf> QRcode", "PrivateKey.png" );
		// pretty_log( "MMdlSqvWinf> private_key", "'" + private_key + "'" );
		if (  private_key != undefined  &&  private_key != ""  && private_key != 'undefined' ) {
			this.createQRCode( output_path, "PrivateKey.png", private_key, 'qrcode' );			
        }	
		
		if ( wif != "" ) this.createQRCode( output_path, "WIF.png", wif, 'qrcode' );
		
		this.createQRCode( output_path, "Seedphrase.png", crypto_info[MNEMONICS], 'qrcode' );	
		
		let subfolder = "xtras";
		FileUtils.CreateSubfolder( output_path, subfolder );
		
		let subfolder_path = output_path + "/" + subfolder;		
		
		this.createQRCode( subfolder_path, "Entropy_rMQR.png",      entropy, 'rectangularmicroqrcode', 'png' );
		this.createQRCode( subfolder_path, "Entropy_Ultracode.png", entropy, 'ultracode', 'png' );
		
		//-------- SVG output --------		
		this.createQRCode( subfolder_path, "Address.svg",           crypto_info['address'], 'qrcode', 'svg' );
		
		//pretty_log( "MMdlSqvWinf> QRcode", "PrivateKey.svg" );
		//pretty_log( "MMdlSqvWinf> private_key", "'" + private_key + "'" );
		if (  private_key != undefined  &&  private_key != ""  && private_key != 'undefined' ) {	
			this.createQRCode( subfolder_path, "PrivateKey.svg",    private_key, 'qrcode', 'svg' );
		}
		
		this.createQRCode( subfolder_path, "Entropy_rMQR.svg",      entropy, 'rectangularmicroqrcode', 'svg' );
		this.createQRCode( subfolder_path, "Entropy_Ultracode.svg", entropy, 'ultracode', 'svg' );
		
		if ( wif != "" )   this.createQRCode( subfolder_path, "WIF.svg", wif, 'qrcode', 'svg' );
			
		this.createQRCode( subfolder_path, "Seedphrase.svg", crypto_info[MNEMONICS], 'qrcode', 'svg' );
		//-------- SVG output
		
		let output_file_path = this.saveWalletInfoAsJson( output_path, crypto_info, timestamp );		
		return output_file_path;
	} // saveWalletInfo()

	saveWalletInfoAsJson( output_path, crypto_info, timestamp ) {
		pretty_func_header_log( "MainModel.saveWalletInfoAsJson" );		
		
		let json_data = {};
		
		json_data[WALLET_MODE]    = crypto_info[WALLET_MODE];

		if ( json_data[WALLET_MODE] == HD_WALLET_TYPE || json_data[WALLET_MODE] == SWORD_WALLET_TYPE ) {
			if ( crypto_info[PASSWORD] != undefined && crypto_info[PASSWORD] != "") {
				json_data[PASSWORD] = crypto_info[PASSWORD];
			}
		}
			
		json_data["Version"]     = this.getAppVersion();
		json_data["timestamp"]   = timestamp;
		json_data[BLOCKCHAIN]    = crypto_info[BLOCKCHAIN];
		json_data[COIN]          = COIN_ABBREVIATIONS[json_data[BLOCKCHAIN]];
		
		//---------- ENTROPY_SIZE ----------
		pretty_log( "ENTROPY_SIZE", ENTROPY_SIZE );
		let entropy_size = crypto_info[ENTROPY_SIZE];
		pretty_log( "#swajson entropy_size", entropy_size );
		if ( isString( entropy_size ) ) {
			entropy_size = parseInt( entropy_size ); 
			pretty_log( "#swajson entropy_size", entropy_size );
		}
		json_data[ENTROPY_SIZE]          = entropy_size;
		//---------- ENTROPY_SIZE
		
		json_data[ENTROPY]               = crypto_info[ENTROPY];
		
		json_data[ADDRESS]               = crypto_info[ADDRESS];
		json_data["Blockchain Explorer"] = crypto_info["Blockchain Explorer"];
		
		if ( crypto_info[PRIVATE_KEY] != undefined ) {
			json_data[PRIVATE_KEY]   = crypto_info[PRIVATE_KEY];
        }
		
		if ( crypto_info[WIF] != undefined ) {
            json_data[WIF]               = crypto_info[WIF];			
		}
		
		if ( crypto_info["Seedphrase"] != undefined ) {
			json_data[MNEMONICS]         = crypto_info["Seedphrase"];
		}	
		else {                                            
		    json_data[MNEMONICS]         = crypto_info[MNEMONICS];		
		}
		
        json_data["Word indexes"]        = crypto_info["Word indexes"];
		
		//---------- DERIVATION_PATH ----------
		if ( crypto_info[DERIVATION_PATH] != undefined ) {
			let derivation_path = crypto_info[DERIVATION_PATH]; // <v> 
			let derivation_path_items = derivation_path.split('/')
			pretty_log( "derivation_path_items", derivation_path_items.length );
			if ( derivation_path_items.length == 6 ) {
				let account = derivation_path_items[3];
				account = account.replaceAll( "'", "" ); 
				//pretty_log( "account", account );
				json_data[ACCOUNT] = account;
				
				// ---------- 'address index' ----------
				let address_index = derivation_path_items[5];
				// address_index = address_index.replaceAll( "'", "" ); // NB: switch to systematic Hardened adresses
				if (! address_index.endsWith("'")) { 
					address_index += "'"; // NB: switch to systematic Hardened adresses	
				}	
				// ---------- 'address index'				
	
				//pretty_log( "address_index", address_index );				
				json_data[ADDRESS_INDEX] = address_index;
			}
			//json_data[DERIVATION_PATH]       = crypto_info[DERIVATION_PATH];
		}
		//---------- DERIVATION_PATH
		
        json_data[LANG]                  = crypto_info[LANG];			

        let output_file_path = output_path + "/wallet_info.wits"; 
		fs.writeFileSync( output_file_path, JSON.stringify( json_data ), error_handler );
		
		return output_file_path; 
	} // saveWalletInfoAsJson()
	
	loadWalletInfoFromJson( input_file_path ) {
		pretty_func_header_log( "MainModel.loadWalletInfoFromJson" );
		let json_data_str = fs.readFileSync( input_file_path, error_handler );
		return JSON.parse( json_data_str );
	} // loadWalletInfoFromJson()
	
	getAppVersion() { 
		Skribi.log( "MainModel.getAppVersion" );
		
		//let program = "";
		//if (  process.argv.length > 0 ) { 
		//	program = process.argv[0];
		//}
		//Skribi.log("** MainMdl.getV> program: " + program);
		//let program_items = program.split("\\");
		
		// check if "AppData" and "Local" in 'program_items'
		//if (    program_items.length > 0 
		//     && program_items.includes('AppData') && program_items.includes('Local') ) { 
		//	program = program_items[program_items.length - 1];
		//}
		//Skribi.log("** MainMdl.getV> program: " + program);
		
		let app_version = "X.X.X";
		//if ( program = EXE_LAUNCHER ) { 
			app_version = require('../../../package.json').version;
			// Skribi.log("** MainMdl.getV> app_version(package.json): " + app_version);
		//}
		
		//Skribi.log("** MainMdl.getV> app_version: " + app_version);		

		return app_version;
	} // getAppVersion()
} // MainModel class

if (typeof exports === 'object') {
	exports.MainModel = MainModel
} // exports of 'main_model.js'