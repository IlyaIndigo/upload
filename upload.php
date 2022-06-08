<!DOCTYPE html>
<html lang="ru">
	<head>
		<meta charset="utf-8"/>
		<title>Выгрузка файлов на сервер</title>
		<link type="image/png" sizes="16x16" rel="icon" href="/favicon.png"/>
		<link type="text/css" rel="stylesheet" href="/upload.css"/>
		<script src="/main.js"></script>
	</head>
	<body>
		<main>
			<h1>Выгрузка файлов на сервер</h1>
			<form action="javascript:void(0)"><input type="file" onchange="Upload.processInputHandler(this.files, this.form)" multiple=""/></form>
			<div class="drop" ondrop="Upload.processDropHandler(event)" ondragover="event.preventDefault()">
				<h4>Поместите файлы для выгрузки.</h4>
				<p>Файлы будут выгружаться по одному на каждый POST-запрос с использованием очереди, пока все файлы, не прывышающие разрешённый сервером размер, не будут выгружены.</p>
				<p> Сервер разрешает выгружать файлы размером не более <?=ini_get('upload_max_filesize')?>.</p>
			</div>
			<div class="drop" ondrop="Upload.plainDropHandler(event)" ondragover="event.preventDefault()">
				<h4>Поместите файлы для выгрузки.</h4>
				<p>Файлы будут выгружаться все сразу, единым POST-запросом, сколько разрешит сервер. Лишние файлы выгружены не будут.</p>
				<p>Сервер разрешает выгружать не более <?=ini_get('max_file_uploads')?> файлов размер каждого не более <?=ini_get('upload_max_filesize')?> общий размер не более <?=ini_get('post_max_size')?>.</p>
			</div>
		</main>
		<div id="progress" style="display:none">
			<div onclick="Upload.showToggle(this.nextElementSibling)"><h4>Все выгрузки <output></output></h4><progress value="0"></progress></div>
			<div></div>
		</div>
		<script>
			'use strict';
			const max_files = <?=ini_get('max_file_uploads')?>;
			const max_filesize = <?=ini_to_bytes(ini_get('upload_max_filesize'))?>;
			const max_postsize = <?=ini_to_bytes(ini_get('post_max_size'))?>;
		</script>
		<script src="/upload.js"></script>
	</body>
</html>