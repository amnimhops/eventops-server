var defaultFactoryInterceptor = {
    response: function (response) {
        return response.data
    },
    responseError: function (response) {
        var data = null;
        try {
            // if it is json return as is
            data = JSON.parse(response.data);
        } catch (e) {
            data = response.data
        }
        throw { statusCode: response.status, data: data };
    }
}

angular.module('evenTopsApp')
    .constant('baseURL', '/v1/')
    .factory('stateFactory', function () {
        var factory = {};
        factory.user = null;


        return factory;
    })
    .factory('cityFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        var res = $resource(baseURL + "cities", null, {
            'get': { method: 'GET', isArray:true,interceptor: defaultFactoryInterceptor }
        });

        return {
            find:function(q){
                return res.get({q:q}).$promise;
            }
        };
    }])
    .factory('userFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        var factory = {

        };

        factory.authenticate = function (email, password) {
            headers = {
                Authorization: 'Basic ' + btoa(email + ':' + password)
            }

            factory.resource = $resource(baseURL + "users/:id", null, {
                'add': { method: 'POST', headers: headers, interceptor: defaultFactoryInterceptor },
                'get': { method: 'GET', headers: headers, interceptor: defaultFactoryInterceptor },
                'update': { method: 'PUT', headers: headers, interceptor: defaultFactoryInterceptor },
                'query': { method: 'GET', headers: headers, isArray: true, interceptor: defaultFactoryInterceptor },
                'delete': { method: 'DELETE', headers: headers, interceptor: defaultFactoryInterceptor }
            });
        }

        factory.logout = function () {
            factory.resource = null;
        }

        factory.getUser = function (id) {
            if (!this.resource) {
                return Promise.reject('Not authenticated');
            } else {
                return this.resource.get({ id: id }).$promise;
            }
        }

        factory.newUser = function(data){
            return this.resource.add(null,data).$promise;
            
        }

        factory.updateUser = function(id,data){
            if (!this.resource) {
                return Promise.reject('Not authenticated');
            } else {
                return this.resource.update({ id: id },data).$promise;
            }
        }
        return factory;
    }])
    .factory('eventFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        var factory = {

        };

        factory.authenticate = function (email, password) {
            headers = {
                Authorization: 'Basic ' + btoa(email + ':' + password)
            }

            factory.resource = $resource(baseURL + "events/:id", null, {
                'add': { method: 'POST', headers: headers, interceptor: defaultFactoryInterceptor },
                'get': { method: 'GET', headers: headers, interceptor: defaultFactoryInterceptor },
                'update': { method: 'PUT', headers: headers, interceptor: defaultFactoryInterceptor },
                'query': { method: 'GET', headers: headers, isArray: true, interceptor: defaultFactoryInterceptor },
                'delete': { method: 'DELETE', headers: headers, interceptor: defaultFactoryInterceptor }
            });
        }

        factory.logout = function () {
            factory.resource = null;
        }

        factory.getEvent = function (id) {
            if (!this.resource) {
                return Promise.reject('Not authenticated');
            } else {
                return this.resource.get({ id: id }).$promise;
            }
        }

        factory.newEvent = function(data){
            return this.resource.add(null,data).$promise;
        }

        factory.updateEvent = function(id,data){
            if (!this.resource) {
                return Promise.reject('Not authenticated');
            } else {
                return this.resource.update({ id: id },data).$promise;
            }
        }

        factory.search = function(query){
            return this.resource.query(query).$promise;
        }

        factory.delete = function(id){
            return this.resource.delete({id:id}).$promise;
        }
        return factory;
    }])
    .factory('requestFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        var factory = {

        };

        factory.authenticate = function (email, password) {
            headers = {
                Authorization: 'Basic ' + btoa(email + ':' + password)
            }

            factory.resource = $resource(baseURL + "requests/:id", null, {
                'add': { method: 'POST', headers: headers, interceptor: defaultFactoryInterceptor },
                'get': { method: 'GET', headers: headers, interceptor: defaultFactoryInterceptor },
                'update': { method: 'PUT', headers: headers, interceptor: defaultFactoryInterceptor },
                'query': { method: 'GET', headers: headers, isArray: true, interceptor: defaultFactoryInterceptor },
                'delete': { method: 'DELETE', headers: headers, interceptor: defaultFactoryInterceptor }
            });
        }

        factory.logout = function () {
            factory.resource = null;
        }

        factory.getRequest = function (id) {
            if (!this.resource) {
                return Promise.reject('Not authenticated');
            } else {
                return this.resource.get({ id: id }).$promise;
            }
        }

        factory.newRequest = function(data){
            return this.resource.add(null,data).$promise;
        }

        factory.acceptRequest = function(id,accepted){
            if (!this.resource) {
                return Promise.reject('Not authenticated');
            } else {
                return this.resource.update({ id: id },{accepted:accepted}).$promise;
            }
        }

        factory.search = function(query){
            return this.resource.query(query).$promise;
        }

        factory.delete = function(id){
            return this.resource.delete({id:id}).$promise;
        }
        return factory;
    }])
	.factory('categoryFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        var factory = {

        };

		factory.authenticate = function (email, password) {
            headers = {
                Authorization: 'Basic ' + btoa(email + ':' + password)
            }

            factory.resource = $resource(baseURL + "categories/", null, {
                'query': { method: 'GET', headers: headers, isArray: true, interceptor: defaultFactoryInterceptor }
            });
        }

        factory.all = function(){
            return this.resource.query(null).$promise;
        }
        return factory;
    }])