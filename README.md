## CryptoCalc 0.3.46
![](https://github.com/ALADAS-org/cryptocalc/blob/master/_doc/Screenshots/Entropy_Wallet_0_3_45_EN.gif)
1. Purpose  
   _CryptoCalc_ is a _Cryptocurrency wallet generator_ provided as a standalone non custodial desktop application.    
   These wallets can be _Non Deterministic_ (_Simple Wallet_) or _Hierarchical Deterministic_ (`BIP32`).
   Even though there is already similar tools online, the purpose is to provide these features
   locally on your computer (non custodial) in order to reduce the risk of your _Private Key_ / _WIF_ 
   or _seed phrase_ informations being stolen.    
   NB: Since its first release _CryptoCalc_ has been downloaded 8740 times on [npm](https://www.npmjs.com/) (even though there is also bots involved 
   in downloads, it seems that there is between 100 and 150 frequent users).      
   
   _Supported Cryptocurrencies_: BTC (Bitcoin), ETH (Ethereum), XRP (Ripple), BNB (Binance Smart Chain), SOL (Solana), 
   DOGE (Dogecoin), TRX (TRON), ADA (Cardano), XLM (Stellar), SUI (Sui), BCH (Bitcoin Cash), AVAX (Avalanche), TON (Toncoin), 
   LTC (Litecoin), ETC (Ethereum Classic), POL (Polygon), VET (VeChain), BSV (Bitcoin SV), DASH (Dash), RVN (Ravencoin), 
   ZEN (Horizen), LUNA (Terra) and FIRO (Firo)    
   
   + Note 1: `BNB` support is on _Binance Smart Chain_ (in this blockchain `BNB` is a `BEP-20` token, see reference 5.3.4)
   + Note 2: it's `LUNA 2.O` (on _Terra_ blockchain) not `LUNA Classic`
   + Note 3: `SUI` support was validated with 'Suiet' (Sui wallet), a Chrome extension   
   
   _Supported Languages_: _English_, _French_, _Spanish_, _Italian_, _Latin_, _Esperanto_, _Czech_, 
   _Portuguese_, _Deutsch_, _Simplified Chinese_, _Traditional Chinese_, _Japanese_, _Korean_, 
   _Hindi_, _Gujarati_, _Russian_, _Greek_.    
   
   NB: _CryptoCalc_ uses [ElectronJS](https://www.electronjs.org/) as well as many modern and popular
       [Desktop applications](https://en.wikipedia.org/wiki/List_of_software_using_Electron) 
	   (e.g. [Visual Studio Code](https://code.visualstudio.com/)) 
   
2. Setup 
   + 2.1. _Fast and Furious_ (advised for end users)
      + 2.1.1. Download [CryptoCalc installer](https://sourceforge.net/projects/aladas-cryptocalc/files/latest/download)
	  from _SourceForge_ (NB: the installer was generated with [electron packager](https://www.npmjs.com/package/@electron/packager)
	  and [Inno Setup](https://jrsoftware.org/isinfo.php).    
      Notice that the installer is not signed so _Windows Defender Smartscreen_ 
	  will require that you validate yourself the application source. 
	  If you don't trust the installer (because it is not signed as this is a 350$ cost per year), you can either:
	      + 2.1.1.a. Rebuild yourself the _Installer_ by downloading `Inno Setup` and following the _Howto_ 
          provided in the `_inno_setup` subfolder (`Howto build cryptocalc_setup.txt`) 		  
          + 2.1.1.b. Else you can proceed to _Wizard's Lair_ setup instead (see 2.2)	  
      + 2.1.2. Default setup folder is `C:\Users\$CURRENT_USER\AppData\Local\Programs\Cryptocalc`
      + 2.1.3. Default subfolder where _Wallet informations_ are saved:    
	      * `$DEFAULT_SETUP_FOLDER\resources\app\_output`	  
   + 2.2. _Wizard's Lair_ (advised for custom local setup and/or software developers)
      + 2.2.1. Prerequisites
          * Install [NodeJS](https://nodejs.org/en/)
	      * Install [Git](https://git-scm.com/)
      + 2.2.2. Open a _command line interpreter_
	      * Use Windows Menu _Start_ then input `cmd`
	      * Change _current disk_ to where you plan to install (eg. if its `D` then type `D:`)
	      * Change _current directory_ to where you to install (eg. `md tools` then `cd tools`)
	  + 2.2.3. Import _CryptoCalc_ from _github_
	      * Open the [GitHub _CryptoCalc_ repository](https://github.com/ALADAS-org/cryptocalc) 
	      * Use the [<> Code v] green button
	      * Copy the displayed [.git URL](https://github.com/ALADAS-org/cryptocalc.git)
	      * In the _command line interpreter_, type `git clone ` followed by the `.git` URL\
	      e.g. `git clone https://github.com/ALADAS-org/cryptocalc.git`
          * Type `cd cryptocalc`	
          * Type `npm install`    

3. Release notes
    + 3.1. Features in `0.3.46`
		* Added support of _Gujarati_ for the _Seed phrase_
		* Default _Entropy source_ is now `D6 dices`
	+ 3.2. Features in `0.3.45`
	    * Added informations for `Mouse moves` Entropy source: 
			+ Renamed [New Entropy] to [New points...]
			+ Explanations for manual (with [New points...]) vs automatic generation (with [Generate])
		* Updated screenshots from `0.3.15` to `0.3.45`
	+ 3.3. Features in `0.3.44`
	    * New _Entropy source_: `Mouse moves`
	+ 3.4. Features in `0.3.43`
	    * New _Entropy source_: `D6 dices` (e.g. 100 rolls for 256 bits of Entropy)  
	+ 3.5. Features in `0.3.42`
	    * Conversion of new wordlists (DE, RU, EO, LA, EL, HI) in .txt format to submit as proposals for official BIP39 repository
	+ 3.6. Features in `0.3.41`
	    * Added support of _Greek_ for the _Seed phrase_
	+ 3.7. Features in `0.3.40`
	    * Added `Marketcap` button (after `Explore` button) in _Wallet Tab Page_ to show the relevant [coinmarketcap](https://coinmarketcap.com/) URL
	+ 3.8. Features in `0.3.39`
	    * Replaced default random generator `Math.random` with a more secure for cryptography usage (see `secureRandom()` in `hex_utils.js`) 
	+ 3.9. Features in `0.3.38`
	    * Added `POL` cryptocurrency (_POL_) in _Simple Wallet_,  _HD Wallet_ and _SWORD Wallet_ modes
	    * Documentation missing: added note on how `SUI` support was validated
	+ 3.10. Features in `0.3.37`
	    * Added `SUI` cryptocurrency (_Sui_) in _HD Wallet_ / _SWORD Wallet_ modes
	+ 3.11. Features in `0.3.36`
	    * Documentation Fix: missing `ZEN` (_Horizen_) in the kist of supported cryptocurrencies
	+ 3.12. Features in `0.3.35`
	    * Added `ZEN` cryptocurrency (_Horizen_) in _Simple Wallet_ mode
	+ 3.13. Features in `0.3.34`
	    * Documentation Fix: indeed `ZEC` (ZCASH) is not supported ATM
	+ 3.14. Features in `0.3.33`
	    * Added `RVN` cryptocurrency (_Ravencoin_) in _HD Wallet_ / _SWORD Wallet_ modes
	+ 3.15. Features in `0.3.32`
	    * Added `LUNA` cryptocurrency (_Terra_, it's `LUNA 2.O` not `LUNA Classic`) in _Simple Wallet_ mode
	+ 3.16. Features in `0.3.31`
	    * Added `BSV` cryptocurrency (_Bitcoin SV_) in _HD Wallet_ / _SWORD Wallet_ modes
	+ 3.17. Features in `0.3.30`
	    * Added `VET` cryptocurrency (_VeChain_) in _HD Wallet_ / _SWORD Wallet_ modes
	+ 3.18. Features in `0.3.29`
	    * Added `ETC` cryptocurrency (_Ethereum Classic_) in _HD Wallet_ / _SWORD Wallet_ modes
		* Bug/Regression fixes:  
			+ Regression: Changing 'Word Indexes' Base to Binary / Decimal was not working
			+ Bug: Blockchain Explorer link for 'Bitcoin Cash' was KO
	+ 3.19. Features in `0.3.28`
	    * Bug fix: Regression in `0.3.27` induced by incomplete clean after prototyping `TON` support
	+ 3.20. Features in `0.3.27`
	    * Added `TON` cryptocurrency (_Toncoin_ blockchain) but supported only in _Simple Wallet_ mode 
	+ 3.21. Features in `0.3.26`
	    * Added support of `BNB` cryptocurrency on _Binance Smart Chain_ Blockchain (see reference 5.3.4)
	    * Bug fix: Error when setting 'Connection Status' icon while the DOM element is not yet created
	+ 3.22. Features in `0.3.25`
	    * Added support of `XLM` (_Stellar_)

4. _CryptoCalc_ User Guide  
    You can launch _CryptoCalc_ either by first installing it with the _CryptoCalc Standalone installer_ (see 2.1)
	or by downloading the `npm package` (see 2.2) then double clicking on `_run.bat`.
    + 4.1. Features 
        * 4.1.1. _Cryptocalc Standalone installer_    
		    + 4.1.1.a: Downloadlc [CryptoCalc installer](https://sourceforge.net/projects/aladas-cryptocalc/)
		    + 4.1.1.b. Default subfolder where _Wallet informations_ are saved:    
	        `$DEFAULT_SETUP_FOLDER\resources\app\_output`: Notice that this folder won't be automatically deleted if you uninstall _CryptoCalc_	
		* 4.1.2. Generate _Entropy_ from _Entropy Source_    
		Use [Generate] button to draw a random image (cf. 4.1.3)
		which then will be used as the _Entropy_ (with the _Salt_) to generate a new _seed phrase_ (between 12 and
		24 words) which is derived to get the _Private Key_ from which the _Wallet Address_ is obtained
		(NB: _Private Key_ and _Wallet Address_ are in the _Wallet_ Tab).
		There is also a conversion to the _Shortened seed phrase_: as only the 4 first characters 
		of each _mnemonic_ are meaningful 
		(cf. `BIP39` specification) then in the _Shortened seed phrase_ each _mnemonic_ is represented 
		only by its 4 first characters (with the first character in Uppercase as a mean to separate _mnemonics_).   
		NB: As some _mnemonics_ are only 3 characters long, the abbreviation will of course only be whole _mnemonic_.  
		Here is an example below:  
        _seed phrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;rent expand super sea summer pull catalog mobile proud solve oven goose    
        _Shortened Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RentExpaSupeSeaSummPullCataMobiProuSolvOvenGoos    
        NB: Please notice that the _Shortened seed phrase_ is not meant to be used
        to import a wallet in a _Wallet Manager_, it's only a trick to _compress_ the _seed phrase_ and make it easier
		to store on a device with limited memory like a `NTAG213 NFC` (see 4.2.3). 	
	    * 4.1.3. _Entropy Source_ : `D6 Dices`, `Mouse moves`, `Image` or `Fortunes`
            * `D6 Dices`: default source, the number of rolls depends on _Entropy size_ (e.g. 100 rolls for 256 bits)
			* `Mouse moves`: entropy bytes are generated when the user moves the mouse pointe            
			* `Image`:     
			    + You can _Drag'n'Drop_ images (`png`, `jpg` or `svg`) from you local folders.		
                + Image samples are provided in `www/img` folder.  		
                + When using [Generate], _Cryptocurrency logos_ are drawn from `www/img/CryptoCurrency`
			* `Fortunes`: drawn from a compilation of 12803 _Fortune Cookies_
        * 4.1.4. Choose _Wallet_Mode_: _Simple Wallet_, _HD Wallet_ or _SWORD Wallet_ (choice is in the `Wallet` tab page)  	
            * 4.1.4.a. _Simple Wallet_    
            This is the default _Wallet Mode_. In this mode, each wallet is separated. 
			(no need to understand the principles of the _HD Wallet Wallet Tree_
			and the purpose of the `Derivation Path` used by _HD Wallets_). So a  it's a good fit to 
			_Give it a Try_ and start creating your _Cryptocurrency Wallets_ with minimum knowledge.    
			On the other hand it's less secure than _HD Wallets_ (especially if you use low security entropy
			text like you firstname, city/birth year etc.... Indeed its will be vulnarable 
			to [_dictionary attacks_](https://en.wikipedia.org/wiki/Dictionary_attack) )	
			and it becomes clumsy if you need to split your assets between many wallets. 			
			* 4.1.4.b. _HD Wallet_    
			This _Wallet Mode_ allows to create / manage a whole hierarchy of Wallets (_HD_ is the acronym for 
			_Hierarchical Deterministic_) in the same _BIP32 tree_.
			> Please notice that the `Derivation Path` is now `Hardened` by default and mandatory (since `0.3.18`). 
			> This is for _Security_ purpose (see 5.2.3)
			The `BIP32` HD wallet tree_ is fully determined by the _Entropy_ (or _seed phrase_ which is equivalent) 
			and an optional _Password_.
			The _Entropy_ may be represented by a more human friendly representation: the _Mnemonics Sequence_ which 
			may also be called a _seed phrase_, _Mnemonics_ or even _SRP_ (_Secret Recovery Passphrase_).    
			> How to Generate a new wallet with a given _Entropy_:    
			> Paste a new _Entropy_ (or _seed phrase_) in the `Entropy` wallet tab. 
			> Notice that this will hide the _Entropy Source_ and _Salt_ fields 
			> (meaningless in this situation).    
			> You can then change either the _Account_ or _Address Index_ fields 
			> (the maximum number of digits is 9 so you can input a decimal value 
			> between 0 and 999999999 for each field) in the _Wallet_ tab page. 
			> This will show a [Refresh] button to recompute the wallet once you have finished.
			> Pushing the [Refresh] button (or hitting either [Return] or [Enter] keys 
			> while the cursor is in either _Account_ or _Address Index_ field) will recompute the 
			> wallet address (and _Private key_ or _WIF_) accordingly.
			* 4.1.4.c. _SWORD Wallet_    
			`SWORD` is an acronym which means `Simple Wallet Over Randomized Deterministic`, 
			it's an hybrid between `Simple Wallet` and `HD Wallet` because it hides the `Derivation Path` logic 
			(which contains `Account` and `Address Index`), thus you don't need to care or understand the principles 
			of _Hierarchical Deterministic_ wallets, but it allows to generate all the cryptocurrencies provided by `HD Wallet`.
			* 4.1.4.d. Please notice that for `Cardano` HD wallets, the `Account` and `Address Index` parameters are not taken 
			into account by the _Wallet Managers_ which I have tested (namely `Guarda` and `Yoroi`) because they ask for 
			the `Mnemonics` (`Seed phrase` in _CryptoCalc_). This is why in _CryptoCalc_, these parameters are _hard-coded_
			to Zero (for `Cardano` HD wallets only).			
			* 4.1.4.e. You can check generated _HD Wallets_ with _Ian Coleman BIP39_ homepage    
			It's [URL](https://iancoleman.io/bip39/) is provided as an item in the `Help menu` (`Help/Resources/Ian Coleman BIP39`)
		* 4.1.5. _Password feature_ (_HD Wallet_ only)    
    	With a _password_ (also called _Passphrase_) a completely different _HD hierarchy_ is generated. 
		You can either input or generate (with the [Generate] button represented by a `Refresh` icon, like in the main toolbar). 
		**Important Notice**: Once a password is provided, you must use the [Apply] button to recompute the _HD hierarchy_, 
		this is the reason why _Save_ is disabled (in the main toolbar and in the 'File' menu) until you click on the [Apply] button. 			
		* 4.1.6. _Salted Entropy_    
		_Entropy_ is generated from _Entropy Source_ (either _Image_ or _Fortune Cookie_ ATM) and adding
		a _Salt_ (`UUID`) to ensure that the _Entropy_ will be different at each Generation even if the _Entropy Source_ 
		is the same. Thus the _Entropy_ will be unique at each press of [Generate] button.
		* 4.1.7. Choose _Entropy Size_    
		The _Entropy Size_ is between 128 to 256 bits (32 to 64 hexadecimal digits). This is equivalent to a _Seedphrase size_ 
		between 12 and 24 words. Changing _Entropy Size_ impacts the _Seedphrase size_ and conversely.
		* 4.1.8. _Wallet Address_    
		_Wallet Address_ is displayed in the `Wallet` tab page. There's also an [Explorer...] button which allows to check
		the generated address in the appropriate _Blockchain Explorer_.
		* 4.1.9. _Internet Connection Status_    
		This is to secure _Offline wallet creation_ (_non custodial_). An icon at the right of the _Main Toolbar_ shows 
		if the Internet is connected (`Wifi ON` red icon) or not connected (`Wifi OFF` green icon)
		* 4.1.10. `Save` _Wallet Informations_    
		With `File/Save` (or the _Save_ icon in the main toolbar), you can save the _Wallet Informations_ in a timestamped 
		subfolder (eg. `2024_10_07_21h-4m-4s-3_BTC_EN`) under `_output` folder.	
		This subfolder contains `wallet_info.txt` and a `wallet.json` with the informations displayed in _Entropy_ and _Wallet_ tab pages. 
			* 4.1.10.a. When you save the current generated wallet a Popup dialog confirms the saving and allows to show where it is saved.    
            * 4.1.10.b. The _Wallet Informations_ subfolder contains _QR Codes_ (`png` images) for `Address`, `Private Key`, `Seedphrase`,
			`Entropy` and `WIF` (if applicable).    
			Notice that there is a `xtras` subfolder where these _QR codes_ are provided
			in the `svg` format. There is also a _Rectangular Micro QR code_ (`rMQR`) of the 
			`Entropy` (_Rectangular Micro QR Code_, `R15x59` or `R15x77` version depending on		
			`Entropy size`) and an experimental `Ultracode` color QR code of the `Entropy`.
		    * 4.1.10.c: How to retrieve a _Wallet Address_ from the _Rectangular Micro QR Code_    
		        * 4.1.10.c.I: Notice that most Android _QR Code reader_ apps will 
			    not be compatible with _Rectangular Micro QR Code_ but it works with 
			    [`QRQR`](https://play.google.com/store/apps/details?id=com.arara.q&hl=en)	 
			    an Android _QR Code reader_ published by _Arara_ on the _Google Play Store_.              
                * 4.1.10.c.II: Then convert the _Entropy_ to the matching _seed phrase_ 
			    by doing a copy/paste in the `Entropy` field of _CryptoCalc_.    
				**Caution**: Take care to set _CryptoCalc_ with the same `Entropy Size` and 
				`Derivation path` (if applicable, don't forget to use the [Refresh] button)
				than those used when the wallet was created (these informations 
				are provided either in the `wallet_info.txt` or in `wallet_info.wits`).
		* 4.1.11. `Open` _Wallet Informations_ of a previously saved wallet    
		    * 4.1.11.a. _Wallet informations_ are saved both as a `.txt` but also as a `.wits` file (`JSON` format). 
		    * 4.1.11.b. A `.wits` file can be opened either with `File.Open...` menu item or 'Open...' icon
			in the toolbar. It can be also be opened in `Cryptocalc.exe` by double clicking on the `.wits` 
			(_File extension to Application_ feature): this will launchlc `Cryptocalc.exe` (cf. 2.1 for installing 
			`Cryptocalc.exe` with the _CryptoCalc Standalone installer_)  /
			* 4.1.11.c. Once opened, a wallet can't be saved on itself (it is to prevent accidental overwrite of the original wallet),
            but you can use `File.Save As...` which will save the wallet with a different timestamp than the original one.	
            * 4.1.11.d.	Notice that for a _HD Wallet_ you can change the `Account` and/or the `Address Index` (dont forget to push
			the [Refresh] button). Now you can save the new wallet with `File.Save As...` and if you didn't change the `Entropy` 
            then this new wallet will belong to the same `Bip32 HD Wallet Tree` (see 5.2) than the original one.			
		* 4.1.12. Import a wallet in `Guarda`    
		An item in the menu (Help / Resources / Guarda) eases importing a wallet in a
		_Wallet Manager_ application by opening [`Guarda`](https://guarda.com/).				
        * 4.1.13. Select _Seedphrase Language_    
		You can select the _Wordlist Language_ (eg. _English_, _French_, _Deutsh_, etc...). 
		Please notice that only _English_ is accepted for most _Wallet Manager_ applications. 
        Changing _Wordlist Language_ is indeed a mean to add a scramble step in order 
		to make it harder to steal your _Secret Recovery Passphrase_ because 
        it should be translated to _English_ to be used with a _Wallet Manager_.   
		NB: the translation between languages is native in _CryptoCalc_
		because the reference is the _Word Indexes_ (see 4.1.10) not the words.
		* 4.1.14. Display of _Word Indexes_    
        The _Word Indexes_ are between 0 and 2047, it is the index of each of the 
		_Seed phrase_ words in the `BIP39` dictionary (see also 6.1.1). 
		You can choose to display these indexes in _Decimal_ or _Binary_ 
		(in _Binary_ you can check that the computed _Checksum bits_ are added at the end
		of the converted _Entropy_ to determine the index of the last word).
		* 4.1.15. Display of the _BIP32 Derivation Path_    
		The _BIP32 Derivation Path_ is displayed in the _Wallet_ tab page.
		You can edit the _Account_ or _Address Index_ fields to generate new wallets
		which belong to the same `BIP32` hierarchy that is determined by the
		_seed phrase_ (also called the _Secret Recovery Passphrase_).
		* 4.1.16. Change/Reset of _Options_ (`Tools/Options`)    
		Currently it allows to set default values for `Default Blockchain`, `Wallet Mode` and `Entropy Size`.
		These values are defined in `www/config/options.json` file.    
		It is also possible to reset _Options_ to _Default Options_
		(defined in `www/config/defaults/options.json`)
        * 4.1.17. Support of _Localization_    
        In _CryptoCalc_, the _Localization_ (`l10n`) feature is the translation of 
		_GUI Labels_ to adapt to the _locale_ (eg. `en`).
        A _locale_ name can be composed of a base language, country (territory) of use, 
		and optionnally a codeset (eg. `de_CH.UTF-8`).		
		The _locale_ is provided as part of your machine's environment. 
		_CryptoCalc_ only uses the 2 letter language part (eg. `en`). 
		Localization is enabled by a _JSon_ file in the `www/js/L10n` folder 
		(eg. `gui-msg-en.json`) . 
		Currently only `en` and `fr` are provided.  		
    + 4.2. Use cases
        * 4.2.1. Generate a new _Wallet_ and import it in a _Wallet manager_  
	    With a _Wallet Manager_ like [`Guarda`](https://https://guarda.com/) you can import
		a wallet generated by _CryptoCalc_:
            * 4.2.1.a. Choose _Wallet Mode_: _Simple Wallet_, _HD Wallet_ or _SWORD_		
            * 4.2.1.b. Choose a coin: `BTC`,`ETH`,`XRP`,`ADA`,`DOGE`,`LTC`,`SOL`,`AVX`,`TRON`,`BCH`,`DASH`,`Firo` 
		    * 4.2.1.c. Enter _Private Key_  (NB: or _WIF_ for `BTC` wallets)    
        * 4.2.3. Store _Shortened Seedphrase_ in a _NFC SmartRing_  
        The entry level _SmartRings_ (price range: 7..15$) contains a `NTAG213 NFC` with 
		144 bytes useable capacity. This is enough to store the _Shortened Seedphrase_, 
		with a 24 words _Shortened Seedphrase_ 
	    the maximum required capacity is 96 bytes/characters (24*4, cf. 4.1.1) 
		or even less (as some mnemonics have only three characters).   
        * 4.2.4. Store _Master password_  
        This is similar to the previous case, but the _Shortened Seedphrase_ 
		can be used as a _Master password_ for a _Password Manager_ or for tools like
		[_PGP Tool_](https://pgptool.github.io) which provides encryption/decryption of your documents.    
		
5. Appendix  
    + 5.1. `BIP39`: a _Dictionary_ of 2048 words    
	`BIP39` (`BIP` is the acronym of _Bitcoin Improvement Proposal_) is a specification regarding:
		* 5.1.1. A _Dictionary_ of 2048 words    
		The _Dictionary_ contains 2048 _English_ words each with a their unique 4 starting characters 
		(or 3 if the word is 3 characters long). This dictionary exists also in other languages 
		(e.g. _French_, _Deutsh_, _Spanish_, Italian_, _Portuguese_, etc...) but _Wallet Managers_ 
		(e.g. _Guarda_, _Metamask_, _Atomic Wallet_, etc...) and _Hardware Wallets_ 
		(eg. _Ledger_, _Trezor_, _Tangem_, etc...) will most probably accept only _English_ words.
	    * 5.1.2. Conversion of _seed phrase_ from and to _Entropy_		
        The _seed phrase_ is obtained by drawing words (also called or _menemonics_) from the dictionary.
        Drawing a word is indeed choosing an index between 0 and 2047. This index can be represented
        by 11 bits in _Binary_ (because 2^11 = 2048). 
            * Conversion from _Entropy_ to _seed phrase_
			The _Entropy_ is represented in _Binary_ and divided in 11 bits segements but the entropy
			is a multiple of 8 bits (128, 160, 192, 224, 256) there are "missing bits" for choosing 
			the last word. These "missing bits" are provided by computing the _Entropy Checksum_.
			e.g. For an _Entropy Size_ of 128 bits (converted to a 12 words _seed phrase_), 
		    132 bits are needed (11 * 12), so the _Entropy Checksum_ provides the missing 4 bits.
			* Conversion from _seed phrase_ to _Entropy_ 
			For each word its index is retrieved from the _Dictionary_, its value is represented
			as a 11 bits segment and a number of bits corresponding to tne _Entropy Checksum_
			are removed at the end of the concatenation of 11 bits segments.
			e.g. For a _seed phrase_ of 12 words (converted to a 128 bits _Entropy_), 
		    132 bits are obtained from the _Word Indexes_ (11 * 12), and because the _Entropy Checksum_ 
			is 4 bits long then the 4 bits at the end are removed.
		* Reference    
		[BIP39 — Mnemonic Generation with detailed explanation](https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1)
	
	+ 5.2. `BIP32`: Hierarchic Deterministic wallets
	`BIP32` specifies how to generate wallets with are all derived from the same _Entropy_
	or _seed phrase_ (also called the _Secret Recovery Passphrase_).
    A _seed phrase_ of only 12 words is enough is most _Wallet Managers_ but it is much more secure to use a 24 words 
	_seed phrase_ if possible (e.g. _Ledger_ hardware wallet manager).    
	    Example: meaning of each part for `m/44'/60'/0'/0/0'` (a _Hardened Derivation Path_):    
	    * Start at the master key                                      (m)    
        * Follow the `BIP44` specification                             (44')    
        * Derive the key for _Ethereum_ (for which _Coin type_ is 60)  (60')     
        * Access the first account                                     (0')    
        * Choose the external chain, used for public addresses         (0)    
        * And finally, generate the first address in this sequence     (0')    
        	
	* 5.3. References    
	    + 5.3.1. [Understanding Derivation Paths in Cryptocurrency: Easy-To-Follow Guide](https://getcoinplate.com/blog/derivation-paths-guide/#:~:text=A%20derivation%20path%20is%20simply,a%20particular%20branch%20(address))
		+ 5.3.2. [Hierarchical key generation](https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786)
		+ 5.3.3. [BIP32 Key Derivation with HD Wallets](https://docs.bsvblockchain.org/guides/sdks/ts/examples/example_hd_wallets)
		+ 5.3.4. [The evolution of the Binance Smart Chain](https://cointelegraph.com/learn/articles/a-beginners-guide-to-the-bnb-chain-the-evolution-of-the-binance-smart-chain)