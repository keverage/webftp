<?php
	/**
	* 
	*/
	
	// Includes
	require_once 'filefolder.class.php';
	require_once 'ftp.class.php';
	
	// Variables
	$out = null;
	if( isset($_REQUEST['path']) ){ $path = htmlspecialchars($_REQUEST['path']); }else{ $path = null; }
	if( isset($_REQUEST['content']) ){ $content = $_REQUEST['content']; }else{ $content = null; }
	if( isset($_REQUEST['act']) ){ $action = htmlspecialchars($_REQUEST['act']); }else{ $action = null; }
	
	// Enregistrement
	if($action == 'save'){
		
	}
	// Lecture
	else if(action == 'edit'){
		echo htmlspecialchars( FTP::getFileContent($path) );
	}
	// Téléchargement
	else if($action == 'down'){
		$pathinfo = pathinfo($path);
		FileFolder::sendDownloadHeaders($pathinfo['basename']);
		$tempFile = FTP::downloadFile($path, '../tmp/');
		readfile($tempFile);
		exit;
	}
?>