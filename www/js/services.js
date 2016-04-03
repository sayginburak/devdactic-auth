angular.module('starter.services', ['starter.controllers','ngOpenFB', 'ionic.utils'])
 
.service('AuthService', function($q, $http, ngFB, $localstorage) {
  var LOCAL_TOKEN_KEY = 'authToken';
  var username = '';
  var isAuthenticated = false;
  // var role = '';
  var authToken;
  var access_token;
  var gender;
  var profile_pic;
  var name;
  var base_url = "http://localhost:3000/api/v1"
 
  function loadUserCredentials() {
    var token = $localstorage.getObject('userInfo').auth_token;
    if (token) {
      useCredentials();
    }
  }
 
  function storeUserCredentials(data) {
    $localstorage.setObject('userInfo', data)
    useCredentials();
  }
 
  function useCredentials() {
    userInfo = $localstorage.getObject('userInfo');
    username = userInfo.email;
    name = userInfo.name;
    gender = userInfo.gender;
    profile_pic = userInfo.profile_picture;
    isAuthenticated = true;
    authToken = userInfo.auth_token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    name = '';
    gender = '';
    profile_picture = '';
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    $localstorage.setObject('userInfo', undefined)
  }
 
  var login = function() {
    return $q(function(resolve, reject) {
      fbLogin().then(function() {
        url = base_url + "/users"
        data = {access_token:access_token}
        $http.post(url, data).then(function(response) {
          console.log(response.data)
          storeUserCredentials(response.data);
          resolve();
        })
      }, function() {
        reject();
      });
    });
  };

  var fbLogin = function () {
    deferred = $q.defer();
    ngFB.login({scope: 'email,public_profile'}).then(
        function (response) {
            if (response.status === 'connected') {
                access_token = response.authResponse.accessToken;
                deferred.resolve();
            } else {
                deferred.reject();
            }
        });
    return deferred.promise;
};
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };
 
  loadUserCredentials();
 
  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    name: function() {return name;},
    gender: function() {return gender;},
    profile_pic: function() {return profile_pic;}
    // role: function() {return role;}
  };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
 
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});