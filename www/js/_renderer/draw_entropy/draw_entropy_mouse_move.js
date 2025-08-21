// ======================================================================================
// ===========================   draw_entropy_mouse_move.js   ===========================
// ======================================================================================
"use strict";

const DrawE_Mouse = {
	CANVAS_WIDTH:  500, 
	CANVAS_HEIGHT: 150,
	
	DOT_SIZE:        9,
	
	BG_COLOR:      220,
	
	DRAW_AREA_MARGIN:   10,
	MIN_BOTTOM_MARGIN:  10,
	MAX_BOTTOM_MARGIN:  25,
	MARGINS:            { "left": 10, "right": 10, "top": 10, "bottom": 25 },
	
	MIN_THRESHOLD:      20,
	THRESHOLD_VARIANCE: 60,
	
	STATE_INIT:  "STATE_INIT",
	STATE_INPUT: "STATE_INPUT",
	STATE_END:   "STATE_END"
}; // DrawE_Mouse

const draw_progress_bar = ( p, current_point_count, max_points ) => {			
	let pbar_x      = 5;
	let pbar_y      = DrawE_Mouse.CANVAS_HEIGHT - DrawE_Mouse.MAX_BOTTOM_MARGIN + 10;
	let pbar_width  = DrawE_Mouse.CANVAS_WIDTH - 10;
	let pbar_height = 10;

	let WHITE_COLOR = p.color(255, 255, 255);	
	
	p.fill( WHITE_COLOR );			
	p.rect( pbar_x, pbar_y, pbar_width, pbar_height );
	
	let GREEN_COLOR = p.color(0, 255, 0);
	let bar_x      = 7;
	let bar_y      = DrawE_Mouse.CANVAS_HEIGHT - DrawE_Mouse.MAX_BOTTOM_MARGIN + 12;
	let bar_width  = pbar_width * (current_point_count / max_points) - 4;
	let bar_height = 6;
	p.fill( GREEN_COLOR );			
	p.rect( bar_x, bar_y, bar_width, bar_height );
}; // draw_progress_bar()

const pointTo2DigitHex = (point, max_X, max_Y) => {
   // Combine normalized coordinates into a single value (0-255)
	const normalized_X = ( point.x / max_X ) * 15; // 0-15 (4 bits)
	const normalized_Y = ( point.y / max_Y ) * 15; // 0-15 (4 bits)
	
	// Pack into single byte: upper 4 bits = X, lower 4 bits = Y
	const packed_value = (Math.round(normalized_X) << 4) | Math.round(normalized_Y);
	
	// Convert to 2-digit hex
	return packed_value.toString(16).padStart(2, '0');
} // pointTo2DigitHex()

const generate_random_point = () => {
	let margin_X = DrawE_Mouse.MARGINS["left"] + DrawE_Mouse.MARGINS["right"];	
	let margin_Y = DrawE_Mouse.MARGINS["top"]  + DrawE_Mouse.MARGINS["bottom"];	
	let rand_point = { x: 0, y: 0 };
	rand_point.x = getRandomInt( DrawE_Mouse.CANVAS_WIDTH  - margin_X ) + DrawE_Mouse.MARGINS["left"];
	rand_point.y = getRandomInt( DrawE_Mouse.CANVAS_HEIGHT - margin_Y ) + DrawE_Mouse.MARGINS["top"];
	return rand_point;
}; // generate_random_point()

class DrawEntropyMouseMove {
	static #Key = Symbol();
	static #Singleton = new DrawEntropyMouseMove( this.#Key );
	static New_btn_cb_initialized = false;
	
	static GetInstance() {
		if ( DrawEntropyMouseMove.#Singleton == undefined ) {
			DrawEntropyMouseMove.#Singleton = new DrawEntropyMouseMove(DrawEntropyMouseMove.#Key);
		}
		
		if ( ! DrawEntropyMouseMove.New_btn_cb_initialized ) {
			let DrawE_Mouse_obj = DrawEntropyMouseMove.#Singleton; 
			DrawE_Mouse_obj.setEventHandler( ENTROPY_SRC_MOUSE_MOVE_NEW_BTN_ID, 'click',
				(evt) => { DrawE_Mouse_obj.onNewEntropy(); } );
			DrawEntropyMouseMove.New_btn_cb_initialized = true;
		}
		
		return DrawEntropyMouseMove.#Singleton;
	} // DrawEntropyMouseMove.GetInstance() 
	
