<?php
if(isset($_GET['usrname'])){ //file selected
			$usrname = $_GET["usrname"];
			$project= $_GET["project"];
			$fileName = $_GET["fileName"];


			
			$query = "SELECT * FROM CSVs where usrname='$usrname' AND pathway='$project' AND fileName='$fileName'";

			$result_file = queryDB($query);

			//echo "result".$result_file;
			if(!$result_file){
				echo "Sorry no such file";
			}
			else{
				list($name, $type, $size, $content) =  mysql_fetch_array($result_file);

				header("Content-length: $size");
				header("Content-type: $type");
				//header("Content-Disposition: attachment; filename=$name");
				
			
				$result = processContent($content);
				?>
	return json_encode($result);
?>