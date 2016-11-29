'use strict';
var app     = require('http').createServer()
var io      = require('socket.io')(app);
var fs      = require('fs');
var request = require('request');
var url     = require('url');
var fs      = require('fs');
var dgram   = require('dgram');
var ip      = require('ip');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// app.listen(3000);

var PORT = 8007;
var HOST = '127.0.0.1';


var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {

    var buf = Buffer.from(message);
    var body = null;
    var type = buf.readInt8(0,0);

    if(type == 0){
      buf.writeInt8(1,0);
	  // timeout
      server.send(buf, 3000, '127.0.0.1', function(err, bytes) {
          if (err) throw err;
          console.log('UDP SYN-ACK message sent to ' + HOST +':'+ 3000);
      });
    }

    else if(type == 2){
      body = JSON.parse(buf.toString('utf8', 11));

      //GET Functions
      if(body != null && body.type == "get"){

        var output = {};
        var parseUrl = body["tempUrl"].replace(/'/g,"");

        getStatus(parseUrl, function(StatusLog){
          output["status"] = StatusLog;
          getBody(parseUrl, function(body){
            output["body"] = body;
            getJsonFromUrl(parseUrl, function(args){
              output["args"] = args;
              getHeaders(parseUrl, function(headers){
                output["headers"] = headers;
                  const length = Buffer.byteLength(JSON.stringify(output), 'utf8')
                  const buffer2 = Buffer.allocUnsafe(length)
                  const newBuffer = Buffer.concat([buf, buffer2], length+11);

                  newBuffer.writeInt8(4,0);
                  newBuffer.write(JSON.stringify(output), 11);
				  // timeout
                  server.send(newBuffer, 3000, '127.0.0.1', function(err, bytes) {
                      if (err) throw err;
                      console.log('UDP message sent to ' + HOST +':'+ 3000);
                  });
              })
            })
          })
        })
      }

      //POST FUNCTIONS
      if(body != null && body.type == "post"){

      }

    }



});

server.on('data', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);

});

server.bind(PORT, HOST);


//Get arguments
function getJsonFromUrl(theUrl, callback) {
  var queryString = theUrl.substring( theUrl.indexOf('?') + 1 );
  var splits = queryString.split("&");
  var args = {};
  splits.forEach(function(pair){
    var innerSplits = pair.split("=")
    args[innerSplits[0]] = innerSplits[1];
  });
  callback(args);
}

//Standard GET protocol
function getProtocol(theUrl, callback){
	request({
	  url: theUrl,
	  method: "GET",
	  timeout: 10000,
	  followRedirect: true,
	  maxRedirects: 10
	}, function(error, response, body) {
	  callback(response.url);
	});
}

//Standard POST protocol
function postProtocol(theUrl, callback){
	request({
		url: theUrl,
		method: "POST",
		form: {
		name: "Test"
		}
	}, function(error, response, body) {
    callback(response.url);
	});
}


//Standard GET body
function getBody(theUrl, callback){
	request({
	  url: theUrl,
	  method: "GET"
	}, function(error, response, body) {
	  callback(body);
	});
}

//Standard POST body
function postBody(theUrl, callback){
	request({
		url: theUrl,
		method: "POST",
    form: {
		    name: "Test"
		}
	}, function(error, response, body) {
    callback(body);
	});
}

// part of -v
//Standard GET status
function getStatus(theUrl, callback){
	request({
	  url: theUrl,
	  method: "GET",
	  timeout: 10000,
	  followRedirect: true,
	  maxRedirects: 10
	}, function(error, response, body) {
	    callback(response.statusCode);
	});
}

// part of -v
//Standard POST status
function postStatus(theUrl, callback){
	request({
		url: theUrl,
		method: "POST"
	}, function(error, response, body) {
    callback(response.statusCode);
	});
}

// -h and -v
//Standard GET headers
function getHeaders(theUrl, callback){
	request({
	  url: theUrl,
	  method: "GET",
	  timeout: 10000,
	  followRedirect: true,
	  maxRedirects: 10
	}, function(error, response, body) {
	  callback(response.headers);
	});
}

// -h and -v
//Standard POST headers
function postHeaders(theUrl, callback){
	request({
		url: theUrl,
		method: "POST",
    form: {
		name: "Test"
		}
	}, function(error, response, body) {
    callback(response.headers);
	});
}

function writeToFile(filename, towrite){
  var wstream = fs.createWriteStream(String(filename));
  wstream.write(towrite);
  wstream.end();

}
