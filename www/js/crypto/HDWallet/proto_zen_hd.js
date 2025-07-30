// =====================================================================================
// ===============================    proto_zen_hd.js    ===============================
// =====================================================================================
"use strict";

const bitcoin = require('bitcoinjs-lib');

// ZEN network parameters (verify these are correct for ZEN mainnet)
const zencashNetwork = {
  messagePrefix: '\x18Zencash Signed Message:\n',
  bech32: 'zencash', // or 'zn' based on ZEN's bech32 prefix
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x3a, // address prefix for ZEN
  scriptHash: 0x7a,
  wif: 0xb0, // WIF prefix for ZEN mainnet (verify if needed)
};

// Your WIF private key
const wif = 'TASAPFFXED9M5odZvSmGuj1uV3PpBN3JmJiU7yZfzuUhmJqadmBQ';

// Decode the WIF to get key pair
const keyPair = bitcoin.ECPair.fromWIF(wif, zencashNetwork);

// Generate the address
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: zencashNetwork });

console.log('Derived Address:', address);