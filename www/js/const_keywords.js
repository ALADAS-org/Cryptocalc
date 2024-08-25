// =======================================================================================
// =================================  const_keywords.js  =================================
// =======================================================================================
"use strict";

const OK                        = 0;
const KO                        = -1;

const APP_VERSION               = '0.2.0';
const LANG                      = 'lang';
const FROM_MAIN                 = 'FromMain';

const BLOCKCHAIN                = 'blockchain';
const NULL_BLOCKCHAIN           = 'Null-BLOCKCHAIN';

const UUID                      = 'uuid';
const ENTROPY_SIZE              = 'Entropy Size';
const WORD_COUNT                = 'word_count'; 
const ACCOUNT                   = 'account_index'; 
const ADDRESS_INDEX             = 'address_index'; 
const MSG_ID                    = 'msg_id'; 

const MNEMONICS                 = 'mnemonics';

const WALLET_MODE               = 'Wallet Mode';
const WALLET_TYPES              = 'Wallet Types';

const HD_WALLET_TYPE            = 'HD Wallet';
const SIMPLE_WALLET_TYPE        = 'Simple Wallet';
const SWORD_WALLET_TYPE         = 'SWORD Wallet';

const DEFAULT_BLOCKCHAIN        = 'Default Blockchain';

const WALLET_SAVE_PATH          = 'Wallet Save Path';

const IMAGE_ENTROPY_SRC_TYPE    = 'Image';
const FORTUNES_ENTROPY_SRC_TYPE = 'Fortunes'; 

const DERIVATION_PATH           = 'Derivation Path';
const WIF                       = 'WIF';

const GUI_THEME                 = 'GUI Theme';

if (typeof exports === 'object') {
	exports.APP_VERSION         = APP_VERSION
	exports.OK                  = OK
	exports.KO                  = KO
	exports.LANG                = LANG
	exports.BLOCKCHAIN          = BLOCKCHAIN
	exports.NULL_BLOCKCHAIN     = NULL_BLOCKCHAIN
	exports.UUID                = UUID
	exports.WORD_COUNT          = WORD_COUNT
	exports.ACCOUNT             = ACCOUNT
	exports.ADDRESS_INDEX       = ADDRESS_INDEX
	exports.MSG_ID              = MSG_ID
	exports.GUI_THEME           = GUI_THEME
	exports.DEFAULT_BLOCKCHAIN  = DEFAULT_BLOCKCHAIN
	exports.WALLET_TYPES        = WALLET_TYPES
	exports.WALLET_MODE         = WALLET_MODE
	
	exports.HD_WALLET_TYPE      = HD_WALLET_TYPE
	exports.SIMPLE_WALLET_TYPE  = SIMPLE_WALLET_TYPE
	exports.SWORD_WALLET_TYPE   = SWORD_WALLET_TYPE
	
	exports.WALLET_SAVE_PATH    = WALLET_SAVE_PATH
	exports.DERIVATION_PATH     = DERIVATION_PATH
	exports.MNEMONICS           = MNEMONICS
	exports.WIF                 = WIF
} // 'const_keywords.js' exports