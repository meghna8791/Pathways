var startPathwaysScene=function(){

    svg = d3.select("body").append("svg")
                    .attr("height",screenH)
                    .attr("width",screenW);

    network = svg.append("g");

    //initialize all groups

    moleculeGroup = network.append("g")
                                    .attr("class","moleculeGroup")
                                    .attr("transform","translate(0,0)");
    enzymeGroup = network.append("g")
                                    .attr("class","enzymeGroup")
                                    .attr("transform","translate(0,0)");

    reactionsGroup = network.append("g")
                                    .attr("class","reactionGroup")
                                    .attr("transform","translate(0,0)");

    scatterPlotGroup =  network.append("g")
                                    .attr("class","scatterPlotGroup")
                                    .attr("transform","translate(0,0)");

    radialGraphGroup =  network.append("g")
                                    .attr("class","radialGraphGroup")
                                    .attr("transform","translate(0,0)");

    csvGroup =  network.append("g")
                                    .attr("class","csvGroup")
                                    .attr("transform","translate(0,0)");

    cubePointerGroup =  network.append("g")
                                    .attr("class","cubePointerGroup")
                                    .attr("transform","translate(0,0)");

    //reaction markers
    defs=svg.append("defs");

    arrow=defs.append("marker")
                      .attr("id","arrowHead")
                      .attr("orient","auto")
                      .attr("markerWidth",2) 
                      .attr("markerHeight",4)
                      .attr("refX",0.1)
                      .attr("refY",2);
    markerPath=arrow.append("path")
                        .attr("d","M0,0 V4 L2,2 Z")
                        .style("fill","white");
	
	//TuioClient 
    TuioManager = TuioClient();
    TuioManager.init();

    //socket connection
    socket= io2.connect("http://localhost:3000");	
         socket.on('connected',function(msg){

    }); 

    

    //initialize the Managers
    stateManager=manageState();
    reactionManager=new manageReaction("reactionGroup");
    moleculeManager=new manageMole("moleculeGroup","molecule");
    enzymeManager=new manageMole("enzymeGroup","enzyme");
    bindingManager=manageBinding(3);
    scatterPlotManager=manageScatterPlot("scatterPlotGroup");
    radialGraphManager=manageRadialGraph("radialGraphGroup");
    csvManager=manageCSV("csvGroup");
    ODEManager=manageODE();
    return;

}