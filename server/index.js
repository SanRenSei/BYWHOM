
import crypto from 'crypto';
import { WebSocketServer } from 'ws';

import polyfill from './arrayUtil.js';

const wss = new WebSocketServer({ port: 27453 });

let pw = '748546f3-75c9-4bea-bcae-bd46ecbb7e90';
let gameInfo = {
  players: [],
  scores: [],
  statements: [],
  guesses: [],
  started: false,
  done: false,
  topics: []
};
let players = [];
let topicLib = ['ANIMALS', 'TRAVEL', 'FOOD', 'SPORTS', 'MOVIES', 'BOOKS', 'MUSIC', 'FAMILY'];
let nameLib = ['Apple', 'Bread', 'Cabbage', 'Dumpling', 'Egg', 'FavaBean', 'Gumbo', 'Hamburger', 'Iceberg', 'Jollof', 'Kumquat', 'Lime', 'Mousse', 'Nougat', 'Orange', 'Potato', 'Quail', 'Rutabega', 'Samosa', 'Tamago', 'Ube', 'Veal', 'Watermelon', 'Xiaolongbao', 'Yam', 'Zucchini'];

let commandProcessor = {};

wss.on('connection', function connection(ws) {
  ws.id = players.length;
  let uuid = crypto.randomUUID();
  players.push({ws, playerName: Array.randomFrom(nameLib).toUpperCase(), inLobby: false, uuid});
  ws.send(JSON.stringify({tag:'uuid', uuid}));

  ws.on('error', console.error);
  ws.on('message', function message(dataStr) {
    let data = JSON.parse(dataStr);
    console.log(data);
    commandProcessor[data.tag] && commandProcessor[data.tag](ws, data);
  });
  ws.on('close', () => {
    removePlayer(ws.id);
  });
});

let resetGameInfo = () => {
  gameInfo = {
    players: [],
    started: false
  };
}

let removePlayer = (id) => {
  const player = players[id];
  if (!player) return;
  console.log(`${player.playerName} disconnected`);
  player.inLobby = false;
  gameInfo.players = gameInfo.players.filter(pid => pid !== id);
  player.ws = null;
  broadcastLobby();
}

let broadcastLobby = () => {
  gameInfo.players.forEach(pid => {
    players[pid].ws.send(JSON.stringify({tag:'lobbyInfo', players: players.filter(p => p.inLobby).map(p => {
      return {name:p.playerName, uuid:p.uuid};
    })}));
  })
}

let broadcastGameStart = () => {
  gameInfo.players.forEach(pid => {
    players[pid].ws.send(JSON.stringify({tag:'gameStart'}));
  })
}

let broadcastGameInfo = () => {
  gameInfo.players.forEach(pid => {
    players[pid].ws.send(JSON.stringify({tag:'gameInfo', info: gameInfo}));
  })
}

commandProcessor.joinGame = (p, d) => {
  players[p.id].inLobby = true;
  gameInfo.players.push(p.id);
  broadcastLobby();
}

commandProcessor.setName = (p, d) => {
  players[p.id].playerName = d.name.toUpperCase();
  broadcastLobby();
}

commandProcessor.adminStart = (p, d) => {
  if (d.pw==pw) {
    gameInfo.started = true;
    broadcastGameStart();
  }
  gameInfo.round = 1;
  gameInfo.phase = 'write';
  gameInfo.timeLeft = 60000;
  gameInfo.topics = Array.shuffle(topicLib).splice(0, 5);
  broadcastGameInfo();
}

commandProcessor.adminKick = (p, d) => {
  if (d.pw==pw) {
    players[d.pid].inLobby = false;
    gameInfo.players = gameInfo.players.filter(p => p.id!=d.pid);
    broadcastLobby();
  }
}

commandProcessor.writeStatement = (p, d) => {
  let pIndex = gameInfo.players.indexOf(p.id);
  gameInfo.statements[pIndex] = d.statement;
}

commandProcessor.updateGuess = (p, d) => {
  let pIndex = gameInfo.players.indexOf(p.id);
  gameInfo.guesses[pIndex] = d.guess;
}

commandProcessor.reconnect = (p, d) => {

}

let update = () => {
  if (!gameInfo.started) {
    return;
  }
  gameInfo.timeLeft -= 2000;
  if (gameInfo.timeLeft<=0) {
    gameInfo.timeLeft = 60000;
    if (gameInfo.phase=='write') {
      gameInfo.phase = 'guess'; // maybe 65 seconds to put 5 seconds animation transition?
    } else {
      // Do scoring
      gameInfo.phase = 'write'; // 15 second reveal for 75 second total? Reveal answers, show scores, display next topic, then write
      gameInfo.round++;
      if (gameInfo.round==6) {
        gameInfo.done = true;
      }
    }
  } else {
    // Check for early writing phase end
  }
  broadcastGameInfo();
}

setInterval(() => update(), 2000);