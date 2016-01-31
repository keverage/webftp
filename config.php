<?php
	/**
	* WEBFTP Configuration
	*/
	
	$_CONFIG = array(
		// GENERAL
		'name' => 'webFTP',
		'hidden_folders' => array(),
		'hidden_files' => array(),
		
		// AUTO CONNECT
		'auto_connect' => false,
		'auto_connect_host' => '',
		'auto_connect_username' => '',
		'auto_connect_password' => '',
		'auto_connect_port' => 21,
		'auto_connect_default_directory' => '/',
		
		// OPTIONS DE FICHIERS
		'option_new_folder' => true,
		'option_new_file' => true,
		'option_archive' => false,
		'option_move' => true,
		'option_rename' => true,
		'option_delete' => true,
		
		// UPLOAD
		'upload_size_limit' => 64,
		'upload_allowed_extensions' => array(),
	);
?>