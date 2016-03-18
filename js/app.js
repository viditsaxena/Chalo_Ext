

var unwanderApp = angular.module('unwanderApp', ['gservice', 'ngCookies']);




unwanderApp.controller('mainController', ['$scope', '$rootScope', '$http', '$cookies', '$location', 'gMap', function($scope, $rootScope, $http, $cookies, $location, gMap){

    $scope.token;
    $scope.message;
    $scope.logInUser = {};
    $scope.newPlan = {title:'', userId: ''}
    $scope.currentUserPlans = [];
    $scope.currentPlan = {};
    $rootScope.selectedText = "";

    $scope.getCurrentUserPlans = function(){
      var url = 'http://localhost:8080/api/plans/search?userId=' + $scope.logInUser.id;
      $http({
        url: url,
        method: 'get',
        headers:{
          'x-access-token': $scope.token
        }
      }).then(function(response){
        $scope.currentUserPlans = response.data;

        function findCurrentPlan(plan) {
            return plan._id === $scope.currentPlan._id;
        }
        $scope.currentPlan = $scope.currentUserPlans.find(findCurrentPlan)
      });
    }



    //Two Cases to check if the user is logged in on the website already. If so, get token and logInUserId
    chrome.cookies.get({url: "http://localhost:8080/", name: "token"}, function(token){
      if (token){
        $scope.token = token.value;
        chrome.cookies.get({url: "http://localhost:8080/", name: "currentPlanId"}, function(currentPlanId){
          $scope.currentPlan._id = currentPlanId.value
          console.log($scope.currentPlan._id);
        });
        chrome.cookies.get({url: "http://localhost:8080/", name: "logInUserId"}, function(logInUserId){
        $scope.logInUser.id = logInUserId.value;
        $scope.newPlan.userId = logInUserId.value;
        $scope.getCurrentUserPlans();
        });


        angular.element(document).ready(function () {
            gMap.refresh();
            chrome.storage.sync.get('selectedText', function(items) {
              $rootScope.selectedText = items.selectedText;
              chrome.storage.sync.set({'selectedText': ''}, function() {
              });
            });
          });
      } else {
        $scope.message = "You are not logged in. Please log in first."
      }
    });

    $scope.openUnwanderTab = function(){
     chrome.tabs.create({url: "http://localhost:8080/#/show"});
    }

    //If user is not logged in then log in first.
    $scope.obtainToken = function(){
      $http.post("http://localhost:8080/api/users/authentication_token", $scope.logInUser).then(function(response){
        console.log(response);
        $scope.token = response.data.token;
        $scope.logInUser.id = response.data.id;
        chrome.cookies.set({url: "http://localhost:8080/", name: "token", value: $scope.token});
        chrome.cookies.set({url: "http://localhost:8080/", name: "logInUserId", value: $scope.logInUser.id});
        $scope.getCurrentUserPlans();
        angular.element(document).ready(function () {
              gMap.refresh();
              chrome.storage.sync.get('selectedText', function(items) {
                $rootScope.selectedText = items.selectedText;
                chrome.storage.sync.set({'selectedText': ''}, function() {
                });
              });
          });

      });
    };

    $scope.addNewPlan = function(){
      $http({
        url: 'http://localhost:8080/api/plans/',
        method: 'post',
        headers:{
          'x-access-token': $scope.token
        },
        data: $scope.newPlan
      }).then(function(response){
        //Get the title and id of the added plan and store it in cookies for use later.
        chrome.cookies.set({url: "http://localhost:8080/", name: "currentPlanId", value: response.data._id});
        chrome.cookies.set({url: "http://localhost:8080/", name: "currentTitle", value: response.data.title});

        $scope.newPlan.title = '';
        $scope.currentPlan = response.data
        $scope.currentUserPlans.push($scope.currentPlan);
      });
    };


    //This is for myPlans or Browse Plans section, when user clicks on a plan.
    $scope.selectOnePlan = function(plan){

      $scope.currentPlan = plan;
      chrome.cookies.set({url: "http://localhost:8080/", name: "currentPlanId", value: plan._id});


    }
    //When user clicks on the button in an info window.
    $rootScope.addSpot = function(){

      $scope.currentPlan.spots.push($rootScope.spot);
      //call the function that updates the database for that plan
      $scope.addSpotToDatabase();
    };

    //function that updates the database anytime a new spot is added.
    $scope.addSpotToDatabase = function(){
          //get the latest info on a plan.
          var plan = $scope.currentPlan;
          //get the plan ID so we can send it to the right route.
          var id = $scope.currentPlan._id
          var url = 'http://localhost:8080/api/plans/' + id;

          $http({
            url: url,
            method: 'patch',
            headers:{
              'x-access-token': $scope.token
            },
            data: plan
          }).then(function(response){
              console.log("New spot was added");
              $scope.currentPlan = response.data;

              gMap.refresh();
          });
    }

}]);
