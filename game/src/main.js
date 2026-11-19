const el=id=>document.getElementById(id);
const canvas=el('city'),input=new Input(canvas),audio=new Soundscape(),sound=name=>audio.event(name);
let world=createWorld();
const renderer=new Renderer(canvas,el('minimap'),world);
const ui=Object.fromEntries(['hud','district','stars','cash','health','healthValue','missionNo','missionName','objective',
  'mapBox','dialogue','toast','arrest','hold','toolLabel','toolValue','toolTip','menu','titleArt','pauseTitle',
  'start','resume','load','save','settings','menuNote'].map(key=>[key,el(key)]));
let mode='title',expanded=false,last=0,nextHud=0,nextSave=35;
const money=new Intl.NumberFormat('en-US');
function put(node,value){if(node.textContent!==value)node.textContent=value;}
function showMenu(title){
  mode=title?'title':'pause';input.reset();
  ui.hud.hidden=true;ui.menu.hidden=false;ui.start.hidden=!title;ui.titleArt.hidden=!title;
  ui.pauseTitle.hidden=title;ui.resume.hidden=title;ui.save.hidden=title;
  ui.load.hidden=!readSave();put(ui.menuNote,'');
}
function updateHud(){
  const p=world.player,ride=p.car,job=contracts[world.mission],stars=Math.ceil(world.heat);
  put(ui.district,district(p));put(ui.stars,'★'.repeat(stars)+'☆'.repeat(5-stars));
  put(ui.cash,'$'+money.format(p.cash));put(ui.healthValue,Math.ceil(p.hp)+'%');ui.health.style.width=p.hp+'%';
  put(ui.missionNo,world.race?'SIDE JOB  /  TIME TRIAL':job?'CONTRACT  /  0'+(world.mission+1):'KITE FM  /  84.3');
  put(ui.missionName,world.race?'Coast Run':job?.name||'Breakwater is yours');
  put(ui.objective,objective(world));
  ui.dialogue.hidden=world.time>=world.lineUntil;put(ui.dialogue,world.line);
  ui.toast.hidden=world.time>=world.toastUntil;put(ui.toast,world.toast);
  ui.arrest.hidden=world.arrest<.12;put(ui.hold,Math.floor(world.arrest*50)+'%');
  const near=ride?null:nearestCar(world);
  put(ui.toolLabel,ride?ride.name.toUpperCase():'POCKET SIDEARM');
  put(ui.toolValue,ride?Math.round(Math.abs(ride.speed)*.32)+' MPH':world.reloading?'RELOAD':world.ammo+' / '+world.reserve);
  put(ui.toolTip,ride?'CONDITION '+Math.max(0,Math.ceil(ride.hp))+'%':near?'E / '+(near.owned?'ENTER ':'TAKE ')+near.name.toUpperCase():'CLICK / FIRE   R / LOAD');
}
function play(){
  audio.start();mode='play';input.reset();document.activeElement?.blur();
  ui.menu.hidden=true;ui.hud.hidden=false;nextHud=0;nextSave=world.time+35;updateHud();
}
ui.start.onclick=()=>{
  world=createWorld();expanded=false;ui.mapBox.classList.remove('big');
  tell(world,'RHEA / Ari? Take the Tamarind down to the station. I’ve got a job for you.');
  renderer.draw(world);play();
};
ui.resume.onclick=play;
ui.load.onclick=()=>{
  const save=readSave();
  if(!save){put(ui.menuNote,'No valid save found.');return;}
  world=restoreWorld(save);expanded=false;ui.mapBox.classList.remove('big');renderer.draw(world);play();
};
ui.save.onclick=()=>{
  const ok=writeSave(world);put(ui.menuNote,ok?'Progress saved on this browser.':'Storage is unavailable in this browser.');
  ui.load.hidden=!readSave();
};
ui.settings.onclick=()=>{
  audio.muted=!audio.muted;ui.settings.firstChild.nodeValue='Sound: '+(audio.muted?'off ':'on ');
};
addEventListener('blur',()=>{if(mode==='play')showMenu(false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')showMenu(false);});
function frame(now){
  const dt=last?Math.min(.033,(now-last)/1000):0;last=now;
  if(mode==='play'){
    if(input.tap('Escape'))showMenu(false);
    else{
      if(input.tap('KeyM')||input.tap('Tab')){expanded=!expanded;ui.mapBox.classList.toggle('big',expanded);}
      simulate(world,dt,input,sound,renderer.aim(world,input.mouse));
      renderer.draw(world,dt,expanded);
      if(world.time>=nextSave){nextSave=world.time+35;if(!world.heat)writeSave(world);}
      if(world.time>=nextHud){nextHud=world.time+.07;updateHud();}
    }
  }else if(input.tap('Enter')&&document.activeElement?.tagName!=='BUTTON'){
    if(mode==='pause')play();else ui.start.click();
  }
  audio.update(world,mode==='play');input.finish();requestAnimationFrame(frame);
}
renderer.draw(world);
performance.mark('breakwater-warm');
showMenu(true);
requestAnimationFrame(frame);
