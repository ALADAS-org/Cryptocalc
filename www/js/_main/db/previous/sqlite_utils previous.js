// ======================================================================================================================
// ================================================    sqlite_util.js    ================================================
// ======================================================================================================================
"use strict";

const Sqlite3 = require('better-sqlite3');
const bcrypt  = require('bcrypt');

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CRYPTOCALC_DB_LANGS =       [ "EN","DE","FR","ES","PT","IT","EO","LA","CS","RU","EL","SC","TC","JP","KO","HI","BN","GU" ];

const CRYPTOCALC_DB_COINS =       [ "BTC", "ETH",  "XRP", "BNB", "SOL", "DOGE", "TRX", "ADA", "XLM", "SUI", "BCH",
                                    "AVAX", "TON", "LTC", "ETC", "POL", "VET", "BSV", "DASH", "RVN", "ZEN", "LUNA", "FIRO" ];  
							  
const CRYPTOCALC_DB_BLOCKCHAINS = [ "Bitcoin", "Ethereum", "Ripple", "Binance Smart Chain", "Solana", "Dogecoin", "TRON", 
                                    "Cardano", "Stellar", "Sui", "Bitcoin Cash)", "Avalanche", "Toncoin", "Litecoin", "Ethereum Classic",
									"Polygon", "VeChain", "Bitcoin SV", "Dash", "Ravencoin", "Horizen", "Terra", "Firo" ];

class SqLiteUtils {
	static #Key           = Symbol();
	static #Singleton     = new SqLiteUtils( this.#Key );
	static #InstanceCount = 0;
	
	static get This() {
		if ( SqLiteUtils.#Singleton == undefined ) {
			this.#Singleton = new SqLiteUtils( this.#Key );
			if ( this.#InstanceCount > 0 ) {
				throw new TypeError("'SqLiteUtils' constructor called more than once");
			}
			this.#InstanceCount++;
        }
        return SqLiteUtils.#Singleton;
    } // SqLiteUtils 'This' getter

    // ** Private constructor **
	constructor( key ) {
		if ( key !== SqLiteUtils.#Key ) {
			throw new TypeError("'SqLiteUtils' constructor is private");
		}
		
		this.local_app_data_path = process.env.LOCALAPPDATA;
		// console.log('   Chemin LOCALAPPDATA: ' + this.local_app_data_path);
		
		this.app_folder_path = path.join( this.local_app_data_path, 'Aladas-org/Cryptocalc');
		
		// Créer le dossier (ne fait rien s'il existe)
		if ( ! fs.existsSync( this.app_folder_path ) ) {		
			fs.mkdirSync( this.app_folder_path, { recursive: true } );
		}
		
		this.db_obj       = undefined;
		this.db_file_path = '';
		
		this.initialize();
	} // ** Private constructor **
	
	initialize() {
		this.db_file_path = path.join( this.app_folder_path, 'Cryptocalc.db');
			
		if ( this.existsFileSync( this.db_file_path ) ) {
			// console.log('   file already created: ' + this.db_file_path);
		}
		else {
			console.log('   Create File: ' + this.db_file_path);				
			fs.writeFileSync( this.db_file_path, '' );
			console.log('✅ Fichier DB créé: ' + this.db_file_path);
		}
		
		// this.db_obj = new Sqlite3( this.db_file_path, { verbose: console.log });
		this.db_obj = new Sqlite3( this.db_file_path );
		this.db_obj.pragma('journal_mode = WAL');
		
		// ACTIVER les clés étrangères
		this.db_obj.exec('PRAGMA foreign_keys = ON', (err) => {
			if (err) {
				console.error('Erreur activation Foreign Keys:', err);
			} else {
				console.log('✅ Clés étrangères activées');
			}
		});
			
						
		this.initSchema();
		
		// const tables = this.db_obj.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
		// console.log('All tables:', tables);
		
		this.initDB();
	} // initialize()

