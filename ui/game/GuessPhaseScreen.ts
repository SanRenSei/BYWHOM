import BaseComponent from "MAAT/components/BaseComponent";
import FlexBox from "MAAT/components/FlexBox";
import FollowMouse from "MAAT/components/FollowMouse";
import Oval from "MAAT/components/Oval";
import Text from "MAAT/components/Text";
import websocket from "MAAT/event/Websocket";
import CoordUtil from "MAAT/util/coordUtil";
import ImageUtil from "MAAT/util/imageUtil";
import TextUtil from "MAAT/util/textUtil";
import WritePhaseScreen from "./WritePhaseScreen";
import ScoreScreen from "./ScoreScreen";
import LockInButton from "./LockInButton";
import CustomButton from "./CustomButton";

class MovablePlayer extends BaseComponent {
  declare parent: DropZone;
  mouseGrab?: FollowMouse;
  playerName: string;

  constructor(parent:BaseComponent, playerName: string) {
    super(parent);
    this.playerName = playerName;
    this.withTransform({w:150,h:50});
    this.addChild(new Text(playerName, {color:ImageUtil.randomHexColor(), fontSize: 20+20*Math.random(), glowColor: 'white', glowBlur: 10})).withTransform({w:100,h:50});
    this.subscribeTo('pointerdown', (e:any) => {
      if (CoordUtil.pointInRect({x:e.translatedX,y:e.translatedY}, {...this.transformSnapshot})) {
        if (!this.mouseGrab) {
          this.mouseGrab = this.addChild(new FollowMouse(this));
        }
      } 
    })
    this.subscribeTo('pointerup', (e:any) => {
      if (!this.mouseGrab) {
        return;
      }
      this.mouseGrab.purge();
      this.mouseGrab = undefined;

      let target = this.parent.parent?.findChildrenOfType(DropZone)
        .find(z =>z !== this.parent && CoordUtil.rectRectCollision(this.getRectShape(),z.player.getRectShape()));

      if (target) {
        DropZone.swapPlayers(this.parent, target);
        this.parent.reflex();
      } else {
        this.withPosition({x:0,y:0});
        this.parent.reflex();
      }
    })
  }

}

class MovableStatement extends BaseComponent {
  declare parent: DropZone;
  mouseGrab?: FollowMouse;
  statementText: string;

  constructor(parent:BaseComponent, statementText: string) {
    super(parent);
    this.statementText = statementText;
    this.withTransform({w:350,h:50});
    this.addChild(new Text(TextUtil.wrapText(statementText, 50), {color:'white', glowColor:'green', glowBlur: 5, fontSize: 12})).withTransform({w:300,h:50});
    this.subscribeTo('pointerdown', (e:any) => {
      if (CoordUtil.pointInRect({x:e.translatedX,y:e.translatedY}, {...this.transformSnapshot})) {
        if (!this.mouseGrab) {
          this.mouseGrab = this.addChild(new FollowMouse(this));
        }
      } 
    })
    this.subscribeTo('pointerup', (e:any) => {
      if (!this.mouseGrab) {
        return;
      }
      this.mouseGrab.purge();
      this.mouseGrab = undefined;

      let target = this.parent.parent?.findChildrenOfType(DropZone)
        .find(z =>z !== this.parent && CoordUtil.rectRectCollision(this.getRectShape(),z.statement.getRectShape()));

      if (target) {
        DropZone.swapStatements(this.parent, target);
        this.parent.reflex();
      } else {
        this.withPosition({x:0,y:0});
        this.parent.reflex();
      }
    })
  }

}

class DropZone extends FlexBox {
  declare parent: BaseComponent & {parent: GuessPhaseScreen};
  player: MovablePlayer;
  statement: MovableStatement;

  constructor(parent:FlexBox, playerName: string, statementText: string) {
    super(parent);
    this.withTransform({w: 600,h: 80});
    this.player = this.addChild(new MovablePlayer(this, playerName));
    this.statement = this.addChild(new MovableStatement(this, statementText));
    this.reflex();
  }

