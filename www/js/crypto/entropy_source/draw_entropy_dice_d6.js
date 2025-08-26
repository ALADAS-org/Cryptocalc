// =====================================================================================
// ============================   draw_entropy_dice_d6.js   ============================
// =====================================================================================
"use strict";

class DrawEntropyDiceD6 {
	static #Key = Symbol();
	static #Singleton = new DrawEntropyDiceD6( this.#Key );
	
	static CANVAS_WIDTH     = 586; 
	static CANVAS_HEIGHT    = 150;
	static BACKGROUND_COLOR = 220;
	
	static DEFAULT_ENTROPY  = "0xff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00";
	
	static GetInstance() {
		if ( DrawEntropyDiceD6.#Singleton == undefined ) {
			DrawEntropyDiceD6.#Singleton = new DrawEntropyDiceD6();
        }
        return DrawEntropyDiceD6.#Singleton;
    } // DrawEntropyDiceD6.GetInstance() 
	
    // ** Private constructor **
	constructor( key ) {
		if ( key !== DrawEntropyDiceD6.#Key ) {
			throw new TypeError("'DrawEntropyDiceD6' constructor is private");
		}
		
		this.entropy = DrawEntropyDiceD6.DEFAULT_ENTROPY;
		this.random_values = [];
		this.required_byte_count = 32;
		
		this.canvas = undefined;
		
		this.p5_obj = new p5(this.pattern_generator_sketch, 'DrawEntropyDiceD6');
		
		this.clear(32);
	} // ** Private constructor **
	
	clear() {
		// console.log(">> [DrawEntropyDiceD6] clear");
	} // clear()
	
	generateEntropy( required_entropy_bits ) {
		// console.log(">> [DrawEntropyDiceD6] generateEntropy");
		this.p5_obj.clear();
		
		if ( required_entropy_bits == undefined ) required_entropy_bits = 256;
		
		this.entropy = DrawEntropyDiceD6.DEFAULT_ENTROPY;		
		
		// required_dice_count = 100;
		let rolls_needed = this.calculateDiceRollsForEntropy( required_entropy_bits ) 
		// console.log(">> [DrawEntropyDiceD6] rolls(" + required_entropy_bits + "bits): " + rolls_needed );
		
		// required_dice_count = 6;
		let dice_rolls = [];
		
		for ( let i=0; i < rolls_needed; i++ ) {
			// console.log("> DrawEntropyDiceD6.generateEntropy dice(" + i + ")");
			let dice_value = getRandomInt(5) + 1;
			this.drawDice( i, dice_value );
			dice_rolls.push(dice_value);
		}
		
		this.entropy = this.diceRollsToHex(dice_rolls).replace('0x','');
		console.log("> DrawEntropyDiceD6.generateEntropy entropy(" + this.entropy.length/2 + " bytes): " + this.entropy);
		
		// this.test_rolls_to_entropy();
		
		return this.entropy;			
	} // generateEntropy()
	
	/**
	 * Convert D6 dice rolls to hexadecimal string
	 * @param {number[]} rolls - Array of dice rolls (values 1-6)
	 * @returns {string} Hexadecimal representation
	 */
	diceRollsToHex(rolls) {
		// Convert each roll to base6 (0-5) by subtracting 1
		const base6Values = rolls.map(roll => roll - 1);
		
		// Convert base6 array to a big integer
		let bigIntValue = 0n;
		for (const digit of base6Values) {
			bigIntValue = bigIntValue * 6n + BigInt(digit);
		}
		
		// Convert the big integer to hexadecimal
		let hex_value = bigIntValue.toString(16);
		// console.log("> " + hex_value);  
		if (hex_value.length % 2 == 1) {
			hex_value = hex_value.slice(0,-1);  
		}
		//console.log(  "> DrawEntropyDiceD6.generateEntropy diceRollsToHex(rolls: " + rolls.length + ")"
 		//            + " length=" + hex_value.length + " bytes=" + hex_value.length/2 + " \n " + hex_value );
		return hex_value;
	} // diceRollsToHex() 
	
	/** NB: Generated with the help of 'Deep Seek'
	 * Calculate the number of D6 dice rolls needed for specific entropy sizes
	 * @param {number} entropyBits - Desired entropy in bits
	 * @returns {Object} - Object containing number of rolls and actual entropy
	 */
	calculateDiceRollsForEntropy( entropy_bits ) {
		// Entropy per D6 roll is log2(6) ≈ 2.585 bits
		const entropy_per_roll = Math.log2(6);
		const rolls_needed     = Math.ceil(entropy_bits / entropy_per_roll);
		const actual_entropy   = rolls_needed * entropy_per_roll;		
		return Math.floor(rolls_needed);
	} // calculateDiceRollsForEntropy()
	
	drawDice(index, value) {
		// console.log(">> [DrawEntropyDiceD6] drawDice index(" + index + ")  value(1..6): "  + value);
		let ROW_SIZE  = 20;
		let DICE_SIZE = 23;
		let SPACE     = 6;
		
		let x = SPACE + (index % ROW_SIZE) * (DICE_SIZE + SPACE); 
		// console.log(">> [DrawEntropyDiceD6] drawDice modulo:" +  (index % ROW_SIZE) + "  x(" + index + ") = " + x);
		
		let y = SPACE + Math.floor(index/ROW_SIZE) * (DICE_SIZE + SPACE);
		
		this.p5_obj.fill(0, 0, 0); // White fill color
		// this.p5_obj.rect(x, y, DICE_SIZE, DICE_SIZE);
		this.p5_obj.rect(x, y, DICE_SIZE, DICE_SIZE, DICE_SIZE*0.1); // x, y, width, height, radius
		
		this.drawDots(value, x, y);
	} // drawDice()
	
