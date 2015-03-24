var SerialPort = require("serialport").SerialPort;
var MSP = require('./app/scripts/lib/msp.js');
var gps = require('./app/scripts/lib/gps.js');
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');   
var static = require('node-static');
var url = require('url');
var qs = require('querystring');
var exec = require('child_process').exec;


// start web server
app.listen(3000);
var fileServer = new static.Server('./app/');
console.log('http listening on port 3000');

function handler(req, res) {
    console.log(req.url);

    fileServer.serve(req, res, function(err, result) {
        if (err) console.log('fileServer error: ', err);
    });
}

rcData = {};

// socket.io connection event
io.sockets.on('connection', function(socket) {
    console.log('new socket.io client');
    socket.on('disconnect', function() {});

    /*
    socket.on('setRc', function(data) {

        if (gps.control != 1) {
	    rcData = data;
            sp.write(MSP.msg(MSP.codes.MSP_SET_RAW_RC, rcData));
	}
    });
    socket.on('gpsHold', function(data) {
        console.log('gpsHold', data);
        gps.control = data;
        gps.holdLat = dataToUi.gpsLat;
        gps.holdLon = dataToUi.gpsLon;
    });
    */
});

var dataToUi = {};

// new frame event from MSP library
MSP.newFrame.on('new', function(data) {
    // send to all connected socket.io clients
    //console.log('MSP.newFrame event',data);
    if (data.code == 109) {
        // altitude
        dataToUi.altitude = data.data[0];
    } else if (data.code == 106) {
        // raw_gps
        dataToUi.gpsSat = data.data[1];
        dataToUi.gpsLat = data.data[2];
        dataToUi.gpsLon = data.data[3];
        dataToUi.gpsAltitude = data.data[4];
        dataToUi.gpsSpeed = data.data[5];
    } else if (data.code == 108) {
        // attitude
	dataToUi.angx = data.data[0]; // 1/10 deg
	dataToUi.angy = data.data[1]; // 1/10 deg
	dataToUi.hdg = data.data[2]; // -180 to 180
    }
});

// open serial port
var sp = new SerialPort("COM22", { baudrate: 115200});

sp.on("open", function() {
    console.log('COM22 opened at  115200BPS, waiting 5 seconds to request data');
    
    sp.on('data', function(data) {
        MSP.read(data);
    });
    
    sleep(5000);
    // set timeout loop on requestLoop()
    setInterval(requestLoop, 200);
    // set timeout loop on updateUiLoop()
    setInterval(updateUiLoop, 1000);
});

function updateUiLoop() {
    // get rssi
    exec('iw dev wlan0 station dump|grep \'signal:\' | awk \'{print $2}\'', function(error, stdout, stderr) {
        dataToUi.rssi = stdout;
        // send dataToUi
        io.sockets.emit('dataToUi', dataToUi);
    });
}


// send repeating MSP requests
function requestLoop() {
    sp.write(MSP.msg(MSP.codes.MSP_RAW_GPS));
    sp.write(MSP.msg(MSP.codes.MSP_ALTITUDE));
    sp.write(MSP.msg(MSP.codes.MSP_ATTITUDE));
    //sp.write(MSP.msg(MSP.codes.MSP_RAW_IMU));
    //sp.write(MSP.msg(MSP.codes.MSP_MOTOR));
    //sp.write(MSP.msg(MSP.codes.MSP_RC));
    //sp.write(MSP.msg(MSP.codes.MSP_PIDNAMES));  
    //sp.write(MSP.msg(MSP.codes.MSP_IDENT));
    //sp.write(MSP.msg(MSP.codes.MSP_STATUS));
    
      
    
    //console.log(gps.control);

        if (gps.control == 1) {
	    // add gps angle mod
            var gpsControl = gps.hold(dataToUi.gpsLat, dataToUi.gpsLon, dataToUi.hdg);
	    // here gpsControl.rollA and pitchA represent the desired angle
	    // an rc value of 1500 would be 0 degrees, we need to +-210 from that
	    // max angle is 15, 210/14=15
	    console.log(gpsControl);
	    rcData[0] = 1500+(gpsControl.rollA*14);
	    rcData[1] = 1500+(gpsControl.pitchA*14);
	    console.log(rcData);
            sp.write(MSP.msg(MSP.codes.MSP_SET_RAW_RC, rcData));
	}
}

// don't use this except to delay the start
// if you spam MSP requests immediately after opening the serial port
// sometimes the FC crashes
function sleep(time) {
    var stop = new Date().getTime();
    while (new Date().getTime() < stop + time) {;
    }
}

// constrain within min max
Number.prototype.constrain = function(minimum, maximum) {
  if (this > maximum) {
    return maximum;
  } else if (this < minimum) {
    return minimum;
  } else {
    return Number(this);
  }
}
