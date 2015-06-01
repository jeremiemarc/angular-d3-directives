'use strict';

angular.module('app', [
        'ngRoute',
        'ngResource',
        'app.controllers',
        'app.directives',
        'app.services'
    ])
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/', {
                    title: 'Dataset',
                    templateUrl: 'partials/dataset.html',
                    controller: 'MainController'
                })
                .when('/bubble', {
                    title: 'Bubble Chart',
                    templateUrl: 'partials/bubble.html',
                    controller: 'BubbleController'

                }).otherwise({
                    redirectTo: '/'
                });
        }
    ])
    .run(['$location', '$rootScope', function($location, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {

            if (angular.isDefined(current.$$route)) {
                $rootScope.title = current.$$route.title;
            }
        });
    }]);
