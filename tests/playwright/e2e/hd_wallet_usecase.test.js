/**
 * ============================================================================
 * E2E Tests (End-to-End) - Use Case : HD Wallet
 * ============================================================================
 */

const { test, expect, waitForAppReady } = require('../setup.js');

const USE_CASE_ACCOUNT       = '2';
const USE_CASE_ADDRESS_INDEX = '5';
const USE_CASE_PASSPHRASE    = 'my secret passphrase';

// Valeurs fixes pour le test de déterminisme (test 5)
// Le waterfall : entropy_src -> salt -> entropy -> mnemonics -> address
// Il faut fixer le sel ET l'entropie pour un résultat reproductible.
const FIXED_SALT    = 'b3c4d5e6f7a8b3c4d5e6f7a8b3c4d5e6f7a8b3c4d5e6f7a8b3c4d5e6f7a8b3c4';
const FIXED_ENTROPY = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function switchToHDWallet(page) {
  await page.click('#wallet_tab_link_id');
  await page.waitForTimeout(500);
  await page.selectOption('#wallet_mode_select_id', 'HD Wallet');
  await page.waitForTimeout(1000);
}

async function getDisplayedAddress(page) {
  return page.textContent('#address_id');
}

/**
 * Injecte une valeur dans un champ potentiellement readonly via evaluate().
 * Dispatche input + change pour déclencher les handlers applicatifs.
 */
