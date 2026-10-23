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

// ====================================  Bip39Utils class  ====================================
// * static EntropyToMnemonics( entropy_hex, options )
// * static EntropyToChecksum( entropy_hex, options )
// * static EntropySourceToEntropy( salted_entropy_src_str, options )
// * static EntropySourceToMnemonics( salted_entropy_src_str, options )
// * static MnemonicsToEntropyInfo( mnemonics )
// * static GetWordIndexes( mnemonics, options )
// * static WordIndexesToSeedPhrase( word_indexes, lang )
// * static GuessMnemonicsLang( mnemonics )
// * static CheckMnemonics( mnemonics, private_key, options ) 
// * static MnemonicsAs4letter( mnemonics )
// * static MnemonicsAsTwoParts( mnemonics )
// * static GetBIP39Dictionary( lang )
// * static GetArgs( args )

const sha256         = require('js-sha256');
const Bip39Mnemonic  = require('bitcore-mnemonic');
const { v4: uuidv4 } = require('uuid');

// https://bitcoin.stackexchange.com/questions/113286/uncaught-typeerror-bip32-fromseed-is-not-a-function
//const bip32         = require('bip32'); => ERROR: "bip32.fromSeed in not a function"
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32');
// You must wrap a tiny-secp256k1 compatible implementation
const bip32            = BIP32Factory(ecc);

const CS_WORDLIST_JSON = require('@scure/bip39/wordlists/czech');
const CS_WORDLIST      = CS_WORDLIST_JSON['wordlist'];

const PT_WORDLIST_JSON = require('@scure/bip39/wordlists/portuguese');
const PT_WORDLIST      = PT_WORDLIST_JSON['wordlist'];

const KO_WORDLIST_JSON = require('@scure/bip39/wordlists/korean');
const KO_WORDLIST      = KO_WORDLIST_JSON['wordlist'];

// Simplified Chinese
const SC_WORDLIST_JSON = require('@scure/bip39/wordlists/simplified-chinese');
const SC_WORDLIST      = SC_WORDLIST_JSON['wordlist'];

// Traditional Chinese
const TC_WORDLIST_JSON = require('@scure/bip39/wordlists/traditional-chinese');
const TC_WORDLIST      = TC_WORDLIST_JSON['wordlist'];

const { GERMAN_MNEMONICS }    = require('../../../assets/mnemonics/DE_mnemonics.js');
const { ESPERANTO_MNEMONICS } = require('../../../assets/mnemonics/EO_2048_mnemonics.js');

const { RUSSIAN_MNEMONICS }   = require('../../../assets/mnemonics/RU_2048_mnemonics.js');

const { LATIN_MNEMONICS }     = require('../../../assets/mnemonics/LA_2048_mnemonics.js');
const { GREEK_MNEMONICS }     = require('../../../assets/mnemonics/EL_2048_mnemonics.js');

const { HINDI_MNEMONICS }     = require('../../../assets/mnemonics/HI_2048_mnemonics.js');
const { GUJARATI_MNEMONICS }  = require('../../../assets/mnemonics/GU_2048_mnemonics.js');
const { BENGALI_MNEMONICS }   = require('../../../assets/mnemonics/BN_2048_mnemonics.js');

// NB: Separator for Japanese
// https://bitcoin.stackexchange.com/questions/37780/bip39-japanese-mnemonic-vector-unit-test-process
// For display: IDEOGRAPHIC SPACEs: '\u3000'
// Else:        Normal Space:       '\u0020'
const { JAPANESE_MNEMONICS }  = require('../../../assets/mnemonics/JP_2048_mnemonics.js');

const SUPPORTED_LANGS = 
	  [ "EN", "DE", "FR", "ES", "IT", "CS", "PT", "JP", "KO", "SC", "TC", "EO", "RU", "LA", "EL", "HI", "GU", "BN" ];

const { _RED_, _CYAN_, _PURPLE_, _YELLOW_, 
        _GREEN_, _RED_HIGH_, _BLUE_HIGH_,       
		_END_ }              = require('../util/color/color_console_codes.js');
		
const { pretty_func_header_log,
        pretty_log }         = require('../util/log/log_utils.js');
		
const { NULL_COIN, 
	    BITCOIN, DOGECOIN, LITECOIN, BINANCE_BSC,
		ETHEREUM, AVALANCHE, POLYGON, TON,
		CARDANO, STELLAR, SUI, RIPPLE,
		TRON, DASH, VECOIN, ETHEREUM_CLASSIC,
		BITCOIN_CASH, BITCOIN_SV, TERRA_LUNA, RAVENCOIN, HORIZEN,
		MAINNET, TESTNET,
		COIN_ABBREVIATIONS, COIN_TYPES
      }                      = require('./const_blockchains.js');
	  
const { NULL_HEX,
		CRYPTO_NET,
        ADDRESS, UUID, 
		CHECKSUM, CHAINCODE, 
		ENTROPY_HEX,
		MASTER_PK_HEX, ROOT_PK_HEX, 
		PRIVATE_KEY, PUBLIC_KEY_HEX,
		getBip39Size
	  }                      = require('./const_wallet.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        LANG, MNEMONICS, WORD_COUNT, 
        ACCOUNT, ADDRESS_INDEX
	  }                      = require('../const_keywords.js');
		
