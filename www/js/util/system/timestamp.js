// ====================================================================================
// =================================   timestamp.js   =================================
// ====================================================================================
"use strict";

const padWithZero = (n) => (n < 10 ? ('0'+n).toString() : n.toString());

const getDayTimestamp = () => {
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours
	let today 	      = new Date();
	
	let today_year 	  = today.getFullYear();
	let today_month   = today.getMonth() + 1;
	let today_date 	  = today.getDate();
	let today_hours   = today.getHours();
	let today_minutes = today.getMinutes();
	let today_seconds = today.getSeconds();
	
	let today_milliseconds = today.getMilliseconds();

	//console.log(">> getDayTimestamp  year:" + today_year + " month:" + today_month + " date:" + today_date);
	//let ts_str = today_year + "_" + padWithZero(today_month) + "_" + padWithZero(today_date);
	let ts_str = today_year + "_" + padWithZero(today_month) + "_" + padWithZero(today_date) + "_"
	           + today_hours + "h-" + today_minutes 
			   + "m-" + today_seconds + "s-" + Math.round(today_milliseconds/100);
	return ts_str;
}; // getDayTimestamp()

if (typeof exports === 'object') {
	exports.getDayTimestamp = getDayTimestamp	
} // exports of 'timestamp.js'