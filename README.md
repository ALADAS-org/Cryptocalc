## Documentation de [Cryptocalc](https://github.com/ALADAS-Federation/Cryptocalc)
### Mode d'emploi pour 'wallet_gui'
0. Environnement
    + 0.0. PC sous Windows 10
	+ 0.1. [Notepad++](https://notepad-plus-plus.org/)
    + 0.2. [NodeJS](https://nodejs.org/en/)
	+ 0.3. [Github Desktop](https://desktop.github.com/)
	+ 0.4. [Git](https://git-scm.com/)
	+ 0.5. [Inkscape](https://inkscape.org/fr/)
1. Mettre à jour depuis la [version publiée sur GitHub](https://github.com/ALADAS-Federation/Silverquote):
    + 1.1. Soit en ligne de commande:
	  * Supprimer le dossier `node_modules`
      * Double click sur `open_cmd_window`
	  * Entrer `npm install`
    + 1.2. Soit avec [Github Desktop](https://desktop.github.com/):
	  * Supprimer le dossier `node_modules`
      * Cliquer sur "Fetch origin"
	+ Attention ! Ne jamais supprimer le fichier `package.json.lock`
2. Double click sur `_run`
3. Remplir le champ 'Facial value' (ou laisser la valeur par défaut càd '25')
4. Cliquer sur le bouton "Bake"
5. Un horodatage au format `AAAA_MM_JJ_hour-min-sec` est généré (`$HORODATAGE` dans la suite).
   Un nouveau dossier nommé `$HORODATAGE` est créé dans le dossier `_output` du projet Silverquote
6. Un UUID est généré (`$UUID` dans la suite).
   Un sous-dossier `$UUID` est créé dans le dossier `_output/$HORODATAGE`
```
   L'UUID (version 4) est une valeur de 16 octets que l'on peut représenter par 32 caractères 
   en hexadécimal (car il faut 2 digits hecadécimaux pour représenter 1 octet).
   Il est représenté selon ce format: `0x198e04f6-06bd-4d8e-b088-852d06bed7a3` càd 38 caractères
   (32 caractères signifiants plus 4 caractères '-' de formattage et le préfixe `0x` qui signifie 'valeur hexadécimale')
```
7. Les fichiers résultat sont enregistrés dans le sous-dossier `_output/$HORODATAGE/$UUID`: 
   - ex: `D:\_0_Lab\_0_github\Silverquote\_output\2023_09_11_16h-45m-4s\0x198e04f6-06bd-4d8e-b088-852d06bed7a3`
	
#### Explication sur les fichiers générés pour un wallet
- `wallet_info.txt`: cryptomonnaie, adresse publique du wallet, clé publique et clé privée 
- `Silverquote_recto_out.svg`: Fichier Inkscape modifié Recto (Frise, valeur faciale et pattern)
- `Silverquote_recto_out.png`: Preview PNG du Recto
- `Silverquote_verso_out.svg`: Fichier Inkscape modifié Verso (Frise, valeur faciale, pattern et QRcode)
- `Silverquote_verso_out.png`: Preview PNG du Verso
- `uuid_base64.txt`: UUID version 4 encodé en Base64 (ex: `OgCNTSBYTAWUJnIwa+nVMg`)
- `pattern.png`: Image du pattern au format .PNG
- `qrcode.png`:  Image du QRCode au format .PNG
- `qrcode_private_key.png`: Image du QRCode de la clé privée au format .PNG
- `Silverquote_wallet.xslx`: Feuille de calcul contenant les caractéristiques du wallet (ex: valeurs contenues dans le pattern)
- `Convert2PNG.bat`: script '.bat' de conversion de `Silverquote_recto_out.png` (pour avoir le texte Inuit dans la couronne)
  NB: l'utilisation de ce script bécessite que Inkscape soit installé et que le chemin vers son executable soit ajouté dans la variable d'environnement `PATH`
```
  NB: Chaque cellule est une valeur en Hexadécimal, avec un motif différent pour chaque valeur, de plus les motifs
      sont "entrelacés", càd que le motif d'une cellule peut dépasser sur une ou plusieurs des 8 cellules adjacentes
      ce qui crée plus de variété dans le pattern)
```
- `seed_phrase.txt`: seed phrase de 24 mots générée à partir de la clé SHA256 avec le protocole `BIP39`
```
  NB: https://vault12.com/securemycrypto/crypto-security-basics/what-is-bip39/
```
- `frieze_text.txt`: "seedphrase abrégée" (4 premières lettres de chaque mot, mots séparés par la première lettre en majuscules) suivie de l'UUID en Base64
    - ex: `ChilDangPuncAirNearBagTitlPublEraPrizSeriAdapFeePausMilkMessFluiPottWeekFarmGameHenNetTopOgCNTSBYTAWUJnIwa+nVMg`
```
  NB: La frise permet d'encoder 118 caractères, dont 96 pour la "seedphrase abrégée" et 22 pour l'UUID en Base64
```

#### Liens utiles
- Pour compter le nombre de caractères:
  https://string-functions.com/length.aspx
