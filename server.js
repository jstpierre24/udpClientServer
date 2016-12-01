'use strict';
var app = require('http').createServer()
var io = require('socket.io')(app);
var fs = require('fs');
var request = require('request');
var url = require('url');
var fs = require('fs');
var dgram = require('dgram');
var ip = require('ip');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// app.listen(3000);

var PORT = 8007;
var HOST = '127.0.0.1';
var buf;
var index;
var output = {};

var server = dgram.createSocket('udp4');

server.on('listening', function() {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function(message, remote) {
    //syn 0, syn-ack 1, ack 2, nack 3, data 4
    buf = Buffer.from(message);
    var type = buf.readInt8(0);
    var seqNum = buf.readInt16BE(1);
    var returnAddress = ip.toString(buf, 5, 4);
    var returnPort = buf.readUInt16BE(9);


    if (type == 0) {
        buf.writeInt8(1, 0);
        // timeout
        server.send(buf, 3000, '127.0.0.1', function(err, bytes) {
            if (err) throw err;
            console.log('UDP SYN-ACK message sent to ' + HOST + ':' + 3000);
        });
    } else if (type == 2) {
        var payload;
        if (buf.toString('utf8', 11)) {
            payload = JSON.parse(buf.toString('utf8', 11));
        }


        //GET Functions
        if (payload != null && payload.type == "get") {
            // console.log(index);
            // console.log(Buffer.byteLength(JSON.stringify(output), 'utf8'));
            //
            var parseUrl = payload["tempUrl"].replace(/'/g, "");

            if (seqNum == -1) {
                output = {};
            }
            if (seqNum == 0) {
                getStatus(parseUrl, function(StatusLog) {
                    output["protocol"] = "HTTP/1.0";
                    output["status"] = StatusLog;
                    getBody(parseUrl, function(body) {
                        output["body"] = body;
                        getJsonFromUrl(parseUrl, function(args) {
                            output["args"] = args;
                            getHeaders(parseUrl, function(headers) {
                                output["headers"] = headers;
                                var length = Buffer.byteLength(JSON.stringify(body), 'utf8')
                                if (length > 1013) {

                                    index = 1012;
                                    console.log(index);
                                    definePacket(4, seqNum + 1, returnAddress, returnPort, JSON.stringify(output)[0, index], 1013)
                                    server.send(buf, 3000, '127.0.0.1', function(err, bytes) {
                                        if (err) throw err;
                                        console.log('UDP message sent to ' + HOST + ':' + 3000);
                                    });
                                } else {
                                    definePacket(4, seqNum + 1, returnAddress, returnPort, JSON.stringify(output), Buffer.byteLength(JSON.stringify(output), 'utf8'))
                                    server.send(buf, 3000, '127.0.0.1', function(err, bytes) {
                                        if (err) throw err;
                                        console.log('UDP message sent to ' + HOST + ':' + 3000);
                                    });
                                }

                            })
                        })
                    })
                })
            } else if (index < Buffer.byteLength(JSON.stringify(output), 'utf8')) {
                console.log(index);
                console.log(Buffer.byteLength(JSON.stringify(output), 'utf8'));
                definePacket(4, seqNum + 1, returnAddress, returnPort, JSON.stringify(output)[index += 1, index += 1011], 1013)

                server.send(buf, 3000, '127.0.0.1', function(err, bytes) {
                    if (err) throw err;
                    console.log('UDP message sent to ' + HOST + ':' + 3000);
                });
            } else {
                console.log("end");
                console.log(index);
                console.log(Buffer.byteLength(JSON.stringify(output), 'utf8'));
                definePacket(4, seqNum + 1, returnAddress, returnPort, JSON.stringify(output)[index += 1, Buffer.byteLength(JSON.stringify(output), 'utf8')], Buffer.byteLength(JSON.stringify(output), 'utf8') - index - 1)

                server.send(buf, 3000, '127.0.0.1', function(err, bytes) {
                    if (err) throw err;
                    console.log('UDP message sent to ' + HOST + ':' + 3000);
                });
            }

        }
        //POST FUNCTIONS
        if (payload != null && payload.type == "post") {

        }

    }



});

server.on('data', function(message, remote) {
    console.log(remote.address + ':' + remote.port + ' - ' + message);

});

server.bind(PORT, HOST);

function definePacket(type, seq, a, p, payload, length) {
    buf = Buffer.allocUnsafe(length + 11)
    buf.writeInt8(type, 0);
    buf.writeInt16BE(seq, 1);
    ip.toBuffer(a, buf, 5);
    buf.writeUInt16BE(p, 9);
    if (payload != null) {
        buf.write(payload, 11);
    }
}

//Get arguments
function getJsonFromUrl(theUrl, callback) {
    var queryString = theUrl.substring(theUrl.indexOf('?') + 1);
    var splits = queryString.split("&");
    var args = {};
    splits.forEach(function(pair) {
        var innerSplits = pair.split("=")
        args[innerSplits[0]] = innerSplits[1];
    });
    callback(args);
}

//Standard GET protocol
function getProtocol(theUrl, callback) {
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
function postProtocol(theUrl, callback) {
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
function getBody(theUrl, callback) {
    request({
        url: theUrl,
        method: "GET"
    }, function(error, response, body) {
        callback(body);
    });
}

//Standard POST body
function postBody(theUrl, callback) {
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
function getStatus(theUrl, callback) {
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
function postStatus(theUrl, callback) {
    request({
        url: theUrl,
        method: "POST"
    }, function(error, response, body) {
        callback(response.statusCode);
    });
}

// -h and -v
//Standard GET headers
function getHeaders(theUrl, callback) {
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
function postHeaders(theUrl, callback) {
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

function writeToFile(filename, towrite) {
    var wstream = fs.createWriteStream(String(filename));
    wstream.write(towrite);
    wstream.end();

}
