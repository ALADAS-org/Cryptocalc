// ===============================================================================================================
// =======================================   password_strength_evaluator.js  =====================================
// ===============================================================================================================
"use strict";

const HEXA              = 'HEXA';
const UPPER_CASE        = 'UPPER_CASE';
const LOWER_CASE        = 'LOWER_CASE';
const DIGIT             = 'DIGIT';
const SPECIAL_CHARACTER = 'SPECIAL_CHARACTER';

const { PWD_STR_AS_SCORE,
        PWD_STR_AS_ADJECTIVE } = require('../const_keywords.js'); 
		
const zxcvbn = require('zxcvbn'); 

class PasswordStrengthEvaluator {
	static #Key = Symbol();
	static #Singleton = new PasswordStrengthEvaluator( this.#Key );
	static #InstanceCount = 0;	
	
	static ALPHABET_ENTROPIES = { [HEXA]: 4, [UPPER_CASE]: 4.7, [LOWER_CASE]: 4.7, [DIGIT]: 3.32, [SPECIAL_CHARACTER]: 4.81 };
	
	// static GetInstance() {
	static get This() {
		if( PasswordStrengthEvaluator.#Singleton == undefined ) {
			this.#Singleton = new PasswordStrengthEvaluator( this.#Key );
			if ( this.#InstanceCount > 0 ) {
				throw new TypeError("'PasswordStrengthEvaluator' constructor called more than once");
			}
			this.#InstanceCount++;
        }
        return PasswordStrengthEvaluator.#Singleton;
    } // 'This' getter
	
	is_binary_string( in_str ) {
		// console.log(">> is_binary_string \n   '" + in_str + "'" );
		
		const BINARY_CHARACTERS = '01'; 
		if ( in_str == '' || in_str == undefined || in_str == null ) return false;
		
		if ( in_str.startsWith('0x') ) in_str = in_str.replace('0x','');
		
		let result = true;
		for ( let i=0; i < in_str.length; i++ ) {
			let char_at_index = in_str[i];
			// console.log(">> is_binary_string   char_at_index[" + i + "]: " + char_at_index );
			let pos = BINARY_CHARACTERS.indexOf( char_at_index );
			// console.log(">> is_binary_string   pos[" + i + "]: " + pos );
			if ( pos == -1 ) return false;
		}	
		
		return result;
	} // is_binary_string()
	
	is_hexa_string( in_str ) {
		const HEXA_CHARACTERS = '0123456789abcdef';			
		if ( in_str == '' || in_str == undefined || in_str == null ) return false;
		
		if ( in_str.startsWith('0x') ) in_str = in_str.replace('0x','');
		
		in_str = in_str.toLowerCase();
		
		let result = true;
		for ( let i=0; i < in_str.length; i++ ) {
			let char_at_index = in_str[i];
			if ( HEXA_CHARACTERS.indexOf( char_at_index ) == -1 ) return false;
		}	
		
		return result;
	} // is_hexa_string()
	
	is_base58_string( in_str ) {
		const BASE58_CHARACTERS =   'ABCDEFGHJKLMNPQRSTUVWXYZ'	
                                  + 'abcdefghijkmnopqrstuvwxyz'
								  + '123456789';								  
		if ( in_str == '' || in_str == undefined || in_str == null ) return false;
		
		let result = true;
		for ( let i=0; i < in_str.length; i++ ) {
			let char_at_index = in_str[i];			
            if ( BASE58_CHARACTERS.indexOf( char_at_index ) == -1 ) return false;
		}	
		
		return result;
	} // is_base58_string()
	
	is_base64_string( in_str ) {
		const BASE64_CHARACTERS =   'ABCDEFGHIJKLMNOPQRSTUVWXYZ'	
                                  + 'abcdefghijklmnopqrstuvwxyz'
								  + '0123456789+/';								  
		if ( in_str == '' || in_str == undefined || in_str == null ) return false;
		
		let result = true;
		for ( let i=0; i < in_str.length; i++ ) {
			let char_at_index = in_str[i];
			
			if ( char_at_index == '=' ) {
				// console.log(" i: " + i + " in_str.length: " + in_str.length); 
				if (i != (in_str.length - 1) )  return false;
			}
			else if ( BASE64_CHARACTERS.indexOf( char_at_index ) == -1 ) return false;
		}	
		
		return result;
	} // is_base64_string()
	
