// ====================================================================================
// =================================   number_utils.js  ===============================
// ====================================================================================

// https://stackoverflow.com/questions/20169217/how-to-write-isnumber-in-javascript
"use strict";

function stringToInt(value_str) {
	let value_data = parseInt(value_str);
	if (value_data.toString() == NaN.toString()) value_data = 0;
	return value_data;
} // stringToInt()

function stringToFloat(value_str) {
	let value_data = parseFloat(value_str);
	if (value_data.toString() == NaN.toString()) value_data = 0;
	return value_data;
} // stringToFloat()

// https://linuxhint.com/check-if-string-number-javascript/
function isNum(v) {
	if (Array.isArray(v))
		return false;
    return /\d/.test(v);
} // isNum()

function valueIsNumber(value) {
	return Number.isFinite(value);
} // valueIsNumber()

function stringIsNumber(value) {
  return isNum(value);
} // stringIsNumber()

//module.exports = { stringify }
if (typeof exports === 'object') {
	exports.valueIsNumber  = valueIsNumber 
	exports.stringToFloat  = stringToFloat
	exports.stringToInt    = stringToInt
	exports.stringIsNumber = stringIsNumber
} // exports of 'number_utils.js'