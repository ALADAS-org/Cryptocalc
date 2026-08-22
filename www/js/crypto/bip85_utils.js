//==============================================================================================
//======================================  bip85_utils.js  ======================================
//==============================================================================================
// BIP85 - Deterministic Entropy From BIP32 Keychains
// https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki
// Extrait fidele de la partie BIP85 de https://iancoleman.io/bip39/
//
// Compatible bip32 v2.x (API directe) ET bip32 >=3 (API factory : BIP32Factory(ecc)).
// Compatible wif v2.x (encode positionnel) ET wif v5 (encode par objet).
// Injection possible via Bip85Utils.getInstance().configure({ bip32, ecc, bip39, wif }).
"use strict";

const createHmac = require('create-hmac');

const BIP85_KEY             = "bip-entropy-from-k";
const BIP85_DERIVATION_PATH = 83696968;
const BIP85_APPLICATIONS    = { BIP39: 39, WIF: 2, XPRV: 32, HEX: 128169 };

//----------------------------------------------------------------------------------------------
// BIP85Child : resultat d'une derivation (entropy hex + type d'application)
//----------------------------------------------------------------------------------------------
class BIP85Child {
	constructor( entropy, type ) {
		this.entropy = entropy; // hex string
		this.type    = type;
	} // constructor()

	toEntropy() {
		// Pour XPRV, l'entropie utile est la 2eme moitie (private key)
		return ( this.type === BIP85_APPLICATIONS.XPRV )
		     ? this.entropy.slice( 64, 128 )
		     : this.entropy;
	} // toEntropy()

	toMnemonic() {
		if ( this.type !== BIP85_APPLICATIONS.BIP39 ) {
			throw new Error( "BIP85Child type is not BIP39" );
		}
		return Bip85Utils.getInstance().bip39.entropyToMnemonic( this.entropy );
	} // toMnemonic()

	toWIF() {
		if ( this.type !== BIP85_APPLICATIONS.WIF ) {
			throw new Error( "BIP85Child type is not WIF" );
		}
		const buf = Buffer.from( this.entropy, 'hex' );
		return Bip85Utils.getInstance().wifEncode( 128, buf, true ); // 0x80 = mainnet, compressed
	} // toWIF()

	toXPRV() {
		if ( this.type !== BIP85_APPLICATIONS.XPRV ) {
			throw new Error( "BIP85Child type is not XPRV" );
		}
		const chainCode  = Buffer.from( this.entropy.slice(  0,  64 ), 'hex' );
		const privateKey = Buffer.from( this.entropy.slice( 64, 128 ), 'hex' );
		return Bip85Utils.getInstance().getBip32().fromPrivateKey( privateKey, chainCode ).toBase58();
	} // toXPRV()
} // class BIP85Child

//----------------------------------------------------------------------------------------------
// BIP85 : encapsule un noeud bip32 "master" et expose les derivations
//----------------------------------------------------------------------------------------------
class BIP85 {
	constructor( node ) {
		this.node = node;
	} // constructor()

	deriveBIP39( language, words, index = 0 ) {
		if ( ! Bip85Utils.getInstance().isValidIndex( index ) ) {
			throw new Error( "BIP39 invalid index" );
		}
		if ( typeof language !== 'number' ) {
			throw new Error( "BIP39 invalid language type" );
		}
		if ( ! ( language >= 0 && language <= 8 ) ) {
			throw new Error( "BIP39 invalid language" );
		}

		let entropyLength;
		switch ( words ) {
			case 12: entropyLength = 16; break;
			case 18: entropyLength = 24; break;
			case 24: entropyLength = 32; break;
			default: throw new Error( "BIP39 invalid mnemonic length" );
		}

		const path    = `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.BIP39}'/${language}'/${words}'/${index}'`;
		const entropy = this.derive( path, entropyLength );
		return new BIP85Child( entropy, BIP85_APPLICATIONS.BIP39 );
	} // deriveBIP39()

	deriveWIF( index = 0 ) {
		if ( ! Bip85Utils.getInstance().isValidIndex( index ) ) {
			throw new Error( "WIF invalid index" );
		}
		const path    = `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.WIF}'/${index}'`;
		const entropy = this.derive( path, 32 );
		return new BIP85Child( entropy, BIP85_APPLICATIONS.WIF );
	} // deriveWIF()

	deriveXPRV( index = 0 ) {
		if ( ! Bip85Utils.getInstance().isValidIndex( index ) ) {
			throw new Error( "XPRV invalid index" );
		}
		const path    = `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.XPRV}'/${index}'`;
		const entropy = this.derive( path, 64 );
		return new BIP85Child( entropy, BIP85_APPLICATIONS.XPRV );
	} // deriveXPRV()

