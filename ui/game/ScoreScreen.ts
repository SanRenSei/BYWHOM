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
import ReadyButton from "./ReadyButton";
import WritePhaseScreen from "./WritePhaseScreen";
import EndScreen from "./EndScreen";

export default class ScoreScreen extends BaseComponent {

  constructor(parent: BaseComponent, gameInfo: any) {
    super(parent);
    let table = this.addChild(new FlexBox(this).withTransform({x: 0,y: -300,w: 600,h: 600}));
    table.addChild(new Text(`Round ${gameInfo.round-1} Scores`), {color:'white', fontSize:18}).withTransform({x:0,y:0,w:600,h:40});

    gameInfo.playerNames.forEach((name: string, playerIndex: number) => {
      let row = table.addChild(new FlexBox(table).withTransform({ w: 600, h: 40 }));
      row.addChild(new Text(name, {color: "white",fontSize: 18}).withTransform({ w: 180, h: 40 }));

      const scores = gameInfo.scores[playerIndex] ?? [];
      let total = 0;

      for (let i=0; i<scores.length; i++) {
        let score = scores[i];
        total += score;
        row.addChild(new Text(''+score, {color: "white", fontSize: 18 }).withTransform({ w: 30, h: 30 }));
      }
      row.addChild(new Text(''+total, {color: "cyan",fontSize: 18}).withTransform({ w: 70, h: 40 }));
      row.reflex();
    });

    table.reflex();

    this.addChild(new ReadyButton(() => {
      if (gameInfo.round>=6) {
        this.parent?.addChild(new EndScreen(this.parent));  
      } else {
        this.parent?.addChild(new WritePhaseScreen());
      }
      this.purge();
    })).withTransform({x:0,y:300,w:100,h:50});
  }


}