	drawDots(dice_value, x_arg, y_arg) {
		// console.log(">> [DrawEntropyDiceD6] drawDotS dice_value: "  + dice_value);
		let DOT_SIZE = 5;
		
		// Check each bit position (we'll use bits 6-0, ignoring the highest bit)
		let DICE_SIZE = 23;	
		const center_x = DICE_SIZE / 2 + x_arg;	
		const center_y = DICE_SIZE / 2 + y_arg;		
		const offset = DICE_SIZE * 0.25; // Distance from center for dots
		
		const draw_dot = (x, y, radius) => {
			this.p5_obj.fill(255, 255, 255);     // Red fill color
			this.p5_obj.circle(x, y, DOT_SIZE);
			// this.p5_obj.fill(255, 255, 255); // White fill color
		}; // draw_dot() 
		
		switch (dice_value) {
			case 1:
				draw_dot(center_x, center_y);
				break;
				
			case 2:
				draw_dot(center_x - offset, center_y - offset);
				draw_dot(center_x + offset, center_y + offset);
				break;
				
			case 3:
				draw_dot(center_x - offset, center_y - offset);
				draw_dot(center_x, center_y);
				draw_dot(center_x + offset, center_y + offset);
				break;
				
			case 4:
				draw_dot(center_x - offset, center_y - offset);
				draw_dot(center_x + offset, center_y - offset);
				draw_dot(center_x - offset, center_y + offset);
				draw_dot(center_x + offset, center_y + offset);
				break;
				
			case 5:
				draw_dot(center_x - offset, center_y - offset);
				draw_dot(center_x + offset, center_y - offset);
				draw_dot(center_x, center_y);
				draw_dot(center_x - offset, center_y + offset);
				draw_dot(center_x + offset, center_y + offset);
				break;
				
			case 6:
				draw_dot(center_x - offset, center_y - offset);
				draw_dot(center_x + offset, center_y - offset);
				draw_dot(center_x - offset, center_y);
				draw_dot(center_x + offset, center_y);
				draw_dot(center_x - offset, center_y + offset);
				draw_dot(center_x + offset, center_y + offset);
				break;
				
			default: // Default to 1
				draw_dot(center_x, center_y);
		}
	} // drawDots()
	
	isHidden() {
		// console.log(">> [DrawEntropyDiceD6] isHidden " + ENTROPY_SRC_DICE_D6_CONTAINER_ID);
		let container_elt = document.getElementById(ENTROPY_SRC_DICE_D6_CONTAINER_ID);
		// console.log(">> [DrawEntropyDiceD6] container_elt " + container_elt);
		
		if ( container_elt != undefined ) {
			let visibility = window.getComputedStyle(container_elt).display;
			console.log("> DrawEntropyDiceD6.visibility: " + visibility);
			if ( visibility === "none" ) {
				return true;
		    }
		}

		return false;
	} // isHidden()
	
	test_rolls_to_entropy() {
		console.log(">> ------- test_rolls_to_entropy -------");
		
		//# |  ENT  | CS | ENT+CS |  MS  |
		//# +-------+----+--------+------+
		//# |  128  |  4 |   132  |  12  |
		//# |  160  |  5 |   165  |  15  |
		//# |  192  |  6 |   198  |  18  |
		//# |  224  |  7 |   231  |  21  |
		//# |  256  |  8 |   264  |  24  |
		let required_rolls = 100;
		
		let entropy_sizes = [128, 160, 192, 224, 256];

		for (let i=0; i < entropy_sizes.length; i++) {
			// console.log(">> ------------------------------------------");
			let entropy_size = entropy_sizes[i];	
			required_rolls = this.calculateDiceRollsForEntropy(entropy_size);
			console.log(">> entropy_size: " + entropy_size + "  required_rolls: " + required_rolls);
			let rolls = [];
			for (let j=0; j < required_rolls; j++) {
				let roll_value = getRandomInt(5) + 1;
				rolls.push(roll_value);
			}
			
			let entropy = this.diceRollsToHex(rolls).replace('0x','');
			console.log(  "> test_rolls_to_entropy entropy(" + entropy.length/2 
						+ " bytes  length=" + entropy.length + "): \n" + entropy);
		}
	} // test_rolls_to_entropy()
	
	pattern_generator_sketch( p ) { // p could be any variable name
			p.setup = async () => {
				// console.log(">> DrawEntropyDiceD6 [P5] pattern_generator_sketch.setup()");				
				// console.log(">> DrawEntropyDiceD6.CANVAS_WIDTH " + DrawEntropyDiceD6.CANVAS_WIDTH);
				
				DrawEntropyDiceD6.canvas = p.createCanvas
										   ( DrawEntropyDiceD6.CANVAS_WIDTH, DrawEntropyDiceD6.CANVAS_HEIGHT );
				DrawEntropyDiceD6.canvas.parent(ENTROPY_SRC_DICE_D6_DIV_ID);
				
				let bg_color = p.color(255, 255, 240);
				p.background(bg_color);
			}; // setup()
			
			p.getP5 = function() {
				return p;
			}; // getP5()
			
			p.getID = function() {
				return "DrawEntropyDiceD6";
			}; // getID()
			
			p.draw = function() {
			};
		  
			p.preload = () => {
			}; // preload()
	} // pattern_generator_sketch
} // DrawEntropyDiceD6

// DrawEntropyDiceD6.GetInstance();	