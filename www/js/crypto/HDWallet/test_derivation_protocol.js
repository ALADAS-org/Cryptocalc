// ======================================================================================
// ===================================  test_bip84.js  ==================================
// ======================================================================================
"use strict";

// NB: Import Test OK in "Phantom Wallet" ( private key as Base58 string )

const bip39            = require('bip39');
const bs58             = require('bs58');

const { COIN, COIN_TYPE,
	    ETHEREUM,  BINANCE_BSC, ETHEREUM_CLASSIC, 
		BITCOIN, DOGECOIN, LITECOIN, 
		SOLANA, CARDANO, STELLAR, SUI, RIPPLE, TON,
		DASH, VECHAIN, FIRO, TRON, 
		AVALANCHE, POLYGON, BITCOIN_CASH, BITCOIN_SV, RAVENCOIN, HORIZEN,
		MAINNET, COIN_ABBREVIATIONS
      }                   = require('../const_blockchains.js');
	  
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        WALLET_MODE, HD_WALLET_TYPE,
        UUID, MNEMONICS, WIF,
        BIP32_PROTOCOL, BIP32_PASSPHRASE, 
		ACCOUNT, ADDRESS_INDEX, DERIVATION_PATH
}                         = require('../../const_keywords.js');	 

const { NULL_HEX, CRYPTO_NET, 
        ADDRESS, 
		PRIVATE_KEY, PUBLIC_KEY_HEX,
		PRIV_KEY
	  }                   = require('../const_wallet.js');

const { Bip32Utils }                = require('./bip32_utils.js');		
const { Bip39Utils }                = require('../bip39_utils.js');

const HdAddGen = require('hdaddressgenerator');


const test_derivation_protocol = async () => { 
	const protocol  = 44; 
	const coin_type = 0;
	// const derivation_path  = "m/" + protocol + "'/" + coin_type + "'/" + account + "'/0'/" + address_index + "'";
	
	const entropy   =   "0e91dd91d69c5e51859c6eb76a5bfae888e4f81d1578d726e3fa44ab10855df9";
	
	const mnemonics =   "attend moment good pudding shine churn biology miss resist fan wrong speed "
	                  + "mixture lab inmate pyramid strong damage write matter rain dress jewel daughter";
					  
	const salt_uuid = "d47dba82-aeb3-44cd-a8b1-5f85bb808f38";	
	
	
	const blockchain       = BITCOIN;
	
	// const protocol_number  = 44;
	const protocol_number  = 84;
	
	const bip32_passphrase = "";
	
	const account          = 0;
	const address_index    = 0;
	
	
	let derivation_path_options = { [BIP32_PROTOCOL]: protocol_number, [ACCOUNT]: account, [ADDRESS_INDEX]: address_index };
		
	let master_derivation_path = Bip32Utils.GetDerivationPath( coin_type, derivation_path_options );
	
	let options = { [BLOCKCHAIN]:    	blockchain, 
	                [BIP32_PROTOCOL]:   protocol_number,
		            [BIP32_PASSPHRASE]: bip32_passphrase,
			        [ACCOUNT]:       	account,
				    [ADDRESS_INDEX]: 	address_index, 
			        [UUID]:          	salt_uuid };
						
	let hdwallet_info = await Bip32Utils.MnemonicsToHDWalletInfo( mnemonics, options );	
	
	console.log( ">> hdwallet_info" + JSON.stringify( hdwallet_info ) );
	
	console.log( "\n>> master_derivation_path:  " + master_derivation_path );
	
	console.log( "\n>> entropy:                 " + entropy );
	
	console.log( "\n>> mnemonics:               " + mnemonics );
	
	console.log( "\n>> wallet_address:          " + hdwallet_info[ADDRESS] );
	console.log( "\n>> private_key:             " + hdwallet_info[PRIVATE_KEY] );
	console.log( "\n>> WIF:                     " + hdwallet_info[WIF] );
} // test_derivation_protocol() 

// IIFE (Immediately Invoked Function Expression)
( async () => {
	await test_derivation_protocol(); // Caution !! Don't put this line in comments
} )();
