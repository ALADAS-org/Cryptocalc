// =======================================================================================
// ==============================   color_console_codes.js   =============================
// =======================================================================================
// https://blog.logrocket.com/using-console-colors-node-js/
// https://gist.github.com/JBlond/2fea43a3049b38287e5e9cefc87b2124

const _RED_           = '\x1b[1;31m';
const _RED_HIGH_      = '\x1b[0;91m';
const _GREEN_         = '\x1b[0;92m';
const _YELLOW_        = '\x1b[0;93m';
const _BLUE_HIGH_     = '\x1b[0;94m';
const _PURPLE_        = '\x1b[0;95m';
const _CYAN_          = '\x1b[0;96m';

const _WHITE_ON_RED_  = '\x1b[0;47m\x1b[41m';
const _BLK_ON_YLW_    = '\x1b[0;30m\x1b[43m';
const _BLK_ON_CYAN_   = '\x1b[0;30m\x1b[0;104m';
const _BLK_ON_PURPLE_ = '\x1b[0;30m\x1b[0;105m';
const _END_           = '\x1b[0m';

if (typeof exports === 'object') {
	exports._RED_           = _RED_
	exports._RED_HIGH_      = _RED_HIGH_
	exports._GREEN_         = _GREEN_
	exports._YELLOW_        = _YELLOW_
	exports._BLUE_HIGH_     = _BLUE_HIGH_
	exports._CYAN_          = _CYAN_
	exports._PURPLE_        = _PURPLE_
	
	exports._BLK_ON_YLW_    = _BLK_ON_YLW_
	exports._BLK_ON_CYAN_   = _BLK_ON_CYAN_
	exports._WHITE_ON_RED_  = _WHITE_ON_RED_
	exports._BLK_ON_PURPLE_ = _BLK_ON_PURPLE_
	exports._END_           = _END_
} // exports of 'color_console_codes.js'