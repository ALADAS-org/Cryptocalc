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
	
	static HideElement( elt_id ) {
		//log2Main(">> HtmlUtils.AddClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return;
		}
		
		elt.hidden = true; 
	} // HtmlUtils.HideElement()
	
	static ShowElement( elt_id ) {
		//log2Main(">> HtmlUtils.AddClass elt_id:" + elt_id);
		let elt = document.getElementById(elt_id);
		if (elt == undefined) { 
		    return;
		}
		
		elt.hidden = false; 
	} // HtmlUtils.ShowElement()
	
	static GetElement( elt_id ) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { return elt; }
		return undefined;
	} // HtmlUtils.GetElement)
	
	static GetField( elt_id ) {
		//log2Main(">> " + _CYAN_ + "HtmlUtils.SetField() " + _YELLOW_ + elt_id + _END_);
		let elt = document.getElementById( elt_id );	
        		
		if ( elt != undefined ) { 
			if ( elt.nodeName == "TD" || elt.nodeName == "SPAN" ) {
				return elt.textContent;
			}
			else {
				return elt.value;
			}	
		}
		return "Null_String";
	} // HtmlUtils.GetField()	

	static SetField( elt_id, value_str ) {
		//log2Main(">> " + _CYAN_ + "HtmlUtils.SetField() " + _END_ + elt_id);
		//log2Main(" elt_id: " + elt_id);
		let elt = document.getElementById( elt_id );
		if ( elt != undefined ) {
            //log2Main(" elt.nodeName: " + elt.nodeName);			
			if (   elt.nodeName == "TD" 
			    || elt.nodeName == "SPAN" || elt.nodeName == "BUTTON" ) {
				elt.textContent = value_str;
			}
			else if ( elt.nodeName == "TEXTAREA" ) {
                // **PB** value change seems asynchronous 
                // https://stackoverflow.com/questions/47240315/how-to-update-input-from-a-programmatically-set-textarea 				
                // https://www.geeksforgeeks.org/jquery-set-the-value-of-an-input-text-field/
				// ** Fix **: set value via JQuery and NOT with 'elt.value = value_str'
				// => $('#' + elt_id).prop("value", value_str);
				$('#' + elt_id).prop("value", value_str);
			}
			else {
				elt.value = value_str;
			}	
		}
	} // HtmlUtils.SetField()
} // HtmlUtils class