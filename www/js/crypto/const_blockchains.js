// =====================================================================================
// ================================ const_blockchain.js ================================
// =====================================================================================
"use strict";

// cf. capitalization order on https://coinmarketcap.com/
// BUT Ethereum in First place because of the "ecosystem popularity"l
const NULL_COIN       = "Null-COIN";

const BLOCKCHAIN      = "Blockchain";
const NULL_BLOCKCHAIN = "Null-Blockchain";

const MAINNET      = "mainnet";
const TESTNET      = "testnet";

const TESTNET_COIN = "Testnet";

const BITCOIN      = "Bitcoin";
const ETHEREUM     = "Ethereum";
const BINANCE      = "Binance";
const SOLANA       = "Solana";
const RIPPLE       = "Ripple";
const CARDANO      = "Cardano";
const AVALANCHE    = "Avalanche";
const DOGECOIN     = "DogeCoin";
const TRON         = "TRON";
const POLKADOT     = "Polkadot";
const POLYGON      = "Polygon";
const LITECOIN     = "LiteCoin";
const FILECOIN     = "Filecoin";

// Monero mnemonic library (https://github.com/pywallet-cli/bip-utils)
// If you use the official Monero wallet, you'll probably notice that Monero generates 
// mnemonic in its own way, which is different from BIP-0039. In fact, it uses different 
// words lists (with 1626 words instead of 2048) and a different algorithm for 
// encoding/decoding the mnemonic string
const MONERO       = "Monero";

const TEZOS        = "Tezos";

const DASH         = "Dash";
const ZILLIQA      = "Zilliqa";
const KUSAMA       = "Kusama";
const ZCASH        = "Zcash";

const NAMECOIN     = "Namecoin";

// NB: [NULL_COIN] syntax means NULL_COIN const is interpreted as its value ("None")
//     else it would be interpreted as the const name "NULL_COIN" 8((
const COIN_ABBREVIATIONS = {
	[NULL_COIN]    : "Null-Coin",
	[TESTNET_COIN] : "Testnet-Coin",
	
	// ------------ https://coinmarketcap.com/ ------------
	[BITCOIN]      : "BTC",
	[ETHEREUM]     : "ETH",
	[BINANCE]      : "BNB",
	[SOLANA]       : "SOL",
	[RIPPLE]       : "XRP",
	[CARDANO]      : "ADA",
	[AVALANCHE]    : "AVAX",	
	[DOGECOIN]     : "DOGE",
	[TRON]         : "TRX",
	[POLKADOT]     : "DOT",
	[POLYGON]      : "MATIC",
	[LITECOIN]     : "LTC",
    [FILECOIN]     : "FIL",	
	[MONERO]       : "XMR",	
	[TEZOS]        : "XTZ",	
	[ZILLIQA]      : "ZIL",
	[ZCASH]        : "ZEC",
	[KUSAMA]       : "KSM",
	[DASH]         : "DASH",	
	// ------------ https://coinmarketcap.com/			
	
	[NAMECOIN]     : "NMC"	
}; // COIN_ABBREVIATIONS

// coin_types: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
const COIN_TYPES = {
	[NULL_COIN]    :   -1,
	
	[BITCOIN]      :    0,
	
	[TESTNET_COIN] :    1,
	
	[LITECOIN]     :    2,
	[DOGECOIN]     :    3,
	[DASH]         :    5,
	[NAMECOIN]     :    7,
	[ETHEREUM]     :   60,
	[MONERO]       :  128,
	[ZCASH]        :  133,
	[RIPPLE]       :  144,
	[TRON]         :  195,
	[ZILLIQA]      :  313,
	[KUSAMA]       :  434,
	[FILECOIN]     :  461,
	[SOLANA]       :  501,
	[BINANCE]      :  714,
	[POLYGON]      :  966,	
	[TEZOS]        : 1729,
	[CARDANO]      : 1815,
	[AVALANCHE]    : 9000
}; // COIN_TYPES

