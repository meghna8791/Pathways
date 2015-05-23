var manageCSV=function(groupSelector){
	var csvArray=[],
	currCSV=null,
	currCSVData=null,
	manager={},
	phi,
	R,r,num;

	

	function getScreenCoords(point){
		var csvGroup=d3.select(".files");  //add the transformation of the csvGroup
			xPar=d3.transform(csvGroup.attr("transform")).translate[0],
			yPar=d3.transform(csvGroup.attr("transform")).translate[1];

		return {x:point.x+xPar,y:point.y+yPar};
	}

	function selectCSV(fileGroup){
		fileGroup.classed("selected",true);
		fileGroup.attr("r",r*1.2);
		currCSV=(fileGroup.select("text")[0][0].textContent).toLowerCase()+".csv";
		return;
	}

	manager.drawCSV=function(center){
		
		var xmlhttp,id;
		
		if (window.XMLHttpRequest)
			{// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp=new XMLHttpRequest();
			}
				
		xmlhttp.onreadystatechange=function()
			{
				if (xmlhttp.readyState==4 && xmlhttp.status==200)
				 {	
				    drawFiles(JSON.parse(xmlhttp.responseText));
				   	console.log(xmlhttp.responseText);
				 }
			}
		
		xmlhttp.open("GET","http://localhost/xampp/Pathways/php/getFiles.php?usrname=synlab&project=test",true);
		xmlhttp.send();

		function drawFiles(files){
			id="CSV";
			num=files.length;
			r = 30;
			var	RCal=(2*num-1)*r/Math.PI,
				Rmin=150;
			R = (RCal>Rmin)?RCal:Rmin;

			var	arc = d3.svg.arc()
						.innerRadius(R)
						.outerRadius(R)
						.startAngle(-Math.PI/2)
						.endAngle(Math.PI/2);

			var csvGroup = d3.select("."+groupSelector)
							.append("g")
							.attr("class","files")
							.attr("transform","translate("+center.x+","+center.y+")")
							.attr("id",id)
							.attr("type","csv");
							
			var csvPath = csvGroup.append("path")
							.attr("d", arc)
							.style("stroke","white")
							.attr("class","csvPath");
			var count=0;

			phi = Math.PI/(num-1);

			for(var i=0;i<files.length;i++){
				console.log(files[i]);
				var theta=count*phi;
				var point = csvPath.node().getPointAtLength(theta*(R));
				var fileGroup=csvGroup
								.append("g")
								.attr("class","fileGroup")
								.attr("transform","translate("+point.x+","+point.y+")")
								.style("opacity",0);

				fileGroup.transition()
						.duration(100)
						.delay(i*100)
						.ease("circle")
						.style("opacity",1)
						.each("end",function(){
							d3.select(this).style("opacity",1);
						});
								

				var circle=fileGroup
								.append("a")
								.append("circle")
								.attr("r",r)
								.attr("class","file");
								
				  
				fileGroup
					.append("text")
					.attr("text-anchor","middle")
					.text(files[i].split('.')[0].toUpperCase())
					.attr("class","csvText")
					.style("fill","white");

				//map the angle to the file name
				csvArray[count]=theta;

				count++;  //index of the file
			}

			
			var pointStart = getScreenCoords(csvPath.node().getPointAtLength(0*(R))); //modify to point to curent angle of the tuio object
			var files = d3.selectAll(".fileGroup");
			var currFile,currPos={};
			
			
			files.each(function(d,i){
				currFile = d3.select(this);
				currPos={x:d3.transform(currFile.attr("transform")).translate[0],
						y:d3.transform(currFile.attr("transform")).translate[1]};
				currPos=getScreenCoords(currPos);
				
				if(Math.floor(currPos.x)==Math.floor(pointStart.x) && Math.floor(currPos.y)==Math.floor(pointStart.y)){
						selectCSV(currFile);
					}else{
						currFile.classed("selected",false);
				}
			});
		}

		return id;
	};

	manager.nextCSV=function(angle){

		var csvPath = (d3.select(".csvPath"))[0][0],
			point = getScreenCoords(csvPath.getPointAtLength(angle*(R))),
			files = d3.selectAll(".fileGroup"),
			currFile, currPos={},
			startAngle,endAngle,
			filesCount;
		
			
		filesCount=files[0].length;
		/*files.each(function(d,i){
				currFile = d3.select(this);
				currPos={x:d3.transform(currFile.attr("transform")).translate[0],
						y:d3.transform(currFile.attr("transform")).translate[1]};
				currPos=getScreenCoords(currPos);
				console.log(" for file x "+currPos.x+ " y "+currPos.y);
				if(Math.floor(currPos.x)==Math.floor(point.x) && Math.floor(currPos.y)==Math.floor(point.y)){
					selectCSV(currFile);
				}else{
					currFile.classed("selected",false);
				}
		});*/
		
		files.each(function(d,i){
			currFile = d3.select(this);
			startAngle=(i>0)?(((i-1)*phi+i*phi)/2):0;
			endAngle=(i<filesCount-1)?(((i+1)*phi+i*phi)/2):(filesCount-1)*phi;
			//console.log("start angle "+startAngle+" and end angle "+endAngle);
			if(angle>=startAngle && angle<endAngle){
				selectCSV(currFile);
				
			}else{
				currFile.classed("selected",false);
			}
		});


	};

	manager.setCurrCSV=function(){
		var xmlhttp;
		if (window.XMLHttpRequest)
			{// code for IE7+, Firefox, Chrome, Opera, Safari
			 	xmlhttp=new XMLHttpRequest();
		}
			
		xmlhttp.onreadystatechange=function()
			{
			  if (xmlhttp.readyState==4 && xmlhttp.status==200)
			    {	
			    	
			    	//visualize(JSON.parse(xmlhttp.responseText),["A"]);
			    	currCSVData=xmlhttp.responseText; 
			   		console.log(xmlhttp.responseText);
			   		return JSON.parse(xmlhttp.responseText);
			    }
		}
		xmlhttp.open("GET","http://localhost/xampp/Pathways/php/selectFile.php?usrname=synlab&project=test&fileName="+currCSV,true);
		xmlhttp.send();
		
		
	};

	manager.getExpData=function(){
		//return currCSVData;
		var temp={"GLC":[{"time":0,"conc":"50"},{"time":1,"conc":"18.4"},{"time":2,"conc":"6.76"},{"time":3,"conc":"2.49"},
        {"time":4,"conc":"0.91"},{"time":5,"conc":"0.34"},{"time":6,"conc":"0.12"},{"time":7,"conc":"0.05"},{"time":8,"conc":"0.02"},
        {"time":9,"conc":"0.01"}],
        "G6P":[{"time":0,"conc":"0.83"},{"time":1,"conc":"24.4"},{"time":2,"conc":"23.56"},{"time":3,"conc":"17.5"},
        {"time":4,"conc":"8.1"},{"time":5,"conc":"5.9"},{"time":6,"conc":"4.03"},{"time":7,"conc":"2.9"},{"time":8,"conc":"1.81"},{"time":9,"conc":"1.11"}],
        "F6P":[{"time":0,"conc":"0.14"},{"time":1,"conc":"5.7"},{"time":2,"conc":"9.9"},{"time":3,"conc":"10.0"},
        {"time":4,"conc":"8.1"},{"time":5,"conc":"5.9"},{"time":6,"conc":"4.03"},{"time":7,"conc":"2.6"},{"time":8,"conc":"1.67"},{"time":9,"conc":"1.05"}],
        "FBP":[{"time":0,"conc":"0.35"},{"time":1,"conc":"1.7"},{"time":2,"conc":"4.9"},{"time":3,"conc":"6.4"},
        {"time":4,"conc":"6.0"},{"time":5,"conc":"4.8"},{"time":6,"conc":"3.51"},{"time":7,"conc":"2.4"},{"time":8,"conc":"1.58"},{"time":9,"conc":"1.01"}],
        
        "DHAP":[{"time":0,"conc":"1.0"},{"time":1,"conc":"1.7"},{"time":2,"conc":"2.75"},{"time":3,"conc":"5.27"},
        {"time":4,"conc":"7.78"},{"time":5,"conc":"9.6"},{"time":6,"conc":"10.71"},{"time":7,"conc":"11.1"},{"time":8,"conc":"11"},{"time":9,"conc":"10.5"}],
       
        "GLAP":[{"time":0,"conc":"0.2"},{"time":1,"conc":"1.25"},{"time":2,"conc":"2.68"},{"time":3,"conc":"5.01"},
        {"time":4,"conc":"6.25"},{"time":5,"conc":"6.26"},{"time":6,"conc":"5.53"},{"time":7,"conc":"4.5"},{"time":8,"conc":"3.56"},{"time":9,"conc":"2.76"}],
        

        "BPG":[{"time":0,"conc":"0.21"},{"time":1,"conc":"0.7"},{"time":2,"conc":"1.98"},{"time":3,"conc":"5.52"},
        {"time":4,"conc":"10.47"},{"time":5,"conc":"15.51"},{"time":6,"conc":"19.69"},{"time":7,"conc":"22.6"},{"time":8,"conc":"24.28"},{"time":9,"conc":"24.5"}],
       
        "3PG":[{"time":0,"conc":"1.0"},{"time":1,"conc":"0.53"},{"time":2,"conc":"0.95"},{"time":3,"conc":"1.2"},
        {"time":4,"conc":"1.85"},{"time":5,"conc":"2.92"},{"time":6,"conc":"4.33"},{"time":7,"conc":"5.94"},{"time":8,"conc":"7.62"},{"time":9,"conc":"9.24"}],
        
        "2PG":[{"time":0,"conc":"0.3"},{"time":1,"conc":"0.94"},{"time":2,"conc":"0.41"},{"time":3,"conc":"0.48"},
        {"time":4,"conc":"0.57"},{"time":5,"conc":"0.74"},{"time":6,"conc":"1.02"},{"time":7,"conc":"1.41"},{"time":8,"conc":"1.92"},{"time":9,"conc":"2.54"}],
        
        "PG":[{"time":0,"conc":"2.9"},{"time":1,"conc":"0.2"},{"time":2,"conc":"0.3"},{"time":3,"conc":"0.4"},
        {"time":4,"conc":"0.4"},{"time":5,"conc":"0.4"},{"time":6,"conc":"0.4"},{"time":7,"conc":"0.4"},{"time":8,"conc":"0.4"},{"time":9,"conc":"0.4"}],
        
        "PEP":[{"time":0,"conc":"0.23"},{"time":1,"conc":"0.36"},{"time":2,"conc":"0.13"},{"time":3,"conc":"0.11"},
        {"time":4,"conc":"0.11"},{"time":5,"conc":"0.11"},{"time":6,"conc":"0.11"},{"time":7,"conc":"0.14"},{"time":8,"conc":"0.18"},{"time":9,"conc":"0.24"}],
       
        "PYR":[{"time":0,"conc":"0.51"},{"time":1,"conc":"0.61"},{"time":2,"conc":"0.69"},{"time":3,"conc":"0.74"},
        {"time":4,"conc":"0.79"},{"time":5,"conc":"0.85"},{"time":6,"conc":"0.92"},{"time":7,"conc":"1.00"},{"time":8,"conc":"1.11"},{"time":9,"conc":"1.12"}]
		};

		return temp;
	}

	manager.undrawCSV=function(){
		csvArray=[];
		var csvs=d3.select(".csvGroup")
					.remove();
		
	};

	return manager;
}