	// ** Private constructor **
	constructor( key ) {
		if ( key !== DrawEntropyMouseMove.#Key ) {
			throw new TypeError("'DrawEntropyMouseMove' constructor is private");
		}
		
		this.state = DrawE_Mouse.STATE_INIT;		
		
		this.canvas = undefined;
		this.p5_obj = new p5(this.pattern_generator_sketch, 'DrawEntropyMouseMove');
		
		this.points       = [];
		this.random_bytes = [];
		this.threshold = DrawE_Mouse.MIN_THRESHOLD + getRandomInt(DrawE_Mouse.THRESHOLD_VARIANCE);
		
		this.entropy = "";
		
		this.WHITE_COLOR  = this.p5_obj.color(255, 255, 255);
		this.RED_COLOR    = this.p5_obj.color(255, 0, 0);
		this.YELLOW_COLOR = this.p5_obj.color(255, 255, 0);
		
		this.init(32);
	} // ** Private constructor **
	
	init( required_byte_count_arg ) {
		// console.log(">> [DrawE_Mouse] init");
		this.points       = [];
		this.random_bytes = [];
		this.entropy      = "";
		
		DrawE_Mouse.MARGINS["bottom"] = DrawE_Mouse.MAX_BOTTOM_MARGIN;	
		
		if (required_byte_count_arg == undefined) required_byte_count_arg = 32;
		this.required_byte_count = required_byte_count_arg;		
		
		// this.previous_position = { x: -1, y: -1 };
		this.previous_position = generate_random_point();
		
		this.state = DrawE_Mouse.STATE_INIT;
		
		// this.p5_obj.background(DrawE_Mouse.BACKGROUND_COLOR);
	} // init()
	
	async generateEntropy( required_byte_count ) {
		if (required_byte_count == undefined) required_byte_count = 32;
		this.required_byte_count = required_byte_count;
		
		// console.log(">> [DrawE_Mouse] generateEntropy required_byte_count: " + required_byte_count);
		this.init( required_byte_count );
		
		DrawE_Mouse.MARGINS["bottom"] = DrawE_Mouse.MIN_BOTTOM_MARGIN;
		
		let margins = DrawE_Mouse.MARGINS;
		
		let margin_X = margins["left"] +  margins["right"]; 
				
		this.p5_obj.background( DrawE_Mouse.BG_COLOR );
		this.previous_position = generate_random_point();		
		 
		this.p5_obj.fill( this.YELLOW_COLOR );
		this.p5_obj.circle( this.previous_position.x, this.previous_position.y, DrawE_Mouse.DOT_SIZE );		
			
		for ( let i=0; i < this.required_byte_count; i++ ) {		
			// console.log("> generateEntropy(" + i + ")" );
			
			let threshold = DrawE_Mouse.MIN_THRESHOLD + getRandomInt(DrawE_Mouse.THRESHOLD_VARIANCE);
			let hypotenuse = 0;
			
			// console.log("> generateEntropy(" + i + ") threshold: " + threshold);
			
			let rand_x = 0; 
			let rand_y = 0;

			let delta      = { x: 0, y: 0 };	
			let rand_point = { x: 0, y: 0 };			
			
			while ( hypotenuse < threshold ) {
				// console.log("> generateEntropy(" + i + ") : hypotenuse: " + hypotenuse);
				
				rand_point = generate_random_point(); 
				
				delta.x = Math.abs(rand_point.x - this.previous_position.x);	
				delta.y = Math.abs(rand_point.y - this.previous_position.y);						
				hypotenuse = Math.round(Math.sqrt(delta.x*delta.x + delta.y*delta.y));	
			}
			
			// const random_byte = pointTo2DigitHex
			//                     (ranged_point, DrawE_Mouse.CANVAS_WIDTH - 2*margin, DrawE_Mouse.CANVAS_HEIGHT- 2*margin); 
			// this.random_bytes.push(random_byte);
			
			this.addPoint( rand_point );
				
			this.p5_obj.line( rand_point.x, rand_point.y, this.previous_position.x, this.previous_position.y );				
			
			this.p5_obj.fill( this.YELLOW_COLOR );
			this.p5_obj.circle( rand_point.x, rand_point.y, DrawE_Mouse.DOT_SIZE );
			
			this.previous_position = { x: rand_point.x, y: rand_point.y };			
		}		
		
		let entropy = this.random_bytes.join('').toString(); 
		// console.log("> DrawE_Mouse.generateEntropy:\n   " + entropy);
		return entropy;
	} // generateEntropy()
	
