import BaseComponent from "MAAT/components/BaseComponent";
import Clickable from "MAAT/components/Clickable";
import CollisionShape from "MAAT/components/CollisionShape";
import DirectionalMove from "MAAT/components/DirectionalMove";
import Oval from "MAAT/components/Oval";
import Rect from "MAAT/components/Rect";
import Text from "MAAT/components/Text";
import websocket from 'MAAT/event/Websocket';

class LobbyName extends BaseComponent {
  text: string;
  dirMove: DirectionalMove;

  constructor(parent:BaseComponent, name:string) {
    super(parent);
    this.text = name;
    this.dirMove = new DirectionalMove(this, {x:0,y:0}, 100+200*Math.random());
  }

  update() {
    super.update();
  }

}

class LobbyScreen extends BaseComponent {

  constructor() {
    super();
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='lobbyInfo') {
        console.log(e);
      }
    })
    websocket.sendMessage({tag:'joinGame'});
  }

}

export default class MainScreen extends BaseComponent {
  joinButton: BaseComponent;

  constructor() {
    super();
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