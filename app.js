var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);

var PORT = 8000;


// web hook to verify server is running
app.get('/messages', function(req, res) {
 if (req.query['hub.verify_token'] === "nekot")
  {
    res.send(req.query['hub.challenge']);
  }
  else {
    res.send('Error, wrong validation token');
  }

// console.log(req);

});

app.post('/', function(req, res) {
	console.log(req);
	res.send('ack');
});


app.get('/', function(req, res) {
	console.log(req);
});


// web hook to access messages
app.post('/messages', function(req, res) {

	console.log(req);

// var messaging_events = req.body.entry[0].messaging;
  
// //   for (i = 0; i < messaging_events.length; i++) {
//     var event = req.body.entry[0].messaging[i];
//     var sender = event.sender.id;
//     if (event.message && event.message.text) {
//       var text = event.message.text;
//       console.log(text);
// //       // Handle a text message from this sender
//     }
//   }
  res.sendStatus(200);

});


console.log('hello');


http.listen(PORT, function() {
	console.log('Listening on ' + PORT);
});