const { hexToBinary, binaryToHex,
        hexWithPrefix, hexWithoutPrefix, isHexString,
        uint8ArrayToHex, hexToUint8Array  
	  }                      = require('./hex_utils.js');	
	  
const { EntropySize }        = require('./entropy_size.js');

const { getShortenedString } = require('../util/values/string_utils.js');
const { stringIsNumber }     = require('../util/values/number_utils.js');

// https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
const pad = (n, width, z) => {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}; // pad()	

// Bip39Utils.GetChecksumBitCount() value for a word count which is not a BIP39 one
const DEFAULT_CHECKSUM_BIT_COUNT = 4;

const normalizeBip39 = (str) =>{
	if (!str) return '';
	// Convertir TOUT en forme décomposée, puis supprimer les accents combinants
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}; // normalizeBip39()

class Bip39Utils {
    // NB: Validation test:
    //     entropy = "37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db"	
	static EntropyToMnemonics( entropy_hex, lang ) {		
		pretty_func_header_log( "Bip39Utils.EntropyToMnemonics" );
		
		// pretty_log( "b39.E2Mnk> entropy_hex", entropy_hex );
		if ( entropy_hex == undefined || entropy_hex == "" ) {
			throw new Error("Bip39Utils.EntropyToMnemonics 'entropy_hex' NOT DEFINED");
		} 
		
		if ( lang == undefined )  lang = "EN";
		
		let word_count = EntropySize.GetWordCount( entropy_hex );
		// pretty_log( "b39.E2Mnk> word_count", word_count );
		
        // pretty_log( "b39.E2Mnk> lang", lang );	

        let checksum_size = EntropySize.GetChecksumBitCount( word_count );
        // pretty_log( "b39.E2Mnk> checksum_size", checksum_size);
		
		// pretty_log( "b39.E2Mnk> entropy_hex", entropy_hex );
        entropy_hex = EntropySize.GetSHA256Substring( entropy_hex, word_count );
        pretty_log( "b39.E2Mnk> entropy_hex.substr(" + word_count + ")", entropy_hex );		
		
		let entropy_bits = hexToBinary( entropy_hex );
		//pretty_log( "b39.E2Mnk> entropy_bits: '" + entropy_bits + "'" );	
				                                                            
		let checksum_bits = Bip39Utils.EntropyToChecksum( entropy_hex ); // NB: entropy MUST BE HASHED to compute 'Checksum'
		// pretty_log( Bip39Utils.LabelWithSize("b39.E2Mnk> checksum_bits 2", checksum_size), checksum_bits );
	
	    entropy_bits += checksum_bits;

        let mnemonics            = "";
		let LANG_WORDLIST        = Bip39Utils.GetBIP39Dictionary( lang );
		let word_index           = 0;
		let word                 = "";
		let retrieved_word_count = 0;
		// pretty_log( "b39.E2Mnk> entropy_bits.length", entropy_bits.length );
		
		for ( let i=0; i < entropy_bits.length; i+=11 ) {
			// pretty_log( "b39.E2Mnk> loop on entropy_bits i: ", i );
			let binary_11bits = entropy_bits.substring(i, i+11);
			
			word_index = parseInt( binary_11bits, 2 ); // convert binary string in decimal
			//pretty_log( "b39.E2Mnk> word_index", word_index );
			
			word = LANG_WORDLIST[word_index];
			// pretty_log( "b39.E2Mnk> word[" + retrieved_word_count + "]" , word );

			let separator = ((i + 11) >= entropy_bits.length) ? "" : " ";
			mnemonics += word + separator;
			
			retrieved_word_count++;
		}
		// pretty_log( "b39.E2Mnk> retrieved_word_count", retrieved_word_count );
		// pretty_func_header_log( "<END> Bip39Utils.EntropyToMnemonics" );
		
		return mnemonics;
	} // Bip39Utils.EntropyToMnemonics()
	
