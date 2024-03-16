// =====================================================================================
// =================================   html_utils.js   =================================
// =====================================================================================
"use strict";

class HtmlUtils {
	// https://stackoverflow.com/questions/2155737/remove-css-class-from-element-with-javascript-no-jquery
	static HasClass(elt_id, className) {
		//log2Main(">> HtmlUtils.HasClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return false;
		}		
		//log2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			return elt.classList.contains(className);
		} else {
			return (-1 < elt.className.indexOf(className));
		}
		return false;
	} // HtmlUtils.HasClass()
	
	static AddClass(elt_id, className) {
		//log2Main(">> HtmlUtils.AddClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return;
		}
		//log2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			elt.classList.add(className);
		} else if (! HtmlUtils.HasClass(elt, className)) {
			let classes = elt.className.split(" ");
			classes.push(className);
			elt.className = classes.join(" ");
		}
		return elt;
	} // HtmlUtils.AddClass()
	
	static RemoveClass(elt_id, className) {
		//log2Main(">> HtmlUtils.RemoveClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return;
		}
		//log2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			elt.classList.remove(className);
		} else {
			let classes = elt.className.split(" ");
			classes.splice(classes.indexOf(className), 1);
			elt.className = classes.join(" ");
		}
		return elt;
	} // HtmlUtils.RemoveClass()
} // HtmlUtils class