	onNewEntropy() {
		console.log(">> DrawE_Mouse.onNewEntropy");
		this.init( this.required_byte_count )
		
		this.p5_obj.background( DrawE_Mouse.BG_COLOR );
		this.previous_position = generate_random_point();
		
		let margin = DrawE_Mouse.DRAW_AREA_MARGIN;
		
		DrawE_Mouse.MARGINS["bottom"] = 25;
		
		let margins = DrawE_Mouse.MARGINS;
		let margin_X = margins["left"] + margins["right"];
		let margin_Y = margins["top"]  + margins["bottom"];
		let ranged_point = { x: this.previous_position.x, y: this.previous_position.y };
		const random_byte = pointTo2DigitHex
							( ranged_point, DrawE_Mouse.CANVAS_WIDTH - margin_X, DrawE_Mouse.CANVAS_HEIGHT - margin_Y ); 
								
		// const random_byte = pack_2Numbers_scaled_to_byte( this.previous_position.x, this.previous_position.y );
		// this.random_bytes.push(random_byte);
		
		this.addPoint( this.previous_position );		
		  
		this.p5_obj.fill( this.WHITE_COLOR );
		this.p5_obj.circle(this.previous_position.x, this.previous_position.y, 9);

		draw_progress_bar( this.p5_obj, 1, this.required_byte_count);	
		
		this.state = DrawE_Mouse.STATE_INPUT;
	} // onNewEntropy()
	
	addPoint( new_point ) {
		this.points.push( new_point );

		let margins = DrawE_Mouse.MARGINS;
		let margins_HORIZONTAL = margins["left"] + margins["right"];
		let margins_VERTICAL   = margins["top"]  + margins["bottom"];
		
		let origin_point = { x: new_point.x - margins["left"], y: new_point.y - margins["top"] };
		
		const new_byte = pointTo2DigitHex( origin_point, DrawE_Mouse.CANVAS_WIDTH - margins_HORIZONTAL, 
						                                 DrawE_Mouse.CANVAS_HEIGHT- margins_VERTICAL ); 
		this.random_bytes.push( new_byte );
	} // addPoint()
	
	getState() {
		return this.state;
	} // getState()
	
	getBytes() {
		console.log(">> [DrawE_Mouse] getBytes");
		return this.random_bytes;
	} // getBytes()
	
	getEntropy() {
		if ( this.entropy == '' ) return '';
		
		console.log(">> [DrawE_Mouse] getEntropy:\n  " + this.entropy);
		return this.entropy;
	} // getEntropy()
	
	isHidden() {
		// console.log(">> [DrawE_Mouse] isHidden " + ENTROPY_SRC_MOUSE_MOVE_CONTAINER_ID);
		let container_elt = document.getElementById(ENTROPY_SRC_MOUSE_MOVE_CONTAINER_ID);
		// console.log(">> [DrawE_Mouse] container_elt " + container_elt);
		if ( container_elt != undefined ) {
			let visibility = window.getComputedStyle(container_elt).display;
			// console.log("> DrawE_Mouse.visibility: " + visibility);
			if ( visibility === "none" ) {
				return true;
			}
		}

		return false;
	} // isHidden()
	
