<?php
function adminer_object() {
	include_once "./adminer-plugins/login-password-less.php";
	return new Adminer\Plugins(array(
		// TODO: inline the result of password_hash() so that the password is not visible in source codes
		new AdminerLoginPasswordLess(password_hash("admin", PASSWORD_DEFAULT))
	));
}

include "./adminer.php";
