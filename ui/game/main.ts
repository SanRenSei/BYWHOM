import BaseComponent from "MAAT/components/BaseComponent";
import Clickable from "MAAT/components/Clickable";
import CollisionShape from "MAAT/components/CollisionShape";
import DirectionalMove from "MAAT/components/DirectionalMove";
import Oval from "MAAT/components/Oval";
import Rect from "MAAT/components/Rect";
import Text from "MAAT/components/Text";
import websocket from 'MAAT/event/Websocket';
import ImageUtil from "MAAT/util/imageUtil";

import LobbyScreen from "./LobbyScreen";
import state from "./StateManager";

export default class MainScreen extends BaseComponent {
  joinButton: BaseComponent;

  constructor(parent:BaseComponent) {
    super(parent);
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='uuid') {
        console.log('GOT UUID')
        console.log(e.uuid);
        state.playerUUID = e.uuid;
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