// uuid: 8db243b7-7c3d-4c5c-9c9a-5f3e9b1d2a4f
// www/js/api/routes/wallet.js

const express = require('express');
const router = express.Router();
const path = require('path');

// Path resolution: __dirname is www/js/api/routes/
const jsRoot = path.join(__dirname, '..', '..');
const cryptoPath = path.join(jsRoot, 'crypto');

let CryptoServices, SimpleWallet;
let BITCOIN, DOGECOIN, LITECOIN, TERRA_LUNA;
let ADDRESS, PRIVATE_KEY, BLOCKCHAIN, MNEMONICS;
let ALLOWED_BLOCKCHAINS = {};

try {
    // Modules loading
    CryptoServices = require(path.join(cryptoPath, 'crypto_services.js')).CryptoServices;
    SimpleWallet = require(path.join(cryptoPath, 'SimpleWallet', 'simple_wallet.js')).SimpleWallet;
    
    // Load Blockchain constants from the correct location
    const BC = require(path.join(cryptoPath, 'const_blockchains.js'));
    
    // Map keys (from URL params) to actual blockchain names (values of constants)
    // Using the uppercase version of the parameter as the key
    ALLOWED_BLOCKCHAINS = {
        'BITCOIN': BC.BITCOIN,
        'ETHEREUM': BC.ETHEREUM,
        'DOGECOIN': BC.DOGECOIN,
        'LITECOIN': BC.LITECOIN,
        'SOLANA': BC.SOLANA,
        'AVALANCHE': BC.AVALANCHE,
        'POLYGON': BC.POLYGON,
        'TON': BC.TON,
        'TONCOIN': BC.TON,       // Alias for TonCoin variation
        'TERRA': BC.TERRA_LUNA,  // Alias for Terra variation
        'TERRA_LUNA': BC.TERRA_LUNA
    }; // ALLOWED_BLOCKCHAINS mapping

    // Reference specific constants for WIF logic
    BITCOIN = BC.BITCOIN;
    DOGECOIN = BC.DOGECOIN;
    LITECOIN = BC.LITECOIN;
    TERRA_LUNA = BC.TERRA_LUNA;
    
    // Load Wallet and Keyword constants
    const walletConsts = require(path.join(cryptoPath, 'const_wallet.js'));
    ADDRESS = walletConsts.ADDRESS;
    PRIVATE_KEY = walletConsts.PRIVATE_KEY;
    
    const keywords = require(path.join(jsRoot, 'const_keywords.js'));
    BLOCKCHAIN = keywords.BLOCKCHAIN;
    MNEMONICS = keywords.MNEMONICS;
    
    console.log("✅ Wallet API routes initialized with allowed blockchains");
} catch (error) {
    console.error('❌ Error loading crypto modules:', error.message);
} // try-catch end

/**
 * GET /api/wallet/:coin/json
 * Dynamic route to generate simple wallets based on entropy
 */
router.get('/:coin/json', async (req, res) => {
    try {
        const coinParam = req.params.coin.toUpperCase();
        const entropy = req.query.entropy;
        const net = req.query.net || "mainnet";

        if (!entropy) {
            return res.status(400).json({ 
                success: false, 
                error: "Entropy is required as a query parameter." 
            });
        } // end if entropy missing

        // Resolve the target blockchain name from the allowed list
        const targetBlockchain = ALLOWED_BLOCKCHAINS[coinParam];

        if (!targetBlockchain) {
            return res.status(404).json({
                success: false,
                error: `Blockchain '${coinParam}' not supported.`,
                supported: Object.keys(ALLOWED_BLOCKCHAINS)
            });
        } // end if not supported

        const uuid = CryptoServices.This.getUUID();
        const walletData = await SimpleWallet.GetWallet(entropy, uuid, targetBlockchain, net);

        // WIF Logic: Protected to avoid length errors on non-UTXO chains (SOL/TON/ETH)
        let wif = null;
        const needsWIF = [BITCOIN, DOGECOIN, LITECOIN, TERRA_LUNA].includes(targetBlockchain);

        if (needsWIF && walletData[PRIVATE_KEY]) {
            try {
                wif = CryptoServices.This.pk2WIF(walletData[PRIVATE_KEY], targetBlockchain);
            } catch (e) {
                console.warn(`⚠️ WIF conversion skipped for ${targetBlockchain}`);
            } // end try WIF
        } // end if needsWIF

        res.json({
            success: true,
            data: {
                address: walletData[ADDRESS],
                privateKeyWIF: wif,
                privateKey: walletData[PRIVATE_KEY],
                mnemonics: walletData[MNEMONICS],
                blockchain: walletData[BLOCKCHAIN] || targetBlockchain,
                network: net,
                uuid: uuid
            }
        }); // end response json
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } // try-catch end
}); // GET /:coin/json block

module.exports = router; // router export