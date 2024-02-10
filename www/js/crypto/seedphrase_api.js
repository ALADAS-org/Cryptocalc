// =====================================================================================
// ================================  seedphrase_api.js  ================================
// =====================================================================================
// https://support.ledger.com/hc/fr-fr/articles/4415198323089-Comment-un-appareil-Ledger-g%C3%A9n%C3%A8re-une-phrase-de-r%C3%A9cup%C3%A9ration-de-24-mots&language-suggestion?docs=true
// "Seed phrase" = "phrase de récupération" du Ledger
const sha256        = require('js-sha256');
const Bip39Mnemonic = require('bitcore-mnemonic');
const bip39         = require('bip39');

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_,        
		_END_ }              = require('../util/color/color_console_codes.js');
		
const { hexToBinary, binaryToHex, 
        hexWithPrefix, hexWithoutPrefix,
        hexToUint8Array }    = require('./hex_utils.js');	
/*
- Génération d'un hash SHA256 (24 mots) ou SHA-1 (128 bits, 12 mots)
- KO: Les 8 premiers bits du hash SHA256 sont ajoutés à la fin des 256 bits initiaux, ce qui donne 264 bits.
- OK: * cas 1: 24 mots / 264 bits / 8 bits de checksum:
               SHA256 du hash initial en string binaire           => "8 1st bits" ajoutés à la fin du hash initial => 264 bits
      * cas 2: 12 mots / 132 bits / 4 bits de checksum:
               SHA-1 (128 bits) du hash initial en string binaire => "4 1st bits" ajoutés à la fin du hash initial => 132 bits
- Les 264/132 bits sont divisés en 24/12 groupes de 11 bits.
- Chaque groupe de 11 bits est interprété comme un nombre compris entre 0 et 2047 (2^11), 
  qui sert d’index à la liste de mots BIP39, ce qui donne les 24/12 mots.
*/
// https://getcoinplate.com/bip39-seed-phrase-mnemonics-generator-offline-online-tool/

// ref.1: https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
// ref.2: https://www.blockplate.com/blogs/blockplate/how-a-seed-phrase-is-created
class Seedphrase_API {
	// ref.1: https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
	// ref.2: https://www.blockplate.com/blogs/blockplate/how-a-seed-phrase-is-created
	// * Case 1: 24 words / 264 bits / 8 bits checksum:
    //           SHA256 of initial hash as binary string           => "8 1st bits" added to end of initial hash => 264 bits
    // * Case 2: 12 words / 132 bits / 4 bits checksum:
    //           SHA-1 (128 bits) of initial hash as binary string => "4 1st bits" added to end of initial hash => 132 bits
	static FromSHASeed(initial_seed_hex) {		
		console.log(">> " + _CYAN_ + "Seedphrase_API.FromSHASeed" + _END_);	
        // console.log(">> FromSHASeed: init seed: '" + initial_seed_hex + "'");
        //console.log(">> FromSHASeed: initial_seed bytes:           " + initial_seed_hex.length/2);		
		initial_seed_hex = hexWithoutPrefix(initial_seed_hex);

		let initial_seed_binary = hexToBinary(initial_seed_hex);
		//console.log(">> FromSHASeed: initial_seed_binary bits:    "  + initial_seed_binary.length);
				                                                            
		let word_index = 0;
		let word       = "";
		let mnemonics  = "";
		
		let pk_uint8_values  = hexToUint8Array(initial_seed_hex);
		let init_entropy_hex = sha256(pk_uint8_values);

	    let checksum_bit_count = ((initial_seed_hex.length/2)*8) / 32;
	    //console.log(">> FromSHASeed: checksum_bit_count:            " + checksum_bit_count);
	
	    let checksum_bits = hexToBinary(init_entropy_hex).substring(0, checksum_bit_count);
	    //console.log(">> FromSHASeed: checksum_bits:               "   + checksum_bits);
	    //console.log(">> FromSHASeed: checksum bits length:          " + checksum_bits.length);
	
	    let final_entropy_binary = initial_seed_binary + checksum_bits;

		//console.log(">> FromSHASeed: final_entropy_binary bits:   " + final_entropy_binary.length);
		//console.log(">> FromSHASeed: final_entropy_binary words:   "  + final_entropy_binary.length/11);
		
		for (let i=0; i < final_entropy_binary.length; i+=11) {
			let binary_11bits = final_entropy_binary.substring(i, i+11);
			word_index = parseInt(binary_11bits, 2); // convert binary string in decimal
			word  = Bip39Mnemonic.Words.ENGLISH[word_index];
			let separator = ((i + 11) >= final_entropy_binary.length) ? "" : " ";
			mnemonics += word + separator;
		}
		
		return mnemonics;
	} // static FromSHASeed()
	
