<?php
unset($_REQUEST, $_GET);
const ROOT = __DIR__.'/';
const UPL = ROOT.'uploads/';

function ini_to_bytes($val)
{
	if($val && !is_numeric($val) && $m = array_search(strtolower($val[-1]), ['', 'k', 'm', 'g']))
		$val = (int)$val*1024**$m;
	return $val;
}

if(!empty($_FILES['file']) || !empty($_FILES['files']))
{
	$files = [];
	if(isset($_FILES['file']))
		$files[] = $_FILES['file'];
	elseif(isset($_FILES['files']))
		foreach($_FILES['files'] as $name=>$arr)
			foreach($arr as $i=>$val)
				$files[$i][$name] = $val;
	foreach($files as $arr)
		if($arr['error'] == 0 && $arr['size'] > 0 && move_uploaded_file($arr['tmp_name'], UPL.$arr['name']))
			chmod(UPL.$arr['name'], 0660);
}
else
	require ROOT.'upload.php';