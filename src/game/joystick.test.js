import test from 'node:test';
import assert from 'node:assert/strict';
import { joystickState, bindJoystick } from '../joystick.js';

test('joystick dead zone, cardinal directions and bounded thumb travel', () => {
  assert.equal(joystickState(3, 2, 30).direction, null);
  for (const [x,y] of [[30,0],[-30,0],[0,30],[0,-30]]) {
    assert.deepEqual(joystickState(x,y,30).direction, {x:Math.sign(x),y:Math.sign(y)});
  }
  const far = joystickState(300,400,30);
  assert.equal(Math.hypot(far.x,far.y),30);
  assert.deepEqual(joystickState(20,21,30,false,{x:1,y:0}).direction,{x:1,y:0});
  assert.deepEqual(joystickState(20,28,30,false,{x:1,y:0}).direction,{x:0,y:1});
});
test('diagonal thumb positions snap to the active axis and deliberate turns switch it', () => {
  for (const rotated of [false,true]) {
    for (const [dx,dy] of [[20,15],[-20,15],[15,-20],[-15,-20],[300,400]]) {
      const state=joystickState(dx,dy,30,rotated);
      assert.equal(state.x===0 || state.y===0,true);
      assert.equal(Math.hypot(state.x,state.y)<=30,true);
      assert.equal(state.x!==0,state.direction.x!==0);
    }
  }
  assert.deepEqual(joystickState(20,26,30,false,{x:1,y:0}),{x:20,y:0,direction:{x:1,y:0}});
  assert.deepEqual(joystickState(20,28,30,false,{x:1,y:0}),{x:0,y:28,direction:{x:0,y:1}});
  assert.deepEqual(joystickState(26,20,30,false,{x:0,y:1}),{x:0,y:20,direction:{x:0,y:1}});
  assert.deepEqual(joystickState(28,20,30,false,{x:0,y:1}),{x:28,y:0,direction:{x:1,y:0}});
  assert.deepEqual(joystickState(6,6,30),{x:0,y:0,direction:null});
  assert.deepEqual(joystickState(0,0,0),{x:0,y:0,direction:null});
});
test('rotated stage maps physical down to game right and physical right to game up', () => {
  assert.deepEqual(joystickState(0,30,30,true).direction,{x:1,y:0});
  assert.deepEqual(joystickState(30,0,30,true).direction,{x:0,y:-1});
});
test('held pointer, ignored second finger, interruption and listener cleanup', () => {
  const oldWindow=globalThis.window, oldDocument=globalThis.document;
  const win=globalThis.window=new EventTarget(), doc=globalThis.document=new EventTarget();
  const element=new EventTarget(), capture=new Set(), styles={};
  Object.assign(element,{style:{setProperty:(k,v)=>styles[k]=v},classList:{toggle(){}},closest:()=>null,
    getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),
    setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id)});
  const send=(target,type,props={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,props);target.dispatchEvent(event);};
  const pointer=(target,type,id,x=80,y=50)=>send(target,type,{button:0,pointerId:id,clientX:x,clientY:y});
  const controls=bindJoystick(element);
  try {
    pointer(element,'pointerdown',1);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    pointer(element,'pointerdown',2,20);pointer(win,'pointerup',2);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    pointer(win,'pointermove',1,50,50); assert.equal(controls.readDirection(),null);
    pointer(win,'pointermove',1,20); pointer(win,'pointercancel',1);
    assert.equal(controls.readDirection(),null);assert.equal(styles['--stick-x'],'0px');
    for(const [target,type] of [[win,'blur'],[doc,'visibilitychange'],[element,'lostpointercapture']]) {
      pointer(element,'pointerdown',1);pointer(target,type,1);assert.equal(controls.readDirection(),null);
    }
    const touch=(type,id,x=80)=>send(element,type,{changedTouches:[{identifier:id,clientX:x,clientY:50}]});
    touch('touchstart',3);touch('touchstart',4,20);touch('touchend',4);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    touch('touchcancel',3);assert.equal(controls.readDirection(),null);
    pointer(element,'pointerdown',1);touch('touchstart',3);pointer(win,'pointerup',1);
    assert.equal(controls.readDirection(),null);
    controls.destroy();pointer(element,'pointerdown',1);assert.equal(controls.readDirection(),null);
  } finally {controls.destroy();globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
