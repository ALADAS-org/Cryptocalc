<?php
function adminer_object()
{
	$aLoad = [];

	require "adminer-plugins/CSQLite.php";
	
	$user_name = 'michel';
	
	# overwrite defaults
	$aOpt = [
		# root path to search for files
		'vPath' => 'C:/Users/' . $user_name . '/AppData/Local/Aladas-org/Cryptocalc',
		
		# we search for *.sqlite / *.db files
		'vSearch' => "#(.+\.sqlite|.+\.db)$#",
		
		# write access!
		'vPwdFile' =>  __DIR__ . "/CSQLite.pwd"
		#'vPwdFile' => __DIR__ . "/CSqlite.pwd",
	];
	$aLoad[] = new CSqlite($aOpt);

	class AdminerCustomization extends Adminer\Plugins
	{
	}
	return new AdminerCustomization($aLoad);
}

include "./adminer.php";
