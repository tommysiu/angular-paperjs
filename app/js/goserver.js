/*
 * Copyright (c) 2014 Tommy Siu. Code licensed under the MIT License (MIT).
 */

'use strict';

/*
 * Our namespaces.
 */
var goServer = window.goServer || {};

goServer.color = {
  EMPTY: 0,
  BLACK: -1,
  WHITE: 1
};

goServer.moveType = {
  PASS: 0,
  BLACK: -1,
  WHITE: 1
};

goServer.createBoard = function(size) {
  return new goServer.Board(size);
};

/*
 * The move class.
 */
goServer.Move = function() {
  this.init.apply(this, arguments);
};

goServer.Move.prototype = {
  init: function(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.remove = [];
  }
};

/*
 * The board class.
 */
goServer.Board = function() {
  this.init.apply(this, arguments);
};

goServer.Board.prototype = {
  init: function(size) {
    this.size = size;
    this.data = [];
    for (var i = 0; i < size; i++) {
      this.data[i] = [];
      for (var j = 0; j < size; j++) {
        this.data[i][j] = goServer.color.EMPTY;
      }
    }
    this.moves = [];
    this.lastMove = null;
  },
  addMove: function(x, y) {
    var m = new goServer.Move(this.nextColor(), x, y);
    this.moves.push(m);
    this.data[x][y] = m;
    this.lastMove = m;
  },
  nextColor: function() {
    var n = this.getNumMoves();
    for (var i = n - 1; i >= 0; i--) {
      var m = this.moves[i];
      if (m.type == goServer.moveType.PASS) {
        continue;
      } else if (m.type == goServer.moveType.BLACK) {
        return goServer.moveType.WHITE;
      } else {
        return goServer.moveType.BLACK;
      }
    }
    return goServer.moveType.BLACK;
  },
  isAllowed: function(x, y, color) {
    if (this.data[x][y] != goServer.color.EMPTY) { return false; }
    return true;
  },
  getNumMoves: function() {
    return this.moves.length;
  }
};
