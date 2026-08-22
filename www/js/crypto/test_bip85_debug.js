//==============================================================================================
//===================================  test_bip85_debug.js  ====================================
//==============================================================================================
// Jeu de test BIP85 : vecteur de reference genere avec "Ian Coleman BIP39"
//   - Entropie initiale (256 bits, hexa)
//   - Mnemonique initial fourni a Ian Coleman (entropy -> mnemonic)
//   - Seedphrase derivee BIP85 (application BIP39, 24 mots, index 0)
"use strict";

const { bip85_utils, Bip85Utils } = require('./bip85_utils');

//---------------------------------------------------------------------------------------------
// Vecteur de reference (Ian Coleman BIP39)
//---------------------------------------------------------------------------------------------
const ENTROPY = '8a49b1a4b05dca8982a7d35a225093cecbd4d3b23c3f52517ec664434359bc4c';

const MNEMONIC_INITIAL =
	'medal eternal hard gaze syrup dynamic appear whip focus barely ceiling outside '
	+ 'run hawk similar margin false message ranch silk crouch proud van main';

const BIP85_SEEDPHRASE_EXPECTED =
	'odor interest neither predict divorce lounge polar buyer task stumble unaware human '
	+ 'reunion few alien glide time burst stadium rude midnight advice quote torch';

// Parametres de derivation BIP85 (24 mots -> 256 bits, index 0)
const INDEX        = 0;
const ENTROPY_SIZE = 256;

//---------------------------------------------------------------------------------------------
// mini-harnais d'assertions
//---------------------------------------------------------------------------------------------
let passed = 0, failed = 0;
const check = ( label, got, expected ) => {
	const ok = ( got === expected );
	ok ? passed++ : failed++;
	console.log( ( ok ? 'PASS' : 'FAIL' ) + ' | ' + label );
	if ( ! ok ) {
		console.log( '       attendu : ' + expected );
		console.log( '       obtenu  : ' + got );
	}
}; // check()

//---------------------------------------------------------------------------------------------
// 0) Singleton
//---------------------------------------------------------------------------------------------
console.log( '[Singleton]' );
check( 'bip85_utils === Bip85Utils.getInstance()', bip85_utils, Bip85Utils.getInstance() );
check( 'bip85_utils === Bip85Utils.This',          bip85_utils, Bip85Utils.This );

//---------------------------------------------------------------------------------------------
// 1) entropie initiale -> mnemonique initial
//---------------------------------------------------------------------------------------------
console.log( '\n[Entropie -> mnemonique initial]' );
const mnemonicInitial = Bip85Utils.This.bip39.entropyToMnemonic( ENTROPY );
check( 'entropy -> mnemonic initial', mnemonicInitial, MNEMONIC_INITIAL );

//---------------------------------------------------------------------------------------------
// 2) derivation BIP85 via Bip85Utils.This.deriveToBip85Infos
//---------------------------------------------------------------------------------------------
console.log( '\n[deriveToBip85Infos -> seedphrase BIP85]' );
const bip85_infos = Bip85Utils.This.deriveToBip85Infos( ENTROPY, INDEX, ENTROPY_SIZE );
console.log( '  entropy_size    :', ENTROPY_SIZE, 'bits    index :', INDEX );
console.log( '  bip85_entropy   :', bip85_infos.bip85_entropy );
console.log( '  bip85_mnemonics :', bip85_infos.bip85_mnemonics );
check( 'deriveToBip85Infos -> seedphrase', bip85_infos.bip85_mnemonics, BIP85_SEEDPHRASE_EXPECTED );

//---------------------------------------------------------------------------------------------
// Bilan
//---------------------------------------------------------------------------------------------
console.log( '\n============================================' );
console.log( `  RESULTAT : ${passed} PASS / ${failed} FAIL` );
console.log( '============================================' );
process.exit( failed === 0 ? 0 : 1 );
