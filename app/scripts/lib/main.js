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

(function() {

    'use strict';

    angular.module('DroneFabio', [])
        .factory('DroneFabio.DroneService', DroneService)
        .controller('DroneFabio.RadioControleCtrl', RadioControleCtrl)
        .controller('DroneFabio.SensoresCtrl', SensoresCtrl)
        .controller('DroneFabio.GpsCtrl', GpsCtrl);

    function DroneService() {
        var metodosPublicos = {
            getGpsAltitude: _getGpsAltitude,
            getGpsSatelites: _getGpsSatelites
        };

        var dataService = {
            altitude: undefined,
            rssi: undefined,
            gpsAltitude: undefined,
            gpsSat: undefined,
            gpsLatLon: undefined,
            gpsSpeed: undefined,
            angx: undefined,
            angy: undefined,
            hdg: undefined
        };

        var socket = io.connect('');

        socket.on('dataToUi', function(data) {
            dataService.altitude = data.altitude;
            dataService.rssi = data.rssi;
            dataService.gpsAltitude = data.gpsAltitude;
            dataService.gpsSat = data.gpsSat;
            dataService.gpsLatLon = data.gpsLat + ' / ' + data.gpsLon;
            dataService.gpsSpeed = data.gpsSpeed;
            dataService.angx = data.angx;
            dataService.angy = data.angy;
            dataService.hdg = data.hdg;
        });

        function _getGpsAltitude() {
            return dataService.altitude;
        }

        function _getGpsSatelites() {
            return dataService.gpsSat;
        }


        return metodosPublicos;
    }

    /**
     * Rádio Controle
     * @type {Array}
     */
    RadioControleCtrl.$inject = ['$injector'];

    function RadioControleCtrl($injector) {
        var viewModel = this;
        var DroneService = $injector.get('DroneFabio.DroneService');

        init();

        function init() {
            initName();

            function initName() {
                getName();
            }
        }

        function getName() {
            viewModel.gpsAltitude = DroneService.getGpsAltitude();
        }
    }

    /**
     * Sensores
     * @type {Array}
     */
    SensoresCtrl.$inject = ['$injector'];

    function SensoresCtrl($injector) {
        var viewModel = this;
        var DroneService = $injector.get('DroneFabio.DroneService');

        init();

        function init() {
            initName();

            function initName() {
                getName();
            }
        }

        function getName() {
            viewModel.gpsAltitude = DroneService.getGpsAltitude();
        }

    }

    /**
     * GPS
     */
    GpsCtrl.$inject = ['$injector'];

    function GpsCtrl($injector) {
        var viewModel = this;
        var DroneService = $injector.get('DroneFabio.DroneService');

        viewModel.getAltitude = function() {
            return DroneService.getGpsAltitude();
        }

        viewModel.getGpsSatelites = function() {
            return DroneService.getGpsSatelites();
        }
    }

})();
