var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var request = require('request');
var pos = require('node-pos').partsOfSpeech; // part of speech
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


var PORT = 8000;

app.use(bodyParser.json());


// app.configure(function(){
  // app.use(express.bodyParser());
  // app.use(app.router);
// });


// word that appeared last that the user entered - will be rhymed with
var lastword;

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

            var text = event.message.text.toString();

            lastword = text.slice(text.lastIndexOf(" "), text.length);

            if (text.lastIndexOf(" ") == -1) { // only one word
            	lastword = text;
            }

            // echo their message
			// var rhyme = getRhymes(lastword);
			// console.log("Rhyme: " + rhyme);

			getRhymes(lastword, function(rhymeResult) {

				// get 

				sendTextMessage(event.sender.id, rhymeResult);

			});
			

        }
    }

});


// get rhymes
function getRhymes(word, callback){

	// http://rhymebrain.com/talk?function=getRhymes&word=hello
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			var data = xmlHttp.responseText;
			var jsonResponse = JSON.parse(data); // array with all of response
			
			if (jsonResponse[0].word != null) {}
				console.log(jsonResponse[0].word);
				callback(jsonResponse[0].word); // send rhymed word to user
			}
		}
	}

	var url = "http://rhymebrain.com/talk?function=getRhymes&word=" + word;
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);

}





var token = "EAAYV5d1agD4BALZBtvZBmmn6pmS95ZA6JEVxe5nBgYaWQPwXXbAUy1wioZBcO7HoIE5ZCjYvZCxOx270Y0gxA7MqsrriZAb2Abe3uncQXYJbv7zEpdqujZCaZAAQ1pQZAmpqrfjOVbyIKcZARqgAEEOttPQKiPZB8D2DBhxrr7GcioE7AwZDZD";
// send message back to user
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


// start server
http.listen(PORT, function() {
	console.log('Listening on ' + PORT);
});