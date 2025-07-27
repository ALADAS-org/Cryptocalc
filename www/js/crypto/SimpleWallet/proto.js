// ====================================================================================
// ==================================    proto.js    ==================================
// ====================================================================================
"use strict";

const bitcoin = require('bitcoinjs-lib');

const bitcore      = require('bitcore-lib-cash');
const { encode }   = require('cashaddrjs');
const bchaddr      = require('bchaddrjs');

const crypto       = require('crypto');
const sha256       = require('js-sha256');
let { bech32, bech32m } = require('bech32');

const { hexToB58 } = require('../base58_utils.js');

const ripemd160 = (data) => {
  return crypto.createHash('ripemd160').update(data).digest('hex');
} // ripemd160

// const bitcore  = require('bitcore-lib');
const cashaddr = require('cashaddrjs');


// Generate a new random private key
const privateKey = new bitcore.PrivateKey('fa897fff329f4ef0fb512c288d28a0ff34289280616c4e94cd94899c59ab16f9');
// const privateKey = 'fa897fff329f4ef0fb512c288d28a0ff34289280616c4e94cd94899c59ab16f9';

// Get the WIF (Wallet Import Format) version of the private key
const privateKeyWIF = privateKey.toWIF();

// Derive the public key
const publicKey = privateKey.toPublicKey();

// Create a public key hash (P2PKH address)
const address = new bitcore.Address(publicKey, bitcore.Networks.livenet);

// Convert to CashAddr format and replace prefix
const cashAddr   = address.toString();
console.log('cashAddr:             ' + cashAddr);

const xecAddress = cashAddr.replace('bitcoincash:', 'ecash:');

console.log('Private Key (WIF):    ' + privateKeyWIF);
console.log('Public Key:           ' +  publicKey.toString() + "  " + publicKey.toString().length/2 + " bytes");

let sha256_value = sha256(publicKey.toString());
console.log('sha256_value:         ' +  sha256_value + "  " + sha256_value.length/2 + " bytes");

// Public Key Hash 20 bytes
let pkh = ripemd160(sha256_value);
console.log('pkh:                  ' +  pkh + "  " + pkh.length/2 + " bytes");

// Version + PKH = 0x00 + [20-byte PKH]
let version_pkh = '0x00' + pkh;
console.log('version_pkh:          ' +  version_pkh + "  " + version_pkh.replace('0x','').length/2 + " bytes");

// Checksum = First 4 bytes of SHA-256(SHA-256(Version + PKH))
let checksum = sha256(sha256(version_pkh)).substring(0,8);
console.log('checksum:             ' +  checksum + "  " + checksum.length/2 + " bytes");

// version_pkh + checksum
let version_pkh_checksum = (version_pkh + checksum).replace('0x','');
console.log('version_pkh_checksum: ' +  version_pkh_checksum);

// Legacy eCash Address = Base58Encode(Version + PKH + Checksum)
let legacy_address = hexToB58(version_pkh_checksum);
console.log('legacy_address:       ' +  legacy_address);

// toWords etc. are available on both bech32 and bech32m objects
let words = bech32.toWords(Buffer.from(version_pkh_checksum, 'hex'))
let ecash_address = bech32.encode('ecash:', words);
console.log('ecash_address:         ' +  ecash_address);

let XEC_address = pubKeyToECashAddress(publicKey.toString());
console.log('XEC_address:           ' +  XEC_address);


console.log('===============');
const {
    encodeCashAddress,
    decodeCashAddress,
    isValidCashAddress,
    getOutputScriptFromAddress,
} = require('ecashaddrjs');

const bitcoincashAddress =  cashAddr;  
	         // 'bitcoincash:qz0l74lasdwn6xrqx4an0ltrq93cqphg6cl5ntrclr';
			 
console.log('bitcoincashAddress: ' + bitcoincashAddress); // 'bitcoincash'
			 
	// 'bitcoincash:qpadrekpz6gjd8w0zfedmtqyld0r2j4qmuj6vnmhp6';
const { prefix, type, hash } = decodeCashAddress(bitcoincashAddress);

console.log('prefix: ' + prefix); // 'bitcoincash'
console.log('type:   ' + type);   // 'p2pkh'
console.log('type:   ' + hash);   // '7ad1e6c11691269dcf1272ddac04fb5e354aa0df'
console.log(encodeCashAddress('ecash', type, hash));

