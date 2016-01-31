<?php

abstract class FTP {
	
	/**
	* Connexion au serveur FTP
	*
	* @require $_SESSION['ftp']['host'], $_SESSION['ftp']['username'], $_SESSION['ftp']['password'] et $_SESSION['ftp']['port']
	*
	* @return resource $link
	*/
	public static function connection(){
		// Variables
		session_start();
		// Connexion
		if( ! $link = @ftp_connect($_SESSION['ftp']['host'], $_SESSION['ftp']['port'], 10) ){
			return 'Impossible d\'ouvrir une connexion FTP.';
		}
		
		// Login
		if( ! @ftp_login($link, $_SESSION['ftp']['username'], $_SESSION['ftp']['password']) ){
			return 'Erreur d\'identification. Mauvais utilisateur ou mot de passe.';
		}
		else{
			if( ! @ftp_pasv($link, true) ){
				$_SESSION['ftp']['pasv'] = false;
			}else{
				$_SESSION['ftp']['pasv'] = true;
			}
			$_SESSION['ftp']['is_connected'] = true;
		}
		
		return $link;
	}
	
	
	/**
	* Déconnexion du serveur FTP
	*
	* @param resource $link -> Identifiant de la connexion FTP
	*/
	public static function disconnection($link){
		// Si la connexion à réussie
		if( is_resource($link) ){
			return ftp_close($link);
		}else{
			return false;
		}
	}
	
	
	/**
	* Récupère la liste des fichiers en fonction du pointeur
	*
	* @require class FileFolder
	*
	* @param  string $path                 -> Le chemin du répertoire à lister
	* @param  array  $hidden_folders       -> Les dossiers à masquer : array('dossier1', 'dossier2);
	* @param  array  $hidden_files         -> Les fichiers ou extension à masquer : array('Thumbs.db', 'index.php', 'exe');
	* @return array ['path'], ['folders'], ['files']
	*/
	public static function getFiles($path = null, $hidden_folders = array(), $hidden_files = array() ){
		// Si la class FileFolder est instanciée
		if( class_exists('FileFolder') ){
			// Initialisation
			$out = array(
				'path' => null,
				'folders' => null,
				'files' => null
			);
			$link = self::connection();
			
			// Si la connexion à réussie
			if( is_resource($link) ){
				// Si aucun chemin n'est spécifié, on récupère le dossier courant
				if($path == null){
					$path = @ftp_pwd($link);
				}
				$out['path'] = $path;
				
				// Liste des fichiers
				$files = ftp_rawlist($link, $path);
				if( count($files) > 0){
					foreach($files as $file){
						// Parse
						$data = preg_split("#[\s]+#", $file, 9);
						
						// Si c'est un dossier
						if( $data[0]{0} === 'd' ){
							// Si le dossier n'est pas parmi les dossiers masqués
							if( $data[8] != '.' && $data[8] != '..' && !in_array($data[8], $hidden_folders) ){
								$out['folders'][$data[8]]['items'] = $data[1];
								$out['folders'][$data[8]]['mtime'] = date('d/m/Y H:i:s', strtotime($data[5].' '.$data[6].' '.$data[7]) );
								$out['folders'][$data[8]]['chmod'] = $data[0];
								$out['folders'][$data[8]]['user'] = $data[2];
								$out['folders'][$data[8]]['group'] = $data[3];
							}
						}
						// Sinon c'est un fichier
						else{
							// Si c'est un fichier different des fichiers masqués
							if( !in_array($data[8], $hidden_files) ){
								// Si le fichier est différent d'une extension masquée
								if( !in_array( FileFolder::getFilenameExtension($data[8]), $hidden_files) ){
									$out['files'][$data[8]]['size'] = FileFolder::formatSize($data[4]);
									$out['files'][$data[8]]['ext'] = FileFolder::getFilenameExtension($data[8]);
									$out['files'][$data[8]]['type'] = FileFolder::getFileType($data[8]);
									$out['files'][$data[8]]['mtime'] = date('d/m/Y H:i:s', strtotime($data[5].' '.$data[6].' '.$data[7]) );
									$out['files'][$data[8]]['chmod'] = $data[0];
									$out['files'][$data[8]]['user'] = $data[2];
									$out['files'][$data[8]]['group'] = $data[3];
								}
							}
						}
					}
				}
				
				// Déconnexion
				self::disconnection($link);
				
				// Retour
				return $out;
			}
			// Sinon on affiche l'erreur
			else{
				return $link;
			}
		}
		else{
			return 'class FileFolder no exists';
		}
	}
	
	
	/**
	* Créer un dossier dans le répertoire courant
	*
	* @param string $name -> Le nom du dossier
	* @return true si réussi, sinon false
	*/
	public static function createNewFolder($path, $name){
		// Initialisation
		$out = false;
		$link = self::connection();
		
		// Si la connexion à réussie
		if( is_resource($link) ){
			@ftp_chdir($link, $path);
			
			// Création du dossier
			if( @ftp_mkdir($link, $name) != false ){
				$out = true;
			}
			else{
				$out = 'Echec de création du dossier.';
			}
			
			// Déconnexion
			self::disconnection($link);
		}
		else{
			$out = $link;
		}
		
		// Retour
		return $out;
	}
	
	
	/**
	* Créer un fichier dans le répertoire courant
	*
	* @param string $name -> Le nom du fichier
	* @return true si réussi, sinon false
	*/
	public static function createNewFile($path, $name){
		// Initialisation
		$out = null;
		
		// Si le fichier n'existe pas
		if( !self::fileExists($path, $name) ){
			$out = false;
			$link = self::connection();
			// Si la connexion à réussie
			if( is_resource($link) ){
				@ftp_chdir($link, $path);
				
				// Création d'un fichier temporaire
				ftp_site($link, "CHMOD 777 $path");
				$tempFile = 'newTempFile';
				@unlink($tempFile);
				
				// Ouverture et écriture du fichier vide
				$handle = fopen($tempFile, 'x');
				chmod($tempFile, 0777);
				fwrite($handle, '');
				fclose($handle);
				
				// Ouverture et chargement sur le serveur FTP
				$handle = fopen('newTempFile', 'r');
				if( ftp_fput($link, $name, $handle, FTP_ASCII) ){
					fclose($handle);
					unlink($tempFile);
					ftp_site($link, "CHMOD 755 $path");
					$out = true;
				}
				
				// Déconnexion
				self::disconnection($link);
			}
			else{
				$out = $link;
			}
		}
		else{
			$out = 'Le fichier existe déjà.';
		}
		
		// Retour
		return $out;
	}
	
	
	/**
	* Archive les fichiers sélectionnés
	*
	* @require class FileFolder & ZipFile
	*/
	public static function archiveSelection($path, $selection){
		// Si les class FileFolder et ZipFile sont instanciées
		if( class_exists('FileFolder') && class_exists('ZipFile') ){
			
			$files_struct = array();
			foreach($selection as $file){
				$files_struct[] = $path.$file;
			}
			
			return FileFolder::createZip($path.'new_archive.zip', $files_struct, false);
		}
		else{
			return 'class FileFolder or ZipFile no exists';
		}
	}
	
	
	/**
	* Déplacement des fichiers sélectionnés
	*
	* @param string $fromPath  -> Le chemin du dossier courant
	* @param string $toPath    -> Le chemin du dossier destinataire
	* @param array  $selection -> Le tableau des fichiers sélectionnés
	*/
	public static function moveSelection($fromPath, $toPath, $selection){
		// Connexion
		$out = null;
		$link = self::connection();
		// Si la connexion à réussie
		if( is_resource($link) ){
			
			// Déplacement de la sélection
			if( is_array($selection) ){
				foreach($selection as $file){
					// Si c'est un dossier
					if( substr($file, 0, 2) == 'd-' ){
						$out = ftp_rename($link, $fromPath.substr($file, 2), $toPath.substr($file, 2));
					}
					// Sinon, c'est un fichier
					else{
						$out = ftp_rename($link, $fromPath.$file, $toPath.$file);
					}
				}
			}
			
			// Déconnexion
			self::disconnection($link);
		}
		else{
			$out = $link;
		}
		return $out;
	}
	
	
	/**
	* Renomme les fichiers sélectionnés
	*
	* @param string $fromPath  -> Le chemin du dossier courant
	* @param string $toPath    -> Le chemin du dossier destinataire
	* @param array  $selection -> Le tableau des fichiers sélectionnés
	*/
	public static function renameSelection($path, $oldSelection, $newSelection){
		// Connexion
		$out = null;
		$link = self::connection();
		// Si la connexion à réussie
		if( is_resource($link) ){
			// Déplacement de la sélection
			if( is_array($oldSelection) ){
				$countOldSelection = count($oldSelection);
				for($i = 0; $i < $countOldSelection; $i++){
					// Si c'est un dossier
					if( substr($oldSelection[$i], 0, 2) == 'd-' ){
						$out = ftp_rename($link, $path.substr($oldSelection[$i], 2), $path.$newSelection[$i]);
					}
					// Sinon, c'est un fichier
					else{
						$out = ftp_rename($link, $path.$oldSelection[$i], $path.$newSelection[$i]);
					}
				}
			}
			
			// Déconnexion
			self::disconnection($link);
		}
		else{
			$out = $link;
		}
		return $out;
	}
	
	
	/**
	* Suppression des fichiers sélectionnés
	*
	* @param string $path      -> Le chemin du dossier courant
	* @param array  $selection -> Le tableau des fichiers sélectionnés
	*/
	public static function deleteSelection($path, $selection){
		// Connexion
		$out = null;
		$link = self::connection();
		// Si la connexion à réussie
		if( is_resource($link) ){
			// Suppression de la sélection
			if( is_array($selection) ){
				foreach($selection as $file){
					// Si c'est un dossier
					if( substr($file, 0, 2) == 'd-' ){
						$out = self::_deleteFolderRecursive($link, $path.substr($file, 2));
					}
					// Sinon, c'est un fichier
					else{
						$out = ftp_delete($link, $path.$file);
					}
				}
			}
			
			// Déconnexion
			self::disconnection($link);
		}
		else{
			$out = $link;
		}
		return $out;
	}
	
	
	/**
	* Vérifie si le fichier existe
	*
	* @param string $path     -> Le chemin du dossier
	* @param string $filename -> Le nom du fichier à vérifier
	* @return true si le fichier existe, sinon false
	*/
	public static function fileExists($path, $filename){
		// Connexion
		$link = self::connection();
		// Si la connexion à réussie
		if( is_resource($link) ){
			// Liste des fichiers et test
			$files = ftp_nlist($link, $path);
			if( count($files) > 0){
				foreach($files as $file){
					if($path.$filename == $file){
						return true;
					}
				}
			}
			
			// Retour
			self::disconnection($link);
			return false;
		}
		else{
			return $link;
		}
	}
	
	
	/**
	* Récupère le contenu du fichier
	*
	* @param $path -> Le chemin du fichier
	*/
	public static function getFileContent($path){
		// Connexion
		$link = self::connection();
		// Si la connexion à réussie
		if( is_resource($link) ){
			$out = null;
			$tempHandle = fopen('php://temp', 'r+');
			
			if( @ftp_fget($link, $tempHandle, $path, FTP_ASCII) ){
				rewind($tempHandle);
				$out = stream_get_contents($tempHandle);
			}
			else{
				$out = 'Impossible de lire le fichier';
			}
			
			// Retour
			return $out;
			self::disconnection($link);
		}
		else{
			return $link;
		}
	}
	
	
	/**
	* Télécharge un fichier sur le FTP et le renvoi en fichier temporaire
	*
	* @param $path -> Le chemin du fichier
	* @return fichier temporaire
	*/
	public static function downloadFile($path, $tmpPath){
		// Connexion
		$link = self::connection();
		// Si la connexion à réussie
		if( is_resource($link) ){
			$tempFile = tempnam($tmpPath, rand() );
			ftp_get($link, $tempFile, $path, FTP_BINARY);	
			self::disconnection($link);
			return $tempFile;
		}
		else{
			return $link;
		}
	}
	
	
	/**
	* Converti un chmod en nombre
	*
	* @param string $chmod -> Le chmod à convertir
	* @return int
	*/
	private static function _chmodToNumber($chmod){
		$conversion = array(
			'-' => '0',
			'r' => '4',
			'w' => '2',
			'x' => '1'
		);
		$chmod = substr(strtr($chmod, $conversion), 1);
		$array = str_split($chmod, 3);
		return array_sum( str_split($array[0]) ) . array_sum( str_split($array[1]) ) . array_sum( str_split($array[2]) );
	}
	
	
	/**
	* Supprime un dossier et tout son contenu
	*
	* @param ressource $link       -> La connexion FTP
	* @param string    $folderName -> Le nom du dossier
	* @return array, la liste des dossiers/fichiers qui n'ont pas pu être supprimé
	*/
	private static function _deleteFolderRecursive($link, $folderName){
		// Initialisation
		$out = array();
		ftp_chdir($link, $folderName);
		$rawlist = ftp_rawlist($link, '.');
		
		// Si on a bien une liste de fichiers
		if( is_array($rawlist) ){
			foreach($rawlist as $file){
				$data = preg_split("#[\s]+#", $file);
				$filename = str_replace('//', '', $data[8]);
				
				if($data[0]{0} == 'd' && $filename != '.' && $filename != '..'){
					$out[] = self::_deleteFolderRecursive($link, $filename);
					
					
				}
				else{
					// Suppression du fichier
					if( !ftp_delete($link, $filename) ){
						$out[] = $filename;
					}
				}
			}
		}
		// On retourne au dossier parent
		@ftp_cdup($link);
		
		// Suppression du dossier courant
		if( !ftp_rmdir($link, $folderName) ){
		 	$out[] = $folderName;
		}
		
		if( count($out) > 0){
			return $out;
		}else{
			return true;
		}
	}
}
?>