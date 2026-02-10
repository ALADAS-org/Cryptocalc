/**
 * Interpréteur pour exécuter les scripts DSL
 * Gère le contexte d'exécution et les variables
 */
class DSLInterpreter {
  constructor(services) {
    this.services = services;
    this.context = {};
    this.fixtures = {};
  }

  /**
   * Initialise le contexte avec les fixtures
   * @param {Object} fixtures - Données de fixtures
   */
  loadFixtures(fixtures) {
    this.fixtures = fixtures || {};
  }

  /**
   * Réinitialise le contexte d'exécution
   */
  reset() {
    this.context = {};
  }

  /**
   * Exécute un step du script DSL
   * @param {Object} step - Step à exécuter
   * @returns {Promise<any>} Résultat de l'exécution
   */
  async executeStep(step) {
    const { action, params, assign, target } = step;
    
    // Résolution des variables dans les paramètres
    const resolvedParams = this.resolveParams(params);
    
    let result;
    
    try {
      switch(action) {
        case 'generateEntropy':
          result = await this.services.CryptoService.generateEntropy(
            resolvedParams.size
          );
          break;
          
        case 'generateWallet':
          result = await this.services.CryptoService.generateWallet(
            resolvedParams.type,
            resolvedParams.entropy,
            resolvedParams.blockchain,
            resolvedParams.passphrase
          );
          break;
          
        case 'save':
          const targetObj = this.resolveVariable(target);
          result = await targetObj.save();
          break;
          
        case 'encrypt':
          result = await this.services.CryptoService.encryptBip38(
            resolvedParams.privateKey,
            resolvedParams.passphrase,
            resolvedParams.compressed
          );
          break;
          
        case 'decrypt':
          result = await this.services.CryptoService.decryptBip38(
            resolvedParams.encryptedKey,
            resolvedParams.passphrase
          );
          break;
          
        case 'deriveAddress':
          result = await this.services.CryptoService.deriveAddress(
            resolvedParams.entropy,
            resolvedParams.account,
            resolvedParams.addressIndex,
            resolvedParams.blockchain
          );
          break;
          
        case 'validateMnemonic':
          result = this.services.CryptoService.validateMnemonic(
            resolvedParams.mnemonic,
            resolvedParams.language
          );
          break;
          
        case 'convertToMnemonic':
          result = this.services.CryptoService.convertToMnemonic(
            resolvedParams.entropy,
            resolvedParams.language
          );
          break;
          
        case 'convertToEntropy':
          result = this.services.CryptoService.convertToEntropy(
            resolvedParams.mnemonic,
            resolvedParams.language
          );
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Assignation du résultat à une variable si spécifié
      if (assign) {
        this.context[assign] = result;
      }
      
      return result;
      
    } catch (error) {
      throw new Error(`Failed to execute action "${action}": ${error.message}`);
    }
  }

  /**
   * Résout les paramètres en remplaçant les variables
   * @param {Object} params - Paramètres bruts
   * @returns {Object} Paramètres résolus
   */
  resolveParams(params) {
    if (!params) return {};
    
    const resolved = {};
    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this.resolveVariable(value);
    }
    return resolved;
  }

  /**
   * Résout une variable (remplace $variable par sa valeur)
   * @param {any} value - Valeur à résoudre
   * @returns {any} Valeur résolue
   */
  resolveVariable(value) {
    // Si c'est une chaîne commençant par $, c'est une variable
    if (typeof value === 'string' && value.startsWith('$')) {
      const varName = value.substring(1);
      
      // Cherche d'abord dans le contexte
      if (varName in this.context) {
        return this.context[varName];
      }
      
      // Puis dans les fixtures
      if (varName in this.fixtures) {
        return this.fixtures[varName];
      }
      
      throw new Error(`Variable "${varName}" not found in context or fixtures`);
    }
    
    // Si c'est un objet, résout récursivement
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const resolved = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = this.resolveVariable(val);
      }
      return resolved;
    }
    
    // Si c'est un tableau, résout chaque élément
    if (Array.isArray(value)) {
      return value.map(item => this.resolveVariable(item));
    }
    
    return value;
  }

  /**
   * Évalue une assertion
   * @param {Object} assertion - Assertion à évaluer
   * @returns {Object} Résultat {passed: boolean, message: string}
   */
  evaluateAssertion(assertion) {
    const value = this.resolveVariable(assertion.property);
    
    try {
      if ('equals' in assertion) {
        const expected = this.resolveVariable(assertion.equals);
        const passed = value === expected;
        return {
          passed,
          message: passed 
            ? `Property equals ${expected}` 
            : `Expected ${expected} but got ${value}`
        };
      }
      
      if ('notEquals' in assertion) {
        const notExpected = this.resolveVariable(assertion.notEquals);
        const passed = value !== notExpected;
        return {
          passed,
          message: passed 
            ? `Property not equals ${notExpected}` 
            : `Expected not to equal ${notExpected}`
        };
      }
      
      if ('hasLength' in assertion) {
        const expectedLength = assertion.hasLength;
        const actualLength = value?.length;
        const passed = actualLength === expectedLength;
        return {
          passed,
          message: passed 
            ? `Property has length ${expectedLength}` 
            : `Expected length ${expectedLength} but got ${actualLength}`
        };
      }
      
      if ('matches' in assertion) {
        const pattern = new RegExp(assertion.matches);
        const passed = pattern.test(value);
        return {
          passed,
          message: passed 
            ? `Property matches pattern ${assertion.matches}` 
            : `Property "${value}" does not match pattern ${assertion.matches}`
        };
      }
      
      if ('greaterThan' in assertion) {
        const threshold = assertion.greaterThan;
        const passed = value > threshold;
        return {
          passed,
          message: passed 
            ? `Property ${value} > ${threshold}` 
            : `Expected > ${threshold} but got ${value}`
        };
      }
      
      if ('lessThan' in assertion) {
        const threshold = assertion.lessThan;
        const passed = value < threshold;
        return {
          passed,
          message: passed 
            ? `Property ${value} < ${threshold}` 
            : `Expected < ${threshold} but got ${value}`
        };
      }
      
      if ('contains' in assertion) {
        const substring = this.resolveVariable(assertion.contains);
        const passed = value && value.includes(substring);
        return {
          passed,
          message: passed 
            ? `Property contains "${substring}"` 
            : `Property "${value}" does not contain "${substring}"`
        };
      }
      
      if ('isTrue' in assertion && assertion.isTrue) {
        const passed = value === true;
        return {
          passed,
          message: passed 
            ? 'Property is true' 
            : `Expected true but got ${value}`
        };
      }
      
      if ('isFalse' in assertion && assertion.isFalse) {
        const passed = value === false;
        return {
          passed,
          message: passed 
            ? 'Property is false' 
            : `Expected false but got ${value}`
        };
      }
      
      return {
        passed: false,
        message: 'No valid assertion type found'
      };
      
    } catch (error) {
      return {
        passed: false,
        message: `Assertion evaluation failed: ${error.message}`
      };
    }
  }

  /**
   * Obtient la valeur d'une variable du contexte
   * @param {string} varName - Nom de la variable
   * @returns {any} Valeur de la variable
   */
  getContextVariable(varName) {
    return this.context[varName];
  }

  /**
   * Définit une variable dans le contexte
   * @param {string} varName - Nom de la variable
   * @param {any} value - Valeur à assigner
   */
  setContextVariable(varName, value) {
    this.context[varName] = value;
  }
}

module.exports = DSLInterpreter;
