// ====================================================================================
// ================================   proto_keypair.js  ===============================
// ====================================================================================
"use strict";

const bip39    = require('bip39');
const crypto   = require('crypto');
const elliptic = require('elliptic');

function generateKeyPairFromMnemonic( mnemonic ) {
  // Derive a seed from the mnemonic phrase
  const seed = bip39.mnemonicToSeedSync( mnemonic );

  // Create an elliptic curve key pair
  const ec = new elliptic.ec('secp256k1');
  const keyPair = ec.genKeyPair({
    entropy: seed.slice(0, 32), // Take the first 32 bytes of the seed for entropy
  });

  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey:  keyPair.getPublic('hex'),
  };
}

// Example usage
const mnemonic    = 'adult south retreat sunny useless candy try enforce they cage motion visa train come panda artwork surprise swarm cruel shield humble leisure vendor hub';
const keyPair     = generateKeyPairFromMnemonic(mnemonic);
const ltc_address = 'LPnfYnRUkCHkU349crNRQ6ggVoATsKYMzU';
console.log('mnemonic:',    mnemonic);
console.log('Private Key:', keyPair.privateKey);
console.log('ltc_address:', ltc_address)
//console.log('Public Key:',  keyPair.publicKey);