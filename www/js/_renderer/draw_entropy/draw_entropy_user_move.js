// =====================================================================================
// ===========================   draw_entropy_user_move.js   ===========================
// =====================================================================================
"use strict";

class DrawEntropy_UserMove {
	static #Key = Symbol();
	static #Singleton = new DrawEntropy_UserMove( this.#Key );
	
	static CANVAS_WIDTH      = 500; 
	static CANVAS_HEIGHT     = 150;
	static BACKGROUND_COLOR  = 220;
	static ENTER_AREA_MARGIN = 30;
	
	static GetInstance() {
		if ( DrawEntropy_UserMove.#Singleton == undefined ) {
			DrawEntropy_UserMove.#Singleton = new DrawEntropy_UserMove();
        }
        return DrawEntropy_UserMove.#Singleton;
    } // DrawEntropy_UserMove.GetInstance() 
	
    // ** Private constructor **
	constructor( key ) {
		if ( key !== DrawEntropy_UserMove.#Key ) {
			throw new TypeError("'DrawEntropy_UserMove' constructor is private");
		}
		
		this.MIN_THRESHOLD      = 20;
		this.THRESHOLD_VARIANCE = 80;
		
		this.canvas = undefined;
		this.p5_obj = new p5(this.pattern_generator_sketch, 'DrawEntropy_UserMove');
		
		this.random_values = [];
		
		this.clear(32);
	} // ** Private constructor **
	
	clear(required_byte_count_arg) {
		console.log(">> [DrawEntropy_UserMove] clear");
		this.random_values = [];
		
		if (required_byte_count_arg == undefined) required_byte_count_arg = 32;
		this.required_byte_count = required_byte_count_arg;		
		
		this.previous_position = { x: -1, y: -1 };
		
		// this.p5_obj.background(220);
	} // clear()
	
	getValues() {
		console.log(">> [DrawEntropy_UserMove] getValues");
		return this.random_values;
	} // getValues()
	
	isHidden() {
		// console.log(">> [DrawEntropy_UserMove] isHidden " + ENTROPY_SRC_100d6_CONTAINER_ID);
		let container_elt = document.getElementById(ENTROPY_SRC_USER_MOVE_CONTAINER_ID);
		// console.log(">> [DrawEntropy_UserMove] container_elt " + container_elt);
		if ( container_elt != undefined ) {
			let visibility = window.getComputedStyle(container_elt).display;
			// console.log("> DrawEntropy_UserMove.visibility: " + visibility);
			if ( visibility === "none" ) {
				return true;
		    }
		}

		return false;
	} // isHidden()
	
	onMouseMoved(x_arg, y_arg) {
		// console.log(">> DrawEntropy_UserMove.onMouseMoved: " + x + "   y:" + y);
		
		const pack_twoNumbers_scaled = (a, b) => {
			// Scale from 0-999 to 0-15 (4 bits each)
			const scaledA = Math.round((a / 999) * 15);
			const scaledB = Math.round((b / 999) * 15);
			return (scaledA << 4) | scaledB;
		}; // pack_twoNumbers_scaled()
		
		if ( ! DrawEntropy_UserMove.GetInstance().isHidden() ) {
			let draw_margin = DrawEntropy_UserMove.ENTER_AREA_MARGIN / 2;
			if (    x_arg >= draw_margin && x_arg <= DrawEntropy_UserMove.CANVAS_WIDTH - draw_margin  
				 && y_arg >= draw_margin && y_arg <= DrawEntropy_UserMove.CANVAS_HEIGHT - draw_margin ) {
					 
				if ( this.previous_position.x == -1 && this.previous_position.y == -1 ) {
					let enter_area_margin = DrawEntropy_UserMove.ENTER_AREA_MARGIN;
					if (   x_arg >= enter_area_margin && x_arg <= DrawEntropy_UserMove.CANVAS_WIDTH - enter_area_margin 
						&& y_arg >= enter_area_margin && y_arg <= DrawEntropy_UserMove.CANVAS_HEIGHT - enter_area_margin ) {
						this.previous_position = { x: x_arg, y: y_arg };
						
						this.p5_obj.circle(x_arg, y_arg, 9);
					}					
					return;
				}
				
				// console.log(">> DrawEntropy_UserMove.onMouseMoved (" + this.random_values.length + ")  " 
				//            + "x: " + x_arg + "   y:" + y_arg);
					 
				let dX = Math.abs(x_arg - this.previous_position.x);	
				let dY = Math.abs(y_arg - this.previous_position.y);						
				let pythagoras_diagonal = Math.round(Math.sqrt(dX*dX + dY*dY));				
				
				let threshold = this.MIN_THRESHOLD + getRandomInt(this.THRESHOLD_VARIANCE);
		
				if ( pythagoras_diagonal >= threshold ) {
					console.log(  ">> DrawEntropy_UserMove.onMouseMoved: " 
					            + "(bytes: " + this.random_values.length + ")  pythagoras_diagonal: " + pythagoras_diagonal);					
					
					const random_byte = pack_twoNumbers_scaled(x_arg, y_arg);
					this.random_values.push(random_byte);
					
					this.p5_obj.line(x_arg, y_arg, this.previous_position.x, this.previous_position.y);
					
					if ( this.random_values.length == this.required_byte_count ) {
						console.log(">> DrawEntropy_UserMove.onMouseMoved Entropy\n:" + JSON.stringify(this.random_values));
						
						this.random_values = [];
						this.p5_obj.clear();	
						this.p5_obj.background(DrawEntropy_UserMove.BACKGROUND_COLOR);						
					}
					
					this.previous_position = { x: x_arg, y: y_arg };
					
					this.p5_obj.circle(x_arg, y_arg, 9);
				}
			}			
		}		
	} // onMouseMoved()
	
	pattern_generator_sketch( p ) { // p could be any variable name
			p.setup = async () => {
				console.log(">> DrawEntropy_UserMove.Initialize [P5] pattern_generator_sketch.setup()");
				
				DrawEntropy_UserMove.canvas = 
					p.createCanvas( DrawEntropy_UserMove.CANVAS_WIDTH, DrawEntropy_UserMove.CANVAS_HEIGHT );
				DrawEntropy_UserMove.canvas.parent(ENTROPY_SRC_USER_MOVE_DIV_ID);
				
				p.background(DrawEntropy_UserMove.BACKGROUND_COLOR);
			}; // setup()
			
			p.getP5 = function() {
				return p;
			}; // getP5()
			
			p.getID = function() {
				return "DrawEntropy_UserMove";
			}; // getID()
			
			// p.mousePressed = function() {
			// } // mousePressed()

			p.mouseMoved = function() {
				let mouse_X = Math.round(p.mouseX);
				let mouse_Y = Math.round(p.mouseY);				
				DrawEntropy_UserMove.GetInstance().onMouseMoved(mouse_X, mouse_Y);
			} // p.mouseMoved()
			
			p.draw = function() {				
			};
		  
			// https://p5js.org/examples/advanced-data-load-saved-json.html
			// Put any asynchronous data loading in preload to complete before "setup" is run
			p.preload = () => {
			}; // preload()
	} // pattern_generator_sketch
} // DrawEntropy_UserMove

DrawEntropy_UserMove.GetInstance();	