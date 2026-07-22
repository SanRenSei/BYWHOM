import BaseComponent from "MAAT/components/BaseComponent";
import Text from "MAAT/components/Text";
import ImageUtil from "MAAT/util/imageUtil";
import TextUtil from "MAAT/util/textUtil";

class MovablePlayer extends BaseComponent {

  constructor(parent:BaseComponent, playerName: string) {
    super(parent);
    this.addChild(new Text(playerName, {color:ImageUtil.randomHexColor(), fontSize: 20+20*Math.random(), glowColor: 'white', glowBlur: 10})).withTransform({w:50,h:20});
  }

}

class MovableStatement extends BaseComponent {

  constructor(parent:BaseComponent, statementText: string) {
    super(parent);
    this.addChild(new Text(TextUtil.wrapText(statementText, 20), {color:'white', glowColor:'green', glowBlur: 5, fontSize: 25})).withTransform({w:400,h:50});
  }

}

class DropZone extends BaseComponent {
  player: MovablePlayer;
  statement: MovableStatement;

  constructor(parent:BaseComponent, playerName: string, statementText: string) {
    super(parent);
    this.player = this.addChild(new MovablePlayer(this, playerName));
    this.statement = this.addChild(new MovableStatement(this, statementText));
  }
}

export default class GuessPhaseScreen extends BaseComponent {
  dropzones: DropZone[];

  constructor() {
    super();
    this.addChild(BaseComponent.createSprite('gameBg', {x:0,y:0,w:600,h:800}));
    this.dropzones = [
      this.addChild(new DropZone(this, 'Alice', 'Every Tuesday, my shadow quits and a neighbors shadow fills in until sunset.')),
      this.addChild(new DropZone(this, 'Bob', 'I was briefly elected mayor of a thunderstorm, but I resigned after the rain started recognizing me.')),
      this.addChild(new DropZone(this, 'Carl', 'The moon still sends me apology letters for borrowing my reflection in 2009.')),
    ]
  }

}