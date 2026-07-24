
import crypto from 'crypto';
import { WebSocketServer } from 'ws';

import polyfill from './arrayUtil.js';

const wss = new WebSocketServer({ port: 27453 });

let pw = '748546f3-75c9-4bea-bcae-bd46ecbb7e90';
let statementCache = {};
let gameInfo = {
  players: [],
  playerNames: [],
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
    console.log('START GAME')
    statementCache = {};
    gameInfo.playerNames = gameInfo.players.map(pid => players[pid].playerName)
    gameInfo.scores = gameInfo.players.map(pid => []);
    gameInfo.started = true;
    gameInfo.done = false;
    broadcastGameStart();
  }
  gameInfo.round = 1;
  gameInfo.phase = 'write';
  gameInfo.timeLeft = 120000;
  gameInfo.topics = [...Array.shuffle(topicLib)].splice(0, 5);
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
  let playerName = gameInfo.playerNames[pIndex];
  if (!statementCache[playerName]) {
    statementCache[playerName] = [];
  }
  statementCache[playerName].push(d.statement);
}

commandProcessor.updateGuess = (p, d) => {
  let pIndex = gameInfo.players.indexOf(p.id);
  gameInfo.guesses[pIndex] = d.guess;
}

commandProcessor.statementCacheRequest = (p, d) => {
  p.send(JSON.stringify({tag:'statementCache', data: statementCache}));
}

commandProcessor.reconnect = (p, d) => {

}

let scoreRound = () => {
  let guessScores = [];
  let statementScores = [];
  for (let i=0;i<gameInfo.players.length;i++) {
    guessScores[i] = 0;
    statementScores[i] = 0;
  }
  for (let i=0;i<gameInfo.players.length;i++) {
    let playerGuess = gameInfo.guesses[i];
    if (!playerGuess) {
      continue;
    }
    playerGuess.forEach(g => {
      let {player, statement} = g;
      let pIndex = gameInfo.playerNames.indexOf(player);
      let pStatement = gameInfo.statements[pIndex];
      if (statement == pStatement) {
        guessScores[i]++;
        statementScores[pIndex]++;
      }
    })
  }
  for (let i=0;i<gameInfo.players.length;i++) {
    if (guessScores[i]==gameInfo.players.length) {
      gameInfo.scores[i].push(guessScores[i]*3);
    } else {
      gameInfo.scores[i].push(guessScores[i]*2);
    }
    statementScores[i] = 2*(gameInfo.players.length - 2*Math.abs(gameInfo.players.length/2 - statementScores[i]));
    gameInfo.scores[i].push(statementScores[i]);
  }
}

let clearRound = () => {
  gameInfo.statements = [];
  gameInfo.guesses = [];
}

let update = () => {
  if (!gameInfo.started || gameInfo.done) {
    return;
  }
  gameInfo.timeLeft -= 2000;
  if (gameInfo.timeLeft<=-1000) {
    gameInfo.timeLeft = 120000;
    if (gameInfo.phase=='write') {
      gameInfo.phase = 'guess';
      gameInfo.timeLeft = 120000;
    } else {
      scoreRound();
      clearRound();
      gameInfo.phase = 'write';
      gameInfo.timeLeft = 120000;
      gameInfo.round++;
      if (gameInfo.round==6) {
        gameInfo.done = true;
      }
    }
  } else {
    let earlyRoundEnd = false;
    if (gameInfo.phase=='write') {
      earlyRoundEnd = true;
    }
    for (let i=0;i<gameInfo.players.length;i++) {
      if (!gameInfo.statements[i]) {
        earlyRoundEnd = false;
      }
    }
    if (earlyRoundEnd) {
      gameInfo.timeLeft = Math.min(gameInfo.timeLeft, 5000);
    }
  }
  broadcastGameInfo();
}

setInterval(() => update(), 2000);