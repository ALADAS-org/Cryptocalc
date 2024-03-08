// =====================================================================================
// ===================================   fortune.js   ==================================
// =====================================================================================
// 12803 cookies

"use strict";

const fs = require('fs');
const { getRandomInt } = require('../../crypto/hex_utils.js');

let fortunes = []; 

const getFortuneCookies = () => {
	//console.log(">> getFortuneCookies");
	const fortune_files_str = fs.readFileSync(__dirname + "/fortune_catalog.txt").toString();
	//console.log("   fortune_filenames_str:\n" + fortune_filenames_str);
	let fortune_files = fortune_files_str.split('\n');
	//console.log("   fortune_files.length: " + fortune_files.length);
	
	for (let i=0; i < fortune_files.length; i++) {
		let fortune_filename = fortune_files[i];
		//console.log("   fortune_filename[" + i + "]: " + fortune_filename);
		const fortune_file_str = fs.readFileSync(__dirname + "/data/" + fortune_filename).toString();
		let current_fortunes = fortune_file_str.split(/\n%\n/);
		//console.log("   current_fortunes.length: " + current_fortunes.length);
		fortunes = fortunes.concat(current_fortunes);
	}
	return fortunes;
}; // getFortuneCookies()

const getFortuneCookie = () => {
	//console.log(">> getFortuneCookie");
	
	if (fortunes.length == 0) {
		fortunes = getFortuneCookies();
	}
	//console.log("   fortunes.length: " + fortunes.length);
	
	let random_index = getRandomInt(fortunes.length);
	let fortune_cookie = fortunes[random_index];

    return fortune_cookie;
}; // getFortuneCookie()

const test_getRandomCookie = () => {
	let fortune_cookie = getFortuneCookie();
	console.log(fortune_cookie);
}; // test_getRandomCookie()

//test_getRandomCookie();

if (typeof exports === 'object') {
	exports.getFortuneCookie = getFortuneCookie
} // exports of 'fortune.js'