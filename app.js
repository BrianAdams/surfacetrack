var gpsd = require('node-gpsd');
//var app = require('http').createServer(handler)
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/www/index.html');
});

console.log("added " + __dirname + '/bower_components');
app.use( '/bower_components',express.static(__dirname + '/bower_components'));

var daemon = new gpsd.Daemon({
    program: 'gpsd',
    device: '/dev/ttyUSB0',
    port: 2947,
    pid: '/tmp/gpsd.pid',
    logger: {
        info: function() {},
        warn: console.warn,
        error: console.error
    }
});

var listener = new gpsd.Listener({
    port: 2947,
    hostname: 'localhost',
    logger:  {
        info: function() {},
        warn: console.warn,
        error: console.error
    }
});

listener.on('TPV', function(tpvData){
    io.emit('TPV',tpvData);
});

listener.connect(function() {
    console.log('Connected');
});


// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
  listener.watch();
  socket.emit('welcome', { message: 'Welcome!' });
  socket.on('i am client', console.log);
});

server.listen(8083);
