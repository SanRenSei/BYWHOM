import BaseComponent from "MAAT/components/BaseComponent";
import Clickable from "MAAT/components/Clickable";
import Rect from "MAAT/components/Rect";
import Text from "MAAT/components/Text";

export default class CustomButton extends BaseComponent {
  buttonText: Text;

  constructor(text: string, onClick:any) {
    super();
    this.withTransform({w:100,h:50});
    this.addChild(new Rect({fillColor:'#88ff88'})).withTransform({w:100,h:50});
    this.buttonText = this.addChild(new Text(text)).withTransform({w:100,h:50});
    this.addChild(new Clickable(this, () => onClick()))
  }

}