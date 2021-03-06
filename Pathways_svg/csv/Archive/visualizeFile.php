<?php

	include 'query.php';
	include 'processContent.php';


?>
<html xmlns:xlink="http://www.w3.org/1999/xlink">
	<head> <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
		<script src="./csvJSON.js"></script>
		<link rel="stylesheet" href="style.css" type="text/css"></link>
		<link rel="stylesheet" href="graph.css" type="text/css"></link>
		<script src="drawGraph.js"></script>
	</head>
	<body>
		<svg class="svg"> </svg>
		<script>
		$("form").hide();
		var margin={top:20, right:20, bottom:20, left:20};
		var h=700-margin.left-margin.right,
			w=700-margin.top-margin.right,
			padding=10;
		var gWidth=200,
			gHeight=200,
			padding=50,
			graphR =3.5,
			xTicks=[0,2,10],
			yTicks=[0,0.5,1],
			rowWidth=3, //number of graphs in one row
			colHeight=3; //number of graphs in one column

		var svg = d3.select(".svg")
					.attr("width",700)
					.attr("height",700);

		var chart = svg.append("g")
						.attr("class","chart")
						.attr("transform","translate("+margin.left+","+margin.right+")");


		//set the x and y scales

		var scaleX = d3.scale.linear()
							.domain([0,10])
							.range([0,gWidth]);
						

		var scaleY = d3.scale.linear()
								.domain([0,1])
								.range([gHeight,0]);

		var xAxis = d3.svg.axis()
						.scale(scaleX)
						.tickValues(xTicks);

		var yAxis = d3.svg.axis()
						.scale(scaleY)
						.orient("left")
						.tickValues(yTicks);
						
		</script>
		
		<? if(isset($_GET['usrname'])){ //file selected
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
				<script> visualize(<?php echo json_encode($result);?>,["A","B","C"]);</script>
			<?}


		}
	?>
		
	</body>
</html>