// =====================================================================================
// ================================   const_events.js   ================================
// =====================================================================================
"use strict";

const CMD_NONE                                    = "cmd:None";

const CMD_NEW_WALLET                              = "cmd:NewWallet";
const CMD_OPEN_WALLET                             = "cmd:OpenWallet";
const CMD_GENERATE_WALLET                         = "cmd:GenerateWallet";
const CMD_REFRESH_WALLET                          = "cmd:RefreshWallet";
    
const VIEW_TOGGLE_DEVTOOLS                        = "View/ToggleDevTools";
const TOOLS_OPTIONS                               = "Tools/Options";

const ToMain_RQ_QUIT_APP                          = "ToMain:Request/quit_app";

const ToMain_RQ_LOG_2_MAIN                        = "ToMain:Request/log2main";
const ToMain_RQ_LOG_2_MAIN_SYNC                   = "ToMain:Request/log2main_sync";

const ToMain_RQ_EXEC_CMD                          = "ToMain:Request/ExecCmd";

const ToMain_RQ_SET_WINDOW_TITLE                  = "ToMain:Request/set_window_title";
const ToMain_RQ_TOGGLE_DEBUG_PANEL                = "ToMain:Request/toggle_debug_panel";

const ToMain_RQ_NEW_WALLET_INFO                   = "ToMain:Request/new_wallet_info";
const ToMain_RQ_OPEN_WALLET_INFO                  = "ToMain:Request/open_wallet_info";
const ToMain_RQ_SAVE_WALLET_INFO                  = "ToMain:Request/save_wallet_info";

const ToMain_RQ_OPEN_URL                          = "ToMain:Request/open_URL";
const ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER    = "ToMain:Request/show_output_folder_in_explorer";

const ToMain_RQ_ENTROPY_SRC_TO_ENTROPY            = "ToMain:Request/entropy_src_to_entropy";
const ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO         = "ToMain:Request/mnemonics_to_entropy_info";

const ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO       = "ToMain:Request/mnemonics_to_hd_wallet_info";

const ToMain_RQ_ENTROPY_TO_MNEMONICS              = "ToMain:Request/entropy_to_mnemonics";
const ToMain_RQ_ENTROPY_TO_CHECKSUM               = "ToMain:Request/entropy_to_checksum";
const ToMain_RQ_ENTROPY_SRC_TO_PK                 = "ToMain:Request/entropy_src_to_pk";

const ToMain_RQ_GENERATE_PASSWORD                 = "ToMain:Request/GeneratePassword";

const ToMain_RQ_MNEMONICS_AS_4LETTER              = "ToMain:Request/mnemonics_as_4letter";
const ToMain_RQ_MNEMONICS_AS_TWO_PARTS            = "ToMain:Request/mnemonics_as_two_parts";
const ToMain_RQ_CHECK_MNEMONICS                   = "ToMain:Request/check_mnemonics";
const ToMain_RQ_MNEMONICS_TO_WORD_INDEXES         = "ToMain:Request/mnemonics_to_word_indexes";
const ToMain_RQ_GUESS_MNEMONICS_LANG              = "ToMain:Request/guess_mnemonics_lang";

const ToMain_RQ_GET_HD_WALLET                     = "ToMain:Request/get_hd_wallet";
const ToMain_RQ_GET_SIMPLE_WALLET                 = "ToMain:Request/get_simple_wallet";
const ToMain_RQ_GET_SIMPLE_WALLET_FROM_MNEMONICS  = "ToMain:Request/get_simple_wallet_from_mnemonics";
const ToMain_RQ_GET_HD_SOLANA_WALLET              = "ToMain:Request/get_HD_SOLANA_wallet";

const ToMain_RQ_GET_FORTUNE_COOKIE                = "ToMain:Request/get_FortuneCookie";

const ToMain_RQ_GET_SECP256K1                     = "ToMain:Request/get_Secp256k1";
const ToMain_RQ_GET_UUID                          = "ToMain:Request/get_UUID";

const ToMain_RQ_GET_L10N_KEYPAIRS                 = "ToMain:Request/get_L10n_keypairs";
const ToMain_RQ_GET_L10N_MSG                      = "ToMain:Request/get_L10n_Msg";

const ToMain_RQ_SET_MENU_ITEM_STATE               = "ToMain:Request/set_menu_item_state";

const ToMain_RQ_SAVE_OPTIONS                      = "ToMain:Request/save_options";
const ToMain_RQ_RESET_OPTIONS                     = "ToMain:Request/reset_options";
const ToMain_RQ_UPDATE_OPTIONS                    = "ToMain:Request/update_options";

