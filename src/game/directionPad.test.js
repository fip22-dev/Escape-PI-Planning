import test from 'node:test';
import assert from 'node:assert/strict';
import { directionPadState, bindDirectionPad } from '../directionPad.js';

test('pad regions select four directions, centre and outside stop movement', () => {
  for (const [x,y] of [[55,0],[-55,0],[0,55],[0,-55]]) {
    assert.deepEqual(directionPadState(x,y,156),{x:Math.sign(x),y:Math.sign(y)});
  }
  for(const [x,y] of [[0,0],[9,9],[10,0],[80,0],[0,-80]]) assert.equal(directionPadState(x,y,156),null);
  assert.equal(directionPadState(0,0,0),null);
  assert.deepEqual(directionPadState(12,0,156),{x:1,y:0});
  assert.deepEqual(directionPadState(0,12,156),{x:0,y:1});
  assert.deepEqual(directionPadState(50,52,156,false,{x:1,y:0}),{x:0,y:1});
});
test('sliding turns without release, diagonal drift keeps axis and rotated input stays correct', () => {
  assert.deepEqual(directionPadState(50,51,156,false,{x:1,y:0}),{x:1,y:0});
  assert.deepEqual(directionPadState(20,55,156,false,{x:1,y:0}),{x:0,y:1});
  assert.deepEqual(directionPadState(-55,20,156,false,{x:0,y:1}),{x:-1,y:0});
  assert.deepEqual(directionPadState(0,55,156,true),{x:1,y:0});
  assert.deepEqual(directionPadState(55,0,156,true),{x:0,y:-1});
});
test('held pointer, ignored second finger, interruption and listener cleanup', () => {
  const oldWindow=globalThis.window, oldDocument=globalThis.document;
  const win=globalThis.window=new EventTarget(), doc=globalThis.document=new EventTarget();
  const element=new EventTarget(), capture=new Set();
  const zones=['up','down','left','right'].map(name=>({dataset:{padDirection:name},classList:{toggle(_name,value){zones.find(z=>z.dataset.padDirection===name).active=value;}}}));
  Object.assign(element,{querySelectorAll:()=>zones,closest:()=>null,
    getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),
    setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id)});
  const send=(target,type,props={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,props);target.dispatchEvent(event);};
  const pointer=(target,type,id,x=80,y=50)=>send(target,type,{button:0,pointerId:id,clientX:x,clientY:y});
  let clears=0;
  const controls=bindDirectionPad(element,{onClear:()=>clears++});
  try {
    pointer(element,'pointerdown',1);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    assert.equal(zones.find(z=>z.dataset.padDirection==='right').active,true);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    pointer(element,'pointerdown',2,20);pointer(win,'pointerup',2);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    pointer(win,'pointermove',1,50,80); assert.deepEqual(controls.readDirection(),{x:0,y:1});
    assert.equal(zones.find(z=>z.dataset.padDirection==='down').active,true);
    pointer(win,'pointermove',1,110,50); assert.equal(controls.readDirection(),null);
    pointer(win,'pointermove',1,20,50); assert.deepEqual(controls.readDirection(),{x:-1,y:0});
    pointer(win,'pointermove',1,50,50); assert.equal(controls.readDirection(),null);
    pointer(win,'pointermove',1,20); pointer(win,'pointercancel',1);
    assert.equal(controls.readDirection(),null);assert.equal(zones.some(z=>z.active),false);
    for(const [target,type] of [[win,'blur'],[doc,'visibilitychange'],[element,'lostpointercapture']]) {
      pointer(element,'pointerdown',1);pointer(target,type,1);assert.equal(controls.readDirection(),null);
    }
    const touch=(type,id,x=80)=>send(element,type,{changedTouches:[{identifier:id,clientX:x,clientY:50}]});
    touch('touchstart',3);touch('touchstart',4,20);touch('touchend',4);
    assert.deepEqual(controls.readDirection(),{x:1,y:0});
    touch('touchcancel',3);assert.equal(controls.readDirection(),null);
    pointer(element,'pointerdown',1);touch('touchstart',3);pointer(win,'pointerup',1);
    assert.equal(controls.readDirection(),null);
    assert.ok(clears>=6,'release, centre and interruptions notify movement reset');
    controls.destroy();pointer(element,'pointerdown',1);assert.equal(controls.readDirection(),null);
  } finally {controls.destroy();globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
