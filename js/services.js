'use strict';

angular.module('app.services', [])
    .factory('localJson', function($q, $timeout, $http) {
    var LocalJson = {
        fetch: function() {

            var deferred = $q.defer();

            $timeout(function() {
                $http.get('data/social_progress_index.json').success(function(data) {
                    deferred.resolve(data);
                });
            }, 30);

            return deferred.promise;
        }
    };
    return LocalJson;
});
