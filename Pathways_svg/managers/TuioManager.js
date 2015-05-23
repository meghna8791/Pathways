// JavaScript Document
 
var TuioClient = (function(){
//public
var stub;
//private
var _client,
objSize = 50;

//pointer
var cubePointer=[]; 
var objects;


          var init = function(){
          
            _client = new Tuio.Client({
                host: "http://localhost:5000"
            }),
            screenW = $(window).innerWidth();
            screenH = $(window).innerHeight();
            
            _client.on("connect", onConnect);
            _client.on("addTuioCursor", onAddTuioCursor);
            _client.on("updateTuioCursor", onUpdateTuioCursor);
            _client.on("removeTuioCursor", onRemoveTuioCursor);
            _client.on("addTuioObject", onAddTuioObject);
            _client.on("updateTuioObject", onUpdateTuioObject);
            _client.on("removeTuioObject", onRemoveTuioObject);
            _client.on("refresh", onRefresh);
            _client.connect();

            for(var i=0;i<numCubes;i++){
              cubePointer[i]=d3.select(".cubePointerGroup").append("circle")
                            .attr("class","cubePointer")
                            .attr("r",0)
                            .attr("x",0)
                            .attr("y",0);
            }
           

           };

          var onConnect = function() {
                console.log("onConnect");
                //for Molecule 2 
          };

           var onAddTuioCursor = function(addCursor) {
                
               // window.alert("Cursor added ");
            };

            var onUpdateTuioCursor = function(updateCursor) {
               
            };

            var onRemoveTuioCursor = function(removeCursor) {
                
            };

            var onAddTuioObject = function(addObject) {
              /* check if the fiducial marker moved is bound 
                    if yes , move/change conc of the molecule attached
                    else, don't do anything
              */
              var cubeId,
                compId,
                intVal,
                decVal,
                dataToSend,
                textChanged=false,
                newPos={},
                angle;
             
                console.log(getAngleRounded(addObject)+" and angle is "+addObject.getAngle());
                
                /*update the pointers*/
                console.log(addObject.getSymbolId());
                if(cubeFiducial.indexOf(addObject.getSymbolId())!=-1){
                cubePointer[cubeFiducial.indexOf(addObject.getSymbolId())].transition()
                               .attr("transform","translate("+addObject.getScreenX(screenW)+","+addObject.getScreenY(screenH)+")")
                               .attr("r",10);
                }
                                                                
              cubeId=bindingManager.isBoundFiducial(addObject.getSymbolId());
              if(cubeId!=-1){
                compId=bindingManager.getBinding(cubeId);
                angle=getAngleRounded(addObject);
                intVal = Math.floor(angle);
                decVal = (angle-intVal)*10;
                if(isRotating(addObject)){
                  if(stateManager.getState(cubeId).name=="MolConcSelected"){
                      moleculeManager.updateManager(compId)
                                      .changeConc(angle);
                      textChanged=true;
                  }else if(stateManager.getState(cubeId).name=="EnzConcSelected"){
                      enzymeManager.updateManager(compId)
                                      .changeConc(angle);
                      textChanged=true;
                  }else if(istateManager.getState(cubeId).name=="RctRateSelected"){
                      reactionManager.updateManager(compId)
                                      .changeRate(angle);
                      textChanged=true;
                  }
                  if(textChanged){
                    dataToSend = {cubeId:cubeId,integral:intVal, decimal:decVal};
                    socket.emit("New Concentration",dataToSend);
                  }
                }


                /*if(isMoving(addObject)){
                  newPos.x=screenW-addObject.getScreenX(screenW);
                  newPos.y=addObject.getScreenY(screenH)
                  if(stateManager.getState(cubeId).name=="MolOverview"){
                     moleculeManager.updateManager(compId)
                                      .move(newPos);
                  }else if(stateManager.getState(cubeId).name=="EnzOverview"){
                      enzymeManager.updateManager(compId)
                                      .move(newPos);
                  }else if(stateManager.getState(cubeId).name=="MolGraphSelected"){
                      scatterPlotManager.updateManager(compId)
                                      .move(newPos);
                  }else if(stateManager.getState(cubeId).name=="RMSSelected"){
                     radialGraphManager.updateManager(compId)
                                      .move(newPos);
                  }

                }*/
              }
            console.log(addObject);
            };

            var onUpdateTuioObject = function(updateObject) {
              /* check if the fiducial marker moved is bound 
                    if yes , move the molecule attached
                    else, dont do anything
              */
              var cubeId,
                compId,
                intVal,
                decVal,
                dataToSend,
                textChanged=false,
                newPos={},
                angle;
              
               
                console.log(getAngleRounded(updateObject)+" and angle is "+updateObject.getAngle());
                
                console.log(updateObject.getSymbolId());

                /*update the pointer*/
                if(cubeFiducial.indexOf(updateObject.getSymbolId())!=-1){
                cubePointer[cubeFiducial.indexOf(updateObject.getSymbolId())].transition()
                               .attr("transform","translate("+updateObject.getScreenX(screenW)+","+updateObject.getScreenY(screenH)+")")
                               .attr("r",10);
                }

              cubeId=bindingManager.isBoundFiducial(updateObject.getSymbolId());
              if(cubeId!=-1){
                compId=bindingManager.getBinding(cubeId);
                angle=getAngleRounded(updateObject);
                intVal = Math.floor(angle);
                decVal = (angle-intVal)*10;
                if(isRotating(updateObject)){
                 
                  if(stateManager.getState(cubeId).name=="MolConcSelected"){
                      moleculeManager.updateManager(compId)
                                      .changeConc(angle);
                      textChanged=true;
                  }else if(stateManager.getState(cubeId).name=="EnzConcSelected"){
                      enzymeManager.updateManager(compId)
                                      .changeConc(angle);
                      textChanged=true;
                  }else if(stateManager.getState(cubeId).name=="RctRateSelected"){
                      reactionManager.updateManager(compId)
                                      .changeRate(angle);
                      textChanged=true;
                  }else if(stateManager.getState(cubeId).name=="SelectCSV"){
                      csvManager.nextCSV(updateObject.getAngle());
                  }
                  if(textChanged){
                    dataToSend = {cubeId:cubeId,integral:intVal, decimal:decVal};
                    socket.emit("New Concentration",dataToSend);
                  }
                }

                if(isMoving(updateObject)){
                  newPos.x=updateObject.getScreenX(screenW);
                  newPos.y=updateObject.getScreenY(screenH)
                  if(stateManager.getState(cubeId).name=="MolOverview"){
                     moleculeManager.updateManager(compId)
                                      .move(newPos);
                  }else if(stateManager.getState(cubeId).name=="EnzOverview"){
                      enzymeManager.updateManager(compId)
                                      .move(newPos);
                  }else if(stateManager.getState(cubeId).name=="MolGraphSelected"){
                    scatterPlotManager.updateManager(compId)
                                      .move(newPos);
                  }else if(stateManager.getState(cubeId).name=="RMSSelected"){
                     radialGraphManager.updateManager(compId)
                                      .move(newPos);
                  }

                }

              }
              console.log(updateObject);
            };

            var onRemoveTuioObject = function(removeObject) {
              console.log("removing "+removeObject.getSymbolId());
              /*update the pointer*/
              if(cubeFiducial.indexOf(removeObject.getSymbolId())!=-1){
              cubePointer[cubeFiducial.indexOf(removeObject.getSymbolId())].transition()
                                       .attr("r",0);
              }

            };

            var onRefresh = function(time) {
            };

            //is the given object rotating

            var isRotating = function(object){
                if((object.getTuioState() ==Tuio.Object.TUIO_ROTATING) || (object.getRotationSpeed>0)){
                      return 1;
                }
                return 0;
            }

            var isMoving = function(object){
              if(Tuio.Object.TUIO_ACCELERATING || Tuio.Object.TUIO_DECELERATING){
               
              return 1;}
              else return 0;
            }

            var getAngleRounded = function(object){
              var rad = object.getAngle();

              return radToAbsoluteNum(rad);

              

            }

            var radToAbsoluteNum = function(rad) {
                var value=0;
               
                if(rad>0 && rad<=Math.PI){
                 value=(Math.PI-rad)/Math.PI;
                }else if(rad==0 || rad==2*Math.PI){
                  value=1;
                }else{
                  value=1;
                }
                value = Math.round((1-value) * 10) / 10;
                
                return value;
            }
            

            //detec the element under the cube 
            var overWhichElement = function(object){
             var minMol,
              minRct,
              minEnz,
              minSPlt,
              minRGrph,
              minDist=Number.MAX_VALUE,
              minCmp,
              point={x:(object.getScreenX(screenW)),y:object.getScreenY(screenH)};

              minMol=moleculeManager.findClosestMole(point);
              minRct=reactionManager.findClosestReaction(point);
              minEnz=enzymeManager.findClosestMole(point);
              //minScatter=scatterPlotManager.findClosestScatterPlot(point);
              minRadial=radialGraphManager.findClosestRadialGraph(point);

              if(minMol==null && minRct==null & minEnz==null){
                return null;
              }

              minDist = Math.min(minMol.dist, minEnz.dist, minRct.dist);
              
              console.log("mole "+minMol.dist+" "+minEnz.dist+" "+minRct.dist);
              
              if(minDist==minMol.dist){
                return minMol.id;
              }else if(minDist==minEnz.dist){
                 return minEnz.id;
              }else{
                return minRct.id;
              }
            }
            
            //return the list of objects
            
            var getObjects = function(){
               return  _client.getTuioObjects();

            };

            //get the object with a given sid if it is on the table
            var getTuioObject=function(sid){
            var list = TC.getObjects();
            var found = false;
            for(var i in list){
                var temp = list[i];
                if(list[i].symbolId == sid) {
                    found= true;
                    console.log("found"+sid);
                    break;
                }
            }

            if(found){return list[i];}
            else {return null;}
        }

        

           
            
return stub={
   init : init,
   getObjects :getObjects,
   overWhichElement:overWhichElement
}
});
