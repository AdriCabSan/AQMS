const express = require('express');
const socketIO=require('socket.io');
const bodyParser = require('body-parser')

const http = require('http');

const app = express();
const server =  http.createServer(app);
const io = socketIO.listen(server);
var router = express.Router();              // get an instance of the express Router
//var reading     = require('./app/models/nmcuReading');
app.use(express.static('public/'));
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use('/api', router);

app.get('/',(req,res,next)=> {
    res.sendFile(__dirname + '/views/index.html');
});




const LOCAL_SERVER_PORT = 3000;

app.set('port',process.env.PORT || LOCAL_SERVER_PORT);
server.listen(app.get('port'),() => console.log(`server on port: ${app.get('port')}`));

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
var Reading = {
    ID: 1,
    CO2: 10,
    TVOC:44,
    Mllis: 22,
    Humidity: 22,
    Temperature_C: 27,
    Heat_Index:34

}
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.route('/aqms').post(function(req,res,err)
{
    
    console.log(req.body);
    Reading.ID= req.body.ID;
    Reading.CO2= req.body.CO2;
    Reading.TVOC= req.body.TVOC;
    Reading.Mllis= req.body.Millis;
    Reading.Humidity= req.body.Humidity;
    Reading.Temperature_C= req.body.Temperature_C;
    Reading.Heat_Index= req.body.Heat_Index;

    var found = Object.keys(Reading).filter(function(key) {
        return Reading[key] == null;
      });
      if (found.length) {
        res.json({ message: 'received but a value is missing' });
        return;
      }

    if (Reading != null){
        io.emit('arduino:temp',{
            value:Reading.Temperature_C
        });
        io.emit('arduino:tvoc',{
            value:Reading.TVOC
        });
        io.emit('arduino:co2',{
            value:Reading.CO2
        });
        io.emit('arduino:hum',{
            value:Reading.Humidity   
        });
    
        res.json({ message: 'Reading was received' });
    }
    

    else{
        res.json({ message: 'incorrect values were send' });
    }
  
});
let temperature,tVOC,Co2,humidity;
io.on('connection',()   => console.log('A new socket has connected'));

/* console.log(`Temp:${temperature}, humidity:${humidity}, Co2:${Co2}, TVOC:${tVOC}`);
this.log({test: 'log'}, 'Air Quality'); */

io.emit('arduino:temp',{
    value:temperature
});
io.emit('arduino:tvoc',{
    value:tVOC
});
io.emit('arduino:co2',{
    value:Co2
});
io.emit('arduino:hum',{
    value:humidity
});



this.log = function() {
    var args = [];
    args.push('[' + new Date().toUTCString() + '] ');
    //now add all the other arguments that were passed in:
    for (var _i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      args.push(arg);
    }

    //pass it all into the "real" log function
   // window.console.log.apply(window.console, args); 
}