## Cryptocalc 0.0.18
![](https://github.com/ALADAS-org/Cryptocalc/blob/master/_doc/Screenshots/v0_0_18.png)
1. Purpose\
   _Cryptocalc_ is a standalone desktop application which provides straigthforward
   conversion between a `Private Key` formats (eg. `Hex` vs `Base64`) and the matching _Seedphrase_.\
   NB: _Cryptocalc_ uses [ElectronJS](https://www.electronjs.org/) as well as many modern and popular
       [Desktop applications](https://en.wikipedia.org/wiki/List_of_software_using_Electron)
   
2. Environment
    + 2.1. PC under Windows 10
    + 2.2. [NodeJS](https://nodejs.org/en/)
	+ 2.3. [Git](https://git-scm.com/)
	
3. Installation \
   You must import locally the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc):
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
		
4. Use _Cryptocalc_ \
   Double click on `_run.bat`: this will open the _Cryptocalc_ desktop standalone application
    + 4.1. Features
		* 4.1.1. Generate a Random _Private Key_ \
		Use [ Generate ] button to generate a random 32 bytes hex value (64 hexadecimal digits) for the `Private Key`,
		this value is then converted in `Base64` and then translated in its equivalent _Seedphrase_ 
        as well as the _Shortened Seedphrase_. \
		Only the 4 first characters of each mnemonic are meaningful (cf. `BIP39` specification).    
		Thus in the _Shortened Seedphrase_ each mnemonic is represented by its 4 first letters
		with the first letter in Uppercase as a mean to separate mnemonics. \
		Here is an example below: \
        _Seedphrase_ \
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;goddess also genre east slam borrow amateur pupil merit clinic check zone \
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;habit jewel biology rebel october power adult wide blush similar omit pyramid
        _Shortened Seedphrase_ \
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GoddAlsoGenrEastSlamBorrAmatPupiMeriClinChecZoneHabiJeweBiolRebeOctoPoweAdulWideBlusSimiOmitPyra 			
        * 4.1.2. You can provide an arbitrary value in the `Input` field, then with the [ Update ] button 
		all other values will be recomputed (like in a waterfall). 
		* 4.1.3. Input a hex value for the `Private Key` \
		Modify or replace the hex value (NB: requires 64 hex digits) then use the [ Update ]
        button to propagate to `Private Key (B64)` value, _Seedphrase_ and _Shortened Seedphrase_.		
		* 4.1.4. If you modify the `Private Key (Hex)` value with a valid value 
		(NB: 64 hexadecimal digits, non hexadecimal digits are filtered) then it clears the `Input` field.
		* 4.1.5. You can select the _Language Wordlist_ (eg. _English_, _French_, _Deutsh_, etc...). Please notice
          that is not meant to be used with _Wallet Manager_ applications because most will only accept English mnemonics.  
          Indeed it's meant to add a scramble step in order to make it harder to steal your _Master Key_ because
          it must be translated to English to be used with with a _Wallet Manager_. 		  
   + 4.2. Use cases	
       * 4.2.1. Store _Shortened Seedphrase_ in a _NFC SmartRing_ \ 
       The entry level _SmartRings_ (price range: 7..15$) contains a `NTAG213 NFC` with 144 bytes useable capacity.
	   This is enough to store the _Shortened Seedphrase_, with a 24 words _Shortened Seedphrase_ 
	   the maximum required capacity is 96 bytes/characters (24*4, cf. 4.1.) or even less (as some mnemonics have only three characters).   
       * 4.2.2. Store _Master password_ \ 
       This is similar to the previous case, but the _Shortened Seedphrase_ (or `Private Key (B64)` value) can be used as a _Master password_  
       for a _Password Manager_ or for tools like [_PGP Tool_](https://pgptool.github.io) which provides encryption/decryption
	   of your documents. 