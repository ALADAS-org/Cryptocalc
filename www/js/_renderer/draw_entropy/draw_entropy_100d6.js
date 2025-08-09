// =====================================================================================
// =============================   draw_entropy_100d6.js   =============================
// =====================================================================================
"use strict";

class DrawEntropy_100d6 {
	static #Key = Symbol();
	static #Singleton = new DrawEntropy_100d6( this.#Key );
	
	static CANVAS_WIDTH  = 200; 
	static CANVAS_HEIGHT = 100;
	
	static GetInstance() {
		if ( DrawEntropy_100d6.#Singleton == undefined ) {
			DrawEntropy_100d6.#Singleton = new DrawEntropy_100d6();
        }
        return DrawEntropy_100d6.#Singleton;
    } // DrawEntropy_100d6.GetInstance() 
	
    // ** Private constructor **
	constructor( key ) {
		if ( key !== DrawEntropy_100d6.#Key ) {
			throw new TypeError("'DrawEntropy_100d6' constructor is private");
		}
		
		this.canvas  = undefined;
		this.p5_obj  = new p5(this.pattern_generator_sketch, 'DrawEntropy_100d6');
	} // ** Private constructor **
	
	isHidden() {
		// console.log(">> [DrawEntropy_100d6] isHidden " + ENTROPY_SRC_100d6_CONTAINER_ID);
		let container_elt = document.getElementById(ENTROPY_SRC_100d6_CONTAINER_ID);
		// console.log(">> [DrawEntropy_100d6] container_elt " + container_elt);
		if (container_elt != undefined) {
			let visibility = window.getComputedStyle(container_elt).display;
			// console.log("> DrawEntropy_100d6.visibility: " + visibility);
			if ( visibility === "none" ) {
				return true;
		    }
		}

		return false;
	} // isHidden()
	
	pattern_generator_sketch( p ) { // p could be any variable name
			p.setup = async () => {
				console.log(">> DrawEntropy_100d6.Initialize [P5] pattern_generator_sketch.setup()");
				
				DrawEntropy_100d6.canvas = p.createCanvas
										  (DrawEntropy_100d6.CANVAS_WIDTH, DrawEntropy_100d6.CANVAS_HEIGHT);
				DrawEntropy_100d6.canvas.parent(ENTROPY_SRC_100d6_DIV_ID);
			}; // setup()
			
			p.getP5 = function() {
				return p;
			}; // getP5()
			
			p.getID = function() {
				return "DrawEntropy_100d6";
			}; // getID()
			
			// p.mousePressed = function() {
			// } // mousePressed()

			p.mouseMoved = function() {
				let mouse_X = Math.round(p.mouseX);
				let mouse_Y = Math.round(p.mouseY);
				if ( ! DrawEntropy_100d6.GetInstance().isHidden() ) { 
					console.log(">> [DrawEntropy_100d6] x: " + mouse_X + "   y:" + mouse_Y);
				}
			} // mouseMoved()
			
			p.draw = function() {
			};
		  
			// https://p5js.org/examples/advanced-data-load-saved-json.html
			// Put any asynchronous data loading in preload to complete before "setup" is run
			p.preload = () => {
			}; // preload()
	} // pattern_generator_sketch
} // DrawEntropy_100d6

DrawEntropy_100d6.GetInstance();	