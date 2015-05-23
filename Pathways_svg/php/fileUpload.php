<?php
	include "query.php"; 

	$target_dir="uploads/";
	var_dump($_FILES["csvs"]["name"]);

	$usrname = $_POST["usrname"];
	$project = $_POST["project"];
	$tmpName = $_FILES["csvs"]["tmp_name"];
	$name = $_FILES["csvs"]["name"];
	$size = $_FILES["csvs"]['size'];
	$type = $_FILES["csvs"]['type'];
 	$fp   = fopen($tmpName, 'r');
	$content = fread($fp, filesize($tmpName));
	$content = addslashes($content);
	fclose($fp);

	//$query = "SELECT * from  CSVs";
	$query = "INSERT INTO CSVs(usrname,pathway, file, fileName, size, type)"."VALUES('$usrname','$project','$content','$name', '$size','$type')";
 	//echo $query;
	$resultFromCSVs = queryDB($query); 
	 echo "We got back $resultFromCSVs contacts <br/>";

?>