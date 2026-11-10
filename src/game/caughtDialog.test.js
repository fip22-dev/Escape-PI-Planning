import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as dialogs from "./caughtDialog.js";
import * as map from "./map.js";
import * as objects from "./objects.js";
import * as loop from "./gameLoop.js";
import * as detection from "./searcherDetection.js";
import * as movement from "./neutralMovement.js";
import * as speech from "./neutralSpeech.js";
import * as pixels from "./pixelArt.js";
import * as doors from "./doors.js";
import { chooseTouchStep } from "./touchMovement.js";

test("all 15 searchers have complete first dialogues and skippable family repeats", () => {
  const plan = map.createFloorPlan();
  const searchers = detection.createSearcherPatrols({ ...plan, objects: objects.createRoomObjects(plan.rooms) });
  for (const searcher of searchers) {
    const seen = new Set();
    const first = dialogs.createCaughtDialog(searcher.role, seen);
    assert.equal(first.repeated, false);
    assert.equal(first.role, searcher.role);
    for (let i = 0; i < first.pages.length - 1; i++) {
      assert.equal(dialogs.advanceCaughtDialog(first, seen), false);
      assert.equal(seen.size, 0);
    }
    assert.equal(dialogs.advanceCaughtDialog(first, seen), true);
    const repeat = dialogs.createCaughtDialog(searcher.role, seen);
    assert.equal(repeat.repeated, true);
    assert.notEqual(repeat.pages.join(" "), first.pages.join(" "));
    assert.equal(dialogs.advanceCaughtDialog(repeat, seen), true);
  }
  const seen = new Set(["PO"]);
  assert.equal(dialogs.createCaughtDialog("PO · CMS", seen).repeated, true);
  assert.equal(dialogs.createCaughtDialog("Scrum Master", seen).repeated, false);
});

// Run the real scene lifecycle with rendering/input doubles; no browser globals
// or Phaser renderer are required for state, timing and restart regressions.
function createScene() {
  // Each display object needs its own chainable proxy.
  function display() {
    const value = { text: "", visible: true };
    const proxy = new Proxy(value, {
      get(target, key) {
        if (key in target) return target[key];
        return (...args) => {
          if (key === "setText") target.text = args[0];
          if (key === "setVisible") target.visible = args[0];
          return proxy;
        };
      },
    });
    return proxy;
  }
  const controls = { clear() {}, destroy() {}, readDirection: () => null };
  const Phaser = { Scene: class {}, Input: { Keyboard: { KeyCodes: {} } }, Scenes: { Events: { SHUTDOWN: "shutdown" } } };
  const bindings = { Phaser, chooseTouchStep, ...dialogs, ...map, ...objects, ...loop, ...detection, ...movement, ...speech, ...pixels, ...doors,
    configureRendering() {}, routeRenderLayers() {}, RENDER_SCALE: 4,
    document: { querySelector: () => null }, CustomEvent: class {},
    getAudioEngine: () => ({ startMusic() {}, play() {}, getSettings: () => ({ music: true, sounds: true }) }),
    bindTouchControls: ({ onClear }) => { controls.clear = () => onClear?.(); return controls; }, window: { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} } };
  const source = readFileSync(new URL("../scenes/GrayboxScene.js", import.meta.url), "utf8")
    .replace(/import[\s\S]*?from "[^"]+";\s*/g, "").replace("export class", "class");
  const Scene = new Function(...Object.keys(bindings), `${source}\nreturn GrayboxScene;`)(...Object.values(bindings));
  const scene = new Scene();
  scene.time = { now: 50_000 };
  scene.add = new Proxy({}, { get: () => () => display() });
  scene.cameras = { main: display() };
  scene.input = { keyboard: { addKeys: () => ({}), createCursorKeys: () => ({}), resetKeys() {}, on() {}, off() {} }, on() {}, off() {} };
  scene.events = { once: (_, fn) => { scene.shutdown = fn; } };
  scene.tweens = { active: [], add(config) { this.active.push(config); }, killAll() { this.active = []; }, pauseAll() {}, resumeAll() {} };
  scene.scene = { restart() { scene.shutdown(); scene.create(); } };
  scene.create();
  return scene;
}