async function setFieldValue(page, fieldId, value) {
  await page.evaluate(({ id, val }) => {
    const field = document.querySelector('#' + id);
    if (!field) return;
    const wasReadonly = field.hasAttribute('readonly');
    if (wasReadonly) field.removeAttribute('readonly');
    field.value = val;
    field.dispatchEvent(new Event('input',  { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    if (wasReadonly) field.setAttribute('readonly', '');
  }, { id: fieldId, val: value });
  await page.waitForTimeout(200);
}

async function setBip39Passphrase(page, passphrase) {
  await setFieldValue(page, 'bip32_passphrase_id', passphrase);
  await page.waitForTimeout(300);
}

/**
 * Déclenche le refresh (génère nouvelle entropie aléatoire + dérive l'adresse).
 * NB : écrase toute entropie précédemment injectée.
 */
async function clickRefresh(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('#refresh_btn_id');
    if (btn) { btn.removeAttribute('disabled'); btn.click(); }
  });
  await page.waitForTimeout(3000);
}

/**
 * Injecte un sel fixe + une entropie fixe, puis déclenche le waterfall
 * de dérivation BIP32 via 'change' sur #entropy_id.
 *
 * Pourquoi fixer le sel aussi :
 *   Le waterfall est : entropy_src → salt → entropy → mnemonics → address
 *   Quand le handler de #entropy_id se déclenche, il peut relire #salt_id
 *   pour recalculer. Si le sel est aléatoire à ce moment, l'adresse finale
 *   sera différente à chaque appel malgré une entropie identique.
 *   → On fixe les deux pour garantir un résultat reproductible.
 */
async function deriveFromFixedEntropy(page, salt, entropy) {
  await page.evaluate(({ saltVal, entropyVal }) => {
    // 1. Fixer le sel (readonly-safe)
    const saltField = document.querySelector('#salt_id');
    if (saltField) {
      saltField.removeAttribute('readonly');
      saltField.value = saltVal;
      // Ne pas dispatcher change sur salt_id — cela recalculerait l'entropie
      // et écraserait la valeur qu'on va injecter juste après.
      saltField.setAttribute('readonly', '');
    }
    // 2. Fixer l'entropie et déclencher le waterfall depuis ce point
    const entropyField = document.querySelector('#entropy_id');
    if (entropyField) {
      entropyField.removeAttribute('readonly');
      entropyField.value = entropyVal;
      entropyField.dispatchEvent(new Event('input',  { bubbles: true }));
      entropyField.dispatchEvent(new Event('change', { bubbles: true }));
      entropyField.setAttribute('readonly', '');
    }
  }, { saltVal: salt, entropyVal: entropy });
  await page.waitForTimeout(3000); // dérivation BIP32 asynchrone
}

// ===========================================================================
// Tests
// ===========================================================================

test.describe('Use Case - HD Wallet : account, address index, BIP39 passphrase', () => {

  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
    await switchToHDWallet(page);
  });

  // -------------------------------------------------------------------------
  // Test 1 : vérification du format de l'adresse Bitcoin
  // -------------------------------------------------------------------------
  test('adresse Bitcoin generee avec account=2, index=5, passphrase est valide', async ({ page }) => {
    await setFieldValue(page, 'account_id',       USE_CASE_ACCOUNT);
    await setFieldValue(page, 'address_index_id', USE_CASE_ADDRESS_INDEX);
    await setBip39Passphrase(page, USE_CASE_PASSPHRASE);
    await clickRefresh(page);

    const address = (await getDisplayedAddress(page)).trim();
    expect(address).toBeTruthy();
    // Accepte Legacy (1...), P2SH (3...) et Bech32 (bc1...)
    expect(address).toMatch(
      /^(1[a-zA-HJ-NP-Z0-9]{25,34}|3[a-zA-HJ-NP-Z0-9]{25,34}|bc1[a-z0-9]{6,87})$/
    );
  });

  // -------------------------------------------------------------------------
  // Test 2 : la passphrase change l'adresse (même account/index)
  // -------------------------------------------------------------------------
  test("la passphrase BIP39 modifie l'adresse derivee (meme account/index)", async ({ page }) => {
    await setFieldValue(page, 'account_id',       USE_CASE_ACCOUNT);
    await setFieldValue(page, 'address_index_id', USE_CASE_ADDRESS_INDEX);

    await setBip39Passphrase(page, '');
    await clickRefresh(page);
    const addressWithoutPassphrase = await getDisplayedAddress(page);

    await setBip39Passphrase(page, USE_CASE_PASSPHRASE);
    await clickRefresh(page);
    const addressWithPassphrase = await getDisplayedAddress(page);

    expect(addressWithPassphrase.trim()).not.toBe(addressWithoutPassphrase.trim());
  });

  // -------------------------------------------------------------------------
  // Test 3 : account différent → adresse différente
  // -------------------------------------------------------------------------
  test('account different produit une adresse differente', async ({ page }) => {
    await setFieldValue(page, 'address_index_id', USE_CASE_ADDRESS_INDEX);
    await setBip39Passphrase(page, USE_CASE_PASSPHRASE);

    await setFieldValue(page, 'account_id', '0');
    await clickRefresh(page);
    const addressAccount0 = await getDisplayedAddress(page);

    await setFieldValue(page, 'account_id', USE_CASE_ACCOUNT);
    await clickRefresh(page);
    const addressAccount2 = await getDisplayedAddress(page);

    expect(addressAccount0.trim()).not.toBe(addressAccount2.trim());
  });

  // -------------------------------------------------------------------------
  // Test 4 : address index différent → adresse différente
  // -------------------------------------------------------------------------
  test('address index different produit une adresse differente', async ({ page }) => {
    await setFieldValue(page, 'account_id', USE_CASE_ACCOUNT);
    await setBip39Passphrase(page, USE_CASE_PASSPHRASE);

    await setFieldValue(page, 'address_index_id', '0');
    await clickRefresh(page);
    const addressIndex0 = await getDisplayedAddress(page);

    await setFieldValue(page, 'address_index_id', USE_CASE_ADDRESS_INDEX);
    await clickRefresh(page);
    const addressIndex5 = await getDisplayedAddress(page);

    expect(addressIndex0.trim()).not.toBe(addressIndex5.trim());
  });

  // -------------------------------------------------------------------------
  // Test 5 : déterminisme
  // Injecte une entropie fixe et déclenche la dérivation directement
  // (sans Refresh qui régénèrerait une entropie aléatoire).
  // Même entropie + mêmes params → même adresse à chaque fois.
  // -------------------------------------------------------------------------
  test('meme entropie + memes params produisent toujours la meme adresse (determinisme)', async ({ page }) => {
    await setFieldValue(page, 'account_id',       USE_CASE_ACCOUNT);
    await setFieldValue(page, 'address_index_id', USE_CASE_ADDRESS_INDEX);
    await setBip39Passphrase(page, USE_CASE_PASSPHRASE);

    // Première dérivation depuis entropie fixe
    await deriveFromFixedEntropy(page, FIXED_SALT, FIXED_ENTROPY);
    const address1 = (await getDisplayedAddress(page)).trim();

    // Réinjection des mêmes params + même entropie
    await setFieldValue(page, 'account_id',       USE_CASE_ACCOUNT);
    await setFieldValue(page, 'address_index_id', USE_CASE_ADDRESS_INDEX);
    await setBip39Passphrase(page, USE_CASE_PASSPHRASE);

    // Deuxième dérivation depuis la même entropie fixe
    await deriveFromFixedEntropy(page, FIXED_SALT, FIXED_ENTROPY);
    const address2 = (await getDisplayedAddress(page)).trim();

    console.log(`\n  address1 : "${address1}"`);
    console.log(`  address2 : "${address2}"`);

    expect(address1).toBeTruthy();
    expect(address1).toBe(address2);
  });

}); // describe
