## Cryptocalc User Guide 0.0.12
![](https://github.com/ALADAS-org/Cryptocalc/blob/master/_doc/Screenshots/v0_0_9.png)
1. Purpose\
   _Cryptocalc_ is a standalone desktop application which provides straigthforward
   conversion between a _Private Key_ formats (eg. hex vs Base64) and the matching _Seedphrase_
   
2. Environment
    + 1.1. PC under Windows 10
    + 1.2. [NodeJS](https://nodejs.org/en/)
	+ 1.3. [Git](https://git-scm.com/)
	
3. Installation\
   You must import locally the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc):
    + 3.1. Open a _command line interpreter_:
		* Menu "Start" then input `cmd`
		* Change _current disk_ to where you plan to install (eg. if its `D` then type `D:`)
		* Change _current directory_ to where you to install (eg. `md tools` then `cd tools`)
	+ 3.2. Import _Cryptocalc_ from github
		* Open the [Cryptocalc repository](https://github.com/ALADAS-org/Cryptocalc) 
		* Use the [ <> Code v ] green button
		* Copy the displayed [.git URL](https://github.com/ALADAS-org/Cryptocalc.git)
		* In the _command line interpreter_, type `git clone ` followed by the `.git` URL\
		  e.g. `git clone https://github.com/ALADAS-org/Cryptocalc.git`
        * Type `cd Cryptocalc`	
        * Type `npm install`		
		
4. Use\
   Double click on `_run.bat`: this will open the _Cryptocalc_ desktop standalone application
    + 3.1. Features:
		* Generate a Random _Private Key_:\
		Use [ Generate ] button to generate a random 32 bytes hex value for the _Private Key_,
		this value is than coverted in Base64 and then transformed in its equivalent _Seedphrase_ 
        as well as the _Shortened Seedphrase_ (only The 4 first letters of each mnemonic with
        the first letter in Uppercase as a mean to separate the mnemonics) 
        * Input a hex value for the _Private Key_:\
		Modify or replace the hex value (nb: should have 64 hex digits) then use the [ Update ]
        button to propagate to Base64 value, Seedphrase and "shortened" Seedphrase.     		
