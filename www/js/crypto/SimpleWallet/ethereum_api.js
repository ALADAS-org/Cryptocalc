// =====================================================================================
// ================================== ethereum_api.js ==================================
// =====================================================================================
"use strict";

// Generates Ethereum blockchain address

// ========== Test ajout sur Guarda.com (2024/01/02) ==========
// Test sur MEW (myetherwallet.com)
// OK: avec Private Key en hexadécimal => adresse wallet OK  
// OK: avec Seedphrase 24 mots => 
//     série de wallets, ***** le 1er est le même que celui reconnu dans Guarda ****
//     * PK:         0x10fb87a84c1b4f41975da16a0315387a914616851e36d9dbf81435dd1d1e0f5c
//     * Seedphrase: axis switch tube oblige reject patch frost reflect head board evoke vivid behave area behave short supply thank agree hill spike monitor dice mesh
//       PK 4 12 mnemonics: 10fb87a84c1b4f41975da16a0315387a
//                          axis switch tube oblige reject patch frost reflect head board evoke vintage
//     * wallet:     0xf90ff675c81027c9bed1ebea2da386df6a7d0cf2
//     => ??? est ce que mnémonique est considéré comme "clé maitre" 
//            et que les wallets proposés en sont dérivés ("derivationPath") 
//
// Test sur Guarda.com
// OK: avec Private Key en hexadécimal (avec et sans préfixe '0x') 
// **** KO: avec Private Key en Base64
//                            **ERREUR sur Checksum (dernier mnémonique)**
// **** KO: avec Mnémoniques (adresse erronée):  
//      Après verification, cela semble être un bug Guarda car:
//      1. La conversion des Mnémoniques en PK_B64 ("Tool/Mnemonics to PK") => même valeur que dans '00_wallet_info.txt' 
//      2. La PK_B64 convertie en Hexa == 'seed_sha256_hex' (fournie en entrée) 
//         et                          == 'Private Key(Hex)' dans '00_wallet_info.txt' 

// https://levelup.gitconnected.com/generate-ethereum-address-using-node-js-a6a73f42a4cf
// https://www.npmjs.com/package/ethereumjs-wallet
const fs              = require("fs");
const Wallet          = require("ethereumjs-wallet").default; // NB: garder cette syntaxe précise
const EthUtil         = require("ethereumjs-util");
const eip55           = require("eip55"); // Mixedcase Checksum in Wallet address

// https://ethereum.stackexchange.com/questions/50294/typeerror-web3-is-not-a-constructor-when-trying-to-use-node-js-with-truffle-con
// NB: replaces 'web3'
const { Web3 }        = require('web3'); // for Sepolia (Ethereum testnet)
const { Base64 }      = require('js-base64');	

const { _RED_, _CYAN_, _PURPLE_, 
        _YELLOW_, _END_ }             = require('../../util/color/color_console_codes.js');

const { NULL_COIN, 
        ETHEREUM, 
		MAINNET, TESTNET
	  }                               = require('../const_blockchains.js');
	  
const { NULL_HEX, NULL_NET, NULL_UUID,
        NULL_ADDRESS, CRYPTO_NET,
        PRIVATE_KEY, PUBLIC_KEY_HEX,        
		ADDRESS }                     = require('../const_wallet.js'); 
		
const { BLOCKCHAIN, NULL_BLOCKCHAIN,
        UUID, MNEMONICS, WORD_COUNT 
      }                               = require('../../const_keywords.js'); 
		
const { stringify }                   = require('../../util/values/string_utils.js');	 
const { hexWithPrefix, hexWithoutPrefix,
        hexToBytes, hexToUint8Array } = require('../hex_utils.js'); 

const { Bip39Utils }                  = require('../bip39_utils.js');  

