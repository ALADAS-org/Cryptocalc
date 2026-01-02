// ======================================================================================================================
// ==============================================    db_state_checker.js    =============================================
// ======================================================================================================================
"use strict";

class DatabaseStateChecker {
  /**
   * Vérifie l'état d'une base de données SQLite
   * @param {object} db - Instance sqlite3.Database
   * @returns {Promise<object>} État détaillé
   */
  static async CheckDatabaseState( db ) {
    const state = {
      exists: false,
      isOpen: null,
      isClosed: null,
      canRead: null,
      canWrite: null,
      properties: {},
      errors: [],
      warnings: []
    };
    
    // Vérification 1: L'objet existe
    if (!db) {
      state.exists = false;
      state.errors.push('Database object is null or undefined');
      return state;
    }
    
    state.exists = true;
    state.properties.type = typeof db;
    state.properties.constructor = db.constructor?.name;
    
    // Vérification 2: Propriétés internes
    const internalProps = ['_closed', '_open', '_filename', '_mode'];
    internalProps.forEach(prop => {
      if (prop in db) {
        state.properties[prop] = db[prop];
      }
    });
    
    // Vérification 3: Test de lecture
    try {
      const testResult = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ success: false, error: 'Timeout' });
        }, 1000);
        
        db.get('SELECT 1 as test_value', (err, row) => {
          clearTimeout(timeout);
          
          if (err) {
            resolve({ 
              success: false, 
              error: err.message,
              code: err.code 
            });
          } else {
            resolve({ 
              success: true, 
              value: row?.test_value 
            });
          }
        });
      });
      
      state.canRead = testResult.success;
      
      if ( testResult.success ) {
        state.isOpen = true;
        state.isClosed = false;
      } else {
        // Analyser l'erreur
        const errorMsg = testResult.error?.toLowerCase() || '';
        if (errorMsg.includes('closed') || 
            errorMsg.includes('not open') || 
            errorMsg.includes('cannot use')) {
          state.isOpen = false;
          state.isClosed = true;
        } else {
          state.warnings.push(`Erreur de lecture: ${testResult.error}`);
          state.isOpen = null; // Indéterminé
          state.isClosed = null;
        }
      }
    } catch (error) {
      state.canRead = false;
      state.errors.push(`Exception test lecture: ${error.message}`);
      
      if (error.message.includes('closed') || 
          error.message.includes('not a function')) {
        state.isClosed = true;
        state.isOpen = false;
      }
    }
    
    // Vérification 4: Test d'écriture (si lecture réussie)
    if ( state.canRead ) {
      try {
        const writeResult = await new Promise((resolve) => {
          db.run('CREATE TABLE IF NOT EXISTS _state_check (id INTEGER)', (err) => {
            if (err) {
              resolve({ success: false, error: err.message });
            } else {
              resolve({ success: true });
            }
          });
        });
        
        state.canWrite = writeResult.success;
        if (!writeResult.success) {
          state.warnings.push(`Échec écriture: ${writeResult.error}`);
        }
      } catch (error) {
        state.canWrite = false;
        state.errors.push(`Exception test écriture: ${error.message}`);
      }
    }
    
    // Déterminer l'état final
    if (state.isOpen === null && state.isClosed === null) {
      // Essayer avec la propriété _closed
      if (state.properties._closed !== undefined) {
        state.isClosed = state.properties._closed === true;
        state.isOpen = !state.isClosed;
      }
    }
    
    return state;
  } // static CheckDatabaseState()
   
  /**
   * Affiche l'état de manière lisible
   */
  static async LogDatabaseState( db, context = '' ) {
    console.log(`\n🔍 ÉTAT BASE DE DONNÉES ${context ? `(${context})` : ''}`);
    console.log('='.repeat(60));
    
    const state = await this.CheckDatabaseState(db);
    
    console.log('📊 STATUT:');
    console.log(`   Existe: ${state.exists ? '✅ OUI' : '❌ NON'}`);
    
    if (state.exists) {
      console.log(`   Type: ${state.properties.type}`);
      console.log(`   Constructeur: ${state.properties.constructor}`);
      
      if (state.properties._closed !== undefined) {
        console.log(`   _closed: ${state.properties._closed ? '✅ TRUE' : '✅ FALSE'}`);
      }
      
      console.log(`\n🧪 TESTS:`);
      console.log(`   Lecture: ${state.canRead === true ? '✅ OK' : 
                              state.canRead === false ? '❌ ÉCHEC' : '❓ INDÉTERMINÉ'}`);
      console.log(`   Écriture: ${state.canWrite === true ? '✅ OK' : 
                               state.canWrite === false ? '❌ ÉCHEC' : 
                               state.canWrite === null ? 'N/A' : '❓'}`);
      
      console.log(`\n🎯 ÉTAT FINAL:`);
      if (state.isOpen === true) {
        console.log('   ✅ BASE OUVERTE');
      } else if (state.isClosed === true) {
        console.log('   🔒 BASE FERMÉE');
      } else {
        console.log('   ❓ ÉTAT INDÉTERMINÉ');
      }
      
      // Afficher les warnings et erreurs
      if (state.warnings.length > 0) {
        console.log(`\n⚠️  AVERTISSEMENTS:`);
        state.warnings.forEach(w => console.log(`   - ${w}`));
      }
      
      if (state.errors.length > 0) {
        console.log(`\n❌ ERREURS:`);
        state.errors.forEach(e => console.log(`   - ${e}`));
      }
    }
    
    console.log('='.repeat(60));
    return state;
  } // static LogDatabaseState()
} // DatabaseStateChecker class

if ( typeof exports === 'object' ) {
	exports.DatabaseStateChecker = DatabaseStateChecker	
} // exports of 'db_state_checker.js'