var manageRadialGraph=function(groupSelector){
	var circleConstraint=300,
	topValue=1,
	radius=d3.scale.linear()
			.range([0,(circleConstraint/2)])
			.domain([0,topValue]),
	manager={},
	graphId;
	
	var isConsistent=function(values1,values2){  //make sure that the number of molecules are same, and the order is same
		if(values1[0].length!=values2[0].length) return false;
		for(var i=0;i<values1.length;i++){
			if(values1[0][i].Mole!=values2[0][i].Mole){
				console.log(values1[0][i].Mole);
				return false;
			}
		}
		console.log("yo");
		return true;
	}
	
	var findDistance=function(selector,point){
		//find the distance from the center of the bbox to the point
		var rGraph=d3.select("#"+selector),
			x=d3.transform(rGaph.attr("transform")).translate[0],
			y=d3.transform(rGraph.attr("transform")).translate[1];

		var pos={x:x,y:y};
		diffX=Math.abs(point.x-pos.x);
		diffY=Math.abs(point.y-pos.y);
       	return Math.sqrt(Math.pow(diffX,2)+Math.pow(diffY,2));

	}

	manager.createRadialGraph=function(rmsData, pos){

		var graphId = radialGraph(groupSelector)
					.rmsData(rmsData)
					.center({x:pos.x,y:pos.y})
					.radius(radius)
					.topValue(topValue)();
		
		return graphId;
	}

	manager.removeRadialGraph=function(){
		d3.select("#"+graphId).remove();
		return; 
	}

	manager.findClosestRadialGraph=function(){
		var currDist=0,
			currId=-1,
			minScatterPlot = Number.MAX_VALUE ,
            scatterPlotSelected = null,
          	buffer=radius(topValue) ; //max distance from the center
            
        var radialGraphs=(d3.selectAll("."+radialGraphs))[0];
		 
        for(var i=0;i<radialGraphs.length;i++){
        	var currId=d3.select(radialGraphs[i]).attr("id");
        	if(!bindingManager.isBoundComponent(currId)){
        		currDist=findDistance(point,currId);
        		if(currDist<=(buffer) &&  currDist<minScatterPlot){
                      minScatterPlot=currDist;
                      scatterPlotSelected = currId;
                  }
        	}
        }

       	return {dist:minScatterPlot, id:scatterPlotSelected};
	}

	manager.updateRadialGraph=function(){
		
		var update={};
		update.move=function(value){

			d3.select("#"+graphId)
			.transition()
			.attr("transform","translate("+value.x+","+value.y+")")
			.ease("exp")
			.duration(500);
			return id;
		}

		update.changeValue = function(rmsData){
			rmsValues=[[]];

			for(var i=0;i<rmsData.length;i++){
			rmsValues[0][i]=rmsData[i].RMS;
			
			}
			
			rmsValues[0][i]=rmsData[0].RMS;
			
			//if(!isConsistent(d3.select(selector+">.lines>path").attr("d"),rmsValues)){return update;} ->not gonna happen cause you cant create new stuff

			d3.select("#"+graphId+">.lines>path")
				.data(rmsValues)
				.transition()
				.attr("d",d3.svg.line.radial()
								.radius(function(d,i){return radius(d);})
								.angle(function(d,i){ 
									if (i == rmsData.length) {
             							i=0;
         							 } //close the line
         							 return i*2*Math.PI/rmsData.length;})
							)
				.ease("elastic")
				.duration(500);

			//if inconsistent delete and create a new one
			}
		
		return update;

	}

	return manager;
}