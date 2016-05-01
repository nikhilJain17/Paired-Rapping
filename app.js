var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);

var PORT = 8000;

app.get('/', function(req, res) {
	res.send('whats up');

});



console.log('hello');


http.listen(PORT, function() {
	console.log('Listening on ' + PORT);
});