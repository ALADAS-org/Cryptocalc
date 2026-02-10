/**
 * DSL Interpreter - Exécute les scripts de tests
 */
class DSLInterpreter {
  constructor(services) {
    this.services = services;
    this.context = {};
    this.results = [];
  }

  /**
   * Réinitialise le contexte d'exécution
   */
  reset() {
    this.context = {};
    this.results = [];
  }

  /**
   * Exécute une suite de tests complète
   * @param {object} testSuite - Suite de tests à exécuter
   * @returns {Array} Résultats des tests
   */
  async executeTestSuite(testSuite) {
    console.log(`\n=== Executing test suite: ${testSuite.name} ===`);
    
    if (testSuite.description) {
      console.log(`Description: ${testSuite.description}`);
    }

    // Setup global si présent
    if (testSuite.setup) {
      await this.applySetup(testSuite.setup);
    }

    const results = [];

    for (const test of testSuite.tests) {
      const result = await this.executeTest(test);
      results.push(result);
    }

    return results;
  }

  /**
   * Applique la configuration setup
   * @param {object} setup - Configuration à appliquer
   */
  async applySetup(setup) {
    for (const [key, value] of Object.entries(setup)) {
      this.context[`_setup_${key}`] = value;
    }
  }

  /**
   * Exécute un test individuel
   * @param {object} test - Test à exécuter
   * @returns {object} Résultat du test
   */
  async executeTest(test) {
    console.log(`\n  → Test: ${test.name}`);
    
    const testResult = {
      name: test.name,
      success: true,
      errors: [],
      assertions: []
    };

    try {
      // Exécution des étapes
      for (const [index, step] of test.steps.entries()) {
        console.log(`    Step ${index + 1}: ${step.action}`);
        await this.executeStep(step);
      }

      // Vérification des assertions
      if (test.assertions) {
        for (const assertion of test.assertions) {
          const assertionResult = await this.checkAssertion(assertion);
          testResult.assertions.push(assertionResult);
          
          if (!assertionResult.passed) {
            testResult.success = false;
          }
        }
      }

    } catch (error) {
      testResult.success = false;
      testResult.errors.push(error.message);
      console.error(`    ✗ Error: ${error.message}`);
    }

    const status = testResult.success ? '✓' : '✗';
    console.log(`  ${status} Test ${testResult.success ? 'passed' : 'failed'}`);

    return testResult;
  }

