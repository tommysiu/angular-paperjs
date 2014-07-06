/*
 * Copyright (c) 2014 Tommy Siu. Code licensed under the MIT License (MIT).
 */

'use strict';

var myApp = angular.module('angularPaper', ['ui.bootstrap']);

myApp.config(function($locationProvider) {
  $locationProvider.html5Mode(false);
});

myApp.controller('BoardCtrl', function($scope) {
  $scope.boardSize = 19;
  $scope.boardControl = {};
});

myApp.directive('board', ['$timeout', function(timer) {

  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element) {

      /*
       * Use an internalControl object to expose operations
       */
      scope.internalControl = scope.boardControl || {};
      scope.internalControl.resetBoard = function() {
        drawEmptyBoard(element[0]);
      };

      /*
       * Function to draw an empty board. This function will be called whenever
       * user reset the board.
       */
      function drawEmptyBoard(element) {

        // create a new empty board
        scope.board = goServer.createBoard(scope.boardSize);

        // setup the paper scope on canvas
        if (!scope.paper) {
          scope.paper = new paper.PaperScope();
          scope.paper.setup(element);
        }

        // clear all drawing items on active layer
        scope.paper.project.activeLayer.removeChildren();

        // draw the board
        var size = parseInt(scope.boardSize);
        var width = element.offsetWidth;
        var margin;
        switch (size) {
        case 9:
          margin = width * 0.08;
          break;
        case 13:
          margin = width * 0.05;
          break;
        default:
          margin = width * 0.033;
        }
        scope.interval = (width - 2 * margin) / (size - 1);

        // store the coordinates for mouse event detection
        scope.coord = [];
        var x = margin;
        for (var i = 0; i < size; i++) {
          scope.coord[i] = x;
          x += scope.interval;
        }

        // assign the global paper object
        paper = scope.paper;

        // draw the board grid
        for (var i = 0; i < size; i++) {

          // draw x axis
          var from = new paper.Point(scope.coord[0], scope.coord[i]);
          var to = new paper.Point(scope.coord[size - 1], scope.coord[i]);
          var path = new paper.Path();
          path.strokeColor = 'black';
          path.moveTo(from);
          path.lineTo(to);

          // draw y axis
          from = new paper.Point(scope.coord[i], scope.coord[0]);
          to = new paper.Point(scope.coord[i], scope.coord[size - 1]);
          path = new paper.Path();
          path.strokeColor = 'black';
          path.moveTo(from);
          path.lineTo(to);
        }

        paper.view.draw();
      }

      // bind the mouse down event to the element
      element.bind('mousedown', function(event) {
        var x, y;
        if (event.offsetX !== undefined) {
          x = event.offsetX;
          y = event.offsetY;
        } else { // Firefox compatibility
          x = event.layerX - event.currentTarget.offsetLeft;
          y = event.layerY - event.currentTarget.offsetTop;
        }

        // find the stone position
        x = Math.round((x - scope.coord[0]) / scope.interval);
        y = Math.round((y - scope.coord[0]) / scope.interval);

        if (!scope.board.isAllowed(x, y)) { return; }

        // draw the stone
        paper = scope.paper;
        var center = new paper.Point(scope.coord[x], scope.coord[y]);
        var circle = new paper.Path.Circle(center, scope.interval / 2 - 1);
        if (scope.board.nextColor() == goServer.moveType.BLACK) {
          circle.fillColor = 'black';
        } else {
          circle.fillColor = 'white';
          circle.strokeColor = 'black';
          circle.strokeWidth = 1;
        }
        paper.view.draw();

        scope.board.addMove(x, y);
      });

      timer(drawEmptyBoard(element[0]), 0);
    }
  };

}]);