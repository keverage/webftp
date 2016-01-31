<?php
	// INCLUDES
	session_start();
	require_once 'config.php';
	require_once 'includes/ftp.class.php';
	
	
	// Variables
	if($_CONFIG['auto_connect'] && !$_SESSION['ftp']['auto_disabled']){
		$connectAuto = 1;
		$connectHost = $_CONFIG['auto_connect_host'];
		$connectUsername = $_CONFIG['auto_connect_username'];
		$connectPassword = $_CONFIG['auto_connect_password'];
		$connectPort = $_CONFIG['auto_connect_port'];
	}
	else{
		$connectAuto = 0;
		$connectHost = null;
		$connectUsername = null;
		$connectPassword = null;
		$connectPort = null;
	}
	
	
	// Includes HTML
	require_once('./includes/header.inc.php');
?>
<!-- Erreurs -->
<div id="error" class="displaynone"></div>

<!-- Explorateur de fichiers -->
<div class="cadre explorer">
	<h1>Explorateur</h1>
	<div class="path">
		<a href="./" class="loader" id="loader" title="Rafraîchir"></a>
		<input type="text" name="path" id="path" value="/" />
	</div>
	<div id="files"></div>
	<div class="files-options">
		<!-- 1ère ligne -->
		<div class="files-options-buttons">
			<div class="fleft">
				<?php
					if($_CONFIG['option_new_folder']){
						echo '<input class="button bgdark" type="button" name="createNewFolder" id="createNewFolder" value="Nouveau dossier" />';
					}
					if($_CONFIG['option_new_file']){
						echo '<input class="button bgdark" type="button" name="createNewFile" id="createNewFile" value="Nouveau fichier" />';
					}
				?>
			</div>
			<div class="fright">
				<div class="selected-files-label locked">
					<span class="selected-files-title">Pour la sélection</span>
					<span class="selected-files-count">(0)</span>
					<div class="selected-files-option">
						<?php
							if($_CONFIG['option_delete']){
								echo '<input class="button bgdark" type="button" name="delete" id="delete" value="Supprimer" />';
							}
							if($_CONFIG['option_archive']){
								echo '<input class="button bgdark" type="button" name="archive" id="archive" value="Créer une archive" />';
							}
							if($_CONFIG['option_rename']){
								echo '<input class="button bgdark" type="button" name="rename" id="rename" value="Renommer" />';
							}
							if($_CONFIG['option_move']){
								echo '<input class="button bgdark" type="button" name="move" id="move" value="Déplacer" />';
							}
						?>
					</div>
				</div>
				<input type="hidden" name="filesSelected" id="filesSelected" value="" />
			</div>
			<div class="fclear"></div>
		</div>
		<!-- 2ème ligne -->
		<div>
			<div class="fleft">
				<div id="viewCreateNewFolder" class="displaynone">
					<input class="text" type="text" name="createNewFolderName" id="createNewFolderName" value="" />&nbsp;<input class="button bgdark" type="button" name="createNewFolderValid" id="createNewFolderValid" value="Valider" />
				</div>
				<div id="viewCreateNewFile" class="displaynone">
					<input class="text" type="text" name="createNewFileName" id="createNewFileName" value="" />&nbsp;<input class="button bgdark" type="button" name="createNewFileValid" id="createNewFileValid" value="Valider" />
				</div>
			</div>
			<div class="fright">
				<div id="viewMoveSelection" class="displaynone">
					<div class="path">
						<a href="./" class="loader" id="moveLoader" title="Rafraîchir"></a>
						<input type="text" name="movePath" id="movePath" value="/" />
					</div>
					<div id="moveFiles"></div>
					<input type="hidden" name="moveSelectedFile" id="moveSelectedFile" value="" />
				</div>
				<div id="viewRenameSelection" class="displaynone">
					<div id="renameFiles"></div>
				</div>
			</div>
		</div>
		<div class="fclear"></div>
	</div>
</div>

<!-- Editeur de fichier -->
<div class="cadre editor displaynone">
	<h1>Éditeur</h1>
	<form>
		<div>
			<textarea id="code" name="code"></textarea>
		</div>
	</form>
</div>

<!-- Envoi de fichiers -->
<div class="cadre upload">
	<h1>Upload</h1>
	<div class="uploadSpecification"><span class="label">Taille max :</span> <span class="value"><?php if($_CONFIG['upload_size_limit']){ echo $_CONFIG['upload_size_limit'].' Mo'; }else{ echo 'Illimité'; } ?></span> - <span class="label">Extensions autorisées :</span> <span class="value"><?php if($_CONFIG['upload_allowed_extensions']){ echo $_CONFIG['upload_allowed_extensions']; }else{ echo 'Toutes'; } ?></span></div>
	<div id="formUpload" class="loader"></div>
</div>
<?php include_once('./includes/footer.inc.php'); ?>