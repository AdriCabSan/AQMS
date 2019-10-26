//IMPORTS
const express = require('express');
const socketIO=require('socket.io');
const bodyParser = require('body-parser')
const http = require('http');
const mosca = require('mosca');
//PORTS
const LOCAL_SERVER_PORT = 3000;
const MQTT_BROKER_PORT = 1883;
//SETTINGS
const settings = {
   port: MQTT_BROKER_PORT,
   
  };
//GLOBAL OBJECTS
const app = express();
const server =  http.createServer(app);
const io = socketIO.listen(server);
const router = express.Router();
const mosca_server = new mosca.Server(settings);
//WEBSERVER BASE LOGIC
app.use(express.static('public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
app.use('/api', router);
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: `incorrect values or format were send:${err.status}` });   
});
//app.use(express.static(path.dirname(require.resolve("mosca")) + "/public"))

app.set('port',process.env.PORT || LOCAL_SERVER_PORT);

app.get('/',(req,res,next)=> {
    res.sendFile(__dirname + '/views/index.html');
});
//SERVERS SETUPS
server.listen(app.get('port'),() => console.log(`server on port: ${app.get('port')}`));
io.on('connection',() => console.log('A new socket has connected'));
mosca_server.on('ready',() => console.log('Mosca secure server is up and running'));
//mosca_server.attachHttpServer(server);
//
let mqtt_status = {
  ID:0,
  TVOC: 0,
  CO2:0,
  Ethanol:0,
  H2:0,
  Temperature_C:0,
  Humidity:0,
  TEST: 0
}
//MQTT BROKER READINGS AND ANSWERS
mosca_server.on("error", function (err) {
  console.log(err);
});

mosca_server.on('clientConnected', function (client) {
  console.log('Client Connected \t:= ', client.id);
});

mosca_server.on('published', function (packet, client) {
  //sconsole.log(`Published := ${packet.payload.toString('utf-8')}`);
  let mqtt_packet= packet.payload.toString('utf-8');
  
  mapMqttRequestToReading(packet,mqtt_packet);
  printMQTTPackage(mqtt_status);
  emitMQTTSensorDataToFront(mqtt_status);

});//client.clients(elkey),id

mosca_server.on('subscribed', function (topic, client) {
  console.log("Subscribed :=", client.packet);
  console.log('from topic', topic);
});

mosca_server.on('unsubscribed', function (topic, client) {
  console.log('client unsubscribed := ', client);
  console.log('unsubscribed := ', topic);
});

mosca_server.on('clientDisconnecting', function (client) {
  console.log('clientDisconnecting := ', client.id);
});

mosca_server.on('clientDisconnected', function (client) {
  console.log('Client Disconnected     := ', client.id);
});

function mapMqttRequestToReading(packet,mqtt_packet){
  switch(packet.topic){
    case 'aqms/ethanol': mqtt_status.Ethanol= mqtt_packet; break;
    case 'aqms/h2': mqtt_status.H2= mqtt_packet; break;
    case 'aqms/humidity': mqtt_status.Humidity= mqtt_packet; break;
    case 'aqms/temperature': mqtt_status.Temperature_C= mqtt_packet; break;
    case 'aqms/eco2': mqtt_status.CO2= mqtt_packet; break;
    case 'aqms/tvoc': mqtt_status.TVOC= mqtt_packet; break;   
    case 'aqms/test': mqtt_status.TEST= mqtt_packet; break;    
  }
 // console.log(packet.topic);
  //console.log(mqtt_packet);
 
}
function emitMQTTSensorDataToFront(reading){
  io.emit('mqtt:temp',{
      value:reading.Temperature_C
  });
  io.emit('mqtt:tvoc',{
      value:reading.TVOC
  });
  io.emit('mqtt:co2',{
      value:reading.CO2
  });
  io.emit('mqtt:hum',{
      value:reading.Humidity   
  });
}
function printMQTTPackage(packet){
console.log(`eCO2: ${packet.CO2},TVOC: ${packet.TVOC}, Temp_C: ${packet.Temperature_C},Humid: ${packet.Humidity}`)
console.log(`Ethanol: ${packet.Ethanol}, H2: ${packet.H2} test:${packet.TEST}`);
}
//HTTP READINGS
var Reading = {
  ID: 1,
  CO2: 10,
  TVOC:44,
  Mllis: 22,
  Humidity: 22,
  Temperature_C: 27,
  Heat_Index:34

}
const handleErrorAsync = func => (req, res, next) => {
  func(req, res, next).catch((error) => next(error));
};

// middleware to use for all requests
router.use(function(req, res, next) {
    console.log('request incoming...');
    next();
});

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api <:D!' });   
});

router.post('/aqms',handleErrorAsync(async(req,res) =>
{
    console.log(req.body);
    var reading = mapRequestToReading(req);

      checkIfReadingIsMissing(reading,res) ? 
      res.json({ message: 'received but a value is missing' }) :
      res.json({ message: 'Reading was received' });
      emitHTTPSensorDataToFront(reading);
}));

function mapRequestToReading(req){
  var reading = Reading;
  reading.ID= req.body.ID;
  reading.CO2= req.body.CO2;
  reading.TVOC= req.body.TVOC;
  reading.Mllis= req.body.Millis;
  reading.Humidity= req.body.Humidity;
  reading.Temperature_C= req.body.Temperature_C;
  reading.Heat_Index= req.body.Heat_Index;
  return reading;
}
function checkIfReadingIsMissing(reading,res){
  var found = Object.keys(reading).filter(function(key) {
    return reading[key] == null;
  });
  if (found.length) {
    return true;
  }
  return false;
}

function emitHTTPSensorDataToFront(reading){
  io.emit('arduino:temp',{
      value:reading.Temperature_C
  });
  io.emit('arduino:tvoc',{
      value:reading.TVOC
  });
  io.emit('arduino:co2',{
      value:reading.CO2
  });
  io.emit('arduino:hum',{
      value:reading.Humidity   
  });
}