	is_octal_string( in_str ) {
		const OCTAL_CHARACTERS = '01234567';			
		if ( in_str == '' || in_str == undefined || in_str == null ) return false;
		
		in_str = in_str.toLowerCase();
		
		let result = true;
		for ( let i=0; i < in_str.length; i++ ) {
			let char_at_index = in_str[i];
			if ( OCTAL_CHARACTERS.indexOf( char_at_index ) == -1 ) return false;
		}	
		
		return result;
	} // is_octal_string()
	
	is_upper_case(str) {
		return str === str.toUpperCase() && str !== str.toLowerCase();
	} // is_upper_case()
	
	is_lower_case(str) {
		return str === str.toLowerCase() && str !== str.toUpperCase();
	} // is_lower_case()
	
	is_digit(str) {
		return /^\d+$/.test(str);
	} // is_digit()
	
	
	is_special_character(str) {
		// const SPECIAL_CHARACTERS = '+-/=_<>&#$*@%[](){};,.\'"'; 
		const SPECIAL_CHARACTERS = '-_#+*!§$%&=?@,.;:\'~"/(){}[]\\'; // 28 characters: entropy = 4.81 bit / character 
		return (SPECIAL_CHARACTERS.indexOf(str) !== -1);
	} // is_digit()

    // ** Private constructor **
	constructor( key ) {
		// console.log(">> new 'PasswordStrengthEvaluator'");
		if ( key !== PasswordStrengthEvaluator.#Key ) {
			throw new TypeError("'PasswordStrengthEvaluator' constructor is private");
		}
	} // ** Private constructor **
	
	getPasswordStrengthScore( password_str ) {
		let zxcvbn_result = zxcvbn( password_str );
		let password_score = zxcvbn_result.score;		
		return password_score;
	} // getPasswordStrengthScore()
	
	// 0 – 27 bits	    Very Weak	            Simple words, “password”, “123456”, short names
	// 28 – 35 bits	    Weak	                Single dictionary word with a few digits (“summer23”)
	// 36 – 59 bits	    Fair    	            Two random words or a word + symbols (“Blue$Tiger42”)
	// 60 – 79 bits	    Good	                Three random words or long passphrase
	// 80 – 127 bits    Strong	                Four or more random words; secure random generator used
	// 128 bits +	    Very Secure	            Random 16-byte key or long diceware passphrase
	getPasswordStrengthAsBits( password_str ) {
		let password_strength = 0;
		
		const compute_string_entropy = ( password_str, alphabet_size ) => {
			if ( ( alphabet_size == 16 ) ) {
				if ( password_str.startsWith('0x') ) password_str = password_str.replace('0x','');
			}
				
			for ( let i=0; i < password_str.length; i++ ) {
				let char_at_index = password_str[i];				
	            if ( ! (alphabet_size == 64 && char_at_index == '=') ) {
					password_strength += this.getEntropyForAlphabetAsBits( alphabet_size );
				}
			}
			password_strength = Number(password_strength.toFixed(2));
			
			return password_strength;	
		}; // compute_string_entropy()
		
		if ( this.is_binary_string( password_str ) ) return compute_string_entropy( password_str, 2 );
		if ( this.is_octal_string( password_str ) )  return compute_string_entropy( password_str, 8 );
		if ( this.is_hexa_string( password_str ) )   return compute_string_entropy( password_str, 16 );
		if ( this.is_base58_string( password_str ) ) return compute_string_entropy( password_str, 58 );		
		if ( this.is_base64_string( password_str ) ) return compute_string_entropy( password_str, 64 );
		
		for (let i=0; i<password_str.length; i++) { 
			let char_at_index = password_str[i];			
	
			if ( this.is_upper_case(char_at_index) )        	 password_strength += PasswordStrengthEvaluator.ALPHABET_ENTROPIES[UPPER_CASE];
			else if ( this.is_lower_case(char_at_index) )        password_strength += PasswordStrengthEvaluator.ALPHABET_ENTROPIES[LOWER_CASE];
			else if ( this.is_digit(char_at_index) )             password_strength += PasswordStrengthEvaluator.ALPHABET_ENTROPIES[DIGIT];
			else if ( this.is_special_character(char_at_index) ) password_strength += PasswordStrengthEvaluator.ALPHABET_ENTROPIES[SPECIAL_CHARACTER];
		}		
		
		password_strength = Number(password_strength.toFixed(2));
		
		return password_strength;
	} // getPasswordStrengthAsBits()	
	
