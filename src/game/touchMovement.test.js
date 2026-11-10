import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseTouchStep } from './touchMovement.js';
const right={x:1,y:0}, up={x:0,y:-1}, left={x:-1,y:0};
test('held early turn continues ahead then takes the first open junction',()=>{
  let tile={x:0,y:1}, heading=right;
  const floor=new Set(['0,1','1,1','2,1','2,0']);
  const canMove=d=>floor.has(`${tile.x+d.x},${tile.y+d.y}`);
  const steps=[];
  for(let i=0;i<3;i++){
    const step=chooseTouchStep(up,heading,canMove); steps.push(step);
    tile={x:tile.x+step.x,y:tile.y+step.y};heading=step;
  }
  assert.deepEqual(steps,[right,right,up]);assert.deepEqual(tile,{x:2,y:0});
});
test('release, blocked reverse, initial blocked turn and fully blocked junction stop',()=>{
  assert.equal(chooseTouchStep(null,right,()=>true),null);
  assert.equal(chooseTouchStep(left,right,d=>d===right),null);
  assert.equal(chooseTouchStep(up,null,d=>d===right),null);
  assert.equal(chooseTouchStep(up,right,()=>false),null);
});
test('new requests replace the held turn and a freed obstacle is rechecked',()=>{
  assert.deepEqual(chooseTouchStep(left,right,()=>true),left);
  assert.deepEqual(chooseTouchStep(up,right,d=>d===right),right);
  assert.deepEqual(chooseTouchStep(up,right,()=>true),up);
});
