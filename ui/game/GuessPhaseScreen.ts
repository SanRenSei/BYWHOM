import BaseComponent from "MAAT/components/BaseComponent";


export default class GuessPhaseScreen extends BaseComponent {

  constructor() {
    super();
    this.addChild(BaseComponent.createSprite('gameBg', {x:0,y:0,w:600,h:800}));
  }

}