	getPasswordScoreAsAdjective( password_str ) {
		let password_strength_score = this.getPasswordStrengthScore( password_str );
		
		let password_strength_adjective = "Null";	
		
		// - 0	 Very Weak
		// - 1	 Weak
		// - 2	 Good
		// - 3	 Strong
		// - 4   Very Strong		
		if ( password_strength_score == 0 ) { 
			password_strength_adjective = "Very Weak";
        }
        else if ( password_strength_score == 1 ) { 
			password_strength_adjective = "Weak";
        }
		else if ( password_strength_score == 2 ) { 
			password_strength_adjective = "Good";
        }
        else if ( password_strength_score == 3 ) { 
			password_strength_adjective = "Strong";
        }
        else if ( password_strength_score == 4 ) { 
			password_strength_adjective = "Very Strong";
        }        

		return password_strength_adjective;
	} // getPasswordScoreAsAdjective()
	
	getPasswordStrengthBitsAsAdjective( password_str ) {
		let password_strength_bits = this.getPasswordStrengthAsBits( password_str );
		
		// Entropy (Bits) Adjective Example / Meaning Estimated Time to Crack (Ballpark)
		
		let password_strength_adjective = "Null";
		
		// ChatGPT answer: 
		// Entropy (bits)	Strength Description	Typical Example
		// 0 – 27 bits	    Very Weak	            Simple words, “password”, “123456”, short names
		// 28 – 35 bits	    Weak	                Single dictionary word with a few digits (“summer23”)
		// 36 – 59 bits	    Moderate / Fair    	    Two random words or a word + symbols (“Blue$Tiger42”)
		// 60 – 79 bits	    Strong	                Three random words or long passphrase
		// 80 – 127 bits    Very Strong	            Four or more random words; secure random generator used
		// 128 bits +	    Very Secure	            Random 16-byte key or long diceware passphrase
		
		// * < 28 bits Very Weak / Negligible A short, simple password like password or 123456. Easily cracked by any attacker. Instantly to minutes
		if ( password_strength_bits <= 27.99 ) { 
			password_strength_adjective = "Very Weak";
        }
		// * 28 - 35 bits Weak A simple word with minor substitutions (e.g., SunnY2021). Vulnerable to dictionary attacks. Minutes to days
        else if ( password_strength_bits >= 28 && password_strength_bits <= 35.99 ) { 
			password_strength_adjective = "Weak";
        }
		// * 36 - 59 bits Moderate / Reasonable A combination of a few unrelated words or a complex, random-looking string of 8-10 characters (e.g., Red*Sky$At4Night or turtle battery staple). 
		//           Resists online attacks for a long time but may fall to determined offline attacks. Days to decades
		else if ( password_strength_bits >= 36 && password_strength_bits <= 59.99 ) { 
			password_strength_adjective = "Fair";
        }
		// * 60 - 79 bits Strong A long passphrase of 4-5 random, uncommon words or a 12+ character completely random password (e.g., ~Zg%4LXf&S9@ or alfresco-pixel-avocado-canteen). Very resistant to offline attacks. Centuries to millions of years
        else if ( password_strength_bits >= 60 && password_strength_bits <= 79.99 ) { 
			password_strength_adjective = "Good";
        }
		// * 80 - 99 bits Very Strong A passphrase of 6+ random words or a 15+ character random password. This is the recommended level for highly sensitive data (e.g., password managers, encryption keys). Millions to billions of years
        else if ( password_strength_bits >= 80 && password_strength_bits <= 127.99 ) { 
			password_strength_adjective = "Strong";
        }        
		// * 100+ bits Extremely Strong / Overkill A passphrase of 8+ random words or a very long, complex password. Effectively unbreakable by any known or foreseeable brute-force method. Longer than the age of the universe
        // else if ( password_strength_bits >= 128 ) { 
		else if ( password_strength_bits >= 128 ) { 
			password_strength_adjective = "Very Secure";
        }  	
		
		return password_strength_adjective;
	} // getPasswordStrengthBitsAsAdjective()
	
	getPasswordStrengthInfo( password_str ) {
		let password_score     = this.getPasswordStrengthScore( password_str );		
		let password_adjective = this.getPasswordScoreAsAdjective( password_str );
		
		let password_strength_info = { [PWD_STR_AS_SCORE]: password_score, [PWD_STR_AS_ADJECTIVE]: password_adjective };
		return password_strength_info;
	} // getPasswordStrengthInfo()
	
