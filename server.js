const express = require('express');
const socketIO=require('socket.io');
const bodyParser = require('body-parser')
const http = require('http');

const app = express();
const server =  http.createServer(app);
const io = socketIO.listen(server);
var router = express.Router();              // get an instance of the express Router
//var reading= require('./app/models/nmcuReading');
app.use(express.static('public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
app.use('/api', router);
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: `incorrect values or format were send:${err.status}` });   
});

app.get('/',(req,res,next)=> {
    res.sendFile(__dirname + '/views/index.html');
});

const LOCAL_SERVER_PORT = 3000;

app.set('port',process.env.PORT || LOCAL_SERVER_PORT);
server.listen(app.get('port'),() => console.log(`server on port: ${app.get('port')}`));
io.on('connection',()   => console.log('A new socket has connected'));
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
  res.json({ message: 'hooray! welcome to our api!' });   
});

router.post('/aqms',handleErrorAsync(async(req,res) =>
{
    console.log(req.body);
    var reading = mapRequestToReading(req);

      checkIfReadingIsMissing(reading,res) ? 
      res.json({ message: 'received but a value is missing' }) :
      res.json({ message: 'Reading was received' });
      emitSensorDataToFront(reading);
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

function emitSensorDataToFront(reading){
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