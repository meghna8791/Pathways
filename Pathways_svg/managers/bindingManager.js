/*for handling binding with cubes*/
var manageBinding=function(numCube){
	var bindings=[],
	manager={};
	
	for(var i=0;i<numCube;i++){
		bindings[i]=-1;
	}

	manager.createBinding = function(cubeId, componentID){
		bindings[cubeId] = componentID;
		//send the message to the cube
	}

	manager.removeBinding=function(cubeId){
		bindings[cubeId] = -1;
		//send message to sifteo

	}

	manager.getBinding =function(cubeId){
		return bindings[cubeId];
	}

	manager.isBoundCube = function(cubeId){	// merge with getBinding??
		if(bindings[cubeId]!=-1) return true;
		return false;
	}

	manager.isBoundComponent=function(compId){   //return bound cubeId
		if(bindings.indexOf(compId)!= -1) return true;
        return false;
	}

	manager.isBoundFiducial=function(symbolId){
		var cubeId = cubeFiducial.indexOf(symbolId);
        if(bindingManager.isBoundCube(cubeId)) return cubeId ;
        else return -1;
    }

	return manager;
}






