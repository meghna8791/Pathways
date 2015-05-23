var radialGraph = function(groupSelector){	// the group to which the radial chart has to be appended
	var rmsData=[],
	center={x:0,y:0},
	ticks=[0,0.5],
	id,
	topValue,
	radius;		

	function graph(){
		
		id="RG_0";
		var topValues=[[]],
		rmsValues=[[]];
		
		for(var i=0;i<=rmsData.length;i++){
			topValues[0][i]=topValue;
		}
		

		for(var i=0;i<rmsData.length;i++){
			rmsValues[0][i]=rmsData[i].RMS;
			
		}
		rmsValues[0][i]=rmsData[0].RMS;
		
		var radialChart = d3.select("."+groupSelector)
							.append("g")
							.attr("class","radialGraph")
							.attr("id",id)
							.attr("type","radialGraph")
							.attr("transform","translate("+center.x+","+center.y+")");
		
		//Highest values
		var stencil = radialChart.append("g")	
						.attr("class","stencil")
						.append("path")
						.data(topValues)
						.attr("d",d3.svg.line.radial()
								.radius(function(d){return radius(d)})
								.angle(function(d,i){ 
									if (i == rmsData.length) {
             							i=0;
         							} //close the line
         							return i*2*Math.PI/rmsData.length;})
						);

		//circles at the tick values
		var circularAxes = radialChart.selectAll(".circularTicks")
								.data(ticks)
								.enter()
								.append("g")
								.attr("class","circularTicks");
								

		var circleTicks= circularAxes.append("circle")
								.attr("r", function(d){return radius(d);});
						
		//a line for each molecule for reference
		var lineAxes = radialChart.selectAll(".lineAxes")
						.data(rmsData)
						.enter()
						.append("g")
						.attr("class","lineAxes")
						
		
		var lines = lineAxes.append("line")
					.attr("x2",function(d){return radius(topValue)})
					.attr("id",function(d){return d.Mole;})
					.attr("transform",function(d,i){return "rotate("+((i*360/rmsData.length-90))+")";});

		var lineText =  lineAxes.append("text")
						.text(function(d){return d.Mole;})
						.attr("text-anchor","start")
						.attr("dx",2)
						.attr("transform",function(d,i){return "rotate("+((i*360/rmsData.length-90))+")translate("+radius(topValue)+")";});

		//draw the radial graph
		var drawValues = radialChart.append("g")
							.attr("class","lines");

		
		var lines = drawValues.append("path")
					.data(rmsValues)
					.attr("class","rms")
					.attr("d",d3.svg.line.radial()
								.radius(function(d){return radius(d)})
								.angle(function(d,i){ 
									if (i == rmsData.length) {
             							i=0;
         							 } //close the line
         							 return i*2*Math.PI/rmsData.length;})
						);

		return id;
	}

	graph.rmsData = function(values){
		if(!arguments.length) return rmsData;
		else rmsData=values;

		return graph;
	}
	graph.center = function(value){
		if(!arguments.length) return center;
		else center=value;

		return graph;

	}

	graph.radius = function(value){
		if(!arguments.length) return radius;
		else radius=value;

		return graph;

	}

	graph.topValue = function(value){
		if(!arguments.length) return topValue;
		else topValue=value;

		return graph;

	}


	
	return graph;

}