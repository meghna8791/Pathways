var app  = require('express')();
var http = require('http').Server(app);
tuio = require("tuio"),


http.listen(5000,function (){
console.log('listening on *: 5000');
});

tuio.init({
	oscPort: 3333,
	oscHost: "0.0.0.0",
	socketPort: http
});