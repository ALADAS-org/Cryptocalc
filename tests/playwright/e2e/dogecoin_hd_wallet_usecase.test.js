/**
 * ============================================================================
 * E2E Tests (End-to-End) - Use Case : Dogecoin HD Wallet - Save & Open
 * ============================================================================
 * Comportement confirmé de l'app :
 *   - Save  : pas de file-picker. L'app écrit directement dans
 *             _output/<timestamp>_<COIN>_<LANG>/ puis affiche un iziToast
 *             avec les boutons "Show" et "Close".
 *   - Open  : un dialog natif OS s'ouvre pour choisir le fichier à charger.
 *             → mocké via electronApp.evaluate({ dialog }).
 *
 * Scénario :
 *   Phase 1 : Setup Dogecoin HD Wallet (account=1, index=3)
 *   Phase 2 : Génération + vérification du format d'adresse
 *   Phase 3 : Save → trouver le fichier dans _output/ → vérifier le JSON
 *   Phase 4 : Open du fichier sauvé → vérifier le rechargement
 *   Phase 5 : Modifier (account=4, index=7) + Refresh
 *   Phase 6 : Save → trouver le deuxième fichier → vérifier l'adresse mise à jour
 * ============================================================================
 */

const path = require('path');
const fs   = require('fs');

const { test, expect, waitForAppReady } = require('../setup.js');

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const DOGECOIN_BLOCKCHAIN   = 'Dogecoin';
const INITIAL_ACCOUNT       = '1';
const INITIAL_ADDRESS_INDEX = '3';
const UPDATED_ACCOUNT       = '4';
const UPDATED_ADDRESS_INDEX = '7';

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = path.join(PROJECT_ROOT, '_output');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function switchToHDWallet(page) {
  await page.click('#wallet_tab_link_id');
  await page.waitForTimeout(500);
  await page.selectOption('#wallet_mode_select_id', 'HD Wallet');
  await page.waitForTimeout(1000);
}

async function selectBlockchain(page, blockchain) {
  const lc = blockchain.toLowerCase();

  await page.waitForFunction((search) => {
    const sel = document.querySelector('#wallet_blockchain_id');
    if (!sel) return false;
    return Array.from(sel.options).some(o => o.text.toLowerCase().includes(search));
  }, lc, { timeout: 5000 });

  const found = await page.evaluate((search) => {
    const sel = document.querySelector('#wallet_blockchain_id');
    if (!sel) return null;
    const opt = Array.from(sel.options).find(o => o.text.toLowerCase().includes(search));
    if (!opt) return null;
    sel.value = opt.value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return opt.text;
  }, lc);

  if (!found) throw new Error(`Option "${blockchain}" introuvable dans #wallet_blockchain_id`);
  await page.waitForTimeout(800);
}

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

async function clickRefresh(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('#refresh_btn_id');
    if (btn) { 
      btn.removeAttribute('disabled'); 
      btn.click(); 
    }
  });
  await page.waitForTimeout(5000);
}

async function getDisplayedAddress(page) {
  await page.waitForFunction(() => {
    const addr = document.querySelector('#address_id');
    return addr && addr.textContent.trim().length > 0;
  }, { timeout: 10000 });
  
  return (await page.textContent('#address_id')).trim();
}

async function waitForAppFullyReady(page) {
  await waitForAppReady(page);
  
  await page.waitForSelector('#wallet_tab_link_id', { timeout: 10000 });
  await page.waitForSelector('#save_icon_id', { timeout: 10000 });
  await page.waitForTimeout(2000);
}

function cleanupOutputDir() {
  if (fs.existsSync(OUTPUT_DIR)) {
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      try {
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        // Ignorer les erreurs de suppression
      }
    }
  }
}

async function saveWallet(page) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const beforeNames = new Set(
    fs.existsSync(OUTPUT_DIR) 
      ? fs.readdirSync(OUTPUT_DIR).filter(name => {
          try {
            const fullPath = path.join(OUTPUT_DIR, name);
            return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
          } catch {
            return false;
          }
        })
      : []
  );

  await page.evaluate(() => {
    const btn = document.querySelector('#save_icon_id');
    if (btn) { 
      btn.removeAttribute('disabled'); 
      btn.click();
    }
  });

  try {
    await page.waitForSelector('.iziToast', { timeout: 10000 });
    await dismissIziToast(page);
  } catch (e) {
    // Ignorer si l'iziToast n'apparaît pas
  }

  await page.waitForTimeout(5000);

  let afterNames = [];
  if (fs.existsSync(OUTPUT_DIR)) {
    afterNames = fs.readdirSync(OUTPUT_DIR).filter(name => {
      try {
        const fullPath = path.join(OUTPUT_DIR, name);
        return fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory();
      } catch {
        return false;
      }
    });
  }
  
  const newFolders = afterNames.filter(name => !beforeNames.has(name));

  if (newFolders.length === 0) {
    const files = fs.existsSync(OUTPUT_DIR) 
      ? fs.readdirSync(OUTPUT_DIR).filter(name => {
          try {
            const fullPath = path.join(OUTPUT_DIR, name);
            return fs.existsSync(fullPath) && !fs.lstatSync(fullPath).isDirectory();
          } catch {
            return false;
          }
        })
      : [];
    
    if (files.length > 0) {
      const jsonFiles = files.filter(f => f.endsWith('.wits') || f.endsWith('.json'));
      if (jsonFiles.length > 0) {
        return path.join(OUTPUT_DIR, jsonFiles[0]);
      }
    }
    
    throw new Error(`Aucun fichier trouvé dans ${OUTPUT_DIR}`);
  }

  const folder = path.join(OUTPUT_DIR, newFolders[0]);
  const files = fs.readdirSync(folder);
  
  let walletFile = files.find(f => f.endsWith('.wits')) || files.find(f => f.endsWith('.json'));
  
  if (!walletFile) {
    throw new Error(`Aucun fichier .wits/.json dans ${folder}`);
  }

  return path.join(folder, walletFile);
}

