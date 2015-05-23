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
		
	</head>
	<body> 

		<header>
		<nav>
			<a class="left" href="http://synlab.gatech.edu/">SYNLAB</a>
			<a class="right" href="./download.html">Download</a>
			<a class="right" href="./import.html" active>Import</a>
		</nav>
	</header>

	<h1> Download a file</h1>
		<form action="" method="POST">
			<table>
				
				<tr><td>UserName</td><td><input type="text" name="usrname" id="usname"></input> </td></tr>

				<tr><td>Project</td><td><input type="text" name="project" id="project">  </input></td></tr>
				<tr><td><button type="submit" value="submit" id="submit">Submit </button></td></tr>
			</table>
		</form>
		<svg width="700" height="700"> </svg>
		<script>
			var buffer = 5;
			var svg = d3.select("svg");
										
			var g = svg.append("g")
						.attr("transform","translate(400,300)");


			function drawCircle(theta,fileName){
				var path = d3.select(".path").node();
				
				var  point = path.getPointAtLength(theta*(R));
				
				var circle = d3.select("g")
								.append("a")
							 .attr("xlink:href", function(d){
									return "./visualizeFile.php?usrname="+usrname+"&project="+project+"&fileName="+fileName;	
								})
								.append("circle")
								.attr("cx",point.x)
								.attr("cy",point.y)
								.attr("r",r)
								.attr("class","file");
			  
				d3.select("g").append("text")
						.attr("x",point.x-r/2)
						.attr("y", point.y+r/4)
						.text(fileName.toUpperCase())
						.attr("class","text");
				return point;
			}
		</script>
		<?php
		if($_POST){
			$usrname= $_POST["usrname"];
			$project = $_POST["project"];
			
			$query = "SELECT * FROM CSVs where usrname='$usrname' AND pathway='$project'";
			$result = queryDB($query);
			
			
			if(!$result){
				echo "No such project";
			}
				
			else{
				?>
					<script>
					var usrname = "<?php echo $usrname;?>";
					var project = "<?php echo $project;?>";
					var num = "<?php echo mysql_num_rows($result);?>";

					var RCal = (2*num-1)*40/Math.PI;
					var Rmin = 150;
					var R = (RCal>Rmin)?RCal:Rmin;
					var r = 40;
					var arc = d3.svg.arc()
								.innerRadius(R)
								.outerRadius(R)
								.startAngle(-Math.PI/2)
								.endAngle(Math.PI/2);
					
					var path = g.append("path")
								  .attr("d", arc)
								  .style("stroke","none")
								  .attr("class","path");
					var count=0;

					var phi = Math.PI/num;
					
					$("form").hide();
					</script>
				<?


				while($row=mysql_fetch_array($result)){
					$fileName = $row["fileName"];

					?><!--<a href="?usrname=<?php echo $usrname;?>&project=<?php echo $project;?>&fileName=<?php echo $fileName;?>"><? echo $fileName; ?> </a> -->
					<script>
					
					var fileName = "<?php echo $fileName;?>"; 
						
						drawCircle(count*phi,fileName);
						console.log(count*phi);
						count++;  //index of the file
						


					 </script>
					<?
				}
			}
			mysql_free_result($result);
			?>
			<script>

		//which circle selected?
		var rotater = g.append("g");

		
		var tri = rotater.append("path")
						.attr("d","M -20, 0 L 0,-10 L 0,10 L -20,0 ")
						.attr("stroke","black")
						.attr("stroke-width",1)
						.attr("class","pivot");


		var path = (d3.select(".path"))[0][0];
		var  pointStart = path.getPointAtLength(0*(R));
		var files = d3.selectAll(".file");
		files.each(function(d,i){
				var currFile = d3.select(this);
				if(currFile.attr("cx")==pointStart.x && currFile.attr("cy")==pointStart.y){
					currFile.classed("selected",true);
					currFile.attr("r",r*1.2);
					
				}else{
					currFile.classed("selected",false);
					
				}
			});

		var rotateVal = 1;
		$(".pivot").click(function(){
			
			var  point = path.getPointAtLength(rotateVal*phi*(R));
			
			
			var pivot  = d3.select(".pivot")
						.attr("transform","rotate("+(rotateVal*180/4)+")");

			g.append("line")
				.attr("x1",0)
				.attr("y1",0)
				.attr("x2",point.x)
				.attr("y2",point.y)
				.style("stroke","black")
				.style("stroke-width","1");

			
			files.each(function(d,i){
				var currFile = d3.select(this);
				if(currFile.attr("cx")==point.x && currFile.attr("cy")==point.y){
					currFile.classed("selected",true);
					currFile.attr("r",r*1.2);
					
				}else{
					currFile.classed("selected",false);
					currFile.attr("r",r);
					
				}
			});

			rotateVal=(rotateVal+1)%(2*num);
			console.log(rotateVal);


			});

		
		<?}
		

		/*if(isset($_GET['usrname'])){ //file selected
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
				//header("Content-Disposition: attachment; filename=$name");?>
				<script>
					$("form").hide();
					
					

				</script>
				<?
				$result = processContent($content);
				echo $result;

			}


		}*/

		
	?>

		
		//visualize(<?php echo $result;?>,10);

	</script>
	</body>
</html>