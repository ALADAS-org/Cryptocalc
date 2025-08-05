// ====================================================================================
// ==================================   hex_utils.js  =================================
// ====================================================================================
"use strict";

const HEX_ALPHABET = "0123456789abcdefABCDEF";

// https://gist.github.com/bugventure/36cb8923ec212e47b47602e3821d1005
const HEX_LOOKUP_TABLE = {
  '0': '0000', '1': '0001', '2': '0010', '3': '0011', 
  '4': '0100', '5': '0101', '6': '0110', '7': '0111',
  '8': '1000', '9': '1001', 'a': '1010', 'b': '1011', 
  'c': '1100', 'd': '1101', 'e': '1110', 'f': '1111'
}; // HEX_LOOKUP_TABLE

// https://stackoverflow.com/questions/9907419/how-to-get-a-key-in-a-javascript-object-by-its-value
const getKeyByValue = (object, value) => {
	return Object.keys(object).find(key => object[key] === value);
}; // getKeyByValue()

const binaryToHex = (in_binary_str) => {
	let hex_str = "";
    //let binary_str = hex_to_binary(hex_str);
    for (let i=0; i < in_binary_str.length; i+=4) {
		let nibble = in_binary_str.substring(i, i+4); // [i..i+3]
		//console.log("nibble: " + nibble);
		let hex_digit = getKeyByValue(HEX_LOOKUP_TABLE, nibble);
		//console.log("hex_digit: " + hex_digit);
        hex_str += hex_digit;
    }
    return hex_str;
}; // binaryToHex()

//const hexToBinary = (in_hex_str, trace) => {
const hexToBinary = (in_hex_str, trace) => {
	let hex_str = hexWithoutPrefix(in_hex_str);
	//if (trace != undefined && trace == true) {
	//	console.log("   hex_str:                    " + hex_str);
	//}
    let binary_str = "";
    for (let i=0; i < hex_str.length; i++) {
		let hex_digit = hex_str[i].toLowerCase();		
		let nibble = HEX_LOOKUP_TABLE[hex_digit];
		
		//if (trace != undefined && trace == true) {
		//	console.log("   hex_digit[" + i + "]: " + hex_digit);
		//	console.log("   nibble[" + i + "]: " + nibble);
		//}
		//console.log("nibble: " + nibble);		
		
        binary_str += nibble;
    }
    return binary_str;
}; // hexToBinary()

const hexWithoutPrefix = (hex_str) => {
	//console.log("hexWithoutPrefix: '" + hex_str + "'");
	if (hex_str.startsWith('0x')) {
		hex_str = hex_str.substring(2);
	}
	return hex_str;
}; // hexWithoutPrefix	

const hexWithPrefix = ( hex_str ) => {
	if (! hex_str.startsWith('0x')) {
		hex_str = '0x' + hex_str;
	}
	return hex_str;
}; // hexWithPrefix	

const isHexString = ( in_str ) => {
	in_str = hexWithoutPrefix(in_str.toLowerCase());
	let is_hex = true;
	for ( let i=0; i < in_str.length; i++ ) {	
		let c = in_str[i];
		if ( HEX_ALPHABET.indexOf(c) == -1 ) {
			return false;
		}
	}
	return is_hex;
}; // isHexString	

const hexToUint8Array = (hex_str) => {
	//console.log("hexToUint8Array: " + hex_str);
	//console.log("hexToUint8Array length: " + hex_str.length);
	hex_str = hexWithoutPrefix(hex_str);
	if ( hex_str.length % 2 !== 0 ) {
		throw "**ERROR 1** Invalid hex_str: " + hex_str + " length is not pair: " + hex_str.length;
	} /* from  www.java2s.com */
	let array_buffer = new Uint8Array(hex_str.length / 2);

	for (let i=0; i < hex_str.length; i+=2) {		
		let hex_digit = hex_str.substr(i, 2);
		//console.log("hexToUint8Array: i=" + i + " hex_digit= '" + hex_digit + "'");
		let byte_value = parseInt(hex_digit, 16);
		if (isNaN(byte_value)){
			throw "**ERROR 2** Invalid hex_str";
		}
		array_buffer[i/2] = byte_value;
	}

	return array_buffer;
}; // hexToUint8Array

const uint8ArrayToHex = (unint_array) => {
    let hex_str = "";
	for (let i=0; i < unint_array.length; i++) {
		let current_uint = unint_array[i];  
        //console.log(">> current_uint[" + i + "]: " + current_uint);
		
		let hex_value = current_uint.toString(16).padStart(2, '0');
		//console.log(">> hex_value: [" + i + "]: " + hex_value);
		
		hex_str += hex_value;
	}

	return hex_str;
}; // uint8ArrayToHex

