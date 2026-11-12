# HandOver Cryptocalc — 12/11/2026

Passation pour reprendre le travail sur Cryptocalc (https://github.com/ALADAS-org/Cryptocalc) dans une nouvelle conversation.

## 1. Règles de travail (à respecter strictement)

- **Dry-run d'abord.** Avant toute modification : fichiers touchés, diff commenté, tests prévus. On n'implémente qu'après la validation explicite de Michel.
- **Livraison en patches git** (`git format-patch`, applicables avec `git am`), un commit par patch. Pas de zip et pas de diff brut, que `git am` refuse.
- **Auteur des commits : `Michel Kern <aladas.cryptowallet@gmail.com>`.** Aucune autre adresse ne doit apparaître dans les patches.
- Messages de commit **en anglais**, terminés par les lignes d'attribution Claude (Co-Authored-By et Claude-Session).
- **Tests unitaires (Jest) pour chaque modification**, et tests E2E (Playwright) quand l'interface est concernée.
- **Valider dans une branche de prototype** (`proto/...`) avant la fusion dans master (`git merge --ff-only`).
- Les espaces en fin de ligne déjà présents dans le code d'origine sont conservés (`git am` affiche un avertissement sans conséquence).

## 2. État du dépôt

master = **`5595beb`** (fusion en avance rapide de `proto/bip39-sizes`, le 12/11/2026).

Résultats de référence sur master :

- `npm test` : **26 suites, 1 339 tests réussis**.
- `npm run test:playwright` : **19 tests réussis**, en environ 6 minutes. Les 2 cas « BTC (FR) » de `classic_usecases.test.js` sont marqués `test.fail` (échec attendu, voir §4.1).

## 3. Avancement du « Plan de corrections Cryptocalc par lots »

Plan (doc) : https://claude.ai/artifact/RS2nwDHnmP72Uxyufv99En

### Fait

| Plan | Contenu livré |
|---|---|
| **5.1** Bornes de `getRandomInt` | `getRandomInt(n)` renvoie un entier de [0, n-1] et lève `RangeError` si n n'est pas un entier ≥ 1. Les appels qui veulent un intervalle inclusif sont ajustés (dé, souris, SWORD). Tests : `hex_utils.test.js`, `random_bounds.test.js`. |
| **1.1 / 1.3** (partiel) Journaux | Skribi écrit uniquement dans la console, donc plus aucun `log.txt` n'est produit. `app_config.json` et `readAppConfig()` sont supprimés, ainsi que les deux `log.txt`. Test : `skribi.test.js`. La 1.1 devient sans objet. Pour la 1.3, la réécriture de l'historique git (décision D3) n'a pas été faite. |
| **5.2 + 5.3** Table unique des tailles BIP39 | `BIP39_SIZES`, `BIP39_WORD_COUNTS`, `BIP39_ENTROPY_BIT_SIZES`, `getBip39Size()` et `getBip39WordCount()` sont définis dans `const_wallet.js`. Ils sont utilisés par `entropy_size.js` (`TruncateToEntropySize`, `IsTruncatedSize`), `bip39_utils.js`, `main_gui.js` et les dialogues (Entropy Converter, Secret Phrase Translator, dé D6). Le comportement est figé par un test de caractérisation de 360 valeurs (`bip39_sizes_baseline.json`). |
| Hors plan | Lien de contact par e-mail dans `.github/ISSUE_TEMPLATE/config.yml`. |
| Hors plan : correctif | La liste « Entropy » n'était pas mise à jour quand on choisissait le nombre de mots (`js/view/model/wallet_info.js` : `ENTROPY_SIZE` pointait vers un identifiant inexistant). `DEFAULT_OPTIONS` passe à 256 bits, en nombres. |
| Hors plan : E2E | Cas d'usage classiques BTC/ETH/DOGE en Simple Wallet, HD et HD avec passphrase, en 12 et 24 mots, plus les dialogues et l'affichage de la taille d'entropie. Les tests E2E lancent l'application comme `npm start` et trouvent les menus quelle que soit la langue de l'interface (libellés tirés de `www/js/L10n/gui-msg-*.json`). |

**Attention :** l'étape **7.3 « Alléger main_gui.js » n'a PAS été faite.** `main_gui.js` n'a été modifié que pour utiliser la table BIP39 (une quarantaine de lignes).

### Reste à faire, dans l'ordre du plan

- **1.2** Aucun secret dans les traces (`redactSecret`). **Prochaine étape.** Exigences de Michel (12/11/2026) :
  - un flag **`ShowSecrets`** dans les options affiche quand même les secrets, pour le débogage ;
  - il vaut **false** par défaut (et aussi tant que les options ne sont pas encore chargées) ;
  - le flag doit être ajouté à trois endroits : `www/config/options.json`, `www/config/defaults/options.json` et les options par défaut codées en dur. Ces dernières sont **`DEFAULT_OPTIONS` dans `www/js/crypto/const_default_options.js`**, que `electron_main.js` importe à la ligne 170 et utilise dans `readOptionsFile()` et `setDefaultOptions()` ;
  - le flag doit agir dans le processus principal comme dans le Renderer (les options arrivent au Renderer par `FromMain_UPDATE_OPTIONS`) ;
  - attention : `saveOptions()` et `updateOptions()` journalisent tout l'objet options ;
  - à noter : `readOptionsFile()` n'écrit pas de `options.json` quand le fichier est absent, il utilise seulement `DEFAULT_OPTIONS` en mémoire. Il faut demander à Michel s'il veut que le fichier soit régénéré.
- **Lot 2**, à commencer par la **2.1 « filet des adresses dorées »**, prérequis des lots 5 à 7 : 2.2 valider dictionnaire et checksum, 2.3 refuser un collage invalide, 2.4 BIP38 compressé, 2.5 espaces et messages d'erreur.
- **Lot 3** : passphrases non enregistrées (décision D2), `LoadImageFromFile`, sel.
- **Lot 4** : durcissement Electron.
- **5.4** Supprimer archives et code mort. Cela inclut `www/js/model/wallet_info.js`, une copie morte chargée nulle part.
- **Lot 6** : **6.1 index d'adresse non durci** (option `hardened_address_index`, anciens `.wits` traités comme durcis) et 6.2. Les deux attendent la décision D1. Un dry-run de la 6.1 a déjà été présenté ; les questions sur l'option durcie et les adresses dorées restent ouvertes.
- **Lots 7 et 8** : modularité (registre de blockchains, alléger `main_gui.js`), bits ↔ mots partagée, preload, dépendances.

## 4. Constats en attente d'une décision

1. **Langue de la phrase et calcul des clés.** Les clés sont calculées depuis la phrase **anglaise**, même quand l'application affiche et sauvegarde une phrase en français (`hd_wallet.js` ligne 155, `simple_wallet.js` ligne 99). Or BIP39 calcule la graine à partir des mots eux-mêmes. Une phrase française restaurée dans un autre wallet donne donc d'autres adresses. Exemple pour la même entropie, en HD et 24 mots : `14hNGWC…` dans Cryptocalc, `1BXfW4u…` dans un wallet standard. Deux options :
   - dériver depuis la phrase affichée, avec une note de compatibilité pour les wallets déjà générés ;
   - garder le calcul actuel et l'indiquer clairement dans l'interface et dans `wallet_info.txt`.

   Le test E2E correspondant est en `test.fail`.
2. `DEFAULT_OPTIONS` utilise le chemin de sauvegarde `$CRYPTOWALLET` au lieu de `$CRYPTOCALC`.
3. « Polygon » apparaît deux fois dans la liste SWORD de `DEFAULT_OPTIONS`.
4. Le préfixe `0x` est compté dans la taille d'une entropie hexadécimale, et des longueurs d'entropie invalides sont acceptées.
5. Le test E2E existant de déterminisme ne teste rien : `deriveFromFixedEntropy` ne déclenche aucun calcul.
6. `getDayTimestamp` contient des bugs, et BIP38 en mode synchrone bloque l'interface.
7. Décisions du plan toujours ouvertes : **D1** (chemin HD et Simple Wallet), **D2** (passphrases), **D3** (historique git).

## 5. Repères techniques

- Fichiers du Renderer chargés par des balises `<script>` dans `www/index.html` (variables globales) ; processus principal en CommonJS (`require`). Le motif d'export hybride `if (typeof exports === 'object')` permet à `const_wallet.js` de servir aux deux.
- Le Renderer charge **`js/view/model/wallet_info.js`**, et non `js/model/wallet_info.js`.
- Jest : alias `@crypto`, `@util` et `@www`. Bac à sable GUI : `tests/jest/unit/view/helpers/main_gui_sandbox.js` (charge `const_wallet.js`). `crypto.getRandomValues` n'est pas configurable : il faut un `jest.mock('crypto')` partiel.
- Playwright : la fixture est dans `tests/playwright/setup.js` et lance Electron avec `args: [PROJECT_ROOT]`, donc avec le vrai `www/config/options.json`. Les fonctions d'aide sont dans `tests/playwright/e2e/helpers/` :
  - `gui_actions.js` : sélecteurs, `localizedLabelRegex`, `selectSecretPhraseLang` ;
  - `bip39_references.js` : valeurs de référence calculées avec `bip39` et `bip32`, en anglais et en français.
- Vecteur de test : entropie `37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db`, passphrase `TREZOR`, chemin HD `m/44'/coin'/0'/0/0'`.
- Pour lancer les tests E2E dans un conteneur Linux, il faut :
  - installer le binaire Electron (`node node_modules/electron/install.js`) ;
  - installer le prebuild Electron de `better-sqlite3` ;
  - lancer avec `xvfb-run` et `--no-sandbox`.
