<?php
function queryDB($sqlAction) {
	
	$db_host = "localhost";
	$db_username = "root";
	$db_password = "";
	$db_database = "Pathways";
	
	$connection = mysql_connect($db_host, $db_username, $db_password ); // Open a connection to a MySQL Server

		if ($connection == false)
			{
				echo "DB error, code: ".mysql_error();
				die();
			}
		else 
			{
				$db_select = mysql_select_db($db_database); //Select a MySQL database
					if ($db_select == false) 
						{
							echo "could not select - error was " . mysql_error();
							die();
						} 
					else 
						{
							//Send a MySQL query 
							$result = mysql_query($sqlAction) or 
								die("Error: [" . mysql_error() . "]:".
											mysql_errno()."}");						
							mysql_close($connection);
							return $result;
						}
			}
	}
	




?>