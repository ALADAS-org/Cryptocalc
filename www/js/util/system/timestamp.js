// ==========================================================================================================
// ==========================================     timestamp.js     ==========================================
// ==========================================================================================================
"use strict";

const padWithZero = (n) => (n < 10 ? ('0'+n).toString() : n.toString());

// const EXTRACT_SECONDS      = "extract seconds";
// const EXTRACT_MILLISECONDS = "extract milliseconds";

// const getDayTimestamp = ( arg ) => {
const getDayTimestamp = () => {
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours
	let today 	      = new Date();
	
	let today_year 	  = today.getFullYear();
	let today_month   = today.getMonth() + 1;
	let today_date 	  = today.getDate();
	let today_hours   = today.getHours();
	let today_minutes = today.getMinutes();
	let today_seconds = today.getSeconds();
	
	let today_seconds_original = today_seconds;	
	// if ( arg == EXTRACT_SECONDS ) today_seconds_original = today_seconds;
	
	let today_milliseconds    = today.getMilliseconds();	
	let today_tenth_of_second = Math.round( today.getMilliseconds() / 100 );
	
	if ( today.getMilliseconds() >= 951 ) {
		today_seconds += 1;
		today_tenth_of_second = 0;
	}
	// console.log(">> getDayTimestamp  year:" + today_year + " month:" + today_month + " date:" + today_date);
	// let ts_str = today_year + "_" + padWithZero(today_month) + "_" + padWithZero(today_date);
	let ts_str =   today_year + "_"   + padWithZero(today_month) + "_" + padWithZero(today_date) + "_"
	             + padWithZero(today_hours) + "h-" + padWithZero(today_minutes) + "m-" + padWithZero(today_seconds) + "s-" + today_tenth_of_second;
				 
	//if ( arg == EXTRACT_MILLISECONDS ) {
	//	ts_str = ts_str + "-" + today_seconds_original + "origsec-" +  today_milliseconds + "ms";
	//}
		
	return ts_str;
}; // getDayTimestamp()

const test_timestamp = () => {
	for (let i=0; i < 5; i++ ) {
		let timestamp  = getDayTimestamp( EXTRACT_MILLISECONDS );
		
		// console.log( "\ntimestamp: " +timestamp);
		
		let date_items = timestamp.split('_');
		console.log( "date_items: " + JSON.stringify( date_items ) );
		// console.log( "date_items: " + JSON.stringify( date_items ) );
		
		// console.log( "date_items[3]: " + date_items[3] );
		let time_items = date_items[3].split('-');
		console.log( "time_items: " + JSON.stringify( time_items ) );
		
		let seconds = parseInt(time_items[2]); 
		
		let tenth_of_second = parseInt(time_items[3]);

		console.log( "date_items[3]: " + date_items[3] );
        // let milliseconds = parseInt(date_items[3].split('ms:'));	
		
		//if ( milliseconds >= 100 ){
		//	console.log( timestamp + " ** 1/10 sec:" +  tenth_of_second + " second:" + seconds + " ms:" + milliseconds);
		//}
	}
}; // test_timestamp()

// test_timestamp();

if ( typeof exports === 'object' ) {
	exports.getDayTimestamp = getDayTimestamp;	
} // exports of 'timestamp.js'