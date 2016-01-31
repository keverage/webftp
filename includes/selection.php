<?php
	/**
	* Traitement des élements sélectionnés
	*/
	
	// Includes
	require_once 'zip.class.php';
	require_once 'filefolder.class.php';
	require_once 'ftp.class.php';
	
	
	// Variables
	$out = array();
	if( isset($_POST['path']) ){ $path = htmlspecialchars($_POST['path']); }else{ $path = null; }
	if( isset($_POST['newpath']) ){ $newPath = htmlspecialchars($_POST['newpath']); }else{ $newPath = null; }
	if( isset($_POST['list']) ){ $list = $_POST['list']; }else{ $list = null; }
	if( isset($_POST['newlist']) ){ $newList = $_POST['newlist']; }else{ $newList = null; }
	if( isset($_POST['type']) ){ $type = htmlspecialchars($_POST['type']); }else{ $type = null; }
	
	
	// Archive
	if($type == 'archive'){
		//$out = FTP::archiveSelection($path, $list);
	}
	// Déplacer
	else if($type == 'move'){
		$out = FTP::moveSelection($path, $newpath, $list);
	}
	// Renommer
	else if($type == 'rename'){
		$out = FTP::renameSelection($path, $list, $newList);
	}
	// Supprimer
	else if($type == 'delete'){
		$out = FTP::deleteSelection($path, $list);
	}
	
	
	// Retour
	echo json_encode($out);
?>