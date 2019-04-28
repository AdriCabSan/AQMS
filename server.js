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


server.listen(3000,()   => console.log('server on port: ',3000));

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
var Reading = {
    temp: 23,
    tvoc: 3,
    co2:3,
    hum:3,
    temp_sensation:4
}
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});


router.route('/aqms').post(function(req,res)
{
    console.log(req.body);
    Reading.temp= req.body.temp;
    Reading.tvoc= req.body.tvoc;
    Reading.co2= req.body.co2;
    Reading.hum= req.body.hum;
    Reading.temp_sensation= req.body.temp_sensation;
    io.emit('arduino:temp',{
        value:Reading.temp
    });
    io.emit('arduino:tvoc',{
        value:Reading.tvoc
    });
    io.emit('arduino:co2',{
        value:Reading.co2
    });
    io.emit('arduino:hum',{
        value:Reading.hum   
    });

    res.json({ message: 'created' });
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