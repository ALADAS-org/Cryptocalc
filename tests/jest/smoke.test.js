/**
 * ============================================================================
 * Smoke Test - Verify Jest Configuration
 * ============================================================================
 * Simple test to verify that Jest is properly configured
 * ============================================================================
 */

// Import PrettyLog and log mode constant to disable console.log from production code
const { PrettyLog, UNIT_TESTS_LOG_MODE } = require('@util/log/log_utils.js');

describe('Jest Configuration', () => {
  
  beforeAll(() => {
    // Disable console.log from pretty_log() calls in production code
    PrettyLog.This.logMode = UNIT_TESTS_LOG_MODE;
  });
  
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
  });

  test('can access global TEST_MODE variable', () => {
    expect(TEST_MODE).toBe(true);
  });

  test('can access CRYPTO_CONFIG globals', () => {
    expect(CRYPTO_CONFIG).toBeDefined();
    expect(CRYPTO_CONFIG.SUPPORTED_COINS).toContain('bitcoin');
    expect(CRYPTO_CONFIG.ENTROPY_SIZES).toContain(256);
  });

  test('can access TEST_PATHS globals', () => {
    expect(TEST_PATHS).toBeDefined();
    expect(TEST_PATHS.root).toBeDefined();
    expect(TEST_PATHS.fixtures).toBeDefined();
  });
});
