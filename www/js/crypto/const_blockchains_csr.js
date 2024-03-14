// =========================================================================================
// ================================ const_blockchain_csr.js ================================
// =========================================================================================
"use strict";

// cf. capitalization order on https://coinmarketcap.com/
// BUT Ethereum in First place because of the "ecosystem popularity"l
const NULL_COIN       = "Null-COIN";

const BLOCKCHAIN      = "blockchain";
const NULL_BLOCKCHAIN = "Null-BLOCKCHAIN";

const CRYPTO_NET      = "crypto_net";
const MAINNET         = "mainnet";
const TESTNET         = "testnet";

const ETHEREUM        = "Ethereum";
const BITCOIN         = "Bitcoin";
//const BINANCE         = "Binance";
const SOLANA          = "Solana";
const CARDANO         = "Cardano";
const RIPPLE          = "Ripple";
const AVALANCHE       = "Avalanche";
const DOGECOIN        = "DogeCoin";
const TRON            = "TRON";
const LITECOIN        = "LiteCoin";
const DASH            = "Dash";

// NB: [NULL_COIN] syntax means NULL_COIN const is interpreted as its value ("None")
//     else it would be interpreted a the const name "NULL_COIN" 8((
const COIN_ABBREVIATIONS = {
	[NULL_COIN]  : "Null-Coin",	
	[ETHEREUM]   : "ETH",
	[BITCOIN]    : "BTC",
//	[BINANCE]    : "BNB",
	[SOLANA]     : "SOL",
	[CARDANO]    : "ADA",
	[RIPPLE]     : "XRP",
	[AVALANCHE]  : "AVAX",
	[DOGECOIN]   : "DOGE",
	[TRON]       : "TRX",
	[LITECOIN]   : "LTC",
	[DASH]       : "DASH"
}; // COIN_ABBREVIATIONS

const FAUCET_URLs = {
    [NULL_COIN]  : "Null-URL",	
	[ETHEREUM]   : "https://mumbaifaucet.com/",
	[BITCOIN]    : "https://coinfaucet.eu/en/btc-testnet/",
//	[BINANCE]    : "Null-URL",
	[SOLANA]     : "https://solfaucet.com/",
	[CARDANO]    : "https://docs.cardano.org/cardano-testnet/tools/faucet/",
	[RIPPLE]     : "Null-URL",	
	[AVALANCHE]  : "Null-URL",
	[DOGECOIN]   : "https://testnet-faucet.com/doge-testnet/",
	[TRON]       : "Null-URL",
	[LITECOIN]   : "https://testnet-faucet.com/ltc-testnet/",
	[DASH]       : "Null-URL"
}; // FAUCET_URLs

const MAINNET_EXPLORER_URLs = {	
	[NULL_COIN]:   "Null-URL",
    [ETHEREUM]:    "https://etherscan.io/address/",
	[BITCOIN]:     "https://www.blockchain.com/explorer/addresses/btc/",
//	[BINANCE]:     "Null-URL",
	[SOLANA]:      "https://explorer.solana.com/address/",
	[CARDANO]:     "https://blockchair.com/fr/cardano/address/",
	[RIPPLE]:      "https://blockchair.com/fr/search?q=",
	[AVALANCHE]:   "https://snowtrace.io/address/",
	[DOGECOIN]:    "https://dogechain.info/address/",
	[TRON]:        "https://tronscan.org/#/address/",
	[LITECOIN]:    "https://live.blockcypher.com/ltc/address/",
	[DASH]:        "https://explorer.dash.org/insight/address/",
}; // MAINNET_EXPLORER_URLs