/*
    Sifteo parameter token code
    Copyright (C) 2014 by LSU CCT (team lead by Brygg Ullmer and Chris Branton)
    Major authors: Shantanu Thatte, Charles Werther

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Builds upon Sifteo SDK Example.
*/

var usb = require('usb');
var io = require('socket.io-client');
var socket = io.connect("http://test.dnxt.in:8783/");

//Here are some variables that keep track of the state of the bar
var minForIncrease = 18;
var maxForDecrease = 0;

//usb.setDebugLevel(3);

//var myList = usb.getDeviceList();

var sifteoBase = usb.findByIds(8954, 261);

sifteoBase.open();
var myInterface = sifteoBase.interface(0);
myInterface.claim();
var inendpoint = myInterface.endpoint(0x81);
var outendpoint = myInterface.endpoint(0x01);


inendpoint.startStream(3, 64);

inendpoint.on('data', function(data){
	//console.log("Recieved data: ", data);

	var dataToSend = {"type":null};
	dataToSend.tabletId = "ADA";
	if (data[0] == 1)
	{
		//touch event
		dataToSend.type = 'sifteo_touch';
		dataToSend.cubeId = data[4];
		dataToSend.value = data[5] == 1 ? true : false;

		console.log(dataToSend);
		socket.emit("EVENT", dataToSend);
	}

	if (data[0] == 2)
	{
		//shake event
		dataToSend.type = 'sifteo_shake';
		dataToSend.cubeId = data[4];
		dataToSend.value = true;

		console.log(dataToSend);
		socket.emit("EVENT", dataToSend);
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
		socket.emit("SIFTEO_INIT", dataToSend)
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
		socket.emit("SIFTEO_INIT", dataToSend);

	}
	
	//socket.emit("message", data);
});

sifteoHeader = new Buffer([0,0,0,112]);

function sendToSifteo(messageData){
	//console.log('In send to sifteo');
	//console.log('wrote: ', messageData);
	//messageToSendToSifteo = sifteoHeader + messageData;
	outendpoint.write(messageData);
}

var data = new Uint8Array([0,0,0,112,1,1]);

//console.log(data);


socket.on('connect', function(){
	//console.log(socket);
	socket.emit('message', "hello World");
});

//length = 3 since 3 cubes are used
//values are 'ACRG', 'FLOR', 'PRC', 'SQFT', and 'NULL'
var cubes = ['FLOR', 'ACRG', 'PRC'];
var cubeVars = [0, 0, 0];

