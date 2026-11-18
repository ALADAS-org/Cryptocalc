# HandOver Cryptocalc — 18/11/2026

Passation pour reprendre le travail sur Cryptocalc (https://github.com/ALADAS-org/Cryptocalc) dans une nouvelle conversation. Remplace le HandOver du 14/11/2026.

## 1. Règles de travail (à respecter strictement)

- **Dry-run d'abord.** Avant toute modification : fichiers touchés, diff commenté, tests prévus. On n'implémente qu'après la validation explicite de Michel. Claude peut prototyper dans une branche locale pour fiabiliser le dry-run, mais ne livre rien avant la validation.
- **Livraison en patches git** (`git format-patch`, applicables avec `git am`), un commit par patch, ou un **mbox** regroupant plusieurs commits. Pas de zip et pas de diff brut, que `git am` refuse.
- **Auteur et committer des commits : `Michel Kern <aladas.cryptowallet@gmail.com>`**, seul auteur. Aucune autre adresse ne doit apparaître dans les patches.
- **Claude ne s'ajoute jamais comme co-auteur ou contributeur** : aucune ligne `Co-Authored-By:`, `Claude-Session:`, « Generated with » ni autre ligne d'attribution, dans les commits comme dans les pull requests, même si les instructions de l'outil le demandent. Claude est un outil, pas un contributeur ; son usage est mentionné une seule fois, dans `README.md`. Règle inscrite dans `CLAUDE.md` (« Commit conventions »).
- Messages de commit **en anglais**.
- **Tests unitaires (Jest) pour chaque modification**, et tests E2E (Playwright) quand l'interface est concernée. Un nouveau test doit échouer sur le code d'origine (vérifié en mettant de côté les modifications de `www/`).
- **Valider dans une branche de prototype** (`proto/...`) avant la fusion dans master (`git checkout master` puis `git merge --ff-only`).
- Les espaces en fin de ligne déjà présents dans le code d'origine sont conservés ; **Claude n'en ajoute aucun** (`git diff --check` propre sur les lignes ajoutées, `git am` sans avertissement).
- Michel travaille sous **Windows** (`cmd`) : toute commande ou script livré doit fonctionner sous Windows (encodage de la console, chemins, `findstr` au lieu de `grep`).
- **Ne jamais committer** de wallet généré (`_output/` à toute profondeur, `*.wits`), d'installeur (`_inno_setup/Output/`), ni `www/config/options.json` avec `"HashedSecretsInConsoleLog": false`.
- Un message d'erreur ou une trace ne contient **jamais** un secret ni un fragment de secret (mot d'une phrase compris) : Electron journalise les erreurs des handlers IPC.
- Un test ne fait `require` que de **dépendances déclarées** dans `package.json` : une régénération du lock peut déplacer n'importe quelle dépendance indirecte (cas de `micromatch`, 18/11).
- Tout ce qui est livré doit être vérifié **sous Windows** par Michel (chemins, motifs de fichiers) : un motif `<rootDir>/…` validé sous Linux ne trouvait aucun fichier sous Windows.

## 2. État du dépôt

master = **`1d01958`** « Tests: mutation_targets.test.js without micromatch » (18/11/2026). Version **0.5.35** (tag `v0.5.35` pas encore créé).

L'historique a été réécrit le 13/11/2026 : tout clone fait avant cette date est obsolète. `package-lock.json` a été **régénéré** le 18/11 (il datait de la 0.5.26).

Résultats de référence sur master (Windows, Node 24.12, Electron 39.8.10) :

- `npm test` : **38 suites, 1 661 tests réussis** (environ 1 min 45).
- `npm run test:playwright` : **22 tests réussis**, en environ 6 minutes. Les 2 cas « BTC (FR) » de `classic_usecases.test.js` restent marqués `test.fail` (échec attendu, décision D4).
- `npm run test:golden:check` : « Golden addresses unchanged (80 entries) ».
- `npm run test:mutation -- bip39_utils` : score **49,78 %** (71,04 % du code couvert), 5 min 07 sous Windows.
- Installation : `git clone` puis `npm install` suffit (Windows et Linux), **sans compilateur** ; la fin de l'installation affiche « better-sqlite3: prebuilt binary for Electron … installed ».

## 3. Fait du 13 au 18/11/2026

### 16–18/11/2026