const ToMain_RQ_LOAD_IMG_FROM_FILE                = "ToMain:Request/load_image_from_file";
const ToMain_RQ_DRAW_RND_CRYPTO_LOGO              = "ToMain:Request/draw_rnd_crypto_logo";

const FromMain_DID_FINISH_LOAD                    = "FromMain:did-finish-load";

// Note: File/New: ElectronMain.GetInstance().doFileNew() => ElectronMain.GetInstance().loadOptions()
const FromMain_EXEC_CMD                         = "FromMain:ExecCmd";
const FromMain_FILE_NEW                         = "FromMain:File/New";
const FromMain_FILE_OPEN                        = "FromMain:File/Open";
const FromMain_FILE_SAVE                        = "FromMain:File/Save";
const FromMain_FILE_SAVE_AS                     = "FromMain:File/SaveAs";
const FromMain_HELP_ABOUT                       = "FromMain:Help/About";

const FromMain_SHOW_ERROR_DIALOG                = "FromMain:ShowErrorDialog";
const FromMain_SHOW_MSG_DIALOG                  = "FromMain:ShowMessage";
const FromMain_TOOLS_OPTIONS_DIALOG             = "FromMain:ToolsOptionsDialog";

const FromMain_SET_FORTUNE_COOKIE               = "FromMain:File/Import/Random Fortune Cookie";
const FromMain_UPDATE_OPTIONS                   = "FromMain:UpdateOptions";

const FromMain_SET_VARIABLE                     = "FromMain:SetVariable";
const FromMain_SEND_IMG_URL                     = "FromMain:SendImageURL";

const FromMain_INTERNET_CONNECTED               = "FromMain:InternetConnected";

