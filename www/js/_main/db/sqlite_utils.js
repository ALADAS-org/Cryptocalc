// ======================================================================================================================
// ================================================    sqlite_util.js    ================================================
// ======================================================================================================================
"use strict";

// const sqlite3 = require('sqlite3');
const bcrypt  = require('bcrypt');

let sqlite3 = undefined; // require in openDatabase()

const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const { getDayTimestamp }      = require('../../util/system/timestamp.js');
const { DatabaseStateChecker } = require('./db_state_checker');

const CRYPTOCALC_DB_LANGS =       [  ['EN','English',1], ['FR','French',1], ['ES','Spanish',1], ['IT','Italian',1], 
                                     ['PT','Portuguese',1], ['CS','Czech',1],
                                     ['JP','Japanese',1], ['SC','Simplified Chinese',1], ['TC','Traditional Chinese',1], ['KO','Korean',1],
									 ['DE','Deutsch',0], ['EO','Esperanto',0], ['LA','Latin',0], ['EL','Greek',0], ['EL','Greek',0], 
									 ['RU','Russian',0], ['HI','Hindi',0], ['BN','Bengali',0], ['GU','Gujarati',0]
								  ];

const CRYPTOCALC_DB_COINS =       [  "BTC", "ETH",  "XRP", "BNB", "SOL", "DOGE", "TRX", "ADA", "XLM", "SUI", "BCH",
                                     "AVAX", "TON", "LTC", "ETC", "POL", "VET", "BSV", "DASH", "RVN", "ZEN", "LUNA", "FIRO"  ];  
							  
const CRYPTOCALC_DB_BLOCKCHAINS = [  "Bitcoin", "Ethereum", "Ripple", "Binance Smart Chain", "Solana", "Dogecoin", "TRON", 
                                     "Cardano", "Stellar", "Sui", "Bitcoin Cash)", "Avalanche", "Toncoin", "Litecoin", "Ethereum Classic",
									 "Polygon", "VeChain", "Bitcoin SV", "Dash", "Ravencoin", "Horizen", "Terra", "Firo"  ];
			
		// ERC-20:   The standard for fungible tokens. This is what people mean by "ERC tokens" 95% of the time (USDT, UNI, LINK, SHIB, etc.).
		// ERC-721:  The standard for Non-Fungible Tokens (NFTs). Each token is unique (BAYC, CryptoPunks).
		// ERC-1155: A multi-token standard allowing for both fungible and non-fungible tokens in a single contract (common in gaming).
		// ERC-4337: The new standard for "account abstraction," enabling smart contract wallets for better UX and security (gaining traction in 2024). 									
const CRYPTOCALC_DB_TOKEN_TYPES = [	'ERC-20', 'ERC-721', 'ERC-1155', 'ERC-4337' ];		

const CRYPTOCALC_DB_PREDEFINED_SQL_QUERIES  = [	 [  "Extract by Coin Type",
                                                    "SELECT * FROM WALLET WHERE coin = 'BTC'"  ], 

                                                 [  "Extract by Wallet Mode",
												    "SELECT * FROM WALLET WHERE wallet_mode = 'HD Wallet'"  ],
									
									             [   "Extract by Wallet Mode + Entropy + Account",
												     "SELECT * FROM WALLET WHERE wallet_mode = 'HD Wallet' "
									                 + "AND entropy='80422dac5cd7aa60cf45c01b4b71abcc09ba23cc29feabe2f50d7ff478b27180'"
									                 + "AND account='33'" ],
												
												 [  "Extract between 2 Timestamps",
  												     "SELECT * FROM WALLET "
                                                   + "WHERE time_stamp " 
                                                   + "BETWEEN '2025-12-18 19:44:28.500' "
                                                   + "AND '2025-12-20 13:08:45.000' "
                                                   + "ORDER BY time_stamp ASC" ]
                                              ];
								
const CRYPTOCALC_DB_ORGANIZATIONS = [   [ "The Pile of Leaves", "A fictional organization.\nIndeed it's a Geek's reference to Zork\nthe (in)famous Text Adventure Game", 
                                          'https://iplayif.com/?story=http%3A%2F%2Fwww.ifarchive.org%2Fif-archive%2Fgames%2Fzcode%2Fzdungeon.z5', '', '', ''  ], 
										  
										[ 'Aladas.org', 'Protection of Wild Bees', 'https://aladas.org/', '', '', ''  ] 
									];	

