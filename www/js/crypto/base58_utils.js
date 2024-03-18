//======================================================
//=================  base58_utils.js  ==================
//======================================================
"use strict";
const bs58 = require('bs58');

const b58ToHex = (b58_str) => {
	//const address = '16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS'
	const bytes = bs58.decode(b58_str)
	// See uint8array-tools package for helpful hex encoding/decoding/compare tools
	return (Buffer.from(bytes).toString('hex'));
	// => 003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187
}; // b58ToHex()

if (typeof exports === 'object') {
	exports.b58ToHex = b58ToHex
}