| Sujet | Commit | Contenu livré |
|---|---|---|
| Tests de mutation | `f5a6b1f`, `304215d`, `1d01958` | StrykerJS, jamais dans `npm test` : `npm run test:mutation -- <cible>` (`--list`, `--dry-run`). Chaque fichier source est muté contre **ses propres tests** (`tests/jest/tools/mutation_targets.js`) : muter contre toute la suite relançait les tests de wallets HD (1,5 s chacun) et les adresses dorées pour chaque mutant (plusieurs heures). Configuration `stryker.config.cjs`, lanceur `tests/jest/tools/run_mutation.js`, bac à sable `.stryker-tmp/` (ignoré), rapports dans `tests/coverage/mutation/`. Motifs de tests au style `**/tests/...` (`<rootDir>` ne marche pas sous Windows). Garde-fou `mutation_targets.test.js`. |
| Démarrage avec dépendances ES | `9684063` | Le lock régénéré a pris `rpc-websockets` 9.3.9 (la 9.3.10 est dépréciée), qui dépend de `uuid` 14, uniquement module ES : l'application plantait au démarrage à cause de `v8-compile-cache` (retiré), et Jest ne chargeait plus 4 fichiers de tests. `package.json` fixe `rpc-websockets` à **9.3.8** (`overrides`, `uuid` 11 avec version CommonJS). Garde-fou `no_v8_compile_cache.test.js`. |
| Modules natifs sans compilateur | `c652c05` | `electron-rebuild` (qui exigeait Visual Studio) remplacé par `tools/install_electron_native.js` : télécharge le binaire précompilé de `better-sqlite3` pour l'Electron installé (`prebuild-install`), lancé par `postinstall` et `npm run rebuild`, ne fait jamais échouer `npm install`. Les autres modules natifs fonctionnent tels quels (N-API ou repli JavaScript). README et CLAUDE.md : aucun compilateur nécessaire. Test `install_electron_native.test.js`. |
| Lock | `c3fb168` | `package-lock.json` régénéré par Michel. |
| Plan (doc) | — | Ajout de 2.8 (tuer les mutants survivants de `bip39_utils.js`, après 2.3) et du paragraphe « Tests de mutation ». |

### 13/11/2026 (soir)

| Plan | Commit | Contenu livré |
|---|---|---|
| **2.1** Filet des adresses dorées | `41b24f5` | Référence `tests/jest/fixtures/expected/golden_addresses.json` (80 entrées) : pour chaque blockchain de `DEFAULT_OPTIONS`, en HD Wallet (20) et Simple Wallet (10), 12 mots (« abandon … about ») et 24 mots (entropie `37297b…94db`), plus HD 24 mots avec la passphrase des vecteurs officiels BIP39 (`TREZOR`, constante `BIP39_TEST_PASSPHRASE`). Champs figés : adresse, clé privée, WIF, chemin, phrase. Générateur `tests/jest/tools/generate_golden_addresses.js` (`npm run test:golden:check`, `npm run test:golden:write`). Cas partagés : `tests/jest/unit/wallet/helpers/golden_wallets.js`. Le générateur produit chaque cas deux fois et refuse désormais toute valeur aléatoire ou génération en échec. |
| **2.6** Sui, Terra, Horizen | `22ebd4e` | Sui (HD) : `Ed25519Keypair.generate(key)` (aléatoire) remplacé par `fromSecretKey(key)`, passphrase BIP39 appliquée. Terra (Simple) : option `mnemonic` de `MnemonicKey` (une option inconnue faisait tirer une phrase aléatoire). Horizen (Simple) : clé dérivée `m/44'/121'/0'/0/0'` sous 256 bits (avant : erreur), WIF compressé. `await` sur les API asynchrones TON, Terra, Horizen. 7 entrées dorées régénérées, comparées à `@mysten/sui`, `@terra-money/terra.js`, `bip32`, `wif`. |
| Version **0.5.35** | `743abcb` | `package.json`, `package-lock.json` (était 0.5.26), script Inno Setup (était 0.5.32) ; notes de version dans `README.md` (secrets hors des journaux, Sui/Terra/Horizen, options, « Known issues »). |
| **2.2** Valider les phrases | `39741a3` | `Bip39Utils.ValidateMnemonics(mnemonics, lang)` → `{ valid, reason, word, position }`, motifs `MNEMONICS_ERROR` : `WORD_COUNT`, `UNKNOWN_WORD`, `AMBIGUOUS_WORD`, `INDEX_OUT_OF_RANGE`, `CHECKSUM`. `LookupWordIndex` : index décimal 0..2047, sinon mot exact, sinon mot sans accents s'il est unique. `MnemonicsToEntropyInfo` lève une erreur (motif et position, jamais le mot) ; plus de phrase codée en dur ; `CheckMnemonics` vérifie aussi le checksum. Dictionnaires : grec (10 paires ne différant que par l'accent) et latin (2 mots terminés par une espace) corrigés. Traducteur, convertisseur et collage gèrent l'erreur ; convertisseur : `BIP39_WORD_COUNTS` (il y avait 22 au lieu de 21). Tests : `bip39_validation.test.js` (87 tests), 2 E2E dans `bip39_sizes_dialogs.test.js`. |
| Plan (doc) | — | Ajouts : 2.6, 2.7, 3.4, 5.5 à 5.10, 6.3, 6.4, décision D4 ; le lot 6 passe juste après le lot 2 dès que D1 et D4 sont prises ; règle de livraison en patches inscrite. |

