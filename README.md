## Cryptocalc 0.1.10
![](https://github.com/ALADAS-org/Cryptocalc/blob/master/_doc/Screenshots/Seed_Wallet_0_1_6_EN.gif)
1. Purpose  
   _Cryptocalc_ is a standalone desktop application which generates _Crypto wallets_
   with the _Hierarchical Deterministic_ (`BIP32`) paradigm.
   Even though there is already a similar tools online, the purpose is to use these features
   locally on your computer in order to reduce the risk of having your _Private Key_ / _WIF_ 
   or _Seedphrase_ informations stealed.     
   NB: _Cryptocalc_ uses [ElectronJS](https://www.electronjs.org/) as well as many modern and popular
       [Desktop applications](https://en.wikipedia.org/wiki/List_of_software_using_Electron)
   
2. Environment
    + 2.1. [NodeJS](https://nodejs.org/en/)
	+ 2.2. [Git](https://git-scm.com/)
	
3. Installation  
   Import locally the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc)
    + 3.1. Open a _command line interpreter_
	    * Use Windows Menu _Start_ then input `cmd`
	    * Change _current disk_ to where you plan to install (eg. if its `D` then type `D:`)
	    * Change _current directory_ to where you to install (eg. `md tools` then `cd tools`)
	+ 3.2. Import _Cryptocalc_ from _github_
	    * Open the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc) 
	    * Use the [<> Code v] green button
	    * Copy the displayed [.git URL](https://github.com/ALADAS-org/Cryptocalc.git)
	    * In the _command line interpreter_, type `git clone ` followed by the `.git` URL\
	      e.g. `git clone https://github.com/ALADAS-org/Cryptocalc.git`
        * Type `cd Cryptocalc`	
        * Type `npm install`	

4. Release notes
    + 4.1. Features in `0.1.10`    
        * Bug Fixes in the generated `QRCodes` of `wallet information` folder (`www/_output`).	
		* Subfolder renamed from `xtras` to `svg`
		* Replaced `PrivateKeyMicro.svg` by `Entropy_MicroQR.png` and `Entropy_MicroQR.svg`
		* Update of this `README` (cf. 5.1.9) 
    + 4.2. Features in `0.1.8`    
        * Added _QR Code_ images (PNG) in the generated _Wallet Informations_
		folder (`www/_output`).	
	+ 4.3. Features in `0.1.6`
	    * 4.3.1. Added _Image_ as _Entropy Source_. _Entropy Source_ can
		be switched between `Image` (Default) and `Fortunes` (_Fortune Cookies_).    
		* 4.3.2. Default Cryptocurrency changed from `ETH` to `BTC`.
		* 4.3.3. Fixed missing `Private Key` field missing from `wallet_info.txt` for `ETH`.
	    * 4.3.4. Fixed unused dependencies in `package.json`. 
5. _Cryptocalc_ User Guide  
    Double click on `_run.bat`: this will launch _Cryptocalc_ desktop standalone application
    + 5.1. Features  
		* 5.1.1. Generate _Entropy_ from _Entropy Source_  
		Use [Generate] button to draw a random image (cf. 5.1.2)
		which then will be used as the _Entropy_ (with the _Salt_) to generate a new _Seedphrase_ (between 12 and
		24 words) which is derived to get the _Private Key_ from which the _Wallet Address_ is obtained
		(NB: _Private Key_ and _Wallet Address_ are in the _Wallet_ Tab).
		There is also a conversion to the _Shortened Seedphrase_: as only the 4 first characters of each _mnemonic_ 
		are useful (cf. `BIP39` specification) then in the _Shortened Seedphrase_ each _mnemonic_ is represented 
		only by its 4 first characters (with the first character in Uppercase as a mean to separate _mnemonics_).   
		NB: As some _mnemonics_ are only 3 characters long, the abbreviation will of course only be whole _mnemonic_.  
		Here is an example below:  
        _Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;rent expand super sea summer pull catalog mobile proud solve oven goose    
        _Shortened Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RentExpaSupeSeaSummPullCataMobiProuSolvOvenGoos    
        NB: Please notice that the _Shortened Seedphrase_ is not meant to be used
        to import a wallet in a _Wallet Manager_, it's only a trick to _compress_
        the _Seedphrase_ and make it easier to store on a device with limited memory
        like a `NTAG213 NFC` (see 5.2.3). 	
	    * 5.1.2. _Entropy Source_ : `Image` or `Fortunes`    
		_Entropy Source_ may be switched between `Image` (Default source) 
		and `Fortunes` (drawn from a compilation of 12803 _Fortune Cookies_). 
		Please notice that a text is not considered as random enough 
		for an _Entropy Source_ thus `Image` is now the default _Entropy Source_ 
        (Notice that an image is much better in terms of randomness than a text).    
		    * 5.1.2.a: You can _Drag'n'Drop_ images (`png`, `jpg` or `svg`) from you local folders.		
            * 5.1.2.b: Image samples are provided in `www/js/img` folder.  		
            * 5.1.2.c: When using [Generate], _Cryptocurrency logos_ are drawn 
			from the `www/js/img/CryptoCurrency` folder and the first image 
			is always our logo (`Zilver_64px.svg`).						
		* 5.1.3. Several wallets in the same _BIP32 HD wallet tree_    
        The `BIP32` HD wallet tree_ is determined by the _Entropy_ or _Seedphrase_. 
		These are 2 isomorphic representations of the _SRP_ (_Secret Recovery Passphrase_).		
		So you can generate new wallets (_Address_ + _Private Key_ or _WIF_)
		by Pasting a previous _Entropy_ or _Seedphrase_. 
		This will hide the _Entropy Source_ and _Salt_ fields which are meaningless in
        this situation. You can then change either the _Account_ or _Address Index_
        fields in the _Wallet_ tab page. This will show a new [Refresh] button
        to recompute the wallet once you gave finished editing these fields 
		(you can input a decimal value between 0 and 9999).		
		Pushing the [Refresh] button (or hitting either [ Return ] or [ Enter ] keys) 
		will recompute the wallet accordingly.
		* 5.1.4. Check generated wallets against _Ian Coleman BIP39_    
		an item in the menu (Help/Resources/Ian Coleman BIP39) eases the checking 
		by opening [_Ian Coleman BIP39_](https://iancoleman.io/bip39/).
		* 5.1.5. Import a wallet in Guarda    
		an item in the menu (Help/Resources/Guarda) eases importing a wallet in a
		_Wallet Manager_ application by opening [_Guarda_](https://guarda.com/).	
		* 5.1.6. _Salted Entropy_    
		The _Salting_ is adding a unique information (e.g. a _UUID_) so that
        even if the _Entropy Source_ is the same, the _Entropy_ will be unique 		
		at each press of [Generate] button.
		* 5.1.7. Choose _Entropy Size_    
		The _Entropy Size_ is between 128 to 256 bits (32 to 64 hexadecimal digits). 
		This is equivalent to a _Seedphrase size_ between 12 and 24 words. 
		Changing _Entropy Size_ impacts the _Seedphrase size_ and conversely.
		* 5.1.8. Display of the _Checksum bits_ (see explanations in 5.1.11)
		* 5.1.9. Save _Wallet Informations_    
		With `File/Save` (or the _Save_ icon in the main toolbar), you can save 
		the _Wallet Informations_ in a timestamped subfolder (eg. `2024_03_07_21h-4m-4s-3_BTC`)
		under `_output` folder. This subfolder contains `wallet_info.txt` and a `wallet.json` 
		with the informations displayed in _Seed_ and _Wallet_ tab pages.    
        _QR Code_ (`PNG` images) are generated for `Address`, `Private Key`, `Seedphrase`,
		`Entropy` and `Entropy_MicroQR` (a _Rectangular Micro QRCode_ of _Entropy_).    
        Notice that there is also a `svg` subfolder where these _QR Codes_ are provided
        in the `SVG` format and there is also a _Micro QR Code_ of the `Entropy` 
		(_Rectangular Micro QR Code_, `R15x59` version) which
        encodes the `Entropy` in Base64 (44 characters) but to be compatible with 
		the capacity of this encoding, the last character (`=`) is removed so that 
		the encoded text has a length of 43 characters.
		    * 5.1.9.a: How to retrieve a wallet from the _Rectangular Micro QR Code_    
		        * 5.1.9.a.I: Notice that most Android _QR Code reader_ apps will 
			    not be compatible with _Rectangular Micro QR Code_ but it works with 
			    [`QRQR`](https://play.google.com/store/apps/details?id=com.arara.q&hl=en)	 
			    an Android _QR Code reader_ published by _Arara_ on the _Google Play Store_. 
                * 5.1.9.a.II: In order to retrieve the Hexadecimal value of the _Entropy_, 
		        add a `=` character at the end and enter it in a 
		        [_Hex to Base64 converter_](https://base64.guru/converter/encode/hex).    
                * 5.1.9.a.III: Then you can convert the _Entropy_ to the matching _Seedphrase_ 
			    by doing a copy/paste of the _Entropy_ (an hexadecimal value)
			    inside the `Entropy` field in _Cryptocalc_.    
				* 5.1.9.a.IV: Then you can convert the _Entropy_ to the matching _Seedphrase_ 
			    by doing a copy/paste of the _Entropy_ (an hexadecimal value)
			    inside the `Entropy` field in _Cryptocalc_.    
				**Caution**: Take care to input the same `Entropy Size` and `Derivation path`
				if applicable (use the [Refresh] button).
				These informations are provided in the `wallet_info.txt` file
				which was generated when the wallet was created.    
				e.g.1. `Entropy Size` is 128 bits if there are 32 hexadecimal digits in the _Entropy_    
                e.g.2. `Entropy Size` is 256 bits if there are 64 hexadecimal digits in the _Entropy_  				
        * 5.1.10. Select _Seedphrase Language_    
		You can select the _Wordlist Language_ (eg. _English_, _French_, _Deutsh_, etc...). 
		Please notice that only _English_ is accepted for most _Wallet Manager_ applications. 
        Changing _Wordlist Language_ is indeed a mean to add a scramble step in order 
		to make it harder to steal your _Secret Recovery Passphrase_ because 
        it should be translated to _English_ to be used with a _Wallet Manager_.   
		NB: the translation between languages is native in _Cryptocalc_
		because the reference is the _Word Indexes_ (see 5.1.11) not the words.
		* 5.1.11. Display of _Word Indexes_    
        The _Word Indexes_ are between 0 and 2047, it is the index of each of the 
		_Seedphrase_ words in the `BIP39` dictionary (see also 6.1.1). 
		You can choose to display these indexes in _Decimal_ or _Binary_ 
		(in _Binary_ you can check that the computed _Checksum bits_ are added at the end
		of the converted _Entropy_ to determine the index of the last word).
		* 5.1.12. Display of the _BIP32 Derivation Path_    
		The _BIP32 Derivation Path_ is displayed in the _Wallet_ tab page.
		You can edit the _Account_ or _Address Index_ fields to generate new wallets
		which belong to the same `BIP32` hierarchy that is determined by the
		_Seedphrase_ (also called the _Secret Recovery Passphrase_).
        * 5.1.13. Support of _Localization_    
        In _Cryptocalc_, the _Localization_ (`l10n`) feature is the translation of 
		_GUI Labels_ to adapt to the _locale_ (eg. `en`).
        A _locale_ name can be composed of a base language, country (territory) of use, 
		and optionnally a codeset (eg. `de_CH.UTF-8`).		
		The _locale_ is provided as part of your machine's environment. 
		_Cryptocalc_ only uses the 2 letter language part (eg. `en`). 
		Localization is enabled by a _JSon_ file in the `www/js/L10n` folder 
		(eg. `gui-msg-en.json`) . 
		Currently only `en` and `fr` are provided.  		
    + 5.2. Use cases
        * 5.2.1. Generate a new _Wallet_ and import it in a _Wallet manager_  
	    With a _Wallet Manager_ like [_Guarda_](https://https://guarda.com/) you can import
		a wallet generated by _Cryptocalc_:   
            * 5.2.1.a. Choose a coin (e.g. `BTC`,`ETH`,`DOGE`,`LTC,``SOL`) 
		    * 5.2.1.b. Enter _Private Key_  (NB: or _WIF_ for `BTC` wallets)    
        * 5.2.3. Store _Shortened Seedphrase_ in a _NFC SmartRing_  
        The entry level _SmartRings_ (price range: 7..15$) contains a `NTAG213 NFC` with 
		144 bytes useable capacity. This is enough to store the _Shortened Seedphrase_, 
		with a 24 words _Shortened Seedphrase_ 
	    the maximum required capacity is 96 bytes/characters (24*4, cf. 5.1.1) 
		or even less (as some mnemonics have only three characters).   
        * 5.2.4. Store _Master password_  
        This is similar to the previous case, but the _Shortened Seedphrase_ 
		can be used as a _Master password_ for a _Password Manager_ or for tools like
		[_PGP Tool_](https://pgptool.github.io) which provide encryption/decryption
	    of your documents.
6. Appendix  
    + 6.1. `BIP39`: a _Dictionary_ of 2048 words    
	`BIP39` (`BIP` is the acronym of _Bitcoin Improvement Proposal_) is a specification regarding:
		* 6.1.1. A _Dictionary_ of 2048 words    
		The _Dictionary_ contains 2048 _English_ words each with a their unique 4 starting characters 
		(or 3 if the word is 3 characters long). This dictionary exists also in other languages 
		(e.g. _French_, _Deutsh_, _Spanish_, Italian_, _Portuguese_, etc...) but _Wallet Managers_ 
		(e.g. _Guarda_, _Metamask_, _Atomic Wallet_, etc...) and _Hardware Wallets_ 
		(eg. _Ledger_, _Trezor_, _Tangem_, etc...) will most probably accept only _English_ words.
	    * 6.1.2. Conversion of _Seedphrase_ from and to _Entropy_		
        The _Seedphrase_ is obtained by drawing words (also called or _menemonics_) from the dictionary.
        Drawing a word is indeed choosing an index between 0 and 2047. This index can be represented
        by 11 bits in _Binary_ (because 2^11 = 2048). 
            * Conversion from _Entropy_ to _Seedphrase_
			The _Entropy_ is represented in _Binary_ and divided in 11 bits segements but the entropy
			is a multiple of 8 bits (128, 160, 192, 224, 256) there are "missing bits" for choosing 
			the last word. These "missing bits" are provided by computing the _Entropy Checksum_.
			e.g. For an _Entropy Size_ of 128 bits (converted to a 12 words _Seedphrase_), 
		    132 bits are needed (11 * 12), so the _Entropy Checksum_ provides the missing 4 bits.
			* Conversion from _Seedphrase_ to _Entropy_ 
			For each word its index is retrieved from the _Dictionary_, its value is represented
			as a 11 bits segment and a number of bits corresponding to tne _Entropy Checksum_
			are removed at the end of the concatenation of 11 bits segments.
			e.g. For a _Seedphrase_ of 12 words (converted to a 128 bits _Entropy_), 
		    132 bits are obtained from the _Word Indexes_ (11 * 12), and because the _Entropy Checksum_ 
			is 4 bits long then the 4 bits at the end are removed.
		* Reference    
		[BIP39 — Mnemonic Generation with detailed explanation](https://medium.com/@sundar.sat84/bip39-mnemonic-generation-with-detailed-explanation-84abde9da4c1)
	+ 6.2. `BIP32`: Hierarchic Deterministic wallets
	`BIP32` specifies how to generate wallets with are all derived from the same _Entropy_
	or _Seedphrase_ (also called the _Secret Recovery Passphrase_).
    A _Seedphrase_ of only 12 words is enough is most _Wallet Managers_ but 
	it is more secure to use a 24 words _Seedphrase_ if possible 
	(e.g. _Ledger_ hardware wallet manager).    
	    Example: meaning of each part for `m/44'/60'/0'/0/0`:    
	    * Start at the master key                                      (m)    
        * Follow the `BIP44` specification                             (44′)    
        * Derive the key for _Ethereum_ (for which _Coin type_ is 60)  (60′)    
        * Access the first account                                     (0′)    
        * Choose the external chain, used for public addresses         (0)    
        * And finally, generate the first address in this sequence     (0)    
        	
	* Reference    
	    + [Understanding Derivation Paths in Cryptocurrency: Easy-To-Follow Guide](https://getcoinplate.com/blog/derivation-paths-guide/#:~:text=A%20derivation%20path%20is%20simply,a%20particular%20branch%20(address))
		+ [Hierarchical key generation](https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786)
			
		