class Ethereum_API {
    static GetWallet( private_key, salt_uuid, blockchain, crypto_net ) {
		console.log(">> " + _CYAN_ + "Ethereum_API.GetWallet " + _END_ + crypto_net);
		if ( crypto_net == undefined ) {
			crypto_net = MAINNET;
		}
		console.log("   private_key: " + private_key);
			
		let new_wallet = Ethereum_API.InitializeWallet();
			
		if ( private_key == undefined ) {
			console.log(">> BlockchainWallet.GetWallet  **ERROR** private_key: " + seed_SHA256_hex);			
			return new_wallet;
		}

		//----- Validité des adresses générées testées avec:
		// https://github.com/Swyftx/crypto-address-validator -----
						
		new_wallet[BLOCKCHAIN]  = ETHEREUM;
		new_wallet[CRYPTO_NET]  = crypto_net;
		new_wallet[UUID]        = salt_uuid;
		
		//========================= Ethereum =========================
		let ETH_address     = "";
		let ETH_private_key = "";
		let ETH_public_key  = "";				
		
		if (new_wallet[CRYPTO_NET] == TESTNET) {
			//====================  ETH TESTNET  ====================
			// Sepolia faucet: 
			// OK: https://faucets.pk910.de/ (POW utilise Carte graphique)
			// KO: Coinstack: inscription + 0,001 Eth (2,54$) de frais de transaction !!! 
			//     "A user's wallet must hold at least 0.001 ETH on Ethereum Mainnet to use the EVM faucets"
			// KO: Coinbase
			//     "The Base Görli faucet requires at least 0.005 ETH on Ethereum This helps us prevent bots
			//	    while preserving privacy. Transfer ETH to Ethereum on this address to use the faucet."
			const web3_sepolia = new Web3("https://rpc2.sepolia.org");
            // >> Sepolia (Eth testnet) wallet:
            // [{ "address":    "0x57b2046659302Dc596ee4a656a1Debf0f4A1599e",
		    //    "privateKey": "0x10fb87a84c1b4f41975da16a0315387a914616851e36d9dbf81435dd1d1e0f5c" }]
		
		    // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-accounts.html
		    let wallet = web3_sepolia.eth.accounts.wallet.add( hexWithPrefix( private_key ) );

		    //this is how we can access to the first account of the wallet
		    console.log('Sepolia (ETH testnet):');
			
			ETH_address = wallet[0].address;
		    console.log(">> ETH_address:\n"     + ETH_address);
			
			ETH_private_key = wallet[0].privateKey;
		    console.log(">> ETH_private_key:\n" + ETH_private_key);
			
			//---------- get ETH wallet public key ----------
			// https://ethereum.stackexchange.com/questions/12571/getting-an-address-from-ethereumjs-utils-ecrecover
			// NB: This is 'public key' for "ETH Mainnet" but indeed should be the same in Sepolia
			const private_key_buffer  = EthUtil.toBuffer( hexWithPrefix( private_key ) );
			let ETH_wallet    = Wallet.fromPrivateKey(private_key_buffer);
			console.log(">> Wallet address:\n"     + ETH_wallet.getAddressString());
		    ETH_public_key = ETH_wallet.getPublicKeyString();
			console.log(">> ETH_public_key:\n"  + ETH_public_key);
			//---------- get ETH wallet public key
		}
		else {
			//====================  ETH MAINNET  ====================
			//const eth_wallet = new ethers.Wallet(private_key);
			// https://piyopiyo.medium.com/generating-an-ethereum-wallet-with-an-existing-private-key-5cda690a8eb8
			//const eth_wallet = EthWallet.default.generate(private_key);
			const pk_buffer  = EthUtil.toBuffer( hexWithPrefix ( private_key ) );
			// https://ethereum.stackexchange.com/questions/96732/generating-an-ethereum-wallet-with-an-existing-private-key
			const eth_wallet = Wallet.fromPrivateKey( pk_buffer );
			
			// NB: Must keep "Mixed case Hex digits"
			ETH_address      = eth_wallet.getAddressString(); // toLowerCase();
			ETH_private_key  = eth_wallet.getPrivateKeyString();			
			ETH_public_key   = eth_wallet.getPublicKeyString();			
        }

        console.log(  ">> " + _CYAN_ + "ETH " + _END_ + "Private Key:\n   " + ETH_private_key);	
		
		//console.log(">> Ethereum Address: " + stringify(eth_wallet.getAddressString()));
		
		//console.log("input private_key:\n" + private_key);
		//console.log("eth_wallet:\n"  + stringify(eth_wallet));
		
		//---------- private key ----------
		new_wallet[PRIVATE_KEY] = private_key;
		//console.log("private_key:\n" + private_key);
		//---------- private key
		
		//---------- mnemonics ----------
	    let mnemonics = Bip39Utils.EntropyToMnemonics( private_key );
		new_wallet[MNEMONICS] = mnemonics;
		//---------- mnemonics
		
		//---------- public key ----------
		new_wallet[PUBLIC_KEY_HEX] = ETH_public_key;
		//---------- public key
			
		//----------Address ----------
		// Ethereum address is in Hexa
		new_wallet[ADDRESS] =  eip55.encode( hexWithPrefix( ETH_address.toLowerCase() ) );
		//console.log(">> getBlockchainWallet ** Ethereum address:\n" + new_wallet['address']);
		//---------- Address
		
		return new_wallet;
	} // Ethereum_API.GetWallet()
	
