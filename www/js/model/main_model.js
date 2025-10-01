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

const { Skribi }       = require('../util/log/skribi.js'); 

const { pretty_func_header_log,
        pretty_log }      = require('../util/log/log_utils.js');
		
const { VERSION, 
		NULL_KEY, NULL_KEYPAIR_VALUE,
		QR_CODE, QR_SCALE,
		EXE_LAUNCHER, LANG, WALLET_MODE,
        BLOCKCHAIN, ENTROPY, ENTROPY_SIZE, 
        MNEMONICS, WIF, WORD_INDEXES,
		BIP32_PASSPHRASE, BIP38_PASSPHRASE, DERIVATION_PATH, ACCOUNT, ADDRESS_INDEX, 
		HD_WALLET_TYPE, SWORD_WALLET_TYPE, 
	  }                   = require('../const_keywords.js');
	  
const { COIN, COIN_ABBREVIATIONS, BLOCKCHAIN_EXPLORER 
      }                   = require('../crypto/const_blockchains.js');
	  
const { ADDRESS, 
        PRIV_KEY, PRIVATE_KEY, BIP38_ENCRYPTED_PK   
      }                   = require('../crypto/const_wallet.js');

const { WalletInfoTemplate   
      }                   = require('./wallet_info_tmpl.js');	  
	  
	  
