// =====================================================================================
// =================================  bip39_utils.js  ==================================
// =====================================================================================
// References:
// https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
// https://www.blockplate.com/blogs/blockplate/how-a-seed-phrase-is-created
// https://github.com/massmux/HowtoCalculateBip39Mnemonic
// Reference waterfall:
// * https://mdrza.medium.com/how-to-convert-mnemonic-12-word-to-private-key-address-wallet-bitcoin-and-ethereum-81aa9ca91a57
// https://bitcointalk.org/index.php?topic=5288888.0
// BIP32: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
//
// https://support.ledger.com/hc/fr-fr/articles/4415198323089-Comment-un-appareil-Ledger-g%C3%A9n%C3%A8re-une-phrase-de-r%C3%A9cup%C3%A9ration-de-24-mots&language-suggestion?docs=true
const sha256         = require('js-sha256');
const { sha512 }     = require('js-sha512');
const { Base64 }     = require('js-base64');
const bs58           = require('bs58');
const Bip39Mnemonic  = require('bitcore-mnemonic');
const bip39          = require('bip39');
const HdAddGen       = require('hdaddressgenerator');
const { v4: uuidv4 } = require('uuid');

// https://bitcoin.stackexchange.com/questions/113286/uncaught-typeerror-bip32-fromseed-is-not-a-function
//const bip32         = require('bip32'); => ERROR: "bip32.fromSeed in not a function"
const ecc = require('tiny-secp256k1')
const { BIP32Factory 
      }             = require('bip32');
// You must wrap a tiny-secp256k1 compatible implementation
const bip32         = BIP32Factory(ecc);

const CS_WORDLIST_JSON = require('@scure/bip39/wordlists/czech');
const CS_WORDLIST      = CS_WORDLIST_JSON['wordlist'];

const PT_WORDLIST_JSON = require('@scure/bip39/wordlists/portuguese');
const PT_WORDLIST      = PT_WORDLIST_JSON['wordlist'];

//const { wordlist as japanese }           = require('@scure/bip39/wordlists/japanese';
//const { wordlist as korean }             = require('@scure/bip39/wordlists/korean';
//const { wordlist as simplifiedChinese }  = require('@scure/bip39/wordlists/simplified-chinese';
//const { wordlist as traditionalChinese } = require('@scure/bip39/wordlists/traditional-chinese';

const { GERMAN_MNEMONICS }    = require('../lib/mnemonics/DE_mnemonics.js');
const { ESPERANTO_MNEMONICS } = require('../lib/mnemonics/EO_mnemonics.js');

const SUPPORTED_LANGS = [ "EN", "DE", "FR", "ES", "IT", "CS", "PT", "EO" ];

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, 
        _GREEN_, _RED_HIGH_, _BLUE_HIGH_,       
		_END_ }              = require('../util/color/color_console_codes.js');
		
const { NULL_COIN, 
	    BITCOIN, ETHEREUM, 
		//BINANCE,
		CARDANO, RIPPLE, 
		DOGECOIN, TRON, 
		LITECOIN, DASH,
		//AVALANCHE,
		MAINNET, TESTNET,
		BLOCKCHAIN, NULL_BLOCKCHAIN,
		COIN_ABBREVIATIONS, COIN_TYPES
      }                      = require('./const_blockchains.js');
	  
const { NULL_HEX,
		CRYPTO_NET,
        ADDRESS, UUID, 
		CHECKSUM, CHAINCODE, 
		MNEMONICS, ENTROPY_HEX,
		MASTER_PK_HEX, ROOT_PK_HEX, WIF, 
		PRIVATE_KEY_HEX, PUBLIC_KEY_HEX 
	  }                      = require('./const_wallet.js');
	  
const { WORD_COUNT, 
        ACCOUNT_INDEX, ADDRESS_INDEX
	  }                      = require('./const_options.js');
		
