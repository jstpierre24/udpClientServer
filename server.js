'use strict';
var app     = require('http').createServer()
var io      = require('socket.io')(app);
var fs      = require('fs');
var request = require('request');
var url     = require('url');
var fs      = require('fs');
var dgram = require('dgram');

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
    console.log(remote.address + ':' + remote.port +' - ' + message);

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
// //Get arguments
// function getJsonFromUrl(theUrl, callback) {
//   console.log(theUrl);
//   var queryString = theUrl.substring( theUrl.indexOf('?') + 1 );
//   var splits = queryString.split("&");
//   var args = {};
//   splits.forEach(function(pair){
//     var innerSplits = pair.split("=")
//     args[innerSplits[0]] = innerSplits[1];
//   });
//   callback(args);
// }
//
// //Standard GET protocol
// function getProtocol(theUrl, callback){
// 	request({
// 	  url: theUrl,
// 	  method: "GET",
// 	  timeout: 10000,
// 	  followRedirect: true,
// 	  maxRedirects: 10
// 	}, function(error, response, body) {
// 	  callback(response.url);
// 	});
// }
//
// //Standard POST protocol
// function postProtocol(theUrl, callback){
// 	request({
// 		url: theUrl,
// 		method: "POST",
// 		form: {
// 		name: "Test"
// 		}
// 	}, function(error, response, body) {
//     callback(response.url);
// 	});
// }
//
//
// //Standard GET body
// function getBody(theUrl, callback){
// 	request({
// 	  url: theUrl,
// 	  method: "GET"
// 	}, function(error, response, body) {
// 	  callback(body);
// 	});
// }
//
// //Standard POST body
// function postBody(theUrl, callback){
// 	request({
// 		url: theUrl,
// 		method: "POST",
//     form: {
// 		    name: "Test"
// 		}
// 	}, function(error, response, body) {
//     callback(body);
// 	});
// }
//
// // part of -v
// //Standard GET status
// function getStatus(theUrl, callback){
// 	request({
// 	  url: theUrl,
// 	  method: "GET",
// 	  timeout: 10000,
// 	  followRedirect: true,
// 	  maxRedirects: 10
// 	}, function(error, response, body) {
// 	  callback(response.statusCode);
// 	});
// }
//
// // part of -v
// //Standard POST status
// function postStatus(theUrl, callback){
// 	request({
// 		url: theUrl,
// 		method: "POST"
// 	}, function(error, response, body) {
//     callback(response.statusCode);
// 	});
// }
//
// // -h and -v
// //Standard GET headers
// function getHeaders(theUrl, callback){
// 	request({
// 	  url: theUrl,
// 	  method: "GET",
// 	  timeout: 10000,
// 	  followRedirect: true,
// 	  maxRedirects: 10
// 	}, function(error, response, body) {
// 	  callback(response.headers);
// 	});
// }
//
// // -h and -v
// //Standard POST headers
// function postHeaders(theUrl, callback){
// 	request({
// 		url: theUrl,
// 		method: "POST",
//     form: {
// 		name: "Test"
// 		}
// 	}, function(error, response, body) {
//     callback(response.headers);
// 	});
// }
//
// function writeToFile(filename, towrite){
//   var wstream = fs.createWriteStream(String(filename));
//   wstream.write(towrite);
//   wstream.end();
//
// }