const { Bip38Utils }      = require('../crypto/bip38_utils.js');
	  
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
	static #Key = {};
	static #Singleton = new MainModel( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if( MainModel.#Singleton == undefined ) {
			MainModel.#Singleton = new MainModel();
			if (MainModel.#InstanceCount > 0) {
				throw new TypeError("'MainModel' constructor called more than once");
			}
			MainModel.#InstanceCount++;
        }
        return MainModel.#Singleton;
    } // MainModel 'This' getter 

    // ** Private constructor **
	constructor( key ) {
		if ( key !== MainModel.#Key ) {
			throw new TypeError("'MainModel' constructor is private");
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
				options[QR_SCALE] = 1;				
				options["width"]  = 250;
				options["height"] = 250;
			}	
			else if ( qrcode_type == "rectangularmicroqrcode" ) {	
				options[QR_SCALE] = 5;
			}	
			bwipjs.toBuffer( options, writePNGfile );
		}
		else if ( filetype == "svg" ) {
			//Skribi.log("qrcode_text: '" + qrcode_text + "'");
			options[QR_SCALE] = 1;

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
		
		console.log(">> ----- crypto_info: \n" + JSON.stringify(crypto_info));
		let lang = crypto_info[LANG];
		
		output_path = output_path + "_" + coin + "_" + lang;
		
		if ( ! fs.existsSync( output_path ) ) {
			fs.mkdirSync( output_path, { recursive: true } );
		}
		
		let wallet_keys = Object.keys( crypto_info );	
		
		let private_key        = "";
		let bip38_encrypted_pk = "";
		let pk_key             = "";
		let wif                = ""; 
		let entropy            = crypto_info[ENTROPY];
		
		const preprocess_crypto_info_for_Bip38 = ( crypto_info ) => {
			if ( 	 crypto_info[BIP38_PASSPHRASE] != undefined  &&  crypto_info[BIP38_PASSPHRASE] != '' 
			     &&  crypto_info[PRIVATE_KEY] != undefined  &&  crypto_info[PRIVATE_KEY] != '' )  {
				// console.log("   ---------------- BIP38_PASSPHRASE FOUND !! ----------------");
				let private_key       =  crypto_info[PRIVATE_KEY];
				// console.log("   Private Key: " + private_key);
				
				let bip38_passphrase  =  crypto_info[BIP38_PASSPHRASE];
				// console.log("   Bip38 Passphrase: " + bip38_passphrase);
				
				let bip38_encryted_pk = Bip38Utils.This.encrypt( private_key, bip38_passphrase );
				// console.log("   Bip38 Encrypted PK: " + bip38_encryted_pk);
				
				crypto_info[BIP38_ENCRYPTED_PK] = bip38_encryted_pk;
			}
		}; // preprocess_crypto_info_for_Bip38
				
		preprocess_crypto_info_for_Bip38( crypto_info );
		
		const fill_wallet_info_str = ( crypto_info ) => {	
			console.log("\n\n\n>> ==================== MainModel 'fill_wallet_info_str' ====================");			
		
			let wallet_keys = Object.keys( crypto_info );
			
			let current_line  = {};
			
			let current_key   = "";
			let current_keys  = [];
			
			let current_value = "";
			let index         = -1;			
			
			WalletInfoTemplate.This.clear();
			
			console.log("\n   ========== Step 0 ========== FILL 'wallet_info_str' with 'crypto_info'");
			console.log("crypto_info:\n" + JSON.stringify(crypto_info));
			
			let template_items = WalletInfoTemplate.This.getItems();
			console.log("\n   ========== Step 1 ========== [FILL 2]");
			console.log("   [Fill 2] template_items: \n" + JSON.stringify(template_items));
			// console.log("   template_items.length: " + template_items.length);
			
			for ( let i=0; i < wallet_keys.length; i++ ) {	
				// console.log("\n   ------------------------");
				current_key = wallet_keys[i];
				
				index = WalletInfoTemplate.This.getIndexInTemplate( current_key );
				// console.log("   [Fill 2] index of '" + current_key + "' key : " + index);
				
				current_value = crypto_info[current_key];
				
				if ( index != -1 ) {	
					if ( current_key == ENTROPY_SIZE ) {					
						current_value += " bits";					
					}
					else if ( current_key == DERIVATION_PATH ) {					
						if (! current_value.endsWith("'")) { 
							current_value += "'"; // NB: switch to systematic Hardened adresses	
						}				
					}		
					
					// console.log(">> MainModel fill_wallet_info_str_2  index: " + index + "  current_value: '" + current_value + "'");
					WalletInfoTemplate.This.setItemValue( index, current_value); 
					
					let current_tmpl_item = WalletInfoTemplate.This.getItem( index );
					// console.log("   current_tmpl_item: " + JSON.stringify(current_tmpl_item));
				}
			}
			
			let wallet_info_str      = "";
			let wallet_info_str_line = "";
			
			WalletInfoTemplate.This.removeEmptyItems();
			
			template_items = WalletInfoTemplate.This.getItems();
			
			console.log("\n   ========== Step 2 ========== [FILL 2]");
			console.log("   template_items: \n" + JSON.stringify(template_items));
			// console.log("   template_items.length: " + template_items.length);
						
			for ( let i=0; i < template_items.length; i++ ) {
				let current_line = template_items[i];		
				
                let current_tmpl_item = WalletInfoTemplate.This.getItem(i);

				// console.log("   ------------------------");			
				// console.log("   current_tmpl_item:\n" + JSON.stringify(current_tmpl_item));				
				
				current_key = WalletInfoTemplate.This.getItemKey( i );

				if ( current_key != NULL_KEY ) {
					current_value = WalletInfoTemplate.This.getItemValue( i );		

					let end_of_line = '\n';
					if ( (i + 1) ==  template_items.length ) {	
						end_of_line = '';
					}					
					wallet_info_str_line = current_key.padEnd(24,' ') + current_value + end_of_line;
						
					console.log("   wallet_info_str[ index: " + i + "  key: '" + current_key + "' ]: " + current_value);										
					wallet_info_str += wallet_info_str_line;
				}
			}
			
			console.log(">> ========== END of MainModel 'fill_wallet_info_str'");
			
			return wallet_info_str;
		}; // fill_wallet_info_str()	 
		
		let wallet_info_str = fill_wallet_info_str( crypto_info );
		pretty_log( "MMdlSaveWinf> wallet_info_str", wallet_info_str );	
		fs.writeFileSync( output_path + "/wallet_info.txt", wallet_info_str, error_handler );		
		
	
		this.createQRCode( output_path, "Address.png", crypto_info[ADDRESS], QR_CODE );		
		
		// pretty_log( "MMdlSqvWinf> QRcode", "PrivateKey.png" );
		// pretty_log( "MMdlSqvWinf> private_key", "'" + private_key + "'" );
		
		private_key        = crypto_info[PRIVATE_KEY];
		wif                = crypto_info[WIF];
		bip38_encrypted_pk = crypto_info[BIP38_ENCRYPTED_PK];
		
		const is_not_null = ( in_str ) => {
			if (  in_str != undefined  && in_str !=  'undefined'  &&  in_str != ""  &&  in_str != ''   ) {
				return true;			
			}
			return false;
		}; // is_not_null()
		
		if (  is_not_null(private_key) ) {
			this.createQRCode( output_path, "PrivateKey.png", private_key, QR_CODE );			
        }	
		
		if ( is_not_null(wif) ) {
			this.createQRCode( output_path, "WIF.png", wif, QR_CODE );
		}
		
		if (  is_not_null(bip38_encrypted_pk) ) {
			this.createQRCode( output_path, "Bip38_Encrypted_PK.png", bip38_encrypted_pk, QR_CODE );
		}
		
		this.createQRCode( output_path, "SecretPhrase.png", crypto_info[MNEMONICS], QR_CODE );	
		
			// -------------------- Fill 'xtras' subfolder --------------------
			let subfolder = "xtras";
			FileUtils.CreateSubfolder( output_path, subfolder );
			
			let subfolder_path = output_path + "/" + subfolder;		
			
			this.createQRCode( subfolder_path, "Entropy_rMQR.png",      entropy, 'rectangularmicroqrcode', 'png' );
			this.createQRCode( subfolder_path, "Entropy_Ultracode.png", entropy, 'ultracode', 'png' );
			
			//-------- SVG output --------		
			this.createQRCode( subfolder_path, "Address.svg",           crypto_info[ADDRESS], 'qrcode', 'svg' );
			
			if (  is_not_null(private_key) ) {	
				this.createQRCode( subfolder_path, "PrivateKey.svg",    private_key, 'qrcode', 'svg' );
			}
			
			if (  is_not_null(bip38_encrypted_pk) ) {	
				this.createQRCode( subfolder_path, "Bip38_Encrypted_PK.svg", bip38_encrypted_pk, 'qrcode', 'svg' );
			}
			
			this.createQRCode( subfolder_path, "Entropy_rMQR.svg",      entropy, 'rectangularmicroqrcode', 'svg' );
			this.createQRCode( subfolder_path, "Entropy_Ultracode.svg", entropy, 'ultracode', 'svg' );
			
			if ( is_not_null(wif) ) {
				this.createQRCode( subfolder_path, "WIF.svg", wif, 'qrcode', 'svg' );
			}
			
			this.createQRCode( subfolder_path, "SecretPhrase.svg", crypto_info[MNEMONICS], 'qrcode', 'svg' );
			//-------- SVG output
			// -------------------- Fill 'xtras' subfolder
		
		let output_file_path = this.saveWalletInfoAsJson( output_path, crypto_info, timestamp );
		
		return output_file_path;
	} // saveWalletInfo()

	saveWalletInfoAsJson( output_path, crypto_info, timestamp ) {
		pretty_func_header_log( "MainModel.saveWalletInfoAsJson" );		
		
		let json_data = {};
		
		json_data[WALLET_MODE] = crypto_info[WALLET_MODE];

		if ( json_data[WALLET_MODE] == HD_WALLET_TYPE || json_data[WALLET_MODE] == SWORD_WALLET_TYPE ) {
			json_data[BIP32_PASSPHRASE] = crypto_info[BIP32_PASSPHRASE];
		}
			
		console.log(">> VERSION: '" + VERSION + "'");	
		json_data[VERSION]     = this.getAppVersion();
		json_data["timestamp"] = timestamp;
		json_data[BLOCKCHAIN]  = crypto_info[BLOCKCHAIN];
		json_data[COIN]        = COIN_ABBREVIATIONS[json_data[BLOCKCHAIN]];
		
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
		json_data[BLOCKCHAIN_EXPLORER]   = crypto_info[BLOCKCHAIN_EXPLORER];
		
		if ( crypto_info[PRIVATE_KEY] != undefined ) {
			json_data[PRIVATE_KEY] = crypto_info[PRIVATE_KEY];
        }
		
		if ( crypto_info[WIF] != undefined ) {
            json_data[WIF] = crypto_info[WIF];			
		}
		
		if ( crypto_info[MNEMONICS] != undefined ) {
			json_data[MNEMONICS] = crypto_info[MNEMONICS];
		}	
		else {    
            json_data[MNEMONICS] = crypto_info[MNEMONICS];           			
		}
		
		// -------- "Bip32 passphrase" in 'wallet_info.wits' --------
		if ( crypto_info[BIP32_PASSPHRASE] != undefined ) {
            json_data[BIP32_PASSPHRASE] = crypto_info[BIP32_PASSPHRASE];			
		}
		// -------- "Bip32 passphrase" in 'wallet_info.wits'
		
		// -------- "Bip38 passphrase" in 'wallet_info.wits' --------
		if ( crypto_info[BIP38_PASSPHRASE] != undefined ) {
            json_data[BIP38_PASSPHRASE] = crypto_info[BIP38_PASSPHRASE];			
		}
		// -------- "Bip38 passphrase" in 'wallet_info.wits'
		
        json_data[WORD_INDEXES] = crypto_info[WORD_INDEXES];
		
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
		
        json_data[LANG] = crypto_info[LANG];			

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
		// Skribi.log( "MainModel.getAppVersion" );
		
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