// ========================================================================================
// ==================================    proto_SUI.js    ==================================
// ========================================================================================
"use strict";

const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { fromB64 } = require('@mysten/sui.js/utils');

async function generateWallet() {
    try {
        // Generate a new keypair
        const keypair = new Ed25519Keypair();
        
        // Get the private key (as a base64 string)
        const privateKey = keypair.export().privateKey;
        
        // Get the public key
        const publicKey = keypair.getPublicKey().toBase64();
        
        // Get the Sui address
        const address = keypair.toSuiAddress();
        
        console.log('Wallet generated successfully:');
        console.log('Private Key:', privateKey);
        console.log('Public Key:', publicKey);
        console.log('Sui Address:', address);
        
        return {
            privateKey,
            publicKey,
            address
        };
    } catch (error) {
        console.error('Error generating wallet:', error);
        throw error;
    }
}

// Execute the function
generateWallet();