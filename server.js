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
    console.log(remote.address + ':' + remote.port);
    // console.log(buf.readInt8(0));
    // console.log(buf.readInt16BE(1));
    // console.log(ip.toString(buf, 5, 4));
    var body = JSON.parse(buf.toString('utf8', 11));
    // console.log(body);

    if(body.type == "get"){
      console.log("get function");

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
                  console.log(output);

                  const length = Buffer.byteLength(JSON.stringify(output), 'utf8')
                  const buffer2 = Buffer.allocUnsafe(length)
                  const newBuffer = Buffer.concat([buf, buffer2], length+11);

                  newBuffer.write(JSON.stringify(output), 11);

                  server.send(newBuffer, 3000, '127.0.0.1', function(err, bytes) {
                      if (err) throw err;
                      console.log('UDP message sent to ' + HOST +':'+ 3000);
                  });
              })
            })
          })
        })


        // .then(function(Statuslog){
        //   output["status"] = StatusLog;
        // })
        // .then(function(logBody){
        //   output["body"] = bodyLog;
        // })
        // .then(function(userData){
        //   output["headers"] = userData;
        // })
        // .then(function(){
        //   const length = Buffer.byteLength(JSON.stringify(output), 'utf8')
        //   const buf2 = Buffer.allocUnsafe(length+11)
        //
        //   buf.writeInt8(0, 0);
        //   buf.writeInt16BE(1, 1);
        //   ip.toBuffer('127.0.0.1', buf, 5);
        //   buf.writeInt16BE(3000, 9);
        //   buf.write(JSON.stringify(output), 11);
        //
        //
        //   server.send(buf, 3000, 'localhost', function(err, bytes) {
        //       if (err) throw err;
        //       console.log('UDP message sent to ' + HOST +':'+ PORT);
        //   });
        //
        // })


    }

});

server.on('data', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);

});

server.bind(PORT, HOST);


// ******************* GET requests *******************

// socket.on('get', function (data) {
//    var output = {};
//    var parseUrl = data["tempUrl"].replace(/'/g,"");
//
//
//    getStatus(parseUrl, logStatus);
//
//    function logStatus(StatusLog){
//      socket.emit('returnValue', StatusLog);
//
//      getBody(parseUrl, logBody);
//      function logBody(bodyLog){
//        socket.emit('returnValue', bodyLog);
//      }
//    }
//
//
//
//
//    if(data["v"]){
//      console.log("v is true");
//        getHeaders(parseUrl, logStuff);
//
//        function logStuff(userData){
//
//          for (var key in userData) {
//            var string = key + " : " + userData[key];
//            socket.emit('returnValue', string);
//          }
//
//        }
//
//    }
//    if(data["h"]){
//      console.log("h is true");
//    }
//
//    getJsonFromUrl(parseUrl, argLogs);
//
//    function argLogs(userData){
//      output["args"] = userData;
//      getHeaders(parseUrl, logStuff);
//      output["url"] = parseUrl;
//    }
//    function logStuff(userData){
//      output["headers"] = userData;
//      socket.emit('returnValue', output);
//    }
//
// });
//
//
//
// // ******************* POST requests *******************
//
//   socket.on('post', function (data) {
//     var output = {};
//     var parseUrl = data["tempUrl"].replace(/'/g,"");
//
//     postStatus(parseUrl, logStatus);
//
//     function logStatus(StatusLog){
//       socket.emit('returnValue', StatusLog);
//     }
//
//
//     if(data["v"]){
//       console.log("v is true");
//         postHeaders(parseUrl, logStuff);
//
//         function logStuff(userData){
//
//           for (var key in userData) {
//             var string = key + " : " + userData[key];
//             socket.emit('returnValue', string);
//           }
//
//         }
//
//     }
//     if(data["h"]){
//       console.log("h is true");
//     }
//
//     if(data["o"]){
//       console.log(data["filename"]);
//       postBody(parseUrl, writing);
//       function writing(userData){
//         writeToFile(data["filename"], userData);
//       };
//
//     }
//
//
//       getJsonFromUrl(parseUrl, argLogs);
//       function argLogs(userData){
//         output["args"] = userData;
//         postHeaders(parseUrl, logStuff);
//         output["url"] = parseUrl;
//       }
//       function logStuff(userData){
//         output["headers"] = userData;
//         socket.emit('returnValue', output);
//       }
//
//       postBody(parseUrl, bodyPost);
//
//       function bodyPost(body){
//         socket.emit('returnValue', body);
//       }
//
//   });
//
//
// });
//
//
//Get arguments
function getJsonFromUrl(theUrl, callback) {
  console.log(theUrl);
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
  console.log("in status");
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
