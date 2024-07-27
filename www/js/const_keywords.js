// =======================================================================================
// =================================  const_keywords.js  =================================
// =======================================================================================
"use strict";

const APP_VERSION               = "0.1.15";
const FROM_MAIN                 = 'FromMain';
const ENTROPY_SIZE              = 'Entropy Size';
const WORD_COUNT                = 'word_count'; 
const ACCOUNT_INDEX             = 'account_index'; 
const ADDRESS_INDEX             = 'address_index'; 
const MSG_ID                    = 'msg_id'; 

const WALLET_MODE               = 'Wallet Mode';
const WALLET_TYPES              = 'Wallet Types';
const HD_WALLET_TYPE            = 'HD Wallet';
const SIMPLE_WALLET_TYPE        = 'Simple Wallet';

const DEFAULT_BLOCKCHAIN        = 'Default Blockchain';

const IMAGE_ENTROPY_SRC_TYPE    = 'Image';
const FORTUNES_ENTROPY_SRC_TYPE = 'Fortunes'; 

const DERIVATION_PATH           = 'Derivation Path';
const WIF                       = 'WIF';

const GUI_THEME                 = 'GUI Theme';

if (typeof exports === 'object') {
	exports.APP_VERSION         = APP_VERSION
	exports.WORD_COUNT          = WORD_COUNT
	exports.ACCOUNT_INDEX       = ACCOUNT_INDEX
	exports.ADDRESS_INDEX       = ADDRESS_INDEX
	exports.MSG_ID              = MSG_ID
	exports.GUI_THEME           = GUI_THEME
	exports.DEFAULT_BLOCKCHAIN  = DEFAULT_BLOCKCHAIN
	exports.WALLET_TYPES        = WALLET_TYPES
	exports.WALLET_MODE         = WALLET_MODE
	exports.HD_WALLET_TYPE      = HD_WALLET_TYPE
	exports.SIMPLE_WALLET_TYPE  = SIMPLE_WALLET_TYPE
	exports.DERIVATION_PATH     = DERIVATION_PATH
	exports.WIF                 = WIF
} // 'const_keywords.js' exports