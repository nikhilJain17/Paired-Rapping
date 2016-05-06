var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var request = require('request');
var pos = require('node-pos').partsOfSpeech; // part of speech
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var lyr = require('lyrics-fetcher');


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

				// get part of speech
				getPartOfSpeech(rhymeResult, function(posResult) {

					var pos = "";

					// get part of speech
					if (posResult.includes("/NN"))
						pos = "noun";
					else if (posResult.includes("/VBD"))
						pos = "verb";
					else if (posResult.includes("/JJ"))
						pos = "adjective";
						
					// @Todo Get rid of this
					sendTextMessage(event.sender.id, pos);

					// request a sentence from lyrics-fetcher
					// keep requesting until the last word has the same part of speech
					// @Todo randomize which song to use
					
					var lastWordOfSentence;
					do {
						lyr.fetch('drake', 'headlines', function(err, lyrics) {
							// randomly pick a line in the song
							var linesArr = lyrics.split('\n');
							var sentence = linesArr[Math.floor(Math.random() * linesArr.length)];
							
							console.log(sentence);
						
					});
					// } while ()

				});

				// @Todo Get rid of this boi
				sendTextMessage(event.sender.id, rhymeResult);

			});
			

        }
    }

});


function getPartOfSpeech(word, callback) {
// curl -d "text=California is nice" http://text-processing.com/api/tag/
	var http = new XMLHttpRequest();

	var url = "http://text-processing.com/api/tag/";
	var params = "text=" + word;
	http.open("POST", url, true);

	// set headers
	http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	http.setRequestHeader("Content-length", params.length);
	http.setRequestHeader("Connection", "close");

	http.onreadystatechange = function() {//Call a function when the state changes.
	
		if(http.readyState == 4 && http.status == 200) {
			console.log(http.responseText);
			var data = http.responseText;
			var jsonResponse = JSON.parse(data);

			if (jsonResponse.length != 0) {
				console.log(jsonResponse.text);
				callback(jsonResponse.text);
			}

		}
	}

	http.send(params);

}


// get rhymes
function getRhymes(word, callback){

	// http://rhymebrain.com/talk?function=getRhymes&word=hello
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			var data = xmlHttp.responseText;
			var jsonResponse = JSON.parse(data); // array with all of response
			
			// console.log(jsonResponse);
			// console.log(jsonResponse);

			// if something to parse
			if (jsonResponse.length != 0) {
				console.log(jsonResponse[0].word);
				callback(jsonResponse[0].word); // send rhymed word to user
			}
		}
	}

	var url = "http://rhymebrain.com/talk?function=getRhymes&word=" + word;
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);

}





var token = "";
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