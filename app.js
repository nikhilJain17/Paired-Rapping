var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);
var bodyParser = require('body-parser');


var PORT = 8000;

app.use(bodyParser.json());


// app.configure(function(){
  // app.use(express.bodyParser());
  // app.use(app.router);
// });


// web hook to verify server is running
app.get('/messager', function(req, res) {
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
app.post('/messager', function(req, res) {

	// var messagesArray = req.body.entry[0].messaging;

	// for (var i = 0; i < messagesArray.length; i++) {

	//	var messageEvent = messagesArray[i];
	//	var sender = messageEvent.sender.id;
	//	var text = messageEvent.message.text;

	// console.log(sender + ": " + text);
	// }



// var messaging_events = req.body.entry[0].messaging;
  
// //   for (i = 0; i < messaging_events.length; i++) {
//     var event = req.body.entry[0].messaging[i];
//     var sender = event.sender.id;
//     if (event.message && event.message.text) {
//       var text = event.message.text;
//       console.log(text);
// //       // Handle a text message from this sender
//     }
// //   }
//     var events = req.body.entry[0].messaging;
//     for (i = 0; i < events.length; i++) {
//         var event = events[i];
//         if (event.message && event.message.text) {
//             sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
//         }
//     }
    res.sendStatus(200);
    // console.log(req);

    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            console.log("Echo: " + event.message.text);
        }
    }

});


console.log('hello');


http.listen(PORT, function() {
	console.log('Listening on ' + PORT);
});