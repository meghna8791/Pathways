<?php 
include 'query.php';
include 'processContent.php';


			$usrname= $_REQUEST["usrname"];
			$project = $_REQUEST["project"];
			
			$query = "SELECT * FROM CSVs where usrname='$usrname' AND pathway='$project'";
			$result = queryDB($query);
			$files_php=array();
			
			if(!$result){
				echo "No such project";
			}
				
			else{
				while($row=mysql_fetch_array($result)){
					$fileName = $row["fileName"];
					$files_php[]=$row["fileName"];
				}
			}
			mysql_free_result($result);
			$files_php = json_encode($files_php);
		
			echo $files_php;


?>