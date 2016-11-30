#!/usr/bin/env node

var program = require('commander');
const net = require('net');
const yargs = require('yargs');
var http = require('http');
var io = require('socket.io-client');
var dgram = require('dgram');
var ip = require('ip');


//use --help to get help

program
    .version('0.0.1')
    .command('get <url>')
    .description('Get executes a HTTP GET request for a given URL.')
    .option("-v, --v", "Prints the detail of the response such as protocol, status, and headers.")
    .option("-h, --h", "key:value Associates headers to HTTP Request with the format key:value.")
    .action(function(url, options) {
        //contents go here
        console.log("in get function");
        // console.log(program.commands[0].v);
        // console.log(program.commands[0].h);
        var PORT = 3000;
        var HOST = '127.0.0.1';
        // Add a connect listener

        var buf;
        var urlDict = {
            type: "get",
            tempUrl: url,
            v: program.commands[0].v,
            h: program.commands[0].h
        }

        //syn 0, syn-ack 1, ack 2, nack 3, data 4

        //Start handshake


        definePacket(0, 1, null);
        // Define an IP header pattern using a joined array to explode the pattern.
        var client = dgram.createSocket('udp4');

        //  timeout
        client.send(buf, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            console.log('UDP SYN message sent to ' + HOST + ':' + PORT);
            // client.close();
        });

        client.on('message', function(message, remote) {
            buf = Buffer.from(message);
            var type = buf.readInt8(0);
            var seqNum = buf.readInt16BE(1);
            var address = ip.toString(buf, 5, 4);

            if (type == 1) { // if syn-ack
                buf.writeInt8(2, 0);
                const length = Buffer.byteLength(JSON.stringify(urlDict), 'utf8')
                const buffer2 = Buffer.allocUnsafe(length)
                const newBuffer = Buffer.concat([buf, buffer2], length + 11);
                newBuffer.writeInt8(2, 0);
                newBuffer.write(JSON.stringify(urlDict), 11);

                // timeout
                client.send(newBuffer, PORT, HOST, function(err, bytes) {
                    if (err) throw err;
                    console.log('UDP ACK message sent to ' + HOST + ':' + PORT);
                    // client.close();
                });
            } else if (type == 2) {

            } else if (type == 3) {

            } else if (type == 4) {
                var body = JSON.parse(buf.toString('utf8', 11));
                client.close();
                // output dict.
                console.log(body.protocol);
                console.log(body.status);
                console.log(body.body);
                console.log('Args: ');
                //console.log(JSON.stringify(body["args"]));
                for (var key in body["args"]) {
                    console.log(key + " : " + body["args"][key]);
                }
                console.log('Headers : ');
                for (var key in body["headers"]) {
                    console.log(key + " : " + body["headers"][key]);
                }

            }


        })


        function definePacket(type, seq, body) {
            var length;
            if (body != null) {
                length = Buffer.byteLength(JSON.stringify(body), 'utf8')
            } else {
                length = 0
            }
            buf = Buffer.allocUnsafe(length + 11)
            buf.writeInt8(type, 0);
            buf.writeInt16BE(seq, 1);
            ip.toBuffer('127.0.0.1', buf, 5);
            buf.writeInt16BE(8007, 9);
            if (body != null) {
                buf.write(JSON.stringify(body), 11);
            }
        }


    })

program
    .command('post <url>')
    .description('Post executes a HTTP POST request for a given URL with inline data or from file.')
    .option("-v, --v", "Prints the detail of the response such as protocol, status, and headers.")
    .option("-h, --h", "key:value Associates headers to HTTP Request with the format key:value.")
    .option("-d, --string <string>", "Associates an inline data to the body HTTP POST request.")
    .option("-f --file <file>", "Associates the content of a file to the body HTTP POST request.")
    .option("-o --open <open>", "Creates a file with the body of the response to the specified file")
    .action(function(url, options) {
        //contents go here
        console.log("in post function");
        // console.log(program.commands[0].v);
        // console.log(program.commands[0].h);
        var socket = io("http://localhost:3000");
        // Add a connect listener
        socket.on('connect', function() {
            console.log('Client has connected to the server!');
        });

        var urlDict = {
            type: "post",
            tempUrl: url,
            v: program.commands[1].v,
            h: program.commands[1].h,
            string: program.commands[1].string,
            file: program.commands[1].file,
            o: program.commands[1].open,
            filename: program.commands[1].open
        }
        console.log(program.commands[1].open);

        socket.emit('post', urlDict);
        socket.on('returnValue', function(data) {
            console.log(data);
        });
    })
program.parse(process.argv);