const CRYPTOCALC_DB_DEFAULT_OWNER_ID = 'Nobody';									
const CRYPTOCALC_DB_OWNERS =        [   [ CRYPTOCALC_DB_DEFAULT_OWNER_ID, "The Pile of Leaves", '', '', '' ] 
									];	
		
	
// =========================================================================================================	
// ========================================    SQLiteUtils class    ========================================  
// =========================================================================================================	
class SqLiteUtils {
	static #Key            = Symbol();
	static #Singleton      = null;
	static #InstanceCount  = 0;
	static #isInitializing = false;
	
	static async GetInstance() {
		if (! SqLiteUtils.#Singleton) {
			SqLiteUtils.#Singleton = new SqLiteUtils(SqLiteUtils.#Key);
			if (SqLiteUtils.#InstanceCount > 0) {
				throw new TypeError("'SqLiteUtils' constructor called more than once");
			}
			SqLiteUtils.#InstanceCount++;
			await SqLiteUtils.#Singleton.initialize();
		}
		return SqLiteUtils.#Singleton;
	} // static GetInstance()
	
	static get This() {
		if ( ! SqLiteUtils.#Singleton ) {
			throw new Error("SqLiteUtils not initialized. Use GetInstance() instead.");
		}
		return SqLiteUtils.#Singleton;
	} // 'This' getter

    // ** Private constructor **
	constructor( key ) {
		if ( key !== SqLiteUtils.#Key ) {
			throw new TypeError("'SqLiteUtils' constructor is private");
		}
		
		this.local_app_data_path = process.env.LOCALAPPDATA;
		this.app_folder_path = path.join( this.local_app_data_path, 'Aladas-org/Cryptocalc');
		
		// Créer le dossier (ne fait rien s'il existe)
		if ( ! fs.existsSync( this.app_folder_path ) ) {		
			fs.mkdirSync( this.app_folder_path, { recursive: true } );
		}
		
		this.DEBUG        = true;		
		this.db_obj       = null;
		this.db_file_path = '';
		this.initialized  = false;
	} // ** Private constructor **
	
	async initialize() {
		console.log('>> SqLiteUtils.initialize()   this.initialized: ' + this.initialized);
		if ( this.initialized ) return;
		
		this.db_file_path = path.join( this.app_folder_path, 'Cryptocalc.db');
			
		if ( this.existsFileSync( this.db_file_path ) ) {
			// console.log('   file already created: ' + this.db_file_path);
		}
		else {
			console.log("   Create File: '"+ this.db_file_path + "'");				
			fs.writeFileSync( this.db_file_path, '' );
			console.log('<Done> Fichier DB créé: ' + this.db_file_path);
		}
		
		// Initialize database connection
		this.db_obj = await this.openDatabase( this.DEBUG );
		console.log('<Done> Connecté à la base de données');
		
		let db_state = await DatabaseStateChecker.CheckDatabaseState( this.db_obj );		
		console.log( '>> SqLiteUtils.initialize(): db_state["isOpen"]: ' + db_state["isOpen"] + '   db_state["isClosed"]: ' + db_state["isClosed"]);
		
		let db_is_opened = await this.isDatabaseOpened(); 
		console.log('>> SqLiteUtils.initialize(): Check if Database Opened: ' + db_is_opened);
		if ( db_is_opened ) {
			await this.closeDatabase();
		}
		
		// Enable WAL mode and foreign keys
		await this.dbRun(`PRAGMA journal_mode = WAL`);
		
		await this.dbRun(`PRAGMA foreign_keys = ON`);
		await this.dbRun(`PRAGMA foreign_key_check`);
		console.log('<Done> Clés étrangères activées');
		
		await this.initSchema();
		await this.initDB();
		
		this.initialized = true;
	} // async initialize()
	
	async isDatabaseOpened() {
		if ( this.db_obj == null )  return false; 
		let db_state = await DatabaseStateChecker.CheckDatabaseState( this.db_obj );	
		return ( db_state["isOpen"] == false &&  db_state["isClosed"] == false );
	} // async isDatabaseOpened()

