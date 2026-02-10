const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * Parser pour les scripts DSL en YAML
 * Charge, analyse et valide la structure des fichiers de tests
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
      'deriveAddress',
      'validateMnemonic',
      'convertToMnemonic',
      'convertToEntropy'
    ];
  }

  /**
   * Parse un fichier YAML de test
   * @param {string} filepath - Chemin vers le fichier YAML
   * @returns {Object} Structure de test parsée
   */
  parse(filepath) {
    try {
      const absolutePath = path.resolve(filepath);
      const content = fs.readFileSync(absolutePath, 'utf8');
      const testSuite = yaml.load(content);
      
      this.validate(testSuite);
      return testSuite;
    } catch (error) {
      throw new Error(`Failed to parse DSL file ${filepath}: ${error.message}`);
    }
  }

  /**
   * Valide la structure du test suite
   * @param {Object} testSuite - Structure à valider
   */
  validate(testSuite) {
    // Vérification des champs requis
    for (const field of this.requiredFields) {
      if (!testSuite[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validation que tests est un tableau
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
   * @param {Object} test - Test à valider
   * @param {number} index - Index du test dans le suite
   */
  validateTest(test, index) {
    if (!test.name) {
      throw new Error(`Test at index ${index} is missing a name`);
    }

    if (!test.steps || !Array.isArray(test.steps)) {
      throw new Error(`Test "${test.name}" must have a steps array`);
    }

    // Validation de chaque step
    test.steps.forEach((step, stepIndex) => {
      this.validateStep(step, test.name, stepIndex);
    });

    // Validation des assertions si présentes
    if (test.assertions && !Array.isArray(test.assertions)) {
      throw new Error(`Test "${test.name}" assertions must be an array`);
    }
  }

  /**
   * Valide un step individuel
   * @param {Object} step - Step à valider
   * @param {string} testName - Nom du test parent
   * @param {number} stepIndex - Index du step
   */
  validateStep(step, testName, stepIndex) {
    if (!step.action) {
      throw new Error(
        `Step ${stepIndex} in test "${testName}" is missing an action`
      );
    }

    if (!this.validActions.includes(step.action)) {
      throw new Error(
        `Invalid action "${step.action}" in test "${testName}". ` +
        `Valid actions: ${this.validActions.join(', ')}`
      );
    }

    // Validation spécifique selon l'action
    switch (step.action) {
      case 'generateEntropy':
        if (!step.params || !step.params.size) {
          throw new Error(
            `Action generateEntropy requires params.size in test "${testName}"`
          );
        }
        break;
      
      case 'generateWallet':
        if (!step.params || !step.params.type || !step.params.entropy) {
          throw new Error(
            `Action generateWallet requires params.type and params.entropy ` +
            `in test "${testName}"`
          );
        }
        break;
    }
  }

  /**
   * Parse tous les fichiers YAML dans un répertoire
   * @param {string} dirPath - Chemin du répertoire
   * @returns {Array} Liste des test suites parsés
   */
  parseDirectory(dirPath) {
    const absolutePath = path.resolve(dirPath);
    const files = fs.readdirSync(absolutePath)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    
    return files.map(file => {
      const filepath = path.join(absolutePath, file);
      return {
        file: file,
        suite: this.parse(filepath)
      };
    });
  }
}

module.exports = DSLParser;
