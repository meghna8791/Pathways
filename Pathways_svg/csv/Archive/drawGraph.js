
function visualize(json, moles){ //array of molecules whose graphs we want
var offsetX=0,
	offsetY=0;
var graph;

moles.forEach(function(d){
	
	//draw a graph for each
	console.log(offsetX);
	
	graph = d3.select(".chart")
				.append("g")
				.attr("class","graph")
				.attr("id",d)
				.attr("width",gWidth)
				.attr("height",gHeight)
				.attr("transform","translate("+(padding+offsetX*(gWidth+padding))+","+(padding+offsetY*(gHeight+padding))+")");
				
	//define the axis
	graph.append("g")
		.attr("class","axis")
		.call(xAxis)
		.attr("transform","translate(0,"+gHeight+")");

	graph.append("g")
		.attr("class","axis")
		.call(yAxis)
		.attr("transform","translate(0,0)");

	graph.selectAll(".Expdot")
		 .data(json[d])
		 .enter()
		 .append("circle")
	     .attr("cx",function(d,i){return scaleX(+d.time);})
		 .attr("cy",function(d,i){return scaleY(+d.conc);})
		 .attr("r",graphR)
		 .style("fill","yellow")
		 .attr("class","Expdot");


	offsetX = (offsetX+1)%rowWidth;
	if(offsetX==0){(offsetY=((offsetY+1)%colHeight));}
	});

	visualizeFit();
}

function visualizeFit(data, moles){
	var graph = d3.select("#A");

	var a = [{"time":0, "conc":0.1},{"time":1, "conc":0.5},{"time":2, "conc":0.6},{"time":3, "conc":0.8},{"time":4, "conc":0.0}];

	graph.selectAll(".Fitdot")
			  .data(a)
			  .enter()
			  .append("circle")
			  .attr("cx",function(d,i){return scaleX(d.time);})
			  .attr("cy",function(d,i){return scaleY(d.conc);})
			  .attr("r",3.5)
			  .style("fill","green")
			  .attr("class","Fitdot");



}


	
		