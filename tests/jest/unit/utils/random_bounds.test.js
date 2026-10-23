/**
 * ============================================================================
 * Unit tests - callers of getRandomInt()  (Modification 5.1)
 * ============================================================================
 * getRandomInt(n) now returns an integer in [0, n-1] (n EXCLUDED).
 *
 * - Index callers (fortune cookie, random crypto logo) were out of range
 *   1 time out of n+1: they are now always in range.
 * - Range callers (D6 dice, mouse entropy, SWORD account / address index)
 *   keep EXACTLY their previous range (their argument became 'n + 1').
 *
 * Extreme values are forced by mocking crypto.getRandomValues():
 *   0x00000000 => smallest possible value, 0xFFFFFFFF => largest possible value
 * ============================================================================
 */
// Partial mock of 'crypto': getRandomValues() is the real one unless a value is forced
// (NB: 'crypto.getRandomValues' is not configurable, so jest.spyOn() cannot be used)
let mockForcedUint32 = null;
let mockForcedDraws  = Infinity; // number of draws using the forced value, then real random values
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    getRandomValues: jest.fn((array) => {
      if (mockForcedUint32 === null || mockForcedDraws <= 0) return actual.getRandomValues(array);
      mockForcedDraws--;
      return array.fill(mockForcedUint32);
    }),
  };
});

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

const { getRandomInt } = require('@crypto/hex_utils.js');
const { getFortuneCookie } = require('@util/fortune/fortune.js');

const WWW_JS_DIR = path.join(__dirname, '../../../../www/js');
const SOURCES = {
  DICE:          path.join(WWW_JS_DIR, 'crypto/entropy_source/draw_entropy_dice_d6.js'),
  MOUSE:         path.join(WWW_JS_DIR, 'crypto/entropy_source/draw_entropy_mouse_move.js'),
  MAIN_GUI:      path.join(WWW_JS_DIR, 'view/main_gui.js'),
  ELECTRON_MAIN: path.join(WWW_JS_DIR, '_main/electron_main.js'),
};

const MIN_UINT32     = 0x00000000;
const MAX_UINT32     = 0xFFFFFFFF;
const FORTUNE_DRAWS  = 10000;
const DICE_MIN       = 1;
const DICE_MAX       = 6;
const ENTROPY_BITS   = 256;

// Mouse canvas (values of 'DrawE_Mouse' in draw_entropy_mouse_move.js)
const MOUSE = {
  CANVAS_WIDTH: 500, CANVAS_HEIGHT: 150,
  MARGINS: { left: 10, right: 10, top: 10, bottom: 25 },
  MIN_THRESHOLD: 20, THRESHOLD_VARIANCE: 60,
};

// 'draws': number of draws using the forced value (default: all of them)
const withForcedRandom = async (uint32_value, fn, draws = Infinity) => {
  mockForcedUint32 = uint32_value;
  mockForcedDraws  = draws;
  try     { return await fn(); }
  finally { mockForcedUint32 = null; mockForcedDraws = Infinity; }
};

// Inert proxy for the browser-only globals (p5, document...) of Renderer scripts
const makeStub = (name) => new Proxy(function () {}, {
  get(target, prop) {
    if (prop === Symbol.toPrimitive || prop === 'toString') return () => name;
    if (prop === 'then') return undefined;
    return makeStub(name + '.' + String(prop));
  },
  apply()     { return makeStub(name + '()'); },
  construct() { return makeStub('new ' + name); },
});

// Loads a Renderer script in a 'vm' context with the REAL getRandomInt()
// and returns the requested top-level bindings
const loadRendererScript = (file_path, names) => {
  const exported = {};
  const context = {
    getRandomInt, console, Math, Number, BigInt, Symbol, JSON, Object, Array, String, Error, parseInt,
    p5: makeStub('p5'), document: makeStub('document'), window: makeStub('window'),
    getRandomByte: () => 0, decimalToHex: () => '00',
    __exported: exported,
  };
  const source = fs.readFileSync(file_path, 'utf8')
    + '\n' + names.map((name) => `__exported.${name} = ${name};`).join('\n');
  vm.runInNewContext(source, context, { filename: path.basename(file_path) });
  return exported;
};

// ---------------------------------------------------------------------------
// Index callers: always in range
// ---------------------------------------------------------------------------
describe('getFortuneCookie() (index caller)', () => {
  test(`${FORTUNE_DRAWS} draws: never an exception, always a non-empty string`, () => {
    for (let i = 0; i < FORTUNE_DRAWS; i++) {
      const cookie = getFortuneCookie();
      expect(typeof cookie).toBe('string');
      expect(cookie.length).toBeGreaterThan(0);
    }
  });

  // NB: only the FIRST draw is forced: getFortuneCookie() redraws when it gets an empty line
  test('largest random value on first draw => no exception (index was out of range before 5.1)', async () => {
    const cookie = await withForcedRandom(MAX_UINT32, () => getFortuneCookie(), 1);
    expect(typeof cookie).toBe('string');
    expect(cookie.length).toBeGreaterThan(0);
  });
});

describe('Random crypto logo of electron_main.js (index caller)', () => {
  test('index is drawn with getRandomInt( crypto_logos.length ) (no +1, no -1)', () => {
    const source = fs.readFileSync(SOURCES.ELECTRON_MAIN, 'utf8');
    expect(source).toMatch(/random_index\s*=\s*getRandomInt\(\s*crypto_logos\.length\s*\)/);
  });
});

