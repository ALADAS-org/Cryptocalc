// ===============================================================================================================
// =======================================   password_strength_evaluator.js  =====================================
// ===============================================================================================================
"use strict";

const HEXA              = 'HEXA';
const UPPER_CASE        = 'UPPER_CASE';
const LOWER_CASE        = 'LOWER_CASE';
const DIGIT             = 'DIGIT';
const SPECIAL_CHARACTER = 'SPECIAL_CHARACTER';

const { PWD_STR_AS_BITS,
        PWD_STR_AS_ADJECTIVE } = require('../const_keywords.js'); 

class PasswordStrengthEvaluator {
	static #Key = Symbol();
	static #Singleton = new PasswordStrengthEvaluator( this.#Key );
	static #InstanceCount = 0;	
	
	static ALPHABET_ENTROPIES = { [HEXA]: 4, [UPPER_CASE]: 4.7, [LOWER_CASE]: 4.7, [DIGIT]: 3.32, [SPECIAL_CHARACTER]: 4.52 };
	
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
		const SPECIAL_CHARACTERS = '+-/=_<>&#$*@%[](){}";,.'; 
		return (SPECIAL_CHARACTERS.indexOf(str) !== -1);
	} // is_digit()

    // ** Private constructor **
	constructor( key ) {
		// console.log(">> new 'PasswordStrengthEvaluator'");
		if ( key !== PasswordStrengthEvaluator.#Key ) {
			throw new TypeError("'PasswordStrengthEvaluator' constructor is private");
		}
	} // ** Private constructor **
	
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
	
	getPasswordStrengthAsAdjective( password_str ) {
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
		// * 36 - 59 bits Moderate / Reasonable A combination of a few unrelated words or a complex, random-looking string of 8-10 characters (e.g., Red*Sky$At4Night or turtle battery staple). Resists online attacks for a long time but may fall to determined offline attacks. Days to decades
        // else if ( password_strength_bits >= 36 && password_strength_bits <= 59 ) { 
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
	} // getPasswordStrengthAsAdjective()
	
	getPasswordStrengthInfo( password_str ) {
		let password_strength_bits      = this.getPasswordStrengthAsBits( password_str );		
		let password_strength_adjective = this.getPasswordStrengthAsAdjective( password_str );
		
		let password_strength_info = { [PWD_STR_AS_BITS]: password_strength_bits, [PWD_STR_AS_ADJECTIVE]: password_strength_adjective };
		return password_strength_info;
	} // getPasswordStrengthInfo()
	
	getEntropyForAlphabetAsBits( alphabet_size ) {
		let entropy_for_alphabet = 0;
		if ( alphabet_size <= 1 ) return 0;
		entropy_for_alphabet = Math.log2( alphabet_size );
		entropy_for_alphabet = Number(entropy_for_alphabet.toFixed(2));
		return entropy_for_alphabet;
	} // getEntropyForAlphabetAsBits()
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
	get_and_display_entropy_for_alphabet(23); // Special Characters:                 [+-/=_<>&#$*@%[](){}";,.]  
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

const test_GetDisplayPasswordStrength = () => {
	const get_and_display_password_strength = ( password_str ) => {
		let this_obj = PasswordStrengthEvaluator.This;
		let separator = "\n";
		if ( password_str.length < 10 ) separator = "\t\t";
		let password_strength = this_obj.getPasswordStrengthAsBits( password_str );
        console.log( " > For password(" + password_str.length + "): '" + password_str + "' " + separator + "     password_strength:   " + password_strength + " bits" );
	}; // compute_and_display_password_strength()
	
	get_and_display_password_strength( '0' );
	get_and_display_password_strength( '5' );
	get_and_display_password_strength( 'A' );
	get_and_display_password_strength( 'a' );
	get_and_display_password_strength( 'Z' );
	get_and_display_password_strength( 't' );
	get_and_display_password_strength( '+' );
	get_and_display_password_strength( '*$' );
	get_and_display_password_strength( 'Aa' );
	get_and_display_password_strength( 'Z/' );	
		
	console.log("----------------");
	
	get_and_display_password_strength( '010101' );
	get_and_display_password_strength( '0123' );	
	get_and_display_password_strength( 'deadbeef' );
	get_and_display_password_strength( '0xdeadbeef' );
	get_and_display_password_strength( 'Hello World' );
	get_and_display_password_strength( 'The quick brown fox jumps over the lazy dog' );
	
	get_and_display_password_strength( 'Hello World' );
	get_and_display_password_strength( '$Hello World-567*' );
	
	get_and_display_password_strength( '01234567' );
	get_and_display_password_strength( 'ABCDEFGHIJ' );
	
	get_and_display_password_strength( 'Base58ttmrze8BVniavN7wEjRWeJq83vASNFZ4mrze8' ); 
	
	//                                  ASNFZ4mrze8BI0VniavN7wEjRWeJq83vASNFZ4mrze8=  43 coding digits
	get_and_display_password_strength( 'Base64+0OIl/mrze8BVniavN7wEjRWeJqSNFZ4mrze8' ); 
	get_and_display_password_strength( 'Base64+0OIl/mrze8BVniavN7wEjRWeJq83vASNrze8=' );
	
	get_and_display_password_strength( '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' );
	get_and_display_password_strength( '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' );
	
	get_and_display_password_strength(  '0101010100000000010101010000000001010101000000000101010100000000'
	                                  + '0101010100000000010101010000000001010101000000000101010100000000' );
									  
	get_and_display_password_strength("ttttttttttt134555");
	
	let pk_hex =   '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' 
	// console.log("pk_hex.length: " + pk_hex.length);
	get_and_display_password_strength(pk_hex);
} // test_GetDisplayPasswordStrength()

// test_GetDisplayPasswordStrength();

if ( typeof exports === 'object' ) {
	exports.PasswordStrengthEvaluator = PasswordStrengthEvaluator	
} // exports of 'password_strength_evaluator.js'