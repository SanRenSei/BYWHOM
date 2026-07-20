import BaseComponent from "MAAT/components/BaseComponent";
import Clickable from "MAAT/components/Clickable";
import CollisionShape from "MAAT/components/CollisionShape";
import DirectionalMove from "MAAT/components/DirectionalMove";
import Oval from "MAAT/components/Oval";
import Rect from "MAAT/components/Rect";
import Text from "MAAT/components/Text";
import websocket from 'MAAT/event/Websocket';
import ImageUtil from "MAAT/util/imageUtil";

let playerUUID = '';
let urlParams = new URLSearchParams(window.location.search);

class LobbyName extends BaseComponent {
  text: string;
  dirMove: DirectionalMove;
  textComponent: Text;

  constructor(parent:BaseComponent, name:string) {
    super(parent);
    this.text = name;
    this.dirMove = this.addChild(new DirectionalMove(this, {x:0,y:0}, 100+200*Math.random()));
    this.textComponent = this.addChild(new Text(name, {color:ImageUtil.randomHexColor(), fontSize: 20+20*Math.random(), glowColor: 'black', glowBlur: 10})).withTransform({w:50,h:20});
    this.bounce();
  }

  update() {
    super.update();
    this.checkBounce();
  }

  setText(text:string) {
    this.text = text;
    this.textComponent.text = text;
  }

  bounce() {
    const angle = Math.PI*2*Math.random();
    this.dirMove.direction = {x: Math.cos(angle), y: Math.sin(angle)};
    this.dirMove.speed = 200 + 200*Math.random();
  }

  checkBounce() {
    let {x,y} = this.computeRelativePosition();
    if (x<-290) {
      this.bounce();
      this.dirMove.direction.x = Math.abs(this.dirMove.direction.x);
    }
    if (x>290) {
      this.bounce();
      this.dirMove.direction.x = -Math.abs(this.dirMove.direction.x);
    }
    if (y<-390) {
      this.bounce();
      this.dirMove.direction.y = Math.abs(this.dirMove.direction.y);
    }
    if (y>390) {
      this.bounce();
      this.dirMove.direction.y = -Math.abs(this.dirMove.direction.y);
    }
  }

}

class SelfName extends LobbyName {

  constructor(parent:BaseComponent, name:string) {
    super(parent, name);
    this.addChild(new Oval({color:'red'})).withTransform({w:200,h:100});
    this.subscribeTo('keydown', (e: KeyboardEvent) => {
      let newName = this.text;

      if (e.key === 'Backspace') {
        newName = newName.slice(0, -1);
      } else if (
        e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
      ) {
        newName += e.key;
      } else {
        return;
      }

      newName = newName.slice(0, 20);

      if (newName !== this.text) {
        this.setText(newName);
        websocket.sendMessage({tag: 'setName',name: newName});
      }

      e.preventDefault();
    });

  }

}

class LobbyScreen extends BaseComponent {
  lobbyNames: LobbyName[];

  constructor() {
    super();
    this.lobbyNames = [];
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='lobbyInfo') {
        console.log(e);
        e.players.forEach((p, i) => {
          if (this.lobbyNames[i]) {
            this.lobbyNames[i].setText(p.name);
          } else {
            if (p.uuid==playerUUID) {
              this.lobbyNames[i] = this.addChild(new SelfName(this, p.name));
            } else {
              this.lobbyNames[i] = this.addChild(new LobbyName(this, p.name));
            }
          }
        });
        if (this.lobbyNames.length > e.players.length) {
          this.lobbyNames.splice(e.players.length, this.lobbyNames.length - e.players.length).forEach(ln => ln.purge());
        }
      }
    })
    websocket.sendMessage({tag:'joinGame'});
    if (urlParams.get('access')=='admin') {
      console.log('IS ADMIN')
    }
  }

}

export default class MainScreen extends BaseComponent {
  joinButton: BaseComponent;

  constructor() {
    super();
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='uuid') {
        console.log('GOT UUID')
        console.log(e.uuid);
        playerUUID = e.uuid;
      }
    });
    websocket.connect();
    this.withTransform({x:0,y:0,w:600,h:800});
    this.addChild(BaseComponent.createSprite('introBg', {x:0,y:0,w:600,h:800}));
    this.addChild(BaseComponent.createSprite('logoButton', {x:-175,y:-325,w:200,h:100}));
    this.joinButton = this.addChild(BaseComponent.createSprite('joinButton', {x:0,y:100,w:200,h:100}));
    this.joinButton.addChild(new Clickable(this.joinButton, () => {
      this.parent?.addChild(new LobbyScreen());
      this.purge();
    }))
  }

}