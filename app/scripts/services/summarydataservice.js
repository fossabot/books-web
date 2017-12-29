/*global angular: false */
(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name booksWebApp.summaryDataService
     * @description
     * # summaryDataService
     *
     * Service in the booksWebApp.
     * AngularJS will instantiate a singleton by calling "new" on this function.
     */
    angular.module('booksWebApp')
        .service('summaryDataService', function ($http, $q, $log) {

            // Store retrieved JSON in this service.
            this.booksData = null;
            this.summaryData = null;

            /**
             * Get the remote JSON files - but only if they haven't already been
             * retrieved or the caller has specified that they dont want to use 
             * any existing data.
             */
            this.getRemoteData = function () {
                if (!this.booksData && !this.summaryData) {
                    var self = this;
                    return this.doGetHttpData(self);
                } else {
                    return $q.resolve({
                        'books': this.booksData,
                        'booksbyauthor': this.summaryData
                    });
                }
            };

            this.doGetHttpData = function (self) {
                var urls, deferred, urlCalls;

                urls = [{
                    'url': 'http://localhost:8080/api/books'
                }, {
                    'url': 'http://localhost:8080/api/books?author=Dr%20Zuess'
                }];

                deferred = $q.defer();
                urlCalls = [];
                // The 'cb' parameter stands for "cache buster"
                angular.forEach(urls, function (url) {
                    urlCalls.push($http.get(url.url + '?cb=' + Math.random()));
                });

                $q.all(urlCalls)
                    .then(
                        function (results) {
                            self.booksData = results[0].data;
                            self.summaryData = results[1].data;

                            deferred.resolve({
                                'books': results[0].data,
                                'booksbyauthor': results[1]
                            });
                        },
                        function (errors) {
                            $log.error('Failed to get summary and book data: ' + errors);
                            deferred.reject(errors);
                        },
                        function (updates) {
                            deferred.update(updates);
                        }
                    );

                return deferred.promise;
            };

        });
}());
