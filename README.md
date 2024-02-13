## Cryptocalc User Guide 0.0.13
![](https://github.com/ALADAS-org/Cryptocalc/blob/master/_doc/Screenshots/v0_0_13.png)
1. Purpose\
   _Cryptocalc_ is a standalone desktop application which provides straigthforward
   conversion between a _Private Key_ formats (eg. hex vs Base64) and the matching _Seedphrase_.\
   NB: _Cryptocalc_ uses [ElectronJS](https://www.electronjs.org/) as well as many modern and popular
       [Desktop applications](https://en.wikipedia.org/wiki/List_of_software_using_Electron)
   
2. Environment
    + 2.1. PC under Windows 10
    + 2.2. [NodeJS](https://nodejs.org/en/)
	+ 2.3. [Git](https://git-scm.com/)
	
3. Installation\
   You must import locally the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc):
    + 3.1. Open a _command line interpreter_:
		* Use Windows Menu "Start" then input `cmd`
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
		
4. Use Cryptocalc\
   Double click on `_run.bat`: this will open the _Cryptocalc_ desktop standalone application
    + 4.1. Features:
		* Generate a Random _Private Key_:\
		Use [ Generate ] button to generate a random 32 bytes hex value for the _Private Key_,
		this value is than converted in _Base64_ and then transformed in its equivalent _Seedphrase_ 
        as well as the _Shortened Seedphrase_.\
		Only the 4 first characters of each mnemonic are meaningful (cf. BIP39 specification).    
		Thus in the _Shortened Seedphrase_ each mnemonic is represented by its 4 first letters
		with the first letter in Uppercase as a mean to separate mnemonics.\
		Here is an example below:\
        _Seedphrase_\
		    goddess also genre east slam borrow amateur pupil merit clinic check zone \
		    habit jewel biology rebel october power adult wide blush similar omit pyramid
        _Shortened Seedphrase_\
		    GoddAlsoGenrEastSlamBorrAmatPupiMeriClinChecZoneHabiJeweBiolRebeOctoPoweAdulWideBlusSimiOmitPyra 			
        * Input a hex value for the _Private Key_:\
		Modify or replace the hex value (nb: requires 64 hex digits) then use the [ Update ]
        button to propagate to Base64 value, _Seedphrase_ and _Shortened Seedphrase_.
   + 4.2. Use case:	
       * Store _Shortened Seedphrase_ in a NFC SmartRing:\ 
       The entry level _SmartRings_ (price range: 7..15 $) contains a _NTAG213_ NFC with 144 bytes useable capacity.
	   This is enough to store the _Shortened Seedphrase_, with a 24 words _Shortened Seedphrase_ 
	   the required capacity is 96 bytes/characters (24*4) because only the 4 first characters 
	   of each mnemonic are meaningful (cf. BIP39 specification)    
   	   
