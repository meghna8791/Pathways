var manageReaction=function(groupSelector){
	var RATIO={k1:3,k2:7},
	ROTATE=40;
	
    function rotateAbout(theta,cx,cy,x,y){//rotate (cx,cy) about (x,y)
     	theta = theta*Math.PI/180.0;
	    var cosa = Math.cos(theta), sina = Math.sin(theta),
	    cx = cx*cosa-cy*sina+x-cosa*x+sina*y, 
	    cy=cx*sina+cy*cosa+y-sina*x-cosa*y;


        return {x:cx,y:cy};
    }

	function computeCtrl1(x1,y1,x2,y2,ratio,rotate){ //computes control point1
	var ctrl1 = {},
	cx,cy;

	if(ratio==null){
		
    ratio = RATIO; 
    }
    if(rotate==null){
       rotate = ROTATE;
    }

    cx = (x1*ratio.k2+x2*ratio.k1)/(ratio.k1+ratio.k2); 
    cy= (y1*ratio.k2+y2*ratio.k1)/(ratio.k1+ratio.k2); 
    
    ctrl1= rotateAbout((-1)*rotate,cx,cy,x1,y1);
  
 
    //ctrl1.x= d3.transform(temp.attr("transform")).translate[0];
	return ctrl1;
    
	}

	function computeCtrl2(x1,y1,x2,y2,ratio,rotate){ //computer control point2
	var ctrl2={},
		cx,cy;

	if(ratio==null){
    ratio = RATIO; 
  
    }
    if(rotate==null){
    	rotate = ROTATE;
    }

    cx = (x2*ratio.k2+x1*ratio.k1)/(ratio.k1+ratio.k2);  
    cy = (y2*ratio.k2+y1*ratio.k1)/(ratio.k1+ratio.k2);
    ctrl2= rotateAbout(rotate,cx,cy,x2,y2);
    

    return ctrl2;

   }

   function rctPath(obj1,obj2,rc){
        var  d = {}, dis = [],translate1={},translate2={},
   		    bb1=obj1.node().getBBox();
            translate1.x=d3.transform(obj1.attr("transform")).translate[0];
            translate1.y=d3.transform(obj1.attr("transform")).translate[1];
		    
        if(obj1.attr("type")=="enzyme"){
            var path=obj2.select(".path")[0][0],
            totalLength=path.getTotalLength(),
            midPoint=path.getPointAtLength(totalLength/2),
            p = [{x: bb1.x + translate1.x+ bb1.width / 2, y: bb1.y + translate1.y - 1},
                    {x: bb1.x + translate1.x + bb1.width / 2, y: bb1.y + translate1.y+ bb1.height + 1},
                    {x: bb1.x + translate1.x - 1, y: bb1.y + translate1.y+ bb1.height / 2},
                    {x: bb1.x + translate1.x + bb1.width + 1, y: bb1.y + translate1.y+ bb1.height / 2},
                    {x:midPoint.x,y:midPoint.y}];

        }else{
            var bb2=obj2.node().getBBox();
            translate2.x=d3.transform(obj2.attr("transform")).translate[0];
            translate2.y=d3.transform(obj2.attr("transform")).translate[1];
            p = [{x: bb1.x + bb1.width / 2 + translate1.x, y: bb1.y + translate1.y - 1},
                {x: bb1.x + bb1.width / 2 + translate1.x, y: bb1.y + translate1.y+ bb1.height + 1},
                {x: bb1.x + translate1.x - 1, y: bb1.y + translate1.y+ bb1.height / 2},
                {x: bb1.x + translate1.x + bb1.width + 1, y: bb1.y + translate1.y+ bb1.height / 2},
                {x: bb2.x + translate2.x + bb2.width / 2, y: bb2.y + translate2.y - 1},
                {x: bb2.x + translate2.x + bb2.width / 2, y: bb2.y + translate2.y+ bb2.height + 1},
                {x: bb2.x + translate2.x - 1, y: bb2.y + translate2.y+ bb2.height / 2},
                {x: bb2.x + translate2.x+ bb2.width + 1, y: bb2.y + translate2.y+ bb2.height / 2}];
        }
        // Calculate the difference in the X and Y direction (dy and dx)
        for (var i = 0; i < 4; i++) {
            for (var j = 4; j<p.length; j++) {
                var dx = Math.abs(p[i].x - p[j].x),
                    dy = Math.abs(p[i].y - p[j].y);
                if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }
        
        if (dis.length == 0) {
            var res = [0, 4];
            } else {
            	res = d[Math.min.apply(Math, dis)];
            }
        var x1 = p[res[0]].x,
            y1 = p[res[0]].y,
            x2 = p[res[1]].x,
            y2 = p[res[1]].y;
        var ctrl1 = computeCtrl1(x1,y1,x2,y2);
        var ctrl2 = computeCtrl2(x1,y1,x2,y2);
        var path = ["M"+x1+" "+y1+"C"+ctrl1.x+" "+ctrl1.y+" "+ctrl2.x+" "+ctrl2.y+" "+x2+" "+y2];
        var tPath=calculateTextPath(x1,y1,x2,y2,ctrl1,ctrl2);

        return {path:path,tPath:tPath};
   }

   var calculateTextPath = function(x1,y1,x2,y2,ctrl1,ctrl2){ //calculates the bezier curve path for the text
    var p,b=5;
    var temp,num;
    var msg = [],t=[];
    var ratio = {k1:1, k2:10}
   
    
    //find a point on the straight line joining the two molecules and rotate it by 90
	var tPoint1 = computeCtrl1(x1,y1,x2,y2,ratio,90);
    var tPoint2 = computeCtrl2(x1,y1,x2,y2,ratio,40);
    //find control points for the bezier curve
    var ctrl1 = computeCtrl1(tPoint1.x,tPoint1.y,tPoint2.x,tPoint2.y);
    var ctrl2 = computeCtrl2(tPoint1.x,tPoint1.y,tPoint2.x,tPoint2.y);

    var tPath = ["M"+tPoint1.x+" "+tPoint1.y+"C"+ctrl1.x+" "+ctrl1.y+" "+ctrl2.x+" "+ctrl2.y+" "+tPoint2.x+" "+tPoint2.y];

    return tPath;
	}
    
    function getPointDistance(p0, p1){

        return (Math.sqrt(Math.pow((p0.x-p1.x),2)+Math.pow((p0.y-p1.y),2)));
    }

    function findMinDistance(point,selector){
        var temp,
        minDist=Number.MAX_VALUE;
        var path=d3.select("#"+selector).select(".path"); //check this
        
        for(var i=0;i<path.node().getTotalLength();i++){
            temp = path.node().getPointAtLength(i);
            curr = getPointDistance(point,temp);
            // console.log("distance from point "+ point.x +" point.y "+point.y+"reaction is point  "+temp.x+" temp y "+temp.y);
            if(curr<minDist){
                minDist = curr;
            }
        }
        
        return minDist;
    }

	this.addReaction = function (id1,id2,rateConst){
		var obj1 = d3.select("#"+id1),
		obj2=d3.select("#"+id2),
		paths=rctPath(obj1,obj2),
		id="GL_"+id1+"_"+id2,
        enzyme=0,
        totalLength=0;

        if(d3.select("#"+id1).attr("type")=="enzyme"){ //reaction between a reaction and an enzyme
           d3.select("#"+id2).attr("enzyme",id1);
        } 

        if(rateConst==null){
            rateConst=0.0;
        }
        
        var group=d3.select("."+groupSelector)
        			.append("g")
        			.attr("id", id)
                    .attr("type","reaction")
                    .attr("class","reaction")
                    .attr("from",id1)
                    .attr("to",id2)
                    .attr("enzyme",enzyme)
                    .attr("rateConst",rateConst);

        /*path for the reaction*/
        var path = group                     
        			.append("path")
        			.attr("d",paths.path)
        			.attr("class","path");

        /*grow the line */
        totalLength=path.node().getTotalLength();
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .duration(700)
            .ease("cubic")
            .attr("stroke-dashoffset", 0)
            .each("end",function(){
                d3.select(this).attr("marker-end","url(#arrowHead)");
            });

        /* path for the text*/	
        if(rateConst!=-1){		
            var tPath=group                     
            			.append("path")
            			.attr("d",paths.tPath)
            			.attr("id","TP_"+id1+"_"+id2)
            			.attr("class","tPath");
                        
            			
            
            var rateText= group
            		.append("text")
                    .attr("class","rateText")
            		.append("textPath")
            		.attr("xlink:href","#TP_"+id1+"_"+id2)
                    .attr("startOffset","35%")
                    .attr("text-anchor","middle")
                    .text(rateConst);
        }
                
     	
		return id;
	}

	this.findClosestReaction=function(point){
        var currDist=0,
            currId=-1,
            buffer=10,
            minRct=Number.MAX_VALUE,
            reactionSelected=0;
            

        var reactions=(d3.selectAll(".reaction"))[0];
        console.log(reactions);
        for(var i=0;i<reactions.length;i++){
            currId=d3.select(reactions[i]).attr("id");
            if(!bindingManager.isBoundComponent(currId)){
                currDist = findMinDistance(point,currId);
                if(currDist<buffer && currDist<minRct){
                    minRct=currDist;
                    reactionSelected=currId;
                }
            }
        }
        console.log(minRct);
        return {id:reactionSelected,dist:minRct};
    }

    this.move = function(){
        var reactions=d3.selectAll(".reaction")[0],
        path,tPath,currReaction,to,from,rateConst;
        
        for(var i=0;i<reactions.length;i++){
            currReaction=d3.select(reactions[i]);
            to=currReaction.attr("to");
            from=currReaction.attr("from");
            rateConst=currReaction.attr("rateConst");
            paths=rctPath(d3.select("#"+from),d3.select("#"+to));
            
            currPath=d3.select(currReaction.select(".path")[0][0]);
            currPath.remove();
             
            newPath=currReaction.append("path")
                    .attr("d",paths.path)
                     .attr("class","path")
                     .attr("marker-end","url(#arrowHead)");
            
         
            if(rateConst!=-1){
                currTPath=d3.select(currReaction.select(".tPath")[0][0]).remove();
                currText=d3.select(currReaction.select(".rateText")[0][0]).remove();
               
                currReaction.append("path")
                        .attr("d",paths.tPath)
                        .attr("class","tPath")
                        .attr("id","TP_"+to+"_"+from)
                        .attr("startOffset","25%");

                currReaction.append("text")
                    .attr("class","rateText")
                    .append("textPath")
                    .attr("xlink:href","#TP_"+to+"_"+from)
                    .attr("text-anchor","middle")
                    .text(rateConst);
            }       

        }

    }

    this.reactionExists=function(id1,id2){
        var reaction=d3.select(".reaction[from="+id1+"][to="+id2+"]")[0][0];
        if(reaction!=null) return true;
        return false;

    }

	this.updateManager=function(selector){
		var update={},
		reaction=d3.select("#"+selector);

		update.select=function(){
			if(reaction!=null){
				reaction.classed("selected",true);
			}
            return update;
		}

		update.unselect=function(){
			if(reaction!=null){
				reaction.classed("selected",false);
			}
            return update;
		}
		

        update.changeRate=function(newRate){
            if(reaction==null){
                return;
            }
            /*reaction.select("text")
                     .select("textpath")
                     .append("text",newRate);

           */
            console.log(reaction.select("text").select("textpath"));
            reaction.attr("rateConst",newRate)
            console.log("rate changed to "+newRate);
            return update;
        }

        update.delete=function(){
            reaction.remove();
            return;
        }

		return update;
	}

	return this;
}