	onMouseMoved( x_arg, y_arg ) {		
		if ( DrawEntropyMouseMove.GetInstance().isHidden() ) {
			// console.log(">> return because HIDDEN: ");
			return;
		}
		
		if ( this.state != DrawE_Mouse.STATE_INPUT ) {
			// console.log(">> return because state is not STATE_INPUT");
			return;
		}	
		
		let mouse_point = { x: x_arg, y: y_arg };
		
		// console.log(">> DrawE_Mouse.onMouseMoved  state: " + this.state);
		
		// let margin = DrawE_Mouse.DRAW_AREA_MARGIN;
		let margins = DrawE_Mouse.MARGINS;
		
		draw_progress_bar( this.p5_obj, this.random_bytes.length, this.required_byte_count);	
		
		if (    mouse_point.x >= margins["left"] && mouse_point.x <= DrawE_Mouse.CANVAS_WIDTH - margins["right"]  
			 && mouse_point.y >= margins["top"] && mouse_point.y <= DrawE_Mouse.CANVAS_HEIGHT - margins["bottom"] ) {
				 
			// console.log(">> DrawE_Mouse.onMouseMoved (" + this.random_values.length + ")  " 
			//            + "x: " + x_arg + "   y:" + y_arg);
				 
			let dX = Math.abs(mouse_point.x - this.previous_position.x);	
			let dY = Math.abs(mouse_point.y - this.previous_position.y);						
			let hypotenuse = Math.round(Math.sqrt(dX*dX + dY*dY));				
			
			if ( hypotenuse >= this.threshold ) {
				// console.log(  ">> DrawE_Mouse.onMouseMoved: " 
				//  			+ "(bytes: " + this.random_bytes.length + ")  hypotenuse: " + hypotenuse);	
				// console.log(  ">> DrawE_Mouse.onMouseMoved max: " + this.required_byte_count);								
				
				// const random_byte = pointTo2DigitHex
				//                     (mouse_point, DrawE_Mouse.CANVAS_WIDTH - 2*margin, DrawE_Mouse.CANVAS_HEIGHT- 2*margin); 
				// this.random_bytes.push(random_byte);
				
				this.addPoint( mouse_point );
				
				this.threshold = DrawE_Mouse.MIN_THRESHOLD + getRandomInt(DrawE_Mouse.THRESHOLD_VARIANCE);
				
				this.p5_obj.line( x_arg, y_arg, this.previous_position.x, this.previous_position.y );
				
				this.previous_position = { x: x_arg, y: y_arg };				
		
				this.p5_obj.fill( this.WHITE_COLOR );
				this.p5_obj.circle( x_arg, y_arg, DrawE_Mouse.DOT_SIZE );
				
				draw_progress_bar( this.p5_obj );
				
				if ( this.random_bytes.length >= this.required_byte_count ) {
					this.entropy = this.random_bytes.join('').toString(); 
					console.log(">> DrawE_Mouse.onMouseMoved Entropy\n: " + this.entropy);
					
					for (let i=0; i < this.points.length; i++) {
						let current_point = this.points[i];					
		  
						this.p5_obj.fill( this.YELLOW_COLOR );
						this.p5_obj.circle( current_point.x, current_point.y, DrawE_Mouse.DOT_SIZE -2 );						
					}	

					draw_progress_bar( this.p5_obj, this.required_byte_count, this.required_byte_count ); 					
					
					this.p5_obj.fill( this.WHITE_COLOR );
					this.state = DrawE_Mouse.STATE_END;
					
					const new_event_obj = new CustomEvent( CUSTOM_EVT_UPDATE_ENTROPY, 
														   { detail: { 'entropy': this.entropy } } );

					document.body.dispatchEvent( new_event_obj );					
				}
			}
		}			
	} // onMouseMoved()
	
	pattern_generator_sketch( p ) { // p could be any variable name
			p.setup = async () => {
				// console.log(">> DrawE_Mouse.Initialize [P5] pattern_generator_sketch.setup()");
				
				DrawEntropyMouseMove.canvas = 
					p.createCanvas( DrawE_Mouse.CANVAS_WIDTH, DrawE_Mouse.CANVAS_HEIGHT );
				DrawEntropyMouseMove.canvas.parent(ENTROPY_SRC_MOUSE_MOVE_DIV_ID);
				
				p.background(DrawE_Mouse.BG_COLOR);
			}; // setup()
			
			p.getP5 = function() {
				return p;
			}; // getP5()
			
			p.getID = function() {
				return "DrawEntropyMouseMove";				
			}; // getID()
			
			// p.mousePressed = function() {
			// } // mousePressed()

			p.mouseMoved = () => {
				let mouse_X = Math.round(p.mouseX);
				let mouse_Y = Math.round(p.mouseY);				
				DrawEntropyMouseMove.GetInstance().onMouseMoved( mouse_X, mouse_Y );
			} // p.mouseMoved()
			
			p.draw = function() {	
			};
		  
			// https://p5js.org/examples/advanced-data-load-saved-json.html
			// Put any asynchronous data loading in preload to complete before "setup" is run
			p.preload = () => {
			}; // preload()
	} // pattern_generator_sketch
	
	setEventHandler( elt_id, event_name, handler_function ) {
		// console.log(">> DrawE_Mouse.setEventHandler elt_id: " + elt_id);
		let elt = document.getElementById( elt_id );
		// console.log(">> DrawE_Mouse.setEventHandler elt: " + elt);
		if ( elt != undefined ) { 
			elt.addEventListener(event_name, handler_function );
		}
	} // setEventHandler()	
} // DrawEntropyMouseMove

// DrawEntropyMouseMove.GetInstance();	