'use strict';

var TableTennisGame = require('../src/table-tennis-game');

module.exports = function(robot) {
  var currentGame;

  function isTableFree() {
    return !currentGame || currentGame.isFinished();
  }

  function onFull() {
    currentGame.start();
  }

  function onStart() {
    robot.messageRoom('bottesting', 'glhf ' + currentGame.getPlayerList() + '.');
  }

  function onFinish() {
    robot.messageRoom('bottesting', 'gg ' + currentGame.getPlayerList() + '.');
  }

  function onCancel() {
    robot.messageRoom('bottesting', 'Game cancelled with ' + currentGame.timeLeft() + ' left.');
  }

  robot.respond(/tt$/, function(res) {
    if (isTableFree()) {
      currentGame = new TableTennisGame(res.envelope.user.name);

      currentGame.on('tt.full', onFull);
      currentGame.on('tt.start', onStart);
      currentGame.on('tt.finish', onFinish);
      currentGame.on('tt.cancel', onCancel);

      return res.send('<!channel>: @' + res.envelope.user.name + ' started a table tennis game. Say "in" to join the game.');
    }

    if (!currentGame.isStarted()) {
      return res.send(currentGame.getPlayerList() + ' are waiting for more players. Say "in" to join the game.');
    }

    return res.send(currentGame.getPlayerList() + ' are currently in a game. They should be finished in about ' + currentGame.timeLeft() + '.');
  });

  robot.hear(/in/, function(res) {
    if (isTableFree()) {
      return;
    }

    var joiner = res.envelope.user.name;

    if (currentGame.hasPlayer(joiner)) {
      res.send('Rack off pleb, you\'re already in the game.');
      return;
    }

    if (currentGame.isStarted()) {
      res.send('Too late fullah, game\'s started.');
      return;
    }

    if (currentGame.isFull()) {
      res.send('Too late bruh, game\'s full.');
      return;
    }

    currentGame.addPlayer(joiner);

    res.send(currentGame.getPlayerList() + ' are in the game.');
  });

  robot.respond(/tt cancel$/, function(res) {
    if (isTableFree()) {
      return res.send('There is no current game.');
    }

    currentGame.cancel();
  });

  robot.respond(/tt timeleft$/, function(res) {
    if (isTableFree()) {
      return res.send('There is no current TT game.');
    }

    if (!currentGame.isStarted()) {
      return res.send('There is ' + currentGame.timeLeft() + ' left to join the game.');
    }

    return res.send('Current game will be finished in ' + currentGame.timeLeft() + '.');
  });
};