	getEntropyForAlphabetAsBits( alphabet_size ) {
		let entropy_for_alphabet = 0;
		if ( alphabet_size <= 1 ) return 0;
		entropy_for_alphabet = Math.log2( alphabet_size );
		entropy_for_alphabet = Number(entropy_for_alphabet.toFixed(2));
		return entropy_for_alphabet;
	} // getEntropyForAlphabetAsBits()
	
	
	// ======== DeepSeek mix zxvcbn and Entropy ========  
	DS_calculateAdjustedEntropy( password ) {
		const charSets = {
			lower: /[a-z]/.test(password),
			upper: /[A-Z]/.test(password),
			numbers: /[0-9]/.test(password),
			symbols: /[^a-zA-Z0-9]/.test(password)
		};
		
		const charsetSize = [
			charSets.lower ? 26 : 0,
			charSets.upper ? 26 : 0,
			charSets.numbers ? 10 : 0,
			charSets.symbols ? 33 : 0
		].reduce((a, b) => a + b, 0);
		
		// Base entropy
		let entropy = password.length * Math.log2(charsetSize);
		
		// Penalties for common patterns
		if (/(.)\1/.test(password)) entropy *= 0.9; // repeated chars
		if (/^[A-Z]/.test(password)) entropy *= 0.95; // starts with uppercase
		if (/\d$/.test(password)) entropy *= 0.95; // ends with number
		
		return Math.max(entropy, 0);
	} // DS_calculateAdjustedEntropy()

	// Better scoring scale
	DS_entropyToScore( entropy ) {
		if (entropy < 28) return 0; // Very Weak
		if (entropy < 35) return 1; // Weak
		if (entropy < 45) return 2; // Fair
		if (entropy < 55) return 3; // Strong
		return 4; // Very Strong
	} // DS_entropyToScore()
	
	DS_comprehensivePasswordStrength( password ) {
		const zxcvbnResult = zxcvbn(password);
		const adjustedEntropy = this.DS_calculateAdjustedEntropy( password );
		
		return {
			zxcvbnScore: 	zxcvbnResult.score, // 0-4
			entropy: 		adjustedEntropy,
			feedback: 		zxcvbnResult.feedback,
			// Combine both metrics for final assessment
			finalAssessment: Math.max(zxcvbnResult.score, this.DS_entropyToScore(adjustedEntropy))
		};
	} // DS_comprehensivePasswordStrength()
	// ======== DeepSeek mix zxvcbn and Entropy
} // PasswordStrengthEvaluator

const test_GetDisplayEntropyForAlphabet = () => {
	const get_and_display_entropy_for_alphabet = ( alphabet_size ) => {
		let entropy = PasswordStrengthEvaluator.This.getEntropyForAlphabetAsBits( alphabet_size );
		console.log( " > For an alphabet with " + alphabet_size + "\tsymbols the entropy = \t" + entropy + " bits" );
	}; // compute_and_display_entropy_for_alphabet()

	// · Lowercase letters only:                  26 options (~4.7 bits/char)
    // · Lowercase + Uppercase:                   52 options (~5.7 bits/char)
    // · Alphanumeric (a-z, A-Z, 0-9):            62 options (~5.95 bits/char)
    // · Full keyboard (a-z, A-Z, 0-9, symbols): ~95 options (~6.6 bits/char)	
	get_and_display_entropy_for_alphabet(2);  // Binary digits:                      [0..1]
	get_and_display_entropy_for_alphabet(4);
	get_and_display_entropy_for_alphabet(8);  // Octal digits:                       [0..7] 
	get_and_display_entropy_for_alphabet(10); // Decimal digits:                     [0..9] 
	get_and_display_entropy_for_alphabet(16); // Hexadecimal digits:                 [0123456789abcdef] 
	get_and_display_entropy_for_alphabet(28); // Special Characters:                 [+-/=_<>&#$*@%[](){}'";,.]  
	get_and_display_entropy_for_alphabet(26); // Alphabetic Characters Upper:        [A..Z]
	get_and_display_entropy_for_alphabet(32);
	get_and_display_entropy_for_alphabet(52); // Alphabetic Characters Upper/Lower:  [A..Z][a..z]
	get_and_display_entropy_for_alphabet(58); // Base58 Characters:                  [A..Z][a..z][0..9] except 0,O,I,l
	get_and_display_entropy_for_alphabet(62); // Alphanumeric Characters:            [A..Z][a..z][0..9]         
	get_and_display_entropy_for_alphabet(64); // Base64 Characters:                  [A..Z][a..z][0..9]+/  
	get_and_display_entropy_for_alphabet(85); // Alphanumeri + Special characters:   [A..Z][a..z][0..9][+-/=_<>&#$*@%[](){}";,.]
	get_and_display_entropy_for_alphabet(256);
} // test_GetDisplayEntropyForAlphabet()

