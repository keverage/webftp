<?php
	/**
	* Permet la connexion au serveur FTP
	*/
	
	// Includes
	session_start();
	require_once '../config.php';
	require_once './filefolder.class.php';
	require_once './ftp.class.php';
	
	
	// Variables
	$out = null;
	if( isset($_POST['path']) ){ $path = htmlspecialchars($_POST['path']); }else{ $path = null; }
	if( isset($_POST['hst']) ){ $host = htmlspecialchars($_POST['hst']); }else{ $host = null; }
	if( isset($_POST['usr']) ){ $username = htmlspecialchars($_POST['usr']); }else{ $username = null; }
	if( isset($_POST['psw']) ){ $password = htmlspecialchars($_POST['psw']); }else{ $password = null; }
	if( isset($_POST['prt']) ){ $port = intval($_POST['prt']); }else{ $port = 21; }
	
	
	// Connexion
	if( $host != null && $username != null && $password != null && $port != null ){
		$_SESSION['ftp']['host'] = $host;
		$_SESSION['ftp']['username'] = $username;
		$_SESSION['ftp']['password'] = $password;
		$_SESSION['ftp']['port'] = $port;
		if( isset($_SESSION['ftp']['host']) &&  isset($_SESSION['ftp']['username']) &&  isset($_SESSION['ftp']['password']) &&  isset($_SESSION['ftp']['port']) ){
			$out = true;
		}
		else{
			$out = 'session error';
		}
	}
	else{
		$out = 'no parameters';
	}
	
	
	// Suppression des fichiers temporaires
	$tmpFiles = FileFolder::readDirectory('../tmp/');
	if( count($tmpFiles['files']) > 0 ){
		foreach($tmpFiles['files'] as $fileName => $fileValues){
			if($fileValues['recent'] === 0){
				if( file_exists('../tmp/'.$fileName) ){
					unlink('../tmp/'.$fileName);
				}
			}
		}
	}
	
	
	// Retour
	echo json_encode($out);
?>