	static ToPrivateKey(mnemonics) {
		console.log(">> " + _CYAN_ + "Seedphrase_API.ToPrivateKey" + _END_);
		
		//console.log("\nmnemonics\n'" + mnemonics + "'");
		let words      = mnemonics.split(' ');
		let word_count = words.length;
		// console.log(">> sha264_value words length: " + words.length);
		
		// * Case 1: 24 words (24*11 = 264) => 256 bits (SHA256) + last 11 bits = "checksum word index"
		// * Case 2: 12 words (12*11 = 132) => 128 bits (SHA-1)  + last 11 bits = "checksum word index"
		let final_entropy_binary = "";
		for (let i=0; i < word_count; i++) {
			let word_index = Bip39Mnemonic.Words.ENGLISH.indexOf(words[i]);
			//console.log(">> " + "ToPrivateKey index(" + i + "): " + word_index);
			let word_index_binary = parseInt(word_index, 10).toString(2).padStart(11, "0");
			//console.log(">> " + "ToPrivateKey index_binary(" + i + "): " + index_binary);
			final_entropy_binary += word_index_binary;
		}
		
		let private_key_hex = "";
		for (let i=0; i < final_entropy_binary.length; i+=4) {
			let four_binary_digits = final_entropy_binary.substring(i, i+4);
			
			let hex_digit = parseInt(four_binary_digits, 2).toString(16);
			
			private_key_hex += hex_digit;
		}
		//console.log(">> private_key: "  + private_key.length);
		//console.log(">> private_key:\n" + private_key);
		
		let private_key_bit_count = (private_key_hex.length/2)*8;
		let checksum_bit_count    = Math.floor(private_key_bit_count / 32);
		//console.log(">> ToPrivateKey: checksum_bit_count =   " + checksum_bit_count);
		
		let hex_digits_count = private_key_hex.length - checksum_bit_count/4;
		//console.log(">> ToPrivateKey: hex_digits_count   =  " + hex_digits_count);
		
		private_key_hex = private_key_hex.substring(0, hex_digits_count);
		
		console.log(">> ToPrivateKey: private_key = " + private_key_hex);
		
		// https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
		//console.log(">> ToPrivateKey: private_key length =  " + private_key_hex.length);
		//console.log(">> ToPrivateKey: private_key bytes  =  " + private_key_hex.length/2);
	    //console.log(">> ToPrivateKey: private_key bits   = " + (private_key_hex.length/2)*8);

		return private_key_hex;
    } // static ToPrivateKey()
	
	//                                   default: 24 words (12 words supported also)
	static FromRawdata(initial_seed_str, mnemonics_word_count) {	
		console.log(">> " + _CYAN_ + "Seedphrase_API.FromRawdata" + _END_);
		
		if (mnemonics_word_count == undefined || mnemonics_word_count != 12) {
			mnemonics_word_count = 24;
		}
		
		//console.log(">> mnemonics_word_count: " + mnemonics_word_count);
				
		let initial_entropy_hex = sha256(initial_seed_str);
		if (mnemonics_word_count == 12) {			
			initial_entropy_hex = initial_entropy_hex.substring(0,32); // [0..31]: first 32 bytes of SHA256
		}
		
		console.log(">> FromRawdata: initial_entropy_hex = " + initial_entropy_hex);

		let initial_entropy_binary = hexToBinary(initial_entropy_hex);
		
		let seedphrase = Seedphrase_API.FromSHASeed(initial_entropy_hex);

		return seedphrase;
	} // static FromRawdata()
	
	static As4letter( seedphrase ) {
		let word_4letter_prefixes = "";
		let words = seedphrase.split(' ');
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
	} // static As4letter()
	
	static AsTwoParts(seedphrase) {
		console.log(">> " + _CYAN_ + "Seedphrase_API.AsTwoParts" + _END_);
		//console.log("\seedphrase:\n    " + seedphrase);
		
		// https://stackoverflow.com/questions/35499498/replace-nth-occurrence-of-string
		
		if (seedphrase == undefined) {
			return "Null-SEEDPHRASE";
		}
		
		let words      = seedphrase.split(' ');
		let word_count = words.length;		
		
		let seedphrase_2parts = "";
		
		// NB: No need to cut in 2 parts if only 12 words
		if (word_count == 12) {
			seedphrase_2parts = seedphrase;
		}
		else {			
			//---------- Replace 12th occurence of space to cut seed phrase (24 words) in two parts of 12 words
			let nThIndex   = 0;
		    let needle     = ' ';
			let counter    = word_count/2; // zero-based index
			
			if (counter > 0) {
				while (counter--) {
					// Get the index of the next occurence
					nThIndex = seedphrase.indexOf(needle, nThIndex + needle.length);
				}
			}
			seedphrase_2parts =  seedphrase.substring(0, nThIndex) + '\n' 
							   + seedphrase.substring(nThIndex + needle.length);
			//---------- Replace 12th occurence of space				   
		}				   
		
		
		return seedphrase_2parts;
	} // static AsTwoParts()
} // Seedphrase_API class

if (typeof exports === 'object') {
	exports.Seedphrase_API = Seedphrase_API	
}