	initDB() {
		console.error('> SqLiteUtils.initDB');
		
		let create_table = undefined;
		let insert       = undefined;
		
		try {			
			this.initAdminUser();
			
			//                + "( name, version, time_stamp, wallet_mode, blockchain, coin, entropy, entropy_size, " 
			//                + "  wallet_address, bc_explorer_url, private_key, bip38_passphrase, bip38_encrypted_pk,"
			//                + "  wif, secret_phrase, word_indexes, bip32_passphrase, derivation_path, account, address_index, lang  )"
			
			// -------------------- 'WALLET_MODE' Table --------------------
			create_table = this.db_obj.prepare
				           (  'CREATE TABLE IF NOT EXISTS  WALLET  ('
					       +  '   id                 INTEGER  PRIMARY KEY  AUTOINCREMENT,'	
						   
					       +  '   name               TEXT,'
						   +  '   version            VARCHAR(10),'
						   +  '   time_stamp         TIMESTAMP,'
						   
						   +  '   wallet_mode        VARCHAR(15),'						   
						   +  '   blockchain         TEXT,'
						   +  '   coin               VARCHAR(7),'	
						   
                           +  '   entropy            TEXT,'
						   +  '   entropy_size       INTEGER,'	
						   
						   +  '   wallet_address     TEXT,'
						   +  '   bc_explorer_url    TEXT,'
						   
						   +  '   private_key        TEXT,'						  
						   +  '   bip38_passphrase   TEXT,'
						   +  '   bip38_encrypted_pk TEXT,'
							
						   +  '   wif                TEXT,'
                           +  '   secret_phrase      TEXT,'	
                           +  '   word_indexes       TEXT,'	
						   
						   +  '   bip32_passphrase   TEXT,'
                           +  '   derivation_path    TEXT,'						   
                           +  '   account            INTEGER,'
                           +  '   address_index      INTEGER,'						   
		                   
                           +  '   lang               VARCHAR(3),'  
						   
						   +  '   FOREIGN KEY (coin)        REFERENCES COIN(id),'
						   +  '   FOREIGN KEY (blockchain)  REFERENCES BLOCKCHAIN(id),'
                           +  '   FOREIGN KEY (wallet_mode) REFERENCES WALLET_MODE(id),'
                           +  '   FOREIGN KEY (lang)        REFERENCES LANG(id)'
						   
						   +  '   UNIQUE(name, entropy)'
						   + ')' );						   
			create_table.run();
			// -------------------- 'WALLET_MODE' Table
			
			// this.db_obj.close();
			
			this.addWallet();
			
		} catch ( err) {
			console.error('Erreur:', err);
		}
	} // initDB()
	
	initSchema() {
		console.error('> SqLiteUtils.initSchema');
		
		let lang_exists = this.existsDBTable( this.db_obj, 'LANG' );
		// console.log("   lang_exists: " + lang_exists  );
			
		if ( ! lang_exists ) {
			this.initConstantTables();
		}
	} // initSchema()
	
	initAdminUser() {
		console.error('> SqLiteUtils.initAdminUser');
		
		let users_exists = this.existsDBTable( this.db_obj, 'USERS' );
		// console.log("   users_exists: '" + users_exists + "' " + typeof users_exists);
		
		if ( ! users_exists ) {
			let create_table = this.db_obj.prepare
				  (   "CREATE TABLE IF NOT EXISTS USERS ("
					+ "  id INTEGER PRIMARY KEY AUTOINCREMENT,"
					+ "  username           TEXT UNIQUE NOT NULL,"
					+ "  email              TEXT UNIQUE NOT NULL,"
					+ "  password_hash      TEXT NOT NULL,"
					
					+ "  is_admin           BOOLEAN DEFAULT 0,"
					+ "  is_active          BOOLEAN DEFAULT 1,"
					+ "  can_manage_users   BOOLEAN DEFAULT 0,"
					+ "  can_manage_content BOOLEAN DEFAULT 0,"
					+ "  can_view_logs      BOOLEAN DEFAULT 0,"
					  
					+ "  full_name         TEXT,"
					+ "  last_login        DATETIME,"
					+ "  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,"
					+ "  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP"		
					+ ")");
			create_table.run();	
			
			// Note: hardcoded 'bcrypt' hash of 'admin'			
			const hashed_password = '$2b$10$viyvP9YIQs0E4.sZN0feIeBrPbHTpCnLLc.ldWgCHDg4BCoHgm2Fi';
			// const hashed_password = await bcrypt.hash('admin', 10);
			
			let insert = this.db_obj.prepare
						  (   "INSERT INTO USERS" 
							+ "  ( username, email, password_hash, is_admin,"
							+ "    can_manage_users, can_manage_content, can_view_logs,"
							+ "    full_name, is_active ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)" );
			insert.run( [ 'admin', 'admin@example.com', hashed_password, 
						  1, // is_admin
						  1, // can_manage_users
						  1, // can_manage_content
						  1, // can_view_logs
						  'Super Administrator',
						  1  // is_active] 
						] );	
		} // if ( ! users_exists )							
		// -------------------- 'USERS' Table
	} // initAdminUser()
	