// 'ecash:qpadrekpz6gjd8w0zfedmtqyld0r2j4qmuthccqd8d'
console.log(isValidCashAddress(bitcoincashAddress)); // true
console.log(isValidCashAddress(bitcoincashAddress), 'bitcoincash'); // true
console.log(isValidCashAddress(bitcoincashAddress), 'ecash'); // false

console.log('===============');

// Example: Derive eCash address from a public key
function pubKeyToECashAddress(publicKeyHex) {
    // Step 1: Compute Public Key Hash (PKH) = RIPEMD160(SHA256(publicKey))
    const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');
    const sha256Hash = bitcoin.crypto.sha256(publicKeyBuffer);
    const pkh = bitcoin.crypto.ripemd160(sha256Hash); // 20-byte PKH
	
	// Checksum = First 4 bytes of SHA-256(SHA-256(Version + PKH))
	let checksum = sha256(sha256(version_pkh)).substring(0,8);
	console.log('checksum:             ' +  checksum + "  " + checksum.length/2 + " bytes");

    // Step 2: Prepare CashAddr payload (prefix + type + PKH)
    const prefix = 'ecash'; // Mainnet prefix
    const type   = 0x00;     // P2PKH type
	
	let version_pkh_checksum = '0x00' + pkh + checksum;

    // Step 4: Compute Bech32 checksum and encode
    const address = bech32.encode(version_pkh_checksum);

    return address;
} // pubKeyToECashAddress

// Function to get XEC address from WIF
function getXecAddressFromWif(wif) {
    try {
		console.log('FromWif(wif):       ' + wif);
		
        // Create a private key object from WIF
        const privateKey = bitcore.PrivateKey.fromWIF(wif);
        
        // Derive the public key
        const publicKey = privateKey.toPublicKey();
        
        // Generate the XEC address (cashaddr format with 'ecash' prefix)
        const address = publicKey.toAddress('mainnet').toString(bitcore.Address.CashAddrFormat);
        
        return address;
    } catch (error) {
        throw new Error('Invalid WIF: ' + error.message);
    }
}

// Function to generate an XEC wallet address
function generateXecWallet() {
    // Generate a new private key
    const privateKey = new bitcore.PrivateKey();
	console.log('privateKey:   ' + privateKey);
    
    // Derive the corresponding public key
    const publicKey = privateKey.toPublicKey();
    
    // Generate the XEC address (cashaddr format with 'ecash' prefix)
    const address = publicKey.toAddress('mainnet').toString(bitcore.Address.CashAddrFormat);
	
	console.log('XEC WIF 1:   ' + privateKey.toWIF());
	console.log('1 address:   ' + address);
    
    // Return the private key (in WIF format) and address
    return {
        privateKey: privateKey.toWIF(),
        address: address
    };
}

// Generate and log the wallet details
let wif2 = "";
try {
    const wallet = generateXecWallet();
    console.log('XEC Wallet Address:', wallet.address);
    console.log('Private Key (WIF 2):', wallet.privateKey);
	wif2 = wallet.privateKey;
} catch (error) {
    console.error('Error generating wallet:', error.message);
}

// Example usage
const wif = wif2; // Replace with your WIF
try {
    const address = getXecAddressFromWif(wif);
    console.log('XEC Wallet Address:', address);
} catch (error) {
    console.error('Error:', error.message);
}

