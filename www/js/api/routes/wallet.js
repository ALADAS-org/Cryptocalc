// uuid: 8db243b7-7c3d-4c5c-9c9a-5f3e9b1d2a4f
// www/js/api/routes/wallet.js

const express = require('express');
const router = express.Router();
const path = require('path');

// Path resolution: __dirname is www/js/api/routes/
const jsRoot = path.join(__dirname, '..', '..');
const cryptoPath = path.join(jsRoot, 'crypto');

let CryptoServices, SimpleWallet, HDWallet;
let BITCOIN, DOGECOIN, LITECOIN, TERRA_LUNA, ETHEREUM;
let ADDRESS, PRIVATE_KEY, BLOCKCHAIN, MNEMONICS;
let ALLOWED_BLOCKCHAINS = {};

try {
    // Modules loading
    CryptoServices = require(path.join(cryptoPath, 'crypto_services.js')).CryptoServices;
    SimpleWallet = require(path.join(cryptoPath, 'SimpleWallet', 'simple_wallet.js')).SimpleWallet;
    HDWallet = require(path.join(cryptoPath, 'HDWallet', 'hd_wallet.js')).HDWallet;
    
    // Load Blockchain constants
    const BC = require(path.join(cryptoPath, 'const_blockchains.js'));
    BITCOIN    = BC.BITCOIN;
    DOGECOIN   = BC.DOGECOIN;
    LITECOIN   = BC.LITECOIN;
    TERRA_LUNA = BC.TERRA_LUNA;
    ETHEREUM   = BC.ETHEREUM;
	SOLANA     = BC.SOLANA;

    ADDRESS = BC.ADDRESS || 'address';
    PRIVATE_KEY = BC.PRIVATE_KEY || 'privateKey';
    BLOCKCHAIN = BC.BLOCKCHAIN || 'blockchain';
    MNEMONICS = BC.MNEMONICS || 'mnemonics';
    
    ALLOWED_BLOCKCHAINS = {
        'BITCOIN': BC.BITCOIN,
        'ETHEREUM': BC.ETHEREUM,
        'DOGECOIN': BC.DOGECOIN,
        'LITECOIN': BC.LITECOIN,
        'SOLANA':  BC.SOLANA,
        'AVALANCHE': BC.AVALANCHE,
        'POLYGON': BC.POLYGON,
        'TONCOIN': BC.TONCOIN,
        'TERRA': BC.TERRA_LUNA,
        'BINANCE_BSC': BC.BINANCE_BSC
    }; // end ALLOWED_BLOCKCHAINS block

} catch (error) {
    console.error(`[Wallet Route] Initialization error: ${error.message}`);
} // end try-catch block

/**
 * Route for HD Wallet generation (BIP32/BIP44)
 */
router.get('/hd/:coin/json', async (req, res) => {
    try {
        const { coin } = req.params;
        const { entropy, accountIndex = 0, addressIndex = 0, changeIndex = 0, network = 'mainnet' } = req.query;

        if (!entropy) {
            return res.status(400).json({ success: false, error: 'Entropy is required' });
        } // end if entropy

        const targetBlockchain = ALLOWED_BLOCKCHAINS[coin.toUpperCase()];
        if (!targetBlockchain) {
            return res.status(400).json({ 
                success: false, 
                error: `Blockchain ${coin} not supported.`,
                supported: Object.keys(ALLOWED_BLOCKCHAINS)
            });
        } // end if target

        const uuid = CryptoServices.This.getUUID();
        const net = network === 'testnet' ? 'testnet' : 'mainnet';

        // HD Wallet derivation
        const walletData = await HDWallet.GetWallet(entropy, uuid, targetBlockchain, net, accountIndex, addressIndex, changeIndex);

        let wif = null;
        const needsWIF = [BITCOIN, DOGECOIN, LITECOIN, TERRA_LUNA].includes(targetBlockchain);
        if (needsWIF && walletData[PRIVATE_KEY]) {
            try {
                wif = CryptoServices.This.pk2WIF(walletData[PRIVATE_KEY], targetBlockchain);
            } catch (e) {
                console.warn(`WIF conversion failed for ${targetBlockchain}`);
            } // end try WIF
        } // end if needsWIF

        const coinType = getCoinType(targetBlockchain);
        const derivationPath = `m/44'/${coinType}'/${accountIndex}'/${changeIndex}/${addressIndex}`;

        res.json({
            success: true,
            data: {
                address: walletData[ADDRESS],
                privateKeyWIF: wif,
                privateKey: walletData[PRIVATE_KEY],
                mnemonics: walletData[MNEMONICS],
                blockchain: walletData[BLOCKCHAIN] || targetBlockchain,
                network: net,
                uuid: uuid,
                derivationPath: derivationPath,
                accountIndex: accountIndex,
                addressIndex: addressIndex,
                changeIndex: changeIndex
            }
        }); // end res.json
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } // end try-catch
}); // end GET /hd/:coin/json

/**
 * Helper function to get BIP44 coin type
 */
function getCoinType(blockchain) {
    // We use the values directly or the constants if they are in scope
    const coinTypes = {
        [BITCOIN]: 0,
        [ETHEREUM]: 60,
        [DOGECOIN]: 3,
        [LITECOIN]: 2,
        'SOLANA': 501,
        'AVALANCHE': 9000,
        'POLYGON': 966,
        'TON': 607,
        'TERRA': 330
    };
    return coinTypes[blockchain] || 0;
} // end getCoinType block

module.exports = router;