	initConstantTables() {
		console.error('> SqLiteUtils.initConstantTables');
		
		let insert       = undefined;
		let result       = undefined;
		let create_table = undefined;
		
		try {
			// -------------------- 'WALLET_MODE' constants -------------------- 
			create_table = this.db_obj.prepare( 'CREATE TABLE IF NOT EXISTS  WALLET_MODE  ( id  VARCHAR(15)  PRIMARY KEY )' );
			create_table.run();
			insert = this.db_obj.prepare('INSERT INTO  WALLET_MODE  (id) VALUES (?)');
			result = insert.run('Simple Wallet'); // Synchronous!
			result = insert.run('SWORD Wallet');
			result = insert.run('HD Wallet');
			// -------------------- 'WALLET_MODE' constants
			
			
			// -------------------- 'COIN' constants -------------------- 	
			create_table = this.db_obj.prepare( 'CREATE TABLE IF NOT EXISTS  COIN  ( id  VARCHAR(7)  PRIMARY KEY )' );
			create_table.run();           		
			insert = this.db_obj.prepare('INSERT INTO COIN (id) VALUES (?)');	
			for ( let i=0; i < CRYPTOCALC_DB_COINS.length; i++ ) { result = insert.run( [ CRYPTOCALC_DB_COINS[i] ] ); }
			// -------------------- 'COIN' constants


			// -------------------- 'BLOCKCHAIN' constants -------------------- 	
			create_table = this.db_obj.prepare( 'CREATE TABLE IF NOT EXISTS  BLOCKCHAIN  ( id  TEXT  PRIMARY KEY )' );
			create_table.run();           		
			insert = this.db_obj.prepare('INSERT INTO BLOCKCHAIN (id) VALUES (?)');	
			for ( let i=0; i < CRYPTOCALC_DB_BLOCKCHAINS.length; i++ ) { result = insert.run( [ CRYPTOCALC_DB_BLOCKCHAINS[i] ] ); }
			// -------------------- 'BLOCKCHAIN' constants			
			
			
			// -------------------- 'LANG' constants -------------------- 	
			create_table = this.db_obj.prepare( 'CREATE TABLE IF NOT EXISTS  LANG  ( id  VARCHAR(3)  PRIMARY KEY )' );
			create_table.run();           	
			insert = this.db_obj.prepare('INSERT INTO LANG (id) VALUES (?)');
			for ( let i=0; i < CRYPTOCALC_DB_LANGS.length; i++ ) { result = insert.run( [ CRYPTOCALC_DB_LANGS[i] ] ); }
			// -------------------- 'LANG' constants
			
			// this.db_obj.close();
		} catch ( err) {
			console.error('Erreur:', err);
		}
	} // initConstantTables()
	