// ---------------------------------------------------------------------------
// Range callers: previous range kept exactly
// ---------------------------------------------------------------------------
describe('D6 dice entropy (range caller: [1, 6] unchanged)', () => {
  const makeDice = () => {
    const { DrawEntropyDiceD6 } = loadRendererScript(SOURCES.DICE, ['DrawEntropyDiceD6']);
    const dice  = DrawEntropyDiceD6.GetInstance();
    const rolls = [];
    dice.drawDice = (index, value) => rolls.push(value);
    return { dice, rolls };
  };

  test('every roll of a 256-bit generation is in [1, 6] and all faces appear', () => {
    const { dice, rolls } = makeDice();
    for (let i = 0; i < 20; i++) dice.generateEntropy(ENTROPY_BITS);
    expect(Math.min(...rolls)).toBe(DICE_MIN);
    expect(Math.max(...rolls)).toBe(DICE_MAX);
    expect(new Set(rolls).size).toBe(DICE_MAX);
  });

  test('smallest random value => 1, largest => 6', async () => {
    const low  = makeDice();
    await withForcedRandom(MIN_UINT32, () => low.dice.generateEntropy(ENTROPY_BITS));
    expect(new Set(low.rolls)).toEqual(new Set([DICE_MIN]));

    const high = makeDice();
    await withForcedRandom(MAX_UINT32, () => high.dice.generateEntropy(ENTROPY_BITS));
    expect(new Set(high.rolls)).toEqual(new Set([DICE_MAX]));
  });
});

describe('Mouse entropy (range callers: previous ranges unchanged)', () => {
  const X_MIN = MOUSE.MARGINS.left;
  const X_MAX = MOUSE.CANVAS_WIDTH  - MOUSE.MARGINS.right;
  const Y_MIN = MOUSE.MARGINS.top;
  const Y_MAX = MOUSE.CANVAS_HEIGHT - MOUSE.MARGINS.bottom;

  const { generate_random_point, DrawE_Mouse } =
    loadRendererScript(SOURCES.MOUSE, ['generate_random_point', 'DrawE_Mouse']);

  test('canvas constants are those used by this test', () => {
    expect(DrawE_Mouse.CANVAS_WIDTH).toBe(MOUSE.CANVAS_WIDTH);
    expect(DrawE_Mouse.CANVAS_HEIGHT).toBe(MOUSE.CANVAS_HEIGHT);
    expect({ ...DrawE_Mouse.MARGINS }).toEqual(MOUSE.MARGINS);
  });

  test('smallest random value => point (left margin, top margin)', async () => {
    const point = await withForcedRandom(MIN_UINT32, () => generate_random_point());
    expect({ x: point.x, y: point.y }).toEqual({ x: X_MIN, y: Y_MIN });
  });

  test('largest random value => point (WIDTH - right margin, HEIGHT - bottom margin)', async () => {
    const point = await withForcedRandom(MAX_UINT32, () => generate_random_point());
    expect({ x: point.x, y: point.y }).toEqual({ x: X_MAX, y: Y_MAX });
  });

  test('threshold draws keep the range [MIN_THRESHOLD, MIN_THRESHOLD + THRESHOLD_VARIANCE]', () => {
    const source = fs.readFileSync(SOURCES.MOUSE, 'utf8');
    const calls  = source.match(/getRandomInt\(\s*DrawE_Mouse\.THRESHOLD_VARIANCE[^)]*\)/g);
    expect(calls).toHaveLength(3);
    calls.forEach((call) => expect(call).toMatch(/THRESHOLD_VARIANCE\s*\+\s*1\s*\)/));
  });
});

describe('SWORD wallet mode (range callers: [0, MAX] unchanged)', () => {
  const source = fs.readFileSync(SOURCES.MAIN_GUI, 'utf8');

  test('account is drawn in [0, ACCOUNT_MAX]', () => {
    expect(source).toMatch(/account\s*=\s*getRandomInt\(\s*ACCOUNT_MAX\s*\+\s*1\s*\)/);
  });

  test('address index is drawn in [0, ADDRESS_INDEX_MAX]', () => {
    expect(source).toMatch(/address_index\s*=\s*getRandomInt\(\s*ADDRESS_INDEX_MAX\s*\+\s*1\s*\)/);
  });
});

describe('All callers of getRandomInt() are covered by this test file', () => {
  const EXPECTED_CALLS = {
    'util/fortune/fortune.js':                         1,
    'crypto/entropy_source/draw_entropy_dice_d6.js':   2,
    'crypto/entropy_source/draw_entropy_mouse_move.js': 5,
    'view/main_gui.js':                                2,
    '_main/electron_main.js':                          1,
  };

  test.each(Object.entries(EXPECTED_CALLS))('%s: %i active call(s)', (file, count) => {
    const active_calls = fs.readFileSync(path.join(WWW_JS_DIR, file), 'utf8')
      .split('\n')
      .filter((line) => ! line.trim().startsWith('//'))
      .join('\n')
      .match(/getRandomInt\(/g) || [];
    expect(active_calls).toHaveLength(count);
  });
});