	deriveHex( numBytes, index = 0 ) {
		if ( ! Bip85Utils.getInstance().isValidIndex( index ) ) {
			throw new Error( "HEX invalid index" );
		}
		if ( typeof numBytes !== 'number' ) {
			throw new Error( "HEX invalid byte length type" );
		}
		if ( numBytes < 16 || numBytes > 64 ) {
			throw new Error( "HEX invalid byte length" );
		}
		const path    = `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.HEX}'/${numBytes}'/${index}'`;
		const entropy = this.derive( path, numBytes );
		return new BIP85Child( entropy, BIP85_APPLICATIONS.HEX );
	} // deriveHex()

	// Coeur BIP85 : HMAC-SHA512( key="bip-entropy-from-k", msg=childPrivateKey ) tronque
	derive( path, bytesLength = 64 ) {
		const childPrivateKey = this.node.derivePath( path ).privateKey;
		return Bip85Utils.getInstance()
		                 .hmacSHA512( Buffer.from( BIP85_KEY ), childPrivateKey )
		                 .slice( 0, bytesLength )
		                 .toString( 'hex' );
	} // derive()
} // class BIP85

//==============================================================================================
// Bip85Utils : SINGLETON (facade + helpers + resolution des dependances)
//==============================================================================================
class Bip85Utils {
	constructor() {
		if ( Bip85Utils._instance ) {
			return Bip85Utils._instance;
		}
		this.BIP85_KEY             = BIP85_KEY;
		this.BIP85_DERIVATION_PATH = BIP85_DERIVATION_PATH;
		this.BIP85_APPLICATIONS    = BIP85_APPLICATIONS;
		this.BIP85                 = BIP85;
		this.BIP85Child            = BIP85Child;

		// Dependances (resolues paresseusement + surchargeable via configure())
		this._bip32Mod      = require('bip32'); // module brut (v2 direct OU v3 factory)
		this._bip32Instance = null;             // instance factory resolue (v3+)
		this._ecc           = null;             // lib ecc pour la factory (ex: tiny-secp256k1)
		this.bip39          = require('bip39');
		this.wif            = require('wif');

		Bip85Utils._instance = this;
	} // constructor()

	static getInstance() {
		if ( ! Bip85Utils._instance ) {
			Bip85Utils._instance = new Bip85Utils();
		}
		return Bip85Utils._instance;
	} // getInstance()

	// Accesseur statique vers le Singleton : Bip85Utils.This.<methode>(...)
	static get This() {
		return Bip85Utils.getInstance();
	} // This

	// Injection explicite optionnelle : configure({ bip32, ecc, bip39, wif })
	configure( deps = {} ) {
		if ( deps.bip32 !== undefined ) {
			// Peut etre soit le module brut, soit une instance factory deja construite
			if ( typeof deps.bip32.fromBase58 === 'function' ) {
				this._bip32Instance = deps.bip32; // instance prete a l'emploi
			} else {
				this._bip32Mod      = deps.bip32; // module brut
				this._bip32Instance = null;
			}
		}
		if ( deps.ecc   !== undefined ) { this._ecc   = deps.ecc;   this._bip32Instance = null; }
		if ( deps.bip39 !== undefined ) { this.bip39  = deps.bip39; }
		if ( deps.wif   !== undefined ) { this.wif    = deps.wif;   }
		return this;
	} // configure()

	//------------------------------------------------------------------------------------------
	// Resolution bip32 : gere v2.x (API directe) ET >=3 (factory)
	//------------------------------------------------------------------------------------------
	getBip32() {
		if ( this._bip32Instance ) {
			return this._bip32Instance;
		}
		const mod = this._bip32Mod;

		// bip32 v2.x : les fonctions sont directement sur le module
		if ( typeof mod.fromBase58 === 'function' ) {
			this._bip32Instance = mod;
			return this._bip32Instance;
		}

		// bip32 >=3 : factory a instancier avec une lib ecc
		const factory = mod.BIP32Factory || ( mod.default && mod.default.BIP32Factory );
		if ( typeof factory === 'function' ) {
			let ecc = this._ecc;
			if ( ! ecc ) {
				try {
					ecc = require('tiny-secp256k1'); // dependance usuelle de Cryptocalc
				} catch ( e ) {
					throw new Error(
						"bip32 >=3 detecte : fournissez une lib ecc via " +
						"Bip85Utils.getInstance().configure({ ecc: require('tiny-secp256k1') }) " +
						"ou installez 'tiny-secp256k1'."
					);
				}
			}
			this._bip32Instance = factory( ecc );
			return this._bip32Instance;
		}

		throw new Error( "Module 'bip32' non reconnu (ni API v2 ni BIP32Factory)." );
	} // getBip32()

	// wif : gere v2.x ( encode(version, buf, compressed) ) ET v5 ( encode({version,privateKey,compressed}) )
	wifEncode( version, privateKey, compressed ) {
		if ( this.wif.encode.length === 1 ) {
			return this.wif.encode( { version, privateKey, compressed } ); // wif v5
		}
		return this.wif.encode( version, privateKey, compressed );         // wif v2.x
	} // wifEncode()

