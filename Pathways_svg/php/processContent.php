<?php

function processContent($content){
			$new_content = explode("\n",$content);
			$rows = count($new_content);
			$headers = explode(",", $new_content[0]);
			$i=0;
			$json=array();
			$try=array();

			for($i=1;$i<$rows;$i++){
				$values=array();
				$column = array();
				$curr_row = explode(",",$new_content[$i]);
			
				for($j=0;$j<count($headers);$j++){
					if($headers[$j]=="Name"){
						$column["".trim($headers[$j])] = trim($curr_row[$j]);
						
					}else{
						$obj=array();
						$obj["time"] = $j-1;
						$obj["conc"] = trim($curr_row[$j]);
						array_push($values,$obj);
					}
				}
				$column["values"]=$values;
				$try["".trim($curr_row[0])] = $values; 
				array_push($json,$column);
			}

			//json_encode($json);

			//return $json ;
			return $try;
		}

?>