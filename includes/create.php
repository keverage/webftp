<?php
	/**
	* Créer des éléments sur le FTP (dossier, fichier)
	*/
	
	// Includes
	require_once 'ftp.class.php';
	
	// Variables
	$out = array();
	if( isset($_POST['path']) ){ $path = htmlspecialchars($_POST['path']); }else{ $path = null; }
	if( isset($_POST['dir']) ){ $dir = htmlspecialchars($_POST['dir']); }else{ $dir = null; }
	if( isset($_POST['file']) ){ $file = htmlspecialchars($_POST['file']); }else{ $file = null; }
	
	// Dossier
	if($path && $dir){
		$out = FTP::createNewFolder($path, strtolower($dir) );
	}
	// Fichier
	if($path && $file){
		$out = FTP::createNewFile($path, $file);
	}
	
	// Retour
	echo json_encode($out);
?>