function snapshot(scene) {
  return [scene.playerTile, ...scene.neutralPeople.map(person => ({
    tile: person.tile, route: person.patrol.route, routeIndex: person.routeIndex,
    delay: person.nextMoveAt - scene.time.now,
  })), ...scene.searchers.map(person => ({
    tile: person.tile, route: person.route, routeIndex: person.routeIndex,
    delay: person.nextMoveAt - scene.time.now, facing: person.facing,
  }))];
}

test("caught dialog freezes timer and tweens; restart restores all 52 figures and delays", () => {
  const scene = createScene();
  const initial = snapshot(scene);
  assert.equal(scene.neutralPeople.length, 37);
  assert.equal(scene.searchers.length, 15);
  scene.escapeStartedAt = scene.time.now - 20_000;
  scene.updateGameTimer(scene.time.now);
  const frozenTimer = scene.timerText.text;
  for (const person of [...scene.neutralPeople, ...scene.searchers]) {
    person.tile = { x: 1, y: 1 };
    person.nextTile = { x: 2, y: 1 };
    person.detourRoute = [{ x: 3, y: 1 }];
    person.blockedAttempts = 4;
    person.visibleSince = scene.time.now - 600;
  }
  scene.tweens.active.push({});
  scene.finishGame("caught", "PO · WCL");
  assert.equal(scene.tweens.active.length, 0);
  scene.time.now += 10_000;
  scene.update(scene.time.now);
  assert.equal(scene.timerText.text, frozenTimer);
  scene.onConfirmPressed({ repeat: true });
  assert.ok(scene.caughtDialog);
  while (scene.caughtDialog) {
    scene.time.now += 250;
    scene.onConfirmPressed();
  }
  assert.deepEqual(snapshot(scene), initial);
  assert.equal(scene.escapeStartedAt, null);
  assert.equal(scene.gameResult, null);
  assert.equal(scene.playerNextTile, null);
  for (const person of [...scene.neutralPeople, ...scene.searchers]) {
    assert.equal(person.nextTile, null);
    assert.equal(person.detourRoute, null);
    assert.equal(person.blockedAttempts, 0);
  }
  scene.finishGame("caught", "PO · CMS");
  assert.equal(scene.caughtDialog.repeated, true);
  scene.time.now += 250;
  scene.restartIfFinished();
  assert.equal(scene.caughtDialog, null);
  assert.deepEqual(snapshot(scene), initial);
});

test("pause time does not advance the timer, detection or initial patrol delays", () => {
  const scene = createScene();
  scene.escapeStartedAt = scene.time.now - 1000;
  scene.searchers[0].visibleSince = scene.time.now - 200;
  const before = scene.neutralPeople[0].nextMoveAt;
  scene.pauseGame();
  scene.time.now += 5000;
  scene.resumeGame();
  assert.equal(scene.time.now - scene.escapeStartedAt, 1000);
  assert.equal(scene.time.now - scene.searchers[0].visibleSince, 200);
  assert.equal(scene.neutralPeople[0].nextMoveAt, before + 5000);
});


test("real player update buffers held touch turns without changing speed or continuing after release", () => {
  const scene=createScene();
  scene.grid=Array.from({length:52},()=>Array(60).fill('#'));
  for(const [x,y] of [[10,10],[11,10],[12,10],[12,9]])scene.grid[y][x]='r';
  scene.playerTile={x:10,y:10};scene.roomObjects=[];scene.neutralPeople=[];scene.searchers=[];
  for(const method of ['updateGameTimer','updateNeutralPeople','updateSearchers','updateSpeechBubble','updateDoors','onPlayerTileChanged'])scene[method]=()=>{};
  let request={x:1,y:0};scene.touchControls.readDirection=()=>request;scene.readDirection=()=>null;
  const steps=[];
  for(let i=0;i<3;i++) {
    scene.time.now+=105;scene.update(scene.time.now);
    const tween=scene.tweens.active.pop();assert.ok(tween);assert.equal(tween.duration,105);
    if(i===0)request={x:0,y:-1};
    tween.onComplete();steps.push({...scene.playerTile});
  }
  assert.deepEqual(steps,[{x:11,y:10},{x:12,y:10},{x:12,y:9}]);
  request=null;scene.touchControls.clear();assert.equal(scene.touchHeading,null);
  scene.time.now+=105;scene.update(scene.time.now);assert.equal(scene.tweens.active.length,0);
});
