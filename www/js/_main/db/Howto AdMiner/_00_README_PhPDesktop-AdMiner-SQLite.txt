=============================================================================================================================
===================      How to intall 'PhpDesktop' and 'Adminer' to explore your 'SQLite' Database       ===================
=============================================================================================================================
Cryptocalc 0.5.0 - 2026 / 01 / 02 
Author: Echopraxium

A.1. Install 'PhpDesktop' 
- Download the '.zip' from https://github.com/cztomczak/phpdesktop/releases/tag/chrome-v130.1
- Extract the content of the .zip in 'C:\' then rename 'phpdesktop-chrome-130.1-php-8.3' folder to 'phpdesktop'
  Notice that there is also a "classic stack" like 'WAMP' (an acronym for 'Windows Apache MySQL Php') but it's oversized for our needs, that's why I choosed 'PhpDesktop' instead. 

A.2. Copy the required files and folder:
- Copy 'www\adminer.php' file and 'www\adminer-plugins' subfolder in 'C:\phpdesktop\www'.
Notice that 'adminer.php' is provided inside Cryptocalc but the official homepage of 'Adminer' is https://www.adminer.org/en

A.3. Find your "Windows username":
1. Open a 'CLI WIndow' (CLI means 'Command Line Interpreter") by pening the WIndows menu (at the bottom left of the screen)
2. Type 'cmd.exe' in the search field hit [Enter] key
2. Type 'whoami' in the "CLI WIndow", the result will be for example 'myComputer\michel', juste keep the end part (eg. 'michel')

A.4. Copy the required files:
Choose between A.5.1. or A.5.2.

	A.4.1. The 'Generic' login:
	It's easier to install (but you need to specify at each use that you want 'SQLite').
	- Copy 'www\index_generic.php' into 'C:\phpdesktop\www\' then rename it to 'index.php'
	
	A.4.2. The 'SQLite' login:
	It's easier to use (because you don't need to specify at each use that you want 'SQLite') but
	you need to edit the 'index_for_sqlite.php' file to your "Windows username" (see A.4. above)
	in the '$user_name' variable declaration ( eg. $user_name = 'michel'; )
	- Copy 'www\index_for_sqlite.php' into 'C:\phpdesktop\www\' then rename it to 'index.php'

B.1. How to start 'Adminer':
1. Open the 'C:\phpdesktop' folder
2. Double click on 'phpdesktop-chrome.exe'
3. Now you should have the 'AdMiner' login page:
* if you choosed 'A.4.1.' : 
  - In the 'System' field:   Select 'SQLite'
  - In the 'Username' field: enter 'admin'
  - In the 'Password' field: enter 'admin'
  - In the 'Database' field: enter the path where 'Cryptocalc.db' is located, the "Default Path" is:
  'C:\Users\YOUR_USERNAME\AppData\Local\Aladas-org\Cryptocalc\Cryptocalc.db'
  Note: YOUR_USERNAME is your "Windows username" (see A.3. above)
  
* if you choosed 'A.4.2.' : 
  - In the 'Database (sqlite)' field: enter the path where 'Cryptocalc.db' is located, the 'Default Path' is:
  'C:\Users\YOUR_USERNAME\AppData\Local\Aladas-org\Cryptocalc\Cryptocalc.db'
  Note: YOUR_USERNAME is your "Windows username" (see A.3. above) 
  - In the 'Password' field: enter 'admin'
  
Then click on the [Login] button, you should now see the 'AdMiner' Web GUI to explore your Wallet Database