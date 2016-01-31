$(document).ready(function(){
	// <![CDATA[
	
	/** Fonctions
	****************************************************************************/
	
	/**
	* Connexion au FTP
	*/
	function connection(){
		// Variables
		var auto_connect = $("input#auto_connect").val().split(",");
		var host = $("input#host").val();
		var username = $("input#username").val();
		var password = $("input#password").val();
		var port = $("input#port").val();
		
		if(host != "" && username != "" && password != ""){
			// Si le port n'a pas été spécifié
			if(port == ""){
				port = 21;
				$("input#port").val(port);
			}
			
			// Requête Ajax
			$.post(
				"includes/connect.php",
				{
					"hst": host,
					"usr": username,
					"psw": password,
					"prt": port
				},
				function(connection){
					// Si la connexion à réussie, on récupère la liste des fichiers
					if(connection == "true"){
						getFiles();
					}
					else{
						error(connection);
					}
				}
			);
		}
		else{
			if(auto_connect[0] == 1){
				$("input#host").val(auto_connect[1]);
				$("input#username").val(auto_connect[2]);
				$("input#password").val(auto_connect[3]);
				connection();
			}
		}
	}
	
	
	/**
	* Récupère et affiche les fichiers du FTP en fonction du pointeur
	*
	* @param string path -> Le chemin du pointeur
	*/
	function getFiles(path){
		// Initialisation
		if(!path){
			var path = "";
		}
		if( !$("a#loader").hasClass("active") ){
			$("a#loader").addClass("active");
		}
		
		// Requête Ajax
		$.getJSON("includes/get_files.php", {path: path}, function(data){
			var out = '<table>';
				out += '<tr>';
					out += '<th class="thleft">nom de fichier<\/th>';
					out += '<th>taille de fichier<\/th>';
					out += '<th>type de fichier<\/th>';
					out += '<th>dernière modification<\/th>';
					out += '<th>droits d\'accès<\/th>';
					out += '<th class="thright selectFilesColSize">gestion<\/th>';
				out += '</tr>';
				
				out += '<tr class="table-separation"><td colspan="6"><\/td><\/tr>';
				out += '<tr class="cdup">';
					out += '<td class="cdupCol"><a href="./"><span class="icon"><img src="images/folder.png" alt="" \/></span><span class="name">..</span><\/a><\/td>';
					out += '<td colspan="5" class="selectAllFiles"><input type="checkbox" name="selectAllFiles" id="selectAllFiles" value="" \/><\/td>';
				out += '<\/tr>';
				
				// Liste des dossiers
				if(data.folders){
					var i = 0;
					$.each(data.folders, function(name, folder){
						out += '<tr class="folder">';
							out += '<td><a href="./">'
								out += '<span class="icon"><img src="images/folder.png" alt="" /></span>'
								out += '<span class="name">'+name+'</span>'
							out += '<\/a><\/td>';
							out += '<td><\/td>';
							out += '<td>Dossier de fichiers<\/td>';
							out += '<td>'+folder.mtime+'<\/td>';
							out += '<td>'+folder.chmod+'<\/td>';
							out += '<td align="center"><input type="checkbox" name="files[]" id="folderId'+i+'" value="" \/><\/td>';
						out += '</tr>';
						i++;
					});
				}
				
				// Liste des fichiers
				if(data.files){
					var i = 0;
					$.each(data.files, function(name, file){
						out += '<tr class="file '+file.type+'">';
							out += '<td><a href="./">'
								out += '<span class="icon"><img src="images/new_page.png" alt="" /></span>'
								out += '<span class="name">'+name+'</span>'
							out += '<\/a><\/td>';
							out += '<td align="right">'+file.size+'<\/td>';
							out += '<td>Fichier '+file.ext.toUpperCase()+'<\/td>';
							out += '<td>'+file.mtime+'<\/td>';
							out += '<td>'+file.chmod+'<\/td>';
							out += '<td align="center"><input type="checkbox" name="files[]" id="fileId'+i+'" value="" \/><\/td>';
						out += '<\/tr>';
						i++;
					});
				}
			out += '<\/table>';
			
			// Rendu
			setPath(data.path);
			uploader.setParams({path: getPath()});
			$("a#loader").removeClass("active");
			$("#files").html(out);
		});
	}
	
	
	/**
	* Récupère et affiche l'arboréscense du FTP en fonction du pointeur
	*
	* @param string path -> Le chemin du pointeur
	*/
	function getArbo(path){
		// Initialisation
		if(!path){
			var path = "";
		}
		if( !$("#moveLoader").hasClass("active") ){
			$("#moveLoader").addClass("active");
		}
		
		// Requête Ajax
		$.getJSON("includes/get_files.php", {path: path}, function(data){
			var out = '<table>';
				out += '<tr>';
					out += '<th class="thleft">nom de fichier<\/th>';
					out += '<th>dernière modification<\/th>';
					out += '<th class="thright">déplacer dans<\/th>';
				out += '</tr>';
				
				out += '<tr class="table-separation"><td colspan="6"><\/td><\/tr>';
				out += '<tr class="cdup"><td><a href="./"><span class="icon"><img src="images/folder.png" alt="" \/></span><span class="name">..</span><\/a><\/td><\/tr>';
				
				// Liste des dossiers
				if(data.folders){
					var i = 0;
					$.each(data.folders, function(name, folder){
						out += '<tr class="folder">';
							out += '<td><a href="./">'
								out += '<span class="icon"><img src="images/folder.png" alt="" /></span>'
								out += '<span class="name">'+name+'</span>'
							out += '<\/a><\/td>';
							out += '<td align="center">'+folder.mtime+'<\/td>';
							out += '<td align="center"><input type="radio" name="moveFiles[]" id="folderId'+i+'" value="" /><\/td>';
						out += '</tr>';
						i++;
					});
				}
			out += '<\/table>';
			
			// Rendu
			var path = data.path;
			if(path[path.length-1] != "/"){
				path = path+"/";
			}
			if(path.substring(path.length-3) == "../"){
				path = path.substring(0, path.length-3);
			}
			$("#movePath").val(path);
			$("#moveLoader").removeClass("active");
			$("#moveFiles").html(out);
		});
	}
	
	
	/**
	* Affiche la sélection des fichiers à renommer
	*/
	function getRenameSelection(){
		// Initialisation
		var list = getSelectedFiles();
		if( !$("#renameFiles").hasClass("loader") ){
			$("#renameFiles").addClass("loader");
		}
		
		var out = '<table>';
			out += '<tr>';
				out += '<th class="thleft">Nom du fichier avant<\/th>';
				out += '<th><\/th>';
				out += '<th class="thright">Nom du fichier après<\/th>';
			out += '</tr>';
			out += '<tr class="table-separation"><td colspan="2"><\/td><\/tr>';
			
			// Liste des fichiers
			if(list){
				var i = 0;
				$.each(list, function(i, name){
					out += '<tr>';
						if(name.substring(0, 2) == "d-"){
							out += '<td align="center">'+name.substring(2)+'<\/td>';
						}else{
							out += '<td align="center">'+name+'<\/td>';
						}
						out += '<td align="center"><b>&raquo;<\/b><\/td>';
						if(name.substring(0, 2) == "d-"){
							out += '<td align="center"><input class="text" type="text" name="renameFiles[]" id="renameFiles'+i+'" value="'+name.substring(2)+'" \/><\/td>';
						}else{
							out += '<td align="center"><input class="text" type="text" name="renameFiles[]" id="renameFiles'+i+'" value="'+name+'" \/><\/td>';
						}
					out += '</tr>';
					i++;
				});
			}
		out += '<\/table>';
		
		// Rendu
		$("#renameFiles").removeClass("loader");
		$("#renameFiles").html(out);
	}
	
	
	/**
	* Met à jour l'affichage du path
	*
	* @param string path -> Le chemin à mettre à jour
	*/
	function setPath(path){
		if(path[path.length-1] != "/"){
			path = path+"/";
		}
		if(path.substring(path.length-3) == "../"){
			path = path.substring(0, path.length-3);
		}
		$("input#path").val(path);
	}
	/**
	* Récupère le path courant
	*/
	function getPath(){
		return $("input#path").val();
	}
	
	
	/**
	* Créer un nouveau dossier
	*/
	function createNewFolder(name){
		var path = getPath();
		
		// Requête Ajax
		$.post("includes/create.php", {path: path, dir: name}, function(response){
			if(response == "true"){
				// Actualisation des fichiers
				getFiles(path);
				$("#viewCreateNewFolder").slideUp("fast");
				$("#viewCreateNewFolder").addClass("displaynone");
				$("input#createNewFolder").removeClass("active");
				$("input#createNewFolderName").val("");
			}
			else{
				error("Le dossier existe déjà.");
			}
		});
	}
	
	
	/**
	* Créer un nouveau fichier
	*/
	function createNewFile(name){
		var path = getPath();
		
		// Requête Ajax
		$.post("includes/create.php", {path: path, file: name}, function(response){
			if(response == "true"){
				// Actualisation des fichiers
				getFiles(path);
				$("#viewCreateNewFile").slideUp("fast");
				$("#viewCreateNewFile").addClass("displaynone");
				$("input#createNewFile").removeClass("active");
				$("input#createNewFileName").val("");
			}
			else{
				error("Le fichier existe déjà.");
			}
		});
	}
	
	
	/**
	* Ajoute un fichier sélectionné
	*
	* @param string filename -> Le nom du fichier
	*/
	function addSelectedFile(filename){
		var list = getSelectedFiles();
		// Ajout dans la liste
		list.push(filename);
		
		// Mise à jour des fichiers sélectionnés
		setSelectedFiles(list);
	}
	
	
	/**
	* Enlève un fichier sélectionné
	*
	* @param bool   all      -> Supprimer tout
	* @param string filename -> Le nom du fichier
	*/
	function removeSelectedFile(all, filename){
		var list = getSelectedFiles();
		if(list){
			// Suppression du fichier voulu
			$.each(list, function(i, name){
				if(all == true || name == filename){
					delete list[i];
				}
			});
			
			// Création de la nouvelle liste
			var newList = [];
			$.each(list, function(i, name){
				if(name != undefined){
					newList.push(name);
				}
			});
			
			// Mise à jour des fichiers sélectionnés
			setSelectedFiles(newList);
		}
	}
	
	
	/**
	* Met à jour la liste des fichiers sélectionnés
	*
	* @param array list -> La liste des fichiers
	*/
	function setSelectedFiles(list){
		if(list){
			// Création de la chaine de caractères
			var selectedList = "";
			$.each(list, function(i, name){
				if(i == list.length-1){
					selectedList += name;
				}else{
					selectedList += name+",";
				}
			});
			
			// Ajout dans l'input
			$("input#filesSelected").val(selectedList);
		}
	}
	
	
	/**
	* Récupère la liste des fichiers sélectionnés
	*
	* @return array
	*/
	function getSelectedFiles(){
		var list = $("input#filesSelected").val();
		
		// Séparation de la chaine de caractères en tableau
		if(list){
			return list.split(",");
		}else{
			return [];
		}
	}
	
	
	/**
	* Archive les fichiers sélectionnés
	*/
	function archiveSelection(){
		var path = getPath();
		var list = getSelectedFiles();
		
		$.post("includes/selection.php", {path: path, list: list, type: "archive"}, function(data){
			
		});
	}
	
	
	/**
	* Déplacement des fichiers sélectionnés
	*/
	function moveSelection(){
		// Récupèration des données
		var path = getPath();
		var newpath = $("#movePath").val() + $("#moveSelectedFile").val() + "/";
		var list = getSelectedFiles();
		
		// Requête Ajax
		$.post("includes/selection.php", {path: path, newpath: newpath, list: list, type: "move"}, function(response){
			if(response == "true"){
				// Réinitialisation des fichiers sélectionnés
				resetSelection();
				
				// Mise à jour des fichiers
				getFiles(path);
				
				// Fermeture de la popup
				$("#viewMoveSelection").dialog("close");
			}
			else{
				error("Impossible de déplacer la sélection.");
			}
		});
	}
	
	
	/**
	* Renomme les fichiers sélectionnés
	*/
	function renameSelection(){
		// Récupèration des données
		var path = getPath();
		var list = getSelectedFiles();
		var newlist = [];
		$.each( $("#renameFiles input"), function(i, filename){
			newlist.push( filename.value );
		});
		
		// Requête Ajax
		$.post("includes/selection.php", {path: path, list: list, newlist: newlist, type: "rename"}, function(response){
			if(response == "true"){
				// Réinitialisation des fichiers sélectionnés
				resetSelection();
				
				// Mise à jour des fichiers
				getFiles(path);
				
				// Fermeture de la popup
				$("#viewRenameSelection").dialog("close");
			}
			else{
				error("Impossible de renommer la sélection.");
			}
		});
	}
	
	
	/**
	* Suppression des fichiers sélectionnés
	*/
	function deleteSelection(){
		// Récupèration des données
		var path = getPath();
		var list = getSelectedFiles();
		
		// Confirmation
		if(list[0] != undefined){
			if( confirm("Voulez-vous vraiment supprimer cette sélection ?") ){
				// Requête Ajax
				$.post("includes/selection.php", {path: path, list: list, type: "delete"}, function(response){
					if(response == "true"){
						// Réinitialisation des fichiers sélectionnés
						resetSelection();
						
						// Mise à jour des fichiers
						getFiles(path);
					}
					else{
						error("Impossible de supprimer la sélection.");
					}
				});
			}
		}
	}
	
	
	/**
	* Réinitialise toutes les listes de selection
	*/
	function resetSelection(){
		// Liste des fichiers sélectionnés
		$("input#moveSelectedFile").val("");
		removeSelectedFile(true);
		$(".selected-files-label").addClass("locked");
		$(".selected-files-count").text("(0)");
	}
	
	
	function checkBoxAll(){
		
	}
	
	function unCheckBoxAll(){
		
	}
	
	
	/**
	* Met à jour le nombre de fichiers sélectionnés
	*/
	function updateNbSelectedFiles(){
		// On récupère le nombre d'élements sélectionnés;
		var nb = $("#files tr.selected").length;
		
		// Mise à jour
		if(nb > 0){
			$(".selected-files-label").removeClass("locked");
		}else{
			$(".selected-files-label").addClass("locked");
		}
		$(".selected-files-count").text("("+nb+")");
	}
	
	
	/**
	* Initialisation de l'uploader Ajax
	*/
	function initializeUploader(){
		uploader = new qq.FileUploader({
			element: $("#formUpload")[0],
			action: 'includes/upload.php',
			maxConnections: 2,
			params: {
				path: getPath()
			},
			template:
			'<div class="qq-uploader">' + 
				'<div class="qq-upload-drop-area"><span>'+ t('Drop files here to upload') +'</span></div>' +
				'<div class="qq-upload-button">'+ t('Upload a file') +'</div>' +
				'<ul class="qq-upload-list"></ul>' + 
			'</div>',
			fileTemplate:
			'<li>' +
				'<span class="qq-upload-file"></span>' +
				'<span class="qq-upload-spinner"><span class="qq-upload-bar"></span></span>' +
				'<span class="qq-upload-size"></span>' +
				'<a class="qq-upload-cancel" href="./">'+ t('Cancel') +'</a>' +
				'<span class="qq-upload-failed-text">'+ t('Failed') +'</span>' +
			'</li>',
			onProgress: function(id, fileName, loaded, total){
				$.each( $(".qq-upload-list li"), function(key, value){
					// Récupèration des données
					var text = $(this).children(".qq-upload-size").text();
					var newtext = t(text);
					var lastpos = text.indexOf("%");
					var pourcent = text.substring(0, lastpos);
					
					// Modification des données
					$(this).children(".qq-upload-size").text(newtext);
					$(this).children(".qq-upload-spinner").children(".qq-upload-bar").css("width", pourcent+"px");
				});
			},
			onComplete: function(id, fileName, responseJSON){
				if(responseJSON.success == true){
					getFiles( getPath() );
				}
			},
			messages: {
				typeError: t("{file} has invalid extension. Only {extensions} are allowed."),
				sizeError: t("{file} is too large, maximum file size is {sizeLimit}."),
				minSizeError: t("{file} is too small, minimum file size is {minSizeLimit}."),
				emptyError: t("{file} is empty, please select files again without it."),
				onLeave: t("The files are being uploaded, if you leave now the upload will be cancelled.")
			},
			showMessage: function(message){
				error(message);
			}
		});
	}
	
	
	/**
	* Affichage du texte traduit
	*/
	function t(text){
		var lang = 'fr';
		
		// Remplacement
		if(lang == 'fr'){
			text = text.replace('from', 'de');
			text = text.replace('kB', 'Ko');
			text = text.replace('MB', 'Mo');
			text = text.replace('GB', 'Go');
			text = text.replace('TB', 'To');
			text = text.replace('Cancel', 'Annuler');
			text = text.replace('Drop files here to upload', 'Glissez-déposez les fichiers ici pour envoyer');
			text = text.replace('Upload a file', 'Parcourir...');
			text = text.replace('Failed', 'Echoué');
			text = text.replace('{file} has invalid extension. Only {extensions} are allowed.', 'Le fichier {file} a une extension invalide. Les extensions autorisées sont : {extensions}.');
			text = text.replace('{file} is too large, maximum file size is {sizeLimit}.', 'Le fichier {file} est trop grand, la taille maximum est de {sizeLimit}.');
			text = text.replace('{file} is too small, minimum file size is {minSizeLimit}.', 'Le fichier {file} est trop petit, la taille minimal est de {minSizeLimit}.');
			text = text.replace('{file} is empty, please select files again without it.', 'Le fichier {file} est vide.');
			text = text.replace('The files are being uploaded, if you leave now the upload will be cancelled.', 'Les fichiers sont en cours d\'envoi. Si vous quitté la page, les envois seront annulés.');
		}
		return text;
	}
	
	
	/**
	* Affichage du texte d'erreur
	*/
	function error(text){
		$("#error").fadeIn("fast");
		if( $("#error").hasClass("displaynone") ){
			$("#error").removeClass("displaynone");
		}
		$("#error").text(text);
		setTimeout(function(){
			$("#error").addClass("displaynone");
			$("#error").fadeOut("fast");
		}, 4000);
	}
	
	
	/**
	* Code mirror
	*/
	function displayCodeMirror(mode){
		var editor = CodeMirror.fromTextArea( document.getElementById("code"), {
			lineNumbers: true,
			matchBrackets: true,
			mode: mode,
			indentUnit: 4,
			indentWithTabs: true,
			enterMode: "keep",
			tabMode: "indent",
			onCursorActivity: function(){
				editor.setLineClass(hlLine, null);
				hlLine = editor.setLineClass(editor.getCursor().line, "activeline");
			}
		});
	}
	
	
	/** Évènements
	****************************************************************************/
	
	/**
	* Global
	*/
	var uploader;
	
	
	/**
	* Connexion
	*/
	connection();
	$("input#host, input#username, input#password, input#port").keyup(function(key){
		if(key.keyCode == 13){
			connection();
		}
	});
	$("input#connect").click(function(){
		connection();
	});
	
	/**
	* Déconnexion
	*/
	$("#disable-connect-auto a").click(function(){
		// Requête Ajax
		$.post("includes/disconnect.php", function(response){
			if(response == "true"){
				$(".connexion-input-text").removeClass("displaynone");
				$(".connexion-input-button").removeClass("displaynone");
				$("#path").val("/");
				$("input#host").val("");
				$("input#username").val("");
				$("input#password").val("");
				$("input#port").val("");
				$("#disable-connect-auto").hide();
				$("#files").empty();
				resetSelection();
			}
		});
		return false;
	});
	
	
	/**
	* Lecture des fichiers
	*/
	// Clic chargement
	$("a#loader").click(function(){
		resetSelection();
		getFiles( getPath() );
		return false;
	});
	// Met à jour le path si on appuie sur entrée dans le chemin
	$("input#path").keyup(function(key){
		if(key.keyCode == 13){
			// Chemin
			var path = getPath();
			
			// Récupèration des fichiers
			getFiles(path);
		}
	});
	// Clic sur la checkbox "tout cocher"/"tout décocher"
	$("#selectAllFiles").live("click", function(){
		$.each( $("#files tr.folder, #files tr.file"), function(i, n){
			// Récupèration du nom
			var filename = $(this).children("td:first").children("a").children("span.name").text();
			
			// Si c'est un dossier, on ajoute d- devant
			if( $(this).hasClass("folder") ){
				var filename = 'd-' + filename;
			}
			
			// Si le fichier est déjà sélectionné, on l'enlève
			if( !$("#selectAllFiles").attr("checked") ){
				removeSelectedFile(false, filename);
				$(this).removeClass("selected");
				$(this).children("td:last").children("input").attr("checked", false);
			}
			// Sinon, on l'ajoute
			else{
				addSelectedFile(filename);
				$(this).addClass("selected");
				$(this).children("td:last").children("input").attr("checked", true);
			}
			
			// Mise à jour du nb de fichiers sélectionnés
			updateNbSelectedFiles();
		});
	});
	// Clic sur les fichiers
	$("#files a").live("click", function(){
		var path = getPath();
		var filename = $(this).children(".name").text();
		var parent_tr = $(this).parent("td").parent("tr");
		
		// Si le fichier st un dossier, on navigue dedans
		if( parent_tr.hasClass("folder") || parent_tr.hasClass("cdup") ){
			getFiles(path+filename);
		}
		else{
			// Récupèration du type de fichier
			var type = $(this).parent("td").parent("tr").attr("class").split(" ")[1];
			
			// Si le type est texte ou web, on affiche l'éditeur
			if(type == 'text' || type == 'web'){
				/*
				// Requête Ajax
				$.post("includes/file.php", {path: path+filename, act: "edit"}, function(data){
					// Effet
					$(".cadre.explorer").fadeOut("fast");
					$(".cadre.editor").fadeIn("fast");
					
					// Ajout du contenu du fichier
					$("textarea#code").html(data);
					
					// Récupèration de l'extension
					var filename_ex = filename.split(".");
					var extension = filename_ex[filename_ex.length-1];
					
					// Chargement de l'éditeur suivant l'extension du fichier
					if(extension == "php"){
						displayCodeMirror("application/x-httpd-php");
					}
					else if(extension == "html" || extension == "htm" || extension == "xhtml"){
						displayCodeMirror("text/html");
					}
					else if(extension == "js"){
						displayCodeMirror("text/javascript");
					}
					else if(extension == "css"){
						displayCodeMirror("text/css");
					}
					else if(extension == "xml"){
						displayCodeMirror("application/xml");
					}
					else{
						displayCodeMirror("text/html");
					}
				});
				*/
			}
			// Sinon on télécharge le fichier
			else{
				window.open("includes/file.php?path="+path+filename+"&act=down");
			}
		}
		
		resetSelection();
		return false;
	});
	// Clic sur les lignes
	$("#files tr.folder, #files tr.file").live("click", function(){
		// Récupèration du nom
		var filename = $(this).children("td:first").children("a").children("span.name").text();
		
		// Si c'est un dossier, on ajoute d- devant
		if( $(this).hasClass("folder") ){
			var filename = 'd-' + filename;
		}
		
		// Si le fichier est déjà sélectionné, on l'enlève
		if( $(this).hasClass("selected") ){
			removeSelectedFile(false, filename);
			$(this).removeClass("selected");
			$(this).children("td:last").children("input").attr("checked", false);
		}
		// Sinon, on l'ajoute
		else{
			addSelectedFile(filename);
			$(this).addClass("selected");
			$(this).children("td:last").children("input").attr("checked", true);
		}
		
		// Mise à jour du nb de fichiers sélectionnés
		updateNbSelectedFiles();
	});
	
	
	/**
	* Options de fichiers
	*/
	// Nouveau dossier
	$("input#createNewFolder").click(function(){
		var selector = $("#viewCreateNewFolder");
		if( selector.hasClass("displaynone") ){
			if( !$("#viewCreateNewFile").hasClass("displaynone") ){
				$("#viewCreateNewFile").slideUp("fast");
				$("#viewCreateNewFile").addClass("displaynone");
				$("#createNewFile").removeClass("active");
			}
			selector.slideDown("fast");
			selector.removeClass("displaynone");
			$(this).addClass("active");
			$("input#createNewFolderName").select();
		}
		else{
			selector.slideUp("fast");
			selector.addClass("displaynone");
			$(this).removeClass("active");
		}
	});
	// Création du dossier
	$("input#createNewFolderValid").click(function(){
		createNewFolder( $("input#createNewFolderName").val() );
	});
	$("input#createNewFolderName").keyup(function(key){
		if(key.keyCode == 13){
			createNewFolder( $(this).val() );
		}
	});
	
	// Nouveau fichier
	$("input#createNewFile").click(function(){
		var selector = $("#viewCreateNewFile");
		if( selector.hasClass("displaynone") ){
			if( !$("#viewCreateNewFolder").hasClass("displaynone") ){
				$("#viewCreateNewFolder").slideUp("fast");
				$("#viewCreateNewFolder").addClass("displaynone");
				$("#createNewFolder").removeClass("active");
			}
			selector.slideDown("fast");
			selector.removeClass("displaynone");
			$(this).addClass("active");
			$("input#createNewFileName").select();
		}
		else{
			selector.slideUp("fast");
			selector.addClass("displaynone");
			$(this).removeClass("active");
		}
	});
	// Création du fichier
	$("input#createNewFileValid").click(function(){
		createNewFile( $("input#createNewFileName").val() );
	});
	$("input#createNewFileName").keyup(function(key){
		if(key.keyCode == 13){
			createNewFile( $(this).val() );
		}
	});
	
	
	
	/**
	* Move Selection
	*/
	// Clic Déplacer
	$("input#move").click(function(){
		var list = getSelectedFiles();
		
		// Si il y a au moins un fichier sélectionné
		if(list[0] != undefined){
			$("#viewMoveSelection").dialog({
				title: "Déplacer une sélection",
				modal: true,
				width: 560,
				minHeight: 400,
				buttons: {
					"Déplacer": function(){
						moveSelection();
					},
					"Annuler": function(){
						$(this).dialog("close");
						$("input#moveSelectedFile").val("");
					}
				}
			});
			getArbo( getPath() );
		}
		else{
			error("Aucun fichier sélectionné");
		}
	});
	// Clic chargement
	$("a#moveLoader").click(function(){
		getArbo( $("input#movePath").val() );
		$("input#moveSelectedFile").val("");
		return false;
	});
	// Appuie sur entrée dans le chemin
	$("input#movePath").keyup(function(key){
		if(key.keyCode == 13){
			getArbo( $(this).val() );
			$("input#moveSelectedFile").val("");
		}
	});
	// Clique sur les fichiers
	$("#moveFiles a").live("click", function(){
		var path = $("#movePath").val();
		var filename = $(this).children(".name").text();
		getArbo(path+filename);
		$("input#moveSelectedFile").val("");
		return false;
	});
	// Clic sur les lignes
	$("#moveFiles tr.folder").live("click", function(){
		// Récupèration du nom
		var filename = $(this).children("td:first").children("a").children("span.name").text();
		
		// On remet par défaut la selection
		$("#moveFiles table tr").removeClass("selected");
		$("#moveFiles table tr").children("td:last").children("input").attr("checked", false);
		
		$("input#moveSelectedFile").val(filename);
		$(this).addClass("selected");
		$(this).children("td:last").children("input").attr("checked", true);
	});
	
	
	
	/**
	* Renommer / Supprimer
	*/
	// Renommer
	$("input#rename").click(function(){
		var list = getSelectedFiles();
		
		// Si il y a au moins un fichier sélectionné
		if(list[0] != undefined){
			$("#viewRenameSelection").dialog({
				title: "Renommer une sélection",
				modal: true,
				width: 560,
				minHeight: 400,
				buttons: {
					"Renommer": function(){
						renameSelection();
					},
					"Annuler": function(){
						$(this).dialog("close");
					}
				}
			});
			getRenameSelection();
		}
		else{
			error("Aucun fichier sélectionné");
		}
	});
	
	// Supprimer
	$("input#delete").click(function(){
		var list = getSelectedFiles();
		
		// Si il y a au moins un fichier sélectionné
		if(list[0] != undefined){
			var selector = $("#viewMoveSelection, #viewRenameSelection");
			selector.slideUp("fast");
			selector.addClass("displaynone");
			deleteSelection();
		}
		else{
			error("Aucun fichier sélectionné");
		}
	});
	
	
	/**
	* Upload
	*/
	initializeUploader();
	//]]>
});