	static PrivateKeyToMnemonics( private_key ) {		
		pretty_func_header_log( "Bip39Utils.PrivateKeyToMnemonics" );
		
		let lang = "EN";		

        // TEST https://github.com/massmux/HowtoCalculateBip39Mnemonic?tab=readme-ov-file 
        // entropy_hex = "656d338db7c217ad57b2516cdddd6d06";
        // TEST
		// private_key_hex = "0ed797c1da6515542acda6358045702a0a558be931cb0490ea7044e0c0311645";
		
		// Erreur
		// Pour private_key_hex = 
		// 0ed797c1da6515542acda6358045702a0a558be931cb0490ea7044e0c0311645
		// => attract royal vacant regular eyebrow present private regular 
		//    culture acquire foster favorite pipe shine pill defense 
		//    afraid mansion orchard mean army blush flip rubber
		//                                                ^^^^^^ OK
		// => attract royal vacant regular eyebrow present private regular
		//    culture acquire foster favorite pipe shine pill defense
		//    afraid mansion orchard mean army blush flip peace
		//                                                ****** KO
		private_key = hexWithoutPrefix( private_key );
		let private_key_byte_count = private_key.length / 2;
        pretty_log( Bip39Utils.LabelWithSize( "private_key", private_key_byte_count ), private_key );					
		
		if ( ! isHexString( private_key ) ) {
			let error_msg = "**ERROR** Input for 'Private Key' is Not a in Hexadecimal";
			return error_msg;
		}
		
		if ( private_key_byte_count != 32 ) {
			let error_msg =   "**ERROR** Input for 'Private Key' provides " + private_key_byte_count 
			                + " bytes while 32 are expected";
			return error_msg;
		}		
                                                            
		let word_index = 0;
		let word       = "";
		let mnemonics  = "";	
		
        // https://github.com/massmux/HowtoCalculateBip39Mnemonic		
		let private_key_bits = hexToBinary( private_key );	
		// pretty_log( "b39.E2Mnk> private_key_bits: '" + private_key_bits + "'" );	
		
	    let checksum_size = ( (private_key.length / 2) * 8 ) / 32;
		
		let pk_sha256 = "";
		if ( isHexString( private_key ) ) {
			pk_sha256 = sha256( hexToUint8Array( private_key ) );
		}
		else {
			pk_sha256 = sha256( private_key );
		}
		
		let pk_sha256_bits = hexToBinary( pk_sha256 );		
	    
	    let checksum_bits = pk_sha256_bits.substring( 0, checksum_size );		
		// pretty_log( "bip39.pk2Mnk> " + Bip39Utils.LabelWithSize( "checksum_bits", checksum_size ), checksum_bits );
	
	    private_key_bits += checksum_bits;
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		for ( let i=0; i < private_key_bits.length; i+=11 ) {
			let word_index_11bits = private_key_bits.substring( i, i+11 );
			word_index = parseInt( word_index_11bits, 2 ); // convert binary string in decimal
			
			word = LANG_WORDLIST[word_index];
			
		    // pretty_log( "bip39.pk2Mnk> word[" + i + "]", word );
			//console.log("   word: " + word + "  word_index:" + word_index);

			let separator = ((i + 11) >= private_key_bits.length) ? "" : " ";
			mnemonics += word + separator;
		}
		
		return mnemonics;
	} // Bip39Utils.PrivateKeyToMnemonics()
	
	// https://github.com/massmux/HowtoCalculateBip39Mnemonic
	// NB: doesnt hash 'salted_entropy_src_str' if it is hex and provides expected byte count 
	static EntropySourceToEntropy( salted_entropy_src_str, options ) {	
		pretty_func_header_log( "Bip39Utils.EntropySourceToEntropy" );
		
		options = Bip39Utils.GetArgs( options );
		let word_count = options[WORD_COUNT];	

        //pretty_log( "salted_entropy_src_str", getShortenedString( salted_entropy_src_str ));		
		//console.log("   word_count:             " + word_count);
		
		let checksum_bit_count = Bip39Utils.GetChecksumBitCount( word_count );
		let expected_bit_count = ( word_count * 11 ) - checksum_bit_count;
		//console.log("   expected_bit_count:     " + expected_bit_count);
		
		let entropy_hex = "";	
		// test: https://github.com/massmux/HowtoCalculateBip39Mnemonic?tab=readme-ov-file
		// salted_entropy_src_str = "656d338db7c217ad57b2516cdddd6d06";
		// word_count = 12;
		// test
		
		// !! NB !!: there was error here: 
		// SHA256(Uint8Array( entropy_hex )) should be computed, NOT SHA256( entropy_hex )
		if ( isHexString( salted_entropy_src_str ) ) {
			let entropy_binary = hexToBinary( salted_entropy_src_str );
			let entropy_binary_bit_count = entropy_binary.length;
			if ( entropy_binary_bit_count == expected_bit_count ) {
				entropy_hex = salted_entropy_src_str;
			}
			else {
				entropy_hex = sha256( hexToUint8Array( salted_entropy_src_str ) );
			}			
		}
		else { // 'salted_entropy_src_str' is not Hex
			entropy_hex = sha256( salted_entropy_src_str );
		}					

		// 12..21 words: first 'entropy bits' of the SHA256 (24 words: all of it)
		entropy_hex = EntropySize.TruncateToEntropySize( entropy_hex, word_count );
		
		//console.log("   entropy_hex:            " + entropy_hex);
		
		return entropy_hex;
	} // Bip39Utils.EntropySourceToEntropy()
	
