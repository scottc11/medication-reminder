'use strict';

angular.module('medicationReminderApp')
  .controller('MainCtrl', function ($scope, $http, $window, dataService) {

    $window.setInterval(function () {
        $scope.currentTime = moment().format('h:mm:ss A');
        $scope.currentDate = moment().format('MMM Do YYYY');
        $scope.minuteByMinute = moment().format('h:mm');
        $scope.$apply();
    }, 1000);

    var mockTime = {"time" : moment({ year :2016, month :9, day :21, hour: 9, minute: 34 })};
    $scope.missedMeds = [];
    $scope.meds = [];



    // getting global data from service and applying it to $scope.meds
    dataService.getData(function(response) {
      $scope.meds = response.data;

      // for (var i = 0; i < $scope.meds.length; i++) {
      //   console.log("scope: " + moment($scope.meds[i].time).format("dddd, MMMM Do YYYY, h:mm:ss a"));
      //   console.log("Mock:" + mockTime.time.format("dddd, MMMM Do YYYY, h:mm:ss a"));
      //   console.log(mockTime.time.diff(moment($scope.meds[i].time), 'm' ));
      // }

      for (var i = 0; i < $scope.meds.length; i++) {

        var differenceInTime = moment().diff(moment($scope.meds[i].time), 'm' );

        // assign appropriate glyphicons based on medication schedule
        if ( differenceInTime < 0) {
          $scope.meds[i].missed = false;
          $scope.meds[i].medStatus = "glyphicon-time"; // glyphicon class for medication status
        }
        else if ( differenceInTime > 0) {
          $scope.meds[i].missed = true;
          $scope.meds[i].medStatus = "glyphicon-exclamation-sign"; // glyphicon class for medication status
        }

        $scope.meds[i].formattedTime = moment(new Date($scope.meds[i].time).toISOString()).format('h:mm A');  // not sure why this was so hard
        $scope.meds[i].showButton = false;

      }
    });


    // At intervals of 1 min, check to see if any uncompleted meds need
    // to be taken and display the 'completed' button.
    $scope.$watch('minuteByMinute', function() {
      for (var i = 0; i < $scope.meds.length; i++) {

        var differenceInTime = moment().diff(moment($scope.meds[i].time), 'm' );

        if (differenceInTime < 5 && differenceInTime > -5 ) {

          if ($scope.meds[i].completed == false) {
            var sound = new Audio("../../assets/audio/yell.wav");
            sound.volume = 0.5;
            sound.play();
            $scope.meds[i].showButton = true;
          }

        }

        if (differenceInTime >= 5 && differenceInTime <= 6) {
          var sound = new Audio("../../assets/audio/yell.wav");
          sound.volume = 1;
          sound.play();
          $scope.meds[i].showButton = true;
        }

      }
    });



    // upon click of 'completed' button, do stuff
    $scope.complete = function(med) {
      med.medStatus = "glyphicon-ok-circle";
      med.completed = true;
      med.showButton = false;
      dataService.complete(med); // this function would change the data base data
    }

  })

  // loading the data into a service so it is availble across mukltiple controllers
  .service('dataService', function($http) {

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    // getting the medication data from the database
    // putting data in a call back so it is always
    // available before the creation of any variables prior to the db call
    this.getData = function(callback) {
      $http.get('/api/medications?start=' + start + '&end=' + end)
        .then(callback)
    }

    this.complete = function(medication) {
      console.log("change med to completed in db");
    }

  }
);
