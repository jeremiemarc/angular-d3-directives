'use strict';

angular.module('app.controllers', ['ngResource'])
    .controller('MainController', ['$scope', '$location', 'localJson', function($scope, $location, $localJson) {

        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };

        $localJson.fetch().then(function(data) {
            $scope.spi = data.index;
        });


    }]).controller('BubbleController', ['$scope', 'localJson', function($scope, $localJson) {

        $localJson.fetch().then(function(data) {
            $scope.d3Data = data.index;
        });
    }]);
