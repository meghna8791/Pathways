var manageScatterPlot = function(groupSelector){
	var bindings=[],
	count=0;

	//TODO make the domain dynamic
	var gWidth=200,
		gHeight=200;
		
	var scaleX = d3.scale.linear()
							.domain([0,10]) 
							.range([0,gWidth]);
						

	var scaleY = d3.scale.linear()
								.domain([0,50])
								.range([gHeight,0]);


	var findDistance=function(point,selector){
		//find the distance from the center of the bbox to the point
		var sPlot=d3.select("#"+selector),
			bbox=sPlot.node().getBBox(),
			x=d3.transform(sPlot.attr("transform")).translate[0],
			y=d3.transform(sPlot.attr("transform")).translate[1];
			
		var pos={x:bbox.x+x+bbox.width/2,y:bbox.y+y+bbox.height/2},
			diffX=Math.abs(point.x-pos.x),
			diffY=Math.abs(point.y-pos.y);
		
       	return Math.sqrt(Math.pow(diffX,2)+Math.pow(diffY,2));	

	};

	this.createScatterPlot=function(expJSON, simJSON, pos, moleculeName){
		//assign the id here
		console.log(expJSON);
		console.log(simJSON);

		var graphId = scatterPlot(groupSelector)
					.expJSON(expJSON)
					.simJSON(simJSON)
					.origin({x:pos.x,y:pos.y})
					.count(count)
					.xScale(scaleX)
					.yScale(scaleY)
					.dimensions({width:gWidth,height:gHeight})
					.key(moleculeName)();
		count++;
		return graphId;
	};

	this.removeScatterPlot = function(selector){
		var graph = d3.select(selector)
		if(graph){
			graph.remove();
		};
		return;
	};

	this.findClosestScatterPlot=function(point){
		var currDist=0,
			currId=-1,
			minScatterPlot = Number.MAX_VALUE ,
            scatterPlotSelected = null,
          	buffer=Math.floor(Math.sqrt(Math.pow(gWidth/2,2)+Math.pow(gHeight/2,2))); //max distance from the center
            
        var scatterPlots=d3.selectAll(".scatterPlot")[0];
		
        for(var i=0;i<scatterPlots.length;i++){
        	var currId=d3.select(scatterPlots[i]).attr("id");
        	if(!bindingManager.isBoundComponent(currId)){
        		currDist=findDistance(point,currId);
        		if(currDist<=(buffer) &&  currDist<minScatterPlot){
                      minScatterPlot=currDist;
                      scatterPlotSelected = currId;
                  }
        	}
        }
       return {dist:minScatterPlot, id:scatterPlotSelected};
	};

	this.updateManager=function(selector){
		//var moleName=moleculeManager.getName(moleculeId); 
		//var graph=d3.select(".scatterPlot[molecule="+moleName+"]");
		var graph=d3.select("#"+selector);
		var update={};

		update.move=function(origin){
			if(graph==null){return;}
			graph
				.transition()
				.attr("transform","translate("+origin.x+","+origin.y+")")
				.ease("exp")
				.duration(500)
				.each("end",function(){
					d3.select(this)
						.attr("transform","translate("+origin.x+","+origin.y+")");
					//console.log(d3.select(this).attr("transform"));
				});

			return;
		};

		update.changeValues=function(simData,moleName){
			if(graph==null){return;}
			var simData = graph.selectAll(".simDot") 
							.data(simData[""+moleName])
							.transition()
							.attr("cx",function(d,i){return scaleX(d.time);})
			  				.attr("cy",function(d,i){return scaleY(d.conc);})
			  				.ease("sin");

			return;
		};
		return update;
	};


	return this;

};