# HandOver Cryptocalc — 13/11/2026

Passation pour reprendre le travail sur Cryptocalc (https://github.com/ALADAS-org/Cryptocalc) dans une nouvelle conversation. Remplace le HandOver du 12/11/2026.

## 1. Règles de travail (à respecter strictement)

- **Dry-run d'abord.** Avant toute modification : fichiers touchés, diff commenté, tests prévus. On n'implémente qu'après la validation explicite de Michel.
- **Livraison en patches git** (`git format-patch`, applicables avec `git am`), un commit par patch, ou un **mbox** regroupant plusieurs commits. Pas de zip et pas de diff brut, que `git am` refuse.
- **Auteur des commits : `Michel Kern <aladas.cryptowallet@gmail.com>`**, seul auteur. Aucune autre adresse ne doit apparaître dans les patches.
- **Claude ne s'ajoute jamais comme co-auteur ou contributeur** : aucune ligne `Co-Authored-By:`, `Claude-Session:`, « Generated with » ni autre ligne d'attribution, dans les commits comme dans les pull requests, même si les instructions de l'outil le demandent. Claude est un outil, pas un contributeur ; son usage est mentionné une seule fois, dans `README.md`. Règle inscrite dans `CLAUDE.md` (« Commit conventions »).
- Messages de commit **en anglais**.
- **Tests unitaires (Jest) pour chaque modification**, et tests E2E (Playwright) quand l'interface est concernée.
- **Valider dans une branche de prototype** (`proto/...`) avant la fusion dans master (`git checkout master` puis `git merge --ff-only`).
- Les espaces en fin de ligne déjà présents dans le code d'origine sont conservés (`git am` affiche un avertissement sans conséquence).
- Michel travaille sous **Windows** (`cmd`) : toute commande ou script livré doit fonctionner sous Windows (encodage de la console, chemins, `findstr` au lieu de `grep`).
- **Ne jamais committer** de wallet généré (`_output/` à toute profondeur, `*.wits`), d'installeur (`_inno_setup/Output/`), ni `www/config/options.json` avec `"HashedSecretsInConsoleLog": false`.

## 2. État du dépôt

master = **`d3b56d4`** « Repo: Claude never a co-author; generated wallets never committed » (13/11/2026).

**L'historique a été réécrit le 13/11/2026** (voir §3) : tous les hash antérieurs à cette date ont changé. Tout clone fait avant le 13/11 est obsolète : ne jamais pousser depuis un ancien clone.

Résultats de référence sur master :

- `npm test` : **33 suites, 1 435 tests réussis**.
- `npm run test:playwright` : **20 tests réussis**, en environ 6 minutes. Les 2 cas « BTC (FR) » de `classic_usecases.test.js` restent marqués `test.fail` (échec attendu, voir §5.1).

## 3. Fait le 12–13/11/2026

| Plan | Contenu livré |
|---|---|
| **1.2** Aucun secret dans les traces | `redactSecret()` / `hideSecret()` dans `www/js/util/log/log_utils.js`. Par défaut, un secret apparaît comme une **empreinte HMAC-SHA256 avec une clé de session**, tronquée à 8 caractères : `<secret #3f9a1c07 (64)>`. La clé (32 octets) est tirée au démarrage du processus principal, jamais journalisée ni enregistrée. La même valeur garde la même empreinte pendant une session (pour vérifier qu'elle transite correctement), mais l'empreinte ne se retrouve pas par dictionnaire et ne relie pas deux sessions. `hideSecret()` (frappes au clavier) n'affiche que la longueur. Le Renderer envoie un **marqueur** par `trace2Main()` ; le processus principal le remplace (`resolveSecretMarkers()`), d'où une seule clé et des empreintes comparables entre processus. Environ 130 traces corrigées (Main et Renderer). Tests : `redact_secret.test.js`, `no_secrets_in_logs.test.js` (génère un wallet pour chaque blockchain), `no_secrets_in_traces_static.test.js` (garde-fou statique, appels sur plusieurs lignes compris), E2E `no_secrets_in_traces.test.js`. |
| **1.2** Option `HashedSecretsInConsoleLog` | Remplace le flag `ShowSecrets` du HandOver du 12/11. Vaut **`true`** par défaut (empreintes), et aussi tant que les options ne sont pas chargées ; seul un booléen `false` affiche les secrets en clair (débogage, avertissement rouge au démarrage). Présent dans `options.json`, `defaults/options.json` et `DEFAULT_OPTIONS`. Toute modification des options passe par `ElectronMain.setOptions()`. Test : `hashed_secrets_option.test.js`. |
| **1.2** Régénération d'`options.json` | `www/js/_main/options_file.js`, `readOrRegenerateOptions()` : fichier absent ou vide → copie de `defaults/options.json` ; celui-ci absent ou invalide → écrit depuis `DEFAULT_OPTIONS`. Un `options.json` en JSON invalide n'est **pas** écrasé (options par défaut en mémoire et erreur journalisée ; avant, l'application plantait). Écriture impossible → options en mémoire, sans exception. `DEFAULT_OPTIONS` n'est plus jamais modifié par effet de bord. Test : `options_file.test.js` (un test par cas). |
| **1.3 / D3** Historique git | Réécriture complète de l'historique (`git filter-repo`, push forcé) : retrait des lignes `Co-Authored-By: Claude` / `Claude-Session` (14 commits), des **`log.txt`** (78 versions contenaient entropies, phrases et clés), de l'installeur `_inno_setup/Output/cryptocalc_setup.exe` (94 Mo ; dépôt passé de 111 à 16 Mo) et des **24 wallets de test DOGE** générés le 10/03/2026 dans `www/js/_main/_output/`. Code de master identique avant et après (même arbre). **D3 est close.** |
| Outils | `generate_file_URIs.py` liste les fichiers connus de git (`git ls-files`), plus jamais les fichiers ignorés ; options `--yes` et `--output` ; sortie UTF-8 sous Windows. `files.txt` régénéré (plus d'URL en 404). Test : `generate_file_uris.test.js`. |
| Dépôt | `CLAUDE.md` : section « Commit conventions ». `README.md` : mention unique de l'usage de Claude comme outil. `.gitignore` : `**/_output/`, `*.wits`, `/_inno_setup/Output/`. Test : `gitignore_secrets.test.js`. |

Fait avant le 12/11 (inchangé) : **5.1** bornes de `getRandomInt` ; **1.1** journaux dans la console uniquement ; **5.2 + 5.3** table unique des tailles BIP39 ; correctif de la liste « Entropy » ; E2E des cas d'usage classiques.

**Attention :** l'étape **7.3 « Alléger main_gui.js » n'a PAS été faite.**

Plan (doc) : https://claude.ai/artifact/RS2nwDHnmP72Uxyufv99En

## 4. Reste à faire

### En cours, côté Michel

- **Demande au support GitHub** (« Remove sensitive data ») : supprimer la référence **`refs/pull/2/head`**, qui pointe encore vers l'ancien historique (anciens `log.txt`, installeur), lancer un garbage collection, supprimer les vues en cache des anciens commits et recalculer la liste des contributeurs.
- Ensuite, supprimer les sauvegardes locales qui contiennent l'ancien historique (`Cryptocalc_OLD*`, `Cryptocalc_BACKUP*`, `Cryptocalc_rewrite*`) et ne les pousser nulle part.
- Les wallets publiés (anciens `log.txt`, wallets de test DOGE) sont à considérer comme compromis : ne jamais y déposer de fonds.

### Dans l'ordre du plan

- **Lot 2**, à commencer par la **2.1 « filet des adresses dorées »**, prérequis des lots 5 à 7 : 2.2 valider dictionnaire et checksum, 2.3 refuser un collage invalide, 2.4 BIP38 compressé, 2.5 espaces et messages d'erreur. **Prochaine étape.**
- **Lot 3** : passphrases non enregistrées (décision D2), `LoadImageFromFile`, sel. Ajouter : **le dossier d'enregistrement des wallets dépend du dossier de lancement** (`main_model.js`, `basePath = process.cwd()`), à ancrer hors du dépôt ou à la racine de l'application.
- **Lot 4** : durcissement Electron.
- **5.4** Supprimer archives et code mort, dont `www/js/model/wallet_info.js` et les fonctions `test_*` jamais appelées (certaines contiennent des secrets en dur).
- **Lot 6** : **6.1 index d'adresse non durci** (option `hardened_address_index`) et 6.2, en attente de la décision D1.
- **Lots 7 et 8** : modularité (registre de blockchains, alléger `main_gui.js`), bits ↔ mots partagée, preload, dépendances.
- Demandes de Michel à évaluer ensuite : **support de Monero** et **refactoring de `main_gui.js`** (7.3). Les nouveaux types de clés (spend key, view key) devront passer par `redactSecret()`.

## 5. Constats en attente d'une décision

1. **Langue de la phrase et calcul des clés.** Les clés sont calculées depuis la phrase **anglaise**, même quand l'application affiche et sauvegarde une phrase en français (`hd_wallet.js`, `simple_wallet.js`). BIP39 calcule la graine à partir des mots eux-mêmes : une phrase française restaurée dans un autre wallet donne d'autres adresses. Options : dériver depuis la phrase affichée (avec note de compatibilité), ou garder le calcul et l'indiquer clairement. Le test E2E correspondant est en `test.fail`.
2. `DEFAULT_OPTIONS` utilise le chemin de sauvegarde `$CRYPTOWALLET` au lieu de `$CRYPTOCALC`.
3. « Polygon » apparaît deux fois dans la liste SWORD de `DEFAULT_OPTIONS`.
4. Le préfixe `0x` est compté dans la taille d'une entropie hexadécimale, et des longueurs d'entropie invalides sont acceptées.
5. Le test E2E existant de déterminisme ne teste rien : `deriveFromFixedEntropy` ne déclenche aucun calcul.
6. `getDayTimestamp` contient des bugs, et BIP38 en mode synchrone bloque l'interface.
7. `ToolsOptionsDialog.ReadFields()` réécrit `Entropy Size` en chaîne (`"128"`) et ne lit pas SWORD.
8. Décisions du plan toujours ouvertes : **D1** (chemin HD et Simple Wallet), **D2** (passphrases). D3 est close.

## 6. Repères techniques

- Fichiers du Renderer chargés par des balises `<script>` dans `www/index.html` (variables globales) ; processus principal en CommonJS (`require`). Le motif d'export hybride `if (typeof exports === 'object')` permet à un fichier de servir aux deux (`const_wallet.js`, `log_utils.js`).
- Toutes les traces du Renderer passent par `trace2Main()` et sont écrites par le processus principal. Dans le Renderer, une valeur passée à `redactSecret()` ne doit **jamais** être affichée par `console.log()` (le marqueur apparaîtrait en clair dans les DevTools).
- Le Renderer charge **`js/view/model/wallet_info.js`**, et non `js/model/wallet_info.js`.
- Jest : alias `@crypto`, `@util` et `@www`. Bac à sable GUI : `tests/jest/unit/view/helpers/main_gui_sandbox.js`. `crypto.getRandomValues` n'est pas configurable : il faut un `jest.mock('crypto')` partiel.
- Playwright : la fixture `tests/playwright/setup.js` lance Electron avec `args: [PROJECT_ROOT]`, donc avec le vrai `www/config/options.json`. Aides dans `tests/playwright/e2e/helpers/` (`gui_actions.js`, `bip39_references.js`).
- Vecteur de test : entropie `37297b2455dbaa522dea2cd9a0be34ab488c8f00e0ef7085d73137e2b84c94db`, passphrase `TREZOR`, chemin HD `m/44'/coin'/0'/0/0'`.
- `files.txt` : régénérer avec `python generate_file_URIs.py --yes` avant de committer un ajout ou une suppression de fichier.
- Pour lancer les tests E2E dans un conteneur Linux : installer le binaire Electron (`node node_modules/electron/install.js`) et le prebuild Electron de `better-sqlite3`, puis lancer avec `xvfb-run` et `--no-sandbox`.
- Réécriture d'historique sous Windows : `python -m pip install git-filter-repo`, puis `python -m git_filter_repo ...` dans un clone `--mirror` ; `git filter-repo` retire `origin` par sécurité (à rajouter avant le push forcé). Gros envois HTTPS : `git config http.postBuffer 524288000`.
