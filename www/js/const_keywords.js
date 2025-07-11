// =======================================================================================
// =================================  const_keywords.js  =================================
// =======================================================================================
"use strict";

const APP_VERSION               = '0.3.2';

const OK                        = 0;
const KO                        = -1;

const BACKSPACE_KEY_CODE        = 8;
const DEL_KEY_CODE              = 46;

const CMD                       = 'cmd';
const NEW_WALLET                = 'new_wallet';
const OPEN_WALLET               = 'open_wallet';

const LANG                      = 'lang';
const FROM_MAIN                 = 'FromMain';

const WITS_PATH                 = 'wits_path';
const PROGRAM                   = 'program';
const ELECTRON_LAUNCHER         = 'electron.exe';
const EXE_LAUNCHER              = 'cryptowallet.exe';

const PATH                      = 'path';
const ARGS                      = 'args';

const BLOCKCHAIN                = 'blockchain';
const NULL_BLOCKCHAIN           = 'Null-BLOCKCHAIN';

const UUID                      = 'uuid';
const ENTROPY                   = 'Entropy';
const ENTROPY_SIZE              = 'Entropy Size';
const EXPECTED_ENTROPY_DIGITS   = 'expected_entropy_digits';
const WORD_COUNT                = 'word_count'; 
const PASSWORD                  = 'password';
 
const MSG_ID                    = 'msg_id'; 

const DERIVATION_PATH           = 'Derivation Path';
const HARDENED                  = 'hardened';

const ACCOUNT                   = 'account'; 
const ACCOUNT_MAX               = 999999999; // 9999;

const ADDRESS_INDEX             = 'address_index';
const ADDRESS_INDEX_MAX         = 999999999; // 9999;

const MNEMONICS                 = 'mnemonics';
const WORD_INDEXES              = 'Word indexes'; //'word_indexes';

const WALLET_MODE               = 'Wallet Mode';
const WALLET_TYPES              = 'Wallet Types';

const HD_WALLET_TYPE            = 'HD Wallet';
const SIMPLE_WALLET_TYPE        = 'Simple Wallet';
const SWORD_WALLET_TYPE         = 'SWORD Wallet'; // SWORD: Simple Wallet On Randomized Deterministic 

const DEFAULT_BLOCKCHAIN        = 'Default Blockchain';

const WALLET_SAVE_PATH          = 'Wallet Save Path';

const IMAGE_ENTROPY_SRC_TYPE    = 'Image';
const FORTUNES_ENTROPY_SRC_TYPE = 'Fortunes'; 

const WIF                       = 'WIF';

const GUI_THEME                 = 'GUI Theme';

if (typeof exports === 'object') {
	exports.APP_VERSION           = APP_VERSION
	exports.OK                    = OK
	exports.KO                    = KO
	
	exports.CMD                   = CMD	
	
	exports.WITS_PATH             = WITS_PATH
	exports.PROGRAM               = PROGRAM
	exports.ELECTRON_LAUNCHER     = ELECTRON_LAUNCHER
	exports.EXE_LAUNCHER          = EXE_LAUNCHER
	exports.PATH                  = PATH
	exports.ARGS                  = ARGS	

	exports.LANG                  = LANG
	
	exports.BLOCKCHAIN            = BLOCKCHAIN
	exports.NULL_BLOCKCHAIN       = NULL_BLOCKCHAIN
	exports.UUID                  = UUID
	
	exports.HD_WALLET_TYPE        = HD_WALLET_TYPE
	exports.SIMPLE_WALLET_TYPE    = SIMPLE_WALLET_TYPE
	exports.SWORD_WALLET_TYPE     = SWORD_WALLET_TYPE
	
	exports.ENTROPY               = ENTROPY
	exports.ENTROPY_SIZE          = ENTROPY_SIZE
	
	exports.MNEMONICS             = MNEMONICS
	exports.WORD_INDEXES          = WORD_INDEXES
	exports.WORD_COUNT            = WORD_COUNT
	exports.PASSWORD              = PASSWORD
	
	exports.WIF                   = WIF
	
	exports.DERIVATION_PATH       = DERIVATION_PATH
	exports.HARDENED              = HARDENED

	exports.ACCOUNT               = ACCOUNT
	exports.ACCOUNT_MAX           = ACCOUNT_MAX

	exports.ADDRESS_INDEX         = ADDRESS_INDEX
	exports.ADDRESS_INDEX_MAX     = ADDRESS_INDEX_MAX
	
	exports.MSG_ID                = MSG_ID
	exports.GUI_THEME             = GUI_THEME
	exports.DEFAULT_BLOCKCHAIN    = DEFAULT_BLOCKCHAIN
	exports.WALLET_TYPES          = WALLET_TYPES
	exports.WALLET_MODE           = WALLET_MODE
	
	exports.WALLET_SAVE_PATH      = WALLET_SAVE_PATH
} // 'const_keywords.js' exports