const hexToBytes = (hex_str) => {
    if (hex_str.length % 2 !== 0) {
        throw "Must have an even number of hex digits to convert to bytes";
    }
    let byte_count = hex_str.length / 2;
    let hex_bytes  = [];
    for (var i=0; i < byte_count; i++) {
        hex_bytes.push(parseInt(hex_str.substr(i*2, 2), 16));
    }
    return hex_bytes;
}; // hexToBytes()

const hexToB64 = (hex_str) => {
	if (hex_str.startsWith("0x")) hex_str = hex_str.substring(2);
	return btoa(hex_str.match(/\w{2}/g).map(function(a) {
		return String.fromCharCode(parseInt(a, 16));
	}).join(""));
}; // hexToB64

// https://stackoverflow.com/questions/39460182/decode-base64-to-hexadecimal-string-with-javascript
// checked with:
// OK: https://base64.guru/converter/decode/hex
// OK: https://8gwifi.org/base64Hex.jsp
// OK: https://tomeko.net/online_tools/base64.php?lang=en
// OK: https://conv.darkbyte.ru/
const b64ToHex = ( b64_str ) => {
	const buffer = Buffer.from( b64_str, 'base64' );
	//const buffer = new ArrayBuffer(b64_str, 'base64');
    return buffer.toString('hex');
}; // b64ToHex

/**
 * Cryptographically secure random number generator
 * Works in both Node.js and browser environments
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number between min (inclusive) and max (exclusive)
 */
const secureRandom = (min, max) => {
  // Validate input
  if (min >= max) {
    throw new Error('Max must be greater than min');
  }
  
  // Calculate the range
  const range = max - min;
  
  // Create a typed array for crypto random values
  const byteArray = new Uint32Array(1);
  
  // Get crypto module - works in both Node and browser
  let crypto = undefined;
  if (typeof exports === 'object') {
		crypto = require('crypto');
  }
  else crypto = window.crypto || window.msCrypto;
  
  // console.log("secureRandom crypto: " + crypto);
  
  // Generate random values
  crypto.getRandomValues(byteArray);
  
  // Convert to float between 0 (inclusive) and 1 (exclusive)
  const randomFloat = byteArray[0] / (0xFFFFFFFF + 1);
  
  // Scale to desired range and return
  return Math.floor(randomFloat * range) + min;
}; // secureRandom()

function getRandomInt(max) {
	return secureRandom(0, max+1);
}; // getRandomInt()

const getRandomHexValue = (byte_count) => {
    let hex_str = "";
	for (let i=0; i < byte_count; i++) {
		let current_uint = getRandomInt(255); 
		//console.log("---------------");		
		//console.log("current_uint[" + i + "] = " + current_uint);
		let hex_value = current_uint.toString(16).padStart(2, '0');
		hex_str += hex_value;
		//console.log("hex_str bytes: " + hex_str.length/2 + "\n   " + hex_str);
	}

	return hex_str;
}; // getRandomHexValue()

const testRandomInt = () => {
	let max = 255;
	
	let min_1 = max;
	let min_2 = max;
	
	let max_1 = 0;
	let max_2 = 0;
	
	for (let i=0; i<1000; i++) {
		let random_1 = getRandomInt(max);
		min_1 = random_1 < min_1 ? random_1 : min_1;
		max_1 = random_1 > max_1 ? random_1 : max_1;
		
		let random_2 = Math.floor(Math.random() * max);
		min_2 = random_2 < min_2 ? random_2 : min_2;
		max_2 = random_2 > max_2 ? random_2 : max_2;
		
		console.log("secureRandom R1: " + random_1 + " (min:" + min_1 + " max:" + max_1 + ")   " +    
		                         "R2: " + random_2 + " (min:" + min_2 + " max:" + max_2 + ")  ");
	}
}; // testRandomInt()

// testRandomInt();

if (typeof exports === 'object') {
	exports.hexToBytes        = hexToBytes
	exports.hexToUint8Array   = hexToUint8Array
	exports.uint8ArrayToHex   = uint8ArrayToHex
	exports.hexWithoutPrefix  = hexWithoutPrefix
	exports.hexWithPrefix     = hexWithPrefix
	exports.isHexString       = isHexString
	exports.hexToBinary       = hexToBinary
	exports.binaryToHex       = binaryToHex
	exports.hexToB64          = hexToB64
	exports.b64ToHex          = b64ToHex
	exports.getRandomInt      = getRandomInt
	exports.getRandomHexValue = getRandomHexValue
} // exports of 'hex_utils.js'