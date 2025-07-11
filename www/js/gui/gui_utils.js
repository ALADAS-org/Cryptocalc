// ====================================================================================
// =================================   gui_utils.js   =================================
// ====================================================================================
"use strict";

// https://izitoast.marcelodolza.com/    
class GuiUtils {
	static ShowInfoDialog( msg ) {
		iziToast.destroy();
		
		let options = {
			iconUrl:         './icons/cryptowallet_Icon.png',
			position:        'center',
			backgroundColor: 'lightblue',
			message:         msg,
			maxWidth:        450, layout: 2,
			timeout:         false, progressBar: false
		};
		
		iziToast.info( options );
	} // GuiUtils.ShowInfoDialog()
	
	static ShowQuestionDialog( msg, args ) {
		iziToast.destroy();
		
		let bg_color = 'lightblue';
		
		let close_button_label   = "OK";
		let feature_handler      = undefined;
		let feature_button_label = undefined;
		
		if ( args != undefined ) {
			let close_button_label_value = args["CloseButtonLabel"];
			if ( close_button_label_value != undefined ) {
				close_button_label = close_button_label_value;
			}
			
			if ( args["BackgroundColor"] != undefined ) {
				bg_color = args["BackgroundColor"];
			}
		}
		
		let buttons_value = [
			[ '<button>' + close_button_label + '</button>', 
			  async (instance, toast) => {
				instance.hide( { transitionOut: 'fadeOutUp'	}, toast, close_button_label);
			  }
			]
		];
		
		if ( args != undefined ) {
			feature_button_label = args["FeatureButtonlabel"];
			feature_handler      = args["feature handler"];
			if ( feature_button_label != undefined && feature_handler != undefined ) {
				let feature_button_value = 
					[ '<button>' + feature_button_label + '</button>', 
				      async (instance, toast) => {
						feature_handler();
						instance.hide( { transitionOut: 'fadeOutUp'	}, toast, feature_button_label);
				      }
				    ];
				buttons_value.unshift( feature_button_value );
			}
		}
		
		let options = {
			iconUrl:         './icons/cryptowallet_Icon.png',
			timeout: false, progressBar: false, overlay: true, close: false,
			backgroundColor: bg_color,
			displayMode:     'once',
			id:              'question',
			zindex:          999,
			message:         msg,
			position:        'center',
			buttons:         buttons_value
		};
		
		iziToast.question( options );
	} // GuiUtils.ShowQuestionDialog()
} // GuiUtils class