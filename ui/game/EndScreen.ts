import BaseComponent from "MAAT/components/BaseComponent";
import SizeTween from "MAAT/components/SizeTween";
import Text from "MAAT/components/Text";
import TextUtil from 'MAAT/util/textUtil';
import FakeKeyboard from "./FakeKeyboard";
import Oval from "MAAT/components/Oval";
import SubmitButton from "./SubmitButton";
import websocket from "MAAT/event/Websocket";
import GuessPhaseScreen from "./GuessPhaseScreen";
import FlexBox from "MAAT/components/FlexBox";
import FlexModal from "MAAT/components/FlexModal";
import ReadyButton from "./ReadyButton";
import WritePhaseScreen from "./WritePhaseScreen";

export default class EndScreen extends BaseComponent {

  constructor(parent: BaseComponent) {
    super(parent);
    let table = this.addChild(new FlexModal(this).withTransform({x: 0,y: 0,w: 600,h: 600}));
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='statementCache') {
        table.sterilize();

        Object.entries(e.data).forEach(([playerName, statements]: [string, any]) => {
          table.addChild(new Text(playerName, {color: "yellow",fontSize: 24,glowColor: "white",glowBlur: 5}).withTransform({ w: 550, h: 40 }));
          statements.forEach((statement:string) => {table.addChild(new Text(TextUtil.wrapText(statement, 70), {color: "white",fontSize: 16}).withTransform({ w: 550, h: 60 }));});
          table.addChild(new BaseComponent().withTransform({ w: 550, h: 20 }));
        });

        table.reflex();

        console.log(e.data);
      }
    })
    websocket.sendMessage({tag:'statementCacheRequest'});
  }


}