import BaseComponent from "MAAT/components/BaseComponent";
import DirectionalMove from "MAAT/components/DirectionalMove";
import Text from "MAAT/components/Text";
import ImageUtil from "MAAT/util/imageUtil";

export default class LobbyName extends BaseComponent {
  text: string;
  dirMove: DirectionalMove;
  textComponent: Text;

  constructor(parent:BaseComponent, name:string) {
    super(parent);
    this.text = name;
    this.dirMove = this.addChild(new DirectionalMove(this, {x:0,y:0}, 100+200*Math.random()));
    this.textComponent = this.addChild(new Text(name, {color:ImageUtil.randomHexColor(), fontSize: 20+20*Math.random(), glowColor: 'white', glowBlur: 10})).withTransform({w:50,h:20});
    this.bounce();
  }

  update() {
    super.update();
    this.checkBounce();
  }

  setText(text:string) {
    this.text = text;
    this.textComponent.text = text;
  }

  bounce() {
    const angle = Math.PI*2*Math.random();
    this.dirMove.direction = {x: Math.cos(angle), y: Math.sin(angle)};
    this.dirMove.speed = 200 + 200*Math.random();
  }

  checkBounce() {
    let {x,y} = this.computeRelativePosition();
    if (x<-290) {
      this.bounce();
      this.dirMove.direction.x = Math.abs(this.dirMove.direction.x);
    }
    if (x>290) {
      this.bounce();
      this.dirMove.direction.x = -Math.abs(this.dirMove.direction.x);
    }
    if (y<-390) {
      this.bounce();
      this.dirMove.direction.y = Math.abs(this.dirMove.direction.y);
    }
    if (y>390) {
      this.bounce();
      this.dirMove.direction.y = -Math.abs(this.dirMove.direction.y);
    }
  }

}