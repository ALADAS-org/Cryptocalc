// ========================================================================================
// ==================================    proto_SUI.js    ==================================
// ========================================================================================
"use strict";

const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { fromB64 } = require('@mysten/bcs');
const { getSuiAddress } = require('@mysten/sui.js/utils');

// Generate a new Ed25519 keypair
const keypair = new Ed25519Keypair();

// Extract private and public key (Base64 encoded)
const privateKeyBase64 = keypair.export().privateKey;
const publicKeyBase64  = keypair.getPublicKey().toBase64();

// Derive address from public key
const address = keypair.getPublicKey().toSuiAddress();

// Output everything
console.log('✅ New Sui Wallet Generated:');
console.log('Address:', address);
console.log('Public Key (Base64):', publicKeyBase64);
console.log('Private Key (Base64):', privateKeyBase64);