const { hexToBinary, binaryToHex,
        hexWithPrefix, hexWithoutPrefix, isHexString,
        uint8ArrayToHex, hexToUint8Array 
	  }                      = require('./hex_utils.js');	

// https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
const pad = (n, width, z) => {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}; // pad()	

// ============================================================================================
// ====================================  Bip39Utils class  ====================================
// ============================================================================================
// static Methods: 
// * PrivateKeyToMnemonics( private_key_hex )
// * EntropyToMnemonics( entropy_hex, options )
// * EntropySourceToEntropy( entropy_src_str, options )
// * EntropySourceToMnemonics( entropy_src_str, options )
// * MnemonicsToEntropyInfo( mnemonics )
// * GetWordIndexes( mnemonics, options )
// * WordIndexesToSeedPhrase( word_indexes, lang )
// * GuessMnemonicsLang( mnemonics )
// * CheckMnemonics( mnemonics, private_key, options ) 
// * MnemonicsAs4letter( mnemonics )
// * MnemonicsAsTwoParts( mnemonics )
// * GetBIP39Dictionary( lang )
// * GetOptions( options )
//
class Bip39Utils {
	static PrivateKeyToMnemonics( private_key_hex ) {		
		console.log(">> " + _CYAN_ + "Bip39Utils.PrivateKeyToMnemonics" + _END_);

		let lang       = "EN";		

        // TEST https://github.com/massmux/HowtoCalculateBip39Mnemonic?tab=readme-ov-file 
        // entropy_hex = "656d338db7c217ad57b2516cdddd6d06";
        // TEST
		
		private_key_hex = hexWithoutPrefix( private_key_hex );
		let private_key_byte_count = private_key_hex.length / 2;
		console.log(  "   " + _YELLOW_
		            + Bip39Utils.LabelWithSize("private_key", private_key_byte_count) 
		            + "        " + _END_ + private_key_hex);	
		
		if ( ! isHexString( private_key_hex ) ) {
			let error_msg = "**ERROR** Input for 'Private Key' is Not a in Hexadecimal";
			return error_msg;
		}
		
		if ( private_key_byte_count != 32 ) {
			let error_msg =   "**ERROR** Input for 'Private Key' provides " + private_key_byte_count 
			                + " bytes while 32 are expected";
			return error_msg;
		}		
                                                            
		let word_index            = 0;
		let word                  = "";
		let mnemonics             = "";	
        let private_key_to_sha256 = "";	
		
        // https://github.com/massmux/HowtoCalculateBip39Mnemonic		
		let private_key_bits = hexToBinary( private_key_hex );		
	    let checksum_size = ( (private_key_hex.length / 2) * 8 ) / 32;	
	    let checksum_bits = private_key_bits.substring(0, checksum_size);
		
		console.log(  "   " + _YELLOW_ 
		            + Bip39Utils.LabelWithSize("checksum_bits", checksum_size) 
		            + "       " + _END_ + checksum_bits);
	
	    private_key_bits += checksum_bits;
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		for (let i=0; i < private_key_bits.length; i+=11) {
			let word_index_11bits = private_key_bits.substring( i, i+11 );
			word_index = parseInt( word_index_11bits, 2 ); // convert binary string in decimal
			
			word = LANG_WORDLIST[word_index];
			//console.log("   word: " + word + "  word_index:" + word_index);

			let separator = ((i + 11) >= private_key_bits.length) ? "" : " ";
			mnemonics += word + separator;
		}
		
		return mnemonics;
	} // Bip39Utils.PrivateKeyToMnemonics()
	
