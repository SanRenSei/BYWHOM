import BaseComponent from "MAAT/components/BaseComponent";
import websocket from 'MAAT/event/Websocket';

import AdminStartButton from "./AdminStartButton";
import LobbyName from "./LobbyName";
import SelfName from "./SelfName";
import state from "./StateManager";
import WritePhaseScreen from "./WritePhaseScreen";

export default class LobbyScreen extends BaseComponent {
  lobbyNames: LobbyName[];

  constructor() {
    super();
    this.addChild(BaseComponent.createSprite('gameBg', {x:0,y:0,w:600,h:800}));
    this.lobbyNames = [];
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='lobbyInfo') {
        e.players.forEach((p:any, i:number) => {
          if (this.lobbyNames[i]) {
            this.lobbyNames[i].setText(p.name);
          } else {
            if (p.uuid==state.playerUUID) {
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
      if (e.tag=='gameStart') {
        this.purge();
        this.parent?.addChild(new WritePhaseScreen());
      }
    })
    if (new URLSearchParams(window.location.search).get('access')=='admin') {
      this.addChild(new AdminStartButton()).withTransform({x:200,y:300,w:100,h:50});
    }
    websocket.sendMessage({tag:'joinGame'});
  }

}