	importWallets( folder_path ) {	
		try {
			const sub_folders = fs.readdirSync( folder_path, { withFileTypes: true } );
			for ( let i=0; i < sub_folders.length; i++ ) {
				let folder_name = sub_folders[i].name;				
				// console.log('> folder_name[' + i + ']: ' + folder_name);
				
				let json_file_path = folder_path + '\\' + folder_name + '\\wallet_info.wits'; 
				// console.log('> json_file_path[' + i + ']: ' + json_file_path);
				
				const wallet_info_content = fs.readFileSync( json_file_path, 'utf8' );
				const wallet_json_data = JSON.parse( wallet_info_content );
				
				this.addWallet( wallet_json_data, folder_name );
			}
		} catch ( err ) {
		    console.error('Erreur de lecture du dossier :', err.message);
		}
	} // importWallets()
	
	
	addWallet( wallet_data, sub_folder_name ) {
		try {
			let name               = sub_folder_name;

			let version            = wallet_data['Version'];
			let time_stamp         = wallet_data['timestamp'];
			
			let wallet_mode        = wallet_data['Wallet Mode'];
			let blockchain         = wallet_data['Blockchain'];
			let coin               = wallet_data['Coin'];
			
			let entropy            = wallet_data['Entropy'];			
			let entropy_size       = wallet_data['Entropy Size'];
			let wallet_address     = wallet_data['Wallet Address'];
			let bc_explorer_url    = wallet_data['Blockchain Explorer'];			
			
			let private_key        = wallet_data['Private Key'] != undefined ? wallet_data['Private Key'] : '';
			let bip38_passphrase   = wallet_data['Bip38 Passphrase'] != undefined ? wallet_data['Bip38 Passphrase'] : '';
			let bip38_encrypted_pk = wallet_data['Bip38 Encrypted PK'] != undefined ? wallet_data['Bip38 Encrypted PK'] : '';
			
			let wif                = wallet_data['WIF'] != undefined ? wallet_data['WIF'] : '';
			let secret_phrase      = wallet_data['Secret phrase'];
			let word_indexes       = wallet_data['Word indexes'];
			
			let bip32_passphrase   = wallet_data['Bip32 Passphrase'] != undefined ? wallet_data['Bip32 Passphrase'] : '';
			
			let derivation_path    = wallet_data['Derivation Path'];			
			let account            = wallet_data['account'];
			let address_index      = wallet_data['address_index'];
			
			let lang               = wallet_data['lang'];
			
			// NB: 21 fields
			let insert = this.db_obj.prepare
			             (    "INSERT OR IGNORE INTO WALLET"
   			                + "( name, version, time_stamp, wallet_mode, blockchain, coin, entropy, entropy_size, " 
			                + "  wallet_address, bc_explorer_url, private_key, bip38_passphrase, bip38_encrypted_pk,"
			                + "  wif, secret_phrase, word_indexes, bip32_passphrase, derivation_path, account, address_index, lang  )"
							+ "VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )" );
							
			insert.run( [ name, version, time_stamp, wallet_mode, blockchain, coin, entropy, entropy_size, 
			              wallet_address, bc_explorer_url, private_key, bip38_passphrase, bip38_encrypted_pk,
			              wif, secret_phrase, word_indexes, bip32_passphrase, derivation_path, account, address_index, lang
 			            ] );
		} catch (err) {
		}
	} // addWallet()
	
	existsDBTable( db_obj, table_name ) {	
	    let result = false;
		try {
			const stmt = db_obj.prepare( 'SELECT * FROM ' + table_name );
			const row = stmt.get();
			// console.log("> existsDBTable table_name: " + table_name +"  row: " + row);
			result = true;
		} catch ( err ) {
			result = false;
		}
		
		// console.log("   existsDBTable result: " + result);
		return result;
	} // existsDBTable()
	
	existsFileSync( file_path ) {
		try {
			fs.accessSync( file_path, fs.constants.F_OK );
			return true;
		} catch (err) {
			return false;
		}
	} // existsFileSync()
} // SqLiteUtils class


async function test_hash_pwd() {
	console.log('**SqLiteUtils** ---------- test_hash_pwd ----------');
	const hashed_password = await bcrypt.hash('admin', 10);
	console.log("hashed_password: '" + hashed_password + "'");
}; // test_hash_pwd
// test_hash_pwd();

function test_initialize() {
	console.log('**SqLiteUtils** ---------- test_initialize ----------');
	SqLiteUtils.This;
}; // test_initialize
// test_initialize();

function test_import_wallets() {
	console.log('**SqLiteUtils** ---------- test_import_wallets ----------');
	let path = "E:\\_00_Michel\\_00_Lab\\_00_GitHub\\Cryptocalc\\_output";
	SqLiteUtils.This.importWallets( path );
}; // test_import_wallets
test_import_wallets();
