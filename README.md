## Cryptocalc 0.0.24
![](https://github.com/ALADAS-org/Cryptocalc/blob/master/_doc/Screenshots/v0_0_24.png)
1. Purpose\
   _Cryptocalc_ is a standalone desktop application which provides straigthforward
   conversions between a `Private Key` formats (eg. `Hex` vs `Base64`) and the matching _Seedphrase_. 
   Even though there is already a lot of similar tools online, the purpose is to use these features
   locally on your computer in order to reduce the risk of having your _Private Key_ informations stealed.   
   NB: _Cryptocalc_ uses [ElectronJS](https://www.electronjs.org/) as well as many modern and popular
       [Desktop applications](https://en.wikipedia.org/wiki/List_of_software_using_Electron)
   
2. Environment
    + 2.1. [NodeJS](https://nodejs.org/en/)
	+ 2.2. [Git](https://git-scm.com/)
	
3. Installation  
   Import locally the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc):
    + 3.1. Open a _command line interpreter_:
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
		
4. Use _Cryptocalc_  
   Double click on `_run.bat`: this will open the _Cryptocalc_ desktop standalone application
    + 4.1. Features
		* 4.1.1. Generate a new _Private Key_ from a random _Fortune Cookie_
		Use [ Random ] button to generate a random _Fortune Cookie_ which then will be used as the _Seed_ 
		(with or without the _Salt_, depending on the checkbox) to generate a new _Private Key_ (64 hexadecimal digits).
		This value is converted into its `Base64` value and then translated in its equivalent (isomorphic) _Seedphrase_ 
        as well as the _Shortened Seedphrase_. This is the _Seed to Seedphrase waterfall_.   
		Only the 4 first characters of each _mnemonic_ are useful (cf. `BIP39` specification).    
		Thus in the _Shortened Seedphrase_ each _mnemonic_ is represented only by its 4 first letters
		with the first letter in Uppercase as a mean to separate _mnemonics_.  
		Here is an example below:  
        _Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goddess also genre east slam borrow amateur pupil merit clinic check zone \
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;habit jewel biology rebel october power adult wide blush similar omit pyramid
        _Shortened Seedphrase_  
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GoddAlsoGenrEastSlamBorrAmatPupiMeriClinChecZoneHabiJeweBiolRebeOctoPoweAdulWideBlusSimiOmitPyra 			
        * 4.1.2. Provide a _Seed_  
		You can input an arbitrary value in the `Seed` field. Notice that it will clear the other fields, so you must use 
		the [ Update ] button (cf. 4.1.1. _Seed to Seedphrase waterfall_) to refresh them.		
		* 4.1.3. Import _Seed_ from a text file
		The text for the `Seed` field may also be provided with the `File/Import` menu or with the ellipsis button [...] at the right of the `Seed` field. 
		* 4.1.4. Set `Seed` field with a random _Fortune Cookie_
		The text for the _Seed_ can be a random _Fortune Cookie_ among a compilation of 12803 fortune cookies. 
		* 4.1.5. Salt with _UIID_  
		This allows to generate a different _Private Key_ at each [ Update ] even if the `Seed` value is the same, this is achieved by _Salting_
		the _Seed_ with a _UUID_. This behavior can be disabled with the checkbox located just before the _UUID_ value.
		* 4.1.6. Input the _Private Key_  
		You can input a hex value (NB: requires 64 hex digits) for the `Private Key (Hex)` field. Notice that it will clear the other fields
		, so you must use the [ Update ] button (cf. 4.1.1. _Seed to Seedphrase waterfall_) to refresh them.		  		
		* 4.1.7. Save _Private Key_ informations  
		With `File/Save` you can save the private key informations in a timestamped subfolder (eg. 2024_03_07_21h-4m-4s-3)
		under `_output` folder. This subfolder contains `private_key_info.txt` and a `pk_info.json` with the displayed informations 
		but there is also the word indices of the _mnemonics_ in the _Seedphrase_. 
		* 4.1.8. Input/Modify the _Seedphrase_  
		You can now modify the _Seedphrase_ but you must provide valid _mnemonics_ (matching the selected _language_) and 
		provide the expected number of _mnemonics_ (which is currently a constant equal to 24). 
		* 4.1.9. Select Language    
		You can select the _Language Wordlist_ (eg. _English_, _French_, _Deutsh_, etc...). Please notice
        that is not meant to be used with _Wallet Manager_ applications because most will only accept English mnemonics.  
        Indeed it's meant to add a scramble step in order to make it harder to steal your _Master Key_ because
        it must be translated to English to be used with with a _Wallet Manager_. 		  
   + 4.2. Use cases  
       * 4.2.1. Create a new _Crypto Wallet_: with a _Wallet Manager_ like [_Guarda_](https://https://guarda.com/) a _Seedphrase_
       is enough to import a new wallet, you just need to choose the coin (e.g. `BTC`, `ETH`, `DOGE`, `XRP`, `ADA`, `SOL`, etc...)   
       * 4.2.2. Store _Shortened Seedphrase_ in a _NFC SmartRing_  
       The entry level _SmartRings_ (price range: 7..15$) contains a `NTAG213 NFC` with 144 bytes useable capacity.
	   This is enough to store the _Shortened Seedphrase_, with a 24 words _Shortened Seedphrase_ 
	   the maximum required capacity is 96 bytes/characters (24*4, cf. 4.1.1) or even less (as some mnemonics have only three characters).   
       * 4.2.3. Store _Master password_   
       This is similar to the previous case, but the _Shortened Seedphrase_ (or `Private Key (B64)` value) can be used as a _Master password_  
       for a _Password Manager_ or for tools like [_PGP Tool_](https://pgptool.github.io) which provides encryption/decryption
	   of your documents. 