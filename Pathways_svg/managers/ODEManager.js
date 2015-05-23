var manageODE=function(){
	var concVector=[],
		 	ids=[], //["A","B","C"] "A"->0 "B"->1
		 	IN=[],
		 	OUT=[],
		 	simData={};

	var MAX_TIME=9;	
	
	var manager={};

	//ODE functions
	var multArr=function(arr1,arr2){
			var result=0;
			if(arr1.length!=arr2.length) return Number.MATH_VALUE;
			for(var i=0;i<arr1.length;i++){
				result+=arr1[i]*arr2[i];
			}
			return result;
		}

	var multScalar=function(arr,s){
			var result=0;

			for(var i=0;i<arr.length;i++){
				result+=arr[i]*s;
			}

			return result;
		}
			
	var odeFunction=function(t,x){
		//define all equations
		var xNew=[];
		
		for(var i=0;i<x.length;i++){
			xNew[i]=[];
			for(var j=0;j<x.length;j++){
				xNew[i][j]=0;
			}
		}

		for(var i=0;i<x.length;i++){
			xNew[i]=multArr(IN[i],x);
			xNew[i]+=multScalar(OUT[i], x[i])
			}
			return xNew;
		}

	var odeSolver=function(startTime,endTime,startX){

		return numeric.dopri(
				startTime,
				endTime,
				startX,
				odeFunction,
				undefined,
				100);
	}

	//instantiate the simData for each molecule
	/*manager.appendSimData=function(moleculeName){
		simData[moleculeName]=[{}];
		for(var t=0;t<MAX_TIME+1;t++){
			simData[moleculeName][t]=({time:t,conc:0});
		}
		console.log(simData);
	}*/

	//for now
	var expData=csvManager.getExpData();
	for(var moleculeName in expData){
		simData[moleculeName]=[{}];
		for(var t=0;t<MAX_TIME+1;t++){
			simData[moleculeName][t]=({time:t,conc:0});
		}
		console.log(simData);
	}
	
	var update=function(simData,time){
		var newConc,
			moleculeId;

		//update the concentrations 
		for(var i=0;i<ids.length;i++){
			moleculeId=ids[i];
			moleculeName=moleculeManager.getName(ids[i]);
			newConc=simData[moleculeName][time].conc;
			newConc=Math.round(newConc*100)/100;
			moleculeManager.updateManager(moleculeId)
							.changeConc(newConc);

			//update the graphs (if present-> if that molecule conc changed)
			scatterPlotManager.updateManager("SC_"+moleculeName)
								.changeValues(simData,moleculeName);	
			
			console.log(simData);		
		}

	}

	function calcRMS(expData,simData){
		//RMSformat=[{"Mole":"A","RMS":0.1},{"Mole":"B", "RMS":0.3},{"Mole":"C", "RMS":0.5},{"Mole":"D", "RMS":0.7}];
		//{"A":[{"time":0,"conc":"0.1"},{"time":1,"conc":"0.2"},{"time":2,"conc":"0.3"},{"time":3,"conc":"0.4"}],};
		var RMS=[{}],
		name,
		temp,
		simArr,expArr,
		yMax=Number.MIN_VALUE,
		yMin=Number.MAX_VALUE;

		for(var i=0;i<ids.length;i++){
			//make sure the time steps are consistent
			moleculeName=moleculeManager.getName(ids[i]);
			RMS[i]={};
			RMS[i].Mole=moleculeName;
			temp=0;
			expArr=expData[moleculeName];
			simArr=simData[moleculeName];
			for(var t=0;t<simArr.length;t++){
				if(simArr[t].conc<yMin) yMin=simArr[t].conc;
				if(simArr[t].conc>yMax) yMax=simArr[t].conc;
				temp+=Math.pow((expArr[t].conc-simArr[t].conc),2);
			}
			
			RMS[i].RMS=(Math.sqrt(temp/simArr.length))/(yMax-yMin);
			
		}
		console.log(RMS);
		return RMS;

	}
		
	manager.getSimData=function(){
		return simData;
	}	

	 manager.simulate=function(){
		var molecules=d3.selectAll(".molecule")[0],
		reactions=d3.selectAll(".reaction")[0],
		currMolecule,currReaction,
		to,from,enzyme,
		rel;
		

		var moleculeName;

		console.log("simulating");
		//define the concentration marix	 	
		for(var i=0;i<molecules.length;i++){
			 	currMolecule=d3.select(molecules[i]);
				concVector[i]=parseFloat(currMolecule.attr("conc"));
				ids[i]=currMolecule.attr("id");
		}
			 	
		console.log(concVector);

		//define the IN and OUT matrix
		
		for(var i=0;i<ids.length;i++){
			IN[i]=[];
			OUT[i]=[];
			for(var j=0;j<ids.length;j++){
				IN[i][j]=0;
				OUT[i][j]=0;
			}
		}
			

		for(var i=0;i<reactions.length;i++){
			currReaction=d3.select(reactions[i]);
			to=currReaction.attr("to");
			from=currReaction.attr("from");
			fromId=ids.indexOf(from);
			toId=ids.indexOf(to);
			//both should be molecules
			if(fromId!=-1 && toId!=-1){	
				enzymeId=currReaction.attr("enzyme");
				enzyme=(enzymeId==0)?1:d3.select("#"+enzymeId).attr("conc"); //default value 1 of enzyme to multiply
				rateConst=parseFloat(currReaction.attr("rateConst"));
				IN[toId][fromId]=rateConst*enzyme;
				OUT[fromId][toId]=-rateConst*enzyme;
				console.log("enzyme "+enzyme);
			}

		}

		//solve ODE
		sol=odeSolver(0,100,concVector);
		var t=0;
		//for(var t=0;t<MAX_TIME+1;t++){ //check if simulating everytime
		var run=setInterval(function(){
				if(t==MAX_TIME+1) {clearInterval(run);}
				if(simulating){
				rel=sol.at(t);
				console.log(rel);
				time=t;
				//add to simData
				//Format:{"A":[{"time":0,"conc":"0.1"},{"time":1,"conc":"0.2"},{"time":2,"conc":"0.3"},{"time":3,"conc":"0.4"}],};
				
				for(var index=0;index<rel.length;index++){
					moleculeName=moleculeManager.getName(ids[index]);
					if(t==0){
						simData[moleculeName]=[{}];
					}
					simData[moleculeName][t]=({time:time,conc:rel[index]});
					if(t==MAX_TIME){
					
					//change the state from stop to play
					//calculate rms error and popup the radial chart
					console.log(simData);
					
					var RMS=calcRMS(csvManager.getExpData(),simData);
					radialGraphManager.createRadialGraph(RMS,{x:300,y:300});
					//reset all concentrations
					moleculeManager.reset();
					//change the state to play 
					//TODO: make this cubeId dynamic 
					stateManager.onShake(0);			
					simulating=false;
					}
				}
				
				update(simData,t);
				t++;
			}
		},500);
			
		//}
			
	}
	return manager;
}

