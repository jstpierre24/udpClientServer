#!/usr/bin/env node
var program = require('commander');
const net   = require('net');
const yargs = require('yargs');
var http    = require('http');
var io      = require('socket.io-client');
var dgram   = require('dgram');
var ip      = require('ip');


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

    var urlDict = {
      type: "get",
      tempUrl : url,
      v : program.commands[0].v,
      h : program.commands[0].h
    }
    const length = Buffer.byteLength(JSON.stringify(urlDict), 'utf8')
    const buf = Buffer.allocUnsafe(length+11)

    buf.writeInt8(0, 0);
    buf.writeInt16BE(1, 1);
    ip.toBuffer('127.0.0.1', buf, 5);
    buf.writeInt16BE(8007, 9);
    buf.write(JSON.stringify(urlDict), 11);

    //   packet_type : 0,
    //   seq_num : 1,
    //   peer_ip_addr : '127.0.0.1',
    //   peer_port : 8007,
    //   payload : JSON.stringify(urlDict)


    // Define an IP header pattern using a joined array to explode the pattern.

    var client = dgram.createSocket('udp4');

    client.send(buf, PORT, HOST, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT);
        // client.close();
    });
    client.on('message', function (message, remote) {
        const buf2 = Buffer.from(message);

        console.log(remote.address + ':' + remote.port);
        console.log(buf2.readInt8(0));
        console.log(buf2.readInt16BE(1));
        console.log(ip.toString(buf2, 5, 4));
        console.log(buf2.toString('utf8', 11));
        client.close();
    })

	})

program
  .command('post <url>')
  .description('Post executes a HTTP POST request for a given URL with inline data or from file.')
  .option("-v, --v", "Prints the detail of the response such as protocol, status, and headers.")
  .option("-h, --h", "key:value Associates headers to HTTP Request with the format key:value.")
  .option("-d, --string <string>", "Associates an inline data to the body HTTP POST request.")
  .option("-f --file <file>","Associates the content of a file to the body HTTP POST request.")
  .option("-o --open <open>","Creates a file with the body of the response to the specified file")
  .action(function(url, options) {
		//contents go here
    console.log("in post function");
    // console.log(program.commands[0].v);
    // console.log(program.commands[0].h);
    var socket = io("http://localhost:3000");
    // Add a connect listener
    socket.on('connect',function() {
       console.log('Client has connected to the server!');
    });

    var urlDict = {
      type: "post",
      tempUrl : url,
      v : program.commands[1].v,
      h : program.commands[1].h,
      string : program.commands[1].string,
      file: program.commands[1].file,
      o : program.commands[1].open,
      filename : program.commands[1].open
    }
    console.log(program.commands[1].open);

    socket.emit('post', urlDict);
    socket.on('returnValue', function (data) {
      console.log(data);
    });
	})
program.parse(process.argv);