// test_GetDisplayEntropyForAlphabet();

// Password strength checker:
// * https://bitwarden.com/password-strength/?gad_campaignid=21289974901
//
// 'zxcvbn' (https://www.dropbox.com/)
// https://www.npmjs.com/package/zxcvbn
const test_GetDisplayPasswordStrength = () => {
	const get_and_display_password_strength = ( password_str ) => {
		let this_obj = PasswordStrengthEvaluator.This;
		let separator = "\n";
		if ( password_str.length < 10 ) separator = "\t\t";
		let password_strength_bits = this_obj.getPasswordStrengthAsBits( password_str );
		let password_strength_adjective = this_obj.getPasswordStrengthBitsAsAdjective( password_str );
        console.log(   " > For password(" + password_str.length + "): '" + password_str + "' " + separator 
		             + "     strength:   " + password_strength_bits + " bits - " + password_strength_adjective);
	}; // compute_and_display_password_strength()
	
	const get_both_results = ( password ) => {
		let this_obj = PasswordStrengthEvaluator.This;
		let zxcvbn_result = zxcvbn( password );	
		let guesses = zxcvbn_result.guesses;
		let adjusted_strength = this_obj.DS_comprehensivePasswordStrength( password );
		console.log('--------');
		get_and_display_password_strength( password );
		console.log( "For '" + password + "' zxcvbn score is: " + zxcvbn_result.score + "  adjusted_strength: " + JSON.stringify(adjusted_strength));
	}; // get_both_results()
	
	get_both_results( '0' );
	get_both_results( '5' );
	get_both_results( 'A' );
	get_both_results( 'a' );
	get_both_results( 'Z' );
	get_both_results( 't' );
	get_both_results( '+' );
	get_both_results( '*$' );
	get_both_results( 'Aa' );
	get_both_results( 'Z/' );	
		
	console.log("----------------");
	
	get_both_results( '010101' );
	get_both_results( '0123' );	
	get_both_results( 'deadbeef' );
	get_both_results( '0xdeadbeef' );
	get_both_results( 'Hello World' );
	get_both_results( 'The quick brown fox jumps over the lazy dog' );
	
	get_both_results( 'Hello World' );
	get_both_results( '$Hello World-567*' );
	
	get_both_results( '01234567' );
	
	get_both_results( 'ABCDEFGHIJ' );
	
	
	get_both_results('AAAAAAAAAA');
	
	get_both_results('Tr0ub4dour&3');
	
	get_both_results( 'Base58ttmrze8BVniavN7wEjRWeJq83vASNFZ4mrze8' ); 
	
	//                 ASNFZ4mrze8BI0VniavN7wEjRWeJq83vASNFZ4mrze8=  43 coding digits
	get_both_results( 'Base64+0OIl/mrze8BVniavN7wEjRWeJqSNFZ4mrze8' ); 
	get_both_results( 'Base64+0OIl/mrze8BVniavN7wEjRWeJq83vASNrze8=' );
	
	get_both_results( '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' );
	get_both_results( '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' );
	
	get_both_results(   '0101010100000000010101010000000001010101000000000101010100000000'
	                  + '0101010100000000010101010000000001010101000000000101010100000000' );
	
	get_both_results( 'ttttttttttt134555' );
	
	get_both_results( '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' );
	
	let password = 'display brand regular service above price middle someone someone fall beach daughter sock provide cabbage border hero science inject local regular strategy category castle';
	get_both_results( password ); 
	
	password = 'display brand regular service above price middle someone someone fall beach daughter';
	get_both_results( password ); 
	
	password = 'DispBranReguServAbovPricMiddSomeSomeFallBeacDaugSockProvCabbBordHeroScieInjeLocaReguStraCateCast';
	get_both_results( password ); 
	
	get_both_results( 'ab345436986' ); 
	
	get_both_results( '*WP5W5v3i' );
} // test_GetDisplayPasswordStrength()

// test_GetDisplayPasswordStrength();

if ( typeof exports === 'object' ) {
	exports.PasswordStrengthEvaluator = PasswordStrengthEvaluator	
} // exports of 'password_strength_evaluator.js'