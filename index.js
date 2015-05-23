var app  = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usb= require('usb');
var user = 0;


//socket connection


io.on('connection',function(socket){
 	 user++;
 	console.log('a user is connected'+user);
	 io.emit('connected','a user is connected');
 	socket.on('disconnect',function(){
		console.log('a user is disconnected');
 	});
 	socket.on('New Concentration',function(msg){
		console.log('message'+msg);
	
	
		var sifteoMessage = Uint8Array(19);
		//sifteo header
	    sifteoMessage[0] = 0;
		sifteoMessage[1] = 0;
		sifteoMessage[2] = 0;
		sifteoMessage[3] = 112;

		//message type
		sifteoMessage[4] = 1;  //equal to message[0]

		sifteoMessage[5] =msg.cubeId; //cube id

		//message PARAM Length = 4 for now
		sifteoMessage[6] = 3; 

		//value of param
		
		sifteoMessage[7] = msg.integral;
		sifteoMessage[8]=99;
		sifteoMessage[9]=msg.decimal;
		

		sendToSifteo(sifteoMessage);
	    console.log("sent message to sifteo"+msg.cubeId+" "+msg.integral+"decimal"+msg.decimal);
 	});
 	socket.on('Binding',function(msg){
 		var sifteoMessage = Uint8Array(19);
		//sifteo header
	    sifteoMessage[0] = 0;
		sifteoMessage[1] = 0;
		sifteoMessage[2] = 0;
		sifteoMessage[3] = 112;

		//message type
		sifteoMessage[4] = 2;

		//cubeId
		sifteoMessage[5] = msg.cubeId;

		//message Param Length = 1
		sifteoMessage[6] = 2;

		//value for param

		sifteoMessage[7] = msg.elementType;
		sifteoMessage[8] = msg.integral;
		sifteoMessage[9] = msg.decimal;

		sendToSifteo(sifteoMessage);
		console.log("sent message to sifteo"+ sifteoMessage);

		
 	});

 	socket.on('Unbinding',function(msg){
 		var sifteoMessage = Uint8Array(19);
		//sifteo header
	    sifteoMessage[0] = 0;
		sifteoMessage[1] = 0;
		sifteoMessage[2] = 0;
		sifteoMessage[3] = 112;

		//message type
		sifteoMessage[4] = 2;

		//cubeId
		sifteoMessage[5] = msg.cubeId;

		//message Param Length = 1
		sifteoMessage[6] = 1;

		sendToSifteo(sifteoMessage);
		console.log("sent message to sifteo"+ sifteoMessage);

		
 	});

 	socket.on('SetState', function(msg){
 		var sifteoMessage = Uint8Array(19);
		//sifteo header
	    sifteoMessage[0] = 0;
		sifteoMessage[1] = 0;
		sifteoMessage[2] = 0;
		sifteoMessage[3] = 112;

		//message type
		sifteoMessage[4] = 5;

		//cubeId
		sifteoMessage[5] = msg.cubeId;

		//message Param Length = 1
		sifteoMessage[6] = 1;

		//message
		sifteoMessage[7]=msg.state;

		sendToSifteo(sifteoMessage);
		console.log("sent message to sifteo"+ sifteoMessage);

 	});

 	socket.on('QuitApp',function(){
 		sifteoBase.close();
 	});

 	
 
});


http.listen(3000,function (){
console.log('listening on *: 3000');
});


//SIFTEO CODE

usb.setDebugLevel(3);

var myList = usb.getDeviceList();

var sifteoBase = usb.findByIds(8954, 261);
console.log(sifteoBase);

sifteoBase.open();  

//temp

var myInterface = sifteoBase.interface(0);
console.log(myInterface);
myInterface.claim();
var inendpoint = myInterface.endpoint(0x81);
var outendpoint = myInterface.endpoint(0x01);

