// ====================================================================================
// =================================   string_utils.js  ===============================
// ====================================================================================

// https://codedamn.com/news/javascript/how-to-fix-typeerror-converting-circular-structure-to-json-in-js
"use strict";

const isString = (x) => {
  return Object.prototype.toString.call(x) === "[object String]"
}; // isString())

const stringify = (obj) => {
  let cache = [];
  let str = JSON.stringify(obj, function(key, value) {
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

//module.exports = { stringify }
if (typeof exports === 'object') {
	exports.isString          = isString
	exports.stringify         = stringify
	exports.insertAfterEveryN = insertAfterEveryN
	exports.stringToHex       = stringToHex
} // exports of 'string_utils.js' 