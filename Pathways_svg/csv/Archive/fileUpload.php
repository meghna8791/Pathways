<?php
	include "query.php"; 

	$target_dir="uploads/";
	var_dump($_FILES["csvs"]["name"]);
	//foreach($_FILES["csvs"]["name"] as $key => $error){
		//if($error == UPLOAD_ERR_OK){
			
			/*$target_file= $target_dir.basename($_FILES["csvs"]["name"]);  //target path
			$source_file = $_FILES["csvs"]["tmp_name"];
			$upload_ok = 1;
			if(file_exists($target_file)){
				$upload_ok =0;
				echo "Sorry the file already exists";

			}
			if($upload_ok==0){
				echo "Sorry your file was not uploaded";
			}else{
				if(move_uploaded_file($source_file, $target_file)){
			
				//move it
					echo "The file has been uploaded";
					//add link to the table
				}else{
					echo "Sorry, there was an error while uploading";
				}


			}*/
		//}
 	//}
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