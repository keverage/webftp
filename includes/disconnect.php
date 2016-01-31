<?php
	/**
	* Permet la déconnexion du serveur FTP
	*/
	
	session_start();
	
	unset($_SESSION['ftp']['host'], $_SESSION['ftp']['username'], $_SESSION['ftp']['password'], $_SESSION['ftp']['port']);
	$_SESSION['ftp']['auto_disabled'] = true;
	
	echo json_encode(true);
?>