	async openDatabase() {
		console.error('>> SqLiteUtils.openDatabase()  this.DEBUG: ' + this.DEBUG );
        
		// if ( this.DEBUG ) sqlite3 = require('sqlite3').verbose();
		// else              sqlite3 = require('sqlite3');
		
		sqlite3 = require('sqlite3').verbose();
		
		let result = new Promise( (resolve, reject) => {
			this.db_obj = new sqlite3.Database
			              ( this.db_file_path,  
			                ( err ) => { if ( err ) { reject( err ); } 
										 else {	resolve( this.db_obj ); }
									    } 
						  );
		});
		
		return result;
	} // async openDatabase()
	
	// Note: to call this function use 'await' ( eg. this.closeDatabase() )
	closeDatabase() {	    
		return new Promise( (resolve, reject) => {
			if ( ! this.db_obj ) {
			  console.warn('<Error> Aucune base à fermer');
			  resolve();
			  return;
			}

			console.log('<TRY> Tentative de fermeture...');		
			this.db_obj.close( (err) => {
			  if ( err ) {
				console.error('<KO> Erreur fermeture:', err.message);
				reject( err );
			  } else {
				console.log('<Done> Base fermée avec succès');
				resolve();
			  }
			});
			
			this.initialized = false;
		});
	} // SQLiteUtils.closeDatabase()

	async initDB() {
		console.error('>> SqLiteUtils.initDB()');
		
		await this.initAdminUser();
		
		// ==============================  Create 'OWNER' table  ==============================
		try {			
			await this.dbRun(`CREATE TABLE IF NOT EXISTS "OWNER" (
								"id"            TEXT  PRIMARY KEY,	
								"organization"  TEXT,
								"email"         TEXT,
								"phone"	        TEXT,	
								"address"       TEXT,	
								
								FOREIGN KEY ( organization ) REFERENCES  ORGANIZATION( id ) )
			`);
			
			let owner_data = CRYPTOCALC_DB_OWNERS[0];
			await this.dbRun(
					`INSERT OR IGNORE INTO "OWNER" ( id, organization, email, phone, address )
					 VALUES ( ?, ?, ?, ?, ? )`,
					 [  owner_data[0],  owner_data[1],  owner_data[2],  owner_data[3],  owner_data[4]  ]
				);
			console.log('<Done> Table "OWNER" créée/verifiée');						
		} catch (err) {
			console.error('<Error> création table "OWNER":\n' + err);
			throw err;
		}
		// ==============================  Create 'OWNER' table
		
		
		// ===================================  Create 'WALLET' table  ===================================
		try {
			await this.dbRun(`CREATE TABLE IF NOT EXISTS "WALLET" (
								"id"                 INTEGER  PRIMARY KEY  AUTOINCREMENT,	
								"name"               TEXT,
								
								"owner"              TEXT,
								
								"time_stamp"         TEXT ,
								"wallet_mode"        VARCHAR(15),						   
								"blockchain"         TEXT,					
								"coin"               VARCHAR(7),
								"balance"            REAL,
								"comment"            TEXT,					
								"entropy"            TEXT,
								"entropy_size"       INTEGER,	
								"wallet_address"     TEXT,
								"bc_explorer_url"    TEXT,
								"private_key"        TEXT,						  
								"bip38_passphrase"   TEXT,
								"bip38_encrypted_pk" TEXT,
								"wif"                TEXT,
								"secret_phrase"      TEXT,	
								"word_indexes"       TEXT,	
								"bip32_passphrase"   TEXT,
								"derivation_path"    TEXT,						   
								"account"            INTEGER,
								"address_index"      INTEGER,						   
								"lang"               VARCHAR(3),

								"version"            VARCHAR(10),								
								
								FOREIGN KEY ( owner )       REFERENCES  OWNER( id ),
								FOREIGN KEY ( coin )        REFERENCES  COIN( id ),
								FOREIGN KEY ( blockchain )  REFERENCES  BLOCKCHAIN( id ),
								FOREIGN KEY ( wallet_mode ) REFERENCES  WALLET_MODE( id ),
								FOREIGN KEY ( lang )        REFERENCES  LANG( id ),
								
								UNIQUE( name) )
			`);
			console.log('<Done> Table "WALLET" créée/verifiée');
		} catch (err) {
			console.error("<Error> création table 'WALLET': \n" + err);
			throw err;
		}
		// ===================================  Create 'WALLET' table
		
		
		// ==============================  Create 'WALLET_TO_TOKEN_TYPE' table  ==============================
		try {			
			await this.dbRun(`CREATE TABLE IF NOT EXISTS "WALLET_TO_TOKEN_TYPE" (
								"id"          INTEGER  PRIMARY KEY  AUTOINCREMENT,	
								"quantity"    REAL, 
								"comment"     TEXT,
								"wallet"	  TEXT,	
								"token_type"  TEXT,	
								
								FOREIGN KEY ( wallet )      REFERENCES  WALLET( name ),
								FOREIGN KEY ( token_type )  REFERENCES  TOKEN_TYPE( id ) )	
			`);
			console.log('<Done> Table "WALLET_TO_TOKEN_TYPE" créée/verifiée');						
		} catch (err) {
			console.error('<Error> création table "WALLET_TO_TOKEN_TYPE":\n' + err);
			throw err;
		}
		// ==============================  Create 'WALLET_TO_TOKEN_TYPE' table
	} // async initDB()
	