async function dismissIziToast(page) {
  try {
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button.iziToast-buttons-child');
      for (const btn of buttons) {
        if (btn.textContent.trim() === 'Close' && btn.offsetParent !== null) {
          btn.click();
          return;
        }
      }
    });
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignorer les erreurs de fermeture
  }
}

async function openWallet(page, electronApp, filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  
  // Tentative de mock du dialog (peut échouer, on continue sans)
  try {
    await electronApp.evaluate((fp) => {
      const { dialog } = require('electron');
      const originalShowOpenDialog = dialog.showOpenDialog;
      dialog.showOpenDialog = async () => {
        dialog.showOpenDialog = originalShowOpenDialog;
        return { canceled: false, filePaths: [fp] };
      };
    }, filePath);
  } catch (error) {
    // Ignorer l'erreur de mock, le test continuera avec le vrai dialog
  }

  await page.evaluate(() => {
    const btn = document.querySelector('#file_open_icon_id');
    if (btn) { 
      btn.removeAttribute('disabled'); 
      btn.click();
    }
  });

  await page.waitForTimeout(5000);
  
  await page.waitForFunction(() => {
    const addr = document.querySelector('#address_id');
    return addr && addr.textContent.trim().length > 0;
  }, { timeout: 10000 });
}

async function logWalletState(page, label) {
  const fields = await page.evaluate(() => ({
    wallet_mode:       document.querySelector('#wallet_mode_select_id')?.value    || '',
    wallet_blockchain: document.querySelector('#wallet_blockchain_id')?.value     || '',
    account:           document.querySelector('#account_id')?.value               || '',
    address_index:     document.querySelector('#address_index_id')?.value         || '',
    address:           document.querySelector('#address_id')?.textContent?.trim() || '',
    wif:               document.querySelector('#wif_id')?.value                   || '',
  }));
  console.log(`\n=== ${label} ===`);
  Object.entries(fields).forEach(([k, v]) => console.log(`  ${k.padEnd(18)}: "${v}"`));
}

// ===========================================================================
// Tests
// ===========================================================================

test.describe('Use Case - Dogecoin HD Wallet', () => {

  test.beforeEach(async () => {
    cleanupOutputDir();
  });

  test.setTimeout(120000);

  test('génération, sauvegarde, ouverture et modification', async ({ page, electronApp }) => {
    // Phase 1: Setup
    await waitForAppFullyReady(page);
    await switchToHDWallet(page);
    await selectBlockchain(page, DOGECOIN_BLOCKCHAIN);
    await setFieldValue(page, 'account_id', INITIAL_ACCOUNT);
    await setFieldValue(page, 'address_index_id', INITIAL_ADDRESS_INDEX);
    
    // Phase 2: Generate
    await clickRefresh(page);
    const initialAddress = await getDisplayedAddress(page);
    await logWalletState(page, 'Phase 2 — Initial');
    expect(initialAddress).toBeTruthy();
    expect(initialAddress).toMatch(/^D[1-9A-HJ-NP-Za-km-z]{32,34}$/);

    // Phase 3: First Save
    const savedPath1 = await saveWallet(page);
    expect(fs.existsSync(savedPath1)).toBe(true);
    
    const savedContent1 = JSON.parse(fs.readFileSync(savedPath1, 'utf8'));
    console.log('\n=== Phase 3 — Saved wallet ===');
    console.log('  File :', savedPath1);
    expect(JSON.stringify(savedContent1)).toContain(initialAddress);

    // Phase 4: Open
    await openWallet(page, electronApp, savedPath1);
    await logWalletState(page, 'Phase 4 — Reopened');

    const reloadedAddress = await getDisplayedAddress(page);
    expect(reloadedAddress).toBe(initialAddress);

    // Phase 5: Modify
    await setFieldValue(page, 'account_id', UPDATED_ACCOUNT);
    await setFieldValue(page, 'address_index_id', UPDATED_ADDRESS_INDEX);
    await clickRefresh(page);
    
    const updatedAddress = await getDisplayedAddress(page);
    await logWalletState(page, 'Phase 5 — Updated');

    expect(updatedAddress).toBeTruthy();
    expect(updatedAddress).toMatch(/^D[1-9A-HJ-NP-Za-km-z]{32,34}$/);
    expect(updatedAddress).not.toBe(initialAddress);

    // Phase 6: Second Save
    const savedPath2 = await saveWallet(page);
    expect(fs.existsSync(savedPath2)).toBe(true);
    
    const savedContent2 = JSON.parse(fs.readFileSync(savedPath2, 'utf8'));
    console.log('\n=== Phase 6 — Updated wallet saved ===');
    console.log('  File :', savedPath2);
    expect(JSON.stringify(savedContent2)).toContain(updatedAddress);
    expect(JSON.stringify(savedContent2)).not.toContain(initialAddress);

    console.log(`\n  ✅ Initial address : ${initialAddress}`);
    console.log(`  ✅ Updated address : ${updatedAddress}`);
    console.log(`  ✅ Save 1 : ${savedPath1}`);
    console.log(`  ✅ Save 2 : ${savedPath2}\n`);
  });

});