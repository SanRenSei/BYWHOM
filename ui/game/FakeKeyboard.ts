import BaseComponent from "MAAT/components/BaseComponent";
import Rect from "MAAT/components/Rect";
import Text from "MAAT/components/Text";
import eventDispatcher from "MAAT/event/Dispatcher";

class Key extends BaseComponent {
  key: string;

  constructor(parent:BaseComponent, key:string, size:{w:number, h:number}) {
    super(parent);
    this.key = key;
    this.withSize(size);
    this.addChild(new Rect({fillColor:'white'}).withSize(size)).onClick(() => eventDispatcher.dispatchEvent({type:'keypress', key}));
    this.addChild(new Text(key.toUpperCase(), {maxSize: 30}).withSize(size));
  }

}

class BKSPKey extends BaseComponent {

  constructor(parent:BaseComponent, size:{w:number,h:number}) {
    super(parent);
    this.withSize(size);
    this.addChild(new Rect({fillColor:'white'}).withSize(size)).onClick(() => eventDispatcher.dispatchEvent({type:'keydown', key:'Backspace'}));
    this.addChild(new Text('BKSP', {maxSize: 30}).withSize(size));
  }

}

class SpaceKey extends BaseComponent {

  constructor(parent:BaseComponent, size:{w:number,h:number}) {
    super(parent);
    this.withSize(size);
    this.addChild(new Rect({fillColor:'white'}).withSize(size)).onClick(() => eventDispatcher.dispatchEvent({type:'keypress', key:' '}));
    this.addChild(new Text('SPACE', {maxSize: 30}).withSize(size));
  }

}

export default class FakeKeyboard extends BaseComponent {

  constructor() {
    super();
    let keyConfig = [
      {key : 'Q', x:-225, y: -50},
      {key : 'W', x:-175, y: -50},
      {key : 'E', x:-125, y: -50},
      {key : 'R', x:-75, y: -50},
      {key : 'T', x:-25, y: -50},
      {key : 'Y', x:25, y: -50},
      {key : 'U', x:75, y: -50},
      {key : 'I', x:125, y: -50},
      {key : 'O', x:175, y: -50},
      {key : 'P', x:225, y: -50},
      {key : 'A', x:-200, y: 0},
      {key : 'S', x:-150, y: 0},
      {key : 'D', x:-100, y: 0},
      {key : 'F', x:-50, y: 0},
      {key : 'G', x:0, y: 0},
      {key : 'H', x:50, y: 0},
      {key : 'J', x:100, y: 0},
      {key : 'K', x:150, y: 0},
      {key : 'L', x:200, y: 0},
      {key : 'Z', x:-200, y: 50},
      {key : 'X', x:-150, y: 50},
      {key : 'C', x:-100, y: 50},
      {key : 'V', x:-50, y: 50},
      {key : 'B', x:0, y: 50},
      {key : 'N', x:50, y: 50},
      {key : 'M', x:100, y: 50},
    ];
    keyConfig.forEach(k => {
      this.addChild(new Key(this, k.key, {w:45,h:45})).withPosition(k);
    })
    this.addChild(new BKSPKey(this, {w:95, h:45})).withPosition({x:175,y:50});
    this.addChild(new SpaceKey(this, {w:295, h:45})).withPosition({x:0,y:100});
  }

}