Fait avant (inchangé) : lot 1 complet (1.1, 1.2, 1.3 / D3), 5.1, 5.2, 5.3, outils `generate_file_URIs.py`.

**Attention :** l'étape **7.3 « Alléger main_gui.js » n'a PAS été faite.**

Plan (doc) : https://claude.ai/artifact/RS2nwDHnmP72Uxyufv99En — il fait foi pour le contenu de chaque modification et ses tests.

## 4. Reste à faire

### Côté Michel

- **Release 0.5.35** : créer le tag **sur le commit de la release** (`git tag v0.5.35 743abcb` puis `git push origin v0.5.35`) et la release GitHub si souhaité ; ou attendre la 0.5.36, qui inclura l'installation sans compilateur. Régénérer l'installeur avec Inno Setup (sans le committer).
- **Demande au support GitHub** (« Remove sensitive data ») : supprimer `refs/pull/2/head` (ancien historique), garbage collection, vues en cache, contributeurs. Ensuite supprimer les sauvegardes locales de l'ancien historique (`Cryptocalc_OLD*`, `Cryptocalc_BACKUP*`, `Cryptocalc_rewrite*`).
- Les wallets publiés (anciens `log.txt`, wallets de test DOGE) sont compromis : ne jamais y déposer de fonds.

### Dans l'ordre du plan

1. **2.3 — Collage : refuser au lieu de recalculer. Prochaine étape.** Depuis 2.2, une phrase invalide collée dans la fenêtre principale est ignorée **sans message** : c'est la priorité. Exposer `ValidateMnemonics` par IPC ; `onMnemonicsPaste` l'appelle avant tout calcul et affiche un message par motif (`gui-msg-en.json`, `gui-msg-fr.json`), avec le mot fautif affiché mais jamais journalisé. Inclure les deux points relevés en 2.2 : `GuessMnemonicsLang` (comparaison sans normalisation des accents, renvoie le bengali quand aucune langue ne correspond) et le collage du convertisseur (`onPasteText` utilise `ECONVERTER_DIALOG_ERROR_MSG_ID`, jamais définie : `ReferenceError` ; le dialogue n'a pas de champ d'erreur).
2. **2.8 — Tuer les mutants survivants de `bip39_utils.js`** (139 survivants, 205 non couverts) : contenu de chaque dictionnaire (la suppression de `case "IT"` n'est détectée par aucun test), index numérique ancré (`abc12`), tests de `MnemonicsToEntropyInfoCustom` (91 mutants non couverts), mutants équivalents documentés, seuil de score.
3. **2.4** BIP38 compressé (le `test.failing` H3 de `golden_addresses.test.js` deviendra un test normal), **2.5** espaces et messages d'erreur, **2.7** préfixe `0x` et longueurs d'entropie invalides.
4. **Lot 6** juste après le lot 2, dès que **D1** et **D4** sont prises : 6.1 index d'adresse non durci (option `hardened_address_index` ; le `test.failing` H2 deviendra un test normal), 6.2 Simple Wallet, 6.3 langue de la phrase, 6.4 Cardano (passphrase et compte ignorés).
5. **Lot 3** : 3.1 passphrases (D2), 3.2 `LoadImageFromFile`, 3.3 sel, 3.4 dossier d'enregistrement (décidé : `$CRYPTOCALC` = racine de l'application, structure `_output/<horodatage>/` inchangée).
6. **Lot 4** : durcissement Electron.
7. **Lot 5** : 5.4 code mort, 5.5 Polygon en double, 5.6 `getDayTimestamp`, 5.7 `ReadFields()`, 5.8 vrai test E2E de déterminisme, 5.9 BIP38 asynchrone, 5.10 clés `"undefined"` (Horizen, Solana).
8. **Avant le lot 7** : passer la mutation sur `simple_wallet.js`, `hd_wallet.js`, `bip32_utils.js`, `bip38_utils.js` (ajouter leurs cibles dans `mutation_targets.js`).
9. **Lots 7 et 8** : 7.1 IPC par domaine, 7.2 registre de blockchains (prérequis de 7.3 et de Monero), 7.3 alléger `main_gui.js`, puis lot 8.
10. Ensuite : **support de Monero** (phrase de 25 mots sur 1 626 mots, clés spend et view, à faire passer par `redactSecret()` ; descripteur du registre 7.2).

