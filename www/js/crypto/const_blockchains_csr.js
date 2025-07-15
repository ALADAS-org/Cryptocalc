// =========================================================================================
// ===============================  const_blockchain_csr.js  ===============================
// =========================================================================================
"use strict";

// cf. capitalization order on https://coinmarketcap.com/
// BUT Ethereum in First place because of the "ecosystem popularity"
const NULL_COIN       = "Null-COIN";

const CRYPTO_NET      = "crypto_net";
const MAINNET         = "mainnet";
const TESTNET         = "testnet";

const ETHEREUM        = "Ethereum";
const BITCOIN         = "Bitcoin";
const BINANCE_BSC     = "Binance Smart Chain";
const SOLANA          = "Solana";

const CARDANO         = "Cardano";
const STELLAR         = "Stellar";
const ADA_PURPOSE     = "1852";

const RIPPLE          = "Ripple";

const AVALANCHE       = "Avalanche";
const DOGECOIN        = "DogeCoin";
const TRON            = "TRON";
const BITCOIN_CASH    = "Bitcoin Cash"; 
const LITECOIN        = "LiteCoin";
const DASH            = "Dash";
const EOS             = "EOS";
const FIRO            = "Firo";
const ZCASH           = "ZCASH";

// NB: [NULL_COIN] syntax means NULL_COIN const is interpreted as its value ("None")
//     else it would be interpreted a the const name "NULL_COIN" 8((
const COIN_ABBREVIATIONS = {
	[NULL_COIN]    : "Null-Coin",	
	[ETHEREUM]     : "ETH",
	[BITCOIN]      : "BTC",
 	[BINANCE_BSC]  : "BNB",
	[SOLANA]       : "SOL",
	[CARDANO]      : "ADA",
	[STELLAR]      : "XLM",
	[RIPPLE]       : "XRP",
	[AVALANCHE]    : "AVAX",
	[DOGECOIN]     : "DOGE",
	[TRON]         : "TRX",
	[BITCOIN_CASH] : "BCH",
	[LITECOIN]     : "LTC",
	[DASH]         : "DASH",
	[EOS]          : "EOS",
	[FIRO]         : "FIRO",
	[ZCASH]        : "ZEC"
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
	[FIRO]         :  136,
	[RIPPLE]       :  144,
	[BITCOIN_CASH] :  145,
	[STELLAR] 	   :  148,
	[EOS]          :  194,
	[TRON]         :  195,
	[ZILLIQA]      :  313,
	[KUSAMA]       :  434,
	[FILECOIN]     :  461,
	[SOLANA]       :  501,
	[BINANCE_BSC]  :  714,
	[POLYGON]      :  966,	
	[TEZOS]        : 1729,
	[CARDANO]      : 1815,
	[AVALANCHE]    : 9000
}; // COIN_TYPES

const FAUCET_URLs = {
    [NULL_COIN]  : "Null-URL",	
	[ETHEREUM]   : "https://mumbaifaucet.com/",
	[BITCOIN]    : "https://coinfaucet.eu/en/btc-testnet/",
//	[BINANCE_BSC]    : "Null-URL",
	[SOLANA]     : "https://solfaucet.com/",
	[CARDANO]    : "https://docs.cardano.org/cardano-testnet/tools/faucet/",
	[STELLAR]    : "Null-URL",
	[RIPPLE]     : "Null-URL",	
	[BINANCE_BSC]: "Null-URL",
	[AVALANCHE]  : "Null-URL",
	[DOGECOIN]   : "https://testnet-faucet.com/doge-testnet/",
	[TRON]       : "Null-URL",
	[LITECOIN]   : "https://testnet-faucet.com/ltc-testnet/",
	[ZCASH]      : "Null-URL",
	[DASH]       : "Null-URL"
}; // FAUCET_URLs

const MAINNET_EXPLORER_URLs = {	
	[NULL_COIN]:    "Null-URL",
    [ETHEREUM]:     "https://etherscan.io/address/",
	[BITCOIN]:      "https://www.blockchain.com/explorer/addresses/btc/",	
	[SOLANA]:       "https://explorer.solana.com/address/",
	[CARDANO]:      "https://blockchair.com/fr/cardano/address/",
	[STELLAR]:      "https://stellar.expert/explorer/public/account/",
	[BINANCE_BSC]:  "https://bscscan.com/address/",
	[AVALANCHE]:    "https://snowtrace.io/address/",
	[DOGECOIN]:     "https://dogechain.info/address/",
	[TRON]:         "https://tronscan.org/#/address/",
	[RIPPLE]:       "https://livenet.xrpl.org/accounts/",
	[BITCOIN_CASH]: "Null-URL",
	[FIRO]:         "https://explorer.firo.org/address/",
	[ZCASH]:        "Null-URL",
	[LITECOIN]:     "https://live.blockcypher.com/ltc/address/",
	[DASH]:         "https://explorer.dash.org/insight/address/"
}; // MAINNET_EXPLORER_URLs