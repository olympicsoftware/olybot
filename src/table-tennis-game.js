'use strict';

var moment = require('moment'),
  humanizeList = require('humanize-list'),
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

  this.timeoutTimer = setTimeout(
    this.cancel.bind(this),
    this.timeout.asMilliseconds()
  );
}

util.inherits(TableTennisGame, EventEmitter);

TableTennisGame.prototype.timeLeft = function() {
  if (!this.started) {
    return this.initiated.add(this.timeout).fromNow(true);
  }

  return this.startTime.add(this.duration).fromNow(true);
};

TableTennisGame.prototype.getPlayerList = function() {
  return humanizeList(this.players);
};

TableTennisGame.prototype.hasPlayer = function(player) {
  return this.players.indexOf(player) >= 0;
};

TableTennisGame.prototype.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

TableTennisGame.prototype.isFinished = function() {
  return this.finished;
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
  clearTimeout(this.timeoutTimer);

  this.started = true;
  this.startTime = moment();

  this.gameTimer = setTimeout(
    this.finish.bind(this),
    this.duration.asMilliseconds()
  );

  this.emitAsync('tt.start');
};

TableTennisGame.prototype.finish = function(eventOverride) {
  clearTimeout(this.gameTimer);

  this.finished = true;
  this.finishTime = moment();

  this.emitAsync(eventOverride || 'tt.finish');
};

TableTennisGame.prototype.cancel = function() {
  this.finish('tt.cancel');
};

TableTennisGame.prototype.emitAsync = function(event) {
  setTimeout(function() {
    this.emit(event);
  }.bind(this));
};

module.exports = TableTennisGame;
