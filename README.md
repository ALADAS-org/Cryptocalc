## Cryptocalc 0.1.2
![](https://github.com/ALADAS-org/Cryptocalc/blob/master/_doc/Screenshots/Cryptocalc_0_1_0_EN.gif)
1. Purpose  
   _Cryptocalc_ is a standalone desktop application which provides straigthforward
   conversions between a `Private Key` (an `Hexadecimal` value) and the matching _Seedphrase_ .
   (12 to 24 _mnemonics_ from the _BIP39_ dictionary). 
   Even though there is already a lot of similar tools online, the purpose is to use these features
   locally on your computer in order to reduce the risk of having your _Private Key_ 
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
	    * Use the [ <> Code v ] green button
	    * Copy the displayed [.git URL](https://github.com/ALADAS-org/Cryptocalc.git)
	    * In the _command line interpreter_, type `git clone ` followed by the `.git` URL\
	      e.g. `git clone https://github.com/ALADAS-org/Cryptocalc.git`
        * Type `cd Cryptocalc`	
        * Type `npm install`	

4. Release notes
    + 4.1. Features in `0.1.0`
        * 4.1.1. Complete rewrite of Wallet generation to support _BIP39_, _BIP32_ and _BIP44_ specifications  
		I had it mostly wrong (especially the computation of _Entropy Checksum_). I rewrote _Wallet generation_
		in order to make it compatible with these computations: [_Ian Coleman BIP39_](https://iancoleman.io/bip39/)
		Note that now the _Private Key_ or _WIF_ (only _Private Key_ for _Ethereum_) are used (see 5.2.2.) to import a wallet 
		in [_Guarda_](https://guarda.com/app/).
		The terminology has been changed, the _Wallet generation waterfall_ is now:  
		_Entropy source_ => _Entropy_ => _Seedphrase_ => _Private Key_/WIF => _Wallet Address_
		* 4.1.2. Support of 12..24 words for the _Seedphrase_ 
		With a variable _Entropy Size_ (128..256 bits), the _Seedphrase_ size varies from 12 to 24 words.
		The _Entropy Size_ size impacts the _Seedphrase_ and conversely.
		* 4.1.3. _Entropy Checksum_ bits are now displayed (see 6.1.2)
5. _Cryptocalc_ User Guide  
    Double click on `_run.bat`: this will open the _Cryptocalc_ desktop standalone application
    + 5.1. Features  
		* 5.1.1. Generate _Entropy_ from a random _Fortune Cookie_  
		Use [ Generate ] button to draw a random _Fortune Cookie_ 
		(among a compilation of 12803 fortune cookies) 
		which then will be used as the _Entropy_ (with the _Salt_) to generate a new _Seedphrase_ (between 12 and
		24 words) which is derived to get the _Private Key_ from which the _Wallet Address_ is obtained
		(NB: _Private Key_ and _Wallet Address_ are in the _Wallet_ Tab).
		There is also a conversion to the _Shortened Seedphrase_: as only the 4 first characters of each _mnemonic_ 
		are useful (cf. `BIP39` specification) then in the _Shortened Seedphrase_ each _mnemonic_ is represented 
		only by its 4 first characters (with the first character in Uppercase as a mean to separate _mnemonics_).   
		NB: As some _mnemonics_ are only 3 characters long, the abbreviation will of course only be whole _mnemonic_.  
		Here is an example below:  
        _Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goddess also genre east slam borrow amateur pupil merit clinic check zone \
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;produce bomb deliver submit demise organ cherry race purchase post finish common
        _Shortened Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ProdBombDeliSubmDemiOrgaCherRacePurcPostFiniComm 
        * 5.1.2. Several wallets in the same _BIP32 HD wallet tree_
        The _BIP32 HD wallet tree_ is determined by the _Entropy_ or _Seedphrase_. 
		These are 2 isomorphic representations of the _SRP_ (_Secret Recovery Passphrase_).		
		So you can generate new wallets (_Address_ + _Private Key_ or _WIF_)
		by Pasting a previous _Entropy_ or _Seedphrase_. 
		This will hide the _Entropy Source_ and _Salt_ fields which are meaningless in
        this situation. You can then change either the _Account_ or _Address Index_
        fields in the _Wallet_ tab page. This will show a new [ Refresh ] button
        to recompute the wallet once you gave finished editing these fields 
		(you can input a decimal value between 0 and 9999).		
		Pushing the [ Refresh ] button (or hitting either [ Return ] or [ Enter ] keys) 
		will recompute the wallet accordingly.
		* 5.1.3. Check the generated wallets against _Ian Coleman BIP39_: an item
        in the menu (Help/Resources/Ian Coleman BIP39) eases the checking by opening 
        [_Ian Coleman BIP39_](https://iancoleman.io/bip39/).		
		* 5.1.4. _Salted Entropy_  
		The _Salting_ is adding a unique information (e.g. a _UUID_) so that
        even if the _Entropy Source_ is the same, the _Entropy_ will be unique 		
		at each press of [ Generate ] button.
		* 5.1.5. Choose _Entropy Size_ 
		The _Entropy Size_ is between 128 to 256 bits (32 to 64 hexadecimal digits). 
		This is equivalent a _Seedphrase size_ between 12 to 24 words. 
		Changing _Entropy Size_ impacts the _Seedphrase size_ and conversely.
		* 5.1.6. Display of the _Checksum bits_ (see 5.1.9)
		* 5.1.7. Save _Wallet Informations_    
		With `File/Save` (or the _Save_ icon in the main toolbar), you can save 
		the _Wallet Informations_ in a timestamped subfolder (eg. `2024_03_07_21h-4m-4s-3_BTC`)
		under `_output` folder. This subfolder contains `wallet_info.txt` and a `wallet.json` 
		with the informations displayed in _Seed_ and _Wallet_ tab pages. 
		* 5.1.8. Select _Seedphrase Language_    
		You can select the _Language Wordlist_ (eg. _English_, _French_, _Deutsh_, etc...). 
		Please notice that is not meant to be used with _Wallet Manager_ applications 
		because most will only accept _English_ mnemonics.  
        This feature is indeed a mean to add a scramble step in order to make it 
		harder to steal your _Secret Recovery Passphrase_ because 
        it should be translated to _English_ to be used with a _Wallet Manager_.   
		NB: the translation between languages is native in _Cryptocalc_
		because the reference is indeed the _Word Indexes_ (see 5.1.9) not the words.
		* 5.1.9. Display of _Word Indexes_
        The _Word Indexes_ are between 0 and 2047, it is the index of each of the 
		_Seedphrase_ words in the _BIP39_ dictionary. You can choose to display 
		these indexes in _Decimal_ or _Binary_ (in _Binary_ you can check that the 
		computed _Checksum bits_ are added at the end of the converted _Entropy_ to
		determine the index of the last word).
		* 5.1.10. Display of the _BIP32 Derivation Path_
		The _BIP32 Derivation Path_ is displayed in the _Wallet_ tab page.
		You can edit the _Account_ or _Address Index_ fields to generate new wallets
		which belong to the same _BIP32_ hierarchy that is determined by the
		_Seedphrase_ (also called the _Secret Recovery Passphrase_).
        * 5.1.11. Support of _Localization_    
        In _Cryptocalc_, the _Localization_ (`l10n`) feature is the translation of GUI 
		Labels to adapt to the _locale_.
        A _locale_ name can be composed of a base language, country (territory) of use, 
		and optionnally a codeset (eg. `de_CH.UTF-8`).		
		The _locale_ is provided as part of your machine's environment. 
		_Cryptocalc_ only uses the 2 letter language part (eg. `en`). 
		Localization is enabled by a _JSon_ file in the `www/js/L10n` folder 
		(eg. `gui-msg-en.json`) . 
		Currently only `en` and `fr` are provided, but I would be nice if contributors 
		could provide other languages (I will of course cite the contributors name in the license) 
		as I preferred to avoid _naive_ use of a translation tool.  		
    + 5.2. Use cases
        * 5.2.1. Generate a new _Wallet_ and importit in a _Wallet manager_  
	    With a _Wallet Manager_ like [_Guarda_](https://https://guarda.com/) you can import
		a wallet generated by _Cryptocalc_:   
        * 5.2.1.a. Choose a coin (e.g. `BTC`,`ETH`,`DOGE`,`LTC,``SOL`) 
		* 5.2.1.b. Enter _WIF_ or _Private Key_ (No _Private Key_ for `ETH` wallets)    
        * 5.2.3. Store _Shortened Seedphrase_ in a _NFC SmartRing_  
        The entry level _SmartRings_ (price range: 7..15$) contains a `NTAG213 NFC` with 
		144 bytes useable capacity. This is enough to store the _Shortened Seedphrase_, 
		with a 24 words _Shortened Seedphrase_ 
	    the maximum required capacity is 96 bytes/characters (24*4, cf. 5.1.1) or even less (as some mnemonics have only three characters).   
        * 5.2.4. Store _Master password_  
        This is similar to the previous case, but the _Shortened Seedphrase_ 
		can be used as a _Master password_ for a _Password Manager_ or for tools like
		[_PGP Tool_](https://pgptool.github.io) which provide encryption/decryption
	    of your documents.
6. Appendix  
    + 6.1. _BIP39_: a _Dictionary_ of 2048 words    
	_BIP39_ (_BIP_ is the acronym of _Bitcoin Improvement Proposal_) is a specification regarding:
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
	+ 6.2. _BIP32_: Hierarchic Deterministic wallets
	_BIP32_ specifies how to generate wallets with are all derived from the same _Entropy_
	or _Seedphrase_ (also called the _Secret Recovery Passphrase_).
    A _Seedphrase_ of only 12 words is enough is most _Wallet Managers_ but 
	it is more secure to use a 24 words _Seedphrase_ if possible 
	(e.g. _Ledger_ hardware wallet manager).    
	    Example: meaning of each part for `m/44'/60'/0'/0/0`:    
	    * Start at the master key                                  (m)    
        * Follow the BIP44 standard                                (44′)    
        * Derive the key for _Ethereum_                            (60′)    
        * Access the first account                                 (0′)    
        * Choose the external chain, used for public addresses     (0)    
        * And finally, generate the first address in this sequence (0)    
        	
	* Reference    
	    + [Understanding Derivation Paths in Cryptocurrency: Easy-To-Follow Guide](https://getcoinplate.com/blog/derivation-paths-guide/#:~:text=A%20derivation%20path%20is%20simply,a%20particular%20branch%20(address))
		+ [Hierarchical key generation](https://alexey-shepelev.medium.com/hierarchical-key-generation-fc27560f786)
			
		
