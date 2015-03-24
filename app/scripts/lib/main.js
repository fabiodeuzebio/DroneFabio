$(document).ready(function() {

    var socket = io.connect('');
    socket.on('dataToUi', function(data) {

        $('#altitudeVal').html(data.altitude);
        $('#rssiVal').html(data.rssi);
        $('#gpsAltitudeVal').html(data.gpsAltitude);
        $('#gpsNumSatVal').html(data.gpsSat);
        $('#gpsLatLonVal').html(data.gpsLat + ' / ' + data.gpsLon);
        $('#gpsSpeedVal').html(data.gpsSpeed);
        $('#angxVal').html(data.angx);
        $('#angyVal').html(data.angy);
        $('#hdgVal').html(data.hdg);

        if (data.rssi < -75) {
            $('#rssiVal').css('background-color', 'red');
        } else {
            $('#rssiVal').css('background-color', 'white');
        }

    });

    
});