	//------------------------------------------------------------------------------------------
	// helpers internes (ex-modules "util" et "crypto")
	//------------------------------------------------------------------------------------------
	isValidIndex( index ) {
		return ( typeof index === 'number' && index >= 0 );
	} // isValidIndex()

	hmacSHA512( key, data ) {
		return createHmac( 'sha512', key ).update( data ).digest();
	} // hmacSHA512()

	//------------------------------------------------------------------------------------------
	// points d'entree : construction d'un master BIP85 (comme iancoleman)
	//------------------------------------------------------------------------------------------
	fromBase58( bip32seed ) {
		const node = this.getBip32().fromBase58( bip32seed );
		if ( node.depth !== 0 ) { throw new Error( "Expected master, got child" ); }
		return new BIP85( node );
	} // fromBase58()

	fromSeed( bip32seed ) {
		const node = this.getBip32().fromSeed( bip32seed );
		if ( node.depth !== 0 ) { throw new Error( "Expected master, got child" ); }
		return new BIP85( node );
	} // fromSeed()

	fromEntropy( entropy, password = "" ) {
		const mnemonic = this.bip39.entropyToMnemonic( entropy );
		return this.fromMnemonic( mnemonic, password );
	} // fromEntropy()

	fromMnemonic( mnemonic, password = "" ) {
		if ( ! this.bip39.validateMnemonic( mnemonic ) ) {
			throw new Error( "Invalid mnemonic" );
		}
		const seed = this.bip39.mnemonicToSeedSync( mnemonic, password );
		return this.fromSeed( seed );
	} // fromMnemonic()

	//------------------------------------------------------------------------------------------
	// raccourcis "one-shot" : xprv -> resultat final directement
	//------------------------------------------------------------------------------------------
	deriveBIP39( xprv, language, words, index = 0 ) {
		return this.fromBase58( xprv ).deriveBIP39( language, words, index ).toMnemonic();
	} // deriveBIP39()

	deriveWIF( xprv, index = 0 ) {
		return this.fromBase58( xprv ).deriveWIF( index ).toWIF();
	} // deriveWIF()

	deriveXPRV( xprv, index = 0 ) {
		return this.fromBase58( xprv ).deriveXPRV( index ).toXPRV();
	} // deriveXPRV()

	deriveHex( xprv, numBytes, index = 0 ) {
		return this.fromBase58( xprv ).deriveHex( numBytes, index ).toEntropy();
	} // deriveHex()

	//------------------------------------------------------------------------------------------
	// deriveToBip85Infos : entropie maitre (hexa) -> infos BIP85 (application BIP39)
	//   @param {string} entropy       entropie maitre en hexadecimal
	//   @param {number} index         index enfant ( >= 0 )
	//   @param {number} entropy_size  taille en BITS : 128 | 160 | 192 | 224 | 256
	//                                 ( -> 12  | 15  | 18  | 21  | 24 mots )
	//   @return {object} bip85_infos = { bip85_entropy, bip85_mnemonics }
	//------------------------------------------------------------------------------------------
	deriveToBip85Infos( entropy, index = 0, entropy_size = 256 ) {
		if ( ! this.isValidIndex( index ) ) {
			throw new Error( "deriveToBip85Infos: invalid index" );
		}
		if ( typeof entropy_size !== 'number' || entropy_size % 32 !== 0
		     || entropy_size < 128 || entropy_size > 256 ) {
			throw new Error( "deriveToBip85Infos: entropy_size must be 128, 160, 192, 224 or 256 bits" );
		}

		const language      = 0;                          // BIP39 English
		const words         = ( entropy_size / 32 ) * 3;  // 128->12 ... 256->24
		const entropyLength = entropy_size / 8;           // en octets : 128->16 ... 256->32

		// Master BIP85 a partir de l'entropie hexa ( entropy -> mnemonic -> seed -> root )
		const master = this.fromEntropy( entropy );

		// Application BIP39 : m/83696968'/39'/{language}'/{words}'/{index}'
		const path = `m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.BIP39}'/${language}'/${words}'/${index}'`;
		
		const bip85_index        = index;
		const bip85_entropy_size = entropy_size;
		const bip85_entropy      = master.derive( path, entropyLength );
		const bip85_mnemonics    = this.bip39.entropyToMnemonic( bip85_entropy );		

		const bip85_infos = { bip85_index, bip85_entropy, bip85_mnemonics, bip85_entropy_size };
		return bip85_infos;
	} // deriveToBip85Infos()
} // class Bip85Utils

const bip85_utils = Bip85Utils.getInstance();

if (typeof exports === 'object') {
	exports.Bip85Utils          = Bip85Utils
	exports.bip85_utils         = bip85_utils
	exports.BIP85               = BIP85
	exports.BIP85Child          = BIP85Child
	exports.BIP85_APPLICATIONS  = BIP85_APPLICATIONS
} // exports of 'bip85_utils.js'
