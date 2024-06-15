// ====================================================================================
// =================================   file_utils.js   =================================
// ====================================================================================
"use strict";
const fs = require('fs');

// https://stackoverflow.com/questions/33775113/count-the-number-of-files-in-a-directory-using-javascript-nodejs
const FileUtils = class {
	// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours
	static GetFilesInFolder( folder_path, filter ) {
		let files_in_folder = fs.readdirSync( folder_path );
		let file_count = 0;
		let filtered_files = [];
		for (let i=0; i < files_in_folder.length; i++) {
			let filename = files_in_folder[i];
			//console.log("file[" + i + "]: " + filename);
			
			let filename_items = filename.split('.');
			let file_extension = "";
			
			if (filename_items.length == 2) {
				file_extension = filename_items[1].toLowerCase();
				//console.log("   file_extension: " + file_extension);
				if (    file_extension == "png" 
				     || file_extension == "jpg" || file_extension == "jpeg"
					 || file_extension == "svg"
				   ) {
					filtered_files.push(filename);
				}
			}
		}
		return filtered_files;
	} // GetFilesInFolder()
}; // FileUtils class

if (typeof exports === 'object') {
	exports.FileUtils = FileUtils	
} // exports of 'file_utils.js'