<?php
	/**
	* Permet d'uploader le fichier envoyé
	*/
	
	// Includes
	require_once '../config.php';
	require_once 'filefolder.class.php';
	require_once 'ftp.class.php';
	require_once 'upload.class.php';
	
	
	// Variables
	if( isset($_GET['path']) ){ $path = $_GET['path']; }else{ $path = null; }
	
	// Connexion
	$link = FTP::connection();
	
	// Fonction de rappel pour le remplacement des caractères spéciaux
	function replaceFilename($str){
		return stripslashes( FileFolder::replaceSpecificChars($str, true) );
	}
	
	// Enregistrement du fichier sur le FTP
	echo FileUploader::saveUploadedFileToFTP($link, $path, false, $_CONFIG['upload_allowed_extensions'], ($_CONFIG['upload_size_limit'] * 1024 * 1024), 'replaceFilename');
	
	// Déconnexion
	FTP::disconnection($link);
?>