console.log('===============');
function bchWifToEcashAddress(wif) {
    try {
        // Decode the Bitcoin Cash WIF private key
        const privateKey = bitcore.PrivateKey.fromWIF(wif);

        // Derive the public key
        const publicKey = privateKey.toPublicKey();

        // Get the public key hash (RIPEMD160(SHA256(publicKey)))
        const publicKeyHash = bitcore.crypto.Hash.sha256ripemd160(publicKey.toBuffer());

        // Create eCash address (P2PKH, mainnet)
        const address = ecashaddr.toCashAddress({
            prefix:   'ecash',
            type:     'P2PKH',
            hash:     publicKeyHash,
            network: 'mainnet'
        });

        return address;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

function bitcoinToEcashAddress(btcAddress) {
    try {
        let publicKeyHash, type, network;

        // Decode Bitcoin address (legacy or Bech32)
        // const address = bitcore.Address.fromString(btcAddress, 'livenet');
		const address = bitcore.Address.fromString(btcAddress, 'mainnet');
        publicKeyHash = address.hashBuffer;
        type = address.type === bitcore.Address.PayToPublicKeyHash ? 'P2PKH' : 'P2SH';
        network = 'mainnet';

        // Handle Bech32 (P2WPKH) to P2PKH conversion
        if (address.isPayToWitnessPublicKeyHash) {
            type = 'P2PKH'; // Convert P2WPKH to P2PKH for eCash
        }

        // Validate hash length (20 bytes for P2PKH/P2SH)
        if (publicKeyHash.length !== 20) {
            throw new Error('Unsupported hash length (e.g., P2WSH not supported)');
        }

        // Prepare payload
        const versionByte = type === 'P2PKH' ? 0x00 : 0x08; // P2PKH: 0x00, P2SH: 0x08
        const payload = Buffer.concat([Buffer.from([versionByte]), publicKeyHash]);

        // Convert prefix to 5-bit groups
        const prefix = 'ecash';
        const prefixBits = [];
        for (let i = 0; i < prefix.length; i++) {
            const charCode = prefix.charCodeAt(i);
            prefixBits.push(charCode & 0x1F); // Lower 5 bits
        }
        prefixBits.push(0); // Separator

        // Convert payload to 5-bit groups
        const payloadBits = [];
        for (let byte of payload) {
            payloadBits.push((byte >> 3) & 0x1F);
            payloadBits.push(byte & 0x1F);
        }

        // Append 8 zero bytes for checksum
        const checksumData = Buffer.concat([
            Buffer.from(prefixBits),
            Buffer.from(payloadBits),
            Buffer.alloc(8, 0)
        ]);

        // Calculate checksum using cashaddrjs polymod
        const checksum = cashaddr.polymod(checksumData);
        const checksumBits = [];
        for (let i = 0; i < 8; i++) {
            checksumBits.push((checksum >> (5 * (7 - i))) & 0x1F);
        }

        // Encode payload and checksum to base32
        const base32Alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
        let encoded = '';
        for (let bit of payloadBits.concat(checksumBits)) {
            encoded += base32Alphabet[bit];
        }

        return `ecash:${encoded}`;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

function bchToEcashAddress(bchAddress) {
    try {
        let publicKeyHash, type, network;
		
		console.log('bchAddress:', bchAddress);

        // Check if the address is legacy (Base58) or CashAddr
        if (bchAddress.startsWith('bitcoincash:') || /^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42}$/.test(bchAddress)) {
            // Handle CashAddr
			console.log('Handle CashAddr:', bchAddress);
            const addr = bchAddress.startsWith('bitcoincash:') ? bchAddress : `bitcoincash:${bchAddress}`;
			console.log('addr:          ', addr);
			
			console.log('isValidAddress(addr):', bchaddr.isValidAddress(addr));
			
			console.log('cash   address:', bchaddr.toCashAddress(addr));
			console.log('legacy address:', bchaddr.toLegacyAddress(addr));
			
			let ecash_address = bitcoinToEcashAddress(bchaddr.toLegacyAddress(addr));
			console.log('ecash address: ', ecash_address);
			
			console.log('bitpay address:', bchaddr.toBitpayAddress(addr));

            const { type: decodedType, hash, network: decodedNetwork } = bchaddr.decode(addr);
			console.log('type:', decodedType);
			console.log('network:', decodedNetwork);
            publicKeyHash = hash;
            type    = decodedType;    // e.g., P2PKH or P2SH
            network = decodedNetwork; // mainnet or testnet
			network = 'mainnet';      // mainnet or testnet
        } else {
            // Handle legacy address
            const address = bitcore.Address.fromString(bchAddress, 'livenet'); //: 'livenet');
            publicKeyHash = address.hashBuffer;
            type = address.type === bitcore.Address.PayToPublicKeyHash ? 'P2PKH' : 'P2SH';
            network = 'mainnet';
        }
		
		console.log('type:', type);
		console.log('network:', network);

        // Encode as eCash address
        const ecashAddress = bchaddrjs.encode('ecash', type, publicKeyHash, network);

        return ecashAddress;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// Example usage
const bchAddress = 'bitcoincash:qpx76qym3fah42m67dyp56mw0yl7jnc74uc2epnv6y'; // Example BCH CashAddr
const ecashAddress = bchToEcashAddress(bchAddress);
console.log('eCash Address:', ecashAddress);