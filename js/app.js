

var unwanderApp = angular.module('unwanderApp', ['gservice', 'ngCookies']);




unwanderApp.controller('mainController', ['$scope', '$rootScope', '$http', '$cookies', '$location', 'gMap', function($scope, $rootScope, $http, $cookies, $location, gMap){
// *******************************Initialize Variables.
    $scope.token;
    $scope.message;
    $scope.logInUser = {};

    $scope.newPlan = {title:'', userId: ''}//need the user id because of the user reference in plan schema
    $scope.currentUserPlans = [];//for the dropdown to show user plans
    $scope.currentPlan = {};//plan to add the spots to.
    $rootScope.selectedText = "";//selected text from the webpage.

// *******************************Start of functions

//Two Cases to check if the user is logged in on the website already. If so, get token and logInUserId

  //Chrome API Usage below. Get the details from the website cookies.
  chrome.cookies.get({url: "http://localhost:8080/", name: "token"}, function(token){
    if (token){
      $scope.token = token.value;
      chrome.cookies.get({url: "http://localhost:8080/", name: "currentPlanId"}, function(currentPlanId){
        $scope.currentPlan._id = currentPlanId.value
      });
      chrome.cookies.get({url: "http://localhost:8080/", name: "logInUserId"}, function(logInUserId){
        $scope.logInUser.id = logInUserId.value;
        $scope.newPlan.userId = logInUserId.value;
        $scope.getCurrentUserPlans();
      });

      angular.element(document).ready(function () {
        //load the map from the service.
        gMap.refresh();
        //If any text was selected on the webpage, retrieve it from the chrome storage.
        chrome.storage.sync.get('selectedText', function(items) {
          $rootScope.selectedText = items.selectedText;
          //empty out the chrome storage with selected text after adding it to the variable.
          chrome.storage.sync.set({'selectedText': ''}, function() {
          });
        });
       });
    } else {
    $scope.message = "You are not logged in. Please log in first."
    }
  });

// Get Current Users Plans
    $scope.getCurrentUserPlans = function(){
      //route at the back end.
      var url = 'http://localhost:8080/api/plans/search?userId=' + $scope.logInUser.id;
      $http({
        url: url,
        method: 'get',
        headers:{
          'x-access-token': $scope.token
        }
      }).then(function(response){
        $scope.currentUserPlans = response.data;
        //Find the current plan object in the current User Plans array from the plan id we have.
        function findCurrentPlan(plan) {
          return plan._id === $scope.currentPlan._id;
        }
        $scope.currentPlan = $scope.currentUserPlans.find(findCurrentPlan)
      });
    }

    //This is to open the current plan page on the website in a new tab
    $scope.openUnwanderTab = function(){
     chrome.tabs.create({url: "http://localhost:8080/#/show"});
    }

    //If user is not logged in then log in first. Also includes code so user does not have to log in on the website again if user logs in through the extension.
    $scope.obtainToken = function(){
      $http.post("http://localhost:8080/api/users/authentication_token", $scope.logInUser).then(function(response){
        $scope.token = response.data.token;
        $scope.logInUser.id = response.data.id;
        //find the website and set its cookies with the token value and log in user ID
        chrome.cookies.set({url: "http://localhost:8080/", name: "token", value: $scope.token});
        chrome.cookies.set({url: "http://localhost:8080/", name: "logInUserId", value: $scope.logInUser.id});

        //this is the same as above
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

    //If the user wants to add a plan directly from the extension.
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


    //This is for the plans drop down, when user clicks on a plan.
    $scope.selectOnePlan = function(plan){
      $scope.currentPlan = plan;
      chrome.cookies.set({url: "http://localhost:8080/", name: "currentPlanId", value: plan._id});
    }

    //When user clicks on the add spot button in the info window.
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
