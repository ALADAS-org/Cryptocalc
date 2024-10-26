// ====================================================================================
// =================================   string_utils.js  ===============================
// ====================================================================================

// https://codedamn.com/news/javascript/how-to-fix-typeerror-converting-circular-structure-to-json-in-js
"use strict";

const isString = (x) => {
  return Object.prototype.toString.call(x) === "[object String]"
}; // isString()

const getShortenedString = ( in_str, max_length ) => {
		const MAX_SHORTENED_LENGTH = 90;
		if ( max_length == undefined ) {
			max_length = 90;
		}

		if (in_str.length < max_length) { 
			max_length = in_str.length;			
        }
		
		if ( in_str == undefined ) in_str = "Null_String";
		
		let shortened_str = in_str.substring(0, max_length)
		                    .replaceAll('\n', ' ').replaceAll('\r', '');	
		if (in_str.length > max_length) { 
			shortened_str += "...";			
        }
		
		return shortened_str;
} // getShortenedString()

const stringify = (obj) => {
  let cache = [];
  let str = JSON.stringify( obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}; // stringify

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
}); // String.capitalize()

// https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
} // String.replaceAt()

// https://www.tutorialspoint.com/insert-a-character-after-every-n-characters-in-javascript
const insertAfterEveryN = (inputString, insertChar, n) => {
	let outputString = "";
	for (let i = 0; i < inputString.length; i += n) {
		let slice = inputString.slice(i, i + n);
		if (slice.length==n)
			outputString += slice + insertChar;
		else
			outputString += slice;
	}
	return outputString;
}; // insertAfterEveryN()

// https://www.slingacademy.com/article/javascript-convert-string-to-hex-and-vice-versa/
const stringToHex = (in_str) => {
  let hex_str = '';
  for (let i=0; i < in_str.length; i++) {
    const charCode = in_str.charCodeAt(i);
    const hexValue = charCode.toString(16);

    // Pad with zeros to ensure two-digit representation
    hex_str += hexValue.padStart(2, '0');
  }
  return hex_str;
}; // stringToHex()

const asTwoParts = ( seedphrase, word_count_per_line ) => {
		//console.log(">> " + _CYAN_ + "string_utils: asTwoParts" + _END_);
		//console.log("seedphrase:\n    " + seedphrase);
		
		// https://stackoverflow.com/questions/35499498/replace-nth-occurrence-of-string
		
		if ( seedphrase == undefined ) {
			return "Null-SEEDPHRASE";
		}
		
		let words            = seedphrase.split(' ');
		let word_count       = words.length;
		let half_word_count  = Math.floor( word_count/2 );
        let seedphrase_lines = [];	
		
		// NB: No need to cut in 2 parts less than 'word_count_per_line' (15)	
		if ( word_count <= word_count_per_line ) {
			seedphrase_lines.push( seedphrase );
		}
		else {	
		    // console.log("full seedphrase: " + seedphrase);
            let seedphrase_1 = words.slice(0, half_word_count).join(' '); 
            // console.log("seedphrase_1: " + seedphrase_1);			
			seedphrase_lines.push( seedphrase_1 ); 
			
			let seedphrase_2 = words.slice( half_word_count ).join(' '); 
			// console.log("seedphrase_2: " + seedphrase_2);
			seedphrase_lines.push( seedphrase_2 );
		}  
		
		return seedphrase_lines;
} // asTwoParts()

if (typeof exports === 'object') {
	exports.isString           = isString
	exports.stringify          = stringify
	exports.insertAfterEveryN  = insertAfterEveryN
	exports.stringToHex        = stringToHex
	exports.getShortenedString = getShortenedString
	exports.asTwoParts         = asTwoParts
} // exports of 'string_utils.js' 