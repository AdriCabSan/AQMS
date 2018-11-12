const express = require('express');
const socketIO=require('socket.io');
const http = require('http');

const app = express();
const server =  http.createServer(app);
const io = socketIO.listen(server);

io.on('connection',()=>{console.log('A new socket has connected');});

app.get('/',(req,res,next)=> {
    res.sendFile(__dirname +'/index.html');
});

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();

const mySerial = new SerialPort("COM4",{
    baudRate:9600
});
var temperature,tVOC,Co2,humidity;
mySerial.on("open",() => console.log("Opened Serial Port"));
mySerial.on("data",(data) => {
    console.log(data.toString());
    io.emit('arduino:data',{
        value:data.toString()
    });
});

mySerial.on("err",(err) => {console.log(err.message);});
server.listen(3000,() => {console.log('server on port: ',3000);});