	static InitializeWallet() {
		let null_wallet = {}; 
		null_wallet[BLOCKCHAIN]      = NULL_BLOCKCHAIN;
		null_wallet[CRYPTO_NET]      = "Null-NET";
		null_wallet[UUID]            = "Null-UUID";
		null_wallet[PRIVATE_KEY] = NULL_HEX;
		null_wallet[PUBLIC_KEY_HEX]  = NULL_HEX;
		null_wallet[ADDRESS]         = "Null-ADDRESS";
		null_wallet[MNEMONICS]       = "Null-MNEMONICS";
		return null_wallet;
	} // Ethereum_API.InitializeWallet()
	
	static GetSepoliaWallet(seed_SHA256_hex) {
		// https://coinsbench.com/connecting-to-the-ethereum-testnet-using-only-web3-js-and-the-console-cffe0273b184
		
		const web3_sepolia = new Web3("https://rpc2.sepolia.org");
		let seed_hex =    '0x10fb87a84c1b4f41975da16a0315387a914616851e36d9dbf81435dd1d1e0f5c';
        // >> Sepolia (Eth testnet) wallet:
        // [{"address":    "0x57b2046659302Dc596ee4a656a1Debf0f4A1599e",
		//   "privateKey": "0x10fb87a84c1b4f41975da16a0315387a914616851e36d9dbf81435dd1d1e0f5c"}]
		
		// https://web3js.readthedocs.io/en/v1.2.11/web3-eth-accounts.html
		let wallet = web3_sepolia.eth.accounts.wallet.add(seed_hex);

		// this is how we can access to the first account of the wallet
		console.log('Sepolia (Eth testnet):');
		console.log("wallet[0].address:\n"    + wallet[0].address);
		console.log("wallet[0].privateKey:\n" + wallet[0].privateKey);
	} // Ethereum_API.GetSepoliaWallet()	
	
	static async GetWalletWithKeyStore(seed_SHA256_hex) {
		//const privateKeyString = '0x61ce8b95ca5fd6f55cd97ac60817777bdf64f1670e903758ce53efc32c3dffeb';
		//let seed_hex =    '0x10fb87a84c1b4f41975da16a0315387a914616851e36d9dbf81435dd1d1e0f5c';
		let seed_hex = '0xa7d196f340827bbdb0d091830f35bd9338c8c532a6afe8395804d52ae6490598';
		const privateKeyBuffer = EthUtil.toBuffer(seed_hex);
		const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
		const publicKey = wallet.getPublicKeyString();
		console.log(publicKey);
		const address = wallet.getAddressString();
		console.log(address);
		const keystoreFilename = wallet.getV3Filename();
		console.log(keystoreFilename);
		const keystore = await wallet.toV3("");
		console.log(keystore);
		
		let	filename = "keystore.json";
		//console.log("> frieze_text: \n" + frieze_text);
		fs.writeFileSync(  "./" + filename, stringify(keystore) );
	} // Ethereum_API.GetWalletWithKeyStore()	
} // Ethereum_API class

// Ethereum_API.GetWalletWithKeyStore()
// Ethereum_API.GetSepoliaWallet()
 
if (typeof exports === 'object') {
	exports.Ethereum_API = Ethereum_API
} // exports of 'ethereum_api.js'