socket.on('DATA', function(data){
	//console.log('got a message');
	//console.log(data);
	//outendpoint.write(data);
	//console.log('In recieve', data);
	myNewData = data;

	if (myNewData.type == 'BIND')
	{
		var cubeId = myNewData.cubeId;
		var PARAM = [];
		var barIdx = 0;
		var minValue = [32, 48, 32];
		var maxValue = [32, 49, 48];

		//console.log('recieved bind for ', myNewData.attr);

		cubeVars[cubeId] = barIdx;

		if (myNewData.attr == 'NULL')
		{
			PARAM = [78, 47, 65, 32];
			barIdx = 0;
			cubes[cubeId] = 'NULL';
		}
		else
		{
			if (myNewData.attr == 'ACRG')
			{
				//console.log('setting PARAM to ACRG');
				PARAM = [65, 67, 82, 71];
				cubes[cubeId] = 'ACRG';
			}
			if (myNewData.attr == 'FLOR')
			{
				//console.log('setting PARAM to FLOR');
				PARAM = [70, 76, 79, 82];
				cubes[cubeId] = 'FLOR';
			}
			if (myNewData.attr == 'PRC')
			{
				//console.log('setting PARAM to PRC');
				PARAM = [80, 82, 67, 32];
				cubes[cubeId] = 'PRC';
			}
			if (myNewData.attr == 'SQFT')
			{
				//console.log('setting PARAM to SQFT');
				PARAM = [83, 81, 70, 84];
				cubes[cubeId] = 'SQFT';
			}

			barIdx = Math.round(myNewData.value*10/255);
		}

		var sifteoMessage = Uint8Array(19);
		//sifteo header
		sifteoMessage[0] = 0;
		sifteoMessage[1] = 0;
		sifteoMessage[2] = 0;
		sifteoMessage[3] = 112;

		//message type
		sifteoMessage[4] = 1;

		sifteoMessage[5] = cubeId;

		//message PARAM Length = 4 for now
		sifteoMessage[6] = 4;

		//value of param
		for (var i=0; i<4; i++)
		{
			sifteoMessage[i+7] = PARAM[i];
		}

		//console.log('set sifteo to ', sifteoMessage[7], sifteoMessage[8], sifteoMessage[9], sifteoMessage[10]);

		//minValue
		for (var i=0; i<3; i++)
		{
			sifteoMessage[i+11] = minValue[i];
		}

		//maxValue
		for (var i=0; i<3; i++)
		{
			sifteoMessage[i+14] = maxValue[i];
		}

		sifteoMessage[17] = barIdx;
		sifteoMessage[18] = 1;

		sendToSifteo(sifteoMessage);

	}

	if (myNewData.type == 'VAL')
	{
		//console.log("in Val");
		var source;
		var value = myNewData.value;
		console.log(value);
		if (myNewData.source == 'local')
		{
			source = 0;
		}
		if (myNewData.source == 'remote')
		{
			source = 1;
		}

		var sifteoMessageLocalRemote = Uint8Array(7);
		var sifteoMessageValue = Uint8Array(7);

		sifteoMessageLocalRemote[0] = 0;
		sifteoMessageLocalRemote[1] = 0;
		sifteoMessageLocalRemote[2] = 0;
		sifteoMessageLocalRemote[3] = 112;
		sifteoMessageLocalRemote[4] = 3;
		//sifteoMessageLocalRemote[5] = cubeId (in for loop)
		sifteoMessageLocalRemote[6] = source;

		sifteoMessageValue[0] = 0;
		sifteoMessageValue[1] = 0;
		sifteoMessageValue[2] = 0;
		sifteoMessageValue[3] = 112;
		sifteoMessageValue[4] = 2;
		//sifteoMessageValue[5] = cubeId (in for loop)
		sifteoMessageValue[6] = Math.round(value*10/255);
		for (var i=0; i<cubes.length; i++)
		{
			if (cubes[i] == myNewData.attr)
			{		
				if (cubeVars[i] != sifteoMessageValue[6])
				{
					console.log('cubeVars[', i, '] = ', cubeVars[i], 'sifteoVal = ', sifteoMessageValue[6]);
					console.log('Sending val message to sifteo', sifteoMessageValue[6]);
					cubeVars[i] = sifteoMessageValue[6];
					sifteoMessageLocalRemote[5] = i;
					sendToSifteo(sifteoMessageLocalRemote);
					sifteoMessageValue[5] = i;
					sendToSifteo(sifteoMessageValue);
				}
			}
		}
	}

});

//console.log(Uint8Array([0, 0, 0, 112, 1, 1, 4, 65, 66, 67, 68, 32, 49, 48, 49, 48, 48, 8, 1]));
//sendToSifteo(Uint8Array([0, 0, 0, 112, 2, 1, 1]));
//sendToSifteo(Uint8Array([0, 0, 0, 112, 2, 1, 1]));
//sendToSifteo(Uint8Array([0, 0, 0, 112, 3, 1, 0]));

//sifteoBase.close();
/*
	var cubeId = 0;
	var PARAM = [68, 70, 71, 68];
	var barIdx = 5;
	var minValue = [32, 48, 32];
	var maxValue = [32, 49, 48];

	var sifteoMessage = Uint8Array(19);
	//sifteo header
	sifteoMessage[0] = 0;
	sifteoMessage[1] = 0;
	sifteoMessage[2] = 0;
	sifteoMessage[3] = 112;

	//message type
	sifteoMessage[4] = 1;

	sifteoMessage[5] = cubeId;

	//message PARAM Length = 4 for now
	sifteoMessage[6] = 4;

	//value of param
	for (var i=0; i<4; i++)
	{
		sifteoMessage[i+7] = PARAM[i];
	}

	//minValue
	for (var i=0; i<3; i++)
	{
		sifteoMessage[i+11] = minValue[i];
	}

	//maxValue
	for (var i=0; i<3; i++)
	{
		sifteoMessage[i+14] = maxValue[i];
	}

	sifteoMessage[17] = barIdx;
	sifteoMessage[18] = 1;
	console.log(sifteoMessage);
	sendToSifteo(sifteoMessage);
*/

var floatvalue = 10.34;
var nextValue = Math.round(floatvalue);
console.log(floatvalue, nextValue);