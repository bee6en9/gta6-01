import {createWorld} from './world.js';
import {Input} from './input.js';
import {Soundtrack} from './audio.js';
import {Renderer} from './render.js';
import {update} from './simulation.js';
import {saveGame,loadGame,hasSave} from './save.js';
import {toast,speak} from './story.js';
const canvas=document.getElementById('city');
const input=new Input(canvas),sound=new Soundtrack();
let world=createWorld(),mode='title',last=performance.now(),saveClock=0;
const renderer=new Renderer(canvas,world),menu=document.getElementById('menu');
function menuMode(next){
  mode=next;menu.classList.toggle('hidden',next==='play');document.getElementById('hud').style.display=next==='title'?'none':'';
  menu.classList.toggle('paused',next==='pause');
  document.getElementById('resume').classList.toggle('hidden',next!=='pause');document.getElementById('save').classList.toggle('hidden',next!=='pause');
  document.getElementById('continue').classList.toggle('hidden',!hasSave());
  input.keys.clear();input.mouse.down=false;
}
function play(fresh=false,load=false){
  if(fresh||load){world=createWorld();if(load&&!loadGame(world))toast(world,'No compatible save yet. A new summer begins.');renderer.camera.x=world.player.x;renderer.camera.y=world.player.y;renderer.lastHud=-1;}
  sound.start();menuMode('play');
  if(fresh)speak(world,'KITE FM / 98.4','Breakwater, it’s going to be a hot one. Nia is waiting by the studio. Walk to the gold marker and press F.');
}
document.getElementById('start').onclick=()=>play(true);
document.getElementById('continue').onclick=()=>play(false,true);
document.getElementById('resume').onclick=()=>play();
document.getElementById('save').onclick=()=>{const ok=saveGame(world);document.getElementById('saveInfo').textContent=ok?'Progress saved in this browser.':'Storage unavailable. Allow local storage to save.';};
document.getElementById('sound').onclick=()=>{sound.muted=!sound.muted;document.getElementById('sound').textContent='Sound: '+(sound.muted?'off':'on');};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')menuMode('pause');});
function frame(now){
  const dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;
  if(input.tap('escape')){if(mode==='play')menuMode('pause');else if(mode==='pause')play();}
  if(input.tap('enter')&&mode==='title')play(true);
  if(mode==='play'){
    if(input.tap('m')){renderer.largeMap=!renderer.largeMap;document.body.classList.toggle('map-open',renderer.largeMap);}
    if(input.tap('r')){world.radio=!world.radio;toast(world,world.radio?'Kite FM / Back on air':'Radio off');}
    if(input.tap('k')){toast(world,saveGame(world)?'Progress saved':'Could not save progress');}
    if(!renderer.largeMap)update(world,input,dt,sound,renderer.screenToWorld(input.mouse.x,input.mouse.y));
    sound.update(world,dt);saveClock+=dt;
    if(saveClock>35||world.needsSave){saveGame(world);saveClock=0;world.needsSave=false;}
  }
  renderer.draw(world,dt);input.finish();requestAnimationFrame(frame);
}
// Rasterize the map and all actor paths while the opening menu covers the city.
renderer.draw(world,1);renderer.draw(world,1);menuMode('title');requestAnimationFrame(frame);
// A read-only observation surface for browser verification; gameplay stays input-driven.
window.breakwater={get state(){return {mode,mission:world.mission,stage:world.stage,x:world.player.x,y:world.player.y,heading:world.player.a,speed:world.player.car?.v||0,inCar:!!world.player.car,vehicle:world.player.car?.name,vehicleHealth:world.player.car?.hp,hp:world.player.hp,money:world.player.money,heat:world.heat,arrest:world.arrest,escape:world.escape,cars:world.cars.length,people:world.people.length,police:world.police.length,tapes:world.collected.length};}};
