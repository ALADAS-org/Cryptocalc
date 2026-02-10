const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * DSL Parser - Charge et valide les scripts de tests YAML
 */
class DSLParser {
  constructor() {
    this.requiredFields = ['name', 'tests'];
    this.validActions = [
      'generateEntropy',
      'generateWallet',
      'save',
      'encrypt',
      'decrypt',
      'deriveKey',
      'validateAddress',
      'computeChecksum'
    ];
  }

  /**
   * Charge un fichier YAML de test
   * @param {string} filepath - Chemin vers le fichier YAML
   * @returns {object} Suite de tests parsée
   */
  parse(filepath) {
    try {
      const absolutePath = path.resolve(filepath);
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Test file not found: ${absolutePath}`);
      }

      const content = fs.readFileSync(absolutePath, 'utf8');
      const testSuite = yaml.load(content);
      
      this.validate(testSuite);
      
      return testSuite;
    } catch (error) {
      throw new Error(`Failed to parse DSL file: ${error.message}`);
    }
  }

  /**
   * Valide la structure d'une suite de tests
   * @param {object} testSuite - Suite de tests à valider
   * @returns {boolean} true si valide
   */
  validate(testSuite) {
    // Vérification des champs requis
    for (const field of this.requiredFields) {
      if (!testSuite[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validation du format des tests
    if (!Array.isArray(testSuite.tests)) {
      throw new Error('Field "tests" must be an array');
    }

    // Validation de chaque test
    testSuite.tests.forEach((test, index) => {
      this.validateTest(test, index);
    });

    return true;
  }

  /**
   * Valide un test individuel
   * @param {object} test - Test à valider
   * @param {number} index - Index du test dans la suite
   */
  validateTest(test, index) {
    if (!test.name) {
      throw new Error(`Test at index ${index} is missing a name`);
    }

    if (!test.steps || !Array.isArray(test.steps)) {
      throw new Error(`Test "${test.name}" must have a "steps" array`);
    }

    // Validation de chaque étape
    test.steps.forEach((step, stepIndex) => {
      this.validateStep(step, test.name, stepIndex);
    });

    // Validation des assertions si présentes
    if (test.assertions && !Array.isArray(test.assertions)) {
      throw new Error(`Test "${test.name}": assertions must be an array`);
    }
  }

  /**
   * Valide une étape de test
   * @param {object} step - Étape à valider
   * @param {string} testName - Nom du test parent
   * @param {number} stepIndex - Index de l'étape
   */
  validateStep(step, testName, stepIndex) {
    if (!step.action) {
      throw new Error(
        `Test "${testName}", step ${stepIndex}: missing "action" field`
      );
    }

    if (!this.validActions.includes(step.action)) {
      throw new Error(
        `Test "${testName}", step ${stepIndex}: ` +
        `invalid action "${step.action}". ` +
        `Valid actions: ${this.validActions.join(', ')}`
      );
    }

    // Les actions doivent avoir soit assign soit target
    if (step.action !== 'save' && !step.assign) {
      console.warn(
        `Test "${testName}", step ${stepIndex}: ` +
        `action "${step.action}" without "assign" - result will be lost`
      );
    }
  }

  /**
   * Charge plusieurs fichiers de tests
   * @param {string} directory - Répertoire contenant les tests
   * @returns {Array} Liste des suites de tests
   */
  parseDirectory(directory) {
    const testFiles = fs.readdirSync(directory)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    return testFiles.map(file => {
      const filepath = path.join(directory, file);
      return this.parse(filepath);
    });
  }
}

module.exports = DSLParser;
