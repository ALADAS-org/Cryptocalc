//=======================================================================================
//================================   RU_build_wordlist.js   =============================
//=======================================================================================
"use strict";
// https://github.com/Vanege/esperanto-frequency-list-tekstaro/blob/main/EO%2015000%20Tekstaro.txt
const fs = require('node:fs');

let { RUSSIAN_MNEMONICS } = require('./RU_1626_mnemonics.js');

let filepath = "./RU_10000_words.txt";

let wordlist = [];

const ru_data = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });

let input_words         = ru_data.split('\n');
let word_count          = 1;
let first_four_prefixes = [];
let new_words           = [];

const updateFirstFourPrefixes = ( words ) => {
	let first_four_prefixes = [];
	for (let i=0; i < words.length; i++) {
		let prefix = words[i].substring(0, 4);		
		if ( ! first_four_prefixes.includes(prefix) ) {
			// console.log( "new prefix: '" + prefix + "'");
			first_four_prefixes.push(prefix);
		}
	}  
	return first_four_prefixes;
}; // updateFirstFourPrefixes() 

const getNewWordList = ( input_wordlist, previous_wordlist ) => {
	let new_wordlist    = [];
	let common_wordlist = [];
	
	for (let i=0; i < input_wordlist.length; i++) {
		let input_word = input_wordlist[i].toLowerCase();
		
		if ( ! previous_wordlist.includes(input_word) ) {
			//console.log( "input_word[" + word_count++ + "] : '" + input_word + "'");
			if ( input_word.length >= 4 ) {
				new_wordlist.push(input_word);
			}
		} 
		else {
			// console.log( "input_word: " + input_word + " ALREADY in dictionary");
			common_wordlist.push(input_word);
		}
	}  
	return new_wordlist;
}; // getNewWordList()

const FuseWordlists = (previous_wordlist, new_wordlist, used_prefixes, expected_size) => {
	let fused_wordlists = previous_wordlist;
	// console.log("fused_wordlists: " + fused_wordlists.length);
	
	for (let i=0; i < new_wordlist.length; i++) {
		let new_word = new_wordlist[i].toLowerCase();
		// console.log("word[" + i + "] : '" + new_word + "'");  
		if ( previous_wordlist.indexOf(new_word) == -1 ) {
			// console.log("1. word : '" + new_word + "' is not in 'previous_wordlist'");
			if ( new_word.length >= 4 ) {
				// console.log("2. word : '" + new_word + "' has length >= 4");
				let prefix = new_word.substring(0, 4);	
				// console.log("3. word prefix of '" + new_word + "' is '" + prefix + "'");
				let prefix_index = used_prefixes.indexOf(prefix);
				if ( ! used_prefixes.includes(prefix) ) {
					// console.log("4. word prefix: '" + prefix + "' of '" + new_word + "' is not in 'used_prefixes'");
					fused_wordlists.push(new_word);
					first_four_prefixes.push(prefix);
					if (fused_wordlists.length == expected_size) {
						return fused_wordlists;
					}
				}
				else {
					// console.log("5. word prefix: '" + prefix + "' of '" + new_word + "' is ALREADY in 'used_prefixes' index: " + prefix_index);
				}
			}
		}
	}
    return fused_wordlists;	
}; // FuseWordlists()

// console.log("** Build russian 2048 wordlist **"); 

// console.log(JSON.stringify(json_data));
// Converts words to Uppercase
for (let i=0; i<input_words.length; i++) {
	let current_word = input_words[i];
	// console.log("word[" + i + "] = " + current_word);
	let current_word_UC = current_word.toUpperCase();
	// console.log(">> word[" + i + "] = " + current_word_UC);
	input_words[i] = current_word_UC;
}

// console.log( "RUSSIAN_MNEMONICS length: " + RUSSIAN_MNEMONICS.length); 
first_four_prefixes = updateFirstFourPrefixes(RUSSIAN_MNEMONICS);	
// console.log( "first_four_prefixes step 1: " + first_four_prefixes.length); 

let new_russian_wordlist = getNewWordList(input_words, RUSSIAN_MNEMONICS);
// console.log( "first_four_prefixes step 2: " + first_four_prefixes.length);

let russian_wordlist = FuseWordlists(RUSSIAN_MNEMONICS, new_russian_wordlist, first_four_prefixes, 2048);
// console.log( "russian_wordlist: " + russian_wordlist.length);
russian_wordlist.sort(); 

console.log(JSON.stringify(russian_wordlist));  
//console.log(russian_wordlist.length);  