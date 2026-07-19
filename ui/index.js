
import polyfill from '../../maat/util/arrayUtil';
polyfill();

import drawManager from '../../maat/DrawManager';
import preloadManager from '../../maat/PreloadManager';
import keyboard from '../../maat/event/Keyboard';
import mouse from '../../maat/event/Mouse';
import websocket from '../../maat/event/Websocket';
import spriteManager from '../../maat/SpriteManager';
import MainScreen from './game/main';

let spritePaths = {};
['logo', 'joinButton','introBg','logoButton'].forEach(i => spritePaths[i] = `img/${i}.png`);
spriteManager.hoistPaths({spritePaths});

// websocket.url = 'wss://www.bungubox.com/wrdspr';
websocket.url = 'ws://localhost:27453';
websocket.connect();

drawManager.hoistCanvas(document.getElementById('mainCanvas'), 1100, 950);
drawManager.root.addChild(new MainScreen());
drawManager.begin();