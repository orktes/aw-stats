var irc = require('irc');
var pilotRepository = require('./lib/repositories/pilot');
var settings = require('./lib/settings');

var connected = false;
var messageBuffer = [];

var client = new irc.Client(settings.irc.host, settings.irc.nick, { channels : [settings.irc.channel] });

client.on('connect', function () {
  console.log("IRC connected to " + settings.irc.host);
});

client.on('join', function () {
  connected = true;
  messageBuffer.forEach(function (msg) {
    client.say(settings.irc.channel, msg);
  });
});

client.on('message', function (from, to, msg) {
  if (msg.indexOf('!aw') === 0) {
    var parts = msg.split(' ');
    var command = parts.shift();
    if (command != '!aw') {
      return;
    }
    
    var username = (parts.length > 0) ? parts.join(' ') : from;
    pilotRepository.getPilotByUsername(username, function (err, pilot) {
      if (err) {
        exports.say(err.message);
        return;
      }
      if (to == settings.irc.nick) {
        to = from;
      }
      client.say(to, username + ", Score: " + (pilot.score || 0) +", Rating: " + Math.round(pilot.rating || 1500));
    });
  }
});

exports.say = function (msg) {
  if (connected) {
    client.say(settings.irc.channel, msg);
  } else {
    messageBuffer.push(msg);
  }
};