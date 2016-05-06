var app = require("express")();
var http = require("http").Server(app);
// var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var request = require('request');
var pos = require('node-pos').partsOfSpeech; // part of speech
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var lyr = require('lyrics-fetcher');


var PORT = process.env.PORT || 8000;

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
	res.sendStatus(200);
});


app.get('/', function(req, res) {
	res.sendStatus(200);
	// console.log(req);
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

			var pos = "";
			var lastWordPOS = "";

			do {
			getRhymes(lastword, function(rhymeResult) {

				// get part of speech
				getPartOfSpeech(rhymeResult, function(posResult) {

					// get part of speech
					if (posResult.includes("/NN"))
						pos = "noun";
					else if (posResult.includes("/VBD"))
						pos = "verb";
					else if (posResult.includes("/JJ"))
						pos = "adjective";
						
					// @Todo Get rid of this
					// sendTextMessage(event.sender.id, pos);

					// request a sentence from lyrics-fetcher
					// keep requesting until the last word has the same part of speech
					// @Todo randomize which song to use
					
					var lastWordOfSentence;
					// var lastWordPOS = "";
					// do {
						var songarr = [
							{artist:"drake", song:"headlines"},
							{artist:"drake", song:"hotline bling"}, 
							{artist:"drake", song:"energy"}, 
							{artist:"eminem", song:"mockingbird"}, 
							{artist:"kid cudi", song:"day n nite"}, 
							{artist:"kid cudi", song:"cleveland is the reason"}, 
							{artist:"kendrick lamar", song:"poetic justice"}
							{artist:"kanye", song:"heartless"}, 
							{artist:"macklemore", song:"thrift shop"}, 
							{artist:"eminem", song:"rap god"}, 
							{artist:"desiigner", song:"panda"}]; 
							// {artist:"jay-z", song:"young forever"}];
							
							var i = Math.floor(Math.random() * songarr.length);
							
							var artist = songarr[i].artist;
    					var song = songarr[i].song;

							console.log("Fetching: " + song + " by: " + artist);
							
							lyr.fetch(artist, song, function(err, lyrics) {
								// randomly pick a line in the song
								var linesArr = lyrics.split('\n');
								var sentence;
								
								do {
									sentence = linesArr[Math.floor(Math.random() * linesArr.length)];
								} while (sentence.length < 5); // no more 1 word nonsense
								
								console.log("Line: " + sentence);
								
								// get last word in sentence
								lastWordOfSentence = sentence.substring(sentence.lastIndexOf(" ") + 1);
								console.log(lastWordOfSentence);
								
								// check part of speech -- TODO get rid of this nested callback nonsense
								
							
								getPartOfSpeech(lastWordOfSentence, function (posResult){
										// get part of speech
									lastWordPOS = posResult;
									
									if (posResult.includes("/NN"))
										lastWordPOS = "noun";
									else if (posResult.includes("/VBD"))
										lastWordPOS = "verb";
									else if (posResult.includes("/JJ"))
										lastWordPOS = "adjective";
										
										console.log("Tony Wroten: " + lastWordPOS + "\\" + pos);
										// console.log(lastWordPOS != pos);		
										
								
											
									});
								
								sendTextMessage(event.sender.id, sentence.substring(0, sentence.lastIndexOf(" ")) + " " + rhymeResult);
					
					});

				// @Todo Get rid of this boi
				// sendTextMessage(event.sender.id, rhymeResult);

			});
			

		});
		
			} while (pos != lastWordPOS);
		
    }
		
		
	}
});


function returnPartOfSpeech(word) {
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
				return jsonResponse.text;
			}

		}
	}

	http.send(params);

}

// @TODO delete this function entirely
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

				var index;
				do {				
					index = Math.floor(Math.random() * jsonResponse.length * 0.5);
				} while (index > 20);
				
				
				console.log(jsonResponse[index].word);
				callback(jsonResponse[index].word); // send rhymed word to user
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