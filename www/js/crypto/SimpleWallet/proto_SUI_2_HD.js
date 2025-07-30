// =======================================================================================
// ===============================    proto_SUI_2_HD.js    ===============================
// =======================================================================================
"use strict";

// OK on 'Suiet' (Sui wallet) Chrome extension 

const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { mnemonicToSeedSync, generateMnemonic } = require('bip39');
const { derivePath } = require('ed25519-hd-key');

// Sui derivation path (BIP-44): m/44'/784'/0'/0'/0'
let account_info       = "0'";
let address_index_info = "0'";
const DERIVATION_PATH  = "m/44'/784'/" + account_info + "/0'/" + address_index_info;

// Step 1: Generate a mnemonic
const mnemonic = generateMnemonic();
console.log('🧠 Mnemonic:', mnemonic);

// Step 2: Derive seed and private key
const seed = mnemonicToSeedSync(mnemonic); // returns Buffer
const { key } = derivePath(DERIVATION_PATH, seed.toString('hex')); // key = private key

// Step 3: Create the Sui Ed25519 keypair from private key
const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(key));
const address = keypair.getPublicKey().toSuiAddress();

// Output results
console.log('\n✅ Wallet from Mnemonic:');
console.log('Address:', address);
console.log('Public Key (Base64):', keypair.getPublicKey().toBase64());
console.log('Private Key (Base64):', keypair.export().privateKey);