if ( typeof exports === 'object' ) {
	exports.CMD_NONE                                   = CMD_NONE
	
    exports.CMD_NEW_WALLET                             = CMD_NEW_WALLET
    exports.CMD_OPEN_WALLET                            = CMD_OPEN_WALLET
	exports.CMD_GENERATE_WALLET                        = CMD_GENERATE_WALLET
	exports.CMD_REFRESH_WALLET                         = CMD_REFRESH_WALLET
	
	exports.VIEW_TOGGLE_DEVTOOLS                       = VIEW_TOGGLE_DEVTOOLS
    exports.TOOLS_OPTIONS                              = TOOLS_OPTIONS	
	
	exports.ToMain_RQ_QUIT_APP                         = ToMain_RQ_QUIT_APP
	
	exports.ToMain_RQ_LOG_2_MAIN                       = ToMain_RQ_LOG_2_MAIN
	exports.ToMain_RQ_LOG_2_MAIN_SYNC                  = ToMain_RQ_LOG_2_MAIN_SYNC
	
	exports.ToMain_RQ_EXEC_CMD                         = ToMain_RQ_EXEC_CMD
	
	exports.ToMain_RQ_SET_WINDOW_TITLE                 = ToMain_RQ_SET_WINDOW_TITLE
	exports.ToMain_RQ_TOGGLE_DEBUG_PANEL               = ToMain_RQ_TOGGLE_DEBUG_PANEL
	
	exports.ToMain_RQ_NEW_WALLET_INFO                  = ToMain_RQ_NEW_WALLET_INFO
	exports.ToMain_RQ_OPEN_WALLET_INFO                 = ToMain_RQ_OPEN_WALLET_INFO
	exports.ToMain_RQ_SAVE_WALLET_INFO                 = ToMain_RQ_SAVE_WALLET_INFO
	
	exports.ToMain_RQ_ENTROPY_SRC_TO_ENTROPY           = ToMain_RQ_ENTROPY_SRC_TO_ENTROPY	
    exports.ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO        = ToMain_RQ_MNEMONICS_TO_ENTROPY_INFO
	exports.ToMain_RQ_ENTROPY_TO_MNEMONICS             = ToMain_RQ_ENTROPY_TO_MNEMONICS
	exports.ToMain_RQ_ENTROPY_TO_CHECKSUM              = ToMain_RQ_ENTROPY_TO_CHECKSUM	
	exports.ToMain_RQ_ENTROPY_SRC_TO_PK                = ToMain_RQ_ENTROPY_SRC_TO_PK
	exports.ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO      = ToMain_RQ_MNEMONICS_TO_HD_WALLET_INFO
	
	exports.ToMain_RQ_GENERATE_PASSWORD                = ToMain_RQ_GENERATE_PASSWORD
	
	exports.ToMain_RQ_OPEN_URL                         = ToMain_RQ_OPEN_URL	
	exports.ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER   = ToMain_RQ_SHOW_OUTPUT_FOLDER_IN_EXPLORER
	
	exports.ToMain_RQ_GET_SECP256K1                    = ToMain_RQ_GET_SECP256K1
	exports.ToMain_RQ_GET_UUID                         = ToMain_RQ_GET_UUID
	
	exports.ToMain_RQ_GET_L10N_KEYPAIRS                = ToMain_RQ_GET_L10N_KEYPAIRS
	exports.ToMain_RQ_GET_L10N_MSG                     = ToMain_RQ_GET_L10N_MSG

    exports.ToMain_RQ_SET_MENU_ITEM_STATE              = ToMain_RQ_SET_MENU_ITEM_STATE	
	
	exports.ToMain_RQ_MNEMONICS_AS_4LETTER             = ToMain_RQ_MNEMONICS_AS_4LETTER
	exports.ToMain_RQ_MNEMONICS_AS_TWO_PARTS           = ToMain_RQ_MNEMONICS_AS_TWO_PARTS
	exports.ToMain_RQ_MNEMONICS_TO_WORD_INDEXES        = ToMain_RQ_MNEMONICS_TO_WORD_INDEXES
	exports.ToMain_RQ_GUESS_MNEMONICS_LANG             = ToMain_RQ_GUESS_MNEMONICS_LANG
	exports.ToMain_RQ_GET_FORTUNE_COOKIE               = ToMain_RQ_GET_FORTUNE_COOKIE
	
	exports.ToMain_RQ_SAVE_OPTIONS                     = ToMain_RQ_SAVE_OPTIONS
	exports.ToMain_RQ_RESET_OPTIONS                    = ToMain_RQ_RESET_OPTIONS
	exports.ToMain_RQ_UPDATE_OPTIONS                   = ToMain_RQ_UPDATE_OPTIONS

	exports.ToMain_RQ_LOAD_IMG_FROM_FILE               = ToMain_RQ_LOAD_IMG_FROM_FILE 
	exports.ToMain_RQ_DRAW_RND_CRYPTO_LOGO             = ToMain_RQ_DRAW_RND_CRYPTO_LOGO
	
	exports.ToMain_RQ_GET_HD_WALLET                    = ToMain_RQ_GET_HD_WALLET
	exports.ToMain_RQ_GET_SIMPLE_WALLET                = ToMain_RQ_GET_SIMPLE_WALLET
    exports.ToMain_RQ_GET_SIMPLE_WALLET_FROM_MNEMONICS = ToMain_RQ_GET_SIMPLE_WALLET_FROM_MNEMONICS,
	exports.ToMain_RQ_GET_HD_SOLANA_WALLET             = ToMain_RQ_GET_HD_SOLANA_WALLET 
	
	exports.FromMain_DID_FINISH_LOAD                 = FromMain_DID_FINISH_LOAD
	
	exports.FromMain_EXEC_CMD                        = FromMain_EXEC_CMD
	
	exports.FromMain_FILE_NEW                        = FromMain_FILE_NEW
	exports.FromMain_FILE_OPEN                       = FromMain_FILE_OPEN
	exports.FromMain_FILE_SAVE                       = FromMain_FILE_SAVE
	exports.FromMain_FILE_SAVE_AS                    = FromMain_FILE_SAVE_AS
	exports.FromMain_HELP_ABOUT                      = FromMain_HELP_ABOUT
	
	exports.FromMain_SHOW_ERROR_DIALOG               = FromMain_SHOW_ERROR_DIALOG
	exports.FromMain_SHOW_MSG_DIALOG                 = FromMain_SHOW_MSG_DIALOG
	
	exports.FromMain_TOOLS_OPTIONS_DIALOG            = FromMain_TOOLS_OPTIONS_DIALOG
	
	exports.FromMain_SEND_IMG_URL                    = FromMain_SEND_IMG_URL
	exports.FromMain_SET_FORTUNE_COOKIE              = FromMain_SET_FORTUNE_COOKIE	

	exports.FromMain_UPDATE_OPTIONS                  = FromMain_UPDATE_OPTIONS	
	
	exports.FromMain_SET_VARIABLE                    = FromMain_SET_VARIABLE
	
	exports.FromMain_INTERNET_CONNECTED              = FromMain_INTERNET_CONNECTED
} // exports of 'const_events.js'