const DSLParser = require('../src/dsl/parser');
const DSLInterpreter = require('../src/dsl/interpreter');
const {
  MockCryptoService,
  MockBIP38Service,
  MockBIP32Service,
  MockAddressValidator,
  MockChecksumService
} = require('../src/dsl/mock-services');

const path = require('path');

describe('DSL Test Runner', () => {
  let parser;
  let interpreter;

  beforeAll(() => {
    parser = new DSLParser();
    
    // Injection des services mockés
    interpreter = new DSLInterpreter({
      CryptoService: new MockCryptoService(),
      BIP38Service: new MockBIP38Service(),
      BIP32Service: new MockBIP32Service(),
      AddressValidator: new MockAddressValidator(),
      ChecksumService: new MockChecksumService()
    });
  });

  beforeEach(() => {
    // Réinitialiser le contexte avant chaque test
    interpreter.reset();
  });

  describe('HD Wallet Generation Tests', () => {
    it('should execute HD wallet BTC test suite', async () => {
      const testFile  = path.join(__dirname, 'fixtures', 'test_hd_wallet_btc.yaml');
      const testSuite = parser.parse(testFile);
      
      expect(testSuite).toBeDefined();
      expect(testSuite.name).toBe('HD Wallet Generation - Bitcoin');
      
      const results = await interpreter.executeTestSuite(testSuite);
      
      // Vérifier que tous les tests ont réussi
      for (const result of results) {
        expect(result.success).toBe(true);
        expect(result.errors.length).toBe(0);
      }
    });
  });

  describe('Multi-Blockchain Tests', () => {
    it('should execute multi-blockchain test suite', async () => {
      const testFile = path.join(__dirname, 'fixtures', 'test_multi_blockchain.yaml');
      const testSuite = parser.parse(testFile);
      
      expect(testSuite).toBeDefined();
      
      const results = await interpreter.executeTestSuite(testSuite);
      
      // Vérifier les résultats
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });

  describe('BIP38 Encryption Tests', () => {
    it('should execute BIP38 encryption test suite', async () => {
      const testFile = path.join(__dirname, 'fixtures', 'test_bip38.yaml');
      const testSuite = parser.parse(testFile);
      
      expect(testSuite).toBeDefined();
      
      const results = await interpreter.executeTestSuite(testSuite);
      
      // Vérifier les résultats
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Address Validation Tests', () => {
    it('should execute address validation test suite', async () => {
      const testFile = path.join(__dirname, 'fixtures', 'test_address_validation.yaml');
      const testSuite = parser.parse(testFile);
      
      expect(testSuite).toBeDefined();
      
      const results = await interpreter.executeTestSuite(testSuite);
      
      // Vérifier les résultats
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Context and Variable Resolution', () => {
    it('should correctly resolve variables', async () => {
      const testSuite = {
        name: 'Variable Test',
        tests: [{
          name: 'Test variables',
          steps: [
            {
              action: 'generateEntropy',
              params: { size: 128 },
              assign: 'myEntropy'
            }
          ],
          assertions: []
        }]
      };

      await interpreter.executeTestSuite(testSuite);
      
      const entropy = interpreter.getContextVariable('myEntropy');
      expect(entropy).toBeDefined();
      expect(entropy.length).toBe(32); // 128 bits = 32 hex chars
    });

    it('should throw error for undefined variable', async () => {
      const testSuite = {
        name: 'Undefined Variable Test',
        tests: [{
          name: 'Use undefined variable',
          steps: [
            {
              action: 'generateWallet',
              params: {
                type: 'HD_WALLET',
                entropy: '$undefinedVar'
              },
              assign: 'wallet'
            }
          ],
          assertions: []
        }]
      };

      const results = await interpreter.executeTestSuite(testSuite);
      expect(results[0].success).toBe(false);
      expect(results[0].errors.length).toBeGreaterThan(0);
    });
  });

  describe('Assertion Types', () => {
    it('should validate equals assertion', async () => {
      interpreter.context.testValue = 'hello';
      
      const assertion = {
        property: '$testValue',
        equals: 'hello'
      };
      
      const result = await interpreter.checkAssertion(assertion);
      expect(result.passed).toBe(true);
    });

    it('should validate hasLength assertion', async () => {
      interpreter.context.testArray = [1, 2, 3, 4, 5];
      
      const assertion = {
        property: '$testArray',
        hasLength: 5
      };
      
      const result = await interpreter.checkAssertion(assertion);
      expect(result.passed).toBe(true);
    });

    it('should validate matches assertion', async () => {
      interpreter.context.testString = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      
      const assertion = {
        property: '$testString',
        matches: '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'
      };
      
      const result = await interpreter.checkAssertion(assertion);
      expect(result.passed).toBe(true);
    });

    it('should validate isDefined assertion', async () => {
      interpreter.context.definedValue = 'something';
      
      const assertion = {
        property: '$definedValue',
        isDefined: true
      };
      
      const result = await interpreter.checkAssertion(assertion);
      expect(result.passed).toBe(true);
    });

    it('should validate isTrue/isFalse assertions', async () => {
      interpreter.context.trueValue = true;
      interpreter.context.falseValue = false;
      
      const trueAssertion = {
        property: '$trueValue',
        isTrue: true
      };
      
      const falseAssertion = {
        property: '$falseValue',
        isFalse: true
      };
      
      const trueResult = await interpreter.checkAssertion(trueAssertion);
      const falseResult = await interpreter.checkAssertion(falseAssertion);
      
      expect(trueResult.passed).toBe(true);
      expect(falseResult.passed).toBe(true);
    });

    it('should validate greaterThan/lessThan assertions', async () => {
      interpreter.context.numValue = 50;
      
      const gtAssertion = {
        property: '$numValue',
        greaterThan: 25
      };
      
      const ltAssertion = {
        property: '$numValue',
        lessThan: 100
      };
      
      const gtResult = await interpreter.checkAssertion(gtAssertion);
      const ltResult = await interpreter.checkAssertion(ltAssertion);
      
      expect(gtResult.passed).toBe(true);
      expect(ltResult.passed).toBe(true);
    });

    it('should validate contains assertion', async () => {
      interpreter.context.textValue = 'Hello World';
      
      const assertion = {
        property: '$textValue',
        contains: 'World'
      };
      
      const result = await interpreter.checkAssertion(assertion);
      expect(result.passed).toBe(true);
    });
  });

  describe('Parser Validation', () => {
    it('should reject invalid YAML structure', () => {
      const invalidSuite = {
        name: 'Invalid Test'
        // Missing 'tests' array
      };
      
      expect(() => parser.validate(invalidSuite)).toThrow('Missing required field: tests');
    });

    it('should reject invalid action', () => {
      const invalidSuite = {
        name: 'Invalid Action',
        tests: [{
          name: 'Test',
          steps: [{
            action: 'invalidAction'
          }]
        }]
      };
      
      expect(() => parser.validate(invalidSuite)).toThrow(/invalid action/);
    });
  });

  describe('Integration Tests', () => {
    it('should execute complete wallet generation workflow', async () => {
      const testSuite = {
        name: 'Complete Workflow',
        setup: {
          entropy_size: 256,
          blockchain: 'BTC',
          wallet_mode: 'HD_WALLET'
        },
        tests: [{
          name: 'Generate, encrypt, save',
          steps: [
            {
              action: 'generateEntropy',
              params: { size: 256 },
              assign: 'entropy'
            },
            {
              action: 'generateWallet',
              params: {
                type: 'HD_WALLET',
                entropy: '$entropy',
                blockchain: 'BTC'
              },
              assign: 'wallet'
            },
            {
              action: 'encrypt',
              params: {
                privateKey: '$wallet.privateKey',
                passphrase: 'SecurePass123'
              },
              assign: 'encrypted'
            },
            {
              action: 'save',
              target: '$wallet',
              assign: 'saveResult'
            }
          ],
          assertions: [
            { property: '$wallet.address', matches: '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$' },
            { property: '$encrypted', matches: '^6PR' },
            { property: '$saveResult.success', isTrue: true }
          ]
        }]
      };

      const results = await interpreter.executeTestSuite(testSuite);
      expect(results[0].success).toBe(true);
    });
  });
});
