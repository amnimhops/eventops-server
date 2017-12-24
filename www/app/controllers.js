'use strict';

var googleMapsAPIKey = 'AIzaSyDaGDlfn59m4Lq5xnwXAAudwNF2NZ1JUJQ';

angular.module('evenTopsApp')
    .controller('MenuController', ['$scope', '$state', 'userFactory', 'stateFactory', function ($scope, $state, userFactory, stateFactory) {
        $scope.userIsLogged = function () {
            return stateFactory.user;
        }
        $scope.logout = function(){
            document.cookie = "";
            stateFactory = {};

            userFactory.authenticate(null,null);
            
            $state.go("app");
        }
    }])
    .controller('UserController', ['$scope', '$state', 'userFactory', 'cityFactory', 'eventFactory', 'stateFactory', 'requestFactory', 'categoryFactory',function ($scope, $state, userFactory, cityFactory, eventFactory, stateFactory, requestFactory,categoryFactory) {
        $scope.stateFactory = stateFactory;
        $scope.user = null;
        $scope.loginForm = {
            email: null,
            password: null,
            error: null
        }
        $scope.registerFormModel = {
            name: null,
            email: null,
            city: {},
            password: null,
            suggestedCities: [],
            registerInProgress: false,
            state: 'waiting',
            error: null
        }
        $scope.requestModel = {
            event: null,
            email: null,
            status: {
                success: false,
                message: null
            }
        }

        $scope.rejectRequest = function(r){
            r.accepted = false;
            requestFactory.acceptRequest(r._id,r.accepted)
            .then((success)=>{
                console.log(success)
            })
            .catch((err)=>{
                console.log(error);
            });
        }

        $scope.acceptRequest = function(r){
            r.accepted = true;
            requestFactory.acceptRequest(r._id,r.accepted)
            .then((success)=>{
                console.log(success)
            })
            .catch((err)=>{
                console.log(error);
            });
        }
        
        stateFactory.receivedRequests = [];
        stateFactory.sentRequests = {};

        $scope.updateUserRequests = function(rl){
            stateFactory.receivedRequests = [];
            stateFactory.sentRequests = {};
            
            rl.forEach((r)=>{
                if(r.user._id == stateFactory.user._id){
                    stateFactory.receivedRequests.push(r);
                }
                if(r.sender._id==stateFactory.user._id){
                    if(stateFactory.sentRequests[r.event._id]==undefined){
                        stateFactory.sentRequests[r.event._id] = [];
                    }
                    stateFactory.sentRequests[r.event._id].push(r);
                }
            });
        }
        $scope.sendRequest = function () {
            if ($scope.requestModel.event == null) {
                $scope.requestModel.status.success = false;
                $scope.requestModel.status.message = "Select an event";
            } else if ($scope.requestModel.email == null) {
                $scope.requestModel.status.success = false;
                $scope.requestModel.status.message = "Check your friend's email";
            } else {
                requestFactory.newRequest({ eventId: $scope.requestModel.event._id, emails: [$scope.requestModel.email] })
                    .then((success) => {
                        $scope.requestModel.status.success = true;
                        $scope.requestModel.status.message = "Request sent successfully";

                        return requestFactory.search({});
                    })
                    .then((requests) => {
                        $scope.updateUserRequests(requests);
                    })
                    .catch((err) => {
                        $scope.requestModel.status.success = false;
                        $scope.requestModel.status.message = err.data;
                    });
            }
        }

        $scope.setRegisterCity = function (s) {
            $scope.registerFormModel.city = s;
            $scope.registerFormModel.suggestedCities = [];
        }

        $scope.updateSuggestedCities = function () {
            var city = $scope.registerFormModel.city;
            if (city && city.name.length >= 3) {
                cityFactory.find(city.name).then((cities) => {
                    $scope.registerFormModel.suggestedCities = cities;
                }).catch((err) => {
                    console.log(err);
                    $scope.registerFormModel.cities = [];
                })
            } else {
                $scope.registerFormModel.cities = [];
            }
        }

        $scope.register = function () {
            $scope.registerFormModel.state = 'registering';
            var user = {
                email: $scope.registerFormModel.email,
                password: $scope.registerFormModel.password,
                city: $scope.registerFormModel.city.name,
                name: $scope.registerFormModel.name,
                location: [0, 0]
            }
            // Create an un-authorized factory
            userFactory.authenticate(null, null);
            userFactory.newUser(user).then((success) => {
                // Show again the submit button (not needed)
                $scope.registerFormModel.state = 'waiting';
                // Create a new version of the factory with the 
                // Send the user to the login screen
                $state.go('app.login');
            }).catch((error) => {
                if (typeof (error.data) == 'string') {
                    // Simple error
                    $scope.registerFormModel.error = error.data;
                    $scope.registerFormModel.state = 'error';
                } else {
                    $scope.registerFormModel.error = 'API Error (' + error.statusCode + ') Check console';
                    $scope.registerFormModel.state = 'error';
                    console.log(error.data);
                }
            });
        }
        $scope.login = function () {
            if (stateFactory.user) {
                $state.go('app.profile');
            } else {
                var email = $scope.loginForm.email;
                var password = $scope.loginForm.password;
                console.log($scope.user);

                if ($scope.loginForm.email && $scope.loginForm.password) {
                    userFactory.authenticate($scope.loginForm.email, $scope.loginForm.password);
                    eventFactory.authenticate($scope.loginForm.email, $scope.loginForm.password);
                    requestFactory.authenticate($scope.loginForm.email, $scope.loginForm.password);
					categoryFactory.authenticate($scope.loginForm.email, $scope.loginForm.password);
                }

                userFactory.getUser('me').then((user) => {
                    stateFactory.user = user;
                    return eventFactory.search({ search: 'own' });
                })
                    .then((events) => {
                        stateFactory.userEvents = events;
                        console.log(events);
                        return requestFactory.search({});
                    })
                    .then((requests) => {
                        $scope.updateUserRequests(requests);

                        return categoryFactory.all();
                    })
					.then((categories)=>{
						stateFactory.categories = categories;
						console.log(categories);
						document.cookie = JSON.stringify({email:$scope.loginForm.email,password:$scope.loginForm.email});
                        $state.go('app.profile');
					})
                    .catch((err) => {
                        $scope.loginForm.error = "Login error, try again"
                    });
            }
        }
        $scope.updateProfile = function () {
            userFactory.updateUser(stateFactory.user._id, stateFactory.user)
                .then((status) => {
                    console.log(status);
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        $scope.deleteEvent = function (event) {
            eventFactory.delete(event._id).then((success) => {
                console.log(success);
                return eventFactory.search({ search: 'own' });
            }).then((events) => {
                stateFactory.userEvents = events;
            }).catch((err) => {
                console.log(err);
            })

        }
        $scope.formatISODate = function (s) {
            return moment(s).format("dddd, MMMM Do YYYY, h:mm:ss a");
        }
        $scope.eventEditModel = null;
        $scope.closeEditEvent = function () {
            $scope.eventEditModel = null;
            $("a[data-target='#events']").tab('show');
        }
        $scope.editEvent = function (data) {
            $("a[data-target='#eventform']").tab('show');
            $('#myTab a:last').tab('show');
            var badge = { label: 'new', color: 'blue' };
            if (data == null) {
                data = {
                    name: '',
                    address: '',
                    location: null,
                    start: new Date(),
                    end: new Date(),
                    description: '',
                    category:stateFactory.categories[0],
                    public: false
                }
            } else {
                badge.label = 'edit';
                badge.color = 'red';
				// Set the category to its stateFactory correspondence (remember the object identity)
				stateFactory.categories.forEach((c)=>{
						if(c._id == data.category._id){
							data.category = c;
						}
				});
            }
            $('#datetimepickerstart').data("DateTimePicker").date(moment(data.end));
            $('#datetimepickerend').data("DateTimePicker").date(moment(data.end));
            $scope.eventEditModel = {
                event: data,
                badge: badge,
                map: null,
                marker: null,
                status: null
            }

            /* Setup map */
            getUserLocation((err, loc) => { // Loc seems to be read only!
                var position = {};
                if ($scope.eventEditModel.event.location != null) {
                    // Override current position with event position.
                    // Remember that coordinates are stored reversed in mongodb!
                    position.latitude = $scope.eventEditModel.event.location[1];
                    position.longitude = $scope.eventEditModel.event.location[0];
                } else {
                    if (err) {
                        console.log(err);
                        position = { latitude: 39.487195, longitude: -0.354831 };
                    } else {
                        position = loc;
                    }
                }
                var center = new google.maps.LatLng(position.latitude, position.longitude);
                var props = {
                    center: center,
                    zoom: 17
                };
                // Reverse geocoding
                $scope.eventEditModel.geocoder = new google.maps.Geocoder;
                // create the map
                $scope.eventEditModel.map = new google.maps.Map(document.getElementById('editEventMap'), props);
                // marker overlay
                $scope.eventEditModel.marker = new google.maps.Marker({
                    position: center,
                    draggable: true,
                    title: "Drag me!"
                });
                $scope.eventEditModel.marker.setMap($scope.eventEditModel.map);
                //marker move listener
                google.maps.event.addListener($scope.eventEditModel.marker, 'dragend', function (e) {
                    $scope.eventEditModel.event.location = [e.latLng.lng(), e.latLng.lat()];
                    $scope.eventEditModel.geocoder.geocode({ location: e.latLng }, function (result, status) {
                        console.log(result, status);
                        if (status === 'OK') {
                            if (result[0]) {
                                $scope.eventEditModel.event.address = result[0].formatted_address;
                                $scope.$apply();
                            }
                        }
                    });
                });
                //$scope.eventEditModel.map.
            });

            /*new GeoMap("editEventMap",{

            })*/
        }

        $scope.saveEvent = function () {
            if ($scope.eventEditModel.event != null) {
                var data = $scope.eventEditModel.event;
				// Take only the category id
				data.category = data.category._id;
                // Take the start & end data from the pickers back to the model
				data.start = $('#datetimepickerstart').data("DateTimePicker").date().toISOString();
                data.end = $('#datetimepickerend').data("DateTimePicker").date().toISOString();

                // raml: datetime-only fails sending zone info, so remove it
                data.start = data.start.split("\.")[0];
                data.end = data.end.split("\.")[0];
                console.log(data);
                var promise = null;

                if ($scope.eventEditModel.event._id) {
                    promise = eventFactory.updateEvent(data._id, data);
                } else {
                    promise = eventFactory.newEvent(data);
                }

                promise.then((success) => {
                    console.log(success);
                    $scope.eventEditModel.status = {
                        cls: 'alert-success', message: 'Event saved successfully'
                    }
                    // Reload events
                    return eventFactory.search({ search: 'own' });
                }).then((events) => {
                    stateFactory.userEvents = events;
                }).catch((err) => {
                    console.log(err);
                    $scope.eventEditModel.status = {
                        cls: 'alert-danger', message: err
                    }
                });
            }
        }
        // Set the date pickers for the event form
        $('#datetimepickerstart').datetimepicker();
        $('#datetimepickerend').datetimepicker();

        try{
            var userinfo = JSON.parse(document.cookie);
            $scope.loginForm.email = userinfo.email;
            $scope.loginForm.password = userinfo.password;
            $scope.login();
        }catch(err){
            document.cookie = "";
        }
        
    }])
    .controller('EventMapController', ['$scope', '$state', 'eventFactory', 'stateFactory', function ($scope, $state, eventFactory, stateFactory) {
        $scope.searchOptions = {
            visible: false,
            distance: 1000
        }
        $scope.userPosition = null;
        $scope.events = [];
        $scope.center = null;

        $scope.toggleSearch = function () {
            $scope.searchOptions.visible = !$scope.searchOptions.visible;
        }

        $('#searchstart').datetimepicker().data("DateTimePicker").date(moment(new Date()));
        $('#searchend').datetimepicker().data("DateTimePicker").date(moment(new Date()).add(1, 'days'));

        eventFactory.authenticate(null, null);

        getUserLocation((err, loc) => { // Loc seems to be read only!
            var position = {};
            if (err) {
                console.log(err);
                position = { latitude: 39.487195, longitude: -0.354831 }; // Valencia, a good place to visit ;)
            } else {
                position = loc;
            }

            $scope.center = new google.maps.LatLng(position.latitude, position.longitude);
            var props = {
                center: $scope.center,
                zoom: 14
            };

            // create the map
            $scope.map = new google.maps.Map(document.getElementById('event-search-map'), props);
            // marker overlay
            $scope.marker = new google.maps.Marker({
                position: $scope.center,
                draggable: true,
                //icon: 'images/here.png',
                title: "Drag this to change the origin of the search!"
            });

            $scope.marker.setMap($scope.map);
            $scope.map.setCenter($scope.center);

            $scope.circle = new google.maps.Circle({
                strokeColor: '#00bc8c',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#00bc8c',
                fillOpacity: 0.35,
                map: $scope.map,
                center: $scope.center,
                radius: $scope.searchOptions.distance
            });

            $scope.$watch('searchOptions.distance', function () {
                $scope.circle.setRadius($scope.searchOptions.distance);
                $scope.findEvents();
            })

            $scope.marker.addListener('dragend', function (e) {
                $scope.center = e.latLng;
                $scope.circle.setCenter($scope.center);
                $scope.findEvents();
            });

            $scope.findEvents();
        });

        $scope.findEvents = function () {
            if (!$scope.searching) {
                $scope.searching = true;

                var start = $('#searchstart').data("DateTimePicker").date().toISOString().split("\.")[0];
                var end = $('#searchend').data("DateTimePicker").date().toISOString().split("\.")[0];

                eventFactory.search({
                    search: 'filter',
                    start: start,
                    end: end,
                    categories: [],
                    lat: $scope.center.lat(),
                    lng: $scope.center.lng(),
                    distance: $scope.searchOptions.distance
                }).then((events) => {
                    for (var i in $scope.events) {
                        $scope.events[i].marker.setMap(null);
                    }
                    $scope.events = [];
                    for (var i in events) {
                        $scope.events.push({
                            marker: new google.maps.Marker({
                                position: new google.maps.LatLng(events[i].location[1], events[i].location[0]),
								icon:events[i].category.icon,
                                draggable: false,
                                title: events[i].name,
                                map: $scope.map
                            }),
                            info: new google.maps.InfoWindow({
                                content: "<div class='info-window'><h1>" + events[i].name + "</h1><p>Starts " + moment(events[i].start).format("dddd, MMMM Do YYYY, h:mm:ss a") + "</p><p style='text-align:right;'>See <a style='text-decoration:underline;color:blue;font-weight:bold' href='#!/event/" + events[i]._id + "'>details</a></div>"
                            })
                        });
                        (function (event) {
                            event.marker.addListener('click', function () {
                                for (var e in $scope.events) {
                                    // Close any other info window
                                    $scope.events[e].info.close();
                                }
                                event.info.open($scope.map, event.marker);
                            })
                        })($scope.events[i]);

                        //$scope.events[i].marker.set>M
                    }
                    $scope.searching = false;
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                console.log('Other search is in progress')
            }
        }
    }])
    .controller('EventController', ['$scope', '$state', '$stateParams', 'userFactory', 'cityFactory', 'eventFactory', 'stateFactory', 'requestFactory', '$sce', function ($scope, $state, $stateParams, userFactory, cityFactory, eventFactory, stateFactory, requestFactory, $sce) {
        $scope.error = null;
        $scope.event = null;
        $scope.description = null;
        $scope.map = null;
		$scope.moment = moment;
        eventFactory.authenticate(null, null);
        eventFactory.getEvent($stateParams.id)
            .then((event) => {
                $scope.event = event;
                $scope.description = $sce.trustAsHtml(event.description);

                // create the map
                var center = new google.maps.LatLng(event.location[1], event.location[0]);
                $scope.map = new google.maps.Map(document.getElementById('event-location'), { zoom: 15, center: center });

                var eventMarker = new google.maps.Marker({
                    position: center,
                    draggable: false,
                    title: "Here is the action!",
                    map: $scope.map
                });

                getUserLocation((err, loc) => {
                    if (err) {
                        console.log(err);
                    } else {
                        var userMarker = new google.maps.Marker({
                            position: new google.maps.LatLng(loc.latitude, loc.longitude),
                            draggable: false,
                            title: "You are here!",
                            icon: 'images/here.png',
                            map: $scope.map
                        });
                        
                    }
                    var bounds = new google.maps.LatLngBounds();
                    bounds.extend(eventMarker.getPosition());
                    bounds.extend(userMarker.getPosition());
                    $scope.map.fitBounds(bounds);
                });
            })
            .catch((err) => {
                //console.log(err);
                throw err;
            });
    }]);

