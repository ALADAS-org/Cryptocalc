// ====================================================================================
// =================================   file_utils.js   =================================
// ====================================================================================
"use strict";
const os      = require('os');
const fs      = require('fs');
const appRoot = require('app-root-path');

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
	} // FileUtils.GetFilesInFolder()
	
	static CreateSubfolder( parent_path, subfolder_name ) {
		//console.log("> evt handler: folder:create: " + folderName);
		let output_path = parent_path + "/" + subfolder_name;
		if ( !fs.existsSync( output_path ) ) {
			fs.mkdirSync( output_path, { recursive: true } );
		}
		return output_path;
   } // FileUtils.CreateSubfolder()
   
   static GetApplicationPath() {
	   return appRoot;
   } // FileUtils.GetApplicationPath()
   
   static AppPathHasAdminAccessRights () {
	   let app_path = FileUtils.GetApplicationPath();
	   console.log("   app_path: " + app_path);
	   return false;
   } // FileUtils.AppPathHasAdminAccessRights()
   
   // https://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
   static GetOutputPath() {
   } // FileUtils.GetOutputPath()
}; // FileUtils class

FileUtils.AppPathHasAdminAccessRights();

if (typeof exports === 'object') {
	exports.FileUtils = FileUtils	
} // exports of 'file_utils.js'