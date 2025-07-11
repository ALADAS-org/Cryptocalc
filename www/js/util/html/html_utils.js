// =====================================================================================
// =================================   html_utils.js   =================================
// =====================================================================================
"use strict";

class HtmlUtils {
	// https://stackoverflow.com/questions/2155737/remove-css-class-from-element-with-javascript-no-jquery
	static HasClass(elt, className) {
		if (elt == undefined) { 
		    return false;
		}		
		//trace2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			return elt.classList.contains(className);
		} else {
			return (-1 < elt.className.indexOf(className));
		}
		return false;
	} // HtmlUtils.HasClass()
	
	static AddClass(elt, className) {
		if (elt == undefined) { 
		    return;
		}
		//trace2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			elt.classList.add(className);
		} else if (! HtmlUtils.HasClass(elt, className)) {
			let classes = elt.className.split(" ");
			classes.push(className);
			elt.className = classes.join(" ");
		}
		return elt;
	} // HtmlUtils.AddClass()
	
	static RemoveClass(elt, className) {
		if (elt == undefined) { 
		    return;
		}
		//trace2Main("   elt.id:" + elt.id + " elt.classList: " + elt.classList);
		
		if (elt.classList != null) {
			elt.classList.remove(className);
		} else {
			let classes = elt.className.split(" ");
			classes.splice(classes.indexOf(className), 1);
			elt.className = classes.join(" ");
		}
		return elt;
	} // HtmlUtils.RemoveClass()
	
	static HideNode( elt ) {
		if (elt == undefined) { 
		    //trace2Main(">> " + _RED_ + elt_id + " NOT DEFINED");
		    return;
		}
		
		// elt.hidden = true;
		let elt_id = elt.id;
        $("#" + elt_id).hide();	
        	
        //$('#' + elt_id).prop("style", "display:none");		
	} // HtmlUtils.HideNode()
	
	static ShowNode( elt ) {
		if (elt == undefined) { 
		    return;
		}
		
		//elt.hidden = false; 
		let elt_id = elt.id;
		$("#" + elt_id).show();	
	} // HtmlUtils.ShowNode()
	
	static GetNode( elt_id ) {
		let elt = document.getElementById(elt_id);
		if (elt != undefined) { return elt; }
		return undefined;
	} // HtmlUtils.GetNode()
	
	static InitializeNode( elt, values, labels ) {
		if (elt != undefined) { 
		    //trace2Main("   elt.nodeName: " + elt.nodeName);
			if ( elt.nodeName == "SELECT" ) {	
				if (   Array.isArray(values) 
					&& Array.isArray(labels)
                    && values.length == labels.length	) {
						$("#" + elt_id).empty();
						for ( let i=0; i < values.length; i++ ) {
							//trace2Main("   values[" + i +"]: " + values[i]);							
							elt.add(new Option(values[i], values[i]));
						}
				}					
			}
		}
		// trace2Main( pretty_func_header_format( "<END> HtmlUtils.InitializeNode", " elt_id: " + elt_id ) );
	} // HtmlUtils.InitializeNode()
	
	static GetNodeValue( elt_id ) {  		
		if ( elt != undefined ) { 
			if ( elt.nodeName == "TD" || elt.nodeName == "SPAN" || elt.nodeName == "DIV" ) {
				return elt.textContent;
			}
			else {
				return elt.value;
			}	
		}
		return "Null_String";
	} // HtmlUtils.GetNodeValue()	

	static SetNodeValue( elt, value_str ) {
		if ( elt != undefined ) {
            //trace2Main(" elt.nodeName: " + elt.nodeName);			
			if (   elt.nodeName == "TD" 
			    || elt.nodeName == "SPAN" || elt.nodeName == "DIV" 
				|| elt.nodeName == "BUTTON" ) {
				elt.textContent = value_str;
			}
			else if (   elt.nodeName == "TEXTAREA" ) {
                // **PB** value change seems asynchronous 
                // https://stackoverflow.com/questions/47240315/how-to-update-input-from-a-programmatically-set-textarea 				
                // https://www.geeksforgeeks.org/jquery-set-the-value-of-an-input-text-field/
				// ** Fix **: set value via JQuery and NOT with 'elt.value = value_str'
				// => $('#' + elt_id).prop("value", value_str);
				let elt_id = elt.id;
				$('#' + elt_id).prop("value", value_str);
			}
			else {
				//trace2Main(" elt.value: '" + value_str + "'");
				elt.value = value_str;
			}	
		}
	} // HtmlUtils.SetNodeValue()
} // HtmlUtils class