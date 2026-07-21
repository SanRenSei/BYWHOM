import BaseComponent from "MAAT/components/BaseComponent";
import Oval from "MAAT/components/Oval";
import websocket from 'MAAT/event/Websocket';

import LobbyName from "./LobbyName";

export default class SelfName extends LobbyName {

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