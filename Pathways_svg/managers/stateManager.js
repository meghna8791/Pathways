var manageState = function(){
	var mapping=["Data","Model","CSV","RMS","Molecule","Enzyme","MolOverview","MolConc","MolGraph","MolEquation","EnzOverview","EnzConc","RctOverview","RctRate","MolConcSelected","EnzConcSelected","RctRateSelected","Direction","SelectCSV","Play","Stop","Quit","Reaction","MolGraphSelected","RMSSelected"],
	manager={},
	state=[],
	cubeTouch=[{}], //to keep track of which two cubes touched together
	needOnTable=[];// all states which need the cube to be on the table
	
	var Node=function(name,parent){
		this.name=name;
		this.parent=parent;
		this.firstChild=null;
		this.lastChild=null;
		this.nextSibling=null;
		this.prevSibling=null;
	}

	Node.prototype.addChildren=function(children){
		var child;
		for(var i=0;i<children.length;i++){
			child=children[i];
			child.parent=this;
			child.prevSibling=this.lastChild;
			if(this.lastChild!=null){
				this.lastChild.nextSibling=child;
			}
			if(this.firstChild==null){
				this.firstChild=child;
			}
			   this.lastChild=child
			}
	}

	function getChildren(nodes){
		var children=[],
			currNode=nodes.firstChild;
			
		while(currNode!=null){
			children.push(currNode);
			currNode=currNode.nextSibling;
				
		}
			
		return children;
	}

	function isChildOf(pState,state){	//check this
		var children=getChildren(pState);
		if(children.indexOf(state)!=-1) return true;
		return false;
	}

    var root=new Node("Root",null),
		 model=new Node("Model",null),
	     data=new Node("Data",null),
		 molecule=new Node("Molecule",null),
		 //moleculeSimulating=new Node("Molecule",null),
		 enzyme=new Node("Enzyme",null),
		 //enzymeSimulating=new Node("Enzyme",null),
		 reaction=new Node("Reaction",null),
		 //reactionSimulating=new Node("Reaction",null),
		 csv=new Node("CSV",null),
		 selectCSV=new Node("SelectCSV",null),
		 rms=new Node("RMS",null),
		 rmsSelected=new Node("RMSSelected",null),
		 molOverview=new Node("MolOverview",null),
		 molConc=new Node("MolConc",null),
		 molConcSelected=new Node("MolConcSelected",null),
		 molGraph=new Node("MolGraph",null),
		 molEquation=new Node("MolEquation",null),
		 enzOverview=new Node("EnzOverview",null),
		 enzConc=new Node("EnzConc",null),
		 enzConcSelected=new Node("EnzConcSelected",null),
		 rctOverview=new Node("RctOverview",null),
		 rctRate=new Node("RctRate",null),
		 rctRateSelected=new Node("RctRateSelected",null),
		 molGraphSelected=new Node("MolGraphSelected",null),
		 direction=new Node("Direction",null),
		 play=new Node("Play",null),
		 stop=new Node("Stop",null),
		 quit=new Node("Quit",null);
		
		root.addChildren([data,model,quit]);
		data.addChildren([csv]);
		csv.addChildren([selectCSV]);
		selectCSV.addChildren([rms]);
		rms.addChildren([rmsSelected]);
		model.addChildren([molecule,enzyme,reaction]);
		molecule.addChildren([molOverview,molConc,molGraph,molEquation]);
		//moleculeSimulating.addChildren([molOverview,molGraph,molEquation]);
		molConc.addChildren([molConcSelected]);
		enzyme.addChildren([enzOverview,enzConc]);
		//enzymeSimulating.addChildren([enzOverview]);
		enzConc.addChildren([enzConcSelected]);
		reaction.addChildren([rctOverview,rctRate]);
		//reactionSimulating.addChildren([rctOverview]);
		rctRate.addChildren([rctRateSelected]);
		molGraph.addChildren([molGraphSelected]);
		play.addChildren([stop]);

		needOnTable=["Molecule","Enzyme","Reaction","MolConc","MolGraph", "EnzConc","RctRate","RMS","CSV","SelectCSV","MolEquation"];

	//state Array
	for(var i=0;i<numCubes;i++){
		cubeTouch[i]={cubeId:-1,prevState:null};
		if(i==0){state[i]=play;}
		else{
	    	state[i]=root.firstChild;
	    }
	    dataToSend = {type:"SetState",cubeId:i,state:mapping.indexOf(state[i].name)};
	    socket.emit("SetState",dataToSend);
	}

	manager.mapping=function(state){
		return mapping.indexOf(state);
	}

	manager.getState=function(cubeId){
		return state[cubeId];
	}

	manager.onTilt=function(cubeId,tiltValue){
		var changed=false,
		dataToSend,
		nextState=0,
		cmpId1,cmp1,
		cmpId2,cmp2;
		
		if(tiltValue==1){  //right tilt->prev state
			if(state[cubeId].prevSibling!=null){
				state[cubeId]=state[cubeId].prevSibling;
                changed=true;
            }

            //creating a reaction
            if(state[cubeId].name=="Direction" && cubeTouch[cubeId].cubeId<0){
            	cmpId1=bindingManager.getBinding(cubeId);
        		cmpId2=bindingManager.getBinding(-cubeTouch[cubeId].cubeId);
        		if(!reactionManager.reactionExists(cmpId1,cmpId2)){
	        		reactionManager.addReaction(cmpId1,cmpId2,0.2);
	        	}

        	}
           
        }else if(tiltValue==255){ //left tilt->next state
        	if(state[cubeId].nextSibling!=null){
				state[cubeId]=state[cubeId].nextSibling;
             	changed=true;
            }

            //creating a reaction
            if(state[cubeId].name=="Direction" && cubeTouch[cubeId].cubeId>0){ //need to solve this problem for case of 0
				cmpId1=bindingManager.getBinding(cubeId),
        		cmpId2=bindingManager.getBinding(cubeTouch[cubeId].cubeId);
        		if(!reactionManager.reactionExists(cmpId1,cmpId2)){
	        		reactionManager.addReaction(cmpId1,cmpId2,0.2);
	        	}
        	}
            
		}
		if(changed){
			nextState=mapping.indexOf(state[cubeId].name);
			dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
            socket.emit("SetState",dataToSend);
		}
        return;

	}

	manager.onTouch=function(cubeId){
		var nextState=null,
		   dataToSend,
		   sid,
		   tuioObject,
		   cmpId,cmp,type,
		   cx,cy,
		   moleId,
		   toBind=false,	//to create a binding
		   intVal,decVal,conc,
		   sendConc=false,	//to send conc
		   toChange=false; //to go to the firstChild

		sid=findSymbolId(cubeId);
        tuioObject = getTuioObject(sid);

        
       	if(needOnTable.indexOf(state[cubeId].name)==-1){
        	
        	if(state[cubeId].name=="Quit"){
				dataToSend = {type:"QuitApp"};
		        socket.emit("QuitApp");
        	}
        	
        	if(state[cubeId].name=="Play"){
		        		simulating=true;
						ODEManager.simulate();
		        		
		    }
			if(state[cubeId].name=="Stop"){
		        		simulating=false;
		        		state[cubeId]=play;
						nextState=mapping.indexOf(state[cubeId].name);
						dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
			    		socket.emit("SetState",dataToSend);
		        		
		    }
	      
		    if(state[cubeId].firstChild!=null){
				state[cubeId]=state[cubeId].firstChild;
				nextState=mapping.indexOf(state[cubeId].name);
				dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
			    socket.emit("SetState",dataToSend);
		    
		   	}
		   	
			return;

		}


	    if(tuioObject!=null){

			cmpId=TuioManager.overWhichElement(tuioObject);
        	if(!simulating){
        		if(state[cubeId].name=="MolConc" || state[cubeId].name=="EnzConc"){
			    	cmp=d3.select("#"+bindingManager.getBinding(cubeId));
				    conc=cmp.attr("conc");
				    sendConc=true;
				   
				}else if(state[cubeId].name=="RctRate"){
					console.log(bindingManager.getBinding(cubeId));
					cmp=d3.select("#"+bindingManager.getBinding(cubeId));
			    	
			    	conc=cmp.attr("rateConst");
			    	sendConc=true;
			    	
				}else if(cmpId!=null){ //if a component below the marker bind it
	        		if(!bindingManager.isBoundComponent(cmpId)){
						cmp=d3.select("#"+cmpId);
		        		type=cmp.attr("type");
						if(state[cubeId].name=="Molecule" && type=="molecule"){
							moleculeManager.updateManager(cmpId)
												.select();

							toBind=true;
							sendConc=true;
							conc=cmp.attr("conc");
			        	}else if(state[cubeId].name=="Enzyme" && type=="enzyme"){
			        		enzymeManager.updateManager(cmpId)
												.select();
							toBind=true;
							sendConc=true;
							conc=cmp.attr("conc");
			        	}else if(state[cubeId].name=="Reaction" && type=="reaction"){
			        		
			        		console.log("To bind with  "+cmpId);
			        		if(cmp.attr("rateConst")!=-1){ //cannot modify reaction from enzyme to reaction
				        		reactionManager.updateManager(cmpId)
													.select();
								toBind=true;
								sendConc=true;
								conc=cmp.attr("rateConst");
								console.log("reaction const "+conc);
							}
			        	}
			        }
	        	}else{//make a new component
	        		cx=tuioObject.getScreenX(screenW);
	        		cy=tuioObject.getScreenY(screenH);
	        		if(state[cubeId].name=="CSV"){
	        			csvManager.drawCSV({x:cx,y:cy});
	        			toBind=true;
	        			
		        	}else if(state[cubeId].name=="SelectCSV"){
		        		expData=csvManager.setCurrCSV();
		        	}else if(state[cubeId].name=="Molecule"){
		        		if(count==0){
							cmpId = moleculeManager.addMole({x:cx,y:cy},50.0);
							conc=50;count++;}else{
		        		cmpId = moleculeManager.addMole({x:cx,y:cy},0.0); //temp later we will send the title from here
		        		conc=0.0;
						
		        		}
		        		toBind=true;
		        		sendConc=true;
						
		        	}else if(state[cubeId].name=="Enzyme"){
		        		cmpId = enzymeManager.addMole({x:cx,y:cy},1.0);
		        		toBind=true;
		        		sendConc=true;
		        		conc=1.0;
		        	}else if(state[cubeId].name=="Reaction"){
		        		return;
		        	}else if(state[cubeId].name=="MolGraph"){
			        		//only if CSV is set

			        		var moleculeName=moleculeManager.getName(bindingManager.getBinding(cubeId));
			        		cmp=d3.select("#SC_"+moleculeName);
			        		//console.log(cmp);
							if(cmp[0][0]==null){
								//alert("yo");
				        		cmpId=scatterPlotManager.createScatterPlot(csvManager.getExpData(), ODEManager.getSimData(),{x:cx,y:cy},moleculeName);
				        		d3.selectAll(".scatterPlot").selectAll("text").style("fill","white");
				        	}else{
				        		cmpId=cmp.attr("id");
				        	}
				        	//bindingManager.removeBinding(cubeId);
			        		toBind=true;
			        }
		        	
	        	}
       	 	}else{ //simulating
       	 			if(cmp!=null){//bind
	       	 			cmp=d3.select("#"+cmpId);
		        		type=cmp.attr("type");
	       	 			if(state[cubeId].name=="Molecule" && type=="molecule"){
							moleculeManager.updateManager(cmpId)
												.select();
							//state[cubeId]=moleculeSimulating;
							toBind=true;
			        	}else if(state[cubeId].name=="Enzyme" && type=="enzyme"){
			        		enzymeManager.updateManager(cmpId)
												.select();
							//state[cubeId]=enzymeSimulating;
							toBind=true;
			        	}else if(state[cubeId].name=="Reaction" && type=="reaction"){
			        		reactionManager.updateManager(cmpId)
			        						.select();
			        		//state[cubeId]=reactionSimulating;
			        		toBind=true;

			        	}
	       	 			if(state[cubeId].name=="MolGraph" && type=="molGraph"){
			        		toBind=true;
			        	}else if(state[cubeId].name=="RMS" && type=="rms"){
			        		toBind=true;
			        	}
	       	 		}else{//create new
	       	 			if(state[cubeId].name=="MolGraph"){
			        		//only if CSV is set
			        		var moleculeName=moleculeManager.getName(bindingManager.getBinding(cubeId));
			        		cmpId=scatterPlotManager.createScatterPlot(temp, ODEManager.getSimData(),{x:cx,y:cy},moleculeName);
			        		toBind=true;
			        	}else if(state[cubeId].name=="RMS"){
			        		//only if CSV has been set
			        		//calculate RMS
			        		cmpId=radialGraphManager.createRadialGraph({x:cx,y:cy});
			        		toBind=true;
			        	}

       	 			}

       	 	}
       	 	if(toBind){
       	 		//bind it to the sifteo cube and fiducial marker
		        bindingManager.createBinding(cubeId,cmpId);
		        console.log("binding between "+cubeId+" and "+cmpId);
		    }
		    
		    if(state[cubeId].firstChild!=null){
					state[cubeId]=state[cubeId].firstChild;
					nextState=mapping.indexOf(state[cubeId].name);
					dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
				    socket.emit("SetState",dataToSend);
			}
			
			if(sendConc){
					intVal=Math.floor(conc);
				    decVal=(conc-intVal)*10;
				    dataToSend = {cubeId:cubeId,integral:intVal, decimal:decVal};
		            socket.emit("New Concentration",dataToSend);
		            console.log("initial Concentration is "+decVal);
			}
       	 	

       	 	return;
    	}


        
       
		
	}

	manager.onShake=function(cubeId){//change the state to the parent
		/*delete the entry for that cube from the bindings array - search by cubeId 
        if the cube is bound then unselect it and remove the binding with that molecule*/

		var dataToSend,
		cmp,cmpId,conc;

		//if state is direction go back to the previous state for both the cubes
		/*if(state[cubeId].name=="Direction"){

			state[cubeId]=cubeTouch[cubeId].prevState;
			nextState=mapping.indexOf(state[cubeId]);
			dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
	        socket.emit("SetState",dataToSend);
	        cmpId=bindingManager.getBinding(cubeId);
	        cmp=d3.select("#"+cmpId);
	        conc=cmp.attr("conc");
	       	dataToSend = {cubeId:cubeId,integral:Math.floor(conc), decimal:(conc-Math.floor(conc))*10};
            socket.emit("New Concentration",dataToSend);
	        

	        cubeId2=Math.abs(cubeTouch[cubeId].cubeId);
	        state[cubeId2]=cubeTouch[cubeId2].prevState;
	        nextState=mapping.indexOf(state[cubeId2]);
	        dataToSend = {type:"SetState",cubeId:cubeId2,state:nextState};
	        socket.emit("SetState",dataToSend);
	        cmpId=bindingManager.getBinding(cubeId2);
	        cmp=d3.select("#"+cmpId);
	        conc=cmp.attr("conc");
	      	dataToSend = {cubeId:cubeId2,integral:Math.floor(conc), decimal:(conc-Math.floor(conc))*10};
            socket.emit("New Concentration",dataToSend);
            
            cubeTouch[cubeId]={cubeId:-1,prevState:null};
            cubeTouch[cubeId2]={cubeId:-1,prevState:null};

            
		}*/
			
		//if bound unbind it ---> if bound the state will be a child of Molecule/Enzyme/Reaction
	    if(bindingManager.isBoundCube(cubeId) && (isChildOf(molecule,state[cubeId])||isChildOf(enzyme,state[cubeId])||isChildOf(reaction,state[cubeId]))){
	       	cmpId=bindingManager.getBinding(cubeId);
			cmp=d3.select("#"+cmpId);
			if(cmp.attr("type")=="molecule"){moleculeManager.updateManager(cmpId).unselect();}
			else if(cmp.attr("type")=="enzyme"){enzymeManager.updateManager(cmpId).unselect();}
	        else if(cmp.attr("type")=="reaction"){reactionManager.updateManager(cmpId).unselect();}
	        else if(cmp.attr("type")=="csv"){csvManager.undrawCSV();}
	        bindingManager.removeBinding(cubeId);
	        //only possible when id =M_Name
	       
		}

		if(state[cubeId].name=="Direction"){
			cmpId=bindingManager.getBinding(cubeId);
			cmp=d3.select("#"+cmpId);
			if(cmp.attr("type")=="molecule"){moleculeManager.updateManager(cmpId).unselect();}
			else if(cmp.attr("type")=="enzyme"){enzymeManager.updateManager(cmpId).unselect();}
	       	bindingManager.removeBinding(cubeId);

			state[cubeId]=root.firstChild;
			nextState=mapping.indexOf(state[cubeId]);
			dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
	        socket.emit("SetState",dataToSend);

			return;

		}

		if(state[cubeId].name=="MolGraphSelected"){
			cmpId=bindingManager.getBinding(cubeId);
			cmp=d3.select("#"+cmpId);
			if(cmp.attr("type")=="scatterPlot"){
				var moleName=cmp.attr("molecule"); 
				var moleId="M_"+moleName; 
				bindingManager.createBinding(cubeId,moleId); console.log("binding between "+cubeId+" and "+moleId);} 
	        
		}

	   	if(state[cubeId].parent!=null & state[cubeId].parent.name!="Root"){

			state[cubeId]=state[cubeId].parent;
			nextState=mapping.indexOf(state[cubeId].name);
			dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
	        socket.emit("SetState",dataToSend);
	     }
    }

	manager.onDoubleTouch=function(cubeId){ //delete the molecule with which it is bound
		/*delete the component
		send the sifteo cube to go to the parent*/
		var cmpId=bindingManager.getBinding(cubeId);
		var cmp;
	
		//testing
		if(cmpId!=-1){
			cmp=d3.select("#"+cmpId);
			//if Molecule delete all reactions connected
			if(cmp.attr("type")=="molecule"){moleculeManager.updateManager(cmpId).deleteReactions();}

			cmp.transition()
				.duration("500")
				.style("opacity","0")
				.ease("sin")
				.each("end",function(){
					d3.select(this).remove();
				});
					
			bindingManager.removeBinding(cubeId);
			//only Possible when moleId=M_Name
			if(cmp.attr("type")=="scatterPlot"){var moleName=cmp.attr("key"); var moleId="M_"+moleName; bindingManger.createBinding(cubeId,moleId); } 
	        
		}
		//end of test
		if(state[cubeId].parent!=null){
			state[cubeId]=state[cubeId].parent;
			nextState=mapping.indexOf(state[cubeId].name);
			dataToSend = {type:"SetState",cubeId:cubeId,state:nextState};
	        socket.emit("SetState",dataToSend);
    	}
	}

	manager.onCubesTouch=function(cubeId1,cubeId2,side1,side2){
		/*create reaction between two molecules or reaction and enzyme*/
		/*for direction touch then tilt */
		
        if(bindingManager.isBoundCube(cubeId1) && bindingManager.isBoundCube(cubeId2)){
        	
        	var cmpId1=bindingManager.getBinding(cubeId1),
        		cmpId2=bindingManager.getBinding(cubeId2),
        		type1=d3.select("#"+cmpId1).attr("type"), //check if class can make do instead of adding one more attr-type
        		type2=d3.select("#"+cmpId2).attr("type"),
        		cmp1,cmp2,
        		fromId,
        		toId;
            	
            if((type1=="enzyme" && type2=="reaction")||(type1=="reaction" && type2=="enzyme")){
            	if(type1=="enzyme"){
            	 	fromId=cmpId1;
            	 	 toId=cmpId2;
            	 }else{
            	 	fromId=cmpId2; 
            	 	toId=cmpId1;
            	 }

            	if(!reactionManager.reactionExists(fromId,toId)){
	            	reactionManager.addReaction(fromId,toId,-1);
		        		cmp1=d3.select("#"+fromId); //an enzyme
		        		cmp2=d3.select("#"+toId); //a reaction
		        		//cmp2 is a reaction
		        		cmp2.attr("enzyme",cmpId1);
		        }
	        	
            }else if(type1=="molecule" && type2=="molecule"){
        		//if(side1>side2) console.log("side 1 "+(side1)+" side2 "+side2);
        		
        		cubeTouch[cubeId1].cubeId=(side1>side2)?-cubeId2:cubeId2; //negative means it has to be tilted right to create reaction
        		cubeTouch[cubeId1].prevState=state[cubeId1];

        		cubeTouch[cubeId2].cubeId=(side2>side1)?-cubeId1:cubeId1;
        		cubeTouch[cubeId2].prevState=state[cubeId2];


        		//console.log("cubeId1 "+cubeTouch[cubeId1].prevState.name+" and 2 is "+cubeTouch[cubeId2].prevState.name);
        		state[cubeId1]=direction;
        		state[cubeId2]=direction;
        		nextState=mapping.indexOf(state[cubeId1].name);
				dataToSend = {type:"SetState",cubeId:cubeId1,state:nextState};
			    socket.emit("SetState",dataToSend);
			    nextState=mapping.indexOf(state[cubeId2].name);
			    dataToSend = {type:"SetState",cubeId:cubeId2,state:nextState};
			    socket.emit("SetState",dataToSend);
			}
       	}
    }

	return manager;
};
