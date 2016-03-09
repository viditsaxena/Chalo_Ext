// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gMap', ['$rootScope', '$http', '$compile', '$cookies', function($rootScope, $http, $compile, $cookies){

    // Initialize Variables
           // -------------------------------------------------------------

   $rootScope.place = {};
   $rootScope.spot = {};

   // Service our factory will return
   var googleMapService = {};
   googleMapService.refresh = function(){
           initializeMap();

   };



   function initializeMap () {

     // If map has not been created already...
     if (!map){
         // Create a new map and place in the index.html page
           var map = new google.maps.Map(document.getElementById('map'), {
           center: {lat: 34.5133, lng: -94.1629},
           zoom: 2
         });
     }
     var bounds = new google.maps.LatLngBounds();


     var input = /** @type {!HTMLInputElement} */(
         document.getElementById('pac-input'));


     var types = document.getElementById('type-selector');
     // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
     // map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

     var autocomplete = new google.maps.places.Autocomplete(input);
     autocomplete.bindTo('bounds', map);


     // INFO-WINDOW
     var infowindow = new google.maps.InfoWindow();
     var marker = new google.maps.Marker({
       map: map,
       anchorPoint: new google.maps.Point(0, -29)
     });


     autocomplete.addListener('place_changed', function() {
       infowindow.close();
       marker.setVisible(false);
       $rootScope.place = autocomplete.getPlace();
       console.log($rootScope.place);
       $rootScope.spot = {name:$rootScope.place.name, place_id:$rootScope.place.place_id, geometry:$rootScope.place.geometry}
       console.log($rootScope.spot);
       if (!$rootScope.place.geometry) {
         window.alert("Autocomplete's returned place contains no geometry");
         return;
       }
      //  map.fitBounds(bounds);
      //  If the place has a geometry, then present it on a map.
       if ($rootScope.place.geometry.viewport) {
         map.fitBounds($rootScope.place.geometry.viewport);
       } else {
         map.setCenter($rootScope.place.geometry.location);
         map.setZoom(5);  // Why 17? Because it looks good.
       }
       marker.setIcon(/** @type {google.maps.Icon} */({
         url: $rootScope.place.icon,
         size: new google.maps.Size(71, 71),
         origin: new google.maps.Point(0, 0),
         anchor: new google.maps.Point(17, 34),
         scaledSize: new google.maps.Size(35, 35)
       }));
       marker.setPosition($rootScope.place.geometry.location);
       marker.setVisible(true);

       var address = '';
       if ($rootScope.place.address_components) {
         address = [
           ($rootScope.place.address_components[0] && $rootScope.place.address_components[0].short_name || ''),
           ($rootScope.place.address_components[1] && $rootScope.place.address_components[1].short_name || ''),
           ($rootScope.place.address_components[2] && $rootScope.place.address_components[2].short_name || '')
         ].join(' ');
       }

       var contentString = '<div><strong>' + $rootScope.place.name + '</strong><br>' + address + ' <br><button class="btn btn-success" ng-click="addSpot()">Add this Spot</button>';
       var compiled = $compile(contentString)($rootScope);

       infowindow.setContent(compiled[0]);
       infowindow.open(map, marker);

       });


   }

  return googleMapService;


}]);