//to check if sifteo is getting the data
/*sifteoBase.reset(function(error){
		var sifteoMessage = Uint8Array(19);
	//sifteo header
	    sifteoMessage[0] = 0;
		sifteoMessage[1] = 0;
		sifteoMessage[2] = 0;
		sifteoMessage[3] = 112;

		//message type
		sifteoMessage[4] = 1;  //equal to message[0]

		sifteoMessage[5] =0; //cube id

		//message PARAM Length = 4 for now
		sifteoMessage[6] = 3; 

		//value of param
		
			sifteoMessage[7] = 1;
			sifteoMessage[8]=99;
			sifteoMessage[9]=1;
		

		sendToSifteo(sifteoMessage);
		sifteoBase.close();


});

*/	   

 
//end of check
var time,timeP=0; //for touch events to detect the double tap 
var count = 0;
inendpoint.startPoll(3, 64);


var cubes = ['FLOR', 'ACRG', 'PRC'];
var cubeVars = [0, 0, 0];

inendpoint.on('data', function(data){
	console.log("Recieved data: ", data);

	var dataToSend = {"type":null};
	dataToSend.tabletId = "ADA";
	if (data[0] == 1)
	{
		//touch event
		//process.hrtime()[1]/100000000;}
		dataToSend.type = 'sifteo_touch';
		dataToSend.cubeId = data[4];
		dataToSend.value = data[5] == 1 ? true : false;
		if(dataToSend.value){time = process.hrtime()[0];
		console.log("time"+time+"timeP"+timeP);
		dataToSend.diff = Math.abs(time-timeP);
		timeP = time;}
		console.log(dataToSend);
		io.emit("EVENT", dataToSend); 
     }

	if (data[0] == 2)
	{
		//shake event
		dataToSend.type = 'sifteo_shake';
		dataToSend.cubeId = data[4];
		dataToSend.value = true;

		console.log(dataToSend);
		io.emit("EVENT", dataToSend);
	}

	if (data[0] == 3)
	{
		
		//gives a cubeID/HWID pair
		dataToSend.type = 'sifteo_cubeID_HWID';
		dataToSend.cubeId = data[4];
		var tempValue = 0;
		for (var i=12; i>4; i--)
		{
			tempValue = (tempValue * 256) + data[i]; 
		}
		
		dataToSend.hardwareId = tempValue;
		console.log(dataToSend);
		io.emit("SIFTEO_INIT", dataToSend)
	}

	if (data[0] == 4)
	{
		//gives the cubeId/binding data
		dataToSend.type = 'sifteo_cubeID_init_binding';
		dataToSend.cubeId = data[4];
		if (data[5] == 65)
		{
			//data[5] == 'A'
			dataToSend.binding = 'ACRG';
			cubes[dataToSend.cubeId] = 'ACRG';
		}
		if (data[5] == 70)
		{
			//data[5] == 'F'
			dataToSend.binding = 'FLOR';
			cubes[dataToSend.cubeId] = 'FLOR';
		}
		if (data[5] == 80)
		{
			//data[5] == 'P'
			dataToSend.binding = 'PRC';
			cubes[dataToSend.cubeId] = 'PRC';
		}
		if (data[5] == 83)
		{
			//data[5] == 'S'
			dataToSend.binding = 'SQFT';
			cubes[dataToSend.cubeId] = 'SQFT';
		}
		if (data[5] == 78)
		{
			//data[5] == 'N'
			dataToSend.binding = 'NULL';
			cubes[dataToSend.cubeId] = 'NULL';
		}

		console.log(dataToSend);
		io.emit("SIFTEO_INIT", dataToSend);

	}
	if(data[0]==6){
       
       console.log("Cubes touched ");
       dataToSend.type="cubes_touched";
       dataToSend.cubeId1 = data[4];
       dataToSend.cubeId2 = data[5];
       dataToSend.cubeSide1=data[6];
       dataToSend.cubeSide2=data[7];
       io.emit("EVENT",dataToSend);

	}

	//add for tilt event 
	if(data[0]==7){
		dataToSend.type="cube_tilted";
		dataToSend.cubeId = data[4];
		dataToSend.tiltValue = data[5];
		io.emit("EVENT",dataToSend);
		console.log("cube tilted "+data[4]+" tilt value is "+data[5]);
	}
	
});


//to send

//messages to Sifteo

sifteoHeader = new Buffer([0,0,0,112]);

function sendToSifteo(messageData){
	
	outendpoint.transfer(messageData);
}