	static EntropySourceToMnemonics( salted_entropy_src_str, options ) {	
		pretty_func_header_log( "Bip39Utils.EntropySourceToMnemonics" );
		
		let entropy_hex = Bip39Utils.EntropySourceToEntropy( salted_entropy_src_str, options );
	    pretty_log( "b39.Esrc2Mnk> entropy_hex", entropy_hex );
		
		let mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex, options );
		return mnemonics;
	} // Bip39Utils.EntropySourceToMnemonics()
	
	static EntropyToChecksum( entropy_hex ) {
		// pretty_func_header_log( "Bip39Utils.EntropyToChecksum" );		
		let word_count    = EntropySize.GetWordCount( entropy_hex );
		// NB: 'word_count' is a number or NULL_WORD_COUNT (never undefined): non BIP39 word count => 8 bits
		let checksum_size = EntropySize.GetChecksumBitCount( word_count );
		entropy_hex       = EntropySize.TruncateToEntropySize( entropy_hex, word_count );
		
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

		//console.log(  "   " + _YELLOW_
		//           + Bip39Utils.LabelWithSize("checksum_bits", checksum_size) + _END_
		//		  + "       " + checksum_bits);
		
		return checksum_bits;
	} // Bip39Utils.EntropyToChecksum()
	
	// https://github.com/bitcoinjs/bip38/issues/63
	static MnemonicsToEntropyInfo( mnemonics, lang ) {
		pretty_func_header_log( "Bip39Utils.MnemonicsToEntropyInfo" );
		
		let entropy_info = {};
		
		if ( mnemonics == undefined ) {
			mnemonics = "rich hard unveil charge stadium affair net ski style stadium helmet void";
		} 
		
		if ( lang == undefined )  lang = "EN";
		// pretty_log("Mnk2Einf> mnemonics(" + lang + "): '" + mnemonics + "'");
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		// console.log("   LANG_WORDLIST: " + LANG_WORDLIST.length);
		
		let NORMALIZED_WORDLIST = LANG_WORDLIST.map(normalizeBip39);
		
		let words = mnemonics.split(' ');
		// console.log("   words: " +JSON.stringify(words));
		
		let entropy_binary     = '';
		let word_index         = -1;
		let current_word       = '';
		let word_index_binary  = ''; 
		// * Case 1: 24 words (24*11 = 264) => 256 bits (SHA256) + last 11 bits = "checksum word index"
		// * Case 2: 12 words (12*11 = 132) => 128 bits (SHA-1)  + last 11 bits = "checksum word index"
		try {
			for ( let i=0; i < words.length; i++ ) {
				current_word = words[i];
				// console.log("   current_word(" + i + "):        '" + current_word + "'");
				// current_word = current_word.normalize('NFC');
				current_word = normalizeBip39( current_word );
				// console.log("   AFTER current_word(" + i + "):  '" + current_word);
				
				if ( stringIsNumber( current_word ) ) {
					word_index = parseInt( current_word );
				}
				else {
					// console.log("   words[" + i + "]: '" + current_word + "'");
					// word_index = LANG_WORDLIST.indexOf( current_word );
					word_index = NORMALIZED_WORDLIST.indexOf( current_word );
					// console.log("   word_index: " + word_index);
				}	
				word_index_binary = parseInt(word_index, 10).toString(2).padStart(11, "0");
				//console.log(">> " + "ToPrivateKey index_binary(" + i + "): " + index_binary);
				entropy_binary += word_index_binary;
			} // for each word in 'mnemonics'
		}
		catch (err) {
			throw new Error("***ERROR*** in  Bip39Utils.MnemonicsToEntropyInfo lines: 358..412"); 
		}
		let word_count = words.length;
		// pretty_log("Mnk2Einf> word_count", word_count);
		
		let checksum_bit_count = Bip39Utils.GetChecksumBitCount( word_count );
		// pretty_log("Mnk2Einf> checksum_bit_count", checksum_bit_count);
	    
		let checksum_bits = entropy_binary.substring( entropy_binary.length - checksum_bit_count );
		//console.log("   checksum_bits:              " + checksum_bits);
		entropy_info[CHECKSUM] = checksum_bits;
		
		let entropy_bits = entropy_binary.substring( 0, entropy_binary.length - checksum_bit_count );
		
		let entropy_hex = binaryToHex( entropy_bits );
		pretty_log("Mnk2Einf> entropy_hex: '" + entropy_hex + "'");
        entropy_info[ENTROPY_HEX] = entropy_hex;
		
		return entropy_info;
	} // Bip39Utils.MnemonicsToEntropyInfo()


	// ++++++++++++++++++++++++++++++ Custom handling of mnemonics cuount 1..24 ++++++++++++++++++++++++++++++
	// NOUVELLE METHODE: Supporte les phrases de 1 à 24 mots
	static EntropyToChecksumCustom( entropy_hex, word_count ) {
		let checksum_bits_count = Bip39Utils.GetChecksumBitCountCustom( word_count );
		
		// Nettoyer l'hex
		entropy_hex = hexWithoutPrefix( entropy_hex );
		
		// Si l'hex a une longueur impaire, ajouter un zéro devant
		if (entropy_hex.length % 2 !== 0) {
			entropy_hex = "0" + entropy_hex;
		}
		
		// Convertir en bytes
		let entropy_bytes;
		try {
			entropy_bytes = hexToUint8Array( entropy_hex );
		} catch(e) {
			// Si la conversion échoue, créer un buffer à partir des bits
			pretty_log("EntropyToChecksumCustom> hexToUint8Array failed, using fallback", e.message);
			// Fallback: utiliser directement la chaîne hex
			entropy_bytes = new Uint8Array([0]);
		}
		
		// Calculer SHA256
		let entropy_hex_sha256 = sha256( entropy_bytes );
		let entropy_hex_sha256_bits = hexToBinary( entropy_hex_sha256 );
		
		let checksum_bits = entropy_hex_sha256_bits.substring(0, checksum_bits_count);
		
		return checksum_bits;
	} // EntropyToChecksumCustom() 
	
	// ++++++++++ NOUVELLE METHODE: Supporte les phrases de 1 à 24 mots
	static MnemonicsToEntropyInfoCustom( mnemonics, lang ) {
		pretty_func_header_log( "Bip39Utils.MnemonicsToEntropyInfoCustom" );
		
		let entropy_info = {};
		
		if ( mnemonics == undefined ) {
			throw new Error("Mnemonics non défini");
		}
		
		// Auto-détection de la langue si non fournie
		if ( lang == undefined ) {
			lang = Bip39Utils.GuessMnemonicsLang( mnemonics );
		}
		
		pretty_log("Mnk2EinfC> mnemonics(" + lang + "): " + mnemonics);
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		// Normaliser la liste une fois au chargement (à faire au début)
		
		let words = mnemonics.trim().split(/\s+/);
		let word_count = words.length;
		
		if ( word_count < 1 || word_count > 24 ) {
			throw new Error("La phrase doit contenir entre 1 et 24 mots");
		}
		
		// pretty_log("Mnk2EinfC> word_count", word_count);
		
		// Convertir chaque mot en bits
		let full_bits = '';
		let word_index = -1;
		
		// Prétraiter le dictionnaire UNE SEULE FOIS
		const NORMALIZED_WORDLIST = LANG_WORDLIST.map(normalizeBip39);

		for ( let i = 0; i < words.length; i++ ) {
			let current_word = words[i];
			current_word = normalizeBip39(current_word);
			
			// console.log( "Bip39.MnemonicsToEntropyInfoCustom  current_word: '" + current_word + "'");             	
			
			if ( stringIsNumber( current_word ) ) {				
				word_index = parseInt( current_word );
			}
			else {		
			    // word_index = LANG_WORDLIST.indexOf( current_word );
				word_index = NORMALIZED_WORDLIST.indexOf( current_word );		
				if ( word_index === -1 ) {
					throw new Error(`Mot "${words[i]}" non trouvé dans la liste ${lang}`);
				}
			}					
			let word_bits = word_index.toString(2).padStart(11, '0');
			full_bits += word_bits;
		}
		
		// pretty_log("Mnk2EinfC> full_bits.length", full_bits.length);
		// pretty_log("Mnk2EinfC> full_bits", full_bits.substring(0, 50) + "...");
		
		// Utiliser la nouvelle méthode de checksum
		let checksum_bit_count = Bip39Utils.GetChecksumBitCountCustom( word_count );
		let entropy_bit_count = full_bits.length - checksum_bit_count;
		
		// pretty_log("Mnk2EinfC> checksum_bit_count", checksum_bit_count);
		// pretty_log("Mnk2EinfC> entropy_bit_count", entropy_bit_count);
		
		let entropy_bits = full_bits.substring(0, entropy_bit_count);
		let received_checksum = full_bits.substring(entropy_bit_count);
		
		// pretty_log("Mnk2EinfC> entropy_bits.length", entropy_bits.length);
		// pretty_log("Mnk2EinfC> received_checksum", received_checksum);
		
		// Convertir entropy_bits en hex - CORRECTION POUR BITS NON MULTIPLES DE 4
		let entropy_hex = "";
		if (entropy_bits.length > 0) {
			// Convertir directement les bits en hex sans passer par binaryToHex
			// qui nécessite des multiples de 4
			let hex_chars = [];
			let temp_bits = entropy_bits;
			
			// Traiter par groupes de 4 bits
			for (let i = 0; i < temp_bits.length; i += 4) {
				let nibble = temp_bits.substring(i, i + 4);
				// Ajouter des zéros à droite si nécessaire
				while (nibble.length < 4) {
					nibble += "0";
				}
				hex_chars.push(parseInt(nibble, 2).toString(16));
			}
			
			entropy_hex = hex_chars.join('');
			// Enlever les zéros de fin inutiles (optionnel)
			entropy_hex = entropy_hex.replace(/0+$/, '');
			if ( entropy_hex === "" ) entropy_hex = "0";
		}
		
		pretty_log("Mnk2EinfC> entropy_hex", entropy_hex);
		
		// Recalculer le checksum attendu
		let expected_checksum = Bip39Utils.EntropyToChecksumCustom(entropy_hex, word_count);		
		pretty_log("Mnk2EinfC> expected_checksum", expected_checksum);
		
		let is_valid = (received_checksum === expected_checksum);
		
		pretty_log("Mnk2EinfC> isValid", is_valid);
		
		entropy_info[CHECKSUM] = received_checksum;
		entropy_info[ENTROPY_HEX] = entropy_hex;
		entropy_info["isValid"] = is_valid;
		entropy_info["wordCount"] = word_count;
		entropy_info["isStandard"] = (word_count >= 12 && word_count % 3 === 0);
		entropy_info["checksumBitCount"] = checksum_bit_count;
		entropy_info["expectedChecksum"] = expected_checksum;
		entropy_info["fullBits"] = full_bits;
		entropy_info["entropyBits"] = entropy_bits;
		
		return entropy_info;
	} // Bip39Utils.MnemonicsToEntropyInfoCustom()
	
	// ++++++++++
	// Nouvelle méthode pour support 1-24 mots
	static GetChecksumBitCountCustom( word_count ) {
		if ( word_count == undefined ) {
			word_count = 12;
		}
		
		// Standard BIP39 pour 12-24 mots
		let bip39_size = getBip39Size( word_count );
		if ( bip39_size != undefined ) return bip39_size.checksum_bits;
		
		if ( word_count >= 12 ) {
			return Math.floor(word_count / 3);
		} else {
			// Pour 1-11 mots: minimum 1 bit de checksum
			return Math.max(1, Math.floor(word_count / 3));
		}
	} // Bip39Utils.GetChecksumBitCountCustom()
	// ++++++++++++++++++++++++++++++ Custom handling of mnemonics cuount 1..24
	
	
	
	// https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1
	static GetChecksumBitCount( word_count ) {
		if ( word_count == undefined ) {
			 word_count = 12;
		}
		// NB: non BIP39 word count => 4 bits (unlike EntropySize.GetChecksumBitCount() which returns 8)
		let bip39_size = getBip39Size( word_count );
		return ( bip39_size != undefined ) ? bip39_size.checksum_bits : DEFAULT_CHECKSUM_BIT_COUNT;
	} // Bip39Utils.GetChecksumBitCount()
	
	static GetWordIndexes( mnemonics, args ) {
		console.log(">> " + _CYAN_ + "Bip39Utils.GetWordIndexes " + _END_);
		// console.log("Bip39.GetWordIdx   mnemonics: " + mnemonics);
		
		args = Bip39Utils.GetArgs( args );
		// console.log("Bip39.GetWordIdx   args: " + JSON.stringify(args));
		let lang            = (args[LANG] != undefined) ? args[LANG] : "EN";
		// console.log("Bip39.GetWordIdx   lang: " + lang);
		
		let word_index_base = (args["word_index_base"] != undefined) ? args["word_index_base"] : "Decimal";
		// console.log("Bip39.GetWordIdx   word_index_base: " + word_index_base);
		
		// console.log("   word_index_base: " + word_index_base);
		// console.log("   Lang:            " + lang);
		
		let words = mnemonics.split(' ');
		// console.log("Bip39.GetWordIdx   words: " + JSON.stringify(words));
		// console.log("   words("+ words.length + "): " + words);

		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		let word_indexes  = [];
		
		const NORMALIZED_WORDLIST = LANG_WORDLIST.map(normalizeBip39);
		
		let word_index   = -1;
		let current_word = '';
		
		for ( let i=0; i < words.length; i++ ) {
			current_word = words[i];
			let normalized_word = normalizeBip39(current_word);
			// console.log("   word("+ i + "): " + current_word);
			
			word_index = LANG_WORDLIST.indexOf( current_word );
			if ( word_index == -1 ) {
				word_index = NORMALIZED_WORDLIST.indexOf( normalized_word );
			}
			// console.log("   word_index: " + word_index);
			
			if ( word_index_base == "Decimal" ) { 
				word_indexes.push( word_index.toString() );
			}
			else if (word_index_base == "Binary") { 
				let word_index_binary = parseInt(word_index, 10).toString(2).padStart(11, "0");
				// console.log("   word_index_binary: " + word_index_binary);				
				word_indexes.push( word_index_binary );
			}
		}
		//console.log(">> END " + _CYAN_ + "Bip39Utils.GetWordIndexes " + _END_);
		return word_indexes;
	} // Bip39Utils.GetWordIndexes()
	
	static WordIndexesToMnemonics( word_indexes, lang ) {
		if ( word_indexes == undefined ) {
			word_indexes = [];
		}
		if ( lang == undefined ) {
			lang = "EN";
		}
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		
		let word_count = word_indexes.length;
		
		let mnemonics = [];
				
		if ( getBip39Size( word_count ) == undefined ) {
			return mnemonics;
		}
		
		let entropy_binary = "";
		for ( let i=0; i < word_indexes.length; i++ ) {
			let current_word = word_indexes[i];
			let word_index = parseInt( current_word );
			let word_index_binary = parseInt(word_index, 10).toString(2).padStart(11, "0");
			entropy_binary += word_index_binary;
		} // for each word in 'words'
		
		
		let checksum_bit_count = Bip39Utils.GetChecksumBitCount( word_count );
		// console.log("   checksum_bit_count:         " + checksum_bit_count);
	    
		let checksum_bits = entropy_binary.substring( entropy_binary.length - checksum_bit_count );		
		// console.log("   checksum_bits:              " + checksum_bits);
		
		let entropy_bits = entropy_binary.substring( 0, entropy_binary.length - checksum_bit_count );
		
		let entropy_hex  = binaryToHex( entropy_bits );
		// pretty_log("   entropy_hex", entropy_hex);
		
		mnemonics = Bip39Utils.EntropyToMnemonics( entropy_hex, lang );

		return mnemonics;
	} // Bip39Utils.WordIndexesToMnemonics()
	
	static GetBIP39Dictionary( lang ) {	
		//console.log(">> " + _CYAN_ + "Bip39Utils.GetBIP39Dictionary " + _END_);	
		if (lang == undefined) {
			lang = "EN";
		}
		//console.log("   lang: " + lang);

		let mnemonics_dictionary = Bip39Mnemonic.Words.ENGLISH;
		switch ( lang ) {
			case "EN": 	mnemonics_dictionary = Bip39Mnemonic.Words.ENGLISH; break; // English	
			case "FR":  mnemonics_dictionary = Bip39Mnemonic.Words.FRENCH;  break; // French		
			case "ES":  mnemonics_dictionary = Bip39Mnemonic.Words.SPANISH; break; // Spanish		
			case "IT":  mnemonics_dictionary = Bip39Mnemonic.Words.ITALIAN; break; // Italian				
			case "CS":  mnemonics_dictionary = CS_WORDLIST; break;                 // Czech		
			case "PT":  mnemonics_dictionary = PT_WORDLIST; break;                 // Portuguese
			
			case "SC":  mnemonics_dictionary = SC_WORDLIST; break;                 // Simplified Chinese		
			case "TC":  mnemonics_dictionary = TC_WORDLIST; break;                 // Traditional Chinese				
			case "JP":  mnemonics_dictionary = JAPANESE_MNEMONICS; break;          // Japanese						
			case "KO":  mnemonics_dictionary = KO_WORDLIST; break;                 // Korean	
			
			// ------------------ Added 'Non official in BIP39' languages ------------------						
			case "DE":  mnemonics_dictionary = GERMAN_MNEMONICS; break;		       // German			
			case "EO":  mnemonics_dictionary = ESPERANTO_MNEMONICS; break;		   // Esperanto
			
            case "RU":  mnemonics_dictionary = RUSSIAN_MNEMONICS; break;		   // Russian	
			
			case "EL":  mnemonics_dictionary = GREEK_MNEMONICS; break;             // Greek
			case "LA":  mnemonics_dictionary = LATIN_MNEMONICS; break;             // Latin 
			
			case "HI":  mnemonics_dictionary = HINDI_MNEMONICS; break;             // Hindi	
			case "GU":  mnemonics_dictionary = GUJARATI_MNEMONICS; break;          // Gujarati			
			case "BN":  mnemonics_dictionary = BENGALI_MNEMONICS; break;           // Bengali
			// ------------------ Added 'beyond BIP39 standard' languages
		
			default:	mnemonics_dictionary = Bip39Mnemonic.Words.ENGLISH;
						break;
		}
		
		return mnemonics_dictionary;
	} // Bip39Utils.GetBIP39Dictionary()
	
	static GetMnemonicFromWordIndex( word_index, lang ) {	
		console.log(">> " + _CYAN_ + "Bip39Utils.GetMnemonicFromWordIndex " + _END_);	
		if ( word_index < 0 || word_index > 2047 ) return '';
		
		// console.log(">> -------- Bip39.widx2word  lang: '" + lang + "'");
			
		if ( lang == undefined ) {
			lang = "EN";
		}
		// console.log(">> -------- Bip39.widx2word  word_index: " + word_index);
		// console.log(">> -------- Bip39.widx2word  lang:       " + lang);

		let mnemonics_dictionary = Bip39Utils.GetBIP39Dictionary( lang );
		
		let mnemonic = mnemonics_dictionary[word_index];
		// console.log(">> -------- Bip39.widx2Mnic   mnemonic:  " + mnemonic);
		
		return mnemonic;
	} // Bip39Utils.GetMnemonicFromWordIndex()
	
	static GuessMnemonicsLang( mnemonics ) {
		pretty_log(">> Bip39Utils.GuessMnemonicsLang", "" );
		let lang         = "EN";
		let words        = mnemonics.split(' ');
		let current_lang = "";
		
		for ( let i=0; i < SUPPORTED_LANGS.length; i++ ) {
			current_lang = SUPPORTED_LANGS[i];
			// console.log("   Check if 'mnemonics' is: " + current_lang);
			let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( current_lang );
			// console.log("   LANG_WORDLIST.length: " + LANG_WORDLIST.length);
			
			let found_word_count = 0;
			for ( let j=0; j < words.length; j++ ) {
				let current_word = words[j];

				let word_index = LANG_WORDLIST.indexOf( current_word );
				if ( word_index != -1 )  {
					found_word_count++;
					// console.log("   current_word[" + j + "]: " + current_word  );
				    // console.log("   found_word_count: " + found_word_count );
				}
			}
			if ( found_word_count == words.length ) {
				return current_lang;
			}
		} 	
		return current_lang;
	} // Bip39Utils.GuessMnemonicsLang()
	
	static CheckMnemonics( mnemonics, args ) {
		pretty_log(">> Bip39Utils.CheckMnemonics", "");		
		
		args = Bip39Utils.GetArgs( args );
		let lang       = args[LANG];
		let word_count = args["word_count"];

		let words = mnemonics.split(' ');
		//console.log("   words.length: " + words.length);
		if ( words.length != word_count ) { 
			return false;
		}
		
		let LANG_WORDLIST = Bip39Utils.GetBIP39Dictionary( lang );
		
		for ( let i=0; i < words.length; i++ ) {
			let current_word = words[i];
			//console.log("   word[" + i + "] : " + current_word);
			let word_index = LANG_WORDLIST.indexOf( current_word );
			if ( word_index == -1 ) {
				return false;
			}
		}
		return true;
	} // Bip39Utils.CheckMnemonics()
	
	static MnemonicsAs4letter( mnemonics ) {
		//console.log(">> " + _CYAN_ + "Bip39Utils.MnemonicsAs4letter" + _END_);
		let word_4letter_prefixes = '';
		let words                 = mnemonics.split(' ');
		let word_count            = words.length;
		
		let capitalize = (in_str) => {
			return in_str.charAt(0).toUpperCase() + in_str.slice(1);
        }; // capitalize()
		
		for ( let i=0; i < word_count; i++ ) {
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
		//console.log(">> " + _CYAN_ + "Bip39Utils.MnemonicsAsTwoParts" + _END_);
				
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
            let half_index = Math.floor( words.length / 2 );	
            // console.log("half_index: " + half_index);			
            mnemonics_2parts.push( words.slice( 0,  half_index ).join().replaceAll(',' , ' ') );	
            mnemonics_2parts.push( words.slice( half_index).join().replaceAll(',' , ' ') );				
		}				   
				
		return mnemonics_2parts;
	} // Bip39Utils.MnemonicsAsTwoParts()	
	
	static LabelWithSize(data, size) {
		let msg = data + "(" + size + ")";
		return msg;
	} // Bip39Utils.LabelWithSize()
	
	static GetArgs( args ) {		
		const getArgValue = ( args, key, default_value ) => {
			let arg_value = default_value;
			if ( args[key] != undefined ) {
				arg_value = args[key];
			}
			return arg_value; 
		}; // getArgValue()
		
		// console.log(">> " + _CYAN_ + "Bip39Utils.GetArgs" + _END_);
		
		// console.log("Bip39.GetArgs   args: " + JSON.stringify(args));
		
		if ( args == undefined ) {
			 args = {};
		}
		
		args[LANG]          = getArgValue( args, LANG,          "EN" ); 
		// console.log("Bip39.GetArgs(LANG):  LANG constant: " + LANG + "  args[LANG]:" + args[LANG]);
		
		args[WORD_COUNT]    = getArgValue( args, WORD_COUNT,    12 ); 
		args[BLOCKCHAIN]    = getArgValue( args, BLOCKCHAIN,    BITCOIN ); 
		args[CRYPTO_NET]    = getArgValue( args, CRYPTO_NET,    MAINNET );
		args[UUID]          = getArgValue( args, UUID,          uuidv4() );
        args[ADDRESS_INDEX] = getArgValue( args, ADDRESS_INDEX, 0 );	
		args[ACCOUNT]       = getArgValue( args, ACCOUNT,       0 );		
		
		//console.log("   args 2: " + JSON.stringify(args));
		
		return args; 
	} // Bip39Utils.GetArgs()
} // Bip39Utils class

