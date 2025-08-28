//=======================================================================================
//================================   BN_build_wordlist.js   =============================
//=======================================================================================
"use strict";
const fs = require('node:fs');

let BENGALI_ORIGINAL_WORDLIST =  
[]; // BENGALI_ORIGINAL_WORDLIST

let filepath = "./bengali.txt";

let wordlist = [];

const data = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });

const remove_words =
[];

let input_words         = data.split('\n');
let word_count          = 1;
let prefixes = [];
let new_words           = [];

// console.log("> input_words.length: " + input_words.length);
// return

const updateFirstFourPrefixes = ( words ) => {
	let prefixes = [];
	let prefix = ''; 
	for (let i=0; i < words.length; i++) {
		let current_word = words[i];
		if (current_word.length == 3) prefix = current_word;
		else                          prefix = current_word.substring(0, 4);	
		
		if ( ! prefixes.includes(prefix) ) {
			// console.log( "new prefix: '" + prefix + "'");
			prefixes.push(prefix);
		}
	}  
	return prefixes;
}; // updateFirstFourPrefixes() 

const getNewWordList = ( input_wordlist, previous_wordlist ) => {
	let new_wordlist    = [];
	let common_wordlist = [];
	
	for (let i=0; i < input_wordlist.length; i++) {
		let input_word = input_wordlist[i];
		
		if ( ! previous_wordlist.includes(input_word) ) {
			//console.log( "input_word[" + word_count++ + "] : '" + input_word + "'");
			if ( input_word.length >= 3 ) {
				new_wordlist.push(input_word);
			}
		} 
		else {
			//console.log( "input_word: " + input_word + " ALREADY in dictionary");
			common_wordlist.push(input_word);
		}
	}  
	return new_wordlist;
}; // getNewWordList()

const FuseWordlists = (previous_wordlist, new_wordlist, used_prefixes, expected_size) => {
	let fused_wordlists = previous_wordlist;
	console.log("fused_wordlists: " + fused_wordlists.length);
	
	let prefix = '';
	
	for (let i=0; i < new_wordlist.length; i++) {
		let new_word = new_wordlist[i];
		// console.log("word[" + i + "] : '" + new_word + "'"); 
		
		if ( previous_wordlist.indexOf(new_word) == -1 ) {
			// console.log("1. word : '" + new_word + "' is not in 'previous_wordlist'");
			let items = new_word.split(" ");

			if ( new_word.length >= 3) {
				// console.log("2. word : '" + new_word + "' has length >= 3");
				
				if ( new_word.length == 3) prefix = new_word;
                else                       prefix = new_word.substring(0, 4); 				
				
				// console.log("3. word prefix of '" + new_word + "' is '" + prefix + "'");
				let prefix_index = used_prefixes.indexOf(prefix);

				// https://www.geeksforgeeks.org/javascript/javascript-program-to-check-if-a-string-contains-only-alphabetic-characters/				
				let isAlphabetic = /^[A-zÀ-ú]+$/.test(new_word);
				
				let is_in_remove = remove_words.indexOf(new_word) != -1;

				if (   ! used_prefixes.includes(prefix) && new_word.indexOf(' ')==-1 
				    && !isAlphabetic && !is_in_remove) {
					console.log("4. word prefix: '" + prefix + "' of '" + new_word + "' is not in 'used_prefixes'");
					fused_wordlists.push(new_word);
					prefixes.push(prefix);
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

prefixes = updateFirstFourPrefixes(BENGALI_ORIGINAL_WORDLIST);	
// console.log( "prefixes step 1: " + prefixes.length); 

let new_bengali_wordlist = getNewWordList(input_words, BENGALI_ORIGINAL_WORDLIST);
// prefixes = updateFirstFourPrefixes(new_hindi_wordlist);	
// console.log( "prefixes step 2: " + prefixes.length);

let hindi_wordlist = FuseWordlists(BENGALI_ORIGINAL_WORDLIST, new_bengali_wordlist, prefixes, 2048);
console.log( "hindi_wordlist: " + hindi_wordlist.length);
hindi_wordlist.sort(); 

console.log( "hindi_wordlist: " + JSON.stringify(hindi_wordlist)); 
console.log( "hindi_wordlist lenght: " + hindi_wordlist.length);

let msg = '[ ';
for (let i=0; i < hindi_wordlist.length; i++) {
	msg += '"' + hindi_wordlist[i] + '"'
	if ((i + 1)< hindi_wordlist.length) msg += ', '; 
	else                                msg += ' '; 
}	
msg += ']';

console.log( "msg:\n" + msg);