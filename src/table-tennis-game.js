'use strict';

var moment = require('moment'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter;

function TableTennisGame(initialPlayer, maxPlayers, durationInMinutes, timeoutInMinutes) {
  EventEmitter.call(this);

  this.players = [initialPlayer];
  this.maxPlayers = maxPlayers || 4;
  this.started = false;
  this.finished = false;

  this.initiated = moment();
  this.timeout = moment.duration(timeoutInMinutes || 5, 'minutes');
  this.duration = moment.duration(durationInMinutes || 30, 'minutes');
}

util.inherits(TableTennisGame, EventEmitter);

TableTennisGame.prototype.timeLeft = function() {
  if (!this.started) {
    return moment.duration(0);
  }

  return this.startTime.add(this.duration).fromNow(true);
};

TableTennisGame.prototype.getPlayerList = function(sep) {
  return this.players.join(sep || ', ');
};

TableTennisGame.prototype.hasPlayer = function(player) {
  return this.players.indexOf(player) >= 0;
};

TableTennisGame.prototype.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

TableTennisGame.prototype.isTimedOut = function() {
  return !this.started && moment().isAfter(this.initiated.add(this.timeout));
};

TableTennisGame.prototype.isFinished = function() {
  return this.finished || this.isTimedOut();
};

TableTennisGame.prototype.isStarted = function() {
  return this.started;
};

TableTennisGame.prototype.addPlayer = function(player) {
  if (this.hasPlayer(player) || this.isFull()) {
    throw "Couldn't add player to game, it was either full or the player was already playing.";
  }

  this.players.push(player);

  if (this.isFull()) {
    this.emitAsync('tt.full');
  }
};

TableTennisGame.prototype.start = function() {
  this.started = true;
  this.startTime = moment();

  setTimeout(this.finish.bind(this), this.duration.asMilliseconds());

  this.emitAsync('tt.start');
};

TableTennisGame.prototype.finish = function() {
  this.finished = true;
  this.finishTime = moment();

  this.emitAsync('tt.finish');
};

TableTennisGame.prototype.emitAsync = function(event) {
  setTimeout(function() {
    this.emit(event);
  }.bind(this));
};

module.exports = TableTennisGame;