	async initSchema() {
		console.error('>> SqLiteUtils.initSchema()');
		
		// Check if "LANG" table exists
		const row = await this.dbGet(`SELECT "name" FROM "sqlite_master" WHERE type='table' AND name='LANG'`);
		
		// ( ! row ) {
		await this.initConstantTables();
		//}
	} // async initSchema()
	
	async initAdminUser() {
		console.error('>> SqLiteUtils.initAdminUser()');
		
		// Check if USERS table exists
		const row = await this.dbGet(`SELECT "name" FROM "sqlite_master" WHERE type='table' AND name='USERS'`);
		
		if ( ! row ) {
			// ==============================  Create 'USERS' table  ==============================
			try {
				await this.dbRun(`CREATE TABLE IF NOT EXISTS "USERS" (
									"id"                 INTEGER PRIMARY KEY AUTOINCREMENT,
									"username"           TEXT UNIQUE NOT NULL,
									"email"              TEXT UNIQUE NOT NULL,
									"password_hash"      TEXT NOT NULL,
									"is_admin"           BOOLEAN DEFAULT 0,
									"is_active"          BOOLEAN DEFAULT 1,
									"can_manage_users"   BOOLEAN DEFAULT 0,
									"can_manage_content" BOOLEAN DEFAULT 0,
									"can_view_logs"      BOOLEAN DEFAULT 0,
									"full_name"          TEXT,
									"last_login"         DATETIME,
									"created_at"         DATETIME DEFAULT CURRENT_TIMESTAMP,
									"updated_at"         DATETIME DEFAULT CURRENT_TIMESTAMP )`
				);
				
				// Insert admin user
				const hashed_password = '$2b$10$viyvP9YIQs0E4.sZN0feIeBrPbHTpCnLLc.ldWgCHDg4BCoHgm2Fi';
				
				await this.dbRun(
					`INSERT OR IGNORE INTO "USERS" ( username, email, password_hash, is_admin, 
					                                 can_manage_users, can_manage_content, can_view_logs, 
													 full_name, is_active )
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					 [ 'admin', 'admin@example.com', hashed_password, 1, 1, 1, 1, 'Super Administrator', 1 ]
				);
				
				console.log('<Done> Utilisateur "admin" créé');
			} catch ( err ) {
				console.error('<Error> création/insertion table "USERS": \n' + err);
				throw err;
			}
			// ==============================  Create 'USERS' table
		}
	} // async initAdminUser()
	
	async initConstantTables() {
		console.error('>> SqLiteUtils.initConstantTables()');
		
			// ====================  'WALLET_MODE' table  ====================
			try {
				await this.dbRun('CREATE TABLE IF NOT EXISTS "WALLET_MODE" ( "id" VARCHAR(15) PRIMARY KEY )');
				const walletModes = [ 'Simple Wallet', 'SWORD Wallet', 'HD Wallet' ];
				for ( const mode of walletModes ) {
					try { await this.dbRun('INSERT OR IGNORE INTO "WALLET_MODE" (id) VALUES (?)', [mode]);
					} catch (err) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('Erreur insertion "WALLET_MODE": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "WALLET_MODE" initialisée');
			} catch ( err ) {
				console.error('<Error> initConstantTables table "WALLET_MODE"');
				throw err;
			}	
			// ====================  'WALLET_MODE' table
			
			
			// =======================  'COIN' table  =======================
			try {
				await this.dbRun('CREATE TABLE IF NOT EXISTS "COIN" ( "id" VARCHAR(7) PRIMARY KEY )');
				for ( const coin of CRYPTOCALC_DB_COINS ) {
					try { await this.dbRun('INSERT OR IGNORE INTO "COIN" (id) VALUES (?)', [coin]);
					} catch (err) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('Erreur insertion "COIN": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "COIN" initialisée')
			} catch ( err ) {
				console.error('<Error> initConstantTables table "COIN"');
				throw err;
			}		
			// =======================  'COIN' table
			
			
			// ====================  'BLOCKCHAIN' table  =====================
			try {
				await this.dbRun('CREATE TABLE IF NOT EXISTS "BLOCKCHAIN" ( "id" TEXT PRIMARY KEY )');
				
				// Insert blockchains
				for ( const blockchain of CRYPTOCALC_DB_BLOCKCHAINS ) {
					try { await this.dbRun('INSERT OR IGNORE INTO "BLOCKCHAIN" (id) VALUES (?)', [blockchain]);
					} catch (err) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('Erreur insertion "BLOCKCHAIN": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "BLOCKCHAIN" initialisée');
			} catch ( err ) {
				console.error('<Error> initConstantTables table "BLOCKCHAIN"');
				throw err;
			}	
			// ====================  'BLOCKCHAIN' table
			

			// ====================  'TOKEN_TYPE' table  =====================
			try {
				await this.dbRun('CREATE TABLE IF NOT EXISTS "TOKEN_TYPE" ( "id" TEXT PRIMARY KEY )');
				for ( const token_type of CRYPTOCALC_DB_TOKEN_TYPES ) {
					try { await this.dbRun('INSERT OR IGNORE INTO "TOKEN_TYPE" (id) VALUES (?)', [token_type]);
					} catch (err) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('Erreur insertion "TOKEN_TYPE": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "TOKEN_TYPE" initialisée');
			} catch ( err ) {
				console.error('<Error> initConstantTables table "TOKEN_TYPE"');
				throw err;
			}	
			// ====================  'TOKEN_TYPE' table
			
			
			// =======================  'LANG' table  =======================
			try {
				await this.dbRun(`CREATE TABLE IF NOT EXISTS "LANG" (
										"id"                 VARCHAR(3) PRIMARY KEY,
										"name"               TEXT,
										"bip39_official"     INTEGER
								)`
				);
					
				for ( const lang_data of CRYPTOCALC_DB_LANGS ) {
					try { await this.dbRun( 'INSERT OR IGNORE INTO "LANG" ( id, name, bip39_official ) VALUES ( ?, ?, ? )',
 					                        [  lang_data[0], lang_data[1], lang_data[2]  ] );
					} catch ( err ) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('<Error> insertion "LANG": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "LANG" initialisée');
			} catch ( err ) {
				console.error('<Error> initConstantTables table "LANG"');
				throw err;
			}	
			// =======================  'LANG' table
			
			
			// =======================  'PREDEFINED_SQL_QUERY' table  =======================
			try {	
				await this.dbRun(`CREATE TABLE IF NOT EXISTS "PREDEFINED_SQL_QUERY" (
										"id"                 INTEGER PRIMARY KEY AUTOINCREMENT,
										"name"               TEXT,
										"sql_query"          TEXT,
										"comment"            TEXT
								)`
					);
				for ( const sql_query_data of CRYPTOCALC_DB_PREDEFINED_SQL_QUERIES ) {
					try { await this.dbRun( 'INSERT OR IGNORE INTO "PREDEFINED_SQL_QUERY" ( name, sql_query ) VALUES ( ?, ? )', 
					                       [ sql_query_data[0], sql_query_data[1] ]);
					} catch ( err ) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('<Error> insertion "PREDEFINED_SQL_QUERY": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "PREDEFINED_SQL_QUERY" initialisée');
			} catch ( err ) {
				console.error('<Error> initConstantTables table "PREDEFINED_SQL_QUERY"');
				throw err;
			}	
			// =======================  'PREDEFINED_SQL_QUERY' table
			
			
			// =======================  'ORGANIZATION' table  =======================
			try {
				await this.dbRun(`CREATE TABLE IF NOT EXISTS "ORGANIZATION" (
									"id"            VARCHAR(35) PRIMARY KEY,
									"purpose"       TEXT,
									"homepage"      TEXT,
								    "email"         TEXT,
								    "phone"	        TEXT,	
								    "address"       TEXT	
								)`
				);
					
				for ( const org_data of CRYPTOCALC_DB_ORGANIZATIONS ) {
					try { await this.dbRun(   'INSERT OR IGNORE INTO "ORGANIZATION" ( id, purpose, homepage, email, phone, address  ) ' 
					                        + 'VALUES ( ?, ?, ?, ?, ?, ? )', 
										      [  org_data[0], org_data[1], org_data[2], org_data[3], org_data[4], org_data[5] ]  );
					} catch ( err ) {
						if ( ! err.message.includes('UNIQUE constraint') ) {
							console.error('Erreur insertion "ORGANIZATION": \n' + err);
						}
					}
				}			
				console.log('<Done> Table "ORGANIZATION" initialisée');
			} catch ( err ) {
				console.error('<Error> initConstantTables table "ORGANIZATION"');
				throw err;
			}	
			// =======================  'LANG' table
		
	} // async initConstantTables()
	
	async importWallets( output_folders_path ) {
		console.log(">> SqLiteUtils.This.importWallets() \n   output_folders_path: '" + output_folders_path + "'");	
		try {
			const output_folders = fs.readdirSync( output_folders_path, { withFileTypes: true } );
			for ( let i=0; i < output_folders.length; i++ ) {
				let output_folder_name = output_folders[i].name;				
				console.log('>   output_folder_name[' + i + ']: ' + output_folder_name);
				
				let wits_file_path = output_folders_path + '\\' + output_folder_name + '\\wallet_info.wits';
				if ( fs.existsSync( wits_file_path ) ) {	
					// console.log('> json_file_path[' + i + ']: ' + json_file_path);
					
					const wits_content = fs.readFileSync( wits_file_path, 'utf8' );
					const wallet_json_data = JSON.parse( wits_content );
					
					await this.insertWallet( wallet_json_data, output_folder_name );
				}	
			}
		} catch ( err ) {
		    console.error(">> Erreur de lecture du dossier '" + output_folders_path + "':\n" + err.message);
		}
		
		let db_state = await DatabaseStateChecker.CheckDatabaseState( this.db_obj );
		// {"exists":true,"isOpen":true,"isClosed":false,"canRead":true,"canWrite":true,"properties":{"type":"object","constructor":"Database"},"errors":[],"warnings":[]}
		// console.log( "db_state: " + JSON.stringify(db_state) );
		if ( db_state["isOpen"] == false &&  db_state["isClosed"] ) {
			await this.closeDatabase();
		}
	} // async importWallets()
	
	async insertWallet( wallet_data, output_folder_name ) {
		console.log(">> --------------------------------");
		console.log(">> SQLiteUtils.insertWallet:  '" + output_folder_name + "'" );
		
		// If no wallet_data provided, just return (this was likely a test call)
		if ( ! wallet_data ) return;
		
		try {
			let name               = output_folder_name;
			// console.log("name: " + name);
			
			let owner              = CRYPTOCALC_DB_DEFAULT_OWNER_ID;
			// console.log("name: " + name);
			
			let json_data_time_stamp = wallet_data['timestamp'];
			let time_stamp = this.convertToSQLiteTimestamp( json_data_time_stamp );
			// console.log("json_data_time_stamp: " + json_data_time_stamp);
			// console.log("time_stamp: "           + time_stamp);
			
			let wallet_mode        = wallet_data['Wallet Mode'];
			// console.log("wallet_mode: " + wallet_mode);
			
			let blockchain         = wallet_data['Blockchain'];
			// console.log("blockchain: " + blockchain);
			
			let coin               = wallet_data['Coin'];
			// console.log("coin: " + coin);
			
			let balance            = 0;
			// console.log("balance: " + balance);
			
			let comment            = '';
			// console.log("comment: " + comment);
			
			let entropy            = wallet_data['Entropy'];	
			// console.log("entropy: " + entropy);
			
			let entropy_size       = wallet_data['Entropy Size'];
			// console.log("entropy_size: " + entropy_size);
			
			let wallet_address     = wallet_data['Wallet Address'];
			// console.log("wallet_address: " + wallet_address);
			
			let bc_explorer_url    = wallet_data['Blockchain Explorer'];	
			// console.log("bc_explorer_url: " + bc_explorer_url);
			
			let private_key        = wallet_data['Private Key'] != undefined ? wallet_data['Private Key'] : '';
			// console.log("private_key: " + private_key);
			
			let bip38_passphrase   = wallet_data['Bip38 Passphrase'] != undefined ? wallet_data['Bip38 Passphrase'] : '';
			// console.log("bip38_passphrase: " + bip38_passphrase);
			
			let bip38_encrypted_pk = wallet_data['Bip38 Encrypted PK'] != undefined ? wallet_data['Bip38 Encrypted PK'] : '';
			// console.log("bip38_encrypted_pk: " + bip38_encrypted_pk);
			
			let wif                = wallet_data['WIF'] != undefined ? wallet_data['WIF'] : '';
			// console.log("wif: " + wif);
			
			let secret_phrase      = wallet_data['Secret phrase'];
			// console.log("secret_phrase: " + secret_phrase);
			
			let word_indexes       = wallet_data['Word indexes'];
			// console.log("word_indexes: " + word_indexes);
			
			let bip32_passphrase   = wallet_data['Bip32 Passphrase'] != undefined ? wallet_data['Bip32 Passphrase'] : '';
			// console.log("bip32_passphrase: " + bip32_passphrase);
			
			let derivation_path    = wallet_data['Derivation Path'] != undefined ? wallet_data['Derivation Path'] : '';
			// console.log("derivation_path: " + derivation_path);
			
			let account            = wallet_data['account'] != undefined ? wallet_data['account'] : '0\'';
			// console.log("account: " + account);
			
			let address_index      = wallet_data['address_index'] != undefined ? wallet_data['address_index'] : '0\'';
			// console.log("address_index: " + address_index);
			
			let lang               = wallet_data['Lang'];
			// console.log("lang: " + lang);
			
			let version            = wallet_data['Version'];
			// console.log("version: " + version);			
			
			let values = [ name, owner, time_stamp, wallet_mode, blockchain, coin, balance, comment, 
				           entropy, entropy_size, wallet_address, bc_explorer_url, 
				           private_key, bip38_passphrase, bip38_encrypted_pk, wif, secret_phrase,
				           word_indexes, bip32_passphrase, derivation_path, account, address_index, lang, version ];
			// console.log("values: " + values.length);			   
			
			await this.dbRun(
				`INSERT OR IGNORE INTO "WALLET" 
				 ( name, owner, time_stamp, wallet_mode, blockchain, coin, balance, comment,
				   entropy, entropy_size, wallet_address, bc_explorer_url, 
				   private_key, bip38_passphrase, bip38_encrypted_pk, wif, secret_phrase, 
				   word_indexes, bip32_passphrase, derivation_path, account, address_index, lang, version ) 
				 VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )`, values );
			
		} catch ( err ) {
			console.log ( '*-*-* Erreur *-*-* insertion "WALLET":\n**Error** ' + err.message );
			// if ( ! err.message.includes('UNIQUE constraint')) {
				console.error('**Erreur** insertion "WALLET":\n **Error**' + err);
			// }
		}
	} // async insertWallet()
	
	async existsDBTable( table_name ) {	
		try {
			const row = await this.dbGet( `SELECT "name" FROM "sqlite_master" WHERE type='table' AND name=?`, [ table_name ] );
			return !! row;
		} catch ( err ) {
			console.error("Erreur vérification table: '" + table_name + "'\n" + err);
			return false;
		}
	} // async existsDBTable()
	
	existsFileSync( file_path ) {
		try {
			fs.accessSync( file_path, fs.constants.F_OK );
			return true;
		} catch ( err ) {
			return false;
		}
	} // existsFileSync()
	
	get appFolderPath() {
		return this.app_folder_path;
	} // 'appFolderPath' getter
	
	// Database helper methods with async/await
	async dbRun( sql, params = [] ) {
		return new Promise( (resolve, reject) => {
			// console.log( "SQL REquest: \n" + sql );
			// console.log( "this.db_obj: " + this.db_obj );
			this.db_obj.run( sql, params, function(err) {
				if ( err ) reject(err);
				else resolve({ lastID: this.lastID, changes: this.changes });
			});
		});
	} // async dbRun()
	
	async dbGet( sql, params = [] ) {
		return new Promise((resolve, reject) => {
			this.db_obj.get(sql, params, (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	} // async dbGet()
	
	async dbAll( sql, params = [] ) {
		return new Promise((resolve, reject) => {
			this.db_obj.all(sql, params, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
	} // async dbAll()
	
	// For backward compatibility
	runQuery( sql, params = [] ) {
		return this.dbRun(sql, params);
	} // runQuery()
	
	getRow( sql, params = [] ) {
		return this.dbGet(sql, params);
	} // getRow()
	
	getAll( sql, params = [] ) {
		return this.dbAll(sql, params);
	} // getAll()
	
	// 2025_12_18_16h-45m-44s-3 to TEXT 'ISO 8601' ('YYYY-MM-DD HH:MM:SS.SSS')
	convertToSQLiteTimestamp( timestamp_str ) {
		// Parse the input string
		const [ date_part, time_part ] = timestamp_str.split('_').slice(0, 4).join('_').split('_16h')[0];
		
		// Alternative parsing: split by underscores and hyphens
		const ts_parts = timestamp_str.split(/[_-]/);
		// parts: ['2025', '12', '18', '16h', '45m', '44s', '3']
		
		const year            = ts_parts[0];
		const month           = ts_parts[1];
		const day             = ts_parts[2];
		const hour            = ts_parts[3].replace('h', '');
		const minute          = ts_parts[4].replace('m', '');
		const second          = ts_parts[5].replace('s', '');
		const tenth_of_second = ts_parts[6];  // Math.round(today_milliseconds/100)
		
		// Convert fraction to milliseconds (assuming .3 = 300ms)
		// console.log("++++ tenth_of_second: " + tenth_of_second);
		const milliseconds    =  tenth_of_second * 100;
		// console.log("++++ milliseconds:    " + milliseconds);

		const timestamp_value = `${year}-${month}-${day} ${hour}:${minute}:${second}.${milliseconds}`;
		return timestamp_value;
	} // convertToSQLiteTimestamp()
} // 'SqLiteUtils' class
// =================================================================
// ========================================    SQLiteUtils class      
// =================================================================
	

async function test_convertTimeStamp_to_SQL() {
	await SqLiteUtils.GetInstance();
	let ts_str = getDayTimestamp();
	let SQL_ts = SqLiteUtils.This.convertToSQLiteTimestamp( ts_str );
	console.log("ts_str: " + ts_str + "   SQL_ts: " + SQL_ts );
} // test_convertTimeStamp_to_SQL()

async function test_hash_pwd() {
	console.log('**SqLiteUtils** ---------- test_hash_pwd ----------');
	const hashed_password = await bcrypt.hash('admin', 10);
	console.log("hashed_password: '" + hashed_password + "'");
}

async function test_initialize() {
	console.log('**SqLiteUtils** ---------- test_initialize ----------');
	await SqLiteUtils.GetInstance();
}

async function test_import_wallets() {
	console.log('**SqLiteUtils** ---------- test_import_wallets ----------');
	// First ensure we're initialized
	await SqLiteUtils.GetInstance();
	let path = "E:\\_00_Michel\\_00_Lab\\_00_GitHub\\Cryptocalc\\_output";
	await SqLiteUtils.This.importWallets( path );
}

// IIFE (Immediately Invoked Function Expression)
( async () => {
	await SqLiteUtils.GetInstance(); // Caution !! Don't put this line in comments
	
	// ---- Uncomment the test you want to run ----
	// await test_hash_pwd();
	// await test_initialize();
	// await test_import_wallets();
	// await test_convertTimeStamp_to_SQL();
} )();

if ( typeof exports === 'object' ) {
	exports.SqLiteUtils = SqLiteUtils	
} // exports of 'sqlite_utils.js'