'use strict';

angular
    .module('evenTopsApp', ['ui.router', 'ngResource'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: '/',
                views: {
                    'header': {
                        cache:false, /* OJITO: poner true a produccion */
                        templateUrl: 'views/header.html',
                        controller: 'MenuController'
                    },
                    'content': {
                        cache:false, /* OJITO: poner true a produccion */
                        templateUrl: 'views/home.html',
                    },
                    'footer': {
                        cache:false, /* OJITO: poner true a produccion */
                        templateUrl: 'views/footer.html',
                    }
                }

            })

            // aboutus.html
            .state('app.aboutus', {
                url: 'aboutus',
                views: {
                    'content@': {
                        templateUrl: 'views/aboutus.html',
                    }
                }
            })

            // contactus.html
            .state('app.contactus', {
                url: 'contactus',
                views: {
                    'content@': {
                        templateUrl: 'views/contactus.html',
                    }
                }
            })

            // toc.html
            .state('app.toc', {
                url: 'toc',
                views: {
                    'content@': {
                        templateUrl: 'views/toc.html',
                    }
                }
            })

            // login.html
            .state('app.login', {
                url: 'login',
                views: {
                    'content@': {
                        templateUrl: 'views/login.html',
                        controller: 'UserController'
                    }
                }
            })

            // register.html
            .state('app.register', {
                url: 'register',
                views: {
                    'content@': {
                        templateUrl: 'views/register.html',
                        controller: 'UserController'
                    }
                }
            })
            
            // profile.html
            .state('app.profile', {
                url: 'profile',
                views: {
                    'content@': {
                        templateUrl: 'views/profile.html',
                        controller: 'UserController'
                    }
                }
            })
            // events.html
            .state('app.search', {
                url: 'search',
                views: {
                    'content@': {
                        templateUrl: 'views/search.html',
                        controller: 'EventMapController'
                    }
                }
            })

            // route for the dishdetail page
            .state('app.event', {
                url: 'event/:id',
                views: {
                    'content@': {
                        templateUrl: 'views/event.html',
                        controller: 'EventController'
                    }
                }
            });

        $urlRouterProvider.otherwise('/');
    })
    ;