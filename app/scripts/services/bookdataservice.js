/*global angular: false */
(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name booksWebApp.bookDataService
     * @description
     * # bookDataService
     *
     * Service in the booksWebApp.
     * AngularJS will instantiate a singleton by calling "new" on this function.
     */
    angular.module('booksWebApp')
        .service('bookDataService', function ($http, $q, $log, summaryDataService) {

            this.createBook = function (book) {
                var urls, deferred, urlCalls = [], config = {headers: {'Content-Type': 'application/json;charset=utf-8;'}};

                urls = [{'url': 'http://localhost:8080/api/books'}];

                deferred = $q.defer();
                angular.forEach(urls, function (url) {
                    urlCalls.push($http.post(url.url, book, config));
                });
                
                if (!book.lastRead) {
                    book.lastRead = new Date();
                }

                // Still using 'all' even though only one Ajax call currently being made here.
                $q.all(urlCalls)
                    .then(
                        function () {
                            summaryDataService.clearCache();
                            deferred.resolve(true);
                        },
                        function (errors) {
                            $log.error('Failed to create a new book: ' + JSON.stringify(errors));
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
