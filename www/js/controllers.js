angular.module('starter.controllers', ['starter.services','ngOpenFB'])
 
.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, ngFB) {
  $scope.username = AuthService.username();
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
 
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
})
.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, ngFB) {
  $scope.data = {};
 
  $scope.login = function(data) {
    AuthService.login().then(function(authenticated) {
      $state.go('main.dash', {}, {reload: true});
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})
.controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService, ngFB) {
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };
});