// tests/unit/utils/hex_utils.test.js
const { uint8ArrayToHex } = require('../../../www/js/crypto/hex_utils');

describe('Hex Utils depuis www/js/', () => {
  test('uint8ArrayToHex fonctionne', () => {
    const arr = new Uint8Array([0, 255, 16, 32]);
    const result = uint8ArrayToHex(arr);
    
    expect(result).toBe('00ff1020');
  });
  
  test('uint8ArrayToHex avec tableau vide', () => {
    const arr = new Uint8Array([]);
    const result = uint8ArrayToHex(arr);
    
    expect(result).toBe('');
  });
});