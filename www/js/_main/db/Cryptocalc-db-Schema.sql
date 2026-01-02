-- Adminer 5.4.1 SQLite 3.40.0 dump

CREATE TABLE "BLOCKCHAIN" ( "id" TEXT PRIMARY KEY );
CREATE TABLE "COIN" ( "id" VARCHAR(7) PRIMARY KEY );
CREATE TABLE "LANG" ( "id" VARCHAR(3) PRIMARY KEY );

CREATE TABLE "PREDEFINED_SQL_QUERY" (   "id"                 INTEGER PRIMARY KEY AUTOINCREMENT,
										"name"               TEXT,
										"sql_query"          TEXT,
										"comment"            TEXT );

CREATE TABLE "TOKEN_TYPE" ( "id" TEXT PRIMARY KEY );

CREATE TABLE "USERS" (				"id"                 INTEGER PRIMARY KEY AUTOINCREMENT,
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
									"updated_at"         DATETIME DEFAULT CURRENT_TIMESTAMP );

CREATE UNIQUE INDEX "sqlite_autoindex_USERS_2" ON "USERS" ("email");

CREATE UNIQUE INDEX "sqlite_autoindex_USERS_1" ON "USERS" ("username");


CREATE TABLE "WALLET" (			"id"                 INTEGER  PRIMARY KEY  AUTOINCREMENT,	
								"name"               TEXT,
								"version"            VARCHAR(10),
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
								
								FOREIGN KEY ( coin )        REFERENCES  COIN( id ),
								FOREIGN KEY ( blockchain )  REFERENCES  BLOCKCHAIN( id ),
								FOREIGN KEY ( wallet_mode ) REFERENCES  WALLET_MODE( id ),
								FOREIGN KEY ( lang )        REFERENCES  LANG( id ),
								
								UNIQUE( name) );

CREATE UNIQUE INDEX "sqlite_autoindex_WALLET_1" ON "WALLET" ("name");

CREATE TABLE "WALLET_MODE" ( "id" VARCHAR(15) PRIMARY KEY );

CREATE TABLE "WALLET_TO_TOKEN_TYPE" ( "id"          INTEGER  PRIMARY KEY  AUTOINCREMENT,	
								      "quantity"    REAL, 
								      "comment"     TEXT,
								      "wallet"	    TEXT,	
								      "token_type"  TEXT,								
								      FOREIGN KEY ( wallet )      REFERENCES  WALLET( name ),
								      FOREIGN KEY ( token_type )  REFERENCES  TOKEN_TYPE( id ) );

CREATE TABLE _state_check (id INTEGER);

CREATE TABLE sqlite_sequence(name,seq);


-- 2025-12-20 22:17:46 UTC
