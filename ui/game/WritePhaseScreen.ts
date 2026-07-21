import BaseComponent from "MAAT/components/BaseComponent";
import SizeTween from "MAAT/components/SizeTween";
import Text from "MAAT/components/Text";
import TextUtil from 'MAAT/util/textUtil';
import FakeKeyboard from "./FakeKeyboard";
import Oval from "MAAT/components/Oval";
import SubmitButton from "./SubmitButton";
import websocket from "MAAT/event/Websocket";

export default class WritePhaseScreen extends BaseComponent {
  topic?: string;
  topicText?: Text;
  startTime: number;
  displayTimeLeft: number;
  actualTimeLeft: number;
  statementText: string;
  statementTextDisplay?: Text;
  timeLeftDisplay?: Oval;
  submitButtonDisplay?: SubmitButton;
  doneWriting: boolean;

  constructor() {
    super();
    this.startTime = 0;
    this.displayTimeLeft = 60000;
    this.actualTimeLeft = 60000;
    this.statementText = '';
    this.doneWriting = false;
    this.addChild(BaseComponent.createSprite('gameBg', {x:0,y:0,w:600,h:800}));
    this.addChild(new Text('Write a fact about yourself related to:', {color:'white', glowColor:'green', glowBlur: 5})).withTransform({x:0,y:-300,w:400,h:50});
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='gameInfo') {
        console.log(e);
        if (!this.topic) {
          this.topic = e.info.topics[0];
          this.topicText = this.addChild(new Text(e.info.topics[0], {color:'white', glowColor:'green', glowBlur: 5})).withTransform({y:-250});
          this.topicText?.addChild(new SizeTween(this.topicText, {w:200,h:100}, 1000, () => {
            this.addChild(new FakeKeyboard()).withTransform({x:0,y:200});
            this.statementTextDisplay = this.addChild(new Text('', {color:'white', glowColor:'green', glowBlur: 5, fontSize: 25})).withTransform({w:400,h:50});
            this.timeLeftDisplay = this.addChild(new Oval({fillColor:'#8888ff'})).withTransform({x:-250,y:-350,h:80,w:80});
            this.submitButtonDisplay = this.addChild(new SubmitButton(() => {
              this.submitStatement();
            })).withTransform({x:250,y:-350,w:100,h:50});
          }))
          this.startTime = new Date().getTime();
          this.displayTimeLeft = e.info.timeLeft;
          this.actualTimeLeft = e.info.timeLeft;
          this.doneWriting = false;
        } else {
          this.displayTimeLeft = e.info.timeLeft;
          this.actualTimeLeft = e.info.timeLeft;
          this.timeLeftDisplay && (this.timeLeftDisplay.arc = [0, 2*Math.PI*((this.actualTimeLeft-2000)/60000)]);
          if (this.actualTimeLeft<=10000) {
            this.timeLeftDisplay && (this.timeLeftDisplay.fillColor='#ff8888');
          }
          if (this.actualTimeLeft<=2000 && !this.doneWriting) {
            this.submitStatement();
          }
        }
      }
    })
    this.subscribeTo('keypress', (e:any) => {
      this.updateStatementInput(this.statementText + e.key.toUpperCase())
    })
    this.subscribeTo('keydown', (e:any) => {
      if (e.key=='Backspace') {
        this.updateStatementInput(this.statementText.slice(0, -1))
      }
    })
  }

  updateStatementInput(text:string) {
    if (this.doneWriting) {
      return;
    }
    if (this.statementTextDisplay) {
      this.statementText = text;
      this.statementTextDisplay.text = TextUtil.wrapText(text, 20);
    }
  }

  submitStatement() {
    console.log(this.statementText)
    websocket.sendMessage({tag:'writeStatement', statement: this.statementText});
    this.submitButtonDisplay && (this.submitButtonDisplay.buttonText.text = 'SUBMITTED');
    this.doneWriting = true;
  }

}