  /**
   * Exécute une étape de test
   * @param {object} step - Étape à exécuter
   * @returns {any} Résultat de l'étape
   */
  async executeStep(step) {
    const { action, params, assign, target } = step;
    
    // Résolution des paramètres avec variables
    const resolvedParams = this.resolveParams(params);
    
    let result;

    switch(action) {
      case 'generateEntropy':
        result = await this.executeGenerateEntropy(resolvedParams);
        break;
        
      case 'generateWallet':
        result = await this.executeGenerateWallet(resolvedParams);
        break;
        
      case 'save':
        const targetObj = this.resolveVariable(target);
        result = await this.executeSave(targetObj, resolvedParams);
        break;

      case 'encrypt':
        result = await this.executeEncrypt(resolvedParams);
        break;

      case 'decrypt':
        result = await this.executeDecrypt(resolvedParams);
        break;

      case 'deriveKey':
        result = await this.executeDeriveKey(resolvedParams);
        break;

      case 'validateAddress':
        result = await this.executeValidateAddress(resolvedParams);
        break;

      case 'computeChecksum':
        result = await this.executeComputeChecksum(resolvedParams);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Assignation du résultat à une variable
    if (assign) {
      this.context[assign] = result;
      console.log(`      → Assigned to $${assign}`);
    }
    
    return result;
  }

  /**
   * Génère de l'entropie
   */
  async executeGenerateEntropy(params) {
    const size = params.size || this.context._setup_entropy_size || 256;
    
    if (!this.services.CryptoService) {
      throw new Error('CryptoService not available');
    }

    const entropy = await this.services.CryptoService.generateEntropy(size);
    console.log(`      → Generated entropy: ${entropy.substring(0, 16)}...`);
    
    return entropy;
  }

  /**
   * Génère un wallet
   */
  async executeGenerateWallet(params) {
    const { type, entropy, blockchain, passphrase } = params;
    
    if (!this.services.CryptoService) {
      throw new Error('CryptoService not available');
    }

    const walletType = type || this.context._setup_wallet_mode || 'HD_WALLET';
    const chain = blockchain || this.context._setup_blockchain || 'BTC';

    const wallet = await this.services.CryptoService.generateWallet(
      walletType,
      entropy,
      {
        blockchain: chain,
        passphrase: passphrase
      }
    );

    console.log(`      → Generated ${walletType} wallet for ${chain}`);
    
    return wallet;
  }

  /**
   * Sauvegarde un wallet
   */
  async executeSave(wallet, params) {
    if (!wallet || !wallet.save) {
      throw new Error('Invalid wallet object - no save method');
    }

    const result = await wallet.save(params);
    console.log(`      → Wallet saved`);
    
    return result;
  }

  /**
   * Chiffre avec BIP38
   */
  async executeEncrypt(params) {
    const { privateKey, passphrase, difficulty } = params;
    
    if (!this.services.BIP38Service) {
      throw new Error('BIP38Service not available');
    }

    const encrypted = await this.services.BIP38Service.encrypt(
      privateKey,
      passphrase,
      difficulty || 16384
    );

    console.log(`      → Encrypted private key`);
    
    return encrypted;
  }

  /**
   * Déchiffre avec BIP38
   */
  async executeDecrypt(params) {
    const { encryptedKey, passphrase } = params;
    
    if (!this.services.BIP38Service) {
      throw new Error('BIP38Service not available');
    }

    const decrypted = await this.services.BIP38Service.decrypt(
      encryptedKey,
      passphrase
    );

    console.log(`      → Decrypted private key`);
    
    return decrypted;
  }

  /**
   * Dérive une clé BIP32
   */
  async executeDeriveKey(params) {
    const { masterKey, path } = params;
    
    if (!this.services.BIP32Service) {
      throw new Error('BIP32Service not available');
    }

    const derived = await this.services.BIP32Service.derive(masterKey, path);
    console.log(`      → Derived key at path: ${path}`);
    
    return derived;
  }

  /**
   * Valide une adresse
   */
  async executeValidateAddress(params) {
    const { address, blockchain } = params;
    
    if (!this.services.AddressValidator) {
      throw new Error('AddressValidator not available');
    }

    const isValid = await this.services.AddressValidator.validate(
      address,
      blockchain
    );

    console.log(`      → Address validation: ${isValid}`);
    
    return isValid;
  }

  /**
   * Calcule un checksum
   */
  async executeComputeChecksum(params) {
    const { data, algorithm } = params;
    
    if (!this.services.ChecksumService) {
      throw new Error('ChecksumService not available');
    }

    const checksum = await this.services.ChecksumService.compute(
      data,
      algorithm || 'sha256'
    );

    console.log(`      → Computed checksum`);
    
    return checksum;
  }

  /**
   * Résout les paramètres avec variables
   * @param {object} params - Paramètres à résoudre
   * @returns {object} Paramètres résolus
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
   * Résout une variable ($variable)
   * @param {any} value - Valeur à résoudre
   * @returns {any} Valeur résolue
   */
  resolveVariable(value) {
    if (typeof value === 'string' && value.startsWith('$')) {
      const varName = value.substring(1);
      
      if (!(varName in this.context)) {
        throw new Error(`Undefined variable: ${value}`);
      }
      
      return this.context[varName];
    }
    
    return value;
  }

  /**
   * Vérifie une assertion
   * @param {object} assertion - Assertion à vérifier
   * @returns {object} Résultat de l'assertion
   */
  async checkAssertion(assertion) {
    const result = {
      passed: false,
      message: '',
      expected: null,
      actual: null
    };

    try {
      const actualValue = this.resolveVariable(assertion.property);
      result.actual = actualValue;

      // Vérification selon le type d'assertion
      if ('equals' in assertion) {
        const expected = this.resolveVariable(assertion.equals);
        result.expected = expected;
        result.passed = actualValue === expected;
        result.message = result.passed
          ? `Value equals ${expected}`
          : `Expected ${expected}, got ${actualValue}`;
      }
      else if ('notEquals' in assertion) {
        const notExpected = this.resolveVariable(assertion.notEquals);
        result.expected = `not ${notExpected}`;
        result.passed = actualValue !== notExpected;
        result.message = result.passed
          ? `Value not equals ${notExpected}`
          : `Should not equal ${notExpected}`;
      }
      else if ('hasLength' in assertion) {
        const expectedLength = assertion.hasLength;
        result.expected = `length ${expectedLength}`;
        const actualLength = Array.isArray(actualValue) 
          ? actualValue.length 
          : actualValue.toString().length;
        result.passed = actualLength === expectedLength;
        result.message = result.passed
          ? `Length is ${expectedLength}`
          : `Expected length ${expectedLength}, got ${actualLength}`;
      }
      else if ('matches' in assertion) {
        const pattern = new RegExp(assertion.matches);
        result.expected = `matches /${assertion.matches}/`;
        result.passed = pattern.test(actualValue);
        result.message = result.passed
          ? `Value matches pattern`
          : `Value does not match pattern /${assertion.matches}/`;
      }
      else if ('greaterThan' in assertion) {
        const threshold = assertion.greaterThan;
        result.expected = `> ${threshold}`;
        result.passed = actualValue > threshold;
        result.message = result.passed
          ? `Value ${actualValue} > ${threshold}`
          : `Value ${actualValue} not > ${threshold}`;
      }
      else if ('lessThan' in assertion) {
        const threshold = assertion.lessThan;
        result.expected = `< ${threshold}`;
        result.passed = actualValue < threshold;
        result.message = result.passed
          ? `Value ${actualValue} < ${threshold}`
          : `Value ${actualValue} not < ${threshold}`;
      }
      else if ('contains' in assertion) {
        const substring = this.resolveVariable(assertion.contains);
        result.expected = `contains "${substring}"`;
        result.passed = actualValue.includes(substring);
        result.message = result.passed
          ? `Value contains "${substring}"`
          : `Value does not contain "${substring}"`;
      }
      else if ('isTrue' in assertion) {
        result.expected = 'true';
        result.passed = actualValue === true;
        result.message = result.passed
          ? `Value is true`
          : `Expected true, got ${actualValue}`;
      }
      else if ('isFalse' in assertion) {
        result.expected = 'false';
        result.passed = actualValue === false;
        result.message = result.passed
          ? `Value is false`
          : `Expected false, got ${actualValue}`;
      }
      else if ('isDefined' in assertion) {
        result.expected = 'defined';
        result.passed = actualValue !== undefined && actualValue !== null;
        result.message = result.passed
          ? `Value is defined`
          : `Value is undefined or null`;
      }

      const status = result.passed ? '✓' : '✗';
      console.log(`      ${status} ${result.message}`);

    } catch (error) {
      result.passed = false;
      result.message = `Assertion error: ${error.message}`;
      console.error(`      ✗ ${result.message}`);
    }

    return result;
  }

  /**
   * Récupère la valeur d'une variable du contexte
   * @param {string} varName - Nom de la variable
   * @returns {any} Valeur de la variable
   */
  getContextVariable(varName) {
    return this.context[varName];
  }

  /**
   * Récupère tout le contexte
   * @returns {object} Contexte complet
   */
  getContext() {
    return { ...this.context };
  }
}

module.exports = DSLInterpreter;