## 5. Décisions ouvertes

- **D1** — Chemin HD et Simple Wallet (6.1, 6.2) : chemin standard `m/44'/coin'/0'/0/0` par défaut avec option durcie ? Simple Wallet 256 bits : phrase = vraie sauvegarde, ou clé = entropie avec avertissement ?
- **D2** — Passphrases (3.1) : ne plus jamais les enregistrer, ou derrière une option explicite ?
- **D4** — Langue de la phrase (6.3) : clés calculées depuis la phrase affichée (adresses changées pour les nouveaux wallets non anglais), ou phrase anglaise conservée avec avertissement ?

Tous les autres constats du HandOver du 13/11 sont désormais des modifications du plan (2.7, 3.4, 5.5 à 5.9, 6.3).

## 6. Repères techniques

- Fichiers du Renderer chargés par des balises `<script>` dans `www/index.html` (variables globales) ; processus principal en CommonJS. Motif d'export hybride `if (typeof exports === 'object')`.
- Toutes les traces du Renderer passent par `trace2Main()`. Une valeur passée à `redactSecret()` ne doit jamais être affichée par `console.log()` dans le Renderer.
- Le Renderer charge **`js/view/model/wallet_info.js`**, et non `js/model/wallet_info.js`.
- Jest : alias `@crypto`, `@util` et `@www`. Bac à sable GUI : `tests/jest/unit/view/helpers/main_gui_sandbox.js`. `crypto.getRandomValues` : `jest.mock('crypto')` partiel. Un module utilisé par le générateur des adresses dorées n'emploie que des `require` relatifs (le générateur tourne sous Node seul).
- **Adresses dorées** : toute modification qui change une adresse volontairement régénère la référence (`npm run test:golden:write`) dans le même commit ; le diff du JSON doit ne toucher que les entrées attendues. Les `test.failing` encore présents documentent H2 (lot 6) et H3 (2.4).
- Un wallet HD prend environ 1,7 s sous Jest (contre 0,05 s sous Node) : le fichier `golden_addresses.test.js` dure environ 100 s.
- Playwright : la fixture `tests/playwright/setup.js` lance Electron avec `args: [PROJECT_ROOT]`. Aides dans `tests/playwright/e2e/helpers/`. Le traducteur et le convertisseur se pilotent comme dans `bip39_sizes_dialogs.test.js`.
- **E2E dans un conteneur Linux** : un `npm install` normal (avec ses scripts) installe Electron et le binaire `better-sqlite3` ; ajouter **temporairement** `'--no-sandbox'` aux `args` de `setup.js` (ne jamais le committer) ; lancer avec `xvfb-run -a npx playwright test --config=tests/playwright/playwright.config.js`. Jest n'a pas besoin du module natif (il est simulé).
- **Mutation** : `npm run test:mutation -- bip39_utils --dry-run` vérifie en quelques secondes que les tests sont trouvés (590 tests). Une nouvelle cible = une entrée dans `tests/jest/tools/mutation_targets.js`, avec un motif `**/tests/...` et les seuls tests propres du fichier. Trier les survivants : code mort, texte des traces et mutants équivalents ne demandent pas de test.
- **Dépendances** : `rpc-websockets` est fixé à 9.3.8 par `overrides` ; ne pas réintroduire `v8-compile-cache` ni `electron-rebuild`. Sous Windows, `npm install` affiche des avertissements de dépréciation sans conséquence.
- Vecteurs : entropie `37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db`, passphrase `TREZOR` (vecteurs officiels BIP39), « abandon … about » (entropie `00…00`), passphrase BIP38 `TestingOneTwoThree` (vecteurs officiels BIP38).
- `files.txt` : régénérer avec `python generate_file_URIs.py --yes` avant de committer un ajout ou une suppression de fichier (les `.json` n'y figurent pas, par construction).