const FAUCET_URLs = {
    [NULL_COIN]  : "Null-URL",	
	[ETHEREUM]   : "https://mumbaifaucet.com/",
	[BITCOIN]    : "https://coinfaucet.eu/en/btc-testnet/",
	[SOLANA]     : "https://solfaucet.com/",
	[CARDANO]    : "https://docs.cardano.org/cardano-testnet/tools/faucet/",
	[DOGECOIN]   : "https://testnet-faucet.com/doge-testnet/",
	[AVALANCHE]  : "Null-URL",
	[TRON]       : "Null-URL",
	[DASH]       : "Null-URL",
	[LITECOIN]   : "https://litecointf.salmen.website/"
}; // FAUCET_URLs

// https://shardeum.org/blog/best-blockchain-explorers/
// 1. Blockchain
// 1. BlockCypher
const MAINNET_EXPLORER_URLs = {	
	[NULL_COIN]:   "Null-URL",
	
	[ETHEREUM]:    "https://etherscan.io/address/",	
	[BITCOIN]:     "https://www.blockchain.com/explorer/addresses/btc/",	
	[SOLANA]:      "https://explorer.solana.com/address/",
	[CARDANO]:     "https://blockchair.com/fr/cardano/address/",
	[RIPPLE]:      "https://blockchair.com/fr/search?q=",	
	[DOGECOIN]:    "https://dogechain.info/address/",
	[AVALANCHE]:   "https://snowtrace.io/address/",
	[TRON]:        "https://tronscan.org/#/address/",
	[DASH]:        "https://explorer.dash.org/insight/address/",
	[LITECOIN]:    "https://live.blockcypher.com/ltc/address/"
}; // MAINNET_EXPLORER_URLs

const TESTNET_EXPLORER_URLs = {
	[NULL_COIN]:   "Null-URL",	
	[ETHEREUM]:    "https://sepolia.etherscan.io/address/%ADDRESS%",	
	[BITCOIN]:     "https://live.blockcypher.com/btc-testnet/address/%ADDRESS%",	
	[SOLANA]:      "https://explorer.solana.com/%ADDRESS%/?cluster=testnet",	
	[CARDANO]:     "https://preprod.cardanoscan.io/address/%ADDRESS%",	
    [RIPPLE]:      "Null-URL",
	[DOGECOIN]:    "https://sochain.com/address/DOGETEST/%ADDRESS%",
	[AVALANCHE]:   "Null-URL",
    [TRON]:        "Null-URL",
	[DASH]:        "Null-URL",
    [LITECOIN]:    "https://sochain.com/address/LTCTEST/%ADDRESS%"	
}; // TESTNET_EXPLORER_URLs

if (typeof exports === 'object') {
	exports.NULL_COIN                = NULL_COIN	
	
	exports.BLOCKCHAIN               = BLOCKCHAIN
	exports.NULL_BLOCKCHAIN          = NULL_BLOCKCHAIN
	
	exports.TESTNET_COIN             = TESTNET_COIN	
	
	exports.COIN_ABBREVIATIONS       = COIN_ABBREVIATIONS
	exports.COIN_TYPES               = COIN_TYPES
	
	exports.BITCOIN                  = BITCOIN
	exports.ETHEREUM                 = ETHEREUM
	exports.BINANCE                  = BINANCE
	exports.SOLANA                   = SOLANA
	exports.RIPPLE                   = RIPPLE
	exports.CARDANO                  = CARDANO
	exports.AVALANCHE                = AVALANCHE
	exports.DOGECOIN                 = DOGECOIN
	exports.TRON                     = TRON
	exports.POLKADOT                 = POLKADOT
    exports.POLYGON                  = POLYGON
	exports.LITECOIN                 = LITECOIN
	exports.FILECOIN                 = FILECOIN
	exports.MONERO                   = MONERO
	exports.TEZOS                    = TEZOS
	exports.ZILLIQA                  = ZILLIQA
	exports.KUSAMA                   = KUSAMA
	exports.DASH                     = DASH
	
	exports.ZCASH                    = ZCASH
	
	exports.NAMECOIN                 = NAMECOIN
	
	exports.MAINNET                  = MAINNET
	exports.TESTNET                  = TESTNET
		
	exports.FAUCET_URLs              = FAUCET_URLs
	exports.MAINNET_EXPLORER_URLs    = MAINNET_EXPLORER_URLs
	exports.TESTNET_EXPLORER_URLs    = TESTNET_EXPLORER_URLs
} // exports of const_blockchains.js