  static swapPlayers(a: DropZone, b: DropZone) {
    if (a.parent.parent.lockedIn) {
      return;
    }
    let ap = a.player, as = a.statement, bp = b.player, bs = b.statement;
    a.children = [bp, as];
    b.children = [ap, bs];

    ap.parent = b;
    bp.parent = a;
    a.player = bp;
    b.player = ap;

    a.reflex();
    b.reflex();

    a.parent.parent.sendGuess();
  }

  static swapStatements(a: DropZone, b: DropZone) {
    if (a.parent.parent.lockedIn) {
      return;
    }
    let ap = a.player, as = a.statement, bp = b.player, bs = b.statement;
    a.children = [ap, bs];
    b.children = [bp, as];

    as.parent = b;
    bs.parent = a;
    a.statement = bs;
    b.statement = as;
    
    a.reflex();
    b.reflex();

    a.parent.parent.sendGuess();
  }

}

export default class GuessPhaseScreen extends BaseComponent {
  dropZoneList?: FlexBox;
  timeLeft: number;
  timeLeftDisplay?: Oval;
  lockInButton?: CustomButton;
  lockedIn: boolean;

  constructor() {
    super();
    this.timeLeft = 60000;
    this.lockedIn = false;
    this.addChild(BaseComponent.createSprite('gameBg', {x:0,y:0,w:600,h:800}));
    this.addChild(new Text('Try to match statements to people!', {color:'white', glowColor:'green', glowBlur: 5})).withTransform({x:0,y:-300,w:400,h:50});
    this.subscribeTo('socket', (e:any) => {
      if (e.tag=='gameInfo') {
        if (!this.dropZoneList) {
          this.timeLeftDisplay = this.addChild(new Oval({fillColor:'#8888ff'})).withTransform({x:-250,y:-350,h:80,w:80});
          this.dropZoneList = this.addChild(new FlexBox(this).withTransform({x: 0,y: -250,w: 760,h: 600}));
          for (let i=0;i<e.info.playerNames.length;i++) {
            this.dropZoneList?.addChild(new DropZone(this.dropZoneList, e.info.playerNames[i], e.info.statements[i]));
          }
          this.dropZoneList?.reflex();
          this.sendGuess();
          this.lockInButton = this.addChild(new CustomButton('LOCK IN', () => {
            this.lockIn();
          })).withTransform({x:250,y:-350,w:100,h:50});
        }
        this.timeLeft = e.info.timeLeft;
        this.timeLeftDisplay && (this.timeLeftDisplay.arc = [0, 2*Math.PI*(Math.max(0, this.timeLeft-2000)/120000)]);
        if (this.timeLeft<=10000) {
          this.timeLeftDisplay && (this.timeLeftDisplay.fillColor='#ff8888');
        }
        if (e.info.phase=='write') {
          this.parent?.addChild(new ScoreScreen(this.parent, e.info));
          this.purge();
        }
      }
    })
  }

  sendGuess() {
    websocket.sendMessage({tag:'updateGuess', guess: this.dropZoneList?.findChildrenOfType(DropZone).map(dz => {
      return {player: dz.player.playerName, statement: dz.statement.statementText}
    })});
  }

  lockIn() {
    if (this.lockInButton) {
      websocket.sendMessage({tag:'lockIn'});
      this.lockInButton.purge();
      this.lockInButton = this.addChild(new CustomButton('🔒🔒🔒', () => {
        this.unLockIn();
      })).withTransform({x:250,y:-350,w:100,h:50});
      this.lockedIn = true;
    }
  }

  unLockIn() {
    if (this.lockInButton) {
      websocket.sendMessage({tag:'unLockIn'});
      this.lockInButton.purge();
      this.lockInButton = this.addChild(new CustomButton('LOCK IN', () => {
        this.lockIn();
      })).withTransform({x:250,y:-350,w:100,h:50});
      this.lockedIn = true;
    }
  }

}