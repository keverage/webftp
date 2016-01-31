<?php
	/**
	* Permet de récupérer la liste des fichiers suivant le pointeur ftp
	*/
	
	// Includes
	session_start();
	require_once '../config.php';
	require_once 'filefolder.class.php';
	require_once 'ftp.class.php';
	
	
	// Variables
	$out = array();
	if( isset($_GET['path']) ){ $path = htmlspecialchars($_GET['path']); }else{ $path = null; }
	
	if($_CONFIG['auto_connect'] === true && $path == null && !$_SESSION['ftp']['auto_disabled']){
		$path = $_CONFIG['auto_connect_default_directory'];
	}
	if( substr($path, -2) == '..' ){
		$pathEx = explode('/', $path);
		$pathExCount = count($pathEx);
		$path = null;
		for($i = 0; $i < $pathExCount-2; $i++){
			if($i == $pathExCount-1){
				$path .= $pathEx[$i];
			}else{
				$path .= $pathEx[$i].'/';
			}
		}
	}
	
	// Lecture des fichiers
	$out = FTP::getFiles($path, $_CONFIG['hidden_folders'], $_CONFIG['hidden_files']);
	
	// Retour
	echo json_encode($out);
?>