const test_Bip39Utils = () => {
	let mnemonics =   "cupboard merge release real stock learn allow obey soup gasp pupil sail "
	                + "allow enroll name yard note silver abuse castle public you ship stay";
					
	mnemonics =   "cupboard merge release real stock learn allow obey "         // 15
 	            + "soup gasp pupil sail allow enroll name";
				
	mnemonics =   "cupboard merge release real stock learn allow obey soup "    // 18
                + "gasp pupil sail allow enroll name yard note silver";   
				
	mnemonics =   "cupboard merge release real stock learn allow "              // 21
                + "obey soup gasp pupil sail allow enroll "
                + "name yard note silver abuse castle public";
				
	let mnemonics_items = Bip39Utils.MnemonicsAsTwoParts( mnemonics );
	pretty_log("mnemonics: " , mnemonics);
	pretty_log("mnemonics_items[0]: " , mnemonics_items[0]);
	pretty_log("mnemonics_items[0]: " , mnemonics_items[1]);
}; // test_EntropyToMnemonics()

// test_Bip39Utils();

const test_GuessMnemonicsLang = () => {
	let mnemonics_PT = "agrupar jato bitola moderno ocupado ossada sedutor quente grisalho julho moto vagaroso"; 
	
	let lang = "";	
	lang = Bip39Utils.GuessMnemonicsLang( mnemonics_PT );
	pretty_log("   lang: " , lang);
	
	let mnemonics_RU = "аршин огурец вскоре пощечина режим рояль укол стать нагрузка округ программа шланг";				
	lang = Bip39Utils.GuessMnemonicsLang( mnemonics_RU );
	pretty_log("   lang: " , lang);
}; // test_GuessMnemonicsLang()

