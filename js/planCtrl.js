var planCtrl = angular.module('planCtrl', ['gservice']);

planCtrl.controller('planController', ['$scope', '$rootScope', '$http', '$cookies', '$location', '$compile', '$uibModal', 'gMap', function($scope, $rootScope, $http, $cookies, $location, $compile, $uibModal, gMap){


    var currentTitle = $cookies.get('currentTitle');
    $rootScope.showPlan = {}
    //From the Google Autofill object in initializeMap Function
    $rootScope.place = {};
    //Only some of things to be added to the DB. Too much comes back from Google to be storing in your own DB.
    $rootScope.spot = {};
    //the object which holds the getDetails method call response from Google
    $scope.spotDetails = {};
    // $scope.locations = [];
    $rootScope.mapCenter = {lat: 34.5133, lng: -94.1629};

    $rootScope.token = $cookies.get('token');
    console.log($rootScope.token);


  // This is for show page when user clicks on a spot, We should get details from Google.
   $scope.getSpotDetails = function(spot){
      var request = {
        placeId: spot.place_id
      };

      var service = new google.maps.places.PlacesService(map);

      service.getDetails(request, callback);

      function callback(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.spotDetails = place;
          console.log($scope.spotDetails);

          var modalInstance = $uibModal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              spotDetails: function () {
                return $scope.spotDetails;
              }
            }
          });
          gMap.refresh();

        }
      }

   };

  //Function that sends a query to the database for a plan based on plan ID.
  $scope.getOnePlan = function(){
    //get the id of the plan in context from the cookies.
    var id = $cookies.get('currentPlanId')
    var url = '/api/plans/' + id;
    $http({
      url: url,
      method: 'get',
      headers:{
        'x-access-token': $rootScope.token
      }
    }).then(function(response){
        //Put the returning plan in an object on the scope so we can use two way binding to show it on the view.
        $rootScope.showPlan = response.data;
        console.log($rootScope.showPlan);
        gMap.refresh();

    });
  }
  // On refresh this will bring the plan back from the database.
  angular.element(document).ready(function () {
        $scope.getOnePlan();
    });


  //When user clicks on the button in an info window.
  $rootScope.addSpot = function(){
    //push that spot in the showPlan object that holds all the info about the plan.
    $rootScope.showPlan.spots.push($rootScope.spot);
    //call the function that updates the database for that plan
    $scope.addSpotToDatabase();
  };

  //function that updates the database anytime a new spot is added.
  $scope.addSpotToDatabase = function(){
        //get the latest info on a plan.
        var plan = $rootScope.showPlan;
        //get the plan ID so we can send it to the right route.
        var id = $cookies.get('currentPlanId')
        var url = '/api/plans/' + id;
  
        $http({
          url: url,
          method: 'patch',
          headers:{
            'x-access-token': $rootScope.token
          },
          data: plan
        }).then(function(response){
            $rootScope.showPlan = response.data;
            var lastElement = $rootScope.showPlan.spots[$rootScope.showPlan.spots.length - 1]
            $rootScope,mapCenter = {lat: lastElement.geometry.location.lat, lng: lastElement.geometry.location.lng}

            gMap.refresh();

            // $scope.refresh();
        });
  }


}]);


planCtrl.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, spotDetails) {

  $scope.spotDetails = spotDetails;


  $scope.ok = function () {
    $uibModalInstance.close();
  };

});
