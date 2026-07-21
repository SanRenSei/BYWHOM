import BaseComponent from "MAAT/components/BaseComponent";
import Clickable from "MAAT/components/Clickable";
import Rect from "MAAT/components/Rect";
import Text from "MAAT/components/Text";
import websocket from 'MAAT/event/Websocket';

export default class AdminStartButton extends BaseComponent {

  constructor() {
    super();
    this.withTransform({w:100,h:50});
    this.addChild(new Rect({fillColor:'#88ff88'})).withTransform({w:100,h:50});
    this.addChild(new Text('START')).withTransform({w:100,h:50});
    this.addChild(new Clickable(this, () => {
      websocket.sendMessage({tag:'adminStart', pw: new URLSearchParams(window.location.search).get('pw')});
    }))
  }

}