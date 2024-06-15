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
	const fortune_list_str = fs.readFileSync(__dirname + "/fortune_catalog.txt").toString();
	//console.log("   fortune_filenames_str:\n" + fortune_filenames_str);
	let fortune_list = fortune_list_str.split('\n');
	//console.log("   fortune_files.length: " + fortune_files.length);
	
	let fortune_path     = "";
	let fortune_str      = "";
	let current_fortunes = "";
	let fortune_filename = "";
	let fortunes         = [];
	
	for (let i=0; i < fortune_list.length; i++) {
		fortune_filename = fortune_list[i];
		//console.log("   fortune_filename[" + i + "]: " + fortune_filename);
		fortune_path = __dirname + "/data/" + fortune_filename;
		fortune_path = fortune_path.replaceAll("\r","");
				
		fortune_str = fs.readFileSync( fortune_path ).toString();
		fortune_str = fortune_str.replaceAll("\r","");
		current_fortunes = fortune_str.split(/\n%\n/);
		//console.log("   current_fortunes.length: " + current_fortunes.length);
		fortunes = fortunes.concat( current_fortunes );
	}
	return fortunes;
}; // getFortuneCookies()

const getFortuneCookie = () => {
	//console.log(">> getFortuneCookie");
	
	if (fortunes.length == 0) {
		fortunes = getFortuneCookies();
	}
	//console.log("   fortunes.length: " + fortunes.length);
	
	let fortune_cookie = "";
	let random_index   = 0;
	while ( fortune_cookie.length == 0 ) { 
		random_index   = getRandomInt( fortunes.length );
		fortune_cookie = fortunes[random_index];
    }
	
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