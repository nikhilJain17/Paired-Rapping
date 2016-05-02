var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var request = require('request');


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

    res.sendStatus(200);
    // console.log(req);

    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            console.log("Echo: " + event.message.text);

            // echo their message
			sendTextMessage(event.sender.id, "Text received, echo: "+ event.message.text);
        }
    }

});

var token = "EAAYV5d1agD4BALZBtvZBmmn6pmS95ZA6JEVxe5nBgYaWQPwXXbAUy1wioZBcO7HoIE5ZCjYvZCxOx270Y0gxA7MqsrriZAb2Abe3uncQXYJbv7zEpdqujZCaZAAQ1pQZAmpqrfjOVbyIKcZARqgAEEOttPQKiPZB8D2DBhxrr7GcioE7AwZDZD";

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}



http.listen(PORT, function() {
	console.log('Listening on ' + PORT);
});