const test_LessThan12Mnemonics = () => {
	let mnemonics = "trumpet perfect belt duty stay";
	let lang      = "EN";
	let result = Bip39Utils.MnemonicsToEntropyInfoCustom( mnemonics, lang );
	console.log( JSON.stringify(result) );
}; // test_GuessMnemonicsLang()

const translate_ConvertLessThan12Mnemonics = async () => {
	let current_mnemonic     = '';
	let new_mnemonic         = '';

	let mnemonics  = ''
	let lang       = '';     
	let options    = {};	
	let word_index = -1;

    let current_lang = 'EN';
	let new_lang     = 'FR';	

    let current_mnemonics = "trumpet perfect belt duty stay".split(' ');
    let translated_secret_phrase_value = '';	
	
	for ( let i=0; i < current_mnemonics.length; i++ ) {
		current_mnemonic = current_mnemonics[ i ];
		
		mnemonics = current_mnemonic;
		options = { [LANG]: 'EN' };
		let word_indexes = Bip39Utils.GetWordIndexes( mnemonics, options );
		console.log("word_indexes: " + JSON.stringify(word_indexes));
		
		// console.log("word_indexes): " + JSON.stringify(word_indexes) );
        word_index = word_indexes[0];		
		
		new_mnemonic = Bip39Utils.GetMnemonicFromWordIndex( word_index, 'FR' ).normalize('NFC');
		console.log(" *** word{ 'No':" + i + ", 'word_idx':" + word_index + "} in '" + current_lang + "': '" +  current_mnemonic + "'  translated to '" + new_lang + "': " + new_mnemonic);	

		translated_secret_phrase_value += new_mnemonic + ' ';				
	}

	translated_secret_phrase_value = translated_secret_phrase_value.trim(' ');
    console.log( "\ntranslated_mnemonics: " + translated_secret_phrase_value);
}; // translate_ConvertLessThan12Mnemonics()

// test_GuessMnemonicsLang();

// test_LessThan12Mnemonics();
// translate_ConvertLessThan12Mnemonics();

if (typeof exports === 'object') {
	exports.Bip39Utils = Bip39Utils	
} // exports of 'bip39_utils.js'