	// https://github.com/massmux/HowtoCalculateBip39Mnemonic
	// NB: doesnt hash 'entropy_src_str' if it is hex and provides expected byte count 
	static EntropySourceToEntropy( entropy_src_str, options ) {	
		console.log(">> " + _CYAN_ + "Bip39Utils.EntropySourceToEntropy" + _END_);
		
		options = Bip39Utils.GetOptions( options );
		let word_count = options["word_count"];	

        console.log("   entropy_src_str:\n" + entropy_src_str);		
		console.log("   word_count:             " + word_count);
		
		let checksum_bit_count = Bip39Utils.GetChecksumBitCount( word_count );
		let expected_bit_count = ( word_count * 11 ) - checksum_bit_count;
		console.log("   expected_bit_count:     " + expected_bit_count);
		
		let entropy_hex = "";	
		// test: https://github.com/massmux/HowtoCalculateBip39Mnemonic?tab=readme-ov-file
		// entropy_src_str = "656d338db7c217ad57b2516cdddd6d06";
		// word_count = 12;
		// test
		
		// !! NB !!: there was error here: 
		// SHA256(Uint8Array( entropy_hex )) should be computed, NOT SHA256( entropy_hex )
		if ( isHexString( entropy_src_str ) ) {
			let entropy_binary = hexToBinary( entropy_src_str );
			let entropy_binary_bit_count = entropy_binary.length;
			if ( entropy_binary_bit_count == expected_bit_count ) {
				entropy_hex = entropy_src_str;
			}
			else {
				entropy_hex = sha256( hexToUint8Array( entropy_src_str ) );
			}			
		}
		else { // 'entropy_src_str' is not Hex
			entropy_hex = sha256( entropy_src_str );
		}					

		switch ( word_count ) {
			case 12:	entropy_hex = entropy_hex.substring(0, 32); // [0..31]: first 32 bytes of SHA256
						break;
			case 15:	entropy_hex = entropy_hex.substring(0, 40); // [0..39]: first 40 bytes of SHA256
						break;	
			case 18:	entropy_hex = entropy_hex.substring(0, 48); // [0..47]: first 48 bytes of SHA256
						break;
			case 21:	entropy_hex = entropy_hex.substring(0, 56); // [0..55]: first 56 bytes of SHA256
						break;
		} // word_count
		
		console.log("   entropy_hex:            " + entropy_hex);
		
		return entropy_hex;
	} // Bip39Utils.EntropySourceToEntropy()
	
	static EntropySourceToMnemonics( entropy_src_str, options ) {	
		console.log(">> " + _CYAN_ + "Bip39Utils.EntropySourceToMnemonics" + _END_);
		
		let entropy_hex = Bip39Utils.EntropySourceToEntropy( entropy_src_str, options );
	    console.log("   entropy:           " + entropy_hex);
		
		let mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex, options );
		return mnemonics;
	} // Bip39Utils.EntropySourceToMnemonics()
	
	static EntropyToMnemonics( entropy_hex, options ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.EntropyToMnemonics" + _END_);
		//console.log("   entropy_hex:            " + entropy_hex);
		
		options = Bip39Utils.GetOptions( options );
		let lang          = options["lang"];
		let word_count    = options["word_count"];
		let checksum_size = 4;
        //console.log("   lang: " + lang);		
		
		switch ( word_count ) {
			case 12:	entropy_hex = entropy_hex.substring(0, 32); // [0..31]: first 32 chars of SHA256
						checksum_size = 4;
						break;
						
			case 15:	entropy_hex = entropy_hex.substring(0, 40); // [0..39]: first 40 chars of SHA256
			            checksum_size = 5;
						break;
						
			case 18:	entropy_hex = entropy_hex.substring(0, 48); // [0..47]: first 48 chars of SHA256
						checksum_size = 6;
						break;
						
			case 21:	entropy_hex = entropy_hex.substring(0, 56); // [0..55]: first 56 chars of SHA256
						checksum_size = 7;
						break;
						
			case 24:	//..........................................// [0..63]: All chars of SHA256
						checksum_size = 8;
						break;
		} // word_count
		
		entropy_hex = hexWithoutPrefix( entropy_hex );

		let entropy_binary = hexToBinary( entropy_hex );
				                                                            
		// !! NB !!: there was error here: SHA256(Uint8Array(entropy_hex)) should be computed, NOT SHA256(entropy_hex)
		let entropy_hex_sha256 = "";
		if ( isHexString(entropy_hex) ) {
			entropy_hex_sha256 = sha256( hexToUint8Array( entropy_hex ) );
		}
		else {
			entropy_hex_sha256 = sha256( entropy_hex );
		}
		
		let entropy_hex_sha256_bits = hexToBinary( entropy_hex_sha256 );		
	    
	    let checksum_bits = entropy_hex_sha256_bits.substring(0, checksum_size);

		console.log(  "   " + _YELLOW_
		            + Bip39Utils.LabelWithSize("checksum_bits", checksum_size) + _END_
					+ "       " + checksum_bits);
	
	    entropy_binary = entropy_binary + checksum_bits;

		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		let word_index = 0;
		let word       = "";
		let mnemonics  = "";
		for (let i=0; i < entropy_binary.length; i+=11) {
			let binary_11bits = entropy_binary.substring(i, i+11);
			word_index = parseInt(binary_11bits, 2); // convert binary string in decimal
			
			word = LANG_WORDLIST[word_index];
			//console.log("   word: " + word + "  word_index:" + word_index);

			let separator = ((i + 11) >= entropy_binary.length) ? "" : " ";
			mnemonics += word + separator;
		}
		
		return mnemonics;
	} // Bip39Utils.EntropyToMnemonics()
	
	static EntropyToChecksum( entropy_hex, options ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.EntropyToChecksum" + _END_);
		
		options = Bip39Utils.GetOptions( options );
		let word_count    		= options["word_count"];
		let checksum_size 		= 4;
		let entropy_bytes_count = entropy_hex.length / 2;
		
		console.log(  "   " + _YELLOW_
		            + Bip39Utils.LabelWithSize("entropy_hex", entropy_bytes_count) + _END_
					+ "        " + entropy_hex);
		
		switch ( word_count ) {
			case 12:	entropy_hex = entropy_hex.substring(0, 32); // [0..31]: first 32 chars of SHA256
			            checksum_size = 4;
						break;
						
			case 15:	entropy_hex = entropy_hex.substring(0, 40); // [0..39]: first 40 chars of SHA256
						checksum_size = 5;
						break;
						
			case 18:	entropy_hex = entropy_hex.substring(0, 48); // [0..47]: first 48 chars of SHA256
						checksum_size = 6;
						break;
						
			case 21:	entropy_hex = entropy_hex.substring(0, 56); // [0..55]: first 56 chars of SHA256
			            checksum_size = 7;
						break;
						
			case 24:	//..........................................// [0..64]: All chars of SHA256
			            checksum_size = 8;
						break;
		} // word_count
		
		entropy_hex        = hexWithoutPrefix( entropy_hex );
		let entropy_binary = hexToBinary( entropy_hex );
				                                                            
		// !! NB !!: 
		// There was error here: SHA256(Uint8Array(entropy_hex)) should be computed, NOT SHA256(entropy_hex)
		let entropy_hex_sha256 = "";
		if ( isHexString(entropy_hex) ) {
			entropy_hex_sha256 = sha256( hexToUint8Array( entropy_hex ) );
		}
		else {
			entropy_hex_sha256 = sha256( entropy_hex );
		}
		
		let entropy_hex_sha256_bits = hexToBinary( entropy_hex_sha256 );	    
	    let checksum_bits           = entropy_hex_sha256_bits.substring(0, checksum_size);

		console.log(  "   " + _YELLOW_
		            + Bip39Utils.LabelWithSize("checksum_bits", checksum_size) + _END_
					+ "       " + checksum_bits);
		
		return checksum_bits;
	} // Bip39Utils.EntropyToChecksum()
	
	// https://github.com/bitcoinjs/bip38/issues/63
	static MnemonicsToEntropyInfo( mnemonics, lang ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.MnemonicsToEntropyInfo" + _END_);
		console.log("   mnemonics: " + mnemonics);
		
		let entropy_info = {};
		
		if ( mnemonics == undefined ) {
			mnemonics = "rich hard unveil charge stadium affair net ski style stadium helmet void";
		} 
		
		if ( lang == undefined ) {
			lang = "EN";
		}       		
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		let words = mnemonics.split(" ");
		let entropy_binary = "";
		// * Case 1: 24 words (24*11 = 264) => 256 bits (SHA256) + last 11 bits = "checksum word index"
		// * Case 2: 12 words (12*11 = 132) => 128 bits (SHA-1)  + last 11 bits = "checksum word index"
		for (let i=0; i < words.length; i++) {
			let current_word = words[i];
			//console.log("   words[" + i + "]: " + current_word);
			let word_index = LANG_WORDLIST.indexOf( current_word );
		    //console.log("   word_index: " + word_index);
			let word_index_binary = parseInt(word_index, 10).toString(2).padStart(11, "0");
		    //console.log(">> " + "ToPrivateKey index_binary(" + i + "): " + index_binary);
			entropy_binary += word_index_binary;
		}
		
		//console.log("   words:                  "  + words.length);
		
		let word_count = words.length;
		let checksum_bit_count = Bip39Utils.GetChecksumBitCount( word_count );
		console.log("   checksum_bit_count:         " + checksum_bit_count);
	    
		let checksum_bits = entropy_binary.substring( entropy_binary.length - checksum_bit_count );
		console.log("   checksum_bits:              " + checksum_bits);
		entropy_info[CHECKSUM] = checksum_bits;
		
		let entropy_bits = entropy_binary.substring( 0, entropy_binary.length - checksum_bit_count );
		
		let entropy_hex  = binaryToHex( entropy_bits );
		console.log("   entropy_hex:              " + entropy_hex);
        entropy_info[ENTROPY_HEX] = entropy_hex;
		
		return entropy_info;
	} // Bip39Utils.MnemonicsToEntropyInfo()	
	
	// https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
	static GetChecksumBitCount( word_count ) {
		if ( word_count == undefined ) {
			 word_count = 12;
		}
		let checksum_bit_count = 4; // default case is 12 words / 4 bits
		switch ( word_count ) {
			case 12:	checksum_bit_count = 4;
						break;
						
			case 15:	checksum_bit_count = 5;
						break;
						
			case 18:	checksum_bit_count = 6;
						break;
						
			case 21:	checksum_bit_count = 7;
						break;
						
			case 24:	checksum_bit_count = 8;
						break;
						
			default:	checksum_bit_count = 4;
						break;
		}
		
		return checksum_bit_count;
	} // Bip39Utils.GetChecksumBitCount()
	
	static GetWordIndexes( mnemonics, options ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.GetWordIndexes " + _END_);
		console.log("   mnemonics: " + mnemonics);
		
		options = Bip39Utils.GetOptions( options );
		let lang            = (options["lang"] != undefined) ? options["lang"] : "EN";
		let word_index_base = (options["word_index_base"] != undefined) ? options["word_index_base"] : "Decimal";
		//console.log("   lang: " + lang);
		
		let words = mnemonics.split(' ');
		//console.log("   words("+ words.length + "): " + words);

		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		let word_indexes = [];
		for (let i=0; i < words.length; i++) {
			let current_word = words[i] ;
			//console.log("   word("+ i + "): " + current_word);
			let word_index = LANG_WORDLIST.indexOf( current_word );
			//console.log("   word_index: " + word_index);
			if (word_index_base == "Decimal") { 
				word_indexes.push( word_index.toString() );
			}
			else if (word_index_base == "Binary") { 
				let word_index_binary = parseInt(word_index, 10).toString(2).padStart(11, "0");
				//console.log("   word_index_binary: " + word_index_binary);				
				word_indexes.push( word_index_binary );
			}
		}
		//console.log(">> END " + _CYAN_ + "Bip39Utils.GetWordIndexes " + _END_);
		return word_indexes;
	} // Bip39Utils.GetWordIndexes()
	
	static WordIndexesToMnemonics( word_indexes, lang ) {
		let mnemonics = "";
		if (word_indexes == undefined) {
			word_indexes = [];
		}
		if (lang == undefined) {
			lang = "EN";
		}
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		for (let i=0; i < word_indexes.length; i++) {
			let word_index = word_indexes[i];
			let word = LANG_WORDLIST[word_index];
			let prefix = (i==0) ? " ":"";
			mnemonics = prefix + mnemonics;
		}
		return mnemonics;
	} // Bip39Utils.WordIndexesToMnemonics()
	
	static GetBIP39Dictionary( lang ) {	
		console.log(">> " + _CYAN_ + "Bip39Utils.GetBIP39Dictionary " + _END_);	
		if (lang == undefined) {
			lang = "EN";
		}
		//console.log("   lang: " + lang);

		let mnemonics_dictionary = Bip39Mnemonic.Words.ENGLISH;
		switch ( lang ) {
			case "EN": 	mnemonics_dictionary = Bip39Mnemonic.Words.ENGLISH;
						break;
				
			case "DE":  mnemonics_dictionary = GERMAN_MNEMONICS;
						break;
				
			case "FR":  mnemonics_dictionary = Bip39Mnemonic.Words.FRENCH;
						break;
				
			case "ES":  mnemonics_dictionary = Bip39Mnemonic.Words.SPANISH;
						break;		
				
			case "IT":  mnemonics_dictionary = Bip39Mnemonic.Words.ITALIAN;
						break;
				
			case "CS":  mnemonics_dictionary = CS_WORDLIST;
						break;
				
			case "PT":  mnemonics_dictionary = PT_WORDLIST;
						break;
						
			case "EO":  mnemonics_dictionary = ESPERANTO_MNEMONICS;
						break;
				
			default:	mnemonics_dictionary = Bip39Mnemonic.Words.ENGLISH;
						break;
		}
		
		return mnemonics_dictionary;
	} // Bip39Utils.GetBIP39Dictionary()
	
	static GuessMnemonicsLang( mnemonics ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.GuessMnemonicsLang" + _END_);
		let lang         = "EN";
		let words        = mnemonics.split(' ');
		let current_lang = ""; 
		for (let i=0; i < SUPPORTED_LANGS.length; i++) {
			current_lang = SUPPORTED_LANGS[i];
			console.log("   Check if 'mnemonics' is: " + current_lang);
			let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( current_lang );
			let found_word_count = 0;
			for (let j=0; j < words.length; j++) {
				let current_word = words[i];
				let word_index = LANG_WORDLIST.indexOf( current_word );
				if (word_index != -1) found_word_count++;
			}
			if (found_word_count == words.length) {
				return current_lang;
			}
		} 	
		return lang;
	} // Bip39Utils.GuessMnemonicsLang()
	
	static CheckMnemonics( mnemonics, options ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.CheckMnemonics" + _END_);		
		
		options = Bip39Utils.GetOptions( options );
		let lang       = options["lang"];
		let word_count = options["word_count"];

		let words = mnemonics.split(' ');
		// console.log("   words.length: " + words.length);
		if (words.length != word_count ) { 
			return false;
		}
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		for (let i=0; i < words.length; i++) {
			let current_word = words[i];
			//console.log("   word[" + i + "] : " + current_word);
			let word_index = LANG_WORDLIST.indexOf( current_word );
			if (word_index == -1) {
				return false;
			}
		}
		return true;
	} // Bip39Utils.CheckMnemonics()
	
	static MnemonicsAs4letter( mnemonics ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.MnemonicsAs4letter" + _END_);
		let word_4letter_prefixes = "";
		let words = mnemonics.split(' ');
		let word_count = words.length;
		
		let capitalize = (in_str) => {
			return in_str.charAt(0).toUpperCase() + in_str.slice(1);
        }; // capitalize()
		
		for (let i=0; i < word_count; i++) {
			let word_prefix = words[i].substr(0,4); // [0..3]
			word_4letter_prefixes += capitalize(word_prefix); 
		}
		//console.log(">> getNewFriezeTextvalues word_4letter_prefixes: " + word_4letter_prefixes);
		//console.log(">> getNewFriezeTextvalues word_4letter_prefixes.length: " + word_4letter_prefixes.length);
		
		const mnemonics_as_4letter = word_4letter_prefixes;
		//console.log(">> getNewFriezeTextvalues new_frieze_text: " + new_frieze_text);
		//console.log(">> getNewFriezeTextvalues length: " + new_frieze_text.length);
		
		return mnemonics_as_4letter;
	} // Bip39Utils.MnemonicsAs4letter()
	
	static MnemonicsAsTwoParts( mnemonics ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.MnemonicsAsTwoParts" + _END_);
				
		if (mnemonics == undefined) {
			return "Null-MNEMONICS";
		}
		
		let words      = mnemonics.split(' ');
		let word_count = words.length;		
		
		let mnemonics_2parts = [];	
		
		// NB: No need to cut in 2 parts if only 12 words
		if ( word_count == 12 ) {
			mnemonics_2parts.push( mnemonics );
			mnemonics_2parts.push( "" );
		}
		else {		
            // https://stackoverflow.com/questions/35499498/replace-nth-occurrence-of-string		
			//---------- Replace 12th occurence of space to cut seed phrase (24 words) in two parts of 12 words
			let nThIndex   = 0;
		    let needle     = ' ';
			let counter    = word_count / 2; // zero-based index
			
			if (counter > 0) {
				while (counter--) {
					// Get the index of the next occurence
					nThIndex = mnemonics.indexOf(needle, nThIndex + needle.length);
				}
			}

			mnemonics_2parts.push( mnemonics.substring( 0, nThIndex ) );
			mnemonics_2parts.push( mnemonics.substring( nThIndex + needle.length ) );
			//---------- Replace 12th occurence of space				   
		}				   
				
		return mnemonics_2parts;
	} // Bip39Utils.MnemonicsAsTwoParts()	
	
	static LabelWithSize(data, size) {
		let msg = data + "(" + size + "):";
		return msg;
	} // Bip39Utils.LabelWithSize()
	
	static GetOptions( options ) {		
		const getOptionValue = ( options_arg, key, default_value ) => {
			let option_value = default_value;
			if ( options_arg[key] != undefined ) {
				option_value = options_arg[key];
			}
			return option_value; 
		}; // getOptionValue()
		
		//console.log(">> " + _CYAN_ + "Bip39Utils.GetOptions" + _END_);
		//console.log("   options 1: " + JSON.stringify(options));
		
		if ( options == undefined ) {
			 options = {};
		}
		
		options["lang"]        = getOptionValue( options, "lang",        "EN" ); 
		options[WORD_COUNT]    = getOptionValue( options, WORD_COUNT,    12 ); 
		options[BLOCKCHAIN]    = getOptionValue( options, BLOCKCHAIN,    BITCOIN ); 
		options[CRYPTO_NET]    = getOptionValue( options, CRYPTO_NET,    MAINNET );
		options[UUID]          = getOptionValue( options, UUID,          uuidv4() );
        options[ADDRESS_INDEX] = getOptionValue( options, ADDRESS_INDEX, 0 );	
		options[ACCOUNT_INDEX] = getOptionValue( options, ACCOUNT_INDEX, 0 );		
		
		//console.log("   options 2: " + JSON.stringify(options));
		
		return options; 
	} // Bip39Utils.GetOptions()
} // Bip39Utils class

const test_Bip39Utils = async () => {
}; // test_EntropyToMnemonics

// test_Bip39Utils();

if (typeof exports === 'object') {
	exports.Bip39Utils = Bip39Utils	
} // exports of 'bip39_utils.js'