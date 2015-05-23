


var scatterPlot = function(groupSelector){

	var expJSON,
		simJSON,
		offsetX=0,
		offsetY=0,
		origin,
		count=0,
		scaleX,
		scaleY,
		dimensions={},
		key;

	var padding=50,
		graphR =3.5,
		rowWidth=3, //number of graphs in one row
		colHeight=3,
		graph, //number of graphs in one column
		xTicks=[0,5,10],
		yTicks=[0,25,50],
		id;

	function graph(){
		
		/* keeping this in case we ever make multiple graphs at the same time
		var id="SC_"+count;
		var graphGroup = d3.select("."+groupSelector)
							.append("g")
							.attr("id",id)
							.attr("transform","translate("+origin.x+","+origin.y+")");*/
		
		var xAxis = d3.svg.axis()
						.scale(scaleX)
						.tickValues(xTicks);

		var yAxis = d3.svg.axis()
						.scale(scaleY)
						.orient("left")
						.tickValues(yTicks);

		var expGroup,simGroup;

		/*in case we add an option to show all graphs together*/
		/*for(var key in simJSON){
			//draw a graph for each
			id="SC_"+key;
			graph = d3.select("."+groupSelector)
						.append("g")
						.attr("class","scatterPlot")
						.attr("type","scatterPlot")
						.attr("id",id)
						.attr("molecule",key)
						.attr("width",dimensions.width)
						.attr("height",dimensions.height)
						.attr("transform","translate("+(origin.x+offsetX*(dimensions.width+padding))+","+(origin.y+offsetY*(dimensions.height+padding))+")");
						
			//define the axis
			graph.append("g")
				.attr("class","axis")
				.call(xAxis)
				.attr("transform","translate(0,"+dimensions.height+")");

			graph.append("g")
				.attr("class","axis")
				.call(yAxis)
				.attr("transform","translate(0,0)");

			expGroup=graph.append("g")
						.attr("class","expGroup");
			
			simGroup=graph.append("g")
						.attr("class","simGroup");
			
			expGroup.selectAll(".expDot")
				 .data(expJSON[key])
				 .enter()
				 .append("circle")
			     .attr("cx",function(d,i){return scaleX(+d.time);})
				 .attr("cy",function(d,i){return scaleY(+d.conc);})
				 .attr("r",graphR)
				 .style("fill","yellow")
				 .attr("class","Expdot");

			simGroup.selectAll(".simDot")
			  .data(simJSON[key])
			  .enter()
			  .append("circle")
			  .attr("cx",function(d,i){return scaleX(d.time);})
			  .attr("cy",function(d,i){return scaleY(d.conc);})
			  .attr("r",3.5)
			  .style("fill","green")
			  .attr("class","simDot");


			offsetX = (offsetX+1)%rowWidth;
			if(offsetX==0){(offsetY=((offsetY+1)%colHeight));}
	}*/
	/*end of all graphs together*/

		id="SC_"+key;
		graph = d3.select("."+groupSelector)
					.append("g")
					.attr("class","scatterPlot")
					.attr("type","scatterPlot")
					.attr("id",id)
					.attr("molecule",key)
					.attr("width",dimensions.width)
					.attr("height",dimensions.height)
					.attr("transform","translate("+origin.x+","+origin.y+")");
		
		graph.append("text")
				.attr("x",0)
				.attr("y",0)
				.attr("transform","translate("+dimensions.width/2+",0)")
				.attr("text-anchor","middle")
				.text(key)
				.style("fill","white");					
		//define the axis
		graph.append("g")
			.attr("class","axis")
			.call(xAxis)
			.attr("transform","translate(0,"+dimensions.height+")");

		graph.append("g")
			.attr("class","axis")
			.call(yAxis)
			.attr("transform","translate(0,0)");

		expGroup=graph.append("g")
					.attr("class","expGroup");
				
		simGroup=graph.append("g")
					.attr("class","simGroup");
				
		expGroup.selectAll(".expDot")
					 .data(expJSON[key])
					 .enter()
					 .append("circle")
				     .attr("cx",function(d,i){return scaleX(+d.time);})
					 .attr("cy",function(d,i){return scaleY(+d.conc);})
					 .attr("r",graphR)
					 .style("fill","yellow")
					 .attr("class","Expdot");

		simGroup.selectAll(".simDot")
				  .data(simJSON[key])
				  .enter()
				  .append("circle")
				  .attr("cx",function(d,i){return scaleX(d.time);})
				  .attr("cy",function(d,i){return scaleY(d.conc);})
				  .attr("r",3.5)
				  .style("fill","green")
				  .attr("class","simDot");

		
		return id;	//change this when adding a group of graphs

	}

	graph.expJSON = function(value){
		if(!arguments.length) return expJSON;
		else expJSON=value;

		return graph;
	}

	graph.simJSON = function(value){
		if(!arguments.length) return simJSON;
		else simJSON=value;

		return graph;
	}


	graph.origin=function(value){
		if(!arguments.length) return origin;
		else origin=value;

		return graph;
	}

	graph.count=function(value){
		if(!arguments.length) return count;
		else count=value;

		return graph;
	}

	graph.xScale=function(value){
		if(!arguments.length) return scaleX;
		else scaleX=value;

		return graph;
	}

	graph.yScale=function(value){
		if(!arguments.length) return scaleY;
		else scaleY=value;

		return graph;
	}

	graph.dimensions=function(value){
		if(!arguments.length) return dimensions;
		else dimensions=value;

		return graph;
	}

	graph.key=function(value){
		if(!arguments.length) return key;
		else key=value;

		return graph;
	}

	return graph;

}


	
		