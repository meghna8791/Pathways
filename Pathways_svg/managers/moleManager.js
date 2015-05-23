var manageMole = function(groupSelector,type){ //molecule,enzyme,reactions
	var RADIUS = 35
	BREATHERADIUS=30,
	DY=15,
	count=0,
	molArray=["GLC","G6P","F6P","FBP","DHAP","GLAP","BPG","3PG","2PG","PEP","PYR"],
	enzArray=["HK","PGI","PFK","AL","GH","PGK","PGM","E","PK"],
	molCount=0,
	enzCount=0;

	findDistance = function(point,selector){
		/*var diffX,
            diffY,
            crcle=d3.select("#"+selector).select("circle"); //check this

        diffX = Math.abs(point.x-crcle.attr("cx"));
        diffY=Math.abs(point.y-crcle.attr("cy"));*/
        var diffX,
        diffY,
        mole=d3.select("#"+selector),
        pos=getScreenCoords(selector);

		diffX=Math.abs(point.x-pos.x);
		diffY=Math.abs(point.y-pos.y);
		console.log(Math.sqrt(Math.pow(diffX,2)+Math.pow(diffY,2)));
       	return Math.sqrt(Math.pow(diffX,2)+Math.pow(diffY,2));
    };

	this.addMole=function(center,concentration){
	var title=(type=="enzyme")?(enzArray[enzCount++]):(molArray[molCount++]);
	var id = "M_"+title;
	//this is only temp..as soon s there is a way to name molecules..use the above assignment
	//var id = "M_"+count;
	count++;

	var moleGroup=d3.select("."+groupSelector)
						.append("g")
						.attr("id",id)
						.attr("type",type)
						.attr("class","selected "+type)
						.attr("name",title)
						.attr("conc",concentration)
						.attr("transform","translate("+center.x+","+center.y+")");
	

	var newMole=moleGroup.append("circle")
 						.attr("cx", 0)
 						.attr("cy", 0)
 						.attr("r",0);
 						

 	var moleName=moleGroup.append("text")
 					.attr("x", 0)
 					.attr("y", 0)
 					.attr("text-anchor","middle")
 					.text(title)
 					.attr("class","moleName");

 	var moleConc=moleGroup.append("text")
 					.attr("x", 0)
 					.attr("y", 0)
 					.attr("text-anchor","middle")
 					.attr("dy",DY)
 					.text(concentration)
 					.attr("class","moleConc");

 	//add animation when first made and breathing effect
 	newMole.transition()
 		.attr("r",RADIUS)
 		.duration(1000)
 		.ease("elastic")
 		.each("end",function(){
 			var mole=d3.select(this);
 			mole.attr("r",RADIUS);
 			setInterval(function(){breathe.call(mole)},800)
	});

 	function breathe(){
 		var rad = (this.attr("r")==RADIUS)?BREATHERADIUS:RADIUS;
 			this.transition()
 			.attr("r",rad)
 			.ease("sin");
 		
 	}

 	return id;

	}

	this.getMoles=function(){
		return d3.selectAll("."+type);

	}

	this.findClosestMole = function(point){
		var currDist=0,
			currId=-1,
			minMole = Number.MAX_VALUE ,
            moleSelected = null,
          	buffer=40;
            
        var moles=(d3.selectAll("."+type))[0];
		 
        for(var i=0;i<moles.length;i++){
        	var currId=d3.select(moles[i]).attr("id");
        	if(!bindingManager.isBoundComponent(currId)){
        		currDist=findDistance(point,currId);
        		if(currDist<=(RADIUS+buffer) &&  currDist<minMole){
                      minMole=currDist;
                      moleSelected = currId;
                  }
        	}
        }

       return {dist:minMole, id:moleSelected};
	}

	this.getName=function(moleId){
		var mole=d3.select("#"+moleId);
		return mole.attr("name");
	}

	var getScreenCoords=function(selector){
		var mole=d3.select("#"+selector)
		var x=d3.transform(mole.attr("transform")).translate[0],
		y=d3.transform(mole.attr("transform")).translate[1];
		return {x:x, y:y};
	}

	this.reset=function(){
 		//reset all concentrations to 0 after a simulation
 		var context=this;
 		var molecules=d3.selectAll(".molecule")
 						.each(function(){
 							context.updateManager(d3.select(this).attr("id"))
 									.changeConc(0);
 						});

 						;
 		return;
 			
 	}

	this.updateManager = function(selector){
		var update={},
		mole=d3.select("#"+selector),
		currRct;

		update.move =function(newPos){
			mole
 			.transition()
 			.duration(700)
 			.attrTween("transform",tween)
 			.ease("elastic"); //add the end
 			
 			function tween(){
 				var startX=d3.transform(mole.attr("transform")).translate[0],
					startY=d3.transform(mole.attr("transform")).translate[1];
				var i=d3.interpolateTransform("translate("+startX+","+startY+")", "translate("+newPos.x+","+newPos.y+")");
				var mole1=this;
 				return function(t){
 					d3.select(mole1).attr("transform",i(t));
 					reactionManager.move();
 					return i(t);
 				};
 			}

			return update;
 		}
 			
		update.select=function(){
			if(mole==null){return;}
			mole
 			.classed("selected",true);
 			return update;
 		}

 		update.changeConc=function(newConc){
 			if(mole==null){return;}
 			var moleConc=mole.select(".moleConc");
 			console.log(moleConc);
 			moleConc.text(newConc);
 			mole.attr("conc",newConc);
 			return update;
 		}

		update.deleteReactions=function(){
			if(mole==null){return;}
			//remove all reactions connected to it 
			var reactions=d3.selectAll(".reaction")[0];
			for(var i=0;i<reactions.length;i++){
				currRct=d3.select(reactions[i]);
				 if((currRct.attr("to")==selector)||(currRct.attr("from")==selector)){
					currRct.remove();
				}
			}
			
			return;
 		}
 			
		update.unselect=function(){
			if(mole==null){return;}
 			mole
 			.classed("selected",false);